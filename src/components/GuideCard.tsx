import React from 'react';
import { Clock, Calendar, ArrowRight, Star, FileText } from 'lucide-react';
import { Guide } from '../types';

interface GuideCardProps {
  guide: Guide;
  isFavorite: boolean;
  onSelect: (slug: string) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({
  guide,
  isFavorite,
  onSelect,
  onToggleFavorite
}) => {
  return (
    <div
      onClick={() => onSelect(guide.slug)}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Card Thumbnail Container - High Density Style */}
        <div className="w-full h-32 bg-slate-100 dark:bg-slate-950 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          {guide.thumbnail ? (
            <img
              src={guide.thumbnail}
              alt={guide.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            {guide.isNew && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                MỚI
              </span>
            )}
            {guide.featured && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                HOT
              </span>
            )}
          </div>

          {/* Favorite Star Toggle */}
          <button
            onClick={(e) => onToggleFavorite(e, guide.id)}
            type="button"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer"
            title={isFavorite ? 'Bỏ lưu' : 'Lưu bài'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
          </button>
        </div>

        {/* Category & Metadata Line */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight mb-1">
          <span>{guide.category}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-400 dark:text-slate-500 font-medium">{guide.readingTime} PHÚT ĐỌC</span>
        </div>

        {/* Guide Title */}
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {guide.title}
        </h4>

        {/* Short Summary */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {guide.description}
        </p>
      </div>

      {/* Card Footer Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
        <span>CN: {guide.updatedAt}</span>
        {guide.videoUrl ? (
          <span className="font-bold text-indigo-600 dark:text-indigo-400 italic">CÓ VIDEO 🎬</span>
        ) : (
          <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            XEM NGAY <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
};
