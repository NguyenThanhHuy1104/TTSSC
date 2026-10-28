import React from 'react';
import { FileQuestion, Home, Search } from 'lucide-react';

interface NotFoundProps {
  onHomeClick: () => void;
  onSearchClick: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onHomeClick, onSearchClick }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center my-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
      <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 border border-blue-200 dark:border-blue-800">
        <FileQuestion className="w-10 h-10" />
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
        Không tìm thấy hướng dẫn
      </h2>

      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        Trang hoặc bài hướng dẫn bạn đang truy cập có thể đã bị thay đổi địa chỉ hoặc không tồn tại trên hệ thống.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onHomeClick}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>VỀ TRANG CHỦ</span>
        </button>

        <button
          onClick={onSearchClick}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>TÌM KIẾM HƯỚNG DẪN</span>
        </button>
      </div>
    </div>
  );
};
