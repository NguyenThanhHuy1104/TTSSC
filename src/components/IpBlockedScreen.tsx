import React, { useState } from 'react';
import { ShieldAlert, KeyRound, PlusCircle, Settings } from 'lucide-react';
import { IpCheckResult, authorizeCurrentIp } from '../services/ipSecurityService';
import { HalloweenWatermark } from './HalloweenWatermark';

interface IpBlockedScreenProps {
  ipStatus: IpCheckResult;
  onRecheck: () => void;
  onAuthorized: (newStatus: IpCheckResult) => void;
  onOpenAdminModal?: () => void;
  showWatermark?: boolean;
}

export const IpBlockedScreen: React.FC<IpBlockedScreenProps> = ({
  ipStatus,
  onAuthorized,
  onOpenAdminModal,
  showWatermark = true
}) => {
  const [showAdminUnlock, setShowAdminUnlock] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminAuthorizeCurrentIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) return;

    setIsUnlocking(true);
    setErrorMsg('');
    try {
      const updated = await authorizeCurrentIp(
        adminPassword.trim(),
        ipStatus.clientIp,
        'IP được Admin mở khóa trực tiếp'
      );
      sessionStorage.setItem('ssc_admin_auth', 'true');
      onAuthorized(updated);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Mật khẩu quản trị không chính xác!');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-red-600 selection:text-white overflow-hidden">
      {/* Global Halloween Watermark with 2 Giant Pumpkins */}
      {showWatermark && <HalloweenWatermark />}

      <div className="relative z-10 max-w-xl w-full mx-auto">
        {/* Only the Red Alert Banner as requested */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-rose-700 border-2 border-red-500 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.35)] px-6 py-5 text-white flex items-center gap-4 animate-in zoom-in-95 duration-200">
          <div
            onClick={() => setShowAdminUnlock((prev) => !prev)}
            className="relative z-10 w-13 h-13 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner cursor-pointer"
            title="Dành cho Quản trị viên"
          >
            <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-2 py-0.5 rounded bg-black/35 text-[10px] font-mono font-bold uppercase tracking-wider text-red-100 mb-1">
              CẢNH BÁO TRUY CẬP MẠNG • 403 RESTRICTED
            </span>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              ANH CHỊ VUI LÒNG SỬ DỤNG MẠNG NỘI BỘ ĐỂ TRUY CẬP
            </h1>
          </div>
        </div>

        {/* Hidden Admin Emergency Unlock (only appears if Admin double-clicks the shield icon) */}
        {showAdminUnlock && (
          <form
            onSubmit={handleAdminAuthorizeCurrentIp}
            className="mt-3 p-4 rounded-xl bg-slate-900/95 border border-slate-800 space-y-2.5 animate-in fade-in duration-150"
          >
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Nhập mật khẩu Admin để cấp phép IP hiện tại..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-red-500"
              />
            </div>
            {errorMsg && <p className="text-[11px] font-bold text-red-400">{errorMsg}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isUnlocking || !adminPassword.trim()}
                className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isUnlocking ? 'Đang mở khóa...' : `Cấp phép IP (${ipStatus.clientIp || '...'})`}</span>
              </button>
              {onOpenAdminModal && (
                <button
                  type="button"
                  onClick={onOpenAdminModal}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Quản trị / Import IP</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
