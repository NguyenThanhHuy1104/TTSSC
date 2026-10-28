import React, { useState } from 'react';
import {
  Home,
  Coins,
  ShieldAlert,
  Barcode,
  Link2,
  FolderDown,
  ChevronDown,
  ChevronRight,
  Settings,
  PhoneCall,
  Sparkles,
  Layers,
  Store,
  Radio,
  X,
  MessageCircle,
  Mail
} from 'lucide-react';
import { ZaloIcon } from './common/ZaloIcon';
import { ModuleVisibilityConfig } from '../services/moduleVisibilityService';

export interface LeftSidebarProps {
  activeNav: string;
  onNavigate: (nav: string, subModule?: 'all' | 'shop-thuoc' | 'shop-ve-tinh') => void;
  activeSalarySubModule?: 'all' | 'shop-thuoc' | 'shop-ve-tinh';
  onSalarySubModuleChange?: (sub: 'all' | 'shop-thuoc' | 'shop-ve-tinh') => void;
  moduleVisibility: ModuleVisibilityConfig;
  onOpenAdminConfig?: (tab?: any) => void;
  onOpenZaloModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeNav,
  onNavigate,
  activeSalarySubModule = 'all',
  onSalarySubModuleChange,
  moduleVisibility,
  onOpenAdminConfig,
  onOpenZaloModal,
  isMobileOpen = false,
  onCloseMobile
}) => {
  // Always keep policy submenu expanded if current nav is luong-thuong
  const [policySubmenuOpen, setPolicySubmenuOpen] = useState(true);

  const handleNavClick = (nav: string, sub?: 'all' | 'shop-thuoc' | 'shop-ve-tinh') => {
    onNavigate(nav, sub);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSubModuleClick = (e: React.MouseEvent, sub: 'shop-thuoc' | 'shop-ve-tinh') => {
    e.stopPropagation();
    if (onSalarySubModuleChange) onSalarySubModuleChange(sub);
    onNavigate('luong-thuong', sub);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex-1 flex flex-col justify-between p-3.5 sm:p-4 text-slate-800 dark:text-slate-200 select-none overflow-hidden">
      {/* Top Header & Tab chức năng navigation */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-4">
        {/* Mobile Header with Close button */}
        <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-xs font-bold">
              SSC
            </span>
            <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Chọn chức năng
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Mini Brand & Label */}
        <div className="hidden lg:flex items-center justify-between px-2 pt-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Phân hệ chức năng</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
            MENU
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-2">
          {/* 1. Trang chủ */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeNav === 'home'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border-blue-600 dark:border-blue-500'
                : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className={`w-4 h-4 ${activeNav === 'home' ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
              <span>Trang chủ</span>
            </div>
            {activeNav === 'home' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>

          {/* 2. Chính sách Lương thưởng (Chứa module con: Shop thuốc, Shop vệ tinh) */}
          {moduleVisibility['luong-thuong'] !== false && (
            <div className="space-y-1.5">
              <div
                onClick={() => handleNavClick('luong-thuong', 'all')}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeNav === 'luong-thuong'
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/60 shadow-xs'
                    : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Coins className={`w-4 h-4 ${activeNav === 'luong-thuong' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 group-hover:text-amber-500'}`} />
                  <span>Chính sách Lương</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    MỚI
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPolicySubmenuOpen(!policySubmenuOpen);
                    }}
                    className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition"
                  >
                    {policySubmenuOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    )}
                  </button>
                </div>
              </div>

              {/* MODULE CON: Shop thuốc, Shop vệ tinh */}
              {policySubmenuOpen && (
                <div className="pl-3 pr-1 py-1 space-y-1.5 border-l-2 border-amber-500/40 ml-3 animate-in slide-in-from-top-1 duration-150">
                  {/* Tất cả chính sách */}
                  <button
                    type="button"
                    onClick={() => handleNavClick('luong-thuong', 'all')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                      activeNav === 'luong-thuong' && activeSalarySubModule === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs'
                        : 'bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
                    }`}
                  >
                    <span>Tất cả chính sách</span>
                    <span className="text-[10px] font-mono opacity-80">All</span>
                  </button>

                  {/* Module con 1: Shop thuốc */}
                  {moduleVisibility['luong-thuong-thuoc'] !== false && (
                    <button
                      type="button"
                      onClick={(e) => handleSubModuleClick(e, 'shop-thuoc')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                        activeNav === 'luong-thuong' && activeSalarySubModule === 'shop-thuoc'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs'
                          : 'bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Shop thuốc</span>
                      </span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-mono">
                        Thuốc
                      </span>
                    </button>
                  )}

                  {/* Module con 2: Shop vệ tinh */}
                  {moduleVisibility['luong-thuong-ve-tinh'] !== false && (
                    <button
                      type="button"
                      onClick={(e) => handleSubModuleClick(e, 'shop-ve-tinh')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                        activeNav === 'luong-thuong' && activeSalarySubModule === 'shop-ve-tinh'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs'
                          : 'bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Shop vệ tinh</span>
                      </span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-mono">
                        Vệ tinh
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Tra cứu Vi phạm & Mức xử phạt */}
          {moduleVisibility['vi-pham'] !== false && (
            <button
              type="button"
              onClick={() => handleNavClick('vi-pham')}
              className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeNav === 'vi-pham'
                  ? 'bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/60 shadow-xs font-bold'
                  : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className={`w-4 h-4 ${activeNav === 'vi-pham' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 group-hover:text-rose-500'}`} />
                <span>Tra cứu Vi phạm</span>
              </div>
            </button>
          )}

          {/* 4. Tra cứu Barcode */}
          {moduleVisibility['barcode'] !== false && (
            <button
              type="button"
              onClick={() => handleNavClick('barcode')}
              className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeNav === 'barcode'
                  ? 'bg-blue-500/15 text-blue-800 dark:text-blue-200 border-blue-500/60 shadow-xs font-bold'
                  : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Barcode className={`w-4 h-4 ${activeNav === 'barcode' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'}`} />
                <span>Tra cứu Barcode</span>
              </div>
            </button>
          )}

          {/* 5. Danh sách link thường dùng */}
          {moduleVisibility['links'] !== false && (
            <button
              type="button"
              onClick={() => handleNavClick('links')}
              className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeNav === 'links'
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/60 shadow-xs font-bold'
                  : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Link2 className={`w-4 h-4 ${activeNav === 'links' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                <span>Danh sách link thường dùng</span>
              </div>
            </button>
          )}

          {/* 6. Biên bản & File */}
          {moduleVisibility['minutes-files'] !== false && (
            <button
              type="button"
              onClick={() => handleNavClick('minutes-files')}
              className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeNav === 'minutes-files'
                  ? 'bg-blue-500/15 text-blue-800 dark:text-blue-200 border-blue-500/60 shadow-xs font-bold'
                  : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderDown className={`w-4 h-4 ${activeNav === 'minutes-files' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'}`} />
                <span>Biên bản &amp; File</span>
              </div>
            </button>
          )}
        </nav>
      </div>

      {/* Phân tách riêng Hotline, Mail, Zalo liên hệ xuống cuối panel */}
      <div className="mt-auto shrink-0 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        {/* Hotline SSC */}
        <div className="px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 flex items-center justify-between shadow-2xs">
          <span className="flex items-center gap-2 font-bold">
            <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Hotline SSC:</span>
          </span>
          <strong className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
            87333 (Nhánh 2)
          </strong>
        </div>

        {/* Mail Support - bên dưới hotline */}
        <a
          href="mailto:FLC.Support@fpt.com"
          className="px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 flex items-center justify-between hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition group shadow-2xs"
          title="Gửi email hỗ trợ: FLC.Support@fpt.com"
        >
          <span className="flex items-center gap-2 font-bold shrink-0">
            <Mail className="w-4 h-4 text-sky-500 shrink-0" />
            <span>Mail:</span>
          </span>
          <strong className="font-mono text-xs sm:text-[12.5px] font-bold text-sky-600 dark:text-sky-400 group-hover:underline truncate ml-1">
            FLC.Support@fpt.com
          </strong>
        </a>

        {/* Zalo liên hệ SSC - có icon Zalo */}
        {onOpenZaloModal && (
          <button
            type="button"
            onClick={onOpenZaloModal}
            className="w-full px-3.5 py-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 text-xs sm:text-[13px] text-blue-900 dark:text-blue-200 flex items-center justify-between hover:bg-blue-100/90 dark:hover:bg-blue-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition cursor-pointer group shadow-2xs"
            title="Xem ảnh thông tin liên hệ SSC qua Zalo"
          >
            <span className="flex items-center gap-2 font-bold">
              <ZaloIcon className="w-4 h-4 shrink-0 rounded-xs" />
              <span>Zalo liên hệ SSC:</span>
            </span>
            <span className="font-black underline text-xs sm:text-[13px] text-blue-600 dark:text-blue-400 group-hover:text-blue-700">
              Tại đây ↗
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left Sidebar: sticky, sleek, glassmorphic rail (Chiều ngang 130% ~ 332px) */}
      <aside className="hidden lg:block w-[332px] shrink-0">
        <div className="sticky top-20 rounded-3xl bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] overflow-hidden h-[calc(100vh-100px)] flex flex-col">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Slide-Over from the Left (Chiều ngang 130% ~ 340px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          {/* Drawer sheet on the left */}
          <div className="relative z-10 w-[340px] max-w-[88vw] h-full bg-white dark:bg-[#0B0F19] border-r border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
