import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, onClearSearch }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
          Không tìm thấy quà tặng phù hợp
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          {searchQuery ? (
            <>
              Không có sản phẩm nào khớp với từ khóa{' '}
              <strong className="text-slate-800 dark:text-slate-200">"{searchQuery}"</strong> trong đợt này.
            </>
          ) : (
            'Hiện chưa có sản phẩm nào trong danh mục đã chọn.'
          )}
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Xóa bộ lọc tìm kiếm</span>
        </button>
      </div>
    </div>
  );
};
