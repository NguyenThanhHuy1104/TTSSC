import React, { useState } from 'react';
import { Clock, Calendar, User, Star, Share2, Check, Bookmark, FileText } from 'lucide-react';
import { Guide } from '../types';

interface GuideHeaderProps {
  guide: Guide;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const GuideHeader: React.FC<GuideHeaderProps> = ({
  guide,
  isFavorite,
  onToggleFavorite
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  return (
    <div className="mb-8 p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {guide.category}
          </span>
          {guide.isNew && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
              MỚI
            </span>
          )}
          {guide.featured && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
              NỔI BẬT
            </span>
          )}
        </div>

        {/* Action Buttons: Favorite & Share Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              isFavorite
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
            title={isFavorite ? 'Bỏ lưu bài viết' : 'Lưu vào bài viết yêu thích'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            <span>{isFavorite ? 'Đã lưu' : 'Lưu bài'}</span>
          </button>

          <button
            onClick={handleShareLink}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 transition-all cursor-pointer active:scale-95"
            title="Sao chép liên kết bài hướng dẫn"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">Đã sao chép liên kết</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>SAO CHÉP LINK HƯỚNG DẪN</span>
              </>
            )}
          </button>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-4">
        {guide.title}
      </h1>

      <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-normal">
        {guide.description}
      </p>

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs md:text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>Cập nhật: <strong>{guide.updatedAt}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Thời gian đọc: <strong>{guide.readingTime} phút</strong></span>
        </div>

        {guide.author && (
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-500" />
            <span>Phụ trách: <strong>{guide.author}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
