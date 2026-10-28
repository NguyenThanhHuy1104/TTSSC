import { MinuteFileItem, MinutesFilesConfig } from '../types';
import { removeVietnameseTones, prepareSearchIndex } from '../utils/vietnameseSearch';

export const DEFAULT_MINUTES_FILES_CONFIG: MinutesFilesConfig = {
  SPREADSHEET_ID: '1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9',
  SHEET_GID: '0',
  SHEET_NAME: 'BienBanFile',
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9/edit?gid=0#gid=0',
  API_URL: ''
};

export const DEFAULT_MINUTES_FILES_DATA: MinuteFileItem[] = [
  {
    id: 'file-1',
    fileName: 'Biên bản họp giao ban khối Shop tháng này.pdf',
    fileUrl: 'https://docs.google.com/spreadsheets/d/1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9/edit',
    category: 'Biên bản họp',
    fileSize: '2.4 MB',
    updatedAt: '2026-10-25'
  },
  {
    id: 'file-2',
    fileName: 'Biên bản kiểm kê tồn kho định kỳ toàn hệ thống.xlsx',
    fileUrl: 'https://docs.google.com/spreadsheets/d/1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9/edit',
    category: 'Kiểm kê kho',
    fileSize: '1.8 MB',
    updatedAt: '2026-10-24'
  },
  {
    id: 'file-3',
    fileName: 'Quy chế xử lý vi phạm nội bộ và quy trình giải trình.docx',
    fileUrl: 'https://docs.google.com/spreadsheets/d/1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9/edit',
    category: 'Quy chế - Quy định',
    fileSize: '3.1 MB',
    updatedAt: '2026-10-20'
  },
  {
    id: 'file-4',
    fileName: 'Biểu mẫu đăng ký nghỉ phép và xác nhận công.xlsx',
    fileUrl: 'https://docs.google.com/spreadsheets/d/1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9/edit',
    category: 'Biểu mẫu nhân sự',
    fileSize: '950 KB',
    updatedAt: '2026-10-18'
  },
  {
    id: 'file-5',
    fileName: 'SOP Hướng dẫn tra cứu barcode và xử lý hàng lỗi.pdf',
    fileUrl: 'https://docs.google.com/spreadsheets/d/1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9/edit',
    category: 'Tài liệu hướng dẫn',
    fileSize: '4.5 MB',
    updatedAt: '2026-10-15'
  }
];

const CONFIG_KEY = 'ssc_minutes_files_config_v1';
const CACHE_KEY = 'ssc_minutes_files_data_cache_v1';
const CACHE_TIME_KEY = 'ssc_minutes_files_cache_time_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let inMemoryFilesList: MinuteFileItem[] | null = null;
let inMemoryLastFetchedTime = 0;

export function getMinutesFilesConfig(): MinutesFilesConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_MINUTES_FILES_CONFIG };
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_MINUTES_FILES_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading minutes files config:', e);
  }
  return DEFAULT_MINUTES_FILES_CONFIG;
}

export async function saveMinutesFilesConfig(config: Partial<MinutesFilesConfig>): Promise<MinutesFilesConfig> {
  const current = getMinutesFilesConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving minutes files config:', e);
  }
  clearMinutesFilesCache();
  try {
    await fetch('/api/config/minutes-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  } catch {}
  return updated;
}

export function clearMinutesFilesCache(): void {
  inMemoryFilesList = null;
  inMemoryLastFetchedTime = 0;
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
  } catch {}
}

export function searchMinutesFiles(items: MinuteFileItem[], query: string, categoryFilter?: string): MinuteFileItem[] {
  let filtered = items;
  if (categoryFilter && categoryFilter !== 'ALL') {
    filtered = filtered.filter((it) => it.category === categoryFilter);
  }
  const trimmed = query.trim();
  if (!trimmed) return filtered;

  const normalizedQuery = removeVietnameseTones(trimmed).toLowerCase();
  if (!normalizedQuery) return filtered;

  return filtered.filter((item) => {
    if (item.searchIndex && item.searchIndex.includes(normalizedQuery)) return true;
    const name = removeVietnameseTones(item.fileName || '').toLowerCase();
    const cat = removeVietnameseTones(item.category || '').toLowerCase();
    return name.includes(normalizedQuery) || cat.includes(normalizedQuery);
  });
}

export async function fetchMinutesFilesFromSheet(forceRefresh = false): Promise<{
  success: boolean;
  data: MinuteFileItem[];
  source: 'cache' | 'gviz' | 'csv' | 'default';
  message?: string;
}> {
  if (forceRefresh) {
    clearMinutesFilesCache();
  }
  const config = getMinutesFilesConfig();

  if (!forceRefresh && inMemoryFilesList && Date.now() - inMemoryLastFetchedTime < CACHE_TTL_MS) {
    return { success: true, data: inMemoryFilesList, source: 'cache' };
  }

  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cacheTime && Date.now() - parseInt(cacheTime, 10) < CACHE_TTL_MS) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryFilesList = parsed;
          inMemoryLastFetchedTime = parseInt(cacheTime, 10);
          return { success: true, data: parsed, source: 'cache' };
        }
      }
    } catch {}
  }

  // Try GViz from Google Sheet
  if (config.SPREADSHEET_ID) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${config.SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${config.SHEET_GID}&t=${Date.now()}`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (match && match[1]) {
          const json = JSON.parse(match[1]);
          const cols = json.table?.cols || [];
          const rows = json.table?.rows || [];

          let nameIdx = 0;
          let urlIdx = 1;
          let catIdx = 2;
          let sizeIdx = 3;

          cols.forEach((col: any, idx: number) => {
            const label = (col.label || col.id || '').toString().toLowerCase();
            if (/tên file|ten file|tên biên bản|tiêu đề|name/i.test(label)) nameIdx = idx;
            if (/link|đường dẫn|url|tải về|download/i.test(label)) urlIdx = idx;
            if (/phân loại|nhóm|category/i.test(label)) catIdx = idx;
            if (/dung lượng|size|kích thước/i.test(label)) sizeIdx = idx;
          });

          const items: MinuteFileItem[] = [];
          rows.forEach((r: any, rIdx: number) => {
            const c = r.c || [];
            const fileName = (c[nameIdx]?.v || c[nameIdx]?.f || '').toString().trim();
            const fileUrl = (c[urlIdx]?.v || c[urlIdx]?.f || '').toString().trim();
            const category = (c[catIdx]?.v || c[catIdx]?.f || '').toString().trim();
            const fileSize = (c[sizeIdx]?.v || c[sizeIdx]?.f || '').toString().trim();

            if (fileName && fileName.toLowerCase() !== 'tên file') {
              items.push({
                id: `file-${rIdx + 1}`,
                fileName,
                fileUrl: fileUrl || 'https://docs.google.com/spreadsheets/d/' + config.SPREADSHEET_ID,
                category: category || 'Biên bản & File',
                fileSize: fileSize || '1.0 MB',
                searchIndex: prepareSearchIndex([fileName, category])
              });
            }
          });

          if (items.length > 0) {
            inMemoryFilesList = items;
            inMemoryLastFetchedTime = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(items));
            localStorage.setItem(CACHE_TIME_KEY, String(inMemoryLastFetchedTime));
            return { success: true, data: items, source: 'gviz' };
          }
        }
      }
    } catch (e) {
      console.warn('GViz fetch for minutes files failed:', e);
    }
  }

  // Fallback to default items
  const defaults = DEFAULT_MINUTES_FILES_DATA.map((it) => ({
    ...it,
    searchIndex: prepareSearchIndex([it.fileName, it.category || ''])
  }));
  inMemoryFilesList = defaults;
  inMemoryLastFetchedTime = Date.now();
  return { success: true, data: defaults, source: 'default', message: 'Hiển thị danh sách biên bản & file mặc định.' };
}
