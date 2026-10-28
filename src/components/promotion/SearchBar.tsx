import React from 'react';
import { IslandData } from '../../types';
import { Search, X, Filter, ChevronsUpDown, Maximize2, Minimize2, Gift, Sparkles } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedIslandFilter: string;
  onIslandFilterChange: (island: string) => void;
  islands: IslandData[];
  onExpandAll: () => void;
  onCollapseAll: () => void;
  totalFilteredGifts: number;
  totalIslandsWithResults: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedIslandFilter,
  onIslandFilterChange,
  islands,
  onExpandAll,
  onCollapseAll,
  totalFilteredGifts,
  totalIslandsWithResults
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600 dark:text-cyan-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo Mã sản phẩm, Tên SP, Quà tặng, Mốc chi tiêu, Đảo... (hỗ trợ gõ không dấu)"
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Actions: Island Filter Dropdown & Expand/Collapse All */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Island Filter Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-[170px]">
            <select
              value={selectedIslandFilter}
              onChange={(e) => onIslandFilterChange(e.target.value)}
              className="w-full h-11 pl-3.5 pr-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 cursor-pointer appearance-none"
            >
              <option value="all">Tất cả các đảo ({islands.length})</option>
              {islands.map((island) => (
                <option key={island.id} value={island.islandName}>
                  {island.islandName} ({island.products.length})
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Quick Expand All Button */}
          <button
            type="button"
            onClick={onExpandAll}
            className="h-11 px-3.5 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 dark:bg-slate-800 dark:hover:bg-cyan-950/60 dark:text-slate-300 dark:hover:text-cyan-300 border border-slate-200/80 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Mở rộng tất cả các đảo"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mở tất cả</span>
          </button>

          {/* Quick Collapse All Button */}
          <button
            type="button"
            onClick={onCollapseAll}
            className="h-11 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Thu gọn tất cả"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thu gọn</span>
          </button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400">
            <Gift className="w-3.5 h-3.5" />
            {totalFilteredGifts} phần quà phù hợp
          </span>
          <span>•</span>
          <span>Hiển thị trên {totalIslandsWithResults} đảo</span>
        </div>

        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        )}
      </div>
    </div>
  );
};
