import React, { useState, useEffect, useRef } from 'react';
import { SheetSourceConfig, PromotionRoundKey, ProductItem } from '../../types';
import { fetchPromotionRoundData } from '../../services/sheetService';
import { matchesQuery } from '../../utils/vietnameseSearch';
import { Bot, X, Send, Sparkles, Gift, Compass, Copy, ArrowRight, MessageSquare, RefreshCw, ExternalLink } from 'lucide-react';
import botAvatarPng from '../../assets/images/bot_avatar.png';
import { extractProductCodeAndLink } from '../../utils/productUtils';
import { PROMOTION_ROUNDS } from '../../config/sheetsConfig';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  recommendedProducts?: ProductItem[];
  suggestedIslandNumber?: number;
  suggestedRoundKey?: PromotionRoundKey;
  time: string;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  sheetConfig: SheetSourceConfig;
  refreshKey: number;
  activeRoundKey?: PromotionRoundKey;
  onNavigateToIslandAndRound?: (roundKey: PromotionRoundKey, islandNumber: number) => void;
  onCopySuccess?: (code: string) => void;
}

const QUICK_PROMPTS = [
  'Đảo 5 có quà tặng gì?',
  'Đảo 1 có những quà gì?',
  'Mua gì để được tặng quà Đợt 5?',
  'Mốc chi tiêu 500k tặng quà gì?',
  'Đợt 5 diễn ra khi nào?'
];

export const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
  onOpen,
  sheetConfig,
  refreshKey,
  activeRoundKey = 'dot5',
  onNavigateToIslandAndRound,
  onCopySuccess
}) => {
  const roundKey: PromotionRoundKey = (activeRoundKey as PromotionRoundKey) || 'dot5';
  const currentRound = PROMOTION_ROUNDS.find((r) => r.tabKey === roundKey) || PROMOTION_ROUNDS[PROMOTION_ROUNDS.length - 1];
  const roundTitle = currentRound.title;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Chào anh/chị! Em là Trợ lý AI Tra Cứu Quà Tặng 12 Đảo FPT Long Châu 🏝️ (Đợt đang chạy: ${roundTitle}). Anh/chị cần tra cứu quà tặng, mốc chi tiêu hay sản phẩm nào cứ hỏi em nhé!`,
      time: 'Vừa xong'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [roundProducts, setRoundProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Preload round products for instant intelligent answers
  useEffect(() => {
    fetchPromotionRoundData(roundKey, sheetConfig).then((res) => {
      if (res.data) {
        setRoundProducts(res.data);
      }
    });
  }, [sheetConfig, refreshKey, roundKey]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (queryText?: string) => {
    const text = (queryText || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      // Analyze question and search roundProducts
      const lower = text.toLowerCase();
      let replyText = '';
      let matched: ProductItem[] = [];
      let islandNum: number | undefined = undefined;

      // Check island specific question (e.g. "đảo 3", "đảo 1", "đảo 11")
      const islandMatch = lower.match(/(?:đảo|dao)\s*(\d+)/i);
      if (islandMatch && islandMatch[1]) {
        islandNum = parseInt(islandMatch[1], 10);
        matched = roundProducts.filter((p) => p.islandNumber === islandNum);
        replyText = `Tại Đảo ${islandNum} (${roundTitle}), hiện có ${matched.length} sản phẩm quà tặng:`;
      } else if (lower.includes('thời gian') || lower.includes('khi nào') || lower.includes('diễn ra') || lower.includes('ngay')) {
        replyText = `Chương trình ${roundTitle} diễn ra trong thời gian: ${currentRound.dateRange} trên toàn bộ hệ thống FPT Long Châu với 12 Đảo Quà Tặng đặc biệt!`;
      } else {
        // Keyword match
        matched = roundProducts.filter((p) =>
          matchesQuery([p.maSanPham, p.tenSanPham, p.quaTang, p.moTa, p.mocChiTieu, p.dao], text)
        );

        if (matched.length > 0) {
          replyText = `Dạ, em tìm thấy ${matched.length} sản phẩm phù hợp với yêu cầu của anh/chị (${roundTitle}):`;
          islandNum = matched[0].islandNumber;
        } else {
          replyText = `Em chưa tìm thấy quà tặng khớp chính xác với "${text}". Anh/chị có thể xem thêm ở thanh tìm kiếm hoặc chọn các câu hỏi gợi ý bên dưới nha!`;
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        recommendedProducts: matched.slice(0, 4),
        suggestedIslandNumber: islandNum,
        suggestedRoundKey: roundKey,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsLoading(false);
    }, 400);
  };

  return (
    <>
      {/* Floating Widget Launcher when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xl shadow-cyan-600/30 font-bold text-xs sm:text-sm cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
          title={`Mở Trợ lý AI Tra Cứu ${roundTitle}`}
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <span>Trợ Lý {roundTitle}</span>
        </button>
      )}

      {/* Chatbot Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-end sm:justify-end sm:p-6"
          onClick={onClose}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:w-[420px] h-[580px] max-h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
                  <Bot className="w-5 h-5 text-cyan-200" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black tracking-tight uppercase">
                      TRỢ LÝ AI {roundTitle}
                    </h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950">
                      12 ĐẢO QUÀ
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-100 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đang chạy: {roundTitle} ({currentRound.dateRange})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 ml-1" />
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-500 hover:text-cyan-600 whitespace-nowrap cursor-pointer transition-colors shadow-2xs shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 dark:bg-slate-950/40">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
                  >
                    {isBot && (
                      <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`space-y-2 max-w-[85%] ${isBot ? '' : 'text-right'}`}>
                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                          isBot
                            ? 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-xs font-medium'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Product Recommendation Cards inside chat */}
                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="space-y-2 pt-1 text-left">
                          {msg.recommendedProducts.map((p) => {
                            const parsed = p.linkUrl
                              ? { code: p.maSanPham, linkUrl: p.linkUrl }
                              : extractProductCodeAndLink(p.maSanPham);
                            const cleanCode = parsed.code;
                            const activeLink = parsed.linkUrl;

                            return (
                              <div
                                key={p.id}
                                className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-cyan-200 dark:border-cyan-900 shadow-2xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                                    {p.dao}
                                  </span>
                                  {onNavigateToIslandAndRound && p.islandNumber && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onNavigateToIslandAndRound(roundKey, p.islandNumber);
                                        onClose();
                                      }}
                                      className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <span>Tới đảo này</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                                  {p.tenSanPham}
                                </p>

                                <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                                  🎁 {p.quaTang}
                                </div>

                                <div className="text-[10px] text-slate-500">
                                  <span>Mốc chi tiêu: {p.mocChiTieu}</span>
                                </div>

                                {/* Bottom: Product code & action buttons */}
                                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-[10px]">
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 font-semibold">Mã:</span>
                                    {activeLink ? (
                                      <a
                                        href={activeLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
                                        title="Nhấp để truy cập link sản phẩm"
                                      >
                                        <span>{cleanCode}</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    ) : (
                                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{cleanCode}</span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {activeLink && (
                                      <a
                                        href={activeLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px]"
                                      >
                                        <ExternalLink className="w-2.5 h-2.5" />
                                        <span>Truy cập</span>
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(cleanCode);
                                        onCopySuccess?.(cleanCode);
                                      }}
                                      className="text-[10px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-bold cursor-pointer"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                      <span>Chép</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <span className="text-[9px] text-slate-400 block px-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Hỏi về quà tặng, sản phẩm, điều kiện Đợt 3..."
                  className="flex-1 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-cyan-500 font-medium"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
