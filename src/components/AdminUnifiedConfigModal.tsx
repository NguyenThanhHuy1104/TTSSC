import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Save,
  FileSpreadsheet,
  Coins,
  ShieldAlert,
  Barcode,
  Link2,
  RefreshCw,
  Info,
  HelpCircle,
  Sparkles,
  Check,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Search,
  Globe,
  Wifi,
  FileText,
  Upload,
  Download,
  FolderUp,
  History,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  Sliders,
  LogOut,
  Calendar,
  Layers,
  Store,
  Radio,
  FolderDown
} from 'lucide-react';
import { ZaloIcon } from './common/ZaloIcon';
import defaultZaloImg from '../assets/images/zalo_contact.jpg';

// Services & types
import {
  ModuleVisibilityConfig,
  getModuleVisibilityConfig,
  saveModuleVisibilityConfig,
  resetModuleVisibilityConfig
} from '../services/moduleVisibilityService';
import {
  getSalaryPolicyConfig,
  saveSalaryPolicyConfig,
  clearSalaryPolicyCache,
  parseGoogleSheetUrl as parseSalarySheetUrl,
  testSalaryPolicyConnection,
  fetchSalaryPolicyConfigFromServer
} from '../services/salaryPolicyService';
import {
  getPenaltyConfig,
  savePenaltyConfig,
  clearPenaltyCache,
  fetchPenaltyConfigFromServer
} from '../services/penaltyService';
import {
  getBarcodeConfig,
  saveBarcodeConfig,
  clearBarcodeCache,
  fetchServerBarcodeHistory,
  clearBarcodeHistory,
  removeBarcodeHistoryItem,
  exportBarcodeHistoryToExcel,
  BarcodeLookupHistoryItem,
  BarcodeConfig,
  fetchBarcodeConfigFromServer
} from '../services/barcodeService';
import {
  getCommonLinksConfig,
  saveCommonLinksConfig,
  clearCommonLinksCache,
  parseGoogleSheetUrl as parseLinksSheetUrl,
  fetchCommonLinksConfigFromServer
} from '../services/commonLinksService';
import {
  getMinutesFilesConfig,
  saveMinutesFilesConfig,
  clearMinutesFilesCache
} from '../services/minutesFilesService';
import {
  IpWhitelistEntry,
  IpCheckResult,
  saveIpWhitelistConfig,
  matchIpClientSide
} from '../services/ipSecurityService';
import { SalaryPolicyConfig, PenaltyConfig, CommonLinksConfig, MinutesFilesConfig } from '../types';
import {
  SpamRule,
  SpamFilterConfig,
  getSpamFilterConfig,
  saveSpamFilterConfig,
  resetSpamFilterConfig,
  checkSpamMessage,
  fetchSpamFilterConfigFromServer
} from '../services/spamFilterService';

export type AdminMainTab = 'sheets' | 'ip' | 'history' | 'modules' | 'system';
export type AdminSheetSubTab = 'salary' | 'penalty' | 'barcode' | 'links' | 'minutes-files';

interface AdminUnifiedConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AdminMainTab | AdminSheetSubTab;
  ipStatus?: IpCheckResult;
  onIpUpdated?: (newStatus: IpCheckResult) => void;
  showWatermark?: boolean;
  onToggleWatermark?: () => void;
  onSuccessRefresh?: (tab: string) => void;
}

const ADMIN_PASSWORDS = ['3015751773', 'ssc87333'];
const AUTH_STORAGE_KEY = 'ssc_admin_unified_auth';

// Helper: check IP syntax
function isValidIpOrRuleToken(raw: string): boolean {
  const token = raw.trim();
  if (!token) return false;
  if (token === '*') return true;
  const ipv4RuleRegex =
    /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d|\*)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d|\*)(?:\/(?:[0-9]|[12]\d|3[0-2]))?$/;
  if (ipv4RuleRegex.test(token)) return true;
  const shortWildcardRegex =
    /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d|\*)){1,3}$/;
  if (token.includes('*') && shortWildcardRegex.test(token)) return true;
  if (token.includes(':') && /^[0-9a-fA-F:*\/]+$/.test(token) && token.length >= 3) {
    return true;
  }
  return false;
}

function parseTextLineToIpEntries(line: string, defaultLabel: string): { ip: string; label: string }[] {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return [];
  const lower = trimmed.toLowerCase();
  if (
    lower === 'ip' ||
    lower === 'địa chỉ ip' ||
    lower.startsWith('stt\t') ||
    lower.startsWith('stt,')
  ) {
    const hasIp = trimmed.split(/[\s,;|:\t-]+/).some((p) => isValidIpOrRuleToken(p));
    if (!hasIp) return [];
  }
  const delimiterMatch = trimmed.match(/^([^\s,;|:\t]+)\s*[-|,:;\t]\s*(.+)$/);
  if (delimiterMatch) {
    const candidateIp = delimiterMatch[1].trim();
    const candidateNote = delimiterMatch[2].trim();
    if (isValidIpOrRuleToken(candidateIp)) {
      return [{ ip: candidateIp, label: candidateNote || defaultLabel }];
    }
  }
  const parts = trimmed.split(/[\s,;\t]+/).filter(Boolean);
  const matched = parts.filter((token) => isValidIpOrRuleToken(token));
  if (matched.length > 0) {
    const remainderNote = parts.filter((t) => !isValidIpOrRuleToken(t)).join(' ').trim();
    return matched.map((ip) => ({
      ip,
      label: remainderNote || defaultLabel
    }));
  }
  return [];
}

export const AdminUnifiedConfigModal: React.FC<AdminUnifiedConfigModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'sheets',
  ipStatus,
  onIpUpdated,
  showWatermark,
  onToggleWatermark,
  onSuccessRefresh
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      (sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true' ||
        sessionStorage.getItem('ssc_admin_sheet_unlocked_v1') === 'true' ||
        sessionStorage.getItem('ssc_admin_auth') === 'true')
    );
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Tab navigation: 'sheets' | 'ip' | 'history' | 'system'
  const [mainTab, setMainTab] = useState<AdminMainTab>('sheets');
  const [sheetSubTab, setSheetSubTab] = useState<AdminSheetSubTab>('salary');

  // Sheet forms
  const [salaryForm, setSalaryForm] = useState<SalaryPolicyConfig>(getSalaryPolicyConfig());
  const [salarySheetUrlInput, setSalarySheetUrlInput] = useState<string>(salaryForm.SHEET_URL || '');
  const [penaltyForm, setPenaltyForm] = useState<PenaltyConfig>(getPenaltyConfig());
  const [penaltySheetUrlInput, setPenaltySheetUrlInput] = useState<string>(
    `https://docs.google.com/spreadsheets/d/${penaltyForm.SPREADSHEET_ID}/edit?gid=${penaltyForm.SHEET_GID}#gid=${penaltyForm.SHEET_GID}`
  );
  const [barcodeForm, setBarcodeForm] = useState<BarcodeConfig>(getBarcodeConfig());
  const [barcodeSheetUrlInput, setBarcodeSheetUrlInput] = useState<string>(
    `https://docs.google.com/spreadsheets/d/${barcodeForm.SPREADSHEET_ID}/edit?gid=${barcodeForm.SHEET_GID}#gid=${barcodeForm.SHEET_GID}`
  );
  const [linksForm, setLinksForm] = useState<CommonLinksConfig>(getCommonLinksConfig());
  const [linksSheetUrlInput, setLinksSheetUrlInput] = useState<string>(linksForm.SHEET_URL || '');
  const [minutesFilesForm, setMinutesFilesForm] = useState<MinutesFilesConfig>(getMinutesFilesConfig());
  const [minutesFilesSheetUrlInput, setMinutesFilesSheetUrlInput] = useState<string>(minutesFilesForm.SHEET_URL || '');

  // Testing & Save status
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // IP Whitelist states
  const [ipEnabled, setIpEnabled] = useState<boolean>(ipStatus?.enabled || false);
  const [ipWhitelist, setIpWhitelist] = useState<IpWhitelistEntry[]>(ipStatus?.whitelist || []);
  const [newIpInput, setNewIpInput] = useState<string>('');
  const [newLabelInput, setNewLabelInput] = useState<string>('');
  const [ipSearchFilter, setIpSearchFilter] = useState<string>('');
  const [isSavingIp, setIsSavingIp] = useState<boolean>(false);
  const [ipToastMsg, setIpToastMsg] = useState<string | null>(null);
  const [ipErrorMsg, setIpErrorMsg] = useState<string | null>(null);
  const [confirmClearAllIps, setConfirmClearAllIps] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImportingFile, setIsImportingFile] = useState<boolean>(false);

  // Barcode Lookup History state
  const [historyItems, setHistoryItems] = useState<BarcodeLookupHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historySearchFilter, setHistorySearchFilter] = useState<string>('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [historyToast, setHistoryToast] = useState<string | null>(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Module Visibility Configuration state
  const [moduleVisibility, setModuleVisibility] = useState<ModuleVisibilityConfig>(() =>
    getModuleVisibilityConfig()
  );

  // Zalo Contact Image settings (Tải ảnh & Quản lý ảnh trong Setting)
  const [zaloImg, setZaloImg] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ssc_zalo_contact_image_v5');
      if (saved) return saved;
    }
    return defaultZaloImg;
  });
  const [zaloDownloadToast, setZaloDownloadToast] = useState<boolean>(false);
  const zaloFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDownloadZaloImage = () => {
    const link = document.createElement('a');
    link.href = zaloImg;
    link.download = 'Lien_he_SSC_Zalo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setZaloDownloadToast(true);
    setTimeout(() => setZaloDownloadToast(false), 2000);
  };

  const handleZaloFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        if (result) {
          setZaloImg(result);
          localStorage.setItem('ssc_zalo_contact_image_v5', result);
          try {
            await fetch('/api/config/zalo-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: result })
            });
          } catch (err) {
            console.warn('Failed to save zalo image to server:', err);
          }
          triggerSaveStatus('Đã cập nhật ảnh Zalo và lưu vào bộ nhớ máy chủ thành công!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetZaloImage = async () => {
    localStorage.removeItem('ssc_zalo_contact_image_v5');
    setZaloImg(defaultZaloImg);
    try {
      await fetch('/api/config/zalo-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true })
      });
    } catch (err) {
      console.warn('Failed to reset zalo image on server:', err);
    }
    triggerSaveStatus('Đã khôi phục ảnh Zalo liên hệ SSC mặc định!');
  };

  // Spam Filter Configuration state
  const [spamConfig, setSpamConfig] = useState<SpamFilterConfig>(() => getSpamFilterConfig());
  const [newSpamKeyword, setNewSpamKeyword] = useState<string>('');
  const [newSpamReply, setNewSpamReply] = useState<string>('');
  const [spamSearchFilter, setSpamSearchFilter] = useState<string>('');
  const [testSpamInput, setTestSpamInput] = useState<string>('');
  const [editingDefaultReply, setEditingDefaultReply] = useState<boolean>(false);
  const [defaultReplyInput, setDefaultReplyInput] = useState<string>(spamConfig.defaultReply);

  const testSpamResult = useMemo(() => {
    if (!testSpamInput.trim()) return null;
    return checkSpamMessage(testSpamInput, spamConfig);
  }, [testSpamInput, spamConfig]);

  const handleToggleSpamFilter = () => {
    const updated: SpamFilterConfig = {
      ...spamConfig,
      enabled: !spamConfig.enabled
    };
    setSpamConfig(updated);
    saveSpamFilterConfig(updated);
    triggerSaveStatus(updated.enabled ? 'Đã bật bộ lọc từ khóa Spam!' : 'Đã tắt bộ lọc từ khóa Spam!');
  };

  const handleSaveDefaultSpamReply = () => {
    const updated: SpamFilterConfig = {
      ...spamConfig,
      defaultReply: defaultReplyInput.trim()
    };
    setSpamConfig(updated);
    saveSpamFilterConfig(updated);
    setEditingDefaultReply(false);
    triggerSaveStatus('Đã cập nhật kịch bản phản hồi spam mặc định!');
  };

  const handleAddSpamKeyword = () => {
    const raw = newSpamKeyword.trim();
    if (!raw) return;

    // Support comma, semicolon, or newline separated keywords
    const keywordsToAdd = raw
      .split(/[\n,;]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywordsToAdd.length === 0) return;

    const existingKws = new Set(spamConfig.rules.map((r) => r.keyword.toLowerCase()));
    const newRules: SpamRule[] = [];

    keywordsToAdd.forEach((kw, idx) => {
      if (!existingKws.has(kw.toLowerCase())) {
        newRules.push({
          id: `spam-${Date.now()}-${idx}`,
          keyword: kw,
          customReply: newSpamReply.trim() || undefined,
          enabled: true,
          createdAt: Date.now()
        });
        existingKws.add(kw.toLowerCase());
      }
    });

    if (newRules.length === 0) {
      triggerSaveStatus('Từ khóa này đã tồn tại trong danh sách!');
      return;
    }

    const updated: SpamFilterConfig = {
      ...spamConfig,
      rules: [...newRules, ...spamConfig.rules]
    };
    setSpamConfig(updated);
    saveSpamFilterConfig(updated);
    setNewSpamKeyword('');
    setNewSpamReply('');
    triggerSaveStatus(`Đã thêm ${newRules.length} từ khóa spam mới!`);
  };

  const handleToggleSpamRule = (id: string) => {
    const updated: SpamFilterConfig = {
      ...spamConfig,
      rules: spamConfig.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    };
    setSpamConfig(updated);
    saveSpamFilterConfig(updated);
  };

  const handleDeleteSpamRule = (id: string) => {
    const updated: SpamFilterConfig = {
      ...spamConfig,
      rules: spamConfig.rules.filter((r) => r.id !== id)
    };
    setSpamConfig(updated);
    saveSpamFilterConfig(updated);
    triggerSaveStatus('Đã xóa từ khóa spam khỏi danh sách!');
  };

  const handleResetSpamConfig = () => {
    const def = resetSpamFilterConfig();
    setSpamConfig(def);
    setDefaultReplyInput(def.defaultReply);
    triggerSaveStatus('Đã khôi phục bộ lọc từ khóa Spam về mặc định!');
  };

  // Initialize and route tabs
  useEffect(() => {
    if (isOpen) {
      // Determine target main tab and sub tab from initialTab
      if (initialTab === 'ip') {
        setMainTab('ip');
      } else if (initialTab === 'history') {
        setMainTab('history');
      } else if (initialTab === 'modules') {
        setMainTab('modules');
      } else if (initialTab === 'system') {
        setMainTab('system');
      } else if (
        initialTab === 'salary' ||
        initialTab === 'penalty' ||
        initialTab === 'barcode' ||
        initialTab === 'links'
      ) {
        setMainTab('sheets');
        setSheetSubTab(initialTab);
      } else {
        setMainTab('sheets');
      }

      setModuleVisibility(getModuleVisibilityConfig());

      // Reload fresh configurations
      const curSalary = getSalaryPolicyConfig();
      setSalaryForm(curSalary);
      setSalarySheetUrlInput(curSalary.SHEET_URL || '');

      const curPenalty = getPenaltyConfig();
      setPenaltyForm(curPenalty);
      setPenaltySheetUrlInput(
        `https://docs.google.com/spreadsheets/d/${curPenalty.SPREADSHEET_ID}/edit?gid=${curPenalty.SHEET_GID}#gid=${curPenalty.SHEET_GID}`
      );

      const curBarcode = getBarcodeConfig();
      setBarcodeForm(curBarcode);
      setBarcodeSheetUrlInput(
        `https://docs.google.com/spreadsheets/d/${curBarcode.SPREADSHEET_ID}/edit?gid=${curBarcode.SHEET_GID}#gid=${curBarcode.SHEET_GID}`
      );

      const curLinks = getCommonLinksConfig();
      setLinksForm(curLinks);
      setLinksSheetUrlInput(curLinks.SHEET_URL || '');

      // Refresh latest persisted configs from server
      fetchSpamFilterConfigFromServer().then((cfg) => {
        if (cfg) {
          setSpamConfig(cfg);
          setDefaultReplyInput(cfg.defaultReply);
        }
      });
      fetchSalaryPolicyConfigFromServer().then((cfg) => {
        if (cfg) {
          setSalaryForm(cfg);
          if (cfg.SHEET_URL) setSalarySheetUrlInput(cfg.SHEET_URL);
        }
      });
      fetchPenaltyConfigFromServer().then((cfg) => {
        if (cfg) {
          setPenaltyForm(cfg);
          if (cfg.SHEET_URL) setPenaltySheetUrlInput(cfg.SHEET_URL);
        }
      });
      fetchBarcodeConfigFromServer().then((cfg) => {
        if (cfg) {
          setBarcodeForm(cfg);
          if (cfg.SHEET_URL) setBarcodeSheetUrlInput(cfg.SHEET_URL);
        }
      });
      fetchCommonLinksConfigFromServer().then((cfg) => {
        if (cfg) {
          setLinksForm(cfg);
          if (cfg.SHEET_URL) setLinksSheetUrlInput(cfg.SHEET_URL);
        }
      });

      if (ipStatus) {
        setIpEnabled(ipStatus.enabled);
        setIpWhitelist(ipStatus.whitelist || []);
      }

      // Load barcode search logs
      loadBarcodeLogs();

      setAuthError('');
      setSaveStatus(null);
      setTestResult(null);
    }
  }, [isOpen, initialTab, ipStatus]);

  const loadBarcodeLogs = async () => {
    setIsLoadingHistory(true);
    try {
      const logs = await fetchServerBarcodeHistory();
      setHistoryItems(logs || []);
    } catch {
      // fallback
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Memoized filters for IP and History
  const filteredIps = useMemo(() => {
    if (!ipSearchFilter.trim()) return ipWhitelist;
    const q = ipSearchFilter.toLowerCase();
    return ipWhitelist.filter(
      (item) => item.ip.toLowerCase().includes(q) || (item.label && item.label.toLowerCase().includes(q))
    );
  }, [ipWhitelist, ipSearchFilter]);

  const filteredHistory = useMemo(() => {
    let list = historyItems;
    if (historyStatusFilter === 'success') {
      list = list.filter((i) => i.status === 'success');
    } else if (historyStatusFilter === 'failed') {
      list = list.filter((i) => i.status === 'failed');
    }

    if (historySearchFilter.trim()) {
      const q = historySearchFilter.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.productCode.toLowerCase().includes(q) ||
          (i.barcode && i.barcode.toLowerCase().includes(q)) ||
          (i.productName && i.productName.toLowerCase().includes(q)) ||
          (i.clientIp && i.clientIp.toLowerCase().includes(q)) ||
          (i.message && i.message.toLowerCase().includes(q))
      );
    }
    return list;
  }, [historyItems, historyStatusFilter, historySearchFilter]);

  const historyStats = useMemo(() => {
    const total = historyItems.length;
    const successCount = historyItems.filter((i) => i.status === 'success').length;
    const failedCount = historyItems.filter((i) => i.status === 'failed').length;
    const uniqueIps = new Set(historyItems.map((i) => i.clientIp).filter(Boolean)).size;
    return { total, successCount, failedCount, uniqueIps };
  }, [historyItems]);
  const handleAuthSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = passwordInput.trim();
    if (ADMIN_PASSWORDS.includes(entered)) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      sessionStorage.setItem('ssc_admin_sheet_unlocked_v1', 'true');
      sessionStorage.setItem('ssc_admin_auth', 'true');
      localStorage.setItem('ssc_admin_auth', 'true');
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Mật khẩu quản trị không chính xác. Vui lòng thử lại!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('ssc_admin_sheet_unlocked_v1');
    sessionStorage.removeItem('ssc_admin_auth');
  };

  // Toast helpers
  const triggerSaveStatus = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const triggerIpToast = (msg: string) => {
    setIpToastMsg(msg);
    setTimeout(() => setIpToastMsg(null), 4000);
  };

  const triggerHistoryToast = (msg: string) => {
    setHistoryToast(msg);
    setTimeout(() => setHistoryToast(null), 4000);
  };

  // ==========================================
  // SHEET CONFIG HANDLERS
  // ==========================================
  const handleSalaryUrlChange = (val: string) => {
    setSalarySheetUrlInput(val);
    const parsed = parseSalarySheetUrl(val);
    if (parsed.spreadsheetId) {
      setSalaryForm((prev) => ({
        ...prev,
        SPREADSHEET_ID: parsed.spreadsheetId,
        SHEET_GID: parsed.gid || prev.SHEET_GID,
        SHEET_URL: val
      }));
    }
  };

  const handlePenaltyUrlChange = (val: string) => {
    setPenaltySheetUrlInput(val);
    const matchId = val.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const matchGid = val.match(/[?&]gid=([0-9]+)/);
    if (matchId && matchId[1]) {
      setPenaltyForm((prev) => ({
        ...prev,
        SPREADSHEET_ID: matchId[1],
        SHEET_GID: matchGid && matchGid[1] ? matchGid[1] : prev.SHEET_GID
      }));
    }
  };

  const handleBarcodeUrlChange = (val: string) => {
    setBarcodeSheetUrlInput(val);
    const matchId = val.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const matchGid = val.match(/[?&]gid=([0-9]+)/);
    if (matchId && matchId[1]) {
      setBarcodeForm((prev) => ({
        ...prev,
        SPREADSHEET_ID: matchId[1],
        SHEET_GID: matchGid && matchGid[1] ? matchGid[1] : prev.SHEET_GID
      }));
    }
  };

  const handleLinksUrlChange = (val: string) => {
    setLinksSheetUrlInput(val);
    const parsed = parseLinksSheetUrl(val);
    if (parsed.spreadsheetId) {
      setLinksForm((prev) => ({
        ...prev,
        SPREADSHEET_ID: parsed.spreadsheetId,
        SHEET_GID: parsed.gid || prev.SHEET_GID,
        SHEET_URL: val
      }));
    }
  };

  const handleMinutesFilesUrlChange = (val: string) => {
    setMinutesFilesSheetUrlInput(val);
    const parsed = parseLinksSheetUrl(val);
    if (parsed.spreadsheetId) {
      setMinutesFilesForm((prev) => ({
        ...prev,
        SPREADSHEET_ID: parsed.spreadsheetId,
        SHEET_GID: parsed.gid || prev.SHEET_GID,
        SHEET_URL: val
      }));
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      if (sheetSubTab === 'salary') {
        const res = await testSalaryPolicyConnection(salaryForm);
        setTestResult({
          success: res.success,
          message: res.success
            ? `Kết nối thành công! Tìm thấy ${res.rowCount} dòng dữ liệu chính sách.`
            : res.message || 'Không thể kết nối đến Google Sheet Lương thưởng.'
        });
      } else {
        const targetId =
          sheetSubTab === 'penalty'
            ? penaltyForm.SPREADSHEET_ID
            : sheetSubTab === 'barcode'
            ? barcodeForm.SPREADSHEET_ID
            : sheetSubTab === 'links'
            ? linksForm.SPREADSHEET_ID
            : minutesFilesForm.SPREADSHEET_ID;
        const targetGid =
          sheetSubTab === 'penalty'
            ? penaltyForm.SHEET_GID
            : sheetSubTab === 'barcode'
            ? barcodeForm.SHEET_GID
            : sheetSubTab === 'links'
            ? linksForm.SHEET_GID
            : minutesFilesForm.SHEET_GID;

        const url = `https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:json&gid=${targetGid}&headers=1&t=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const text = await res.text();
        if (text.includes('google.visualization.Query.setResponse')) {
          setTestResult({
            success: true,
            message: 'Kết nối Google Sheet thành công và hợp lệ!'
          });
        } else {
          throw new Error('Dữ liệu trả về không đúng định dạng Google Visualization.');
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Lỗi kết nối: ${err.message || 'Vui lòng kiểm tra quyền chia sẻ "Bất kỳ ai có liên kết".'}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveActiveSheet = () => {
    if (sheetSubTab === 'salary') {
      saveSalaryPolicyConfig(salaryForm);
      clearSalaryPolicyCache();
      triggerSaveStatus('Đã lưu cấu hình Chính sách Lương thưởng thành công!');
    } else if (sheetSubTab === 'penalty') {
      savePenaltyConfig(penaltyForm);
      clearPenaltyCache();
      triggerSaveStatus('Đã lưu cấu hình Quy định Vi phạm thành công!');
    } else if (sheetSubTab === 'barcode') {
      saveBarcodeConfig(barcodeForm);
      clearBarcodeCache();
      triggerSaveStatus('Đã lưu cấu hình Tra cứu Barcode thành công!');
    } else if (sheetSubTab === 'links') {
      saveCommonLinksConfig(linksForm);
      clearCommonLinksCache();
      triggerSaveStatus('Đã lưu cấu hình Liên kết thường dùng thành công!');
    } else if (sheetSubTab === 'minutes-files') {
      saveMinutesFilesConfig(minutesFilesForm);
      clearMinutesFilesCache();
      triggerSaveStatus('Đã lưu cấu hình Biên bản & File thành công!');
    }
    if (onSuccessRefresh) onSuccessRefresh(sheetSubTab);
  };

  // ==========================================
  // IP SECURITY HANDLERS
  // ==========================================
  const currentClientIp = ipStatus?.clientIp || '127.0.0.1';
  const isCurrentIpInList = ipWhitelist.some((item) => matchIpClientSide(currentClientIp, item.ip));

  const handleSaveIpConfig = async (
    overrideEnabled?: boolean,
    overrideList?: IpWhitelistEntry[],
    customSuccessToast?: string
  ) => {
    const targetEnabled = overrideEnabled !== undefined ? overrideEnabled : ipEnabled;
    let targetList = overrideList !== undefined ? overrideList : ipWhitelist;

    if (
      targetEnabled &&
      currentClientIp &&
      !targetList.some((item) => matchIpClientSide(currentClientIp, item.ip))
    ) {
      const autoEntry: IpWhitelistEntry = {
        id: `ip-${Date.now()}`,
        ip: currentClientIp,
        label: 'IP Quản trị viên (Tự động thêm để tránh khóa máy)',
        createdAt: new Date().toISOString()
      };
      targetList = [autoEntry, ...targetList];
      setIpWhitelist(targetList);
    }

    setIsSavingIp(true);
    setIpErrorMsg(null);
    try {
      const updated = await saveIpWhitelistConfig(
        ADMIN_PASSWORDS[0],
        targetEnabled,
        targetList,
        currentClientIp
      );
      setIpEnabled(updated.enabled);
      setIpWhitelist(updated.whitelist || []);
      if (onIpUpdated) onIpUpdated(updated);
      triggerIpToast(customSuccessToast || 'Đã lưu cấu hình bảo mật IP thành công!');
    } catch (err: any) {
      setIpErrorMsg(err.message || 'Lỗi khi lưu cấu hình IP');
    } finally {
      setIsSavingIp(false);
    }
  };

  const handleAddManualIp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = newIpInput.trim();
    if (!cleanIp) return;
    if (!isValidIpOrRuleToken(cleanIp)) {
      setIpErrorMsg('Địa chỉ IP không đúng định dạng (VD: 113.161.72.10, 113.161.72.*, 192.168.1.0/24)');
      return;
    }
    if (ipWhitelist.some((i) => i.ip.toLowerCase() === cleanIp.toLowerCase())) {
      setIpErrorMsg('Địa chỉ IP này đã có trong danh sách!');
      return;
    }

    const newEntry: IpWhitelistEntry = {
      id: `ip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ip: cleanIp,
      label: newLabelInput.trim() || 'IP Quản trị thêm thủ công',
      createdAt: new Date().toISOString()
    };

    const updated = [newEntry, ...ipWhitelist];
    setIpWhitelist(updated);
    setNewIpInput('');
    setNewLabelInput('');
    setIpErrorMsg(null);
    handleSaveIpConfig(ipEnabled, updated, `Đã thêm IP "${cleanIp}" thành công!`);
  };

  const handleAddCurrentIpQuick = () => {
    if (!currentClientIp || isCurrentIpInList) return;
    const newEntry: IpWhitelistEntry = {
      id: `ip-${Date.now()}`,
      ip: currentClientIp,
      label: 'IP thiết bị Admin hiện tại',
      createdAt: new Date().toISOString()
    };
    const updated = [newEntry, ...ipWhitelist];
    setIpWhitelist(updated);
    handleSaveIpConfig(ipEnabled, updated, `Đã thêm IP hiện tại (${currentClientIp}) vào danh sách!`);
  };

  const handleDeleteIp = (id: string, ip: string) => {
    const updated = ipWhitelist.filter((item) => item.id !== id);
    setIpWhitelist(updated);
    handleSaveIpConfig(ipEnabled, updated, `Đã xóa IP "${ip}" khỏi danh sách!`);
  };

  const handleClearAllIps = () => {
    setIpWhitelist([]);
    setConfirmClearAllIps(false);
    handleSaveIpConfig(ipEnabled, [], 'Đã xóa toàn bộ danh sách IP!');
  };

  // File import for IP
  const handleImportIpFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingFile(true);
    setIpErrorMsg(null);
    try {
      let importedEntries: { ip: string; label: string }[] = [];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        jsonData.forEach((row) => {
          if (Array.isArray(row)) {
            const lineStr = row.map((c) => String(c || '').trim()).join(' - ');
            const found = parseTextLineToIpEntries(lineStr, `Nhập từ file ${file.name}`);
            importedEntries.push(...found);
          }
        });
      } else {
        const text = await file.text();
        const lines = text.split(/\r?\n/);
        lines.forEach((line) => {
          const found = parseTextLineToIpEntries(line, `Nhập từ file ${file.name}`);
          importedEntries.push(...found);
        });
      }

      // Deduplicate
      const seen = new Set<string>();
      ipWhitelist.forEach((i) => seen.add(i.ip.toLowerCase()));
      const validNewEntries: IpWhitelistEntry[] = [];
      importedEntries.forEach((entry) => {
        const key = entry.ip.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          validNewEntries.push({
            id: `ip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ip: entry.ip,
            label: entry.label,
            createdAt: new Date().toISOString()
          });
        }
      });

      if (validNewEntries.length === 0) {
        setIpErrorMsg('Không tìm thấy địa chỉ IP hợp lệ mới trong file hoặc tất cả đã tồn tại.');
      } else {
        const merged = [...validNewEntries, ...ipWhitelist];
        setIpWhitelist(merged);
        await handleSaveIpConfig(
          ipEnabled,
          merged,
          `Đã nhập thành công ${validNewEntries.length} địa chỉ IP từ file!`
        );
      }
    } catch (err: any) {
      setIpErrorMsg(`Lỗi đọc file: ${err.message || 'File không hợp lệ'}`);
    } finally {
      setIsImportingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportIpsToExcel = () => {
    try {
      const rows = ipWhitelist.map((item, idx) => ({
        STT: idx + 1,
        'Địa chỉ IP': item.ip,
        'Ghi chú / Vị trí': item.label,
        'Thời gian thêm': item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 35 }, { wch: 20 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DanhSachIP');
      XLSX.writeFile(wb, `Danh_Sach_IP_Whitelist_${new Date().toISOString().slice(0, 10)}.xlsx`);
      triggerIpToast('Đã tải xuống file Excel danh sách IP!');
    } catch (err: any) {
      alert('Không thể xuất file Excel: ' + err.message);
    }
  };

  const handleExportHistoryExcel = async () => {
    setIsExportingExcel(true);
    try {
      await exportBarcodeHistoryToExcel(filteredHistory.length > 0 ? filteredHistory : historyItems);
      triggerHistoryToast('Đã xuất file Excel lịch sử tra cứu Barcode thành công!');
    } catch (err: any) {
      alert('Lỗi xuất Excel: ' + err.message);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleDeleteHistoryItem = (idOrCode: string) => {
    const updated = removeBarcodeHistoryItem(idOrCode);
    setHistoryItems(updated);
    triggerHistoryToast('Đã xóa 1 mục lịch sử');
  };

  const handleClearHistoryKeepAdmin = () => {
    const remaining = clearBarcodeHistory(true);
    setHistoryItems(remaining);
    setConfirmClearHistory(false);
    triggerHistoryToast('Đã xóa lịch sử tra cứu của người dùng, giữ lại lịch sử của Admin!');
  };

  const handleClearAllHistory = () => {
    clearBarcodeHistory(false);
    setHistoryItems([]);
    setConfirmClearHistory(false);
    triggerHistoryToast('Đã xóa toàn bộ lịch sử tra cứu Barcode!');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Module visibility handlers
  const handleToggleModuleVisibility = (key: keyof ModuleVisibilityConfig) => {
    const updated = {
      ...moduleVisibility,
      [key]: !moduleVisibility[key]
    };
    setModuleVisibility(updated);
    saveModuleVisibilityConfig(updated);
    triggerSaveStatus('Đã cập nhật trạng thái hiển thị module ngoài giao diện!');
  };

  const handleSetOnlyViPhamAndBarcode = () => {
    const defaultVisible: ModuleVisibilityConfig = {
      'luong-thuong': false,
      'luong-thuong-thuoc': false,
      'luong-thuong-ve-tinh': false,
      'vi-pham': false,
      'barcode': true,
      'links': true,
      'minutes-files': true
    };
    setModuleVisibility(defaultVisible);
    saveModuleVisibilityConfig(defaultVisible);
    triggerSaveStatus('Đã đặt cấu hình mặc định (Barcode, Danh sách link, Biên bản & File)!');
  };

  const handleShowAllModules = () => {
    const showAll: ModuleVisibilityConfig = {
      'luong-thuong': true,
      'luong-thuong-thuoc': true,
      'luong-thuong-ve-tinh': true,
      'vi-pham': true,
      'barcode': true,
      'links': true,
      'minutes-files': true
    };
    setModuleVisibility(showAll);
    saveModuleVisibilityConfig(showAll);
    triggerSaveStatus('Đã bật hiển thị tất cả các module!');
  };

  const handleResetModuleVisibility = () => {
    const reset = resetModuleVisibilityConfig();
    setModuleVisibility(reset);
    triggerSaveStatus('Đã khôi phục thiết lập hiển thị mặc định (Vi phạm & Barcode)!');
  };

  // ==========================================
  // RENDER (Evaluated ONLY after ALL hooks have executed)
  // ==========================================
  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Quản Trị Hệ Thống SSC
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Cấu hình Google Sheet, Whitelist IP & Lịch sử tra cứu
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mật khẩu Quản trị viên
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  autoFocus
                  placeholder="Nhập mật khẩu quản trị viên..."
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <p className="mt-2 text-xs font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Mở khóa Quản trị</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: UNIFIED ADMIN CONTROL CENTER
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Trung Tâm Cấu Hình & Quản Trị SSC
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  <Check className="w-3 h-3" /> Đã xác thực
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gom chung quản lý Google Sheet, Bảo mật IP và Lịch sử tra cứu Barcode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Khóa lại"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Khóa lại</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setMainTab('sheets')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainTab === 'sheets'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. Cấu hình Google Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('ip')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainTab === 'ip'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Quản lý Bảo mật IP</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                ipEnabled
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {ipWhitelist.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainTab('history');
              loadBarcodeLogs();
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>3. Lịch sử tra cứu Barcode</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
              {historyItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('modules')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainTab === 'modules'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. Quản lý Module (Ẩn / Hiện)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
              Show/Hide
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('system')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              mainTab === 'system'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>5. Cấu hình Hệ thống (Spam, Zalo, Nền)</span>
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: GOOGLE SHEET CONFIGURATION */}
          {/* ========================================================= */}
          {mainTab === 'sheets' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Module Sub-tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSheetSubTab('salary');
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    sheetSubTab === 'salary'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Coins className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs truncate">Chính sách Lương</div>
                    <div className="text-[10px] opacity-70">ID & Ảnh Drive</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSheetSubTab('penalty');
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    sheetSubTab === 'penalty'
                      ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs truncate">Quy định Vi phạm</div>
                    <div className="text-[10px] opacity-70">Khung chế tài</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSheetSubTab('barcode');
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    sheetSubTab === 'barcode'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Barcode className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs truncate">Tra cứu Barcode</div>
                    <div className="text-[10px] opacity-70">Mã vạch & Tên SP</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSheetSubTab('links');
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    sheetSubTab === 'links'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Link2 className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs truncate">Liên kết hữu ích</div>
                    <div className="text-[10px] opacity-70">Hệ thống & Danh mục</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSheetSubTab('minutes-files');
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    sheetSubTab === 'minutes-files'
                      ? 'border-blue-600 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <FolderDown className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs truncate">Biên bản &amp; File</div>
                    <div className="text-[10px] opacity-70">Đồng bộ Sheet tài liệu</div>
                  </div>
                </button>
              </div>

              {/* Sheet URL & ID Form for Active SubTab */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>
                      {sheetSubTab === 'salary'
                        ? 'Google Sheet Chính sách Lương thưởng'
                        : sheetSubTab === 'penalty'
                        ? 'Google Sheet Quy định Chế tài Vi phạm'
                        : sheetSubTab === 'barcode'
                        ? 'Google Sheet Dữ liệu Mã vạch Barcode'
                        : sheetSubTab === 'links'
                        ? 'Google Sheet Liên kết Thường dùng'
                        : 'Google Sheet Biên bản & File Tài liệu'}
                    </span>
                  </h3>
                  <a
                    href={
                      sheetSubTab === 'salary'
                        ? `https://docs.google.com/spreadsheets/d/${salaryForm.SPREADSHEET_ID}/edit`
                        : sheetSubTab === 'penalty'
                        ? `https://docs.google.com/spreadsheets/d/${penaltyForm.SPREADSHEET_ID}/edit`
                        : sheetSubTab === 'barcode'
                        ? `https://docs.google.com/spreadsheets/d/${barcodeForm.SPREADSHEET_ID}/edit`
                        : sheetSubTab === 'links'
                        ? `https://docs.google.com/spreadsheets/d/${linksForm.SPREADSHEET_ID}/edit`
                        : `https://docs.google.com/spreadsheets/d/${minutesFilesForm.SPREADSHEET_ID}/edit`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    <span>Mở Sheet trực tiếp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dán toàn bộ đường dẫn Google Sheet (Khuyên dùng)
                  </label>
                  <input
                    type="url"
                    value={
                      sheetSubTab === 'salary'
                        ? salarySheetUrlInput
                        : sheetSubTab === 'penalty'
                        ? penaltySheetUrlInput
                        : sheetSubTab === 'barcode'
                        ? barcodeSheetUrlInput
                        : sheetSubTab === 'links'
                        ? linksSheetUrlInput
                        : minutesFilesSheetUrlInput
                    }
                    onChange={(e) => {
                      if (sheetSubTab === 'salary') handleSalaryUrlChange(e.target.value);
                      else if (sheetSubTab === 'penalty') handlePenaltyUrlChange(e.target.value);
                      else if (sheetSubTab === 'barcode') handleBarcodeUrlChange(e.target.value);
                      else if (sheetSubTab === 'links') handleLinksUrlChange(e.target.value);
                      else handleMinutesFilesUrlChange(e.target.value);
                    }}
                    placeholder="https://docs.google.com/spreadsheets/d/1.../edit?gid=0#gid=0"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Hệ thống sẽ tự động tách Spreadsheet ID và GID trang tính từ link này.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={
                        sheetSubTab === 'salary'
                          ? salaryForm.SPREADSHEET_ID
                          : sheetSubTab === 'penalty'
                          ? penaltyForm.SPREADSHEET_ID
                          : sheetSubTab === 'barcode'
                          ? barcodeForm.SPREADSHEET_ID
                          : sheetSubTab === 'links'
                          ? linksForm.SPREADSHEET_ID
                          : minutesFilesForm.SPREADSHEET_ID
                      }
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        if (sheetSubTab === 'salary')
                          setSalaryForm((p) => ({ ...p, SPREADSHEET_ID: val }));
                        else if (sheetSubTab === 'penalty')
                          setPenaltyForm((p) => ({ ...p, SPREADSHEET_ID: val }));
                        else if (sheetSubTab === 'barcode')
                          setBarcodeForm((p) => ({ ...p, SPREADSHEET_ID: val }));
                        else if (sheetSubTab === 'links')
                          setLinksForm((p) => ({ ...p, SPREADSHEET_ID: val }));
                        else setMinutesFilesForm((p) => ({ ...p, SPREADSHEET_ID: val }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sheet GID
                    </label>
                    <input
                      type="text"
                      value={
                        sheetSubTab === 'salary'
                          ? salaryForm.SHEET_GID
                          : sheetSubTab === 'penalty'
                          ? penaltyForm.SHEET_GID
                          : sheetSubTab === 'barcode'
                          ? barcodeForm.SHEET_GID
                          : sheetSubTab === 'links'
                          ? linksForm.SHEET_GID
                          : minutesFilesForm.SHEET_GID
                      }
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        if (sheetSubTab === 'salary') setSalaryForm((p) => ({ ...p, SHEET_GID: val }));
                        else if (sheetSubTab === 'penalty')
                          setPenaltyForm((p) => ({ ...p, SHEET_GID: val }));
                        else if (sheetSubTab === 'barcode')
                          setBarcodeForm((p) => ({ ...p, SHEET_GID: val }));
                        else if (sheetSubTab === 'links')
                          setLinksForm((p) => ({ ...p, SHEET_GID: val }));
                        else setMinutesFilesForm((p) => ({ ...p, SHEET_GID: val }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Connection Test Result */}
                {testResult && (
                  <div
                    className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* Save Feedback */}
                {saveStatus && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{saveStatus}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                    <span>{testingConnection ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối Sheet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveActiveSheet}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu Hình Tab Hiện Tại</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: IP WHITELIST & SECURITY */}
          {/* ========================================================= */}
          {mainTab === 'ip' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Protection Mode Toggle */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Chế độ Giới hạn Truy cập IP (Whitelist)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Khi bật, chỉ các thiết bị có địa chỉ IP trong danh sách dưới đây mới truy cập được vào hệ thống SSC.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      ipEnabled
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {ipEnabled ? 'ĐANG BẬT BẢO VỆ' : 'ĐANG TẮT (Cho phép mọi IP)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !ipEnabled;
                      setIpEnabled(next);
                      handleSaveIpConfig(next, ipWhitelist, `Đã ${next ? 'BẬT' : 'TẮT'} chế độ giới hạn IP!`);
                    }}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                      ipEnabled
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25'
                    }`}
                  >
                    {ipEnabled ? 'Tắt bảo vệ' : 'Bật bảo vệ ngay'}
                  </button>
                </div>
              </div>

              {/* Current Visitor IP Banner */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600 dark:text-slate-300">IP thiết bị của bạn hiện tại:</span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-sm">
                    {currentClientIp}
                  </span>
                  {isCurrentIpInList ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      ✓ Đã có trong danh sách
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                      Chưa thêm
                    </span>
                  )}
                </div>

                {!isCurrentIpInList && (
                  <button
                    type="button"
                    onClick={handleAddCurrentIpQuick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cấp phép IP này</span>
                  </button>
                )}
              </div>

              {/* Add New IP Form */}
              <form
                onSubmit={handleAddManualIp}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Thêm địa chỉ IP / Dải mạng mới</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={newIpInput}
                      onChange={(e) => {
                        setNewIpInput(e.target.value);
                        setIpErrorMsg(null);
                      }}
                      placeholder="VD: 113.161.72.10 hoặc 113.161.72.*"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={newLabelInput}
                      onChange={(e) => setNewLabelInput(e.target.value)}
                      placeholder="Ghi chú vị trí (VD: Văn phòng SSC, Kho Q7...)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isSavingIp || !newIpInput.trim()}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm IP</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Import / Export & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ipSearchFilter}
                    onChange={(e) => setIpSearchFilter(e.target.value)}
                    placeholder="Tìm kiếm IP hoặc ghi chú..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportIpFile}
                    accept=".xlsx,.xls,.csv,.txt"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingFile}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                    title="Nhập danh sách từ Excel (.xlsx) hoặc Text (.txt)"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isImportingFile ? 'Đang nhập...' : 'Nhập file Excel/Txt'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportIpsToExcel}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                    title="Tải danh sách IP về máy tính"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Excel</span>
                  </button>

                  {ipWhitelist.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmClearAllIps(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa hết</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm Clear All IP Modal */}
              {confirmClearAllIps && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>Bạn có chắc chắn muốn xóa TẤT CẢ các địa chỉ IP trong danh sách không?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmClearAllIps(false)}
                      className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllIps}
                      className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold"
                    >
                      Đồng ý xóa
                    </button>
                  </div>
                </div>
              )}

              {/* Feedbacks */}
              {ipToastMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{ipToastMsg}</span>
                </div>
              )}
              {ipErrorMsg && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{ipErrorMsg}</span>
                </div>
              )}

              {/* IP Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3">Địa chỉ IP / Quy tắc</th>
                        <th className="py-2.5 px-3">Ghi chú / Vị trí</th>
                        <th className="py-2.5 px-3 w-28 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredIps.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            {ipSearchFilter ? 'Không tìm thấy IP khớp với từ khóa.' : 'Chưa có địa chỉ IP nào trong danh sách whitelist.'}
                          </td>
                        </tr>
                      ) : (
                        filteredIps.map((item, idx) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                              {item.ip}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                              {item.label || '---'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteIp(item.id, item.ip)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Xóa IP này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: BARCODE LOOKUP HISTORY (XEM TRỰC TIẾP TRÊN WEB) */}
          {/* ========================================================= */}
          {mainTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Summary Stats Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                  <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Tổng lượt tra cứu
                  </div>
                  <div className="text-2xl font-black text-blue-950 dark:text-blue-100 mt-1">
                    {historyStats.total}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Thành công (Tìm thấy)
                  </div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    {historyStats.successCount}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                  <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                    Thất bại (Không có)
                  </div>
                  <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                    {historyStats.failedCount}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40">
                  <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Số IP truy cập khác nhau
                  </div>
                  <div className="text-2xl font-black text-purple-900 dark:text-purple-300 mt-1">
                    {historyStats.uniqueIps}
                  </div>
                </div>
              </div>

              {/* Toolbar: Search, Status Filter, Export Excel & Clear */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={historySearchFilter}
                      onChange={(e) => setHistorySearchFilter(e.target.value)}
                      placeholder="Tìm theo Mã SP, Barcode, Tên SP, IP..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setHistoryStatusFilter('all')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                        historyStatusFilter === 'all'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Tất cả ({historyItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryStatusFilter('success')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                        historyStatusFilter === 'success'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-emerald-600'
                      }`}
                    >
                      Thành công ({historyStats.successCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryStatusFilter('failed')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                        historyStatusFilter === 'failed'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-rose-600'
                      }`}
                    >
                      Thất bại ({historyStats.failedCount})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadBarcodeLogs}
                    disabled={isLoadingHistory}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                    title="Tải lại lịch sử mới nhất"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportHistoryExcel}
                    disabled={isExportingExcel || historyItems.length === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExportingExcel ? 'Đang xuất file...' : 'Tải File Excel (.xlsx)'}</span>
                  </button>

                  {historyItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmClearHistory(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa lịch sử</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm Clear History */}
              {confirmClearHistory && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Lựa chọn xóa lịch sử tra cứu:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmClearHistory(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleClearHistoryKeepAdmin}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-sm"
                      title="Xóa lịch sử tra cứu, chỉ giữ lại các lượt tra cứu của Admin"
                    >
                      Xóa (Để lại lịch sử Admin)
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                      title="Xóa tất cả không ngoại lệ"
                    >
                      Xóa toàn bộ
                    </button>
                  </div>
                </div>
              )}

              {/* Toast Feedback */}
              {historyToast && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{historyToast}</span>
                </div>
              )}

              {/* Main History Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3 min-w-[150px]">Thời gian</th>
                        <th className="py-2.5 px-3 min-w-[120px]">IP truy cập</th>
                        <th className="py-2.5 px-3 min-w-[120px]">Mã sản phẩm</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Mã Barcode</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Tên sản phẩm</th>
                        <th className="py-2.5 px-3 min-w-[120px]">Trạng thái</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Ghi chú</th>
                        <th className="py-2.5 px-3 w-16 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400">
                            {isLoadingHistory ? (
                              <div className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                <span>Đang tải lịch sử tra cứu...</span>
                              </div>
                            ) : historySearchFilter ? (
                              'Không tìm thấy bản ghi tra cứu nào khớp với bộ lọc.'
                            ) : (
                              'Chưa có lịch sử tra cứu barcode nào được lưu.'
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((item, idx) => {
                          const isSuccess = item.status === 'success';
                          return (
                            <tr
                              key={item.id || `${item.timestamp}-${idx}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                                {idx + 1}
                              </td>

                              {/* Time */}
                              <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {item.formattedTime ||
                                      new Date(item.timestamp).toLocaleString('vi-VN')}
                                  </span>
                                </span>
                              </td>

                              {/* Client IP */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                                    <Globe className="w-3 h-3 text-blue-500" />
                                    <span>{item.clientIp || '---'}</span>
                                  </span>
                                  {item.isAdmin && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-[9px] tracking-wider uppercase font-mono">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Product Code */}
                              <td className="py-2.5 px-3 font-mono font-black text-slate-900 dark:text-white">
                                {item.productCode}
                              </td>

                              {/* Barcode */}
                              <td className="py-2.5 px-3">
                                {item.barcode ? (
                                  <div className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400">
                                    <span>{item.barcode}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(item.barcode!)}
                                      className="p-1 hover:bg-blue-50 dark:hover:bg-blue-950 rounded cursor-pointer"
                                      title="Sao chép Barcode"
                                    >
                                      {copiedCode === item.barcode ? (
                                        <Check className="w-3 h-3 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-slate-400" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">---</span>
                                )}
                              </td>

                              {/* Product Name */}
                              <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-200">
                                {item.productName || '---'}
                              </td>

                              {/* Status */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isSuccess
                                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  {isSuccess ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Thành công</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3" />
                                      <span>Không tìm thấy</span>
                                    </>
                                  )}
                                </span>
                              </td>

                              {/* Notes */}
                              <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                                {item.message || (isSuccess ? 'Tìm thấy mã vạch' : 'Mã không tồn tại')}
                              </td>

                              {/* Action */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHistoryItem(item.id || item.productCode)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                                  title="Xóa dòng này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: MODULE VISIBILITY MANAGEMENT (ẨN / HIỆN MODULE) */}
          {/* ========================================================= */}
          {mainTab === 'modules' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header card */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-600 text-white">
                      <Layers className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Quản lý Hiển thị Module ngoài giao diện
                    </h3>
                  </div>
                  <p className="text-xs text-blue-200/80 leading-relaxed max-w-2xl">
                    Chủ động Bật hoặc Ẩn các module chức năng và module con ra ngoài thanh menu bên trái và trang chủ. Các thay đổi được lưu và áp dụng tức thì.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={handleSetOnlyViPhamAndBarcode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                    title="Chế độ mặc định: Hiển thị Vi phạm, Barcode và Danh sách link"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Mặc định (Hiện Vi phạm, Barcode &amp; Link)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShowAllModules}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 cursor-pointer"
                    title="Bật hiển thị tất cả các module"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hiện tất cả</span>
                  </button>
                </div>
              </div>

              {/* Module cards grid */}
              <div className="space-y-4">
                {/* 1. Module Chính sách Lương thưởng & Submodules */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            Module: Chính sách Lương thưởng
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                            MỚI
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Quy chế lương KPI, mức thưởng & chương trình thi đua
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleModuleVisibility('luong-thuong')}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        moduleVisibility['luong-thuong'] !== false
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {moduleVisibility['luong-thuong'] !== false ? (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Đang hiển thị</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Đã ẩn</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Submodules of Chính sách Lương */}
                  {moduleVisibility['luong-thuong'] !== false && (
                    <div className="pl-4 sm:pl-8 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Module con thuộc Chính sách Lương thưởng:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Submodule 1: Shop thuốc */}
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <Store className="w-4 h-4 text-amber-500" />
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white">
                                Shop thuốc
                              </div>
                              <div className="text-[11px] text-slate-500">Chính sách Dược sĩ Nhà thuốc</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleModuleVisibility('luong-thuong-thuoc')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                              moduleVisibility['luong-thuong-thuoc'] !== false
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {moduleVisibility['luong-thuong-thuoc'] !== false ? 'Hiện' : 'Ẩn'}
                          </button>
                        </div>

                        {/* Submodule 2: Shop vệ tinh */}
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <Radio className="w-4 h-4 text-amber-500" />
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white">
                                Shop vệ tinh
                              </div>
                              <div className="text-[11px] text-slate-500">Chính sách Cửa hàng Vệ tinh</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleModuleVisibility('luong-thuong-ve-tinh')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                              moduleVisibility['luong-thuong-ve-tinh'] !== false
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {moduleVisibility['luong-thuong-ve-tinh'] !== false ? 'Hiện' : 'Ẩn'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Module Tra cứu Vi phạm */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Module: Tra cứu Vi phạm & Mức xử phạt
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white">
                          QUY ĐỊNH
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Danh mục 120+ điều khoản chế tài, xử phạt vi phạm nghiệp vụ khối shop
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleModuleVisibility('vi-pham')}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      moduleVisibility['vi-pham'] !== false
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {moduleVisibility['vi-pham'] !== false ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Đang hiển thị</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Đã ẩn</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Module Tra cứu Barcode */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Barcode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Module: Tra cứu Barcode & In Tem
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tạo tem mã vạch Code128, gợi ý mã sản phẩm và tải file in tem
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleModuleVisibility('barcode')}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      moduleVisibility['barcode'] !== false
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {moduleVisibility['barcode'] !== false ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Đang hiển thị</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Đã ẩn</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 4. Module Danh sách link thường dùng */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Module: Danh sách link thường dùng
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Cổng AR Hóa đơn, ERP, mRSA, Báo cáo kho, Ticket IT
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleModuleVisibility('links')}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      moduleVisibility['links'] !== false
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {moduleVisibility['links'] !== false ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Đang hiển thị</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Đã ẩn</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: SYSTEM CONFIGURATION, SPAM FILTER & ZALO          */}
          {/* ========================================================= */}
          {mainTab === 'system' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Card 1: Chặn Từ khóa Spam & Kịch bản phản hồi Chatbot */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-5">
                {/* Header & Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Chặn Từ khóa Spam &amp; Kịch bản phản hồi Chatbot</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          spamConfig.enabled
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {spamConfig.enabled ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Khi người dùng nhắn tin chứa từ khóa spam, Chatbot tự động phản hồi theo kịch bản thay vì tra cứu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSpamFilter}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                        spamConfig.enabled
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                          : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {spamConfig.enabled ? 'Bật Bộ Lọc Spam' : 'Tắt Bộ Lọc Spam'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSpamConfig}
                      className="p-2 rounded-2xl bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition cursor-pointer"
                      title="Khôi phục danh sách từ khóa mặc định"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section A: Kịch bản phản hồi mặc định */}
                <div className="space-y-2 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kịch bản phản hồi chung của Chatbot khi gặp Spam:</span>
                    </label>
                    {!editingDefaultReply ? (
                      <button
                        type="button"
                        onClick={() => setEditingDefaultReply(true)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold cursor-pointer"
                      >
                        Chỉnh sửa kịch bản
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSaveDefaultSpamReply}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDefaultReplyInput(spamConfig.defaultReply);
                            setEditingDefaultReply(false);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>

                  {editingDefaultReply ? (
                    <textarea
                      rows={3}
                      value={defaultReplyInput}
                      onChange={(e) => setDefaultReplyInput(e.target.value)}
                      className="w-full text-xs font-mono p-3 rounded-xl border border-blue-400 dark:border-blue-600 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập nội dung kịch bản phản hồi khi phát hiện spam..."
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {spamConfig.defaultReply}
                    </div>
                  )}
                </div>

                {/* Section B: Thêm từ khóa Spam mới */}
                <div className="space-y-3 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-500" />
                      <span>Thêm từ khóa Spam mới:</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">
                      Có thể nhập nhiều từ cách nhau bằng dấu phẩy (vd: đm, vcl, lừa đảo)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={newSpamKeyword}
                        onChange={(e) => setNewSpamKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSpamKeyword();
                        }}
                        placeholder="Nhập từ khóa spam (vd: chửi thề, đm, spam...)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={newSpamReply}
                        onChange={(e) => setNewSpamReply(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSpamKeyword();
                        }}
                        placeholder="Kịch bản trả lời riêng (tùy chọn, để trống dùng kịch bản chung)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddSpamKeyword}
                        disabled={!newSpamKeyword.trim()}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section C: Danh sách từ khóa Spam */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Danh sách từ khóa đang giám sát:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                        {spamConfig.rules.filter((r) => r.enabled).length} / {spamConfig.rules.length} từ khóa
                      </span>
                    </div>

                    <div className="relative w-full sm:w-60">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={spamSearchFilter}
                        onChange={(e) => setSpamSearchFilter(e.target.value)}
                        placeholder="Lọc từ khóa..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Filtered Keywords Grid */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {spamConfig.rules
                      .filter((r) =>
                        spamSearchFilter
                          ? r.keyword.toLowerCase().includes(spamSearchFilter.toLowerCase())
                          : true
                      )
                      .map((rule) => (
                        <div
                          key={rule.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                            rule.enabled
                              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                              : 'bg-slate-100/60 dark:bg-slate-950/60 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 font-mono font-bold shrink-0">
                              {rule.keyword}
                            </span>
                            {rule.customReply ? (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={`Kịch bản riêng: ${rule.customReply}`}>
                                💬 {rule.customReply}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                                (dùng kịch bản chung)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleSpamRule(rule.id)}
                              className={`px-2 py-0.8 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                                rule.enabled
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {rule.enabled ? 'Đang lọc' : 'Tạm tắt'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSpamRule(rule.id)}
                              className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 cursor-pointer transition"
                              title="Xóa từ khóa này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {spamConfig.rules.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                        Chưa có từ khóa spam nào. Bấm &quot;Thêm&quot; để thiết lập từ khóa cần chặn.
                      </div>
                    )}
                  </div>
                </div>

                {/* Section D: Khung kiểm tra phản hồi trực tiếp (Live Simulator) */}
                <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Thử nghiệm nhanh kịch bản phản hồi:</span>
                    </span>
                    {testSpamResult && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold animate-pulse">
                        🔴 Phát hiện: &quot;{testSpamResult.matchedKeyword}&quot;
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={testSpamInput}
                    onChange={(e) => setTestSpamInput(e.target.value)}
                    placeholder="Nhập thử một câu hỏi để kiểm tra (vd: shop lừa đảo à, đm chatbot...)"
                    className="w-full px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />

                  {testSpamResult && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1">
                      <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <span>🤖 Chatbot sẽ trả lời theo kịch bản:</span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans text-[11px]">
                        {testSpamResult.replyText}
                      </div>
                    </div>
                  )}

                  {!testSpamResult && testSpamInput.trim() && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✅ Không chứa từ khóa spam nào (Chatbot sẽ xử lý tra cứu nghiệp vụ bình thường).
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Quản lý & Tải ảnh Zalo liên hệ SSC */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <ZaloIcon className="w-8 h-8 rounded-xl shadow-xs" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Hình ảnh Thẻ Zalo liên hệ SSC</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                          Zalo SSC
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tải ảnh thẻ liên hệ Zalo về máy hoặc thay đổi ảnh mới hiển thị khi bấm vào &quot;Zalo liên hệ SSC&quot;.
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleDownloadZaloImage}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Tải ảnh Zalo liên hệ SSC về máy"
                    >
                      {zaloDownloadToast ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Đã tải ảnh!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Tải ảnh về máy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => zaloFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Tải lên ảnh Zalo thay thế"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Đổi ảnh mới</span>
                    </button>

                    <input
                      ref={zaloFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleZaloFileChange}
                      className="hidden"
                    />

                    {zaloImg !== defaultZaloImg && (
                      <button
                        type="button"
                        onClick={handleResetZaloImage}
                        className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Khôi phục ảnh ban đầu"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Đặt lại gốc</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Image in Settings */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Xem trước ảnh hiển thị hiện tại:</span>
                    <a
                      href="https://zalo.me/0902422712"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Kiểm tra link Zalo (0902422712)</span>
                    </a>
                  </div>

                  <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:p-3 flex items-center justify-center overflow-hidden max-w-full shadow-inner">
                    <img
                      src={zaloImg}
                      alt="Thẻ Zalo liên hệ SSC"
                      referrerPolicy="no-referrer"
                      className="max-h-[260px] w-auto max-w-full object-contain rounded-xl select-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Hình mờ Halloween (nếu có onToggleWatermark) */}
              {onToggleWatermark && (
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Hình Mờ Halloween (Watermark Bí Ngô)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Bật hoặc tắt hình mờ 2 quả bí ngô Halloween trang trí nền toàn ứng dụng.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleWatermark}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                      showWatermark
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {showWatermark ? 'Đang Bật • Bấm để Tắt' : 'Đang Tắt • Bấm để Bật'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Chế độ Quản trị viên SSC: Đã xác thực</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
