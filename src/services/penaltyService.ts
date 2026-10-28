import { PenaltyConfig, PenaltyHierarchyGroup, PenaltyRuleItem } from '../types';
import { DEFAULT_PENALTY_DATA } from '../data/penaltiesData';
import { removeVietnameseTones, prepareSearchIndex } from '../utils/vietnameseSearch';

export { removeVietnameseTones };

export const DEFAULT_PENALTY_CONFIG: PenaltyConfig = {
  SPREADSHEET_ID: '1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9',
  SHEET_GID: '935493309',
  SHEET_NAME: 'QuyDinhViPham',
  API_URL: '',
};

const CONFIG_KEY = 'ssc_penalty_custom_config_v1';
const CACHE_KEY = 'ssc_penalty_data_cache_v1';
const CACHE_TIME_KEY = 'ssc_penalty_cache_time_v1';
const CUSTOM_PENALTIES_KEY = 'ssc_custom_penalties_v1';
const QUICK_SEARCH_TAGS_KEY = 'ssc_quick_search_tags_v1';
const CHATBOT_PROMPTS_KEY = 'ssc_chatbot_prompts_v1';

export const DEFAULT_QUICK_SEARCH_TAGS: string[] = [
  'Đổi trả',
  'Bán hàng không xuất hóa đơn',
  'Lỗi thái độ',
  'Lỗi nghiệp vụ',
  'Giao nhầm thuốc',
  'Giao hàng',
  'Chụp toa thuốc',
  'Luân chuyển nội bộ',
  'CTKM',
  'Đi làm muộn',
  'Chấm công',
  'Hạn sử dụng',
  'Tiền mặt',
  'ID57',
  'ID95'
];

export const DEFAULT_CHATBOT_PROMPTS: string[] = [
  'Quên bấm vân tay / chấm công',
  'Giao nhầm thuốc cho khách',
  'Bán hàng không xuất hóa đơn VAT',
  'Làm mất chìa khóa két sắt / kho',
  'Đi làm trễ không báo trước',
  'Thái độ không chuẩn mực với khách',
  'Hàng cận date không báo cáo',
  'Tự ý đổi ca làm việc'
];

/**
 * Get quick search tags from localStorage or defaults
 */
export function getQuickSearchTags(): string[] {
  try {
    const saved = localStorage.getItem(QUICK_SEARCH_TAGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading quick search tags:', e);
  }
  return DEFAULT_QUICK_SEARCH_TAGS;
}

/**
 * Save quick search tags
 */
export function saveQuickSearchTags(tags: string[]): string[] {
  try {
    const clean = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
    localStorage.setItem(QUICK_SEARCH_TAGS_KEY, JSON.stringify(clean));
    return clean;
  } catch (e) {
    console.error('Error saving quick search tags:', e);
    return tags;
  }
}

/**
 * Add a single quick search tag
 */
export function addQuickSearchTag(tag: string): string[] {
  const clean = tag.trim();
  if (!clean) return getQuickSearchTags();
  const current = getQuickSearchTags();
  const exists = current.some((t) => t.toLowerCase() === clean.toLowerCase());
  if (exists) return current;
  const updated = [clean, ...current];
  return saveQuickSearchTags(updated);
}

/**
 * Delete a quick search tag
 */
export function deleteQuickSearchTag(tag: string): string[] {
  const current = getQuickSearchTags();
  const updated = current.filter((t) => t.toLowerCase() !== tag.trim().toLowerCase());
  return saveQuickSearchTags(updated);
}

/**
 * Reset quick search tags to default
 */
export function resetQuickSearchTags(): string[] {
  localStorage.setItem(QUICK_SEARCH_TAGS_KEY, JSON.stringify(DEFAULT_QUICK_SEARCH_TAGS));
  return DEFAULT_QUICK_SEARCH_TAGS;
}

/**
 * Get chatbot prompt suggestions from localStorage or defaults
 */
export function getChatbotPrompts(): string[] {
  try {
    const saved = localStorage.getItem(CHATBOT_PROMPTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading chatbot prompts:', e);
  }
  return DEFAULT_CHATBOT_PROMPTS;
}

/**
 * Save chatbot prompt suggestions
 */
export function saveChatbotPrompts(prompts: string[]): string[] {
  try {
    const clean = Array.from(new Set(prompts.map((p) => p.trim()).filter(Boolean)));
    localStorage.setItem(CHATBOT_PROMPTS_KEY, JSON.stringify(clean));
    return clean;
  } catch (e) {
    console.error('Error saving chatbot prompts:', e);
    return prompts;
  }
}

/**
 * Add a chatbot prompt suggestion
 */
export function addChatbotPrompt(prompt: string): string[] {
  const clean = prompt.trim();
  if (!clean) return getChatbotPrompts();
  const current = getChatbotPrompts();
  const exists = current.some((p) => p.toLowerCase() === clean.toLowerCase());
  if (exists) return current;
  const updated = [clean, ...current];
  return saveChatbotPrompts(updated);
}

/**
 * Delete a chatbot prompt suggestion
 */
export function deleteChatbotPrompt(prompt: string): string[] {
  const current = getChatbotPrompts();
  const updated = current.filter((p) => p.toLowerCase() !== prompt.trim().toLowerCase());
  return saveChatbotPrompts(updated);
}

/**
 * Reset chatbot prompts to defaults
 */
export function resetChatbotPrompts(): string[] {
  localStorage.setItem(CHATBOT_PROMPTS_KEY, JSON.stringify(DEFAULT_CHATBOT_PROMPTS));
  return DEFAULT_CHATBOT_PROMPTS;
}

// In-memory cache for ultra-fast instant searches
let inMemoryPenaltyList: PenaltyRuleItem[] | null = null;
let inMemoryLastFetchedTime: number = 0;

/**
 * Get custom penalty rules created by admin
 */
export function getCustomPenalties(): PenaltyRuleItem[] {
  try {
    const saved = localStorage.getItem(CUSTOM_PENALTIES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading custom penalties:', e);
  }
  return [];
}

/**
 * Save / Create / Update custom penalty item created by admin
 */
export function saveCustomPenalty(item: PenaltyRuleItem): PenaltyRuleItem[] {
  const current = getCustomPenalties();
  const existingIdx = current.findIndex((it) => it.id === item.id);
  const now = new Date().toISOString();
  
  const newItem: PenaltyRuleItem = {
    ...item,
    isCustom: true,
    updatedAt: now,
    createdAt: item.createdAt || now
  };

  let updated: PenaltyRuleItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = newItem;
  } else {
    updated = [newItem, ...current];
  }

  localStorage.setItem(CUSTOM_PENALTIES_KEY, JSON.stringify(updated));
  clearPenaltyCache();
  return updated;
}

/**
 * Delete a custom penalty rule
 */
export function deleteCustomPenalty(id: string): PenaltyRuleItem[] {
  const current = getCustomPenalties();
  const updated = current.filter((it) => it.id !== id);
  localStorage.setItem(CUSTOM_PENALTIES_KEY, JSON.stringify(updated));
  clearPenaltyCache();
  return updated;
}

/**
 * Merge base items with custom admin-added penalties
 */
export function mergeCustomPenalties(baseItems: PenaltyRuleItem[]): PenaltyRuleItem[] {
  const customItems = getCustomPenalties();
  if (customItems.length === 0) return baseItems;

  const customIds = new Set(customItems.map((c) => c.id));
  const filteredBase = baseItems.filter((b) => !customIds.has(b.id));
  return [...customItems, ...filteredBase];
}

/**
 * Convert items to Tab-Separated Values (TSV) for direct paste into Google Sheet
 */
export function exportPenaltiesToTSV(items: PenaltyRuleItem[]): string {
  const header = ['Cột A (Nhóm lớn)', 'Cột B (Nhóm nhỏ)', 'Cột C (Phân loại)', 'Cột D (Nội dung/Keyword)', 'Cột E (Mô tả)', 'Cột F (Ghi chú)', 'Cột G (NV Chính thức)', 'Cột H (NV Thử việc)'];
  const rows = items.map((it) => [
    it.columnA || '',
    it.columnB || '',
    it.columnC || '',
    it.keyword || '',
    it.description || '',
    it.columnF || '',
    it.officialEmployeePenalty || '',
    it.probationEmployeePenalty || ''
  ]);

  return [header.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
}


/**
 * Fetch penalty configuration from server API to persist across publishes & sessions
 */
export async function fetchPenaltyConfigFromServer(): Promise<PenaltyConfig> {
  try {
    const res = await fetch('/api/config/penalty');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.config) {
        const merged: PenaltyConfig = {
          ...DEFAULT_PENALTY_CONFIG,
          ...data.config
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch penalty config from server:', err);
  }
  return getPenaltyConfig();
}

/**
 * Get active configuration
 */
export function getPenaltyConfig(): PenaltyConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_PENALTY_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading penalty config:', e);
  }
  return DEFAULT_PENALTY_CONFIG;
}

/**
 * Save custom configuration to localStorage and persist to server disk
 */
export function savePenaltyConfig(config: Partial<PenaltyConfig>): void {
  const current = getPenaltyConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  clearPenaltyCache();

  fetch('/api/config/penalty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch((err) => console.warn('Could not sync penalty config to server:', err));
}

/**
 * Clear cache
 */
export function clearPenaltyCache(): void {
  inMemoryPenaltyList = null;
  inMemoryLastFetchedTime = 0;
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
}

/**
 * Clean cell text and sanitize line breaks
 */
function cleanCell(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    return val.trim();
  }
  return String(val).trim();
}

/**
 * Build hierarchical structure: Column A -> Column B -> Column C -> Column D Items
 */
export function buildPenaltyHierarchy(items: PenaltyRuleItem[]): PenaltyHierarchyGroup[] {
  const groupMap = new Map<string, Map<string, Map<string, PenaltyRuleItem[]>>>();

  for (const item of items) {
    const a = item.columnA || 'Khác';
    const b = item.columnB || 'Chung';
    const c = item.columnC || 'Tổng quát';

    if (!groupMap.has(a)) {
      groupMap.set(a, new Map());
    }
    const bMap = groupMap.get(a)!;

    if (!bMap.has(b)) {
      bMap.set(b, new Map());
    }
    const cMap = bMap.get(b)!;

    if (!cMap.has(c)) {
      cMap.set(c, []);
    }
    cMap.get(c)!.push(item);
  }

  const result: PenaltyHierarchyGroup[] = [];

  groupMap.forEach((bMap, groupNameA) => {
    const subGroups: { name: string; categories: { name: string; items: PenaltyRuleItem[] }[] }[] = [];

    bMap.forEach((cMap, subGroupNameB) => {
      const categories: { name: string; items: PenaltyRuleItem[] }[] = [];

      cMap.forEach((itemList, catNameC) => {
        categories.push({
          name: catNameC,
          items: itemList
        });
      });

      subGroups.push({
        name: subGroupNameB,
        categories
      });
    });

    result.push({
      name: groupNameA,
      subGroups
    });
  });

  return result;
}

/**
 * Search penalty rules with multi-keyword, fuzzy tone-insensitive matching
 * Prioritizes Column D matching first as specified by user intent.
 */
/**
 * Filter items by exact phrase query and violation content filter (Chỉ tìm kiếm theo cụm từ đã nhập)
 */
export function searchPenaltyRules(
  items: PenaltyRuleItem[],
  query: string,
  violationFilter?: string
): PenaltyRuleItem[] {
  let filtered = items;

  // Apply single violation content filter (Nội dung vi phạm) if selected
  if (violationFilter && violationFilter !== 'ALL') {
    filtered = filtered.filter((it) => it.keyword === violationFilter || it.id === violationFilter);
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return filtered;
  }

  const normalizedQuery = removeVietnameseTones(trimmed).toLowerCase();
  if (!normalizedQuery) {
    return filtered;
  }

  const cleanIdQuery = normalizedQuery.replace(/^(?:#?id|#)/i, '').trim();

  // Exact contiguous phrase search across fields (Chỉ cho tìm kiếm theo đúng cụm từ đã nhập)
  const scoredItems = filtered
    .map((item) => {
      const rawId = String(item.id || '');
      const normId = removeVietnameseTones(rawId).toLowerCase();
      const cleanItemId = normId.replace(/^(?:#?id|#)/i, '').trim();

      // Check direct ID match before searchIndex bail-out
      const isDirectIdMatch =
        normId === normalizedQuery ||
        (cleanIdQuery.length > 0 &&
          (cleanItemId === cleanIdQuery ||
            normId === `id${cleanIdQuery}` ||
            `id${cleanItemId}` === normalizedQuery));

      // Early bail-out using pre-computed search index (unless direct ID match)
      if (
        !isDirectIdMatch &&
        item.searchIndex &&
        !item.searchIndex.includes(normalizedQuery) &&
        !(cleanIdQuery && item.searchIndex.includes(cleanIdQuery))
      ) {
        return null;
      }

      const rawColD = item.keyword || '';
      const rawColE = item.description || '';
      const rawColA = item.columnA || '';
      const rawColB = item.columnB || '';
      const rawColC = item.columnC || '';
      const rawColF = item.columnF || '';
      const rawColG = item.officialEmployeePenalty || '';
      const rawColH = item.probationEmployeePenalty || '';
      const customKws = item.customKeywords || [];

      const normColD = removeVietnameseTones(rawColD).toLowerCase();
      const normColE = removeVietnameseTones(rawColE).toLowerCase();
      const normColA = removeVietnameseTones(rawColA).toLowerCase();
      const normColB = removeVietnameseTones(rawColB).toLowerCase();
      const normColC = removeVietnameseTones(rawColC).toLowerCase();
      const normColF = removeVietnameseTones(rawColF).toLowerCase();
      const normColG = removeVietnameseTones(rawColG).toLowerCase();
      const normColH = removeVietnameseTones(rawColH).toLowerCase();
      const normCustomKws = customKws.map((k) => removeVietnameseTones(k).toLowerCase());

      let score = 0;
      let matched = false;

      // 1. Direct ID exact or partial match
      if (isDirectIdMatch) {
        score += 100;
        matched = true;
      } else if (normId.includes(normalizedQuery) || (cleanIdQuery && cleanItemId === cleanIdQuery)) {
        score += 70;
        matched = true;
      }

      // 2. Exact phrase in Column D (Nội dung vi phạm / Keyword chính)
      if (normColD.includes(normalizedQuery)) {
        score += 60;
        if (normColD.startsWith(normalizedQuery)) {
          score += 25;
        }
        matched = true;
      }

      // 3. Exact phrase in Custom Keywords / Tags
      if (normCustomKws.some((kw) => kw.includes(normalizedQuery))) {
        score += 45;
        matched = true;
      }

      // 4. Exact phrase in Description (Mô tả chi tiết / Col E)
      if (normColE.includes(normalizedQuery)) {
        score += 30;
        matched = true;
      }

      // 5. Exact phrase in Official or Probation Penalties (Col G / Col H)
      if (normColG.includes(normalizedQuery) || normColH.includes(normalizedQuery)) {
        score += 20;
        matched = true;
      }

      // 6. Exact phrase in Group columns (Col A, Col B, Col C, Col F)
      if (
        normColB.includes(normalizedQuery) ||
        normColA.includes(normalizedQuery) ||
        normColC.includes(normalizedQuery) ||
        normColF.includes(normalizedQuery)
      ) {
        score += 10;
        matched = true;
      }

      return {
        item,
        score,
        matched
      };
    })
    .filter(
      (entry): entry is { item: PenaltyRuleItem; score: number; matched: boolean } =>
        Boolean(entry && entry.matched)
    )
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);

  return scoredItems;
}

/**
 * Get suggestions for the search box based on Column D
 */
export function getPenaltySuggestions(items: PenaltyRuleItem[], query: string, limit = 6): string[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 1) return [];

  const normQuery = removeVietnameseTones(trimmed);
  const suggestions = new Set<string>();

  for (const item of items) {
    if (!item.keyword) continue;
    const normD = removeVietnameseTones(item.keyword);
    if (normD.includes(normQuery)) {
      suggestions.add(item.keyword);
      if (suggestions.size >= limit) break;
    }
  }

  return Array.from(suggestions);
}

/**
 * Fetch penalties data from Google Sheet / Apps Script API / Local Cache
 */
export async function fetchPenaltiesFromSheet(
  customConfig?: PenaltyConfig,
  forceRefresh = false
): Promise<{
  success: boolean;
  data: PenaltyRuleItem[];
  message?: string;
  lastUpdated: Date;
  source: 'cache' | 'gviz' | 'gas' | 'default';
}> {
  const config = customConfig || getPenaltyConfig();

  // 1. If in-memory cache is valid and not forced refresh
  if (!forceRefresh && inMemoryPenaltyList && inMemoryPenaltyList.length > 0) {
    const finalData = mergeCustomPenalties(inMemoryPenaltyList);
    return {
      success: true,
      data: finalData,
      lastUpdated: new Date(inMemoryLastFetchedTime || Date.now()),
      source: 'cache'
    };
  }

  // 2. Check localStorage cache if not forced
  if (!forceRefresh) {
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      const cacheTimeStr = localStorage.getItem(CACHE_TIME_KEY);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryPenaltyList = parsed;
          inMemoryLastFetchedTime = cacheTimeStr ? Number(cacheTimeStr) : Date.now();
          const finalData = mergeCustomPenalties(parsed);
          return {
            success: true,
            data: finalData,
            lastUpdated: new Date(inMemoryLastFetchedTime),
            source: 'cache'
          };
        }
      }
    } catch (e) {
      console.warn('Could not read cached penalties:', e);
    }
  }

  // 3. If user provided Google Apps Script API URL, try that first
  if (config.API_URL && config.API_URL.trim().startsWith('http')) {
    try {
      const res = await fetch(config.API_URL.trim(), { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : json.data || json.items || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          const parsedItems: PenaltyRuleItem[] = rawList.map((row: any, idx: number) => ({
            id: row.id || `gas-${idx + 1}`,
            columnA: cleanCell(row.columnA || row.group1 || row['Cột A'] || row['Nhóm 1']),
            columnB: cleanCell(row.columnB || row.group2 || row['Cột B'] || row['Nhóm 2']),
            columnC: cleanCell(row.columnC || row.group3 || row['Cột C'] || row['Nhóm 3']),
            keyword: cleanCell(row.keyword || row.content || row['Cột D'] || row['Nội dung'] || row['Từ khóa']),
            description: cleanCell(row.description || row['Cột E'] || row['Mô tả'] || 'Chưa có thông tin'),
            columnF: cleanCell(row.columnF || row.extra || row['Cột F'] || row['Ghi chú']),
            officialEmployeePenalty: cleanCell(
              row.officialEmployeePenalty ||
                row['Cột G'] ||
                row['Chính thức'] ||
                row['Nhân viên chính thức'] ||
                'Chưa có thông tin'
            ),
            probationEmployeePenalty: cleanCell(
              row.probationEmployeePenalty ||
                row['Cột H'] ||
                row['Thử việc'] ||
                row['Nhân viên thử việc'] ||
                'Chưa có thông tin'
            ),
            rawRowIndex: idx + 1
          })).filter(it => Boolean(it.keyword || it.columnA));

          if (parsedItems.length > 0) {
            inMemoryPenaltyList = parsedItems;
            inMemoryLastFetchedTime = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(parsedItems));
            localStorage.setItem(CACHE_TIME_KEY, String(inMemoryLastFetchedTime));
            const finalData = mergeCustomPenalties(parsedItems);
            return {
              success: true,
              data: finalData,
              lastUpdated: new Date(inMemoryLastFetchedTime),
              source: 'gas'
            };
          }
        }
      }
    } catch (err) {
      console.warn('Apps Script API fetch failed, falling back to Google Visualization API:', err);
    }
  }

  // 4. Try Google Visualization API if SPREADSHEET_ID is present
  if (config.SPREADSHEET_ID && config.SPREADSHEET_ID.trim()) {
    try {
      const cleanId = config.SPREADSHEET_ID.trim();
      const gid = config.SHEET_GID || '0';
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:json&gid=${gid}&t=${Date.now()}`;

      const res = await fetch(gvizUrl);
      if (res.ok) {
        const text = await res.text();
        const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (match && match[1]) {
          const json = JSON.parse(match[1]);
          const rows = json.table?.rows || [];
          const items: PenaltyRuleItem[] = [];

          rows.forEach((row: any, rIdx: number) => {
            const cells = row.c || [];
            const c0 = cleanCell(cells[0]?.v || cells[0]?.f);
            const c1 = cleanCell(cells[1]?.v || cells[1]?.f);
            const c2 = cleanCell(cells[2]?.v || cells[2]?.f);
            const c3 = cleanCell(cells[3]?.v || cells[3]?.f);
            const c4 = cleanCell(cells[4]?.v || cells[4]?.f);
            const c5 = cleanCell(cells[5]?.v || cells[5]?.f);
            const c6 = cleanCell(cells[6]?.v || cells[6]?.f);
            const c7 = cleanCell(cells[7]?.v || cells[7]?.f);

            // Skip empty rows, banner titles, notes or header lines
            if (
              (!c0 && !c1 && !c2 && !c3 && !c4) ||
              c0.toLowerCase().includes('quy định xử lý') ||
              c0.toLowerCase().includes('lưu ý:') ||
              c0.toLowerCase().includes('lũy kế vi phạm') ||
              c0.toLowerCase().includes('tổng mức trừ') ||
              c0.toLowerCase().trim() === 'id' ||
              c1.toLowerCase().includes('hạng mục kiểm tra') ||
              c3.toLowerCase().trim() === 'yêu cầu' ||
              c0.toLowerCase().includes('cột a')
            ) {
              return;
            }

            // Case A: Col 0 is ID (e.g. "ID23", "ID57", "ID100")
            const isIdCol = c0.toUpperCase().startsWith('ID') || /^[A-Z0-9_-]+$/i.test(c0) && c0.length <= 15;
            
            let id = c0 || `row-${rIdx + 1}`;
            let colA = isIdCol ? (c1 || 'Quy định chung') : (c0 || 'Quy định chung');
            let colB = isIdCol ? (c2 || 'Chung') : (c1 || 'Chung');
            let colC = isIdCol ? (c0 ? `Mã: ${c0}` : c2) : (c2 || 'Quy chuẩn');
            let requirements = isIdCol ? c3 : '';
            let violationDetails = isIdCol ? c4 : (c3 || '');
            let colD_keyword = isIdCol ? (c4 || c3 || c2) : (c3 || c0);
            
            let description = '';
            if (isIdCol && requirements && violationDetails) {
              description = `📌 Yêu cầu: ${requirements}\n\n⚠️ Hành vi vi phạm: ${violationDetails}`;
            } else if (isIdCol) {
              description = requirements ? `📌 Yêu cầu: ${requirements}` : (violationDetails ? `⚠️ Hành vi vi phạm: ${violationDetails}` : cleanCell(cells[4]?.v || cells[4]?.f) || 'Chưa có thông tin');
            } else {
              description = cleanCell(cells[4]?.v || cells[4]?.f) || 'Chưa có thông tin';
            }

            let colF = isIdCol ? (c5 || 'Cá nhân vi phạm') : cleanCell(cells[5]?.v || cells[5]?.f);
            let colG = isIdCol ? (c6 || 'Chưa có thông tin') : cleanCell(cells[6]?.v || cells[6]?.f) || 'Chưa có thông tin';
            let colH = isIdCol ? (c7 || 'Chưa có thông tin') : cleanCell(cells[7]?.v || cells[7]?.f) || 'Chưa có thông tin';

            const itemObj: PenaltyRuleItem = {
              id,
              columnA: colA,
              columnB: colB,
              columnC: colC,
              keyword: colD_keyword,
              description,
              columnF: colF,
              officialEmployeePenalty: colG,
              probationEmployeePenalty: colH,
              rawRowIndex: rIdx + 1
            };
            itemObj.searchIndex = prepareSearchIndex([
              id,
              colA,
              colB,
              colC,
              colD_keyword,
              description,
              colF,
              colG,
              colH
            ]);
            items.push(itemObj);
          });

          if (items.length > 0) {
            inMemoryPenaltyList = items;
            inMemoryLastFetchedTime = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(items));
            localStorage.setItem(CACHE_TIME_KEY, String(inMemoryLastFetchedTime));
            const finalData = mergeCustomPenalties(items);
            return {
              success: true,
              data: finalData,
              lastUpdated: new Date(inMemoryLastFetchedTime),
              source: 'gviz'
            };
          }
        }
      }
    } catch (err) {
      console.warn('Google Visualization API fetch failed:', err);
    }
  }

  // 5. Fallback to Default Built-in Penalty Dataset
  inMemoryPenaltyList = DEFAULT_PENALTY_DATA;
  inMemoryLastFetchedTime = Date.now();
  const finalDefaultData = mergeCustomPenalties(DEFAULT_PENALTY_DATA);
  return {
    success: true,
    data: finalDefaultData,
    lastUpdated: new Date(inMemoryLastFetchedTime),
    source: 'default'
  };
}

/**
 * Generate ready-to-deploy Google Apps Script Code.gs
 */
export function generateAppsScriptCode(): string {
  return `/**
 * GOOGLE APPS SCRIPT API - TRA CỨU NỘI DUNG VI PHẠM & MỨC XỬ PHẠT
 * 
 * Hướng dẫn cài đặt:
 * 1. Mở Google Sheet chứa dữ liệu vi phạm.
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) -> "Apps Script".
 * 3. Dán toàn bộ mã nguồn này vào tệp Code.gs.
 * 4. Nhấn "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 * 5. Chọn loại: "Ứng dụng web" (Web app).
 * 6. Ai có quyền truy cập: Chọn "Bất kỳ ai" (Anyone).
 * 7. Nhấn Triển khai và sao chép URL Web App dán vào cài đặt website.
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var result = [];
    // Giả định dòng 1 là tiêu đề (Header), dữ liệu bắt đầu từ dòng 2 (index 1)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var colA = String(row[0] || '').trim();
      var colB = String(row[1] || '').trim();
      var colC = String(row[2] || '').trim();
      var colD = String(row[3] || '').trim(); // Cột D: Nội dung / Từ khóa
      var colE = String(row[4] || '').trim(); // Cột E: Mô tả
      var colF = String(row[5] || '').trim(); // Cột F: Dữ liệu khác
      var colG = String(row[6] || '').trim(); // Cột G: Nhân viên chính thức
      var colH = String(row[7] || '').trim(); // Cột H: Nhân viên thử việc

      if (!colD && !colA) continue; // Bỏ qua dòng trống

      result.push({
        id: "sheet-row-" + (i + 1),
        columnA: colA,
        columnB: colB,
        columnC: colC,
        keyword: colD,
        description: colE || "Chưa có thông tin",
        columnF: colF,
        officialEmployeePenalty: colG || "Chưa có thông tin",
        probationEmployeePenalty: colH || "Chưa có thông tin",
        rowIndex: i + 1
      });
    }

    var output = ContentService.createTextOutput(JSON.stringify({
      success: true,
      count: result.length,
      timestamp: new Date().toISOString(),
      data: result
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  } catch (error) {
    var errOutput = ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    }));
    errOutput.setMimeType(ContentService.MimeType.JSON);
    return errOutput;
  }
}
`;
}
