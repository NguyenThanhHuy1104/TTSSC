import { SalaryPolicyItem, SalaryPolicyConfig } from '../types';
import { DEFAULT_SALARY_POLICIES } from '../data/salaryPolicyData';
import { removeVietnameseTones, prepareSearchIndex } from '../utils/vietnameseSearch';

export const DEFAULT_SALARY_POLICY_CONFIG: SalaryPolicyConfig = {
  SPREADSHEET_ID: '1sUq27k_7YJQBERTJ-5x0F40Xa6yVGbY8',
  SHEET_GID: '700211878',
  SHEET_NAME: 'ChinhSachLuongThuong',
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/1sUq27k_7YJQBERTJ-5x0F40Xa6yVGbY8/edit?gid=700211878#gid=700211878',
  API_URL: ''
};

const CONFIG_KEY = 'ssc_salary_policy_config_v2';
const CACHE_KEY = 'ssc_salary_policy_data_cache_v2';
const CACHE_TIME_KEY = 'ssc_salary_policy_cache_time_v2';
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

let inMemoryPoliciesList: SalaryPolicyItem[] | null = null;
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
    if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
      return { spreadsheetId: trimmed, gid: '0' };
    }
    return null;
  }

  return { spreadsheetId, gid };
}

/**
 * Extract Google Drive file ID from all possible URL variants or bare IDs
 */
export function extractGoogleDriveId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();

  // Remove potential formula wrappers: =IMAGE("..."), =HYPERLINK("...", "...")
  const clean = trimmed
    .replace(/^=IMAGE\(\s*["']([^"']+)["']\s*\)/i, '$1')
    .replace(/^=HYPERLINK\(\s*["']([^"']+)["']\s*,\s*["'][^"']*["']\s*\)/i, '$1')
    .trim();

  // Pattern 1: drive.google.com/file/d/ID
  const m1 = clean.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (m1) return m1[1];

  // Pattern 2: id=ID or id=...
  const m2 = clean.match(/[?&]id=([a-zA-Z0-9_-]{20,})/i);
  if (m2) return m2[1];

  // Pattern 3: lh3.googleusercontent.com/d/ID
  const m3 = clean.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (m3) return m3[1];

  // Pattern 4: Google Drive thumbnail / uc
  const m4 = clean.match(/drive\.google\.com\/(?:uc|thumbnail)\?[^"'\s]*id=([a-zA-Z0-9_-]{20,})/i);
  if (m4) return m4[1];

  // Pattern 5: Raw 25-50 char Drive ID without URL
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(clean)) {
    return clean;
  }

  return null;
}

/**
 * Convert any image URL (especially Google Drive links) into a reliable direct embeddable image URL
 */
export function formatImageUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Extract from formula if present
  trimmed = trimmed
    .replace(/^=IMAGE\(\s*["']([^"']+)["']\s*\)/i, '$1')
    .replace(/^=HYPERLINK\(\s*["']([^"']+)["']\s*,\s*["'][^"']*["']\s*\)/i, '$1')
    .trim();

  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    // lh3.googleusercontent.com/d/FILE_ID serves direct high-res image
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return trimmed;
}

/**
 * Get multiple fallback URLs for an image (for resilient retry in UI)
 */
export function getImageFallbackUrls(rawUrl: string): {
  primary: string;
  thumbnail: string;
  proxy: string;
  driveFileId: string | null;
  original: string;
} {
  const original = (rawUrl || '').trim();
  const driveId = extractGoogleDriveId(original);

  if (driveId) {
    const primary = `https://lh3.googleusercontent.com/d/${driveId}`;
    const thumbnail = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
    const proxy = `/api/image/proxy?url=${encodeURIComponent(primary)}`;
    return {
      primary,
      thumbnail,
      proxy,
      driveFileId: driveId,
      original: `https://drive.google.com/file/d/${driveId}/view`
    };
  }

  const primary = formatImageUrl(original);
  const proxy = primary.startsWith('http') ? `/api/image/proxy?url=${encodeURIComponent(primary)}` : primary;

  return {
    primary,
    thumbnail: primary,
    proxy,
    driveFileId: null,
    original
  };
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
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  return `https://${trimmed}`;
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
 * Format Google Date object or string (e.g. "Date(2026,8,28)" -> "28/09/2026")
 */
function parseDateCell(raw: any, formatted?: any): string {
  if (formatted && typeof formatted === 'string' && formatted.trim()) {
    return formatted.trim();
  }
  if (!raw) return '';
  const str = String(raw).trim();
  // Match GViz Date(year, month, day) - Note: month is 0-indexed in GViz
  const gvizMatch = str.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/i);
  if (gvizMatch) {
    const year = gvizMatch[1];
    const month = String(parseInt(gvizMatch[2], 10) + 1).padStart(2, '0');
    const day = String(parseInt(gvizMatch[3], 10)).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  return str;
}

/**
 * Fetch salary policy configuration from server API to persist across publishes & sessions
 */
export async function fetchSalaryPolicyConfigFromServer(): Promise<SalaryPolicyConfig> {
  try {
    const res = await fetch('/api/config/salary-policy');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.config) {
        const merged: SalaryPolicyConfig = {
          ...DEFAULT_SALARY_POLICY_CONFIG,
          ...data.config
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch salary policy config from server:', err);
  }
  return getSalaryPolicyConfig();
}

/**
 * Get active configuration (from localStorage or defaults)
 */
export function getSalaryPolicyConfig(): SalaryPolicyConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_SALARY_POLICY_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading salary policy config:', e);
  }
  return DEFAULT_SALARY_POLICY_CONFIG;
}

/**
 * Save configuration to localStorage and sync with server
 */
export async function saveSalaryPolicyConfig(
  config: Partial<SalaryPolicyConfig>
): Promise<SalaryPolicyConfig> {
  const current = getSalaryPolicyConfig();
  const updated = { ...current, ...config };

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
    console.error('Error saving salary policy config to localStorage:', e);
  }

  clearSalaryPolicyCache();

  try {
    await fetch('/api/config/salary-policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  } catch (err) {
    console.warn('Could not sync salary policy config to server:', err);
  }

  return updated;
}

/**
 * Clear cached data
 */
export function clearSalaryPolicyCache(): void {
  inMemoryPoliciesList = null;
  inMemoryLastFetchedTime = 0;
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
  } catch {}
}

/**
 * Search salary policies with Vietnamese tone support and category filtering
 */
export function searchSalaryPolicies(
  items: SalaryPolicyItem[],
  query: string,
  categoryFilter?: string,
  audienceFilter?: string
): SalaryPolicyItem[] {
  let filtered = items;

  if (categoryFilter && categoryFilter !== 'ALL') {
    filtered = filtered.filter((it) => it.category === categoryFilter);
  }

  if (audienceFilter && audienceFilter !== 'ALL') {
    filtered = filtered.filter((it) => (it.targetAudience || '').includes(audienceFilter));
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
    const normCat = removeVietnameseTones(item.category || '').toLowerCase();
    const normAudience = removeVietnameseTones(item.targetAudience || '').toLowerCase();
    const normSummary = removeVietnameseTones(item.summary || '').toLowerCase();
    const normDate = removeVietnameseTones(item.effectiveDate || '').toLowerCase();

    return (
      normTitle.includes(normalizedQuery) ||
      normCat.includes(normalizedQuery) ||
      normAudience.includes(normalizedQuery) ||
      normSummary.includes(normalizedQuery) ||
      normDate.includes(normalizedQuery)
    );
  });
}

/**
 * Helper to determine if a cell text looks like an image URL or Google Drive link
 */
function isImageOrDriveCell(val: string): boolean {
  if (!val) return false;
  const s = val.toLowerCase();
  return (
    s.includes('drive.google.com') ||
    s.includes('lh3.googleusercontent.com') ||
    s.includes('/file/d/') ||
    /\.(jpg|jpeg|png|webp|gif|svg|bmp)(\?.*)?$/i.test(s) ||
    s.startsWith('http://') ||
    s.startsWith('https://')
  );
}

/**
 * Helper to determine if a cell looks like a date
 */
function isDateCell(val: string, rawVal: any): boolean {
  if (typeof rawVal === 'string' && rawVal.startsWith('Date(')) return true;
  if (!val) return false;
  return /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(val) || /^date\(/i.test(val);
}

/**
 * Fetch salary policies from Google Sheet (via GViz API, CSV export or Apps Script)
 */
export async function fetchSalaryPoliciesFromSheet(
  forceRefresh = false
): Promise<{
  success: boolean;
  data: SalaryPolicyItem[];
  lastUpdated?: Date;
  source: 'cache' | 'gviz' | 'csv' | 'gas' | 'default';
  message?: string;
}> {
  const config = getSalaryPolicyConfig();

  // 1. Check in-memory cache
  if (!forceRefresh && inMemoryPoliciesList && Date.now() - inMemoryLastFetchedTime < CACHE_TTL_MS) {
    return {
      success: true,
      data: inMemoryPoliciesList,
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
            inMemoryPoliciesList = parsed;
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
          const items: SalaryPolicyItem[] = (rows as any[])
            .map((r: any, idx: number): SalaryPolicyItem | null => {
              const title = cleanCell(r.title || r['Tên chính sách'] || r['Tiêu đề'] || r['Chính sách'] || r.name);
              const category = cleanCell(r.category || r['Phân loại'] || r['Nhóm'] || 'Chính sách');
              const rawImg = cleanCell(r.imageUrl || r['Link ảnh'] || r['Ảnh'] || r['Hình ảnh'] || r['Banner'] || r.image);
              const targetAudience = cleanCell(r.targetAudience || r['Đối tượng'] || r['Đối tượng áp dụng'] || r.audience);
              const summary = cleanCell(r.summary || r['Tóm tắt'] || r['Nội dung'] || r['Mức thưởng'] || r['Mô tả'] || r.description);
              const effectiveDate = cleanCell(r.effectiveDate || r['Ngày hiệu lực'] || r['Thời hạn'] || r['Áp dụng từ'] || r.date);
              const detailUrl = normalizeUrl(cleanCell(r.detailUrl || r['Link chi tiết'] || r['Văn bản'] || r['File đính kèm'] || r.url));

              if (!title && !rawImg) return null;

              const imageUrl = formatImageUrl(rawImg) || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80';
              const driveId = extractGoogleDriveId(rawImg);

              return {
                id: `policy-${idx + 1}`,
                title: title || `Chính sách ${idx + 1}`,
                category: category || 'Chính sách',
                imageUrl,
                originalImageUrl: rawImg,
                driveFileId: driveId || undefined,
                targetAudience,
                summary,
                effectiveDate,
                detailUrl,
                badge: r.badge || 'MỚI',
                rawRowIndex: idx + 1,
                searchIndex: prepareSearchIndex([title, category, targetAudience, summary, effectiveDate])
              };
            })
            .filter((it): it is SalaryPolicyItem => it !== null);

          if (items.length > 0) {
            inMemoryPoliciesList = items;
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
      console.warn('Apps Script fetch failed for salary policies:', err);
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

          if (Array.isArray(rows) && rows.length > 0) {
            // Check headers if defined
            let titleIdx = -1;
            let catIdx = -1;
            let imgIdx = -1;
            let audienceIdx = -1;
            let summaryIdx = -1;
            let dateIdx = -1;
            let detailIdx = -1;

            cols.forEach((col: any, idx: number) => {
              const label = (col.label || col.id || '').toString().toLowerCase().trim();
              if (titleIdx === -1 && /(tên chính sách|tiêu đề|tên văn bản|title|chính sách)/i.test(label)) {
                titleIdx = idx;
              }
              if (catIdx === -1 && /(phân loại|nhóm|danh mục|category)/i.test(label)) {
                catIdx = idx;
              }
              if (imgIdx === -1 && /(link ảnh|ảnh|hình ảnh|banner|image|infographic|poster|url ảnh)/i.test(label)) {
                imgIdx = idx;
              }
              if (audienceIdx === -1 && /(đối tượng|áp dụng cho|đối tượng áp dụng|role|audience)/i.test(label)) {
                audienceIdx = idx;
              }
              if (summaryIdx === -1 && /(tóm tắt|nội dung|mức thưởng|mô tả|ghi chú|summary)/i.test(label)) {
                summaryIdx = idx;
              }
              if (dateIdx === -1 && /(ngày hiệu lực|thời hạn|thời gian|hiệu lực|áp dụng từ|date)/i.test(label)) {
                dateIdx = idx;
              }
              if (detailIdx === -1 && /(link chi tiết|văn bản|file đính kèm|link|url)/i.test(label)) {
                detailIdx = idx;
              }
            });

            // INTELLIGENT CELL INSPECTION: If column headers weren't named (e.g. empty labels),
            // sample the first few rows to find which column holds URLs, Dates, and Titles!
            if (imgIdx === -1 || dateIdx === -1 || titleIdx === -1) {
              const sampleRows = rows.slice(0, Math.min(5, rows.length));
              sampleRows.forEach((r: any) => {
                const cells = r.c || [];
                cells.forEach((cell: any, cIdx: number) => {
                  const val = cleanCell(cell?.v || cell?.f);
                  const rawV = cell?.v;

                  // Detect image column
                  if (imgIdx === -1 && isImageOrDriveCell(val)) {
                    imgIdx = cIdx;
                  }
                  // Detect date column
                  if (dateIdx === -1 && isDateCell(val, rawV)) {
                    dateIdx = cIdx;
                  }
                  // Detect title column (non-URL, non-date string, first text column)
                  if (titleIdx === -1 && val && !isImageOrDriveCell(val) && !isDateCell(val, rawV) && cIdx === 0) {
                    titleIdx = cIdx;
                  }
                });
              });
            }

            // Defaults if still unresolved
            if (titleIdx === -1) titleIdx = 0;
            // If image is still unresolved, check if column 1 holds the URL (common case Col A: Title, Col B: Link)
            if (imgIdx === -1) {
              imgIdx = 1;
            }

            const items: SalaryPolicyItem[] = [];

            rows.forEach((row: any, rIdx: number) => {
              const cells = row.c || [];
              let rawTitle = cleanCell(cells[titleIdx]?.v || cells[titleIdx]?.f);
              let rawImg = cleanCell(cells[imgIdx]?.v || cells[imgIdx]?.f);
              let rawDate = parseDateCell(cells[dateIdx]?.v, cells[dateIdx]?.f);
              let rawCat = catIdx >= 0 ? cleanCell(cells[catIdx]?.v || cells[catIdx]?.f) : '';
              let rawAudience = audienceIdx >= 0 ? cleanCell(cells[audienceIdx]?.v || cells[audienceIdx]?.f) : '';
              let rawSummary = summaryIdx >= 0 ? cleanCell(cells[summaryIdx]?.v || cells[summaryIdx]?.f) : '';
              let rawDetail = detailIdx >= 0 ? cleanCell(cells[detailIdx]?.v || cells[detailIdx]?.f) : '';

              // PER-ROW RESILIENCE:
              // If rawImg is empty or not a URL, scan other cells in this row to see if any contains a link
              if (!isImageOrDriveCell(rawImg)) {
                for (let c = 0; c < cells.length; c++) {
                  if (c === titleIdx) continue;
                  const cVal = cleanCell(cells[c]?.v || cells[c]?.f);
                  if (isImageOrDriveCell(cVal)) {
                    rawImg = cVal;
                    break;
                  }
                }
              }

              // Also scan for date if not detected
              if (!rawDate) {
                for (let c = 0; c < cells.length; c++) {
                  if (c === titleIdx || c === imgIdx) continue;
                  const cCell = cells[c];
                  const cVal = cleanCell(cCell?.v || cCell?.f);
                  if (isDateCell(cVal, cCell?.v)) {
                    rawDate = parseDateCell(cCell?.v, cCell?.f);
                    break;
                  }
                }
              }

              // Skip header repeats or empty rows
              if (!rawTitle && !rawImg) return;
              if (
                rawTitle.toLowerCase() === 'tên chính sách' ||
                rawTitle.toLowerCase() === 'tiêu đề' ||
                rawTitle.toLowerCase() === 'title' ||
                rawTitle.toLowerCase() === 'chính sách'
              ) {
                return;
              }

              const formattedImg = formatImageUrl(rawImg) || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80';
              const driveId = extractGoogleDriveId(rawImg);

              // Auto-derive category if not present
              if (!rawCat) {
                const lowerTitle = rawTitle.toLowerCase();
                if (lowerTitle.includes('thưởng') || lowerTitle.includes('hoa hồng') || lowerTitle.includes('kpi')) {
                  rawCat = 'Thưởng Doanh số / KPI';
                } else if (lowerTitle.includes('lương') || lowerTitle.includes('level') || lowerTitle.includes('bậc')) {
                  rawCat = 'Lương & Phụ cấp';
                } else if (lowerTitle.includes('thi đua') || lowerTitle.includes('vinh danh') || lowerTitle.includes('top')) {
                  rawCat = 'Thi đua & Vinh danh';
                } else {
                  rawCat = 'Chính sách lương thưởng';
                }
              }

              items.push({
                id: `policy-${rIdx + 1}`,
                title: rawTitle || `Chính sách lương thưởng #${rIdx + 1}`,
                category: rawCat,
                imageUrl: formattedImg,
                originalImageUrl: rawImg,
                driveFileId: driveId || undefined,
                targetAudience: rawAudience || 'Toàn hệ thống',
                summary: rawSummary || rawTitle,
                effectiveDate: rawDate || 'Áp dụng hiện hành',
                detailUrl: normalizeUrl(rawDetail || rawImg),
                badge: rIdx === 0 ? 'TIÊU ĐIỂM' : 'MỚI',
                rawRowIndex: rIdx + 1,
                searchIndex: prepareSearchIndex([rawTitle, rawCat, rawAudience, rawSummary, rawDate])
              });
            });

            if (items.length > 0) {
              inMemoryPoliciesList = items;
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
      }
    } catch (err) {
      console.warn('Google Visualization API fetch failed for salary policies:', err);
    }
  }

  // 5. Try CSV Export fallback
  if (config.SPREADSHEET_ID && config.SPREADSHEET_ID.trim()) {
    try {
      const sheetId = config.SPREADSHEET_ID.trim();
      const gid = config.SHEET_GID || '0';
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&t=${Date.now()}`;

      const res = await fetch(csvUrl);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length > 0) {
          const items: SalaryPolicyItem[] = [];
          for (let i = 0; i < lines.length; i++) {
            const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
            const col0 = parts[0] || '';
            const col1 = parts[1] || '';
            const col2 = parts[2] || '';

            if (
              col0.toLowerCase() === 'tên chính sách' ||
              col0.toLowerCase() === 'tiêu đề' ||
              col0.toLowerCase() === 'title'
            ) {
              continue;
            }

            // Find image link and date across parts
            let title = col0;
            let rawImg = '';
            let date = '';

            for (const part of parts) {
              if (!rawImg && isImageOrDriveCell(part)) {
                rawImg = part;
              } else if (!date && isDateCell(part, part)) {
                date = part;
              }
            }

            if (!rawImg && isImageOrDriveCell(col1)) rawImg = col1;
            if (!date && col2 && !isImageOrDriveCell(col2)) date = col2;

            if (title || rawImg) {
              const formattedImg = formatImageUrl(rawImg) || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80';
              const driveId = extractGoogleDriveId(rawImg);

              items.push({
                id: `policy-csv-${i + 1}`,
                title: title || `Chính sách ${i + 1}`,
                category: 'Chính sách lương thưởng',
                imageUrl: formattedImg,
                originalImageUrl: rawImg,
                driveFileId: driveId || undefined,
                targetAudience: 'Toàn hệ thống',
                summary: title,
                effectiveDate: date || 'Áp dụng hiện hành',
                detailUrl: normalizeUrl(rawImg),
                badge: i === 0 ? 'TIÊU ĐIỂM' : 'MỚI',
                rawRowIndex: i + 1,
                searchIndex: prepareSearchIndex([title, date])
              });
            }
          }

          if (items.length > 0) {
            inMemoryPoliciesList = items;
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
      console.warn('CSV export fetch failed for salary policies:', err);
    }
  }

  // 6. Return rich default policies
  return {
    success: true,
    data: DEFAULT_SALARY_POLICIES,
    lastUpdated: new Date(),
    source: 'default',
    message: 'Đang hiển thị danh sách chính sách lương thưởng chuẩn hệ thống.'
  };
}

/**
 * Test Google Sheet connection for salary policies
 */
export async function testSalaryPolicyConnection(config: SalaryPolicyConfig): Promise<{
  success: boolean;
  message: string;
  rowCount?: number;
  sampleItem?: SalaryPolicyItem;
}> {
  if (!config.SPREADSHEET_ID && !config.SHEET_URL) {
    return { success: false, message: 'Vui lòng nhập đường link Google Sheet hoặc ID bảng tính.' };
  }

  let sheetId = config.SPREADSHEET_ID;
  let gid = config.SHEET_GID || '0';

  if (config.SHEET_URL) {
    const parsed = parseGoogleSheetUrl(config.SHEET_URL);
    if (parsed) {
      sheetId = parsed.spreadsheetId;
      gid = parsed.gid || '0';
    }
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}&t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { success: false, message: `Không thể kết nối (Mã lỗi HTTP: ${res.status}). Hãy đảm bảo Sheet được chia sẻ công khai!` };
    }
    const text = await res.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
    if (!match || !match[1]) {
      return { success: false, message: 'Dữ liệu trả về không đúng định dạng Google Sheets GViz.' };
    }
    const json = JSON.parse(match[1]);
    const rows = json.table?.rows || [];
    return {
      success: true,
      message: `Kết nối thành công! Đã tìm thấy ${rows.length} dòng dữ liệu.`,
      rowCount: rows.length
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi kết nối: ${err.message || 'Không thể truy cập Google Sheet. Vui lòng kiểm tra quyền chia sẻ.'}`
    };
  }
}
