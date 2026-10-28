import React from 'react';
import { Category, Guide } from '../types';
import { PhoneCall, SlidersHorizontal, EyeOff } from 'lucide-react';

interface SidebarCategoryProps {
  categories: Category[];
  guides: Guide[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  onOpenSupportModal?: () => void;
  hiddenModules?: string[];
  onOpenModuleConfig?: () => void;
  showAdminControls?: boolean;
}

export const SidebarCategory: React.FC<SidebarCategoryProps> = ({
  categories,
  guides,
  selectedCategorySlug,
  onSelectCategory,
  hiddenModules = [],
  onOpenModuleConfig,
  showAdminControls = false
}) => {
  const getCategoryEmoji = (name: string) => {
    switch (name) {
      case 'Hóa đơn': return '🧾';
      case 'Tài khoản': return '🔐';
      case 'Hệ thống': return '🖥';
      case 'Hỗ trợ kỹ thuật': return '🔧';
      case 'Báo cáo': return '📊';
      case 'Kho vận': return '📦';
      case 'Bán hàng': return '🛒';
      case 'Giao hàng': return '🚚';
      case 'Kế toán': return '💰';
      case 'Nhân sự': return '👥';
      case 'Quy trình': return '📖';
      case 'Đào tạo': return '🎓';
      default: return '📁';
    }
  };

  const visibleCategories = categories.filter((c) => !hiddenModules.includes(c.id));
  const hiddenCount = categories.filter((c) => hiddenModules.includes(c.id)).length;

  return (
    <aside className="w-[250px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs h-fit hidden xl:flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Danh mục chính
          </p>
          {selectedCategorySlug && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Xóa lọc
            </button>
          )}
        </div>

        <div className="space-y-1">
          {visibleCategories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            const count = guides.filter((g) => g.categoryId === cat.id).length;
            const emoji = getCategoryEmoji(cat.name);

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.slug)}
                type="button"
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <span className="text-base leading-none">{emoji}</span>
                  <span className="truncate">{cat.name}</span>
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick link to toggle modules */}
        {showAdminControls && onOpenModuleConfig && (
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onOpenModuleConfig}
              type="button"
              className="w-full text-[11px] font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center justify-between py-1 px-1 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Ẩn / Hiện module</span>
              </span>
              {hiddenCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold">
                  {hiddenCount} ẩn
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Direct Support Widget in Sidebar */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl text-white shadow-lg shadow-blue-500/15">
        <div className="flex items-center gap-2 mb-1">
          <PhoneCall className="w-4 h-4 text-blue-200" />
          <p className="text-xs font-semibold opacity-90">Cần hỗ trợ trực tiếp?</p>
        </div>
        <p className="text-sm font-bold tracking-tight">Tổng đài: 87333 nhánh 2</p>
        <p className="text-[10px] text-blue-100 opacity-80 mt-0.5">
          Trung tâm SSC luôn sẵn sàng giải đáp sự cố 24/7
        </p>
        <a
          href="tel:87333"
          className="mt-3 w-full py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-[11px] font-bold uppercase tracking-wider block text-center shadow-xs transition-colors"
        >
          GỬI YÊU CẦU SUPPORT
        </a>
      </div>
    </aside>
  );
};
