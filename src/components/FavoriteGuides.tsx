import React from 'react';
import { Star, BookmarkX } from 'lucide-react';
import { Guide } from '../types';
import { GuideCard } from './GuideCard';

interface FavoriteGuidesProps {
  favoriteIds: string[];
  allGuides: Guide[];
  onSelectGuide: (slug: string) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const FavoriteGuides: React.FC<FavoriteGuidesProps> = ({
  favoriteIds,
  allGuides,
  onSelectGuide,
  onToggleFavorite
}) => {
  const favoriteGuides = allGuides.filter((g) => favoriteIds.includes(g.id));

  return (
    <section className="my-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
          <Star className="w-5 h-5 fill-amber-400" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Hướng dẫn đã lưu
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Danh sách các tài liệu hướng dẫn bạn đã đánh dấu sao để tra cứu nhanh
          </p>
        </div>
      </div>

      {favoriteGuides.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteGuides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              isFavorite={true}
              onSelect={onSelectGuide}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
            <BookmarkX className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            Chưa có hướng dẫn nào được lưu
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Bấm vào biểu tượng ngôi sao ⭐ trên bất kỳ bài hướng dẫn nào để lưu lại truy cập nhanh khi cần.
          </p>
        </div>
      )}
    </section>
  );
};
