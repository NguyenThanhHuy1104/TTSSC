import React, { useState, useEffect } from 'react';
import { SheetSourceConfig, PromotionRoundKey } from '../../types';
import { PROMOTION_ROUNDS, DEFAULT_SHEET_CONFIG, parseGoogleSheetUrl, buildGoogleSheetUrl } from '../../config/sheetsConfig';
import { testSheetConnection, SheetConnectionTestResult } from '../../services/sheetService';
import {
  X,
  Settings,
  Database,
  Save,
  RotateCcw,
  HelpCircle,
  Check,
  ExternalLink,
  Link as LinkIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Copy,
  Table,
  Info
} from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SheetSourceConfig;
  onSaveConfig: (newConfig: SheetSourceConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  // Raw input can be a full URL or just the ID
  const [urlOrIdInput, setUrlOrIdInput] = useState<string>('');
  const [spreadsheetId, setSpreadsheetId] = useState<string>(config.spreadsheetId || '');
  const [gids, setGids] = useState<Record<PromotionRoundKey, string>>(config.gids || DEFAULT_SHEET_CONFIG.gids);
  const [activeTabKey, setActiveTabKey] = useState<PromotionRoundKey>('dot1');

  // Connection testing state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<SheetConnectionTestResult | null>(null);

  // Save state
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedCols, setCopiedCols] = useState<boolean>(false);
  const [showAdvancedTabs, setShowAdvancedTabs] = useState<boolean>(false);

  // Sync state when opening modal
  useEffect(() => {
    if (isOpen) {
      const currentId = config.spreadsheetId || '';
      setSpreadsheetId(currentId);
      setUrlOrIdInput(
        config.fullSheetUrl ||
          (currentId ? buildGoogleSheetUrl(currentId, config.gids?.dot1 || '0') : '')
      );
      setGids(config.gids || DEFAULT_SHEET_CONFIG.gids);
      setTestResult(null);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // Handle URL / ID Input with instant auto-parsing
  const handleUrlInputChange = (val: string) => {
    setUrlOrIdInput(val);
    const parsed = parseGoogleSheetUrl(val);
    setSpreadsheetId(parsed.spreadsheetId);

    // If a gid was found in the link, apply to the currently selected round
    if (parsed.gid !== undefined) {
      setGids((prev) => ({
        ...prev,
        [activeTabKey]: parsed.gid!
      }));
    }

    if (testResult) setTestResult(null);
  };

  const handleGidChange = (key: PromotionRoundKey, val: string) => {
    setGids((prev) => ({ ...prev, [key]: val }));
    if (testResult) setTestResult(null);
  };

  // Test Connection to verify permissions and schema
  const handleTestConnection = async () => {
    if (!spreadsheetId.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const gidToTest = gids[activeTabKey] || '0';
      const result = await testSheetConnection(spreadsheetId.trim(), gidToTest);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Lỗi kiểm tra kết nối: ${err?.message || 'Không thể kết nối'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = spreadsheetId.trim();
    const updated: SheetSourceConfig = {
      ...config,
      spreadsheetId: cleanId,
      fullSheetUrl: urlOrIdInput.trim().startsWith('http')
        ? urlOrIdInput.trim()
        : buildGoogleSheetUrl(cleanId, gids.dot1 || '0'),
      gids,
      lastSyncedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    onSaveConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  // Reset to default configuration
  const handleReset = () => {
    setSpreadsheetId(DEFAULT_SHEET_CONFIG.spreadsheetId);
    setUrlOrIdInput(buildGoogleSheetUrl(DEFAULT_SHEET_CONFIG.spreadsheetId, '0'));
    setGids(DEFAULT_SHEET_CONFIG.gids);
    setTestResult(null);
  };

  // Copy standard column headers
  const handleCopyHeaders = () => {
    const headers = 'Mã SP\tTên SP\tQuà Tặng\tMô Tả\tMốc Chi Tiêu\tĐảo\tGhi Chú';
    navigator.clipboard.writeText(headers).then(() => {
      setCopiedCols(true);
      setTimeout(() => setCopiedCols(false), 2000);
    });
  };

  const previewSheetUrl = spreadsheetId
    ? buildGoogleSheetUrl(spreadsheetId, gids[activeTabKey] || '0')
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                ĐỒNG BỘ LINK QUÀ TẶNG 12 ĐẢO
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kết nối dữ liệu Google Sheets để tự động cập nhật sản phẩm & quà tặng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Main Link Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-600" />
                <span>Đường link Google Sheets (hoặc Spreadsheet ID):</span>
              </label>

              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                title="Khôi phục liên kết mặc định"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Mặc định</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={urlOrIdInput}
                onChange={(e) => handleUrlInputChange(e.target.value)}
                placeholder="Dán link Google Sheets: https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                className="w-full h-11 px-3.5 pr-24 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-400"
              />

              {previewSheetUrl && (
                <a
                  href={previewSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-2 h-7 px-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold flex items-center gap-1 border border-cyan-200 dark:border-cyan-900 transition-colors"
                  title="Mở Google Sheets này trong tab mới"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Mở Sheet</span>
                </a>
              )}
            </div>

            {/* Auto Extracted ID Feedback */}
            {spreadsheetId ? (
              <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-slate-400">
                <span className="truncate max-w-[340px]">
                  Spreadsheet ID: <code className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{spreadsheetId}</code>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã nhận diện link
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
                Hỗ trợ dán toàn bộ đường link Google Sheet từ thanh địa chỉ trình duyệt.
              </p>
            )}
          </div>

          {/* Connection Test Action & Result */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Kiểm tra kết nối & đọc thử dữ liệu:</span>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !spreadsheetId.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-lg text-xs leading-relaxed flex items-start gap-2 border animate-in fade-in duration-150 ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.success && testResult.detectedColumns && testResult.detectedColumns.length > 0 && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      Cột nhận diện: {testResult.detectedColumns.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toggle Advanced Round GIDs */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowAdvancedTabs(!showAdvancedTabs)}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 flex items-center justify-between w-full py-1 cursor-pointer"
            >
              <span>⚙️ Cấu hình GID từng Đợt (Mã từng Tab trên Sheets):</span>
              <span className="text-[11px] text-cyan-600 font-semibold">
                {showAdvancedTabs ? 'Thu gọn ▲' : 'Mở rộng ▼'}
              </span>
            </button>

            {showAdvancedTabs && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
                {PROMOTION_ROUNDS.map((round) => (
                  <div
                    key={round.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {round.label}:
                    </span>
                    <input
                      type="text"
                      value={gids[round.tabKey] || ''}
                      onChange={(e) => handleGidChange(round.tabKey, e.target.value)}
                      placeholder="gid (vd: 0)"
                      className="w-24 h-7 px-2 text-right rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-cyan-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Standard Column Template Reference */}
          <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/60 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-950 dark:text-cyan-200 flex items-center gap-1">
                <Table className="w-3.5 h-3.5 text-cyan-600" />
                Cấu trúc các cột chuẩn trên Google Sheets:
              </span>
              <button
                type="button"
                onClick={handleCopyHeaders}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedCols ? 'Đã chép!' : 'Chép tên cột'}</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-mono text-[10px] bg-white/70 dark:bg-slate-900/70 p-1.5 rounded border border-cyan-200/60 dark:border-cyan-800/40 overflow-x-auto">
              Mã SP | Tên SP | Quà Tặng | Mô Tả | Mốc Chi Tiêu | Đảo | Ghi Chú
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              * Lưu ý: Chia sẻ bảng tính với quyền <strong>"Bất kỳ ai có đường liên kết đều có thể xem"</strong>.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/25 cursor-pointer transition-all active:scale-95"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu và đồng bộ!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu & Đồng bộ ngay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
