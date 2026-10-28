import React from 'react';
import { Search, X, Sparkles, Command, Barcode, ShieldAlert, Compass, Gift } from 'lucide-react';
import sscWatermarkTrans from '../assets/ssc_watermark_transparent.svg';
import sscWatermark from '../assets/ssc_watermark.svg';

interface HeroSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTag: (tag: string) => void;
  onNavigateToBarcode?: () => void;
  onNavigateToPenalties?: () => void;
  onNavigateToPromotions?: () => void;
  hiddenModules?: string[];
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  onSearchChange,
  onSelectTag,
  onNavigateToBarcode,
  onNavigateToPenalties,
  onNavigateToPromotions,
  hiddenModules = []
}) => {
  const quickKeywords = [
    'Hóa đơn VAT',
    'Báo cáo kho',
    'Reset mật khẩu',
    'Webex',
    'Kho vận',
    'POS'
  ];

  const showPromotions = onNavigateToPromotions && !hiddenModules.includes('khuyen-mai');
  const showPenalties = onNavigateToPenalties && !hiddenModules.includes('vi-pham');
  const showBarcode = onNavigateToBarcode && !hiddenModules.includes('barcode');

  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 my-3 shadow-sm relative">
      {/* Background Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] bg-right bg-no-repeat bg-contain select-none"
        style={{ backgroundImage: `url(${sscWatermarkTrans})` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Top Slim Bar: Title & Action badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 max-w-full">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <h1 className="text-xs xs:text-sm sm:text-base md:text-xl font-black text-blue-700 dark:text-blue-400 tracking-tight uppercase leading-snug break-words">
              CHÀO MỪNG ANH CHỊ ĐẾN VỚI TRUNG TÂM SSC - 87333
            </h1>
          </div>

          {/* Action Quick Links */}
          <div className="flex items-center gap-2 flex-wrap">
            {showPromotions && (
              <button
                type="button"
                onClick={onNavigateToPromotions}
                className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-xs transition-transform hover:scale-105 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>12 Đảo Quà Tặng</span>
              </button>
            )}

            {showPenalties && (
              <button
                type="button"
                onClick={onNavigateToPenalties}
                className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-xs transition-transform hover:scale-105 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tra cứu Vi phạm</span>
              </button>
            )}

            {showBarcode && (
              <button
                type="button"
                onClick={onNavigateToBarcode}
                className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-xs transition-transform hover:scale-105 cursor-pointer"
              >
                <Barcode className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tra cứu Barcode</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Row: 50% Search Box on Left, Quick Keywords on Right */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Left: 50% Width Search Input */}
          <div className="w-full md:w-1/2 relative shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm nhanh (vd: Hoàn tiền, Webex, Reset mật khẩu...)"
              className="w-full h-10 pl-9 pr-8 rounded-lg shadow-xs border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 text-slate-900 dark:text-white text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 font-medium outline-none transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-blue-600 dark:text-blue-400 pointer-events-none" />
            
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                type="button"
                className="absolute right-2.5 top-2.5 p-0.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Quick Search Tags */}
          <div className="w-full md:w-1/2 flex items-center gap-1.5 flex-wrap overflow-hidden">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Gợi ý:
            </span>
            {quickKeywords.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                type="button"
                className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md cursor-pointer transition-colors font-medium border border-slate-200 dark:border-slate-700 whitespace-nowrap active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


