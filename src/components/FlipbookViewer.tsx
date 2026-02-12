import { useState, useEffect, useRef, useCallback } from 'react';
import { loadPDF, renderPage, preloadPages, canvasToImageUrl } from '../utils/pdfUtils';
import * as pdfjsLib from 'pdfjs-dist';
import ThumbnailBar from './ThumbnailBar';
import ShareModal from './ShareModal';
import { playPageFlipSound } from '../utils/soundUtils';

interface FlipbookViewerProps {
  pdfFile?: File;           // Local upload
  pdfUrl?: string;          // Permanent URL (e.g. GitHub-hosted PDF)
  title?: string;           // Optional display title
  onClose?: () => void;
}

export default function FlipbookViewer({ pdfFile, pdfUrl, title, onClose }: FlipbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageImages, setPageImages] = useState<Map<number, string>>(new Map());
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [dragProgress, setDragProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const DRAG_THRESHOLD = 50; // Minimum drag distance to trigger flip

  // Load PDF on mount - OPTIMIZED for faster loading
  useEffect(() => {
    let cancelled = false;

    const loadPDFFile = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(0);

        const source = pdfUrl ?? pdfFile;
        if (!source) {
          throw new Error('No PDF source provided');
        }

        const pdfDoc = await loadPDF(source);
        
        if (cancelled) return;

        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setLoadingProgress(50);

        // Load first page immediately with lower quality for faster display
        const firstPageCanvas = await renderPage(pdfDoc, 1, 1.5); // Reduced scale
        const firstPageImage = canvasToImageUrl(firstPageCanvas, 0.7); // Lower quality for speed
        setPageImages(new Map([[1, firstPageImage]]));
        
        setLoadingProgress(100);
        setIsLoading(false);

        // Preload next few pages in background
        setTimeout(() => {
          preloadPages(pdfDoc, 1, pdfDoc.numPages, 2).then(pages => {
            setPageImages(prev => {
              const newImages = new Map(prev);
              pages.forEach((canvas, pageNum) => {
                newImages.set(pageNum, canvasToImageUrl(canvas, 0.7));
              });
              return newImages;
            });
          });
        }, 100); // Reduced delay
      } catch (error) {
        console.error('Error loading PDF:', error);
        setIsLoading(false);
      }
    };

    loadPDFFile();

    return () => {
      cancelled = true;
    };
  }, [pdfFile, pdfUrl]);

  // Load page when navigating - OPTIMIZED
  const loadPage = useCallback(async (pageNum: number) => {
    if (!pdf || pageImages.has(pageNum)) return;

    try {
      const canvas = await renderPage(pdf, pageNum, 1.5); // Reduced scale
      const imageUrl = canvasToImageUrl(canvas, 0.7); // Lower quality for speed
      
      setPageImages(prev => {
        const newMap = new Map(prev);
        newMap.set(pageNum, imageUrl);
        return newMap;
      });

      // Preload adjacent pages
      preloadPages(pdf, pageNum, totalPages, 2).then(pages => {
        setPageImages(prev => {
          const newMap = new Map(prev);
          pages.forEach((canvas, num) => {
            newMap.set(num, canvasToImageUrl(canvas, 0.7));
          });
          return newMap;
        });
      });
    } catch (error) {
      console.error(`Error loading page ${pageNum}:`, error);
    }
  }, [pdf, pageImages, totalPages]);

  // Navigate to page with flip animation
  const goToPage = useCallback((pageNum: number, direction: 'left' | 'right' = 'right') => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) return;
    
    setFlipDirection(direction);
    loadPage(pageNum);
    playPageFlipSound();
    
    setTimeout(() => {
      setCurrentPage(pageNum);
      setFlipDirection(null);
      setDragProgress(0);
    }, 400);
  }, [currentPage, totalPages, loadPage]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragCurrentX(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX;
    setDragCurrentX(e.clientX);
    setDragProgress(Math.max(-1, Math.min(1, deltaX / 200))); // Normalize to -1 to 1
  }, [isDragging, dragStartX]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    const deltaX = dragCurrentX - dragStartX;
    
    if (Math.abs(deltaX) > DRAG_THRESHOLD) {
      if (deltaX > 0 && currentPage > 1) {
        // Dragged right - go to previous page
        goToPage(currentPage - 1, 'right');
      } else if (deltaX < 0 && currentPage < totalPages) {
        // Dragged left - go to next page
        goToPage(currentPage + 1, 'left');
      }
    }
    
    setIsDragging(false);
    setDragProgress(0);
    setDragStartX(0);
    setDragCurrentX(0);
  }, [isDragging, dragStartX, dragCurrentX, currentPage, totalPages, goToPage]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStartX(touch.clientX);
    setDragCurrentX(touch.clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartX;
    setDragCurrentX(touch.clientX);
    setDragProgress(Math.max(-1, Math.min(1, deltaX / 200)));
  }, [isDragging, dragStartX]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const deltaX = dragCurrentX - dragStartX;
    
    if (Math.abs(deltaX) > DRAG_THRESHOLD) {
      if (deltaX > 0 && currentPage > 1) {
        goToPage(currentPage - 1, 'right');
      } else if (deltaX < 0 && currentPage < totalPages) {
        goToPage(currentPage + 1, 'left');
      }
    }
    
    setIsDragging(false);
    setDragProgress(0);
    setDragStartX(0);
    setDragCurrentX(0);
  }, [isDragging, dragStartX, dragCurrentX, currentPage, totalPages, goToPage]);

  // Global mouse handlers for drag
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      setDragCurrentX(e.clientX);
      setDragProgress(Math.max(-1, Math.min(1, deltaX / 200)));
    };

    const handleGlobalMouseUp = () => {
      const deltaX = dragCurrentX - dragStartX;
      
      if (Math.abs(deltaX) > DRAG_THRESHOLD) {
        if (deltaX > 0 && currentPage > 1) {
          goToPage(currentPage - 1, 'right');
        } else if (deltaX < 0 && currentPage < totalPages) {
          goToPage(currentPage + 1, 'left');
        }
      }
      
      setIsDragging(false);
      setDragProgress(0);
      setDragStartX(0);
      setDragCurrentX(0);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStartX, dragCurrentX, currentPage, totalPages, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isLoading) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPage(currentPage - 1, 'right');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToPage(currentPage + 1, 'left');
      } else if (e.key === 'Home') {
        goToPage(1, 'right');
      } else if (e.key === 'End') {
        goToPage(totalPages, 'left');
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, isLoading, isFullscreen, goToPage]);

  // Fullscreen handling
  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Download PDF
  const handleDownload = () => {
    // If we have a local File (upload in this session), download that
    if (pdfFile) {
      const link = document.createElement('a');
      const blobUrl = URL.createObjectURL(pdfFile);
      link.href = blobUrl;
      link.download = pdfFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      return;
    }

    // Fallback: if we only have a URL (GitHub-hosted PDF), open it in a new tab
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-md">
          <div className="bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-center text-gray-600">
            Loading PDF... {loadingProgress}%
          </p>
        </div>
      </div>
    );
  }

  const currentPageImage = pageImages.get(currentPage);
  
  // Calculate 3D transform for drag effect
  const dragRotateY = dragProgress * 30; // Max 30 degrees rotation
  const dragScaleX = 1 - Math.abs(dragProgress) * 0.2; // Scale down during drag

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-gray-100 flex flex-col"
    >
      {/* Header Controls */}
      <div className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold text-gray-800 truncate max-w-xs">
              {title || pdfFile?.name || 'Flipbook'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Thumbnails Toggle */}
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showThumbnails 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📑
            </button>

            {/* Zoom Controls */}
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={zoom <= 0.5}
            >
              −
            </button>
            <span className="px-3 py-2 text-sm text-gray-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={zoom >= 3}
            >
              +
            </button>

            {/* Share */}
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              🔗 Share
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
            >
              ⬇ Download
            </button>

            {/* Fullscreen */}
            <button
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isFullscreen ? '⤓' : '⛶'}
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail Bar */}
      {showThumbnails && totalPages > 0 && (
        <ThumbnailBar
          totalPages={totalPages}
          currentPage={currentPage}
          pageImages={pageImages}
          onPageSelect={(page) => {
            const direction = page > currentPage ? 'left' : 'right';
            goToPage(page, direction);
          }}
          onLoadPage={loadPage}
        />
      )}

      {/* Flipbook Viewer */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto flipbook-container">
        <div
          ref={pageRef}
          className={`flipbook-page relative transition-transform duration-300 ${
            flipDirection === 'left' ? 'page-flip-left' : 
            flipDirection === 'right' ? 'page-flip-right' : ''
          }`}
          style={{
            transform: isDragging 
              ? `perspective(1500px) rotateY(${dragRotateY}deg) scaleX(${dragScaleX}) scale(${zoom})`
              : `scale(${zoom})`,
            transformStyle: 'preserve-3d',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentPageImage ? (
            <img
              src={currentPageImage}
              alt={`Page ${currentPage}`}
              className="max-w-full max-h-[80vh] shadow-2xl rounded-lg select-none"
              style={{ imageRendering: 'auto', pointerEvents: 'none' }}
              draggable={false}
            />
          ) : (
            <div className="w-[800px] h-[1000px] bg-gray-200 flex items-center justify-center rounded-lg">
              <p className="text-gray-500">Loading page {currentPage}...</p>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          initialPdfUrl={pdfUrl}
          defaultTitle={title || pdfFile?.name || 'Flipbook'}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Navigation Controls */}
      <div className="sticky bottom-0 bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1, 'right')}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            {/* Page Input */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (!isNaN(page)) {
                    const direction = page > currentPage ? 'left' : 'right';
                    goToPage(page, direction);
                  }
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">of {totalPages}</span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1, 'left')}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            💡 Tip: Drag the page left or right to flip, or use arrow keys
          </p>
        </div>
      </div>
    </div>
  );
}
