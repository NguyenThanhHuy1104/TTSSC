import React from 'react';
import { Layers } from 'lucide-react';
import { Guide } from '../types';
import { GuideCard } from './GuideCard';

interface RelatedGuidesProps {
  currentGuideId: string;
  categoryId: string;
  categoryName: string;
  allGuides: Guide[];
  favorites: string[];
  onSelectGuide: (slug: string) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const RelatedGuides: React.FC<RelatedGuidesProps> = ({
  currentGuideId,
  categoryId,
  categoryName,
  allGuides,
  favorites,
  onSelectGuide,
  onToggleFavorite
}) => {
  // Find up to 4 guides in the same category excluding current guide
  const related = allGuides
    .filter((g) => g.categoryId === categoryId && g.id !== currentGuideId)
    .slice(0, 4);

  // If less than 4, fill with other featured or recent guides
  const fallback = allGuides
    .filter((g) => g.id !== currentGuideId && !related.includes(g))
    .slice(0, 4 - related.length);

  const displayGuides = [...related, ...fallback];

  if (displayGuides.length === 0) return null;

  return (
    <section className="my-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            HƯỚNG DẪN LIÊN QUAN
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Các bài viết cùng chủ đề thuộc danh mục {categoryName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayGuides.map((guide) => (
          <GuideCard
            key={guide.id}
            guide={guide}
            isFavorite={favorites.includes(guide.id)}
            onSelect={onSelectGuide}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
};
