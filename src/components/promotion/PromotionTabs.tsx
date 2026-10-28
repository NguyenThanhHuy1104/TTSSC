import React from 'react';
import { PromotionRound, PromotionRoundKey } from '../../types';
import { PROMOTION_ROUNDS } from '../../config/sheetsConfig';
import { Sparkles, Calendar, Tag, Gift, ChevronRight } from 'lucide-react';

interface PromotionTabsProps {
  activeTab: PromotionRoundKey;
  onTabChange: (tab: PromotionRoundKey) => void;
  currentRoundInfo?: PromotionRound;
}

export const PromotionTabs: React.FC<PromotionTabsProps> = ({
  activeTab,
  onTabChange,
  currentRoundInfo
}) => {
  return (
    <div className="space-y-4">
      {/* Round Selector Tab Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PROMOTION_ROUNDS.map((round) => {
          const isActive = activeTab === round.tabKey;
          return (
            <button
              key={round.id}
              id={`tab-round-${round.tabKey}`}
              type="button"
              onClick={() => onTabChange(round.tabKey)}
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 cursor-pointer shadow-2xs ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Gift className={`w-4 h-4 ${isActive ? 'text-cyan-200' : 'text-slate-400 group-hover:text-cyan-500'}`} />
              <span>{round.label}</span>
              {round.highlightText && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : round.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {round.status === 'active' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Đang chạy</span>
                    </>
                  ) : (
                    <span>Đã kết thúc</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Round Information Banner */}
      {currentRoundInfo && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 shadow-xl border border-cyan-500/30">
          {/* Subtle Background Accents */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>CHƯƠNG TRÌNH KHUYẾN MÃI TRỌNG ĐIỂM FPT LONG CHÂU</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                {currentRoundInfo.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {currentRoundInfo.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs text-cyan-200 font-semibold">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Thời gian: {currentRoundInfo.dateRange}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-cyan-500/20 px-3.5 py-2 rounded-xl border border-cyan-400/30 text-xs text-cyan-300 font-bold">
                <Tag className="w-4 h-4" />
                <span>12 Đảo Quà Tặng</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
