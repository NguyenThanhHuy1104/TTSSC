import React from 'react';
import { History, ArrowRight, Clock } from 'lucide-react';
import { Guide } from '../types';

interface RecentGuidesProps {
  recentIds: string[];
  allGuides: Guide[];
  onSelectGuide: (slug: string) => void;
}

export const RecentGuides: React.FC<RecentGuidesProps> = ({
  recentIds,
  allGuides,
  onSelectGuide
}) => {
  // Get up to 5 guides matching recentIds in order
  const recentGuides = recentIds
    .map((id) => allGuides.find((g) => g.id === id))
    .filter((g): g is Guide => Boolean(g))
    .slice(0, 5);

  if (recentGuides.length === 0) return null;

  return (
    <section className="my-10 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
          🕘 VỪA XEM GẦN ĐÂY
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {recentGuides.map((guide) => (
          <div
            key={guide.id}
            onClick={() => onSelectGuide(guide.slug)}
            className="group p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/60 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 mb-2 inline-block">
                {guide.category}
              </span>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug">
                {guide.title}
              </h3>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-amber-500" />
                {guide.readingTime}m
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
