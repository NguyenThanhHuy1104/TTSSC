import React, { useState, useRef } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Layers,
  ShieldAlert,
  Barcode,
  Bot,
  AlertTriangle,
  Star,
  Sparkles,
  Bookmark,
  Receipt,
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
  Globe,
  Share2,
  Download,
  Upload,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import {
  SystemModule,
  FEATURE_MODULES,
  CATEGORY_MODULES,
  saveHiddenModules,
  resetAllHiddenModules,
  syncHiddenModulesToServer,
  getShareableConfigUrl,
  exportConfigAsJson,
  importConfigFromJson
} from '../services/moduleService';
import botAvatarPng from '../assets/images/bot_avatar.png';

interface ModuleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  hiddenModules: string[];
  onModulesChanged: (newHidden: string[]) => void;
}

export const ModuleConfigModal: React.FC<ModuleConfigModalProps> = ({
  isOpen,
  onClose,
  hiddenModules,
  onModulesChanged
}) => {
  const [activeTab, setActiveTab] = useState<'category' | 'feature'>('category');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingServer, setIsSavingServer] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggle = (id: string, name: string) => {
    let updated: string[];
    const isCurrentlyHidden = hiddenModules.includes(id);
    if (isCurrentlyHidden) {
      updated = hiddenModules.filter((mId) => mId !== id);
      showToast(`Đã hiện lại: ${name} (Đã đồng bộ public)`);
    } else {
      updated = [...hiddenModules, id];
      showToast(`Đã ẩn: ${name} (Đã đồng bộ public)`);
    }
    saveHiddenModules(updated, true);
    onModulesChanged(updated);
  };

  const handleShowAll = (type: 'category' | 'feature') => {
    const targetModules = type === 'category' ? CATEGORY_MODULES : FEATURE_MODULES;
    const targetIds = new Set(targetModules.map((m) => m.id));
    const updated = hiddenModules.filter((id) => !targetIds.has(id));
    saveHiddenModules(updated, true);
    onModulesChanged(updated);
    showToast(`Đã hiện toàn bộ ${type === 'category' ? 'Module Nghiệp vụ' : 'Module Tính năng'}`);
  };

  const handleHideAll = (type: 'category' | 'feature') => {
    const targetModules = type === 'category' ? CATEGORY_MODULES : FEATURE_MODULES;
    const targetIds = targetModules.map((m) => m.id);
    const updated = Array.from(new Set([...hiddenModules, ...targetIds]));
    saveHiddenModules(updated, true);
    onModulesChanged(updated);
    showToast(`Đã ẩn toàn bộ ${type === 'category' ? 'Module Nghiệp vụ' : 'Module Tính năng'}`);
  };

  const handleResetAll = () => {
    resetAllHiddenModules();
    onModulesChanged([]);
    showToast('Đã khôi phục tất cả module về trạng thái hiển thị mặc định');
  };

  const handleSavePublicToServer = async () => {
    setIsSavingServer(true);
    try {
      const res = await syncHiddenModulesToServer(hiddenModules);
      if (res.success) {
        showToast(`✅ Đã lưu và xuất bản cấu hình thành công! (${hiddenModules.length} module đang ẩn cho toàn bộ khách bên ngoài)`);
      } else {
        showToast(`⚠️ ${res.message}`);
      }
    } catch {
      showToast('⚠️ Có lỗi xảy ra khi lưu cấu hình lên server');
    } finally {
      setIsSavingServer(false);
    }
  };

  const handleCopyShareLink = () => {
    const shareUrl = getShareableConfigUrl(hiddenModules);
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('🔗 Đã sao chép link chia sẻ! Người mở link này sẽ thấy đúng các module đã ẩn.');
    }).catch(() => {
      showToast('Không thể sao chép tự động, vui lòng thử lại');
    });
  };

  const handleExportJson = () => {
    exportConfigAsJson(hiddenModules);
    showToast('📥 Đã tải file ssc_module_config.json về máy tính');
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importConfigFromJson(file);
      onModulesChanged(imported);
      showToast(`📤 Đã nhập thành công cấu hình (${imported.length} module đang ẩn)`);
    } catch (err: any) {
      showToast(`❌ Lỗi nhập file: ${err?.message || 'Không hợp lệ'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getModuleIcon = (iconName?: string) => {
    switch (iconName) {
      case 'ShieldAlert': return ShieldAlert;
      case 'Barcode': return Barcode;
      case 'Bot': return Bot;
      case 'AlertTriangle': return AlertTriangle;
      case 'Star': return Star;
      case 'Sparkles': return Sparkles;
      case 'Bookmark': return Bookmark;
      case 'Receipt': return Receipt;
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
      default: return Layers;
    }
  };

  const activeModuleList = activeTab === 'category' ? CATEGORY_MODULES : FEATURE_MODULES;
  const filteredList = activeModuleList.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
  });

  const hiddenCountInCategory = CATEGORY_MODULES.filter((m) => hiddenModules.includes(m.id)).length;
  const hiddenCountInFeature = FEATURE_MODULES.filter((m) => hiddenModules.includes(m.id)).length;
  const totalHidden = hiddenModules.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Toast inside modal */}
        {toastMessage && (
          <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2.5 text-xs font-semibold text-center animate-in slide-in-from-top duration-200 flex items-center justify-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <span>QUẢN LÝ ẨN / HIỆN MODULE</span>
                {totalHidden > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white">
                    Đang ẩn {totalHidden} module
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Tất cả đang hiển thị
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tùy chỉnh bật/tắt module trên hệ thống. Cấu hình được đồng bộ tự động cho toàn bộ khách truy cập bên ngoài khi xuất bản.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Sync & Share Bar */}
        <div className="px-6 py-2.5 bg-blue-50/60 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-950 dark:text-blue-200 font-medium">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Xuất bản Public:</strong> {totalHidden > 0 ? `${totalHidden} module đang ẩn và sẽ không hiển thị với người dùng ngoài.` : 'Tất cả module đều công khai.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSavePublicToServer}
              disabled={isSavingServer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
              title="Lưu cấu hình này lên hệ thống để người dùng bên ngoài link chia sẻ luôn nhận được đúng trạng thái ẩn"
            >
              {isSavingServer ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              <span>Lưu cấu hình Public</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Sao chép link kèm tham số cấu hình ẩn"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Sao chép link chia sẻ</span>
              <span className="sm:hidden">Sao chép link</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('category')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'category'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Module Nghiệp vụ</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                {CATEGORY_MODULES.length}
              </span>
              {hiddenCountInCategory > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500 text-white">
                  Ẩn {hiddenCountInCategory}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('feature')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'feature'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Module Tính năng</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                {FEATURE_MODULES.length}
              </span>
              {hiddenCountInFeature > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500 text-white">
                  Ẩn {hiddenCountInFeature}
                </span>
              )}
            </button>
          </div>

          {/* Batch Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleShowAll(activeTab)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Hiện tất cả</span>
            </button>

            <button
              type="button"
              onClick={() => handleHideAll(activeTab)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              <span>Ẩn tất cả</span>
            </button>

            {totalHidden > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
                title="Khôi phục toàn bộ về trạng thái ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục mặc định</span>
              </button>
            )}
          </div>
        </div>

        {/* Search filter in modal */}
        <div className="px-6 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh module theo tên hoặc chức năng..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List of Modules */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredList.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Không tìm thấy module nào khớp với từ khóa "{searchQuery}"
            </div>
          ) : (
            filteredList.map((mod) => {
              const isHidden = hiddenModules.includes(mod.id);
              const IconComp = getModuleIcon(mod.iconName);

              return (
                <div
                  key={mod.id}
                  className={`py-3.5 px-3 rounded-2xl flex items-center justify-between gap-4 transition-all duration-150 ${
                    isHidden
                      ? 'bg-slate-50 dark:bg-slate-950/60 opacity-60'
                      : 'hover:bg-blue-50/40 dark:hover:bg-blue-950/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform overflow-hidden ${
                        isHidden
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          : 'bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                      }`}
                    >
                      {mod.id === 'ssc-bot' ? (
                        <img
                          src={botAvatarPng}
                          alt="SSC Bot"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <IconComp className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold truncate ${
                          isHidden ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {mod.name}
                        </h4>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isHidden
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {isHidden ? 'ĐANG ẨN (PUBLIC)' : 'HIỂN THỊ'}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400">
                          #{mod.id}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(mod.id, mod.name)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                        isHidden
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Hiện lại</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Ẩn module</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & Advanced Export/Import */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file JSON</span>
            </button>

            <label className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập file JSON</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSavePublicToServer}
              disabled={isSavingServer}
              className="px-4 py-1.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer transition-colors shadow-xs"
            >
              {isSavingServer ? 'Đang lưu...' : 'Lưu & Đóng'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 hover:opacity-90 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

