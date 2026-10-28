import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const checkScroll = useCallback(() => {
    const scrollY =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    if (scrollY > 160) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    checkScroll();

    window.addEventListener('scroll', checkScroll, { passive: true });
    document.addEventListener('scroll', checkScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkScroll);
      document.removeEventListener('scroll', checkScroll);
    };
  }, [checkScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.body.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Về đầu trang"
      title="Bấm để cuộn về đầu trang"
      className="fixed bottom-20 sm:bottom-24 right-5 sm:right-6 z-40 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-600/30 border border-white/25 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 group"
    >
      <div className="p-0.5 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
        <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
      </div>
      <span className="text-xs font-bold tracking-tight pr-0.5 whitespace-nowrap">
        Về đầu trang
      </span>
    </button>
  );
};
