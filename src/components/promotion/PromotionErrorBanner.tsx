import React from 'react';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  onUseSampleData: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, onUseSampleData }) => {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
            Thông báo kết nối bảng tính
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={onUseSampleData}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-100/50 cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Dùng dữ liệu chuẩn</span>
        </button>

        <button
          type="button"
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Thử lại</span>
        </button>
      </div>
    </div>
  );
};
