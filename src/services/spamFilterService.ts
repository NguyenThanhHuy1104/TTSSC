import { removeVietnameseTones } from './penaltyService';

export interface SpamRule {
  id: string;
  keyword: string;
  customReply?: string; // Kịch bản phản hồi riêng (tùy chọn)
  enabled: boolean;
  createdAt: number;
}

export interface SpamFilterConfig {
  enabled: boolean;
  defaultReply: string; // Kịch bản phản hồi chung khi phát hiện từ khóa spam
  rules: SpamRule[];
}

export const SPAM_STORAGE_KEY = 'ssc_chatbot_spam_config_v1';
export const SPAM_CONFIG_EVENT = 'ssc_spam_config_updated';

export const DEFAULT_SPAM_REPLY =
  '⚠️ **Cảnh báo vi phạm nội dung:**\nTin nhắn của bạn chứa từ khóa không phù hợp hoặc mang tính chất spam. Trợ lý ảo SSC chỉ hỗ trợ tra cứu nghiệp vụ Quy chế xử lý kỷ luật và Barcode sản phẩm FPT Retail & Long Châu. Vui lòng gửi câu hỏi đúng quy định hỗ trợ công việc shop!';

export const DEFAULT_SPAM_RULES: SpamRule[] = [
  {
    id: 'spam-1',
    keyword: 'đm',
    customReply: '',
    enabled: true,
    createdAt: 1700000000001
  },
  {
    id: 'spam-2',
    keyword: 'dcm',
    customReply: '',
    enabled: true,
    createdAt: 1700000000002
  },
  {
    id: 'spam-3',
    keyword: 'vcl',
    customReply: '',
    enabled: true,
    createdAt: 1700000000003
  },
  {
    id: 'spam-4',
    keyword: 'chửi',
    customReply: '',
    enabled: true,
    createdAt: 1700000000004
  },
  {
    id: 'spam-5',
    keyword: 'lừa đảo',
    customReply: '',
    enabled: true,
    createdAt: 1700000000005
  },
  {
    id: 'spam-6',
    keyword: 'quảng cáo',
    customReply: '',
    enabled: true,
    createdAt: 1700000000006
  },
  {
    id: 'spam-7',
    keyword: 'vay tiền',
    customReply: '⚠️ Trợ lý ảo SSC không hỗ trợ các dịch vụ tài chính/vay tiền cá nhân. Vui lòng chỉ đặt câu hỏi liên quan đến nghiệp vụ shop!',
    enabled: true,
    createdAt: 1700000000007
  },
  {
    id: 'spam-8',
    keyword: 'cờ bạc',
    customReply: '',
    enabled: true,
    createdAt: 1700000000008
  }
];

export const DEFAULT_SPAM_CONFIG: SpamFilterConfig = {
  enabled: true,
  defaultReply: DEFAULT_SPAM_REPLY,
  rules: DEFAULT_SPAM_RULES
};

let inMemorySpamConfig: SpamFilterConfig = DEFAULT_SPAM_CONFIG;

/**
 * Fetch Spam Filter Configuration from server API (/api/config/spam-filter)
 * Ensures configuration is persisted on the server and survives publishes.
 */
export async function fetchSpamFilterConfigFromServer(): Promise<SpamFilterConfig> {
  try {
    const res = await fetch('/api/config/spam-filter');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.config) {
        inMemorySpamConfig = {
          enabled: typeof data.config.enabled === 'boolean' ? data.config.enabled : true,
          defaultReply: data.config.defaultReply || DEFAULT_SPAM_REPLY,
          rules: Array.isArray(data.config.rules) ? data.config.rules : DEFAULT_SPAM_RULES
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(SPAM_STORAGE_KEY, JSON.stringify(inMemorySpamConfig));
          window.dispatchEvent(new CustomEvent(SPAM_CONFIG_EVENT, { detail: inMemorySpamConfig }));
        }
        return inMemorySpamConfig;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch spam config from server, falling back to local:', err);
  }
  return getSpamFilterConfig();
}

/**
 * Load Spam Filter Configuration synchronously from memory, localStorage, or fallback
 */
export function getSpamFilterConfig(): SpamFilterConfig {
  if (typeof window === 'undefined') return inMemorySpamConfig || DEFAULT_SPAM_CONFIG;
  try {
    const raw = localStorage.getItem(SPAM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.enabled === 'boolean' && Array.isArray(parsed.rules)) {
        inMemorySpamConfig = {
          enabled: parsed.enabled,
          defaultReply: parsed.defaultReply || DEFAULT_SPAM_REPLY,
          rules: parsed.rules
        };
        return inMemorySpamConfig;
      }
    }
  } catch (e) {
    console.error('Failed to parse spam config from localStorage:', e);
  }
  return inMemorySpamConfig || DEFAULT_SPAM_CONFIG;
}

/**
 * Save Spam Filter Configuration to localStorage AND persist to server via POST /api/config/spam-filter
 */
export function saveSpamFilterConfig(config: SpamFilterConfig): void {
  inMemorySpamConfig = config;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SPAM_STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent(SPAM_CONFIG_EVENT, { detail: config }));
    } catch (e) {
      console.error('Failed to save spam config to localStorage:', e);
    }

    // Persist to server disk & memory so publish retains the config
    fetch('/api/config/spam-filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }).catch((err) => console.warn('Could not persist spam config to server:', err));
  }
}

/**
 * Reset Spam Filter Configuration to default
 */
export function resetSpamFilterConfig(): SpamFilterConfig {
  saveSpamFilterConfig(DEFAULT_SPAM_CONFIG);
  return DEFAULT_SPAM_CONFIG;
}

// Automatically kick off server sync on client startup
if (typeof window !== 'undefined') {
  fetchSpamFilterConfigFromServer().catch(() => {});
}

export interface SpamCheckResult {
  isSpam: boolean;
  matchedKeyword: string;
  replyText: string;
}

/**
 * Check if a user input contains any configured spam keyword.
 * Supports both exact token boundary and substring matching with Vietnamese diacritic normalization.
 */
export function checkSpamMessage(text: string, customConfig?: SpamFilterConfig): SpamCheckResult | null {
  const config = customConfig || getSpamFilterConfig();
  if (!config.enabled || !text || !text.trim()) {
    return null;
  }

  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();
  const normText = removeVietnameseTones(lowerText);

  // Extract individual words for token boundary checks (for very short keywords like "dm", "vl")
  const tokens = lowerText.split(/[\s,.;:!?_/\-+()"'`~@#$%^&*<>]+/).filter(Boolean);
  const normTokens = normText.split(/[\s,.;:!?_/\-+()"'`~@#$%^&*<>]+/).filter(Boolean);

  for (const rule of config.rules) {
    if (!rule.enabled) continue;
    const kw = (rule.keyword || '').trim().toLowerCase();
    if (!kw) continue;
    const normKw = removeVietnameseTones(kw);

    let isMatch = false;

    // For short keywords (<= 3 chars, e.g. "dm", "vcl", "vl", "đm"), require word match or word boundary to prevent false positives (like "admin")
    if (kw.length <= 3) {
      if (
        tokens.includes(kw) ||
        normTokens.includes(normKw) ||
        new RegExp(`(^|\\s|[^a-z0-9])${kw}($|\\s|[^a-z0-9])`, 'i').test(cleanText) ||
        new RegExp(`(^|\\s|[^a-z0-9])${normKw}($|\\s|[^a-z0-9])`, 'i').test(normText)
      ) {
        isMatch = true;
      }
    } else {
      // For longer keywords/phrases (e.g. "chửi thề", "quảng cáo", "lừa đảo"), check substring or norm substring
      if (lowerText.includes(kw) || normText.includes(normKw)) {
        isMatch = true;
      }
    }

    if (isMatch) {
      return {
        isSpam: true,
        matchedKeyword: rule.keyword,
        replyText: (rule.customReply && rule.customReply.trim()) || config.defaultReply || DEFAULT_SPAM_REPLY
      };
    }
  }

  return null;
}
