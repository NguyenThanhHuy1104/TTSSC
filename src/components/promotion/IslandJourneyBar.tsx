import React from 'react';
import { IslandData } from '../../types';
import { Compass, Gift } from 'lucide-react';

interface IslandJourneyBarProps {
  islands: IslandData[];
  expandedIslands: Set<number>;
  onSelectIsland: (islandNumber: number) => void;
}

export const IslandJourneyBar: React.FC<IslandJourneyBarProps> = ({
  islands,
  expandedIslands,
  onSelectIsland
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
            <Compass className="w-3 h-3" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            {islands.length} Đảo Quà Tặng
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">• Nhấp chọn số đảo</span>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200/70 dark:border-cyan-800/70">
          <Gift className="w-2.5 h-2.5" />
          <span>{islands.length} Đảo</span>
        </span>
      </div>

      {/* Island buttons in a single row (1 hàng), half the previous height (~28px), no island names */}
      <div
        className={
          islands.length <= 12
            ? 'grid grid-cols-12 gap-1 sm:gap-1.5 w-full items-center'
            : 'flex items-center gap-1 sm:gap-1.5 w-full overflow-x-auto pb-1 scrollbar-thin'
        }
      >
        {islands.map((island) => {
          const isExpanded = expandedIslands.has(island.islandNumber);
          const hasProducts = island.products.length > 0;

          return (
            <button
              key={island.id}
              type="button"
              onClick={() => onSelectIsland(island.islandNumber)}
              className={`h-7 sm:h-7.5 ${
                islands.length <= 12 ? 'w-full' : 'min-w-[28px] sm:min-w-[32px] px-2 shrink-0'
              } flex items-center justify-center rounded-md font-black text-[11px] sm:text-xs transition-all duration-150 cursor-pointer border relative select-none ${
                isExpanded
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500 shadow-xs ring-1 ring-cyan-400/40'
                  : hasProducts
                  ? 'bg-slate-50 dark:bg-slate-800/60 hover:bg-cyan-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                  : 'bg-slate-100/60 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-800'
              }`}
              title={`Đảo ${island.islandNumber}: ${island.products.length} quà tặng`}
            >
              <span>{island.islandNumber}</span>
              {isExpanded && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 ring-1 ring-white dark:ring-slate-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
