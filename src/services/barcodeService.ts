// Configuration for Google Sheet Barcode Lookup
export interface BarcodeConfig {
  SPREADSHEET_ID: string;
  SHEET_GID: string;
  SHEET_NAME?: string;
  SHEET_URL?: string;
  API_URL?: string; // Optional Google Apps Script Web App URL
}

export const DEFAULT_BARCODE_CONFIG: BarcodeConfig = {
  SPREADSHEET_ID: '1-i-eXMU9y0Se68wsvycK5-t8r4aFpo7iVi9ZgsoGX0M',
  SHEET_GID: '0',
  API_URL: '',
};

export interface ProductBarcodeItem {
  productCode: string; // Mã sản phẩm
  productName?: string; // Tên sản phẩm
  barcode: string; // Barcode (strictly as string)
  rawRowIndex?: number;
  extraInfo?: Record<string, string>;
}

export interface BarcodeLookupHistoryItem {
  id?: string;
  productCode: string;
  barcode?: string;
  productName?: string;
  status?: 'success' | 'failed';
  message?: string;
  timestamp: number;
  formattedTime?: string;
  clientIp?: string;
  isAdmin?: boolean;
}

export interface LookupResult {
  success: boolean;
  product?: ProductBarcodeItem;
  message?: string;
  totalProducts?: number;
  source?: 'cache' | 'gviz' | 'csv' | 'gas';
}

const CACHE_KEY = 'ssc_barcode_sheet_cache_v3';
const CACHE_TIME_KEY = 'ssc_barcode_cache_time_v3';
const HISTORY_KEY = 'ssc_barcode_lookup_history_v5';
const CONFIG_KEY = 'ssc_barcode_custom_config_v3';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Purge previous search history on client to ensure a completely clean slate
if (typeof window !== 'undefined') {
  try {
    [
      'ssc_barcode_lookup_history_v1',
      'ssc_barcode_lookup_history_v2',
      'ssc_barcode_lookup_history_v3',
      'ssc_barcode_lookup_history_v4',
      'ssc_barcode_history_v1',
      'ssc_barcode_history',
      'ssc_barcode_lookup_history'
    ].forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// In-memory cache for ultra-fast instant lookups
let inMemoryProductMap: Map<string, ProductBarcodeItem> | null = null;
let cachedArrayForSearch: { item: ProductBarcodeItem; code: string; name: string }[] | null = null;
let inMemoryLastFetched: number = 0;

/**
 * Fetch barcode configuration from server API to persist across publishes & sessions
 */
export async function fetchBarcodeConfigFromServer(): Promise<BarcodeConfig> {
  try {
    const res = await fetch('/api/config/barcode');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.config) {
        const merged: BarcodeConfig = {
          ...DEFAULT_BARCODE_CONFIG,
          ...data.config
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch barcode config from server:', err);
  }
  return getBarcodeConfig();
}

/**
 * Get active configuration (from LocalStorage or default)
 */
export function getBarcodeConfig(): BarcodeConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_BARCODE_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading barcode config:', e);
  }
  return DEFAULT_BARCODE_CONFIG;
}

/**
 * Save custom configuration to localStorage and persist to server disk
 */
export function saveBarcodeConfig(config: Partial<BarcodeConfig>): void {
  const current = getBarcodeConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  // Invalidate cache on config change
  clearBarcodeCache();

  fetch('/api/config/barcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch((err) => console.warn('Could not sync barcode config to server:', err));
}

/**
 * Normalize product code: trim whitespace, uppercase, preserve leading zeros
 */
export function normalizeProductCode(input: string): string {
  if (!input) return '';
  return input.toString().trim().toUpperCase();
}

/**
 * Normalize barcode: string only, trim, preserve leading zeros
 */
export function normalizeBarcode(input: any): string {
  if (input === null || input === undefined) return '';
  return input.toString().trim();
}

/**
 * Clear cache to force next request to fetch live data
 */
export function clearBarcodeCache(): void {
  inMemoryProductMap = null;
  cachedArrayForSearch = null;
  inMemoryLastFetched = 0;
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
}

/**
 * Fetch and parse data from Google Sheet using Google Visualization API
 */
async function fetchFromGviz(config: BarcodeConfig): Promise<Map<string, ProductBarcodeItem>> {
  const url = `https://docs.google.com/spreadsheets/d/${config.SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${config.SHEET_GID}&headers=1&t=${Date.now()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Sheets GViz HTTP Error: ${response.status}`);
  }

  const text = await response.text();
  // Google returns `/*O_o*/\ngoogle.visualization.Query.setResponse({...});`
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid GViz response format from Google Sheets');
  }

  const data = JSON.parse(jsonMatch[1]);
  if (data.status !== 'ok' || !data.table) {
    throw new Error(data.errors?.[0]?.message || 'Google Sheets response not OK');
  }

  const table = data.table;
  const cols = table.cols || [];
  const rows = table.rows || [];

  // Identify column indices
  let codeColIdx = -1;
  let barcodeColIdx = -1;
  let nameColIdx = -1;

  cols.forEach((col: any, idx: number) => {
    const label = (col.label || col.id || '').toString().toLowerCase().trim();
    if (codeColIdx === -1 && /(mã sản phẩm|ma san pham|product code|productcode|mã sp|masp|sku|mã hàng|^code$)/i.test(label)) {
      codeColIdx = idx;
    }
    if (barcodeColIdx === -1 && /(mã barcode|barcode|bar code|mã vạch|ean|upc)/i.test(label)) {
      barcodeColIdx = idx;
    }
    if (nameColIdx === -1 && /(tên sản phẩm|ten san pham|product name|productname|tên hàng|tên thuốc|tên sp|tensp|^name$)/i.test(label)) {
      nameColIdx = idx;
    }
  });

  // Fallbacks if header labels were empty or not matched
  if (codeColIdx === -1) codeColIdx = 0;
  if (nameColIdx === -1) nameColIdx = 1;
  if (barcodeColIdx === -1) barcodeColIdx = 2;

  const map = new Map<string, ProductBarcodeItem>();

  rows.forEach((row: any, rIdx: number) => {
    const c = row.c || [];
    const getCellStr = (idx: number): string => {
      if (idx < 0 || idx >= c.length || !c[idx]) return '';
      const cell = c[idx];
      // Prefer formatted string 'f' to keep leading zeros, else string value 'v'
      if (cell.f !== undefined && cell.f !== null) return String(cell.f).trim();
      if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
      return '';
    };

    const rawCode = getCellStr(codeColIdx);
    const rawBarcode = getCellStr(barcodeColIdx);
    const rawName = getCellStr(nameColIdx);

    const normCode = normalizeProductCode(rawCode);
    const normBarcode = normalizeBarcode(rawBarcode);

    if (normCode) {
      map.set(normCode, {
        productCode: rawCode.trim(),
        barcode: normBarcode,
        productName: rawName || undefined,
        rawRowIndex: rIdx + 2,
      });
    }
  });

  return map;
}

/**
 * Fetch and parse data from Google Sheet using CSV Export
 */
async function fetchFromCsv(config: BarcodeConfig): Promise<Map<string, ProductBarcodeItem>> {
  const url = `https://docs.google.com/spreadsheets/d/${config.SPREADSHEET_ID}/export?format=csv&gid=${config.SHEET_GID}&t=${Date.now()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Sheets CSV HTTP Error: ${response.status}`);
  }

  const text = await response.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 1) {
    return new Map();
  }

  // Parse CSV lines carefully handling quotes
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseCsvLine(lines[0]);
  let codeColIdx = -1;
  let barcodeColIdx = -1;
  let nameColIdx = -1;

  headers.forEach((h, idx) => {
    const label = h.toLowerCase().trim();
    if (codeColIdx === -1 && /(mã sản phẩm|ma san pham|product code|productcode|mã sp|masp|sku|mã hàng|^code$)/i.test(label)) {
      codeColIdx = idx;
    }
    if (barcodeColIdx === -1 && /(mã barcode|barcode|bar code|mã vạch|ean|upc)/i.test(label)) {
      barcodeColIdx = idx;
    }
    if (nameColIdx === -1 && /(tên sản phẩm|ten san pham|product name|productname|tên hàng|tên thuốc|tên sp|tensp|^name$)/i.test(label)) {
      nameColIdx = idx;
    }
  });

  if (codeColIdx === -1) codeColIdx = 0;
  if (nameColIdx === -1) nameColIdx = 1;
  if (barcodeColIdx === -1) barcodeColIdx = 2;

  const map = new Map<string, ProductBarcodeItem>();

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const rawCode = row[codeColIdx] || '';
    const rawBarcode = row[barcodeColIdx] || '';
    const rawName = row[nameColIdx] || '';

    const normCode = normalizeProductCode(rawCode);
    const normBarcode = normalizeBarcode(rawBarcode);

    if (normCode) {
      map.set(normCode, {
        productCode: rawCode,
        barcode: normBarcode,
        productName: rawName || undefined,
        rawRowIndex: i + 1,
      });
    }
  }

  return map;
}

/**
 * Fetch via Google Apps Script API if URL is provided
 */
async function fetchFromGas(apiUrl: string, productCode: string): Promise<ProductBarcodeItem | null> {
  const url = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}productCode=${encodeURIComponent(productCode)}&t=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Google Apps Script HTTP Error: ${response.status}`);
  const json = await response.json();
  if (json.success && json.barcode !== undefined) {
    return {
      productCode: json.productCode || productCode,
      barcode: normalizeBarcode(json.barcode),
      productName: json.productName || undefined,
    };
  }
  return null;
}

/**
 * Load all products into map, using cache if fresh
 */
export async function loadProductMap(forceRefresh: boolean = false): Promise<Map<string, ProductBarcodeItem>> {
  const config = getBarcodeConfig();
  const now = Date.now();

  // 1. Return in-memory map if fresh
  if (!forceRefresh && inMemoryProductMap && now - inMemoryLastFetched < CACHE_TTL_MS) {
    return inMemoryProductMap;
  }

  // 2. Return LocalStorage cache if fresh
  if (!forceRefresh) {
    try {
      const savedTime = localStorage.getItem(CACHE_TIME_KEY);
      const savedData = localStorage.getItem(CACHE_KEY);
      if (savedTime && savedData && now - parseInt(savedTime, 10) < CACHE_TTL_MS) {
        const parsedArray: ProductBarcodeItem[] = JSON.parse(savedData);
        const map = new Map<string, ProductBarcodeItem>();
        const searchList: { item: ProductBarcodeItem; code: string; name: string }[] = [];
        parsedArray.forEach((item) => {
          const code = normalizeProductCode(item.productCode);
          map.set(code, item);
          searchList.push({
            item,
            code,
            name: (item.productName || '').toUpperCase()
          });
        });
        inMemoryProductMap = map;
        cachedArrayForSearch = searchList;
        inMemoryLastFetched = parseInt(savedTime, 10);
        return map;
      }
    } catch (e) {
      console.warn('Could not read barcode local storage cache:', e);
    }
  }

  // 3. Fetch live data: Try GViz first, fallback to CSV
  let map: Map<string, ProductBarcodeItem>;
  try {
    map = await fetchFromGviz(config);
  } catch (gvizError) {
    console.warn('GViz fetch failed, trying CSV fallback...', gvizError);
    try {
      map = await fetchFromCsv(config);
    } catch (csvError) {
      console.error('CSV fetch also failed:', csvError);
      throw new Error('Không thể kết nối đến Google Sheet. Vui lòng kiểm tra quyền chia sẻ bảng tính hoặc kết nối mạng.');
    }
  }

  // 4. Update memory & LocalStorage cache
  inMemoryProductMap = map;
  cachedArrayForSearch = Array.from(map.values()).map(item => ({
    item,
    code: normalizeProductCode(item.productCode),
    name: (item.productName || '').toUpperCase()
  }));
  inMemoryLastFetched = now;

  try {
    const arrayToSave = Array.from(map.values());
    localStorage.setItem(CACHE_KEY, JSON.stringify(arrayToSave));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());
  } catch (e) {
    console.warn('Could not save barcode cache to localStorage:', e);
  }

  return map;
}

/**
 * Main lookup function: searches for a product code in the sheet
 */
export async function lookupBarcode(productCode: string, forceRefresh: boolean = false): Promise<LookupResult> {
  const normInput = normalizeProductCode(productCode);
  if (!normInput) {
    return {
      success: false,
      message: 'Vui lòng nhập Mã sản phẩm.',
    };
  }

  const config = getBarcodeConfig();

  // If user configured a dedicated Apps Script API URL, we can query it directly
  if (config.API_URL && config.API_URL.startsWith('http')) {
    try {
      const gasResult = await fetchFromGas(config.API_URL, normInput);
      if (gasResult) {
        return {
          success: true,
          product: gasResult,
          source: 'gas',
        };
      }
    } catch (e) {
      console.warn('Google Apps Script query failed, falling back to direct sheet query:', e);
    }
  }

  try {
    const map = await loadProductMap(forceRefresh);
    const found = map.get(normInput);

    if (found) {
      return {
        success: true,
        product: found,
        totalProducts: map.size,
        source: forceRefresh ? 'gviz' : 'cache',
      };
    }

    return {
      success: false,
      message: 'Không tìm thấy sản phẩm.',
      totalProducts: map.size,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Không thể kết nối dữ liệu Google Sheet.',
    };
  }
}

/**
 * Real-time autocomplete suggestions:
 * - When input has 8 characters (8 numbers/chars), returns 1 exact / single unique match
 * - When input has other lengths, returns up to 5 suggested products
 */
export async function searchProductSuggestions(
  query: string,
  maxResults: number = 5
): Promise<ProductBarcodeItem[]> {
  const rawQuery = query.trim();
  const normQuery = normalizeProductCode(rawQuery);
  if (!normQuery) return [];

  let map: Map<string, ProductBarcodeItem>;
  try {
    map = await loadProductMap();
  } catch (e) {
    return [];
  }

  if (!map || map.size === 0) return [];

  if (!cachedArrayForSearch) {
    cachedArrayForSearch = Array.from(map.values()).map(item => ({
      item,
      code: normalizeProductCode(item.productCode),
      name: (item.productName || '').toUpperCase()
    }));
  }

  // Special rule: When exactly 8 numbers/digits are entered, show 1 unique exact match
  if (normQuery.length === 8) {
    const exactMatch = map.get(normQuery);
    if (exactMatch) {
      return [exactMatch];
    }
    for (const entry of cachedArrayForSearch) {
      if (entry.code === normQuery || entry.code.includes(normQuery)) {
        return [entry.item];
      }
    }
  }

  const prefixMatches: ProductBarcodeItem[] = [];
  const codeContainsMatches: ProductBarcodeItem[] = [];
  const nameContainsMatches: ProductBarcodeItem[] = [];

  for (const entry of cachedArrayForSearch) {
    if (entry.code === normQuery) {
      prefixMatches.unshift(entry.item);
    } else if (entry.code.startsWith(normQuery)) {
      prefixMatches.push(entry.item);
    } else if (entry.code.includes(normQuery)) {
      codeContainsMatches.push(entry.item);
    } else if (entry.name.includes(normQuery)) {
      nameContainsMatches.push(entry.item);
    }

    if (prefixMatches.length >= maxResults) {
      break;
    }
  }

  const combined = [
    ...prefixMatches,
    ...codeContainsMatches,
    ...nameContainsMatches,
  ];

  const seen = new Set<string>();
  const uniqueList: ProductBarcodeItem[] = [];
  for (const item of combined) {
    const key = normalizeProductCode(item.productCode);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueList.push(item);
      if (uniqueList.length >= maxResults) break;
    }
  }

  return uniqueList;
}

/**
 * Search history helpers
 */
export const PRODUCT_IMAGE_SHEET = {
  SPREADSHEET_ID: '1-i-eXMU9y0Se68wsvycK5-t8r4aFpo7iVi9ZgsoGX0M',
  SHEET_GID: '1877904157',
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/1-i-eXMU9y0Se68wsvycK5-t8r4aFpo7iVi9ZgsoGX0M/edit?gid=1877904157#gid=1877904157',
};

// In-memory cache for product images & direct product links
const inMemoryImageMap = new Map<string, string>();
let isImageSheetPreloaded = false;
const CUSTOM_IMAGE_KEY = 'ssc_custom_product_images_v1';

/**
 * Get custom image URL saved by user in LocalStorage
 */
export function getCustomProductImageUrl(productCode: string): string | null {
  try {
    const norm = normalizeProductCode(productCode);
    if (!norm) return null;
    const raw = localStorage.getItem(CUSTOM_IMAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[norm] || null;
  } catch (e) {
    return null;
  }
}

/**
 * Save custom product image URL entered by user
 */
export function saveCustomProductImageUrl(productCode: string, url: string): void {
  try {
    const norm = normalizeProductCode(productCode);
    if (!norm) return;
    const formatted = formatDirectImageUrl(url.trim());
    if (!formatted) return;

    const raw = localStorage.getItem(CUSTOM_IMAGE_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[norm] = formatted;
    localStorage.setItem(CUSTOM_IMAGE_KEY, JSON.stringify(map));

    inMemoryImageMap.set(norm, formatted);
  } catch (e) {
    console.error('Error saving custom product image:', e);
  }
}

/**
 * Remove custom product image URL
 */
export function removeCustomProductImageUrl(productCode: string): void {
  try {
    const norm = normalizeProductCode(productCode);
    if (!norm) return;
    const raw = localStorage.getItem(CUSTOM_IMAGE_KEY);
    if (!raw) return;
    const map: Record<string, string> = JSON.parse(raw);
    delete map[norm];
    localStorage.setItem(CUSTOM_IMAGE_KEY, JSON.stringify(map));
    inMemoryImageMap.delete(norm);
  } catch (e) {
    console.error('Error removing custom product image:', e);
  }
}

/**
 * Generate quick Google Images search URL by Product Name + Code
 */
export function getGoogleImagesSearchUrl(productCode: string, productName?: string): string {
  const query = [productName?.trim(), productCode?.trim()].filter(Boolean).join(' ');
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

/**
 * Generate Long Chau search URL by Product Code
 */
export function getLongChauSearchUrl(productCode: string): string {
  return `https://nhathuoclongchau.com.vn/tim-kiem?s=${encodeURIComponent(productCode.trim())}`;
}

export interface ProductDirectInfo {
  directProductUrl: string;
  directImageUrl: string | null;
  productName?: string;
  found: boolean;
}

const directInfoCache = new Map<string, ProductDirectInfo>();

/**
 * Fetch direct product detail page URL & CDN image from backend resolver
 * Tự động phân tích kết quả tìm kiếm để lấy link trang chi tiết và link ảnh sản phẩm trực tiếp
 */
export async function fetchProductDirectInfo(productCode: string): Promise<ProductDirectInfo> {
  const norm = normalizeProductCode(productCode);
  if (!norm) {
    return {
      directProductUrl: 'https://nhathuoclongchau.com.vn',
      directImageUrl: null,
      found: false,
    };
  }

  if (directInfoCache.has(norm)) {
    return directInfoCache.get(norm)!;
  }

  try {
    const res = await fetch(`/api/product/resolve?code=${encodeURIComponent(norm)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const info: ProductDirectInfo = {
          directProductUrl: data.directProductUrl || `/api/product/jump?code=${encodeURIComponent(norm)}`,
          directImageUrl: data.directImageUrl || null,
          productName: data.productName,
          found: Boolean(data.found),
        };
        directInfoCache.set(norm, info);
        if (data.directImageUrl) {
          inMemoryImageMap.set(norm, data.directImageUrl);
        }
        return info;
      }
    }
  } catch (err) {
    console.warn('Could not resolve direct product info via API:', err);
  }

  const fallback: ProductDirectInfo = {
    directProductUrl: `/api/product/jump?code=${encodeURIComponent(norm)}`,
    directImageUrl: null,
    found: false,
  };
  directInfoCache.set(norm, fallback);
  return fallback;
}

/**
 * Format raw image URL to ensure direct rendering (e.g. converting Google Drive preview links to direct thumbnail/image links)
 */
export function formatDirectImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Google Drive link conversion (e.g., https://drive.google.com/file/d/FILE_ID/view?usp=sharing)
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1000`;
  }
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w1000`;
  }

  // Google Photos or other direct URLs
  return trimmed;
}

export interface ProductImageSuggestion {
  url: string;
  thumbnail: string;
  title: string;
  proxiedUrl: string;
}

/**
 * Tự động tìm kiếm danh sách ảnh sản phẩm thực tế theo tên hoặc mã SP
 */
export async function searchProductRealImages(productCode: string, productName?: string): Promise<{
  images: ProductImageSuggestion[];
  primaryImage: string | null;
  proxiedPrimaryImage: string | null;
}> {
  const norm = normalizeProductCode(productCode);
  const cleanName = (productName || '').trim();
  const q = cleanName ? `${cleanName}` : norm;

  try {
    const res = await fetch(`/api/product/image-search?query=${encodeURIComponent(q)}&code=${encodeURIComponent(norm)}`);
    if (!res.ok) {
      return { images: [], primaryImage: null, proxiedPrimaryImage: null };
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.images)) {
      const suggestions: ProductImageSuggestion[] = data.images.map((img: any) => ({
        url: img.url,
        thumbnail: img.thumbnail || img.url,
        title: img.title || '',
        proxiedUrl: `/api/image/proxy?url=${encodeURIComponent(img.url)}`
      }));
      return {
        images: suggestions,
        primaryImage: data.primaryImage || null,
        proxiedPrimaryImage: data.proxiedPrimaryImage || null
      };
    }
  } catch (e) {
    console.warn('Failed to call /api/product/image-search:', e);
  }
  return { images: [], primaryImage: null, proxiedPrimaryImage: null };
}

/**
 * Fetch Product Image URL (direct CDN image link or automatic image search)
 */
export async function fetchProductImageUrl(productCode: string, productName?: string): Promise<string | null> {
  const norm = normalizeProductCode(productCode);
  if (!norm) return null;

  // 0. Check custom image URL saved by user in LocalStorage
  const customImg = getCustomProductImageUrl(norm);
  if (customImg) {
    inMemoryImageMap.set(norm, customImg);
    return customImg;
  }

  if (inMemoryImageMap.has(norm)) {
    const cached = inMemoryImageMap.get(norm);
    if (cached && !cached.includes('tim-kiem')) {
      return cached;
    }
  }

  // 1. Try fast direct resolver first (resolves Long Chau CDN image & direct link in <150ms)
  try {
    const directInfo = await fetchProductDirectInfo(norm);
    if (directInfo.directImageUrl) {
      inMemoryImageMap.set(norm, directInfo.directImageUrl);
      return directInfo.directImageUrl;
    }
  } catch (e) {
    // Fall back to sheet
  }

  const rawClean = productCode.trim();

  try {
    // 2. Query Google Visualization API directly for this specific product code
    const query = `SELECT * WHERE A = '${rawClean}' OR A = '${norm}'`;
    const url = `https://docs.google.com/spreadsheets/d/${PRODUCT_IMAGE_SHEET.SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${PRODUCT_IMAGE_SHEET.SHEET_GID}&tq=${encodeURIComponent(query)}&t=${Date.now()}`;

    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
      if (match && match[1]) {
        const json = JSON.parse(match[1]);
        const rows = json.table?.rows || [];
        if (rows.length > 0) {
          const c = rows[0].c || [];
          // Search across cells for the first URL-like string
          for (let i = 1; i < c.length; i++) {
            const val = c[i]?.v || c[i]?.f || '';
            if (val && typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
              const formatted = formatDirectImageUrl(val.trim());
              if (formatted && !formatted.includes('tim-kiem')) {
                inMemoryImageMap.set(norm, formatted);
                return formatted;
              }
            }
          }
          const fallbackVal = c[1]?.v || c[1]?.f || '';
          if (fallbackVal && typeof fallbackVal === 'string' && fallbackVal.trim()) {
            const formatted = formatDirectImageUrl(fallbackVal.trim());
            if (formatted && !formatted.includes('tim-kiem')) {
              inMemoryImageMap.set(norm, formatted);
              return formatted;
            }
          }
        }
      }
    }

    // 3. If direct query returned empty and not preloaded, fetch whole sheet to cache
    if (!isImageSheetPreloaded) {
      const allUrl = `https://docs.google.com/spreadsheets/d/${PRODUCT_IMAGE_SHEET.SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${PRODUCT_IMAGE_SHEET.SHEET_GID}&t=${Date.now()}`;
      const allRes = await fetch(allUrl);
      if (allRes.ok) {
        const allText = await allRes.text();
        const allMatch = allText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (allMatch && allMatch[1]) {
          const allJson = JSON.parse(allMatch[1]);
          const allRows = allJson.table?.rows || [];
          for (const row of allRows) {
            const cells = row.c || [];
            const rowCode = normalizeProductCode(cells[0]?.v || cells[0]?.f || '');
            let img = '';
            for (let k = 1; k < cells.length; k++) {
              const cellVal = (cells[k]?.v || cells[k]?.f || '').toString().trim();
              if (cellVal.startsWith('http://') || cellVal.startsWith('https://')) {
                img = cellVal;
                break;
              }
            }
            if (!img && cells[1]) {
              img = (cells[1]?.v || cells[1]?.f || '').toString().trim();
            }
            if (rowCode && img && !img.includes('tim-kiem')) {
              inMemoryImageMap.set(rowCode, formatDirectImageUrl(img) || img);
            }
          }
          isImageSheetPreloaded = true;
          if (inMemoryImageMap.has(norm)) {
            return inMemoryImageMap.get(norm) || null;
          }
        }
      }
    }
  } catch (err) {
    console.warn('GViz query for product image failed:', err);
  }

  // 4. Tự động tìm kiếm ảnh sản phẩm thực tế qua API tìm kiếm ảnh thông minh & proxy
  try {
    const searchRes = await searchProductRealImages(productCode, productName);
    if (searchRes.primaryImage) {
      const bestUrl = searchRes.proxiedPrimaryImage || searchRes.primaryImage;
      inMemoryImageMap.set(norm, bestUrl);
      return bestUrl;
    }
  } catch (err) {
    console.warn('Smart product image search failed:', err);
  }

  return null;
}

export function getBarcodeHistory(): BarcodeLookupHistoryItem[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      const list: BarcodeLookupHistoryItem[] = JSON.parse(saved);
      return Array.isArray(list) ? list : [];
    }
  } catch (e) {
    console.error('Error reading barcode history:', e);
  }
  return [];
}

/**
 * Record barcode search event (both SUCCESS and FAILED, with IP and Timestamp)
 */
export async function saveBarcodeHistory(item: {
  productCode: string;
  barcode?: string;
  productName?: string;
  status: 'success' | 'failed';
  message?: string;
  clientIp?: string;
  isAdmin?: boolean;
}): Promise<void> {
  const norm = normalizeProductCode(item.productCode);
  if (!norm) return;

  const now = new Date();
  const formattedTime = now.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const ip = item.clientIp || sessionStorage.getItem('ssc_detected_public_ip') || '';
  const isAdmin = typeof item.isAdmin === 'boolean' ? item.isAdmin : (typeof window !== 'undefined' && (window.location.hostname.startsWith('ais-dev-') || window.location.hostname === 'localhost' || sessionStorage.getItem('ssc_admin_auth') === 'true' || localStorage.getItem('ssc_admin_auth') === 'true'));

  const newEntry: BarcodeLookupHistoryItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productCode: norm,
    barcode: item.barcode ? item.barcode.trim() : '',
    productName: item.productName ? item.productName.trim() : '',
    status: item.status,
    message: item.message || (item.status === 'success' ? 'Tìm thấy mã vạch' : 'Không tìm thấy sản phẩm'),
    timestamp: Date.now(),
    formattedTime,
    clientIp: ip,
    isAdmin
  };

  // 1. Update localStorage
  try {
    const current = getBarcodeHistory();
    // Keep all attempts in log (up to 300 in local storage)
    const updated = [newEntry, ...current].slice(0, 300);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving barcode history locally:', e);
  }

  // 2. Sync to server-side database / log file
  try {
    fetch('/api/barcode/history/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productCode: norm,
        barcode: item.barcode || '',
        productName: item.productName || '',
        status: item.status,
        message: newEntry.message,
        clientIp: ip,
        isAdmin
      })
    }).catch(() => {});
  } catch {}
}

export function clearBarcodeHistory(keepAdmin: boolean = true): BarcodeLookupHistoryItem[] {
  try {
    const current = getBarcodeHistory();
    const remaining = keepAdmin ? current.filter((h) => h.isAdmin === true) : [];
    if (remaining.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(HISTORY_KEY);
    }
    fetch(`/api/barcode/history?keepAdmin=${keepAdmin}`, { method: 'DELETE' }).catch(() => {});
    return remaining;
  } catch (e) {
    console.error('Error clearing barcode history:', e);
    return [];
  }
}

export function removeBarcodeHistoryItem(idOrCode: string): BarcodeLookupHistoryItem[] {
  const current = getBarcodeHistory();
  const updated = current.filter(
    (h) => h.id !== idOrCode && normalizeProductCode(h.productCode) !== normalizeProductCode(idOrCode)
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  try {
    fetch(`/api/barcode/history?id=${encodeURIComponent(idOrCode)}`, { method: 'DELETE' }).catch(() => {});
  } catch {}
  return updated;
}

/**
 * Fetch full barcode search history from server with fallback to localStorage
 */
export async function fetchServerBarcodeHistory(): Promise<BarcodeLookupHistoryItem[]> {
  try {
    const res = await fetch('/api/barcode/history?limit=300');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
        // Sync local storage
        localStorage.setItem(HISTORY_KEY, JSON.stringify(data.logs));
        return data.logs;
      }
    }
  } catch {}
  return getBarcodeHistory();
}

/**
 * Export barcode history as an Excel .xlsx file (either via server or client-side XLSX)
 */
export async function exportBarcodeHistoryToExcel(items?: BarcodeLookupHistoryItem[]): Promise<void> {
  const dataToExport = (items && items.length > 0) ? items : getBarcodeHistory();

  // Try server-side export first
  try {
    const res = await fetch('/api/barcode/history/export');
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Lich_Su_Tra_Cuu_Barcode_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return;
    }
  } catch (err) {
    console.warn('Server export failed, falling back to client-side XLSX:', err);
  }

  // Client-side fallback using xlsx package
  try {
    const XLSX = await import('xlsx');
    const rows = dataToExport.map((item, index) => ({
      'STT': index + 1,
      'Thời gian tra cứu': item.formattedTime || new Date(item.timestamp).toLocaleString('vi-VN'),
      'Mã sản phẩm': item.productCode,
      'Mã Barcode': item.barcode || '---',
      'Tên sản phẩm': item.productName || '---',
      'Trạng thái': item.status === 'failed' ? 'Thất bại (Không tìm thấy)' : 'Thành công',
      'Ghi chú / Kết quả': item.message || (item.status === 'failed' ? 'Mã không tồn tại' : 'Tìm thấy mã vạch'),
      'Địa chỉ IP truy cập': item.clientIp || '---'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 15 },
      { wch: 18 },
      { wch: 40 },
      { wch: 24 },
      { wch: 30 },
      { wch: 18 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LichSuTraCuuBarcode');
    XLSX.writeFile(workbook, `Lich_Su_Tra_Cuu_Barcode_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err: any) {
    console.error('Client XLSX export error:', err);
    alert('Không thể tạo file Excel: ' + err.message);
  }
}

/**
 * Google Apps Script Source Code generator
 */
export function getGoogleAppsScriptCode(): string {
  return `/**
 * GOOGLE APPS SCRIPT API CHO TRA CỨU BARCODE SẢN PHẨM
 * Spreadsheet ID: 1-i-eXMU9y0Se68wsvycK5-t8r4aFpo7iVi9ZgsoGX0M
 * Sheet GID: 1164189883
 */

const CONFIG = {
  SPREADSHEET_ID: "1-i-eXMU9y0Se68wsvycK5-t8r4aFpo7iVi9ZgsoGX0M",
  SHEET_GID: "0"
};

function doGet(e) {
  try {
    const productCode = (e.parameter.productCode || e.parameter.code || "").toString().trim().toUpperCase();
    
    // Mở Spreadsheet và Sheet tương ứng
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = null;
    const sheets = ss.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      if (sheets[i].getSheetId().toString() === CONFIG.SHEET_GID.toString()) {
        sheet = sheets[i];
        break;
      }
    }
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }

    // Đọc toàn bộ dữ liệu dưới dạng Text để giữ nguyên số 0 ở đầu
    const range = sheet.getDataRange();
    const displayValues = range.getDisplayValues();
    if (displayValues.length < 2) {
      return jsonResponse({ success: false, message: "Bảng tính chưa có dữ liệu" });
    }

    // Xác định chỉ số các cột theo tiêu đề
    const headers = displayValues[0];
    let codeCol = -1;
    let barcodeCol = -1;
    let nameCol = -1;

    for (let j = 0; j < headers.length; j++) {
      const h = headers[j].toString().toLowerCase().trim();
      if (codeCol === -1 && /(mã sản phẩm|ma san pham|product code|productcode|mã sp|masp|sku|mã hàng|^code$)/i.test(h)) {
        codeCol = j;
      }
      if (barcodeCol === -1 && /(mã barcode|barcode|bar code|mã vạch|ean|upc)/i.test(h)) {
        barcodeCol = j;
      }
      if (nameCol === -1 && /(tên sản phẩm|ten san pham|product name|productname|tên hàng|tên thuốc|tên sp|tensp|^name$)/i.test(h)) {
        nameCol = j;
      }
    }

    if (codeCol === -1) codeCol = 0;
    if (nameCol === -1) nameCol = 1;
    if (barcodeCol === -1) barcodeCol = 2;

    if (!productCode) {
      // Nếu không truyền mã, trả về danh sách tổng quan hoặc thông báo
      return jsonResponse({
        success: true,
        message: "API sẵn sàng. Hãy truyền tham số ?productCode=XXXX",
        totalRows: displayValues.length - 1
      });
    }

    // Tìm kiếm mã sản phẩm
    for (let r = 1; r < displayValues.length; r++) {
      const row = displayValues[r];
      const rowCode = (row[codeCol] || "").toString().trim().toUpperCase();
      
      if (rowCode === productCode) {
        const rawBarcode = (row[barcodeCol] || "").toString().trim();
        const rawName = (row[nameCol] || "").toString().trim();
        
        return jsonResponse({
          success: true,
          productCode: row[codeCol].toString().trim(),
          barcode: rawBarcode, // Giữ nguyên chuỗi dạng text
          productName: rawName || "Không có tên sản phẩm"
        });
      }
    }

    return jsonResponse({
      success: false,
      message: "Không tìm thấy sản phẩm"
    });

  } catch (err) {
    return jsonResponse({
      success: false,
      message: "Không thể kết nối dữ liệu: " + err.toString()
    });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
}
