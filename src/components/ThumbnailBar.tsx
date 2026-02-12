import { useEffect, useRef } from 'react';

interface ThumbnailBarProps {
  totalPages: number;
  currentPage: number;
  pageImages: Map<number, string>;
  onPageSelect: (pageNum: number) => void;
  onLoadPage: (pageNum: number) => void;
}

export default function ThumbnailBar({
  totalPages,
  currentPage,
  pageImages,
  onPageSelect,
  onLoadPage,
}: ThumbnailBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to current page thumbnail
  useEffect(() => {
    if (scrollRef.current) {
      const thumbnail = scrollRef.current.querySelector(
        `[data-page="${currentPage}"]`
      ) as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentPage]);

  // Load visible thumbnails
  useEffect(() => {
    if (!scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(
              entry.target.getAttribute('data-page') || '0'
            );
            if (pageNum > 0 && !pageImages.has(pageNum)) {
              onLoadPage(pageNum);
            }
          }
        });
      },
      { root: scrollRef.current, rootMargin: '50px' }
    );

    const thumbnails = scrollRef.current.querySelectorAll('[data-page]');
    thumbnails.forEach((thumb) => observer.observe(thumb));

    return () => {
      thumbnails.forEach((thumb) => observer.unobserve(thumb));
    };
  }, [totalPages, pageImages, onLoadPage]);

  return (
    <div
      ref={scrollRef}
      className="w-full bg-gray-800 p-2 overflow-x-auto overflow-y-hidden"
      style={{ maxHeight: '150px' }}
    >
      <div className="flex gap-2 justify-start">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          const imageUrl = pageImages.get(pageNum);
          const isCurrentPage = pageNum === currentPage;

          return (
            <div
              key={pageNum}
              data-page={pageNum}
              onClick={() => onPageSelect(pageNum)}
              className={`
                flex-shrink-0 cursor-pointer transition-all duration-200
                ${isCurrentPage 
                  ? 'ring-2 ring-blue-500 scale-105' 
                  : 'hover:scale-105 opacity-70 hover:opacity-100'
                }
              `}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Page ${pageNum} thumbnail`}
                  className="h-24 w-auto border border-gray-600 rounded shadow-lg"
                  loading="lazy"
                />
              ) : (
                <div className="h-24 w-16 bg-gray-700 border border-gray-600 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-400">{pageNum}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

