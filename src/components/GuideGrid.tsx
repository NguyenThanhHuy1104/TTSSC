import React, { useState } from 'react';
import { SearchX, Filter, ArrowUpDown } from 'lucide-react';
import { Guide } from '../types';
import { GuideCard } from './GuideCard';

interface GuideGridProps {
  guides: Guide[];
  favorites: string[];
  title?: string;
  subtitle?: string;
  searchQuery?: string;
  onSelectGuide: (slug: string) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const GuideGrid: React.FC<GuideGridProps> = ({
  guides,
  favorites,
  title,
  subtitle,
  searchQuery,
  onSelectGuide,
  onToggleFavorite
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'readingTime' | 'featured'>('newest');

  const sortedGuides = [...guides].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === 'featured') {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
    if (sortBy === 'readingTime') {
      return a.readingTime - b.readingTime;
    }
    return 0;
  });

  return (
    <section className="my-8">
      {/* Header bar with title & sort selector */}
      {(title || searchQuery) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full inline-block shrink-0"></span>
                <span className="uppercase tracking-tight">{title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono font-bold">
                  {guides.length}
                </span>
              </h3>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
            {searchQuery && (
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Kết quả tìm kiếm cho: <strong className="text-blue-600 dark:text-blue-400">"{searchQuery}"</strong>
              </p>
            )}
          </div>

          {guides.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="guide-sort-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sắp xếp:
              </label>
              <select
                id="guide-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
              >
                <option value="newest">Cập nhật mới nhất</option>
                <option value="featured">Ưu tiên bài nổi bật</option>
                <option value="readingTime">Thời gian đọc ngắn nhất</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Grid List */}
      {sortedGuides.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedGuides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              isFavorite={favorites.includes(guide.id)}
              onSelect={onSelectGuide}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 my-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
            Không tìm thấy bài hướng dẫn phù hợp
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Hãy thử tìm kiếm với từ khóa khác (ví dụ: Hóa đơn, Webex, Quên mật khẩu, Kho vận...) hoặc chọn nhóm danh mục trên trang chủ.
          </p>
        </div>
      )}
    </section>
  );
};
