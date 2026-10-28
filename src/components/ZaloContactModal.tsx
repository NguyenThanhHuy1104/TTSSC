import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import defaultZaloImg from '../assets/images/zalo_contact.jpg';

interface ZaloContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ZaloContactModal:
 * Khi click vào "Zalo liên hệ SSC", chỉ hiển thị hình ảnh thuần túy (Lightbox phóng to tối đa).
 * Toàn bộ tính năng tải ảnh, đổi ảnh và cấu hình được chuyển vào mục Setting (Cài đặt hệ thống).
 */
export const ZaloContactModal: React.FC<ZaloContactModalProps> = ({ isOpen, onClose }) => {
  const [currentImg, setCurrentImg] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ssc_zalo_contact_image_v5');
      if (saved) return saved;
      return `/zalo_contact.jpg?t=${Date.now()}`;
    }
    return defaultZaloImg;
  });

  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Close on Escape key & sync image when opened
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('ssc_zalo_contact_image_v5');
        setCurrentImg(saved || `/zalo_contact.jpg?t=${Date.now()}`);
      }
      setIsZoomed(false);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Floating Top Controls: Nút Đóng & Phóng to */}
      <div
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer shadow-xl flex items-center gap-1.5 px-3.5 text-xs font-semibold select-none"
          title={isZoomed ? 'Thu nhỏ lại (100%)' : 'Phóng to cực đại (140%)'}
        >
          {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          <span className="hidden sm:inline">{isZoomed ? 'Thu nhỏ' : 'Phóng to'}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer shadow-xl flex items-center justify-center"
          title="Đóng (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CHỈ HIỂN THỊ HÌNH ẢNH THUẦN TÚY */}
      <div
        className={`relative max-w-full max-h-full flex items-center justify-center overflow-auto p-1 select-none transition-all ${
          isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed(!isZoomed);
        }}
        title="Bấm vào ảnh để phóng to / thu nhỏ"
      >
        <img
          src={currentImg}
          alt="Zalo liên hệ Trung tâm SSC"
          referrerPolicy="no-referrer"
          onError={() => setCurrentImg(defaultZaloImg)}
          style={{
            transform: isZoomed ? 'scale(1.35)' : 'scale(1)',
            transformOrigin: 'center center',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="max-h-[88vh] sm:max-h-[92vh] max-w-[94vw] sm:max-w-[92vw] xl:max-w-[88vw] w-auto h-auto object-contain rounded-2xl shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 select-none animate-in zoom-in-95 duration-200"
        />
      </div>
    </div>
  );
};
