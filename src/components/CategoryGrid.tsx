import React from 'react';
import {
  Receipt,
  ShieldCheck,
  Monitor,
  Wrench,
  BarChart3,
  Package,
  ShoppingCart,
  Truck,
  Coins,
  Users,
  BookOpen,
  GraduationCap,
  ChevronRight,
  EyeOff,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Category, Guide } from '../types';

interface CategoryGridProps {
  categories: Category[];
  guides: Guide[];
  selectedCategorySlug?: string | null;
  onSelectCategory: (categorySlug: string | null) => void;
  hiddenModules?: string[];
  onOpenModuleConfig?: () => void;
  onToggleHideCategory?: (id: string) => void;
  onShowAllCategories?: () => void;
  showAdminControls?: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  guides,
  selectedCategorySlug,
  onSelectCategory,
  hiddenModules = [],
  onOpenModuleConfig,
  onToggleHideCategory,
  onShowAllCategories,
  showAdminControls = false
}) => {
  // Map icon strings to Lucide components
  const getIcon = (name: string) => {
    switch (name) {
      case 'Receipt': return Receipt;
      case 'ShieldLock': return ShieldCheck;
      case 'ShieldCheck': return ShieldCheck;
      case 'Monitor': return Monitor;
      case 'Wrench': return Wrench;
      case 'BarChart3': return BarChart3;
      case 'Package': return Package;
      case 'ShoppingCart': return ShoppingCart;
      case 'Truck': return Truck;
      case 'Coins': return Coins;
      case 'Users': return Users;
      case 'BookOpen': return BookOpen;
      case 'GraduationCap': return GraduationCap;
      default: return BookOpen;
    }
  };

  const visibleCategories = categories.filter((cat) => !hiddenModules.includes(cat.id));
  const hiddenCount = categories.filter((cat) => hiddenModules.includes(cat.id)).length;

  return (
    <section className="my-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Danh mục hướng dẫn
            </h2>
            {showAdminControls && hiddenCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <EyeOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Ẩn {hiddenCount} module</span>
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chọn nhóm quy trình để tra cứu nhanh các bài hướng dẫn chi tiết
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showAdminControls && onOpenModuleConfig && (
            <button
              onClick={onOpenModuleConfig}
              type="button"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95"
              title="Cài đặt ẩn hoặc hiện các module trên hệ thống"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Ẩn / Hiện module</span>
            </button>
          )}

          {showAdminControls && hiddenCount > 0 && onShowAllCategories && (
            <button
              onClick={onShowAllCategories}
              type="button"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60 transition-colors cursor-pointer flex items-center gap-1"
              title="Hiện lại toàn bộ các module đang bị ẩn"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Hiện tất cả</span>
            </button>
          )}

          {selectedCategorySlug && (
            <button
              onClick={() => onSelectCategory(null)}
              type="button"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 transition-colors cursor-pointer"
            >
              Xóa chọn danh mục
            </button>
          )}
        </div>
      </div>

      {visibleCategories.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <EyeOff className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tất cả các module nghiệp vụ đã được ẩn.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bạn có thể hiện lại bất cứ lúc nào qua nút Quản lý Module.
          </p>
          {showAdminControls && onOpenModuleConfig && (
            <button
              onClick={onOpenModuleConfig}
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Mở quản lý ẩn / hiện module</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
          {visibleCategories.map((cat) => {
            const IconComp = getIcon(cat.iconName);
            const count = guides.filter((g) => g.categoryId === cat.id).length;
            const isSelected = selectedCategorySlug === cat.slug;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.slug)}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isSelected ? 'bg-white/20 text-white' : cat.color
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {count} bài
                    </span>

                    {/* Quick Hide Button on card hover */}
                    {onToggleHideCategory && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleHideCategory(cat.id);
                        }}
                        type="button"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title={`Ẩn module ${cat.name}`}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3
                    className={`text-sm md:text-base font-bold mb-1 truncate ${
                      isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {cat.description}
                  </p>
                </div>

                <div
                  className={`mt-3 pt-2 border-t text-[11px] font-semibold flex items-center justify-between ${
                    isSelected
                      ? 'border-white/20 text-white'
                      : 'border-slate-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity'
                  }`}
                >
                  <span>Xem danh mục</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
