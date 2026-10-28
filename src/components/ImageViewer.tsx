import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';

interface ImageItem {
  url: string;
  caption?: string;
  stepTitle?: string;
}

interface ImageViewerProps {
  isOpen: boolean;
  images: ImageItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate?: (newIndex: number) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [index, setIndex] = useState(currentIndex);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setIndex(currentIndex);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) handlePrev();
      if (e.key === 'ArrowRight' && index < images.length - 1) handleNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-' || e.key === '_') handleZoomOut();
      if (e.key === '0') handleResetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, index, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[index] || images[0];

  const handlePrev = () => {
    if (index > 0) {
      const newIdx = index - 1;
      setIndex(newIdx);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setIsDragging(false);
      if (onNavigate) onNavigate(newIdx);
    }
  };

  const handleNext = () => {
    if (index < images.length - 1) {
      const newIdx = index + 1;
      setIndex(newIdx);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setIsDragging(false);
      if (onNavigate) onNavigate(newIdx);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(Number((prev + 0.3).toFixed(2)), 4));
  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(Number((prev - 0.3).toFixed(2)), 0.5);
      if (next <= 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    setZoomLevel(prev => {
      const next = Math.max(0.5, Math.min(4, Number((prev + zoomFactor).toFixed(2))));
      if (next <= 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImg.url;
    link.download = `huong-dan-image-step-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none animate-in fade-in duration-200">
      {/* Top Header Control Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between text-white py-2 px-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3 truncate pr-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-600 text-white">
            {index + 1} / {images.length}
          </span>
          {currentImg.stepTitle && (
            <span className="text-sm font-medium text-slate-300 truncate">
              {currentImg.stepTitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs font-mono font-medium rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tỉ lệ 100%"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tải ảnh về"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer ml-1"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View Container */}
      <div
        className="relative flex-1 w-full flex items-center justify-center my-4 overflow-hidden select-none"
        onWheel={handleWheelZoom}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default'
        }}
      >
        {/* Previous Button */}
        {index > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700 transition-all cursor-pointer shadow-lg"
            title="Ảnh trước (Phím ←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image Content */}
        <div
          className={`max-w-full max-h-full flex items-center justify-center ${
            isDragging ? 'transition-none' : 'transition-transform duration-150 ease-out'
          }`}
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            willChange: 'transform'
          }}
        >
          <img
            src={currentImg.url}
            alt={currentImg.caption || 'Hình ảnh hướng dẫn'}
            className="max-h-[78vh] max-w-[92vw] object-contain rounded-lg border border-slate-700 shadow-2xl pointer-events-none transition-all"
            style={{
              imageRendering: zoomLevel > 1.2 ? ('-webkit-optimize-contrast' as any) : 'auto',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              filter: zoomLevel > 1.2 ? 'contrast(103%) brightness(101%)' : 'none'
            }}
          />
        </div>

        {/* Next Button */}
        {index < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700 transition-all cursor-pointer shadow-lg"
            title="Ảnh tiếp theo (Phím →)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption & Shortcut Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl w-full px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
        <div className="text-left font-medium truncate">
          {currentImg.caption || 'Hình ảnh hướng dẫn nghiệp vụ SSC'}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <span>🖱️ Lăn chuột: Phóng to</span>
          <span>•</span>
          <span>✋ Giữ chuột kéo: Di chuyển</span>
          <span>•</span>
          <span className="text-rose-400 font-semibold">Phím ESC: Thoát</span>
        </div>
      </div>
    </div>
  );
};
