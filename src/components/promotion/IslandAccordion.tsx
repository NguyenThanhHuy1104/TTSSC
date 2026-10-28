import React, { useState, useMemo, memo, useCallback } from 'react';
import { IslandData, ProductItem } from '../../types';
import { ChevronDown, ChevronUp, Gift, Copy, Check, ChevronRight, ExternalLink } from 'lucide-react';
import { extractProductCodeAndLink } from '../../utils/productUtils';

interface ProductCardProps {
  item: ProductItem;
  onCopySuccess: (code: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ item, onCopySuccess }) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Extract clean code and link (either from item.linkUrl or embedded in item.maSanPham)
  const parsed = useMemo(() => {
    if (item.linkUrl) {
      return {
        code: item.maSanPham,
        linkUrl: item.linkUrl
      };
    }
    return extractProductCodeAndLink(item.maSanPham);
  }, [item.maSanPham, item.linkUrl]);

  const cleanCode = parsed.code;
  const activeLink = parsed.linkUrl;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    onCopySuccess(cleanCode);
    setTimeout(() => setCopied(false), 2000);
  }, [cleanCode, onCopySuccess]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-200 flex flex-col justify-between space-y-3">
      {/* Top: Product Name */}
      <div className="space-y-2">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
          {item.tenSanPham}
        </h4>
      </div>

      {/* Middle: Gift Box (Quà Tặng) */}
      <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/80 dark:border-amber-800/60 space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide">
          <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Quà Tặng:</span>
        </div>
        <p className="text-xs font-extrabold text-amber-950 dark:text-amber-200 leading-snug">
          {item.quaTang}
        </p>
      </div>

      {/* Middle-Bottom: Spending Milestone & Conditions */}
      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-500">Mốc chi tiêu:</span>
          <span className="font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded">
            {item.mocChiTieu}
          </span>
        </div>

        {item.moTa && (
          <p className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {item.moTa}
          </p>
        )}

        {item.ghiChu && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic truncate">
            * {item.ghiChu}
          </p>
        )}
      </div>

      {/* Bottom (Phía dưới): Product Code & Action Buttons */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Mã SP:</span>
          {activeLink ? (
            <a
              href={activeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs font-black text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/70 dark:hover:bg-cyan-900/80 px-2 py-0.5 rounded-md border border-cyan-300 dark:border-cyan-800 transition-colors truncate max-w-[150px]"
              title="Nhấp để truy cập đường link mã sản phẩm"
            >
              <span className="truncate">{cleanCode}</span>
              <ExternalLink className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
            </a>
          ) : (
            <code className="font-mono text-xs font-black text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900 truncate max-w-[150px]">
              {cleanCode}
            </code>
          )}
        </div>

        {/* Action Buttons: Nút Truy cập (nếu có link) & Nút Chép mã */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeLink && (
            <a
              href={activeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
              title="Mở đường link trên mã sản phẩm trong tab mới"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Truy cập</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Sao chép mã sản phẩm"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Chép mã</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

interface IslandAccordionProps {
  island: IslandData;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery: string;
  onCopySuccess: (code: string) => void;
}

const INITIAL_DISPLAY_LIMIT = 12;

export const IslandAccordion: React.FC<IslandAccordionProps> = memo(({
  island,
  isExpanded,
  onToggle,
  searchQuery,
  onCopySuccess
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  // If user is actively searching, show all matches immediately.
  // Otherwise, cap at INITIAL_DISPLAY_LIMIT to keep DOM fast.
  const isSearching = Boolean(searchQuery && searchQuery.trim());
  const displayedProducts = isSearching || showAll
    ? island.products
    : island.products.slice(0, INITIAL_DISPLAY_LIMIT);

  const remainingCount = island.products.length - displayedProducts.length;

  return (
    <div
      id={`island-section-${island.islandNumber}`}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200"
    >
      {/* Accordion Header */}
      <div
        onClick={onToggle}
        className={`px-4 sm:px-6 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors select-none ${
          isExpanded
            ? 'bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent border-b border-cyan-100 dark:border-cyan-950'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Island Number Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
            {island.islandNumber}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Đảo {island.islandNumber}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {island.products.length > 0
                ? `Bao gồm ${island.products.length} sản phẩm & quà tặng hấp dẫn`
                : 'Chưa có sản phẩm cho tiêu chí tìm kiếm này'}
            </p>
          </div>
        </div>

        {/* Right Status & Expand Arrow */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Gift className="w-3.5 h-3.5 text-cyan-500" />
            <span>{island.products.length} Quà</span>
          </span>

          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Accordion Body: Products Grid */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
          {island.products.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Không có sản phẩm nào phù hợp với bộ lọc trong đảo này.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onCopySuccess={onCopySuccess}
                  />
                ))}
              </div>

              {/* Show More Button if large product list */}
              {remainingCount > 0 && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-cyan-200 dark:border-cyan-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Xem thêm {remainingCount} sản phẩm & quà tặng khác trên đảo này</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});
