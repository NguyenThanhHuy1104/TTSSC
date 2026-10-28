import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PromotionTabs } from './promotion/PromotionTabs';
import { IslandJourneyBar } from './promotion/IslandJourneyBar';
import { SearchBar } from './promotion/SearchBar';
import { IslandAccordion } from './promotion/IslandAccordion';
import { LoadingSkeleton } from './promotion/PromotionLoadingSkeleton';
import { EmptyState } from './promotion/PromotionEmptyState';
import { ErrorBanner } from './promotion/PromotionErrorBanner';
import { ConfigModal } from './promotion/PromotionConfigModal';
import { Toast } from './promotion/PromotionToast';
import { ChatbotModal } from './promotion/PromotionChatbotModal';
import { CountdownTimerBadge } from './common/CountdownTimerBadge';
import { PROMOTION_ROUNDS, DEFAULT_SHEET_CONFIG, loadSavedConfig, saveConfig, buildGoogleSheetUrl, parseGoogleSheetUrl } from '../config/sheetsConfig';
import {
  fetchPromotionRoundData,
  groupProductsIntoIslands,
  clearSheetCache,
  testSheetConnection,
  SheetConnectionTestResult
} from '../services/sheetService';
import { ProductItem, IslandData, SheetSourceConfig, ToastNotification, PromotionRoundKey } from '../types';
import { matchesQueryIndexed } from '../utils/vietnameseSearch';
import {
  Sparkles,
  Search,
  Compass,
  RefreshCw,
  Bot,
  SlidersHorizontal,
  ArrowLeft,
  ExternalLink,
  Database,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
  X
} from 'lucide-react';

const AUTO_REFRESH_SECONDS = 90;

interface PromotionLookupProps {
  onBackToHome?: () => void;
  showAdminControls?: boolean;
  onToggleAdminControls?: (enabled: boolean) => void;
}

export const PromotionLookup: React.FC<PromotionLookupProps> = ({
  onBackToHome,
  showAdminControls = false,
  onToggleAdminControls
}) => {
  // Config state
  const [sheetConfig, setSheetConfig] = useState<SheetSourceConfig>(loadSavedConfig);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');

  // Read initial params from URL if present
  const parseUrlParams = () => {
    if (typeof window === 'undefined') return { tabKey: 'dot5' as PromotionRoundKey, searchParam: '' };
    const params = new URLSearchParams(window.location.search);
    const dotParam = params.get('dot');
    const searchParam = params.get('search') || '';

    let tabKey: PromotionRoundKey = 'dot5';
    if (dotParam === '1' || dotParam === 'dot1') tabKey = 'dot1';
    if (dotParam === '2' || dotParam === 'dot2') tabKey = 'dot2';
    if (dotParam === '3' || dotParam === 'dot3') tabKey = 'dot3';
    if (dotParam === '5' || dotParam === 'dot5') tabKey = 'dot5';

    return { tabKey, searchParam };
  };

  const initialParams = parseUrlParams();
  const [activeTab, setActiveTab] = useState<PromotionRoundKey>(initialParams.tabKey);
  const [searchQuery, setSearchQuery] = useState<string>(initialParams.searchParam);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialParams.searchParam);
  const [selectedIslandFilter, setSelectedIslandFilter] = useState<string>('all');

  // Inline Google Sheets URL Sync Input state
  const [inlineUrlInput, setInlineUrlInput] = useState<string>(() => {
    return (
      sheetConfig.fullSheetUrl ||
      (sheetConfig.spreadsheetId ? buildGoogleSheetUrl(sheetConfig.spreadsheetId, sheetConfig.gids?.[initialParams.tabKey] || '0') : '')
    );
  });
  const [isTestingInline, setIsTestingInline] = useState<boolean>(false);
  const [inlineTestResult, setInlineTestResult] = useState<SheetConnectionTestResult | null>(null);

  // Admin Mode state (synced with showAdminControls prop or localStorage)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return (
      showAdminControls ||
      (typeof window !== 'undefined' && localStorage.getItem('ssc_show_admin_controls') === 'true')
    );
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPasswordText, setShowPasswordText] = useState<boolean>(false);
  const [adminAuthError, setAdminAuthError] = useState<string>('');

  useEffect(() => {
    if (showAdminControls !== undefined) {
      setIsAdmin(showAdminControls);
    }
  }, [showAdminControls]);

  // Handle Admin Authentication
  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.trim() === 'ssc87333') {
      setIsAdmin(true);
      onToggleAdminControls?.(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ssc_show_admin_controls', 'true');
      }
      setIsAdminAuthModalOpen(false);
      setAdminPassword('');
      setAdminAuthError('');
      setIsConfigOpen(true);
      setToast({
        id: Date.now(),
        message: '✓ Đã kích hoạt quyền Quản trị! Mời bạn cấu hình liên kết Google Sheets.',
        type: 'success'
      });
      setTimeout(() => setToast(null), 3500);
    } else {
      setAdminAuthError('Mật khẩu quản trị không chính xác (mặc định: ssc87333)');
    }
  };

  // Lock Admin Mode back to regular viewer
  const handleLockAdmin = () => {
    setIsAdmin(false);
    onToggleAdminControls?.(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ssc_show_admin_controls');
    }
    setToast({
      id: Date.now(),
      message: 'Đã khóa quyền Quản trị (Chuyển về chế độ Người xem).',
      type: 'info'
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Clear all sheet cache and reload fresh data
  const handleClearCache = async () => {
    clearSheetCache();
    setRefreshKey((k) => k + 1);
    await loadData(activeTab, true);
    setToast({
      id: Date.now(),
      message: '✓ Đã xóa sạch bộ nhớ cache và tải lại dữ liệu 12 Đảo mới nhất!',
      type: 'success'
    });
    setTimeout(() => setToast(null), 3500);
  };

  // Reset to default sheets and standard 12 Islands promotion data
  const handleResetToDefault = async () => {
    if (!window.confirm('Khôi phục về liên kết mặc định và toàn bộ dữ liệu mẫu chuẩn 12 Đảo Quà Tặng FPT Long Châu?')) {
      return;
    }
    const resetConfig: SheetSourceConfig = {
      ...DEFAULT_SHEET_CONFIG,
      spreadsheetId: '',
      fullSheetUrl: ''
    };
    setSheetConfig(resetConfig);
    saveConfig(resetConfig);
    clearSheetCache();
    setInlineUrlInput('');
    setRefreshKey((k) => k + 1);
    await loadData(activeTab, true);
    setToast({
      id: Date.now(),
      message: '✓ Đã khôi phục dữ liệu chuẩn 12 Đảo Quà Tặng FPT Long Châu!',
      type: 'success'
    });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounce search query to keep typing at 60fps
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 120);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Keep inline URL input synced when active tab changes if not actively typing
  useEffect(() => {
    if (sheetConfig.fullSheetUrl) {
      setInlineUrlInput(sheetConfig.fullSheetUrl);
    } else if (sheetConfig.spreadsheetId) {
      setInlineUrlInput(buildGoogleSheetUrl(sheetConfig.spreadsheetId, sheetConfig.gids?.[activeTab] || '0'));
    }
  }, [sheetConfig, activeTab]);

  // Data fetching state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSourceNote, setDataSourceNote] = useState<string>('');

  // Accordion expanded state (Set of Island numbers)
  const [expandedIslands, setExpandedIslands] = useState<Set<number>>(new Set([1]));

  // Refresh signal for child widgets including Chatbot and isolated countdown timer
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Toast notification state
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Sync state to URL Query params seamlessly (debounced to avoid iframe history thrashing)
  const updateUrl = useCallback((tab: string, search: string) => {
    if (typeof window === 'undefined') return;
    const dotNum = tab.replace('dot', '');
    const params = new URLSearchParams(window.location.search);
    params.set('dot', dotNum);
    if (search && search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash || ''}`;
    window.history.replaceState(null, '', newUrl);
  }, []);

  // Fetch data for active tab
  const loadData = useCallback(
    async (tabKey: PromotionRoundKey, force = false) => {
      if (force) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const response = await fetchPromotionRoundData(tabKey, sheetConfig, force);
        if (response.success && response.data) {
          setProducts(response.data);
          const sourceName = response.source === 'googleSheet' ? 'Google Sheets' : 'Dữ liệu FPT Long Châu';
          setDataSourceNote(sourceName);
          const nowFormatted = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSyncedTime(nowFormatted);

          if (force) {
            setToast({
              id: Date.now(),
              message: `✓ Đã đồng bộ thành công ${response.data.length} quà tặng từ ${sourceName}!`,
              type: 'success'
            });
            setTimeout(() => {
              setToast(null);
            }, 3000);
          }
        } else {
          setErrorMessage(response.message || 'Không thể tải dữ liệu chương trình.');
        }
      } catch (err: any) {
        console.error('Error fetching sheet data:', err);
        setErrorMessage('Đã xảy ra lỗi khi kết nối tới bảng tính Google Sheets.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [sheetConfig]
  );

  // Load data when activeTab changes
  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, loadData]);

  // Debounced URL updates when tab or search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl(activeTab, searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, updateUrl]);

  // Manual refresh handler: resets countdown immediately and syncs all components
  const handleManualRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    loadData(activeTab, true);
  }, [activeTab, loadData]);

  // Group raw products into sorted Islands
  const allIslands: IslandData[] = useMemo(() => {
    return groupProductsIntoIslands(products);
  }, [products]);

  // Filter islands & products based on Debounced Search Query and Island Filter
  const filteredIslands: IslandData[] = useMemo(() => {
    const cleanQ = debouncedQuery.trim();
    if (!cleanQ && selectedIslandFilter === 'all') {
      return allIslands;
    }

    return allIslands
      .map((island) => {
        // If island dropdown filter is active, check name
        if (
          selectedIslandFilter !== 'all' &&
          island.islandName !== selectedIslandFilter &&
          `Đảo ${island.islandNumber}` !== selectedIslandFilter
        ) {
          return null;
        }

        if (!cleanQ) {
          return island;
        }

        // High-speed indexed matching
        const matchingProducts = island.products.filter((product) => {
          return matchesQueryIndexed(product.searchIndex, cleanQ);
        });

        if (matchingProducts.length === 0) {
          return null;
        }

        return {
          ...island,
          products: matchingProducts,
          giftCount: matchingProducts.length
        };
      })
      .filter((island): island is IslandData => island !== null);
  }, [allIslands, debouncedQuery, selectedIslandFilter]);

  // Automatic Island expansion logic when searching:
  // Automatically expand all islands that have matching results
  useEffect(() => {
    if (debouncedQuery.trim() !== '') {
      const matchingIslandNumbers = new Set<number>();
      filteredIslands.forEach((island) => {
        matchingIslandNumbers.add(island.islandNumber);
      });
      setExpandedIslands(matchingIslandNumbers);
    } else {
      // Default: expand Island 1 if not previously customized
      setExpandedIslands((prev) => (prev.size === 0 ? new Set([1]) : prev));
    }
  }, [debouncedQuery, filteredIslands]);

  // Expand / Collapse Handlers
  const handleToggleIsland = (islandNumber: number) => {
    setExpandedIslands((prev) => {
      const next = new Set(prev);
      if (next.has(islandNumber)) {
        next.delete(islandNumber);
      } else {
        next.add(islandNumber);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allNums = new Set(filteredIslands.map((i) => i.islandNumber));
    setExpandedIslands(allNums);
  };

  const handleCollapseAll = () => {
    setExpandedIslands(new Set());
  };

  const handleSelectFromJourneyBar = (islandNumber: number) => {
    setExpandedIslands((prev) => {
      const next = new Set(prev);
      next.add(islandNumber);
      return next;
    });

    // Scroll to the island element
    const el = document.getElementById(`island-section-${islandNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Copy product code feedback
  const handleCopySuccess = (code: string) => {
    const newToast: ToastNotification = {
      id: Date.now(),
      message: `✓ Đã sao chép mã SP: ${code}`
    };
    setToast(newToast);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // Navigate to island and round (e.g. from Chatbot)
  const handleNavigateToIslandAndRound = (roundKey: PromotionRoundKey, islandNumber: number) => {
    setActiveTab(roundKey);
    setTimeout(() => {
      setExpandedIslands((prev) => {
        const next = new Set(prev);
        next.add(islandNumber);
        return next;
      });
      const el = document.getElementById(`island-section-${islandNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  };

  // Config save handler
  const handleSaveConfig = (newConfig: SheetSourceConfig) => {
    setSheetConfig(newConfig);
    saveConfig(newConfig);
    clearSheetCache();
    setRefreshKey((k) => k + 1);
    loadData(activeTab, true);
    setToast({
      id: Date.now(),
      message: '✓ Đã lưu cấu hình link Google Sheets và đang đồng bộ dữ liệu mới...',
      type: 'success'
    });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Direct Inline Sync Handler (triggered from the on-page input)
  const handleDirectSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = inlineUrlInput.trim();
    if (!input) {
      setToast({
        id: Date.now(),
        message: '⚠️ Vui lòng dán link Google Sheets trước khi bấm Đồng bộ!',
        type: 'error'
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const parsed = parseGoogleSheetUrl(input);
    if (!parsed.spreadsheetId) {
      setToast({
        id: Date.now(),
        message: '⚠️ Đường link Google Sheets không hợp lệ. Vui lòng kiểm tra lại!',
        type: 'error'
      });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    const currentGids = { ...sheetConfig.gids };
    if (parsed.gid) {
      currentGids[activeTab] = parsed.gid;
    }

    const updatedConfig: SheetSourceConfig = {
      ...sheetConfig,
      spreadsheetId: parsed.spreadsheetId,
      fullSheetUrl: input.startsWith('http')
        ? input
        : buildGoogleSheetUrl(parsed.spreadsheetId, parsed.gid || currentGids[activeTab] || '0'),
      gids: currentGids,
      lastSyncedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setSheetConfig(updatedConfig);
    saveConfig(updatedConfig);
    clearSheetCache();
    setRefreshKey((k) => k + 1);

    setIsRefreshing(true);
    setInlineTestResult(null);

    try {
      const response = await fetchPromotionRoundData(activeTab, updatedConfig, true);
      if (response.success && response.data) {
        setProducts(response.data);
        const sourceName = response.source === 'googleSheet' ? 'Google Sheets' : 'Dữ liệu FPT Long Châu';
        setDataSourceNote(sourceName);
        const nowFormatted = new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        setLastSyncedTime(nowFormatted);

        if (response.source === 'googleSheet') {
          setToast({
            id: Date.now(),
            message: `✓ Đã đồng bộ thành công ${response.data.length} quà tặng từ Google Sheets!`,
            type: 'success'
          });
        } else {
          setToast({
            id: Date.now(),
            message: '⚠️ Bảng tính vừa nhập không có cột quà tặng/đảo. Hệ thống đã đồng bộ chuẩn 12 Đảo Quà Tặng FPT Long Châu.',
            type: 'info'
          });
        }
      } else {
        setErrorMessage(response.message || 'Không thể tải dữ liệu từ Google Sheets.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Đã xảy ra lỗi khi kết nối Google Sheets.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Inline Test Connection Handler
  const handleInlineTest = async () => {
    const input = inlineUrlInput.trim();
    if (!input) {
      setInlineTestResult({
        success: false,
        message: 'Vui lòng nhập đường link Google Sheets để kiểm tra kết nối.'
      });
      return;
    }
    const parsed = parseGoogleSheetUrl(input);
    if (!parsed.spreadsheetId) {
      setInlineTestResult({
        success: false,
        message: 'Link không hợp lệ. Vui lòng dán link Google Sheets đầy đủ (VD: https://docs.google.com/spreadsheets/d/...)'
      });
      return;
    }

    setIsTestingInline(true);
    setInlineTestResult(null);
    try {
      const gid = parsed.gid || sheetConfig.gids?.[activeTab] || '0';
      const result = await testSheetConnection(parsed.spreadsheetId, gid);
      setInlineTestResult(result);
    } catch (err: any) {
      setInlineTestResult({
        success: false,
        message: `Lỗi kết nối: ${err?.message || 'Không thể kết nối tới Google Sheets'}`
      });
    } finally {
      setIsTestingInline(false);
    }
  };

  // Google Sheet URL for current round
  const activeSheetUrl = useMemo(() => {
    if (sheetConfig.fullSheetUrl) return sheetConfig.fullSheetUrl;
    if (sheetConfig.spreadsheetId) {
      return buildGoogleSheetUrl(sheetConfig.spreadsheetId, sheetConfig.gids?.[activeTab] || '0');
    }
    return '';
  }, [sheetConfig, activeTab]);

  // Total gifts calculation
  const totalFilteredGifts = useMemo(() => {
    return filteredIslands.reduce((acc, island) => acc + island.products.length, 0);
  }, [filteredIslands]);

  const currentRoundInfo = PROMOTION_ROUNDS.find((r) => r.tabKey === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification for Clipboard Copy */}
      <Toast toast={toast} />

      {/* Sticky Compact Navigation Bar for Smooth On-Scroll Tab Switching */}
      <div className="sticky top-16 z-30 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 shadow-md shadow-slate-950/20 rounded-b-2xl mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Quick Round Tabs in Sticky Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer shrink-0 mr-1"
                title="Quay lại Trang chủ"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trang chủ</span>
              </button>
            )}

            {PROMOTION_ROUNDS.map((round) => (
              <button
                key={round.id}
                id={`sticky-tab-${round.tabKey}`}
                type="button"
                onClick={() => setActiveTab(round.tabKey)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
                  activeTab === round.tabKey
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {round.label}
              </button>
            ))}
          </div>

          {/* Compact Countdown & Search Trigger / Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sticky Compact Countdown Indicator */}
            <CountdownTimerBadge
              initialSeconds={AUTO_REFRESH_SECONDS}
              isRefreshing={isRefreshing}
              resetTrigger={refreshKey + activeTab}
              onTimeout={() => loadData(activeTab, true)}
              render={(seconds) => (
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  title="Nhấn để làm mới ngay"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
                  <span className="font-mono font-bold">{isRefreshing ? '...' : `${seconds}s`}</span>
                </button>
              )}
            />

            {/* Button Xóa Cache & Tải lại tức thì */}
            <button
              type="button"
              onClick={handleClearCache}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
              title="Xóa bộ nhớ đệm cache và tải dữ liệu mới nhất"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline font-semibold">Xóa Cache</span>
            </button>

            {/* Quick Sticky Chatbot Launcher */}
            <button
              type="button"
              onClick={() => setIsChatbotOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              title="Mở Trợ lý AI Tra Cứu Quà Tặng 12 Đảo"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trợ lý AI</span>
            </button>

            {/* Config Button for Google Sheets (Admin) */}
            <button
              type="button"
              onClick={() => {
                if (isAdmin) {
                  setIsConfigOpen(true);
                } else {
                  setIsAdminAuthModalOpen(true);
                }
              }}
              className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                isAdmin
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border-amber-500/40 shadow-xs'
                  : 'bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-slate-700 hover:border-amber-500/40'
              }`}
              title={isAdmin ? "Cấu hình Google Sheets 12 Đảo (Admin đang mở)" : "Nhấn để xác thực Admin và cập nhật link Google Sheets"}
            >
              {isAdmin ? (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline font-bold">Cấu hình Sheet (Admin)</span>
                  <span className="md:hidden font-bold">Cấu hình Sheet</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Admin Active" />
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline font-bold">Cấu hình Sheet (Admin)</span>
                  <span className="md:hidden font-bold">Admin Sheet</span>
                </>
              )}
            </button>

            {searchQuery ? (
              <div className="flex items-center gap-1.5 text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg border border-cyan-400/30">
                <Search className="w-3.5 h-3.5" />
                <span className="max-w-[120px] sm:max-w-[200px] truncate">"{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-white ml-1 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 hidden md:inline">
                🏝️ {allIslands.length} Đảo Quà Tặng
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Promotion Tabs & Info Banner */}
        <PromotionTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRoundInfo={currentRoundInfo}
        />

        {/* Interactive Google Sheet Synchronization Panel - Strictly Restricted to Admin */}
        {isAdmin ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400/50 dark:border-amber-500/30 p-4 sm:p-5 shadow-sm space-y-3.5 relative overflow-hidden">
            {/* Top Row: Title, Status Badge, External Link, Reset and Modal Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
                      <span>ĐỒNG BỘ LINK GOOGLE SHEETS 12 ĐẢO</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                        <ShieldCheck className="w-3 h-3" />
                        Admin Đang Bật
                      </span>
                    </h3>
                    {dataSourceNote === 'Google Sheets' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Đã kết nối Sheet
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-bold">
                        Dữ liệu chuẩn FPT Long Châu
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bảng điều khiển Quản trị viên: Dán link Google Sheets chứa danh sách sản phẩm &amp; quà tặng để đồng bộ tự động vào 12 Đảo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {activeSheetUrl && (
                  <a
                    href={activeSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Mở Google Sheets này trên tab mới"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Mở Sheet</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Cấu hình GID chi tiết cho từng Đợt"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Cấu hình GID</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Xóa sạch bộ nhớ đệm cache và tải lại dữ liệu mới nhất"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Xóa Cache</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Khôi phục về dữ liệu mẫu chuẩn FPT Long Châu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Khôi phục chuẩn</span>
                </button>
                <button
                  type="button"
                  onClick={handleLockAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-600 hover:text-amber-700 dark:text-slate-400 dark:hover:text-amber-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Khóa quyền Quản trị viên"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Khóa Admin</span>
                </button>
              </div>
            </div>

            {/* Middle Row: Direct Link Input & Quick Sync Buttons */}
            <form onSubmit={handleDirectSync} className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={inlineUrlInput}
                  onChange={(e) => {
                    setInlineUrlInput(e.target.value);
                    if (inlineTestResult) setInlineTestResult(null);
                  }}
                  placeholder="Dán link Google Sheets tại đây (VD: https://docs.google.com/spreadsheets/d/.../edit#gid=0)"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-400"
                />
                {inlineUrlInput && (
                  <button
                    type="button"
                    onClick={() => setInlineUrlInput('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    title="Xóa link"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleInlineTest}
                  disabled={isTestingInline || !inlineUrlInput.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                  title="Kiểm tra xem link có đọc được dữ liệu không"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingInline ? 'animate-spin' : ''}`} />
                  <span>{isTestingInline ? 'Đang test...' : 'Kiểm tra kết nối'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isRefreshing || isLoading || !inlineUrlInput.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                  title="Lưu link và đồng bộ dữ liệu ngay lập tức"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
                </button>
              </div>
            </form>

            {/* Inline Test Result Card if any */}
            {inlineTestResult && (
              <div
                className={`p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2 border animate-in fade-in duration-150 ${
                  inlineTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                }`}
              >
                {inlineTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{inlineTestResult.message}</p>
                  {inlineTestResult.success && inlineTestResult.detectedColumns && inlineTestResult.detectedColumns.length > 0 && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      Cột nhận diện: {inlineTestResult.detectedColumns.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Info Row: Product Count, Sync Time, Permissions Notice */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Nguồn: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{dataSourceNote || 'Google Sheets'}</strong>
                </span>
                {lastSyncedTime && (
                  <span>• Lần cuối: <strong className="font-mono text-cyan-600 dark:text-cyan-400">{lastSyncedTime}</strong></span>
                )}
                <span>• Đang hiển thị: <strong className="text-slate-800 dark:text-slate-200 font-bold">{products.length}</strong> quà tặng / 12 Đảo</span>
              </div>

              <span className="text-slate-400">
                * Lưu ý: Chia sẻ bảng tính với quyền <strong>"Bất kỳ ai có đường liên kết đều có thể xem"</strong>
              </span>
            </div>
          </div>
        ) : (
          /* Quick Admin Access Banner for Sheet Configuration when not yet in Admin mode */
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Nguồn dữ liệu hiện tại:
                  </span>
                  <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                    {dataSourceNote || 'Dữ liệu chuẩn FPT Long Châu'}
                  </span>
                  <span className="text-[11px] text-slate-400">• ({products.length} sản phẩm &amp; quà tặng / 12 Đảo)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dữ liệu được cập nhật tự động từ Google Sheets. Quản trị viên có thể cập nhật lại đường link bảng tính mới bất kỳ lúc nào.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearCache}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Xóa bộ nhớ đệm cache và làm mới dữ liệu"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Xóa Cache</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                title="Nhấn để đăng nhập Quản trị viên và cập nhật lại link Google Sheets"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Cấu hình Admin (Cập nhật link Sheet)</span>
              </button>
            </div>
          </div>
        )}

        {/* 12 Islands Journey Progress Bar */}
        {!isLoading && allIslands.length > 0 && (
          <IslandJourneyBar
            islands={allIslands}
            expandedIslands={expandedIslands}
            onSelectIsland={handleSelectFromJourneyBar}
          />
        )}

        {/* Search Bar & Island Filter */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedIslandFilter={selectedIslandFilter}
          onIslandFilterChange={setSelectedIslandFilter}
          islands={allIslands}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          totalFilteredGifts={totalFilteredGifts}
          totalIslandsWithResults={filteredIslands.length}
        />

        {/* Error State */}
        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            onRetry={() => loadData(activeTab, true)}
            onUseSampleData={() => loadData(activeTab, false)}
          />
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredIslands.length === 0 ? (
          /* Empty Search State */
          <EmptyState
            searchQuery={searchQuery}
            onClearSearch={() => {
              setSearchQuery('');
              setSelectedIslandFilter('all');
            }}
          />
        ) : (
          /* 12 Islands Accordion List */
          <div id="islands-accordion-list" className="space-y-4 sm:space-y-5">
            {filteredIslands.map((island) => (
              <IslandAccordion
                key={island.id}
                island={island}
                isExpanded={expandedIslands.has(island.islandNumber)}
                onToggle={() => handleToggleIsland(island.islandNumber)}
                searchQuery={searchQuery}
                onCopySuccess={handleCopySuccess}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive AI Chatbot Widget (Dynamic for currently active/selected round) */}
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onOpen={() => setIsChatbotOpen(true)}
        sheetConfig={sheetConfig}
        refreshKey={refreshKey}
        activeRoundKey={activeTab}
        onNavigateToIslandAndRound={handleNavigateToIslandAndRound}
        onCopySuccess={handleCopySuccess}
      />

      {/* Settings Modal for Google Sheets Configuration */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={sheetConfig}
        onSaveConfig={handleSaveConfig}
      />

      {/* Admin Authentication Modal for Google Sheets Configuration */}
      {isAdminAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => {
            setIsAdminAuthModalOpen(false);
            setAdminPassword('');
            setAdminAuthError('');
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Xác thực Quản trị viên
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cấu hình cập nhật link Google Sheets 12 Đảo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdminAuthModalOpen(false);
                  setAdminPassword('');
                  setAdminAuthError('');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu Quản trị
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    autoFocus
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminAuthError('');
                    }}
                    placeholder="Nhập mật khẩu (mặc định: ssc87333)"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:border-cyan-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    title={showPasswordText ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {adminAuthError && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1.5">
                    {adminAuthError}
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>Mật khẩu mặc định: <code className="font-mono font-bold text-amber-500">ssc87333</code></span>
                  <span>Phím tắt: <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-700">Ctrl+Shift+A</kbd></span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminAuthModalOpen(false);
                    setAdminPassword('');
                    setAdminAuthError('');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition-all cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Xác nhận &amp; Cấu hình</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
