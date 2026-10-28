import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  X,
  RotateCcw,
  ShieldAlert,
  Minus,
  Check,
  Plus,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  Barcode,
  Copy,
  ExternalLink,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import botAvatarPng from '../assets/images/bot_avatar.png';
import { PenaltyRuleItem } from '../types';
import { DEFAULT_PENALTY_DATA } from '../data/penaltiesData';
import {
  removeVietnameseTones,
  getChatbotPrompts,
  addChatbotPrompt,
  deleteChatbotPrompt
} from '../services/penaltyService';
import { lookupBarcode } from '../services/barcodeService';
import {
  checkSpamMessage,
  getSpamFilterConfig,
  SPAM_CONFIG_EVENT,
  SpamFilterConfig,
  fetchSpamFilterConfigFromServer
} from '../services/spamFilterService';

export type ChatbotMode = 'select_function' | 'vi_pham' | 'barcode';

interface PenaltyChatbotProps {
  items: PenaltyRuleItem[];
  onSelectPenaltyId: (id: string) => void;
  selectedPenaltyId?: string | null;
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
  onNavigate?: (nav: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestedIds?: string[];
  barcodeResult?: {
    productCode: string;
    barcode: string;
    productName?: string;
    isCustomGen?: boolean;
  };
  isFunctionSelectionPrompt?: boolean;
  timestamp: Date;
}

const DEFAULT_BARCODE_PROMPTS = [
  '00012345',
  '893500180012',
  '00098765',
  '00045678'
];

export const PenaltyChatbot: React.FC<PenaltyChatbotProps> = ({
  items,
  onSelectPenaltyId,
  selectedPenaltyId,
  isOpen,
  onToggleOpen,
  onNavigate
}) => {
  // Current active mode: 'select_function' (must select first) | 'vi_pham' | 'barcode'
  const [currentMode, setCurrentMode] = useState<ChatbotMode>('select_function');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào anh/chị! 👋 Em là Trợ lý ảo SSC.\nVui lòng chọn loại thông tin cần tra cứu trước để em hỗ trợ:',
      isFunctionSelectionPrompt: true,
      timestamp: new Date()
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [copiedBarcodeText, setCopiedBarcodeText] = useState<string | null>(null);

  // Suggested Prompts
  const [prompts, setPrompts] = useState<string[]>(() => getChatbotPrompts());
  const [isAddingPrompt, setIsAddingPrompt] = useState<boolean>(false);
  const [newPromptInput, setNewPromptInput] = useState<string>('');

  // Spam Keyword Filter Configuration
  const [spamConfig, setSpamConfig] = useState<SpamFilterConfig>(() => getSpamFilterConfig());

  useEffect(() => {
    fetchSpamFilterConfigFromServer().then((cfg) => {
      if (cfg) setSpamConfig(cfg);
    });
    const handleSpamConfigChange = () => {
      setSpamConfig(getSpamFilterConfig());
    };
    window.addEventListener(SPAM_CONFIG_EVENT, handleSpamConfigChange);
    return () => window.removeEventListener(SPAM_CONFIG_EVENT, handleSpamConfigChange);
  }, []);

  // Official Long Chau AI Mascot Avatar state
  const [botAvatar, setBotAvatar] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ssc_custom_bot_avatar_v2');
      if (saved) return saved;
      localStorage.removeItem('ssc_custom_bot_avatar');
    }
    return botAvatarPng;
  });
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setBotAvatar(result);
        localStorage.setItem('ssc_custom_bot_avatar_v2', result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('ssc_custom_bot_avatar_v2');
    localStorage.removeItem('ssc_custom_bot_avatar');
    setBotAvatar(botAvatarPng);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleAvatarFileSelect(file);
    }
  };

  // Admin Auth State for Chatbot Prompt Modifications
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
    } else {
      setAdminAuthError('Mật khẩu quản trị không chính xác. Vui lòng thử lại!');
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const newPromptInputRef = useRef<HTMLInputElement>(null);

  const handleAddNewPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newPromptInput.trim();
    if (!clean) return;
    requireAdminAuth(() => {
      const updated = addChatbotPrompt(clean);
      setPrompts(updated);
      setNewPromptInput('');
      setIsAddingPrompt(false);
    });
  };

  const handleDeletePrompt = (promptToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAdminAuth(() => {
      const updated = deleteChatbotPrompt(promptToDelete);
      setPrompts(updated);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isSearching, isOpen, currentMode]);

  // 5-minute Inactivity Timeout: reset chatbot to function selection if user does not interact for 5 minutes
  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 phút (300.000 ms)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionTimeRef = useRef<number>(Date.now());

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    lastInteractionTimeRef.current = Date.now();
    // Only run inactivity countdown when not in select_function mode
    inactivityTimerRef.current = setTimeout(() => {
      setCurrentMode('select_function');
      setMessages((prev) => [
        ...prev,
        {
          id: `timeout-reset-${Date.now()}`,
          sender: 'bot',
          text: '⏱️ Đã qua 5 phút shop không tương tác với Chatbot. Vui lòng bấm chọn chức năng tra cứu bên dưới để tiếp tục:',
          isFunctionSelectionPrompt: true,
          timestamp: new Date()
        }
      ]);
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimer, INACTIVITY_TIMEOUT_MS]);

  useEffect(() => {
    if (isOpen && currentMode !== 'select_function') {
      resetInactivityTimer();
    } else {
      clearInactivityTimer();
    }
    return () => {
      clearInactivityTimer();
    };
  }, [isOpen, currentMode, resetInactivityTimer, clearInactivityTimer]);

  // Mode Selection Handler
  const handleSelectFunction = (mode: ChatbotMode) => {
    lastInteractionTimeRef.current = Date.now();

    if (mode === 'select_function') {
      clearInactivityTimer();
      setCurrentMode('select_function');
      setMessages((prev) => [
        ...prev,
        {
          id: `mode-reset-${Date.now()}`,
          sender: 'bot',
          text: 'Vui lòng chọn thông tin cần tra cứu bên dưới:',
          isFunctionSelectionPrompt: true,
          timestamp: new Date()
        }
      ]);
      return;
    }

    setCurrentMode(mode);
    resetInactivityTimer();

    if (mode === 'vi_pham') {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-pick-${Date.now()}`,
          sender: 'user',
          text: 'Tra cứu vi phạm & mức xử phạt',
          timestamp: new Date()
        },
        {
          id: `bot-confirm-${Date.now()}`,
          sender: 'bot',
          text: '👉 **Chế độ: Tra cứu Vi phạm**\nAnh/chị hãy nhập tình huống hoặc hành vi cần tra cứu (ví dụ: *đi trễ, bán lẻ, giao nhầm, thái độ...*), em sẽ tìm và trả lời gợi ý mã ID vi phạm tương ứng.',
          timestamp: new Date()
        }
      ]);
    } else if (mode === 'barcode') {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-pick-${Date.now()}`,
          sender: 'user',
          text: 'Tra cứu Barcode sản phẩm',
          timestamp: new Date()
        },
        {
          id: `bot-confirm-${Date.now()}`,
          sender: 'bot',
          text: '👉 **Chế độ: Tra cứu Barcode**\nVui lòng nhập mã sản phẩm (**yêu cầu ít nhất 8 ký tự**) để em tra cứu và trả về Barcode số.',
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    setCopiedBarcodeText(barcode);
    setTimeout(() => {
      setCopiedBarcodeText(null);
    }, 2500);
  };

  /**
   * Search violation items and return ONLY the matching IDs ranked by relevance score
   */
  const findMatchingIds = (query: string): string[] => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const searchItems = items && items.length > 0 ? items : DEFAULT_PENALTY_DATA;
    const normQuery = removeVietnameseTones(cleanQuery).toLowerCase();
    const queryWords = normQuery.split(/\s+/).filter((w) => w.length > 1);

    // Direct ID search (e.g. "ID57" or "57")
    const idMatch = cleanQuery.match(/(?:ID|id|mã|ma)?\s*#?([0-9]{1,4})/);
    if (idMatch && idMatch[1]) {
      const targetId = idMatch[1];
      const directItem = searchItems.find(
        (it) => it.id === targetId || it.id.toLowerCase() === `id${targetId}`.toLowerCase()
      );
      if (directItem) {
        return [directItem.id];
      }
    }

    const scored = searchItems.map((item) => {
      let score = 0;
      const normD = removeVietnameseTones(item.keyword || '').toLowerCase();
      const normDesc = removeVietnameseTones(item.description || '').toLowerCase();
      const normA = removeVietnameseTones(item.columnA || '').toLowerCase();
      const normB = removeVietnameseTones(item.columnB || '').toLowerCase();
      const normC = removeVietnameseTones(item.columnC || '').toLowerCase();
      const normG = removeVietnameseTones(item.officialEmployeePenalty || '').toLowerCase();
      const normH = removeVietnameseTones(item.probationEmployeePenalty || '').toLowerCase();
      const customKws = (item.customKeywords || []).map((k) =>
        removeVietnameseTones(k).toLowerCase()
      );

      // 1. Exact phrase match in main violation keyword (Col D)
      if (normD.includes(normQuery)) {
        score += 100;
        if (normD.startsWith(normQuery)) score += 30;
      }

      // 2. Custom keywords match
      if (customKws.some((k) => k.includes(normQuery))) {
        score += 80;
      }

      // 3. Word matches in Col D
      queryWords.forEach((word) => {
        if (normD.includes(word)) score += 20;
        if (customKws.some((k) => k.includes(word))) score += 15;
        if (normDesc.includes(word)) score += 10;
        if (normA.includes(word) || normB.includes(word) || normC.includes(word)) score += 5;
        if (normG.includes(word) || normH.includes(word)) score += 5;
      });

      return { id: item.id, score };
    });

    const results = scored
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4) // Top 1-4 matches
      .map((entry) => entry.id);

    return results;
  };

  /**
   * Main Send Message Dispatcher:
   * 1. If mode is select_function -> asks user to choose button first
   * 2. If mode is vi_pham -> keeps existing violation lookup rule
   * 3. If mode is barcode -> requires code >= 8 chars and returns numeric barcode
   */
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuestion).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');

    const now = Date.now();
    const isInactiveFor5Mins =
      lastInteractionTimeRef.current > 0 &&
      now - lastInteractionTimeRef.current >= INACTIVITY_TIMEOUT_MS;

    // CASE 0: User has not selected a function yet OR user was inactive for >= 5 minutes
    if (currentMode === 'select_function' || isInactiveFor5Mins) {
      clearInactivityTimer();
      setCurrentMode('select_function');
      lastInteractionTimeRef.current = now;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-require-select-${now}`,
          sender: 'bot',
          text: isInactiveFor5Mins
            ? '⏱️ Đã qua 5 phút anh/chị không tương tác với Chatbot. Vui lòng bấm chọn lại chức năng tra cứu bên dưới trước khi em hỗ trợ trả lời:'
            : '⚠️ Vui lòng chọn chức năng tra cứu bên dưới trước để em hỗ trợ chính xác:',
          isFunctionSelectionPrompt: true,
          timestamp: new Date()
        }
      ]);
      return;
    }

    lastInteractionTimeRef.current = now;
    resetInactivityTimer();

    // SPAM KEYWORD FILTER: If message hits any configured spam keyword, reply with configured scenario
    const spamMatch = checkSpamMessage(text, spamConfig);
    if (spamMatch && spamMatch.isSpam) {
      const botSpamMsg: ChatMessage = {
        id: `bot-spam-${Date.now()}`,
        sender: 'bot',
        text: spamMatch.replyText,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botSpamMsg]);
      return;
    }

    setIsSearching(true);

    // CASE 1: VI PHẠM (Giữ rule hiện tại)
    if (currentMode === 'vi_pham') {
      setTimeout(() => {
        const matchIds = findMatchingIds(text);

        let botResponseText = '';
        if (matchIds.length === 0) {
          botResponseText = 'Không tìm thấy mã ID vi phạm phù hợp với tình huống trên.';
        } else if (matchIds.length === 1) {
          botResponseText = `👉 Mã vi phạm: ID${matchIds[0].replace(/^ID/i, '')}`;
        } else {
          const idListStr = matchIds.map((id) => `ID${id.replace(/^ID/i, '')}`).join(', ');
          botResponseText = `👉 Mã vi phạm: ${idListStr}`;
        }

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botResponseText,
          suggestedIds: matchIds,
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsSearching(false);

        // Auto-trigger the first ID on main screen if exactly 1 found
        if (matchIds.length === 1) {
          onSelectPenaltyId(matchIds[0]);
        }
      }, 250);
      return;
    }

    // CASE 2: BARCODE (Yêu cầu nhập mã sản phẩm ít nhất 8 ký tự, trả về barcode số)
    if (currentMode === 'barcode') {
      // Rule: Phải có ít nhất 8 ký tự
      if (text.length < 8) {
        setTimeout(() => {
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `⚠️ Mã sản phẩm phải có ít nhất 8 ký tự (bạn vừa nhập ${text.length} ký tự: "${text}").\n\nVui lòng kiểm tra và nhập lại mã sản phẩm từ 8 ký tự trở lên (ví dụ: 00012345, 893500180012...)!`,
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsSearching(false);
        }, 150);
        return;
      }

      // Valid length >= 8 characters -> Look up Barcode
      try {
        const lookupResult = await lookupBarcode(text);

        if (lookupResult.success && lookupResult.product && lookupResult.product.barcode) {
          const found = lookupResult.product;
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `👉 Barcode số: ${found.barcode}`,
            barcodeResult: {
              productCode: found.productCode,
              barcode: found.barcode,
              productName: found.productName
            },
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, botMsg]);
        } else {
          // If not in Google Sheet database, return the numeric barcode based on product code
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `👉 Barcode số: ${text}`,
            barcodeResult: {
              productCode: text,
              barcode: text,
              productName: 'Mã vạch tiêu chuẩn Code128 theo mã sản phẩm',
              isCustomGen: true
            },
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, botMsg]);
        }
      } catch (err) {
        // Fallback: return barcode number
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `👉 Barcode số: ${text}`,
          barcodeResult: {
            productCode: text,
            barcode: text,
            isCustomGen: true
          },
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMsg]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleResetChat = () => {
    clearInactivityTimer();
    lastInteractionTimeRef.current = Date.now();
    setCurrentMode('select_function');
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Xin chào anh/chị! 👋 Em là Trợ lý ảo SSC.\nVui lòng chọn loại thông tin cần tra cứu trước để em hỗ trợ:',
        isFunctionSelectionPrompt: true,
        timestamp: new Date()
      }
    ]);
  };

  // IF COLLAPSED: Render floating pill button in the bottom right corner
  if (!isOpen) {
    return (
      <div className="fixed bottom-5 right-5 z-40 group">
        <button
          onClick={() => onToggleOpen(true)}
          type="button"
          className="px-4 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition flex items-center gap-2.5 border border-slate-700 dark:border-slate-200 cursor-pointer"
          title="Mở Trợ lý ảo SSC Bot (Tra cứu Vi phạm & Barcode)"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SSC BOT · Tra cứu (Vi phạm &amp; Barcode)</span>
        </button>
      </div>
    );
  }

  // IF OPEN: Render floating window
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`fixed bottom-6 right-6 z-45 w-84 sm:w-96 max-w-[calc(100vw-32px)] h-[540px] max-h-[calc(100vh-90px)] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 ${
        isDraggingFile
          ? 'border-dashed border-4 border-amber-400 ring-4 ring-amber-300/40'
          : 'border-blue-500/80 dark:border-blue-600'
      }`}
    >
      {/* Hidden File Input for Custom Avatar */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleAvatarFileSelect(f);
        }}
      />

      {/* Drag and drop overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-blue-900/90 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in">
          <Upload className="w-12 h-12 text-amber-300 animate-bounce mb-2" />
          <p className="text-sm font-black uppercase tracking-wide">
            Thả file ảnh AI LC.png vào đây
          </p>
          <p className="text-xs text-blue-100 mt-1">
            Icon chatbot sẽ được cập nhật ngay lập tức
          </p>
        </div>
      )}

      {/* Header */}
      <div className="px-3 py-2 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <img
              src={botAvatar}
              alt="Dược sĩ AI Long Châu"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = botAvatarPng;
              }}
              className="w-8 h-8 rounded-full object-cover border-2 border-white/80 shadow-xs bg-white"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-700 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black tracking-tight leading-tight">
                SSC BOT TRA CỨU
              </h3>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Online
              </span>
              {botAvatar !== botAvatarPng && (
                <button
                  type="button"
                  onClick={handleResetAvatar}
                  className="text-[9px] text-blue-200 hover:text-white underline cursor-pointer"
                  title="Đặt lại icon mặc định"
                >
                  (Đặt lại)
                </button>
              )}
            </div>
            <p className="text-[10px] text-blue-100 leading-none">
              {currentMode === 'vi_pham'
                ? 'Đang hỗ trợ: Tra cứu Vi phạm'
                : currentMode === 'barcode'
                ? 'Đang hỗ trợ: Tra cứu Barcode'
                : 'Hỗ trợ Vi phạm & Barcode'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">

          <button
            onClick={handleResetChat}
            type="button"
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Bắt đầu lại & chọn chức năng"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleOpen(false)}
            type="button"
            className="p-1 rounded-md text-white/90 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Thu gọn thành icon"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleOpen(false)}
            type="button"
            className="p-1 rounded-md text-white/90 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Đóng cửa sổ chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Mode Indicator Bar with Switch Button */}
      <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-1.5 font-bold">
          {currentMode === 'vi_pham' ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-rose-700 dark:text-rose-300">Chức năng: Tra cứu Vi phạm</span>
            </>
          ) : currentMode === 'barcode' ? (
            <>
              <Barcode className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-blue-700 dark:text-blue-300">Chức năng: Tra cứu Barcode</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-600 dark:text-slate-300">Chọn thông tin tra cứu</span>
            </>
          )}
        </div>

        {currentMode !== 'select_function' && (
          <button
            type="button"
            onClick={() => handleSelectFunction('select_function')}
            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            title="Đổi chức năng tra cứu"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Đổi chức năng</span>
          </button>
        )}
      </div>

      {/* Message History */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-end gap-1.5 max-w-[92%]">
              {msg.sender === 'bot' && (
                <img
                  src={botAvatar}
                  alt="Dược sĩ AI Long Châu"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = botAvatarPng;
                  }}
                  className="w-6 h-6 rounded-full object-cover border border-blue-300 dark:border-blue-700 shrink-0 shadow-2xs mb-0.5 bg-white"
                />
              )}
              <div
                className={`px-3 py-2 rounded-xl shadow-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 font-semibold'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Function Selection Buttons (Shown when user is prompted to choose) */}
                {msg.isFunctionSelectionPrompt && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider">
                      Vui lòng bấm chọn chức năng:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {/* Button 1: Tra cứu vi phạm */}
                      <button
                        type="button"
                        onClick={() => handleSelectFunction('vi_pham')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 transition cursor-pointer group shadow-2xs text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-rose-500 text-white shrink-0 shadow-xs">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-rose-950 dark:text-rose-100">
                              1. Tra cứu Vi phạm &amp; Mức xử phạt
                            </div>
                            <div className="text-[10px] text-rose-600 dark:text-rose-300 font-normal">
                              Quy chế kỷ luật &amp; gợi ý mã ID
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      {/* Button 2: Tra cứu Barcode */}
                      <button
                        type="button"
                        onClick={() => handleSelectFunction('barcode')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 transition cursor-pointer group shadow-2xs text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 shadow-xs">
                            <Barcode className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-blue-950 dark:text-blue-100">
                              2. Tra cứu Barcode sản phẩm
                            </div>
                            <div className="text-[10px] text-blue-600 dark:text-blue-300 font-normal">
                              Nhập mã SP (≥ 8 ký tự) nhận Barcode số
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Clickable ID Buttons when Bot suggests violation IDs */}
                {msg.suggestedIds && msg.suggestedIds.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      Bấm để xem ngay:
                    </span>
                    {msg.suggestedIds.map((id) => {
                      const cleanId = String(id).replace(/^(?:#?ID|#)/i, '').trim();
                      const displayLabel = `#ID${cleanId}`;
                      const isSelected =
                        Boolean(selectedPenaltyId) &&
                        String(selectedPenaltyId).replace(/^(?:#?ID|#)/i, '').trim().toLowerCase() ===
                          cleanId.toLowerCase();
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onSelectPenaltyId(id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono font-black text-xs transition-all shadow-xs cursor-pointer ${
                            isSelected
                              ? 'bg-red-600 text-white ring-2 ring-red-400'
                              : 'bg-red-50 hover:bg-red-600 text-red-700 hover:text-white dark:bg-red-950/80 dark:text-red-300 dark:hover:bg-red-700 border border-red-200 dark:border-red-800'
                          }`}
                          title={`Xem chi tiết ${displayLabel}`}
                        >
                          <span>{displayLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Barcode Number Result Card */}
                {msg.barcodeResult && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        MÃ BARCODE SỐ:
                      </span>

                      <div className="font-mono text-base font-black tracking-wider text-slate-900 dark:text-white mt-1 select-all">
                        {msg.barcodeResult.barcode}
                      </div>

                      {msg.barcodeResult.productName && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                          📦 {msg.barcodeResult.productName}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 px-1 font-mono">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isSearching && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-1">
            <img
              src={botAvatar}
              alt="Dược sĩ AI Long Châu"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = botAvatarPng;
              }}
              className="w-5 h-5 rounded-full object-cover border border-blue-300 animate-spin bg-white"
            />
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-[11px] font-medium italic">
              {currentMode === 'barcode' ? 'Đang tra cứu Barcode số...' : 'Đang tra cứu mã ID vi phạm...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts depending on mode */}
      <div className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
          <span className="text-slate-400 dark:text-slate-500 font-bold whitespace-nowrap">
            Gợi ý:
          </span>

          {currentMode === 'select_function' && (
            <>
              <button
                type="button"
                onClick={() => handleSelectFunction('vi_pham')}
                className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold cursor-pointer whitespace-nowrap"
              >
                1. Tra cứu Vi phạm
              </button>
              <button
                type="button"
                onClick={() => handleSelectFunction('barcode')}
                className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold cursor-pointer whitespace-nowrap"
              >
                2. Tra cứu Barcode
              </button>
            </>
          )}

          {currentMode === 'barcode' && (
            <>
              {DEFAULT_BARCODE_PROMPTS.map((sampleCode, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(sampleCode)}
                  className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-mono hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap cursor-pointer transition"
                >
                  {sampleCode}
                </button>
              ))}
            </>
          )}

          {currentMode === 'vi_pham' && (
            <>
              {prompts.map((prompt, pIdx) => (
                <div
                  key={pIdx}
                  className="inline-flex items-center gap-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 pl-2 pr-1 py-0.5 whitespace-nowrap group hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer"
                  >
                    {prompt}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeletePrompt(prompt, e)}
                    className="text-slate-400 hover:text-red-500 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Xóa gợi ý này"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {isAddingPrompt ? (
                <form onSubmit={handleAddNewPrompt} className="inline-flex items-center gap-1">
                  <input
                    ref={newPromptInputRef}
                    autoFocus
                    type="text"
                    value={newPromptInput}
                    onChange={(e) => setNewPromptInput(e.target.value)}
                    placeholder="Nhập gợi ý mới..."
                    className="w-28 text-[10px] px-2 py-0.5 bg-white dark:bg-slate-900 border border-blue-500 rounded-full focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newPromptInput.trim()}
                    className="p-0.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-40"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPrompt(false);
                      setNewPromptInput('');
                    }}
                    className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    requireAdminAuth(() => {
                      setIsAddingPrompt(true);
                    });
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800/60 whitespace-nowrap cursor-pointer transition-colors"
                  title="Thêm gợi ý câu hỏi mới"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Thêm gợi ý</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={
            currentMode === 'select_function'
              ? 'Vui lòng chọn chức năng tra cứu bên trên 👆...'
              : currentMode === 'barcode'
              ? 'Nhập mã sản phẩm (ít nhất 8 ký tự)...'
              : 'Hỏi tình huống (vd: đi trễ, bán lẻ, giao nhầm...)...'
          }
          className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isSearching}
          className="p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
          title="Gửi câu hỏi tra cứu"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* ADMIN AUTH MODAL FOR CHATBOT */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAdminAuthSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 max-w-xs w-full space-y-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                  Xác thực Quản trị
                </h3>
                <p className="text-[11px] text-slate-500">
                  Nhập mật khẩu quản trị để điều chỉnh
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type={showAdminAuthPassword ? 'text' : 'password'}
                  autoFocus
                  value={adminAuthPassword}
                  onChange={(e) => setAdminAuthPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminAuthPassword(!showAdminAuthPassword)}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showAdminAuthPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {adminAuthError && (
                <p className="text-[10px] text-rose-600 font-medium">{adminAuthError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAdminAuthModalOpen(false);
                  setPendingAdminAction(null);
                }}
                className="px-2.5 py-1 rounded text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
