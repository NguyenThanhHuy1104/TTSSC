import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  Clock,
  Settings,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  FileText,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Code,
  X,
  ExternalLink,
  ShieldAlert,
  Info,
  CheckCircle2,
  CornerDownRight,
  Plus,
  Edit,
  Tag,
  ShieldCheck,
  BookmarkPlus,
  RotateCcw,
  Settings2,
  Trash2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Maximize2,
  ArrowLeft
} from 'lucide-react';
import { PenaltyRuleItem, PenaltyConfig } from '../types';
import { AdminPenaltyModal } from './AdminPenaltyModal';
import { CountdownTimerBadge } from './common/CountdownTimerBadge';
import {
  fetchPenaltiesFromSheet,
  searchPenaltyRules,
  getPenaltySuggestions,
  buildPenaltyHierarchy,
  getPenaltyConfig,
  savePenaltyConfig,
  clearPenaltyCache,
  generateAppsScriptCode,
  removeVietnameseTones,
  getQuickSearchTags,
  addQuickSearchTag,
  deleteQuickSearchTag,
  resetQuickSearchTags
} from '../services/penaltyService';

interface ToastState {
  show: boolean;
  message: string;
}

interface PenaltyLookupProps {
  hiddenModules?: string[];
  onOpenModuleConfig?: () => void;
  selectedPenaltyId?: string | null;
  selectedPenaltyTrigger?: number;
}

export const PenaltyLookup: React.FC<PenaltyLookupProps> = ({
  hiddenModules = [],
  onOpenModuleConfig,
  selectedPenaltyId,
  selectedPenaltyTrigger = 0
}) => {
  // --- Data & Loading States ---
  const [items, setItems] = useState<PenaltyRuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dataSource, setDataSource] = useState<string>('default');

  // --- Auto-refresh & Countdown (90 seconds) ---
  const AUTO_REFRESH_SECONDS = 90;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // --- Search States ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);

  // View Mode: 'table' (Bảng 3 cột mặc định) | 'cards' (Thẻ) | 'tree' (Cây danh mục)
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'tree'>('table');

  // Selected single item to view in 1 screen without scrolling
  const [selectedSingleItem, setSelectedSingleItem] = useState<PenaltyRuleItem | null>(null);

  // Tree View Expand/Collapse States
  const [expandedGroupsA, setExpandedGroupsA] = useState<Record<string, boolean>>({});
  const [expandedGroupsB, setExpandedGroupsB] = useState<Record<string, boolean>>({});

  // --- Modals & Toasts ---
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [editingAdminItem, setEditingAdminItem] = useState<PenaltyRuleItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });

  // --- Module & Column Visibility State (Cho phép ẩn module / cột, tự động ẩn Lưu ý trên điện thoại) ---
  const [isNoticePanelHidden, setIsNoticePanelHidden] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return true;
    }
    return localStorage.getItem('ssc_hide_penalty_notice') === 'true';
  });
  const [showOfficialColumn, setShowOfficialColumn] = useState<boolean>(() => {
    return localStorage.getItem('ssc_col_official') !== 'false';
  });
  const [showProbationColumn, setShowProbationColumn] = useState<boolean>(() => {
    return localStorage.getItem('ssc_col_probation') !== 'false';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767px)');
    if (mql.matches) {
      setIsNoticePanelHidden(true);
    }
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsNoticePanelHidden(true);
      } else {
        setIsNoticePanelHidden(localStorage.getItem('ssc_hide_penalty_notice') === 'true');
      }
    };
    mql.addEventListener('change', handleMediaChange);
    return () => mql.removeEventListener('change', handleMediaChange);
  }, []);

  const handleToggleNoticePanel = () => {
    setIsNoticePanelHidden((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        localStorage.setItem('ssc_hide_penalty_notice', String(next));
      }
      return next;
    });
  };

  const toggleOfficialColumn = () => {
    setShowOfficialColumn((prev) => {
      const next = !prev;
      localStorage.setItem('ssc_col_official', String(next));
      return next;
    });
  };

  const toggleProbationColumn = () => {
    setShowProbationColumn((prev) => {
      const next = !prev;
      localStorage.setItem('ssc_col_probation', String(next));
      return next;
    });
  };

  // --- Quick Search Keywords (Từ khóa tìm kiếm nhanh) ---
  const [quickSearchTags, setQuickSearchTags] = useState<string[]>(() => getQuickSearchTags());
  const [isAddingQuickTag, setIsAddingQuickTag] = useState<boolean>(false);
  const [newQuickTagInput, setNewQuickTagInput] = useState<string>('');
  const [isManagingQuickTags, setIsManagingQuickTags] = useState<boolean>(false);

  // Admin Password Auth State for Quick Search actions
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [adminAuthPassword, setAdminAuthPassword] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string>('');
  const [showAdminAuthPassword, setShowAdminAuthPassword] = useState<boolean>(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  const requireAdminAuth = (action: () => void) => {
    if (sessionStorage.getItem('ssc_admin_auth') === 'true') {
      action();
    } else {
      setPendingAdminAction(() => action);
      setAdminAuthPassword('');
      setAdminAuthError('');
      setShowAdminAuthPassword(false);
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminAuthPassword.trim() === 'ssc87333') {
      sessionStorage.setItem('ssc_admin_auth', 'true');
      setIsAdminAuthModalOpen(false);
      setAdminAuthPassword('');
      setAdminAuthError('');
      if (pendingAdminAction) {
        pendingAdminAction();
        setPendingAdminAction(null);
      }
      showToast('Xác thực quản trị viên thành công!');
    } else {
      setAdminAuthError('Mật khẩu quản trị không chính xác. Vui lòng thử lại!');
    }
  };

  const handleAddQuickTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newQuickTagInput.trim();
    if (!clean) return;
    requireAdminAuth(() => {
      const updated = addQuickSearchTag(clean);
      setQuickSearchTags(updated);
      setNewQuickTagInput('');
      setIsAddingQuickTag(false);
      showToast(`Đã thêm từ khóa gợi ý: "${clean}"!`);
    });
  };

  const handleDeleteQuickTag = (tagToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    requireAdminAuth(() => {
      const updated = deleteQuickSearchTag(tagToDelete);
      setQuickSearchTags(updated);
      showToast(`Đã xóa gợi ý "${tagToDelete}"!`);
    });
  };

  const handleResetQuickTags = () => {
    requireAdminAuth(() => {
      const def = resetQuickSearchTags();
      setQuickSearchTags(def);
      setIsManagingQuickTags(false);
      showToast('Đã khôi phục danh sách gợi ý mặc định!');
    });
  };

  const handlePinKeywordToQuickSearch = (keyword: string) => {
    if (!keyword) return;
    const clean = keyword.trim();
    requireAdminAuth(() => {
      const updated = addQuickSearchTag(clean);
      setQuickSearchTags(updated);
      showToast(`Đã thêm "${clean}" vào danh sách gợi ý!`);
    });
  };

  const handleOpenAdminModal = (itemToEdit?: PenaltyRuleItem) => {
    requireAdminAuth(() => {
      setEditingAdminItem(itemToEdit || null);
      setIsAdminModalOpen(true);
    });
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // --- Toast Trigger Helper ---
  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2400);
  };

  // --- Clipboard Helper ---
  const handleCopy = (text: string, key: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Đã sao chép: ${label}`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1800);
  };



  // --- Fetch Data ---
  const loadData = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    setErrorMsg(null);

    try {
      const res = await fetchPenaltiesFromSheet(undefined, forceRefresh);
      if (res.success && res.data.length > 0) {
        setItems(res.data);
        setLastUpdated(res.lastUpdated);
        setDataSource(res.source);
      } else {
        setErrorMsg('Không thể tải dữ liệu từ Google Sheet. Đang sử dụng dữ liệu mặc định.');
      }
    } catch (err: any) {
      setErrorMsg(`Lỗi đồng bộ: ${err?.message || 'Không kết nối được'}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check for query parameters in hash e.g. #/vi-pham?q=di-tre or ?q=di-tre
    const hash = window.location.hash;
    if (hash.includes('?q=')) {
      const queryPart = hash.split('?q=')[1];
      if (queryPart) {
        const decoded = decodeURIComponent(queryPart);
        setSearchQuery(decoded);
        setDebouncedQuery(decoded);
      }
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');
      if (q) {
        setSearchQuery(q);
        setDebouncedQuery(q);
      }
    }
  }, []);

  // --- Debounce Search Query (280ms) ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 280);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- Suggestions Dropdown Handler ---
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const suggs = getPenaltySuggestions(items, searchQuery, 6);
      setSuggestions(suggs);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, items]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetAllFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedSingleItem(null);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  // --- Search Results Computation ---
  const filteredResults = useMemo(() => {
    return searchPenaltyRules(items, debouncedQuery, 'ALL');
  }, [items, debouncedQuery]);

  // When clicking an ID from Chatbot or quick list
  const handleSelectPenaltyFromBot = (id: string) => {
    if (!id) return;
    const cleanId = String(id).replace(/^(?:#?ID|#)/i, '').trim();
    if (!cleanId) return;
    const fullId = `ID${cleanId}`;
    const matched = items.find((it) => {
      const itemCleanId = String(it.id || '').replace(/^(?:#?ID|#)/i, '').trim();
      return (
        itemCleanId.toLowerCase() === cleanId.toLowerCase() ||
        String(it.id || '').toLowerCase() === String(id).toLowerCase() ||
        String(it.id || '').toLowerCase() === fullId.toLowerCase()
      );
    });
    if (matched) {
      setSelectedSingleItem(matched);
    }
    setSearchQuery(fullId);
    setDebouncedQuery(fullId);
  };

  // Sync external selected penalty ID (e.g. from global Chatbot)
  useEffect(() => {
    if (selectedPenaltyId) {
      handleSelectPenaltyFromBot(selectedPenaltyId);
    }
  }, [selectedPenaltyId, selectedPenaltyTrigger, items]);

  // --- Hierarchy Tree Computation ---
  const hierarchyData = useMemo(() => {
    return buildPenaltyHierarchy(items);
  }, [items]);

  // --- Keyword Highlighting Component ---
  const HighlightedText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
    if (!text) return <span>Chưa có thông tin</span>;
    const cleanQuery = query.trim();
    if (!cleanQuery) return <span>{text}</span>;

    const normText = removeVietnameseTones(text).toLowerCase();
    const normPhrase = removeVietnameseTones(cleanQuery).toLowerCase();

    if (!normPhrase) return <span>{text}</span>;

    const matches: [number, number][] = [];
    let pIdx = normText.indexOf(normPhrase);
    while (pIdx !== -1) {
      matches.push([pIdx, pIdx + normPhrase.length]);
      pIdx = normText.indexOf(normPhrase, pIdx + 1);
    }

    if (matches.length === 0) return <span>{text}</span>;

    matches.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const merged: [number, number][] = [];
    let current = matches[0];

    for (let i = 1; i < matches.length; i++) {
      const next = matches[i];
      if (next[0] <= current[1]) {
        current = [current[0], Math.max(current[1], next[1])];
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);

    const segments: React.ReactNode[] = [];
    let lastIdx = 0;

    merged.forEach(([start, end], idx) => {
      if (start > lastIdx) {
        segments.push(<span key={`text-${idx}`}>{text.slice(lastIdx, start)}</span>);
      }
      segments.push(
        <mark
          key={`mark-${idx}`}
          className="bg-yellow-300 text-slate-900 font-bold px-0.5 rounded-xs"
        >
          {text.slice(start, end)}
        </mark>
      );
      lastIdx = end;
    });

    if (lastIdx < text.length) {
      segments.push(<span key="text-end">{text.slice(lastIdx)}</span>);
    }

    return <span>{segments}</span>;
  };

  const formatLastUpdated = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const secs = date.getSeconds().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${mins}:${secs} - ${day}/${month}/${year}`;
  };

  // Determine if single item view should be active (either directly selected or only 1 match found)
  const activeSingleItem = selectedSingleItem || (filteredResults.length === 1 ? filteredResults[0] : null);

  return (
    <div className="w-full pb-8 space-y-3">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-2xl text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. COMPACT TOP HEADER STRIP - BLUE BACKGROUND */}
      <div className="rounded-xl bg-blue-600 dark:bg-blue-700 text-white shadow-md border border-blue-500/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
            TRA CỨU NỘI DUNG VI PHẠM & MỨC XỬ PHẠT LONG CHÂU
          </h1>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-blue-100 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span>{formatLastUpdated(lastUpdated)}</span>
          </div>
          <CountdownTimerBadge
            initialSeconds={AUTO_REFRESH_SECONDS}
            isRefreshing={isRefreshing}
            resetTrigger={lastUpdated}
            onTimeout={() => loadData(true)}
            render={(seconds) => (
              <div
                className="flex items-center gap-1 bg-blue-800/60 px-2 py-0.5 rounded border border-blue-400/30"
                title={`Tự động tải lại sau ${seconds}s`}
              >
                <Clock className="w-3 h-3 text-amber-300" />
                <strong className="text-amber-200">{seconds}s</strong>
              </div>
            )}
          />
        </div>
      </div>

      {/* 1.5. BLINKING ATTENTION / NOTE PANEL (TOÀN BỘ PANEL NHẤP NHÁY) */}
      {!hiddenModules.includes('notice-panel') && (!isNoticePanelHidden ? (
        <div className="w-full bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-500 rounded-xl p-2.5 px-3.5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-pulse">
          <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 font-black text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wide bg-amber-200 dark:bg-amber-900/80 px-2 py-0.5 rounded-md shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                Lưu ý:
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-slate-800 dark:text-slate-200 leading-snug">
              <div className="inline-flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>Lũy kế vi phạm được tính trong 1 năm dương lịch</span>
              </div>

              <span className="hidden sm:inline text-amber-400 dark:text-amber-600 font-bold">•</span>

              <div className="inline-flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Tổng mức trừ thưởng trong tháng (nếu có) không được vượt quá mức thưởng tối đa của tháng vi phạm</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleNoticePanel}
            type="button"
            className="p-1 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer self-end sm:self-center shrink-0 flex items-center gap-1 text-[11px] font-bold"
            title="Ẩn module lưu ý"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ẩn lưu ý</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end">
          <button
            onClick={handleToggleNoticePanel}
            type="button"
            className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 px-3 py-1 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Hiện lại panel Lưu ý</span>
          </button>
        </div>
      ))}

      {/* 2. MAIN WORKSPACE: 3-COLUMN TABLE / 1-SCREEN VIEW */}
      <div className="w-full space-y-2.5">
        {/* SEARCH & QUICK TOOLBAR - 1x5 cm SEARCH INPUT */}
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
            {/* Search Input 1x5cm (~190px x 36px) */}
            <div className="flex items-center gap-2">
              <div className="w-[190px] h-[36px] relative flex items-center shrink-0">
                <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 absolute left-2.5 pointer-events-none" />
                <input
                  id="violation-search-input"
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                    setSelectedSingleItem(null);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Tìm kiếm..."
                  className="w-[190px] h-[36px] pl-7 pr-6 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedQuery('');
                      setSelectedSingleItem(null);
                      if (searchInputRef.current) searchInputRef.current.focus();
                    }}
                    type="button"
                    className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute left-0 top-full mt-1.5 w-72 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Gợi ý nội dung ({suggestions.length})
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto text-xs">
                      {suggestions.map((sugg, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setSearchQuery(sugg);
                            setShowSuggestions(false);
                            setSelectedSingleItem(null);
                            if (searchInputRef.current) searchInputRef.current.focus();
                          }}
                          className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-200 hover:text-blue-700 flex items-center gap-1.5"
                        >
                          <CornerDownRight className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="line-clamp-1">{sugg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Keyword tags */}
            <div className="flex items-center gap-1.5 flex-wrap max-w-full">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                Gợi ý:
              </span>
              {quickSearchTags.slice(0, 8).map((tag) => {
                const isActive = searchQuery.toLowerCase().trim() === tag.toLowerCase().trim();
                return (
                  <div key={tag} className="inline-flex items-center group">
                    <button
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          setSearchQuery('');
                          setDebouncedQuery('');
                          setSelectedSingleItem(null);
                        } else {
                          setSearchQuery(tag);
                          setSelectedSingleItem(null);
                          setShowSuggestions(false);
                        }
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      #{tag}
                    </button>
                  </div>
                );
              })}

              {/* Pin current search to suggestions if not in list */}
              {searchQuery.trim() &&
                !quickSearchTags.some(
                  (t) => t.toLowerCase() === searchQuery.trim().toLowerCase()
                ) && (
                  <button
                    type="button"
                    onClick={() => handlePinKeywordToQuickSearch(searchQuery)}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
                    title={`Ghim "${searchQuery}" vào danh sách gợi ý`}
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    <span>+ Ghim "{searchQuery.slice(0, 15)}..."</span>
                  </button>
                )}

              {/* Add Suggestion Inline / Button */}
              {isAddingQuickTag ? (
                <form
                  onSubmit={handleAddQuickTag}
                  className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-blue-500 rounded-md px-1.5 py-0.5"
                >
                  <input
                    autoFocus
                    type="text"
                    value={newQuickTagInput}
                    onChange={(e) => setNewQuickTagInput(e.target.value)}
                    placeholder="Nhập từ khóa..."
                    className="text-[11px] w-24 sm:w-32 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!newQuickTagInput.trim()}
                    className="p-0.5 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-40"
                    title="Thêm"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingQuickTag(false);
                      setNewQuickTagInput('');
                    }}
                    className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                    title="Hủy"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    requireAdminAuth(() => {
                      setIsAddingQuickTag(true);
                    });
                  }}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                  title="Thêm từ khóa gợi ý mới"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm gợi ý</span>
                </button>
              )}

              {/* Manage Suggestions Button */}
              <button
                type="button"
                onClick={() => {
                  requireAdminAuth(() => {
                    setIsManagingQuickTags(true);
                  });
                }}
                className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition-colors cursor-pointer"
                title="Quản lý danh sách gợi ý"
              >
                <Settings2 className="w-3 h-3" />
                <span className="hidden sm:inline">Quản lý</span>
              </button>

              {(searchQuery || selectedSingleItem) && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[11px] px-2 py-0.5 rounded-md font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition-colors"
                >
                  Xem tất cả
                </button>
              )}
            </div>
          </div>

          {/* 3. MAIN RESULTS CONTAINER */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <span>Đang tải dữ liệu quy định vi phạm...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Không tìm thấy quy định nào khớp với từ khóa "{debouncedQuery}".
              </p>
              <button
                onClick={resetAllFilters}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
              >
                Xem toàn bộ {items.length} quy định
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* 3-COLUMN TABLE WITH CLEAR VIBRANT COLORS & INNER SCROLL */
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto max-h-[calc(100vh-220px)] min-h-[480px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 shadow-xs">
                    <tr className="text-xs font-black uppercase tracking-wider">
                      <th className={`py-3 px-3.5 ${
                        !showOfficialColumn && !showProbationColumn
                          ? 'w-full'
                          : !showOfficialColumn || !showProbationColumn
                          ? 'w-[58%]'
                          : 'w-[42%]'
                      } bg-orange-600 text-white ${showOfficialColumn || showProbationColumn ? 'border-r border-orange-500' : ''}`}>
                        1. NỘI DUNG VI PHẠM & MÃ ID
                      </th>
                      {showOfficialColumn && (
                        <th className={`py-3 px-3.5 ${
                          !showProbationColumn ? 'w-[42%]' : 'w-[29%]'
                        } bg-blue-600 text-white ${showProbationColumn ? 'border-r border-blue-500' : ''}`}>
                          2. MỨC XỬ LÝ NV CHÍNH THỨC
                        </th>
                      )}
                      {showProbationColumn && (
                        <th className={`py-3 px-3.5 ${
                          !showOfficialColumn ? 'w-[42%]' : 'w-[29%]'
                        } bg-amber-500 text-slate-950`}>
                          3. MỨC XỬ LÝ NV THỬ VIỆC
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                    {filteredResults.map((item) => {
                      const isHighlighted = selectedSingleItem?.id === item.id;
                      return (
                        <tr
                          key={item.id}
                          id={`row-penalty-${item.id}`}
                          onClick={() => setSelectedSingleItem(item)}
                          className={`transition-colors cursor-pointer group ${
                            isHighlighted
                              ? 'bg-blue-100/70 dark:bg-blue-950/60 ring-2 ring-blue-500 ring-inset'
                              : 'hover:bg-blue-50/50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          {/* 1. NỘI DUNG VI PHẠM (CAM) */}
                          <td className={`py-3 px-3.5 align-top bg-orange-50/60 dark:bg-orange-950/20 ${
                            showOfficialColumn || showProbationColumn ? 'border-r-2 border-orange-200 dark:border-orange-900/60' : ''
                          }`}>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md font-mono font-black text-xs bg-red-600 text-white shadow-xs">
                                    #{item.id}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    {item.columnA} &gt; {item.columnB}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePinKeywordToQuickSearch(item.keyword.slice(0, 35));
                                    }}
                                    type="button"
                                    className="p-1 rounded text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition-colors"
                                    title="Ghim từ khóa này vào danh sách gợi ý tìm kiếm"
                                  >
                                    <BookmarkPlus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(`[Mã #${item.id}] ${item.keyword}`, `d-${item.id}`, 'Nội dung');
                                    }}
                                    type="button"
                                    className="p-1 rounded text-orange-700 hover:bg-orange-200 dark:hover:bg-orange-900/80 transition-colors"
                                    title="Copy nội dung vi phạm"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-slate-900 dark:text-slate-100 font-bold whitespace-pre-line leading-snug">
                                <HighlightedText text={item.keyword} query={debouncedQuery} />
                              </div>
                            </div>
                          </td>

                          {/* 2. NV CHÍNH THỨC (XANH DƯƠNG) */}
                          {showOfficialColumn && (
                            <td className={`py-3 px-3.5 align-top bg-blue-50/40 dark:bg-blue-950/20 ${
                              showProbationColumn ? 'border-r-2 border-blue-200 dark:border-blue-900/60' : ''
                            } relative group/cell`}>
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed flex-1">
                                    {item.officialEmployeePenalty || 'Chưa có thông tin'}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(item.officialEmployeePenalty, `g-${item.id}`, 'NV Chính thức');
                                    }}
                                    type="button"
                                    className="p-1 rounded text-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/80 opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
                                    title="Copy mức xử lý này"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* 3. NV THỬ VIỆC (VÀNG HỔ PHÁCH) */}
                          {showProbationColumn && (
                            <td className="py-3 px-3.5 align-top bg-amber-50/40 dark:bg-amber-950/20 relative group/cell">
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed flex-1">
                                    {item.probationEmployeePenalty || 'Chưa có thông tin'}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(item.probationEmployeePenalty, `h-${item.id}`, 'NV Thử việc');
                                    }}
                                    type="button"
                                    className="p-1 rounded text-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/80 opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
                                    title="Copy mức xử lý này"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            /* CARDS VIEW */
            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSingleItem(item)}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 hover:border-blue-400 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md font-mono font-black text-xs bg-red-600 text-white">
                      #{item.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.columnA} &gt; {item.columnB}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    <HighlightedText text={item.keyword} query={debouncedQuery} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TREE VIEW */
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto">
              {hierarchyData.map((groupA, idxA) => {
                const isExpandedA = expandedGroupsA[groupA.name] ?? (idxA === 0);
                return (
                  <div key={groupA.name} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedGroupsA((prev) => ({ ...prev, [groupA.name]: !isExpandedA }))}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs font-bold"
                    >
                      <span>{groupA.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpandedA ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpandedA && (
                      <div className="p-3 space-y-2">
                        {groupA.subGroups.map((subB) => (
                          <div key={subB.name} className="pl-2 border-l-2 border-blue-400 space-y-1 text-xs">
                            <span className="font-bold text-blue-600">{subB.name}</span>
                            {subB.categories.map((cat) => (
                              <div key={cat.name} className="pl-2 space-y-1">
                                {cat.items.map((it) => (
                                  <div
                                    key={it.id}
                                    onClick={() => setSelectedSingleItem(it)}
                                    className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2"
                                  >
                                    <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-red-600 text-white text-[10px]">
                                      #{it.id}
                                    </span>
                                    <span>{it.keyword}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* MANAGE QUICK SEARCH SUGGESTIONS MODAL */}
      {isManagingQuickTags && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Quản lý danh sách gợi ý tìm kiếm
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thêm, xóa hoặc khôi phục các từ khóa gợi ý tra cứu nhanh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManagingQuickTags(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Tag Input */}
            <form onSubmit={handleAddQuickTag} className="flex items-center gap-2">
              <input
                type="text"
                value={newQuickTagInput}
                onChange={(e) => setNewQuickTagInput(e.target.value)}
                placeholder="Nhập từ khóa gợi ý mới..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
              <button
                type="submit"
                disabled={!newQuickTagInput.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </form>

            {/* Tags List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Danh sách gợi ý ({quickSearchTags.length})</span>
                <button
                  type="button"
                  onClick={handleResetQuickTags}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi phục mặc định</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                {quickSearchTags.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-2xs group"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteQuickTag(tag, e)}
                      className="text-slate-400 hover:text-red-600 rounded p-0.5 transition-colors"
                      title={`Xóa gợi ý "${tag}"`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsManagingQuickTags(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN AUTH MODAL */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAdminAuthSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Xác thực Quản trị viên
                </h3>
                <p className="text-xs text-slate-500">
                  Vui lòng nhập mật khẩu quản trị để tiếp tục
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type={showAdminAuthPassword ? 'text' : 'password'}
                  autoFocus
                  value={adminAuthPassword}
                  onChange={(e) => setAdminAuthPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminAuthPassword(!showAdminAuthPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  {showAdminAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {adminAuthError && (
                <p className="text-[11px] text-rose-600 font-medium">{adminAuthError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdminAuthModalOpen(false);
                  setPendingAdminAction(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADMIN EDIT / ADD MODAL */}
      {isAdminModalOpen && (
        <AdminPenaltyModal
          item={editingAdminItem}
          onClose={() => {
            setIsAdminModalOpen(false);
            setEditingAdminItem(null);
          }}
          onSave={() => {
            loadData(true);
            showToast('Đã lưu thay đổi quy định vi phạm!');
          }}
        />
      )}
    </div>
  );
};
