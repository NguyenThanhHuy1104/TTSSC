import React from 'react';
import { Settings, Users, PhoneCall, Mail, ArrowUp } from 'lucide-react';
import { ZaloIcon } from './common/ZaloIcon';
import { formatVisitCount } from '../services/analyticsService';

interface FooterProps {
  activeNav: string;
  onNavigate: (nav: string) => void;
  todayVisits?: number;
  totalVisits?: number;
  showWatermark?: boolean;
  onToggleWatermark?: () => void;
  ipRestrictionEnabled?: boolean;
  onOpenIpAdmin?: () => void;
  onOpenAdminConfig?: (tab?: 'salary' | 'penalty' | 'barcode' | 'links') => void;
  onOpenZaloModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  todayVisits = 0,
  totalVisits = 0,
  showWatermark = true,
  onToggleWatermark,
  ipRestrictionEnabled = false,
  onOpenAdminConfig,
  onOpenZaloModal
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-md pt-5 pb-16 sm:pb-5 px-4 sm:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        
        {/* Left: Brand Identity & Support info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              TRUNG TÂM SSC - 87333
            </span>{' '}
            <span className="hidden sm:inline">—</span> TRUNG TÂM DỊCH VỤ KHỐI SHOP
          </div>
          <div className="flex items-center justify-center gap-2.5 font-mono text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
              <span>87333 (Nhánh 2)</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              <span>FLC.Support@fpt.com</span>
            </span>
            {onOpenZaloModal && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onOpenZaloModal}
                  className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold cursor-pointer group"
                  title="Xem ảnh thông tin liên hệ SSC qua Zalo"
                >
                  <ZaloIcon className="w-4 h-4 shrink-0 rounded-2xs" />
                  <span>Zalo liên hệ SSC:</span>
                  <span className="font-black underline group-hover:text-blue-700">Tại đây ↗</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Tools, Visits & System controls - with right clearance so chatbot never overlaps */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:pr-24 lg:pr-28">
          {/* Unified Config Button - Icon only */}
          {onOpenAdminConfig && (
            <button
              type="button"
              onClick={() => onOpenAdminConfig('modules' as any)}
              className="p-1.5 rounded-lg border border-amber-300/80 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-200 transition cursor-pointer group flex items-center justify-center shadow-xs"
              title="Cài đặt hệ thống & Quản lý hiển thị module"
              aria-label="Cài đặt hệ thống"
            >
              <Settings className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 transition-transform group-hover:rotate-45" />
            </button>
          )}

          {/* Visit Count Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 text-slate-700 dark:text-blue-300 text-[11px] font-mono select-none"
            title={`Hôm nay: ${formatVisitCount(todayVisits)} lượt (Tổng tích lũy: ${formatVisitCount(totalVisits)})`}
          >
            <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Hôm nay: <strong className="font-bold">{formatVisitCount(todayVisits)}</strong></span>
            {totalVisits > 0 && (
              <span className="text-slate-400 dark:text-slate-500 hidden lg:inline">
                ({formatVisitCount(totalVisits)})
              </span>
            )}
          </div>

          {/* System Normal Status */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ONLINE</span>
          </span>

          {/* Scroll to Top in Footer */}
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
              document.body.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-bold cursor-pointer transition shadow-2xs group"
            title="Cuộn nhanh về đầu trang"
          >
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            <span>Về đầu trang</span>
          </button>

          {/* Halloween Watermark Toggle (if available) */}
          {onToggleWatermark && (
            <button
              type="button"
              onClick={onToggleWatermark}
              className={`px-2 py-1 rounded-lg text-[11px] border cursor-pointer transition ${
                showWatermark
                  ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
              title={showWatermark ? 'Tắt Watermark Halloween' : 'Bật Watermark Halloween'}
            >
              🎃 {showWatermark ? 'Bật' : 'Tắt'}
            </button>
          )}

          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            © {currentYear}
          </span>
        </div>

      </div>
    </footer>
  );
};
