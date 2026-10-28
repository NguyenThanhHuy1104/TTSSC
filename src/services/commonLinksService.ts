import { CommonLinkItem, CommonLinksConfig } from '../types';
import { DEFAULT_COMMON_LINKS } from '../data/commonLinksData';
import { removeVietnameseTones, prepareSearchIndex } from '../utils/vietnameseSearch';

export const DEFAULT_COMMON_LINKS_CONFIG: CommonLinksConfig = {
  // Using the shared spreadsheet or empty ID for custom setup
  SPREADSHEET_ID: '1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9',
  SHEET_GID: '0',
  SHEET_NAME: 'LinkThuongDung',
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9/edit?gid=0#gid=0',
  API_URL: ''
};

const CONFIG_KEY = 'ssc_common_links_config_v2';
const CACHE_KEY = 'ssc_common_links_data_cache_v3';
const CACHE_TIME_KEY = 'ssc_common_links_cache_time_v3';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let inMemoryLinksList: CommonLinkItem[] | null = null;
let inMemoryLastFetchedTime = 0;

/**
 * Extract SPREADSHEET_ID and GID from any Google Sheet URL
 */
export function parseGoogleSheetUrl(url: string): { spreadsheetId: string; gid: string } | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern: /spreadsheets/d/([a-zA-Z0-9-_]+)
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
  const spreadsheetId = idMatch ? idMatch[1] : '';

  // Pattern: gid=([0-9]+)
  const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/i);
  const gid = gidMatch ? gidMatch[1] : '0';

  if (!spreadsheetId) {
    // If user provided just the raw spreadsheet ID
    if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
      return { spreadsheetId: trimmed, gid: '0' };
    }
    return null;
  }

  return { spreadsheetId, gid };
}

/**
 * Ensure URL has http:// or https:// prefix
 */
export function normalizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  // If it's a domain or relative path
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  return `https://${trimmed}`;
}

/**
 * Get active configuration (from localStorage or defaults)
 */
/**
 * Fetch common links configuration from server API to persist across publishes & sessions
 */
export async function fetchCommonLinksConfigFromServer(): Promise<CommonLinksConfig> {
  try {
    const res = await fetch('/api/config/common-links');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.config) {
        const merged: CommonLinksConfig = {
          ...DEFAULT_COMMON_LINKS_CONFIG,
          ...data.config
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch common links config from server:', err);
  }
  return getCommonLinksConfig();
}

export function getCommonLinksConfig(): CommonLinksConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_COMMON_LINKS_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading common links config:', e);
  }
  return DEFAULT_COMMON_LINKS_CONFIG;
}

/**
 * Save configuration to localStorage and sync with server
 */
export async function saveCommonLinksConfig(config: Partial<CommonLinksConfig>): Promise<CommonLinksConfig> {
  const current = getCommonLinksConfig();
  const updated = { ...current, ...config };

  // If a full URL is provided, automatically extract ID and GID
  if (updated.SHEET_URL) {
    const parsed = parseGoogleSheetUrl(updated.SHEET_URL);
    if (parsed) {
      updated.SPREADSHEET_ID = parsed.spreadsheetId;
      if (parsed.gid) {
        updated.SHEET_GID = parsed.gid;
      }
    }
  }

  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving common links config to localStorage:', e);
  }

  // Clear memory cache so next query reloads
  clearCommonLinksCache();

  // Sync to server API in background
  try {
    await fetch('/api/config/common-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  } catch (err) {
    console.warn('Could not sync common links config to server (normal if offline/static):', err);
  }

  return updated;
}

/**
 * Clear cached links
 */
export function clearCommonLinksCache(): void {
  inMemoryLinksList = null;
  inMemoryLastFetchedTime = 0;
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
  } catch {}
}

/**
 * Clean cell text helper
 */
function cleanCell(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  return String(val).trim();
}

/**
 * Search frequently used links
 */
export function searchCommonLinks(
  items: CommonLinkItem[],
  query: string,
  categoryFilter?: string
): CommonLinkItem[] {
  let filtered = items;

  if (categoryFilter && categoryFilter !== 'ALL') {
    filtered = filtered.filter((it) => it.category === categoryFilter);
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return filtered;
  }

  const normalizedQuery = removeVietnameseTones(trimmed).toLowerCase();
  if (!normalizedQuery) {
    return filtered;
  }

  return filtered.filter((item) => {
    if (item.searchIndex && item.searchIndex.includes(normalizedQuery)) {
      return true;
    }
    const normTitle = removeVietnameseTones(item.title || '').toLowerCase();
    const normUrl = (item.url || '').toLowerCase();
    const normDesc = removeVietnameseTones(item.description || '').toLowerCase();
    const normCat = removeVietnameseTones(item.category || '').toLowerCase();

    return (
      normTitle.includes(normalizedQuery) ||
      normUrl.includes(normalizedQuery) ||
      normDesc.includes(normalizedQuery) ||
      normCat.includes(normalizedQuery)
    );
  });
}

/**
 * Fetch links from Google Sheet (via GViz API, CSV export or Apps Script)
 */
export async function fetchCommonLinksFromSheet(
  forceRefresh = false
): Promise<{
  success: boolean;
  data: CommonLinkItem[];
  lastUpdated?: Date;
  source: 'cache' | 'gviz' | 'csv' | 'gas' | 'default';
  message?: string;
}> {
  if (forceRefresh) {
    clearCommonLinksCache();
  }
  const config = getCommonLinksConfig();

  // 1. Check in-memory cache
  if (!forceRefresh && inMemoryLinksList && Date.now() - inMemoryLastFetchedTime < CACHE_TTL_MS) {
    return {
      success: true,
      data: inMemoryLinksList,
      lastUpdated: new Date(inMemoryLastFetchedTime),
      source: 'cache'
    };
  }

  // 2. Check localStorage cache
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime, 10);
        if (age < CACHE_TTL_MS) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            inMemoryLinksList = parsed;
            inMemoryLastFetchedTime = parseInt(cacheTime, 10);
            return {
              success: true,
              data: parsed,
              lastUpdated: new Date(inMemoryLastFetchedTime),
              source: 'cache'
            };
          }
        }
      }
    } catch {}
  }

  // 3. Try Google Apps Script API URL if provided
  if (config.API_URL && config.API_URL.trim()) {
    try {
      const res = await fetch(config.API_URL.trim());
      if (res.ok) {
        const json = await res.json();
        const rows = Array.isArray(json) ? json : json.data || json.items || [];
        if (Array.isArray(rows) && rows.length > 0) {
          const items: CommonLinkItem[] = (rows as any[])
            .map((r: any, idx: number): CommonLinkItem | null => {
              const title = cleanCell(r.title || r['Tên đường link'] || r['Tên link'] || r['Tên'] || r.name);
              const url = normalizeUrl(cleanCell(r.url || r['Link đính kèm'] || r['Link'] || r.link));
              const desc = cleanCell(r.description || r['Ghi chú'] || r.note || '');
              const category = cleanCell(r.category || r['Phân loại'] || r['Nhóm'] || '');
              if (!title && !url) return null;
              return {
                id: `link-${idx + 1}`,
                title: title || url,
                url: url || '#',
                description: desc,
                category: category || '',
                rawRowIndex: idx + 1,
                searchIndex: prepareSearchIndex([title, url, desc, category])
              };
            })
            .filter((it): it is CommonLinkItem => it !== null && Boolean(it.url && it.url !== '#'));

          if (items.length > 0) {
            inMemoryLinksList = items;
            inMemoryLastFetchedTime = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(items));
            localStorage.setItem(CACHE_TIME_KEY, String(inMemoryLastFetchedTime));
            return {
              success: true,
              data: items,
              lastUpdated: new Date(inMemoryLastFetchedTime),
              source: 'gas'
            };
          }
        }
      }
    } catch (err) {
      console.warn('Apps Script fetch failed for common links:', err);
    }
  }

  // 4. Try Google Visualization API (GViz)
  if (config.SPREADSHEET_ID && config.SPREADSHEET_ID.trim()) {
    try {
      const sheetId = config.SPREADSHEET_ID.trim();
      const gid = config.SHEET_GID || '0';
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}&t=${Date.now()}`;

      const res = await fetch(gvizUrl);
      if (res.ok) {
        const text = await res.text();
        const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (match && match[1]) {
          const json = JSON.parse(match[1]);
          const cols = json.table?.cols || [];
          const rows = json.table?.rows || [];

          // Column indices detection
          let titleIdx = -1;
          let urlIdx = -1;
          let descIdx = -1;
          let catIdx = -1;

          cols.forEach((col: any, idx: number) => {
            const label = (col.label || col.id || '').toString().toLowerCase().trim();
            if (titleIdx === -1 && /(tên đường link|tên link|tên|tiêu đề|title|link name|name)/i.test(label)) {
              titleIdx = idx;
            }
            if (urlIdx === -1 && /(link đính kèm|link|đường dẫn|url|href|website|địa chỉ)/i.test(label)) {
              urlIdx = idx;
            }
            if (descIdx === -1 && /(ghi chú|mô tả|note|description|hướng dẫn)/i.test(label)) {
              descIdx = idx;
            }
            if (catIdx === -1 && /(nhóm|phân loại|danh mục|category|loại)/i.test(label)) {
              catIdx = idx;
            }
          });

          // Fallbacks for headerless sheets
          if (titleIdx === -1) titleIdx = 0;
          if (urlIdx === -1) urlIdx = 1;
          if (descIdx === -1) descIdx = 2;
          if (catIdx === -1) catIdx = 3;

          const items: CommonLinkItem[] = [];

          rows.forEach((row: any, rIdx: number) => {
            const cells = row.c || [];
            const rawTitle = cleanCell(cells[titleIdx]?.v || cells[titleIdx]?.f);
            const rawUrl = cleanCell(cells[urlIdx]?.v || cells[urlIdx]?.f);
            const rawDesc = cleanCell(cells[descIdx]?.v || cells[descIdx]?.f);
            const rawCat = cleanCell(cells[catIdx]?.v || cells[catIdx]?.f);

            // Skip empty rows or header echoes
            if (
              (!rawTitle && !rawUrl) ||
              rawTitle.toLowerCase() === 'tên đường link' ||
              rawTitle.toLowerCase() === 'tên link' ||
              rawTitle.toLowerCase() === 'tiêu đề'
            ) {
              return;
            }

            // In some sheets, URL might be in Col 0 and Title in Col 1
            let title = rawTitle;
            let url = rawUrl;
            if (/^https?:\/\//i.test(rawTitle) && !/^https?:\/\//i.test(rawUrl)) {
              url = rawTitle;
              title = rawUrl || rawTitle;
            }

            if (!url) return;

            const normalizedLink = normalizeUrl(url);
            const category = rawCat || '';

            items.push({
              id: `link-${rIdx + 1}`,
              title: title || normalizedLink,
              url: normalizedLink,
              description: rawDesc,
              category,
              rawRowIndex: rIdx + 1,
              searchIndex: prepareSearchIndex([title, normalizedLink, rawDesc, category])
            });
          });

          if (items.length > 0) {
            inMemoryLinksList = items;
            inMemoryLastFetchedTime = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(items));
            localStorage.setItem(CACHE_TIME_KEY, String(inMemoryLastFetchedTime));
            return {
              success: true,
              data: items,
              lastUpdated: new Date(inMemoryLastFetchedTime),
              source: 'gviz'
            };
          }
        }
      }
    } catch (err) {
      console.warn('Google Visualization API fetch failed for common links:', err);
    }
  }

  // 5. Try CSV export format
  if (config.SPREADSHEET_ID && config.SPREADSHEET_ID.trim()) {
    try {
      const sheetId = config.SPREADSHEET_ID.trim();
      const gid = config.SHEET_GID || '0';
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&t=${Date.now()}`;

      const res = await fetch(csvUrl);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length > 1) {
          // Parse CSV simple lines
          const items: CommonLinkItem[] = [];
          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
            const title = parts[0];
            const url = parts[1];
            const desc = parts[2] || '';
            const cat = parts[3] || '';
            if (title && url) {
              const normLink = normalizeUrl(url);
              items.push({
                id: `link-csv-${i}`,
                title,
                url: normLink,
                description: desc,
                category: cat,
                rawRowIndex: i,
                searchIndex: prepareSearchIndex([title, normLink, desc, cat])
              });
            }
          }

          if (items.length > 0) {
            inMemoryLinksList = items;
            inMemoryLastFetchedTime = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(items));
            localStorage.setItem(CACHE_TIME_KEY, String(inMemoryLastFetchedTime));
            return {
              success: true,
              data: items,
              lastUpdated: new Date(inMemoryLastFetchedTime),
              source: 'csv'
            };
          }
        }
      }
    } catch (err) {
      console.warn('CSV export fetch failed for common links:', err);
    }
  }

  // 6. Fallback to default built-in links data
  const fallbackWithIndex = DEFAULT_COMMON_LINKS.map((it) => ({
    ...it,
    searchIndex: prepareSearchIndex([it.title, it.url, it.description || '', it.category || ''])
  }));

  inMemoryLinksList = fallbackWithIndex;
  inMemoryLastFetchedTime = Date.now();

  return {
    success: true,
    data: fallbackWithIndex,
    lastUpdated: new Date(inMemoryLastFetchedTime),
    source: 'default',
    message: 'Đang hiển thị danh sách link mặc định của hệ thống.'
  };
}
