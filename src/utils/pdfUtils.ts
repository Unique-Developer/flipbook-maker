import * as pdfjsLib from 'pdfjs-dist';

// Worker is configured in main.tsx - no need to set it up here

export interface PDFPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  imageUrl: string;
}

/**
 * Load PDF document from a File or a URL string.
 * Optimized for fast loading by using streaming when possible.
 */
export async function loadPDF(source: File | string): Promise<pdfjsLib.PDFDocumentProxy> {
  let loadingTask: pdfjsLib.PDFDocumentLoadingTask;

  if (typeof source === 'string') {
    // Load PDF directly from URL (used for permanent GitHub-hosted PDFs)
    loadingTask = pdfjsLib.getDocument({
      url: source,
      verbosity: 0,
      disableAutoFetch: false,
      isEvalSupported: false,
      withCredentials: false,
    });
  } else {
    // Load PDF from File (local upload)
    const arrayBuffer = await source.arrayBuffer();
    loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
      disableAutoFetch: false,
      isEvalSupported: false,
    });
  }
  
  return await loadingTask.promise;
}

/**
 * Render a single PDF page to canvas
 * This is optimized for performance with caching
 * @param scale - Lower scale (1.0-1.5) for faster rendering, higher (2.0+) for quality
 */
export async function renderPage(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 1.5 // Reduced from 2.0 for faster loading
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  
  // Calculate viewport with scale
  const viewport = page.getViewport({ scale });
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  
  if (!context) {
    throw new Error('Could not get canvas context');
  }
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  // Render page to canvas
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  
  await page.render(renderContext).promise;
  
  return canvas;
}

/**
 * Render page for thumbnail (lower quality, faster)
 */
export async function renderThumbnail(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 0.5 // Very low scale for thumbnails
): Promise<HTMLCanvasElement> {
  return renderPage(pdf, pageNumber, scale);
}

/**
 * Convert canvas to image URL (for caching and lazy loading)
 * @param quality - 0.7 for faster loading, 0.9 for better quality
 */
export function canvasToImageUrl(canvas: HTMLCanvasElement, quality: number = 0.7): string {
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Preload pages around current page for smooth navigation
 */
export async function preloadPages(
  pdf: pdfjsLib.PDFDocumentProxy,
  currentPage: number,
  totalPages: number,
  preloadRange: number = 2
): Promise<Map<number, HTMLCanvasElement>> {
  const pages = new Map<number, HTMLCanvasElement>();
  const loadPromises: Promise<void>[] = [];
  
  // Preload pages before and after current page
  for (let i = Math.max(1, currentPage - preloadRange); 
       i <= Math.min(totalPages, currentPage + preloadRange); 
       i++) {
    if (i !== currentPage) {
      loadPromises.push(
        renderPage(pdf, i)
          .then(canvas => {
            pages.set(i, canvas);
          })
          .catch(err => {
            console.error(`Error preloading page ${i}:`, err);
          })
      );
    }
  }
  
  await Promise.all(loadPromises);
  return pages;
}

