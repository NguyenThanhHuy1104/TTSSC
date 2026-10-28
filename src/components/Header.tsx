import React from 'react';
import {
  Menu,
  Settings,
  Home,
  Coins,
  ShieldAlert,
  Barcode,
  Link2,
  FolderDown,
  ChevronRight,
  ZoomIn,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { useSyncCountdown } from '../services/dataSyncService';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeNav: string; // 'home' | 'vi-pham' | 'barcode' | 'links' | 'luong-thuong'
  activeSalarySubModule?: 'all' | 'shop-thuoc' | 'shop-ve-tinh';
  onNavigate: (nav: string, sub?: 'all' | 'shop-thuoc' | 'shop-ve-tinh') => void;
  todayVisits?: number;
  ipRestrictionEnabled?: boolean;
  onOpenIpAdmin?: () => void;
  showWatermark?: boolean;
  onToggleWatermark?: () => void;
  onOpenAdminConfig?: (tab?: any) => void;
  onToggleMobileSidebar?: () => void;
  zoomLevel?: number;
  onToggleZoom?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  activeNav,
  activeSalarySubModule,
  onNavigate,
  onOpenAdminConfig,
  onToggleMobileSidebar,
  zoomLevel,
  onToggleZoom
}) => {
  const { countdown, isSyncing, triggerSync } = useSyncCountdown();

  // Breadcrumb label helper
  const getBreadcrumb = () => {
    switch (activeNav) {
      case 'luong-thuong':
        return (
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold text-xs">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>Chính sách Lương</span>
            {activeSalarySubModule === 'shop-thuoc' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-slate-900 dark:text-white">Shop thuốc</span>
              </>
            )}
            {activeSalarySubModule === 'shop-ve-tinh' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-slate-900 dark:text-white">Shop vệ tinh</span>
              </>
            )}
          </div>
        );
      case 'vi-pham':
        return (
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-semibold text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Tra cứu Vi phạm &amp; Mức xử phạt</span>
          </div>
        );
      case 'barcode':
        return (
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold text-xs">
            <Barcode className="w-3.5 h-3.5 text-blue-500" />
            <span>Tra cứu Barcode</span>
          </div>
        );
      case 'links':
        return (
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
            <Link2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Danh sách link thường dùng</span>
          </div>
        );
      case 'minutes-files':
        return (
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold text-xs">
            <FolderDown className="w-3.5 h-3.5 text-blue-500" />
            <span>Biên bản &amp; File</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-xs">
            <Home className="w-3.5 h-3.5 text-blue-500" />
            <span>Trang chủ Tổng quan</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(15,23,42,0.02)] transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LEFT: Mobile Menu Button + Brand Identity */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          {/* Mobile Menu Button to open Left Sidebar */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 shrink-0"
            aria-label="Mở Menu chức năng bên trái"
            title="Mở thanh chọn chức năng bên trái"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Home Button to quickly return to homepage */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-slate-100 shrink-0"
            aria-label="Về trang chủ"
            title="Về trang chủ"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Brand Identity */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group select-none min-w-0"
            title="Trang chủ Trung tâm SSC - 87333"
          >
            <div className="relative shrink-0 flex items-center justify-center px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-mono font-semibold text-[11px] sm:text-xs tracking-tight shadow-sm shadow-blue-500/20 group-hover:brightness-110 transition">
              <span>SSC</span>
              <span className="mx-0.5 sm:mx-1 opacity-50">/</span>
              <span>87333</span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[11px] xs:text-xs sm:text-sm leading-tight text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[150px] xs:max-w-[210px] md:max-w-none">
                Chào mừng anh chị đến với Trung Tâm SSC - 87333
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-none hidden sm:block">
                TRUNG TÂM DỊCH VỤ KHỐI SHOP
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Breadcrumb of current active module */}
        <div className="hidden md:flex items-center px-3.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          {getBreadcrumb()}
        </div>

        {/* RIGHT: Controls (Đếm ngược 90s, Zoom 100%, Admin Config, Light/Dark) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* 90s Data Sync Countdown: strictly numbers only, NO letters */}
          <button
            onClick={triggerSync}
            type="button"
            className="hidden sm:flex h-8 px-2.5 rounded-lg text-[11px] font-mono font-bold border border-blue-200/90 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition items-center gap-1.5 cursor-pointer shadow-2xs"
            title="90"
          >
            <RefreshCw className={`w-3 h-3 text-blue-600 dark:text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{countdown < 10 ? `0${countdown}` : countdown}</span>
          </button>

          {/* Zoom Level Button (Defaults to 80%, click to toggle 80% / 100%) */}
          {typeof zoomLevel === 'number' && onToggleZoom && (
            <button
              onClick={onToggleZoom}
              type="button"
              className="hidden sm:flex h-8 px-2.5 rounded-lg text-[11px] font-mono font-medium border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition items-center gap-1 cursor-pointer"
              title={`Thu phóng: ${Math.round(zoomLevel * 100)}%`}
            >
              <ZoomIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{Math.round(zoomLevel * 100)}%</span>
            </button>
          )}

          {/* Settings Icon */}
          {onOpenAdminConfig && (
            <button
              onClick={() => onOpenAdminConfig('modules')}
              type="button"
              className="hidden sm:flex h-8 px-2 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition items-center gap-1 cursor-pointer group"
              title="Cài đặt hệ thống"
            >
              <Settings className="w-3.5 h-3.5 text-amber-500 transition-transform group-hover:rotate-45" />
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            type="button"
            className="h-8 px-2.5 rounded-lg text-[11px] font-mono font-medium border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={darkMode ? 'Chuyển sang Chế độ sáng' : 'Chuyển sang Chế độ tối'}
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span className="font-bold text-amber-400">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-bold text-slate-700">DARK</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
