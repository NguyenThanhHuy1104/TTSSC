import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-32 h-3 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            </div>
            <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800/40 p-3 space-y-2 border border-slate-200/50 dark:border-slate-800"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
