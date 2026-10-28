import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onHomeClick: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onHomeClick }) => {
  return (
    <nav className="flex items-center text-xs md:text-sm text-slate-500 dark:text-slate-400 py-3 overflow-x-auto whitespace-nowrap scrollbar-none">
      <button
        onClick={onHomeClick}
        className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </button>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 shrink-0" />
          {item.active ? (
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[320px]">
              {item.label}
            </span>
          ) : (
            <button
              onClick={item.onClick}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium truncate max-w-[180px] cursor-pointer"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
