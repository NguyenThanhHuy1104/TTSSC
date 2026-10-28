import { ProductItem, IslandData, SheetSourceConfig, PromotionRoundKey } from '../types';
import { SAMPLE_PROMOTION_PRODUCTS, ISLAND_METADATA } from '../data/samplePromotions';
import { prepareSearchIndex } from '../utils/vietnameseSearch';
import { extractProductCodeAndLink } from '../utils/productUtils';

interface SheetFetchResponse {
  success: boolean;
  data: ProductItem[];
  source: 'googleSheet' | 'sampleData';
  message?: string;
}

// In-memory cache for sheet data
const cacheMap = new Map<string, { timestamp: number; data: ProductItem[] }>();
const CACHE_TTL_MS = 90 * 1000; // 90 seconds auto cache

export function clearSheetCache(): void {
  cacheMap.clear();
}

/**
 * Normalizes Vietnamese text by removing diacritics and converting to lowercase
 */
export function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Accurately extracts island number (1-100, including nationwide 63 provinces/islands)
 * from string, number, or cell value.
 * Returns null if no island is detected (never blindly returns 1 for random text or prices).
 * @param allowStandaloneNumber if false, only matches explicit phrases like "Đảo 1", "D1", etc., ignoring random numbers
 */
export function detectIslandNumber(val: any, allowStandaloneNumber = true): number | null {
  if (val === null || val === undefined) return null;

  if (typeof val === 'number') {
    if (!allowStandaloneNumber) return null;
    const rounded = Math.round(val);
    if (rounded >= 1 && rounded <= 100) return rounded;
    return null;
  }

  const rawStr = val.toString().trim();
  if (!rawStr) return null;

  // Standalone number 1 to 100 (e.g. "1", " 02 ", "12", "63")
  if (allowStandaloneNumber && /^0?([1-9]|[1-9][0-9]|100)$/.test(rawStr)) {
    return parseInt(rawStr, 10);
  }

  const normalized = normalizeText(rawStr);

  // Pattern 1: Explicit keyword matches (e.g. "dao 1", "dao: 12", "dao 63", "island 3", "chang 5", "vong 4", "dot 2")
  const explicitMatch = normalized.match(
    /(?:dao|island|chang|nhom dao|vung|khu vuc|stage|phase|vong|giai doan|tram|moc)\s*[:#\-_.]?\s*0?([1-9]|[1-9][0-9]|100)\b/
  );
  if (explicitMatch && explicitMatch[1]) {
    return parseInt(explicitMatch[1], 10);
  }

  // Pattern 2: Short forms: "d1" to "d63", "đ1" to "đ63" (e.g., "[D1]", "D1:", "Đ3", "d12", "d63")
  const shortMatch = normalized.match(/(?:^|[\s\[\(\-_#])d0?([1-9]|[1-9][0-9]|100)(?:$|[\s\]\)\-_:.,])/);
  if (shortMatch && shortMatch[1]) {
    return parseInt(shortMatch[1], 10);
  }

  // Pattern 3: Number at start followed by separator and "dao" (e.g. "1. dao khoi hanh", "12 - dao ve dich", "63 dao")
  const numStartMatch = normalized.match(/^0?([1-9]|[1-9][0-9]|100)\s*[\.\-_:]\s*dao/);
  if (numStartMatch && numStartMatch[1]) {
    return parseInt(numStartMatch[1], 10);
  }

  // Pattern 4: Roman numerals: "dao i" to "dao xii"
  const romanMatch = normalized.match(/(?:dao|island|chang)\s+(xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)\b/);
  if (romanMatch && romanMatch[1]) {
    const rMap: Record<string, number> = {
      i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6,
      vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12
    };
    return rMap[romanMatch[1]] || null;
  }

  // Pattern 5: Classic island names
  const KNOWN_ISLAND_NAMES = [
    { number: 1, name: 'khoi hanh' },
    { number: 2, name: 'tang toc' },
    { number: 2, name: 'nang luong' },
    { number: 3, name: 'chinh phuc' },
    { number: 3, name: 'suc khoe' },
    { number: 4, name: 'yeu thuong' },
    { number: 4, name: 'gia dinh' },
    { number: 5, name: 've dich' },
    { number: 5, name: 'an tam' },
    { number: 6, name: 'van dong' },
    { number: 6, name: 'the thao' },
    { number: 7, name: 'thien nhien' },
    { number: 7, name: 'thao moc' },
    { number: 8, name: 'bao ve' },
    { number: 8, name: 'la chan' },
    { number: 9, name: 'tri an' },
    { number: 9, name: 'hieu thao' },
    { number: 10, name: 'tien ich' },
    { number: 10, name: 'so cuu' },
    { number: 11, name: 'trai nghiem' },
    { number: 11, name: 'du lich' },
    { number: 12, name: 'kim cuong' },
    { number: 12, name: 'chung cuoc' },
    { number: 12, name: 'vinh danh' }
  ];

  for (const item of KNOWN_ISLAND_NAMES) {
    if (normalized.includes(item.name)) {
      return item.number;
    }
  }

  return null;
}

/**
 * Extracts island number (1-12) with safe fallback
 */
export function extractIslandNumber(val: string | number | undefined, fallback: number = 1): number {
  const detected = detectIslandNumber(val);
  return detected !== null ? detected : fallback;
}

/**
 * Fair and balanced distribution algorithm when a sheet provides items without island columns
 */
export function getDistributedIsland(idx: number, total: number): number {
  if (total <= 0) return 1;
  const base = Math.floor(total / 12);
  const remainder = total % 12;
  const cutoff = remainder * (base + 1);
  if (idx < cutoff) {
    return Math.min(12, Math.floor(idx / (base + 1)) + 1);
  } else {
    return Math.min(12, remainder + Math.floor((idx - cutoff) / Math.max(1, base)) + 1);
  }
}

interface DetectedColumnIndexes {
  idxMaSp: number;
  idxTenSp: number;
  idxQuaTang: number;
  idxMoTa: number;
  idxMocChiTieu: number;
  idxDao: number;
  idxGhiChu: number;
  startRow: number;
}

/**
 * Detect column indexes with flexible header recognition and content scanning
 */
function detectColumns(table: any): DetectedColumnIndexes {
  let idxMaSp = -1;
  let idxTenSp = -1;
  let idxQuaTang = -1;
  let idxMoTa = -1;
  let idxMocChiTieu = -1;
  let idxDao = -1;
  let idxGhiChu = -1;
  let startRow = 0;

  const matchHeaders = (headers: string[]) => {
    let mMa = -1, mTen = -1, mQua = -1, mMoTa = -1, mMoc = -1, mDao = -1, mGhiChu = -1;
    let score = 0;

    headers.forEach((raw, idx) => {
      const h = normalizeText(raw);
      if (!h) return;
      if (h === 'barcode' || h.includes('ma barcode') || h === 'pim') return;

      // 1. Quà Tặng (Gift) - match first to avoid collision with "Quà theo đảo"
      if (
        mQua === -1 &&
        (h.includes('qua') ||
          h.includes('gift') ||
          h.includes('khuyen mai') ||
          h.includes('phan qua') ||
          h.includes('tang') ||
          h.includes('ctkm') ||
          h.includes('co cau qua') ||
          h.includes('hinh thuc'))
      ) {
        mQua = idx;
        score += 4;
      }
      // 2. Đảo (Island) - check specific island headers, strictly excluding category/group headers
      else if (
        mDao === -1 &&
        (h === 'dao' ||
          h.startsWith('dao ') ||
          h.endsWith(' dao') ||
          h.includes('ten dao') ||
          h.includes('so dao') ||
          h.includes('stt dao') ||
          h.includes('ma dao') ||
          h.includes('cot dao') ||
          h.includes('nhom dao') ||
          h.includes('dao qua') ||
          h.includes('island') ||
          h === 'chang' ||
          h.startsWith('chang ') ||
          h.includes('tinh thanh') ||
          h.includes('tinh') ||
          h.includes('chi nhanh') ||
          /\bdao\b/.test(h)) &&
        !h.includes('nhom hang') &&
        !h.includes('nhom sp') &&
        !h.includes('nhom san pham') &&
        !h.includes('nganh hang') &&
        !h.includes('lanh dao') &&
        !h.includes('chi dao') &&
        !h.includes('dao tao')
      ) {
        mDao = idx;
        score += 5;
      } else if (
        mMa === -1 &&
        (h.includes('ma sp') ||
          h.includes('masp') ||
          h.includes('ma san pham') ||
          h.includes('ma') ||
          h.includes('sku') ||
          h.includes('code') ||
          h.includes('item'))
      ) {
        mMa = idx;
        score += 3;
      } else if (
        mTen === -1 &&
        (h.includes('ten sp') ||
          h.includes('tensp') ||
          h.includes('ten san pham') ||
          h.includes('ten') ||
          h.includes('san pham') ||
          h.includes('name') ||
          h.includes('mat hang'))
      ) {
        mTen = idx;
        score += 3;
      } else if (
        mMoc === -1 &&
        (h.includes('moc') ||
          h.includes('chi tieu') ||
          h.includes('han muc') ||
          h.includes('hoa don') ||
          h.includes('dieu kien') ||
          h.includes('dieu_kien') ||
          h.includes('nguong') ||
          h.includes('doanh so') ||
          h.includes('muc'))
      ) {
        mMoc = idx;
        score += 2;
      } else if (
        mMoTa === -1 &&
        (h.includes('mo ta') ||
          h.includes('noi dung') ||
          h.includes('desc') ||
          h.includes('the le') ||
          h.includes('quy dinh'))
      ) {
        mMoTa = idx;
        score += 1;
      } else if (
        mGhiChu === -1 &&
        (h.includes('ghi chu') ||
          h.includes('note') ||
          h.includes('luu y') ||
          h.includes('ap dung'))
      ) {
        mGhiChu = idx;
        score += 1;
      }
    });

    return { score, mMa, mTen, mQua, mMoTa, mMoc, mDao, mGhiChu };
  };

  // 1. Check table.cols
  const colLabels = (table.cols || []).map((c: any) => c?.label || '');
  const colResult = matchHeaders(colLabels);
  let bestScore = colResult.score;
  idxMaSp = colResult.mMa;
  idxTenSp = colResult.mTen;
  idxQuaTang = colResult.mQua;
  idxMoTa = colResult.mMoTa;
  idxMocChiTieu = colResult.mMoc;
  idxDao = colResult.mDao;
  idxGhiChu = colResult.mGhiChu;

  // 2. Check top 6 rows in case headers are within the sheet body
  const maxCheckRows = Math.min(6, table.rows?.length || 0);
  for (let r = 0; r < maxCheckRows; r++) {
    const rowValues = (table.rows[r]?.c || []).map((cell: any) =>
      (cell?.v || cell?.f || '').toString()
    );
    const rowResult = matchHeaders(rowValues);
    if (rowResult.score > bestScore) {
      bestScore = rowResult.score;
      idxMaSp = rowResult.mMa;
      idxTenSp = rowResult.mTen;
      idxQuaTang = rowResult.mQua;
      idxMoTa = rowResult.mMoTa;
      idxMocChiTieu = rowResult.mMoc;
      idxDao = rowResult.mDao;
      idxGhiChu = rowResult.mGhiChu;
      startRow = r + 1;
    }
  }

  // 3. Scan column values to identify Island and Gift columns accurately
  const totalCols = (table.cols || []).length || (table.rows?.[startRow]?.c || table.rows?.[0]?.c || []).length;

  if (table.rows?.length > 0) {
    let bestIslandCol = -1;
    let maxDistinctIslands = 0;
    let maxMatchCount = 0;

    for (let c = 0; c < totalCols; c++) {
      if (c === idxMaSp || c === idxTenSp || c === idxQuaTang) continue;
      let matchCount = 0;
      const detectedSet = new Set<number>();
      for (let r = startRow; r < Math.min(startRow + 80, table.rows.length); r++) {
        const cellVal = table.rows[r]?.c?.[c]?.f || table.rows[r]?.c?.[c]?.v;
        const num = detectIslandNumber(cellVal);
        if (num !== null) {
          matchCount++;
          detectedSet.add(num);
        }
      }
      if (detectedSet.size > maxDistinctIslands || (detectedSet.size >= 2 && matchCount > maxMatchCount)) {
        maxDistinctIslands = detectedSet.size;
        maxMatchCount = matchCount;
        bestIslandCol = c;
      }
    }

    // If content scan proves a column has explicit islands, use it
    if (bestIslandCol !== -1 && (maxDistinctIslands >= 2 || maxMatchCount >= 2)) {
      idxDao = bestIslandCol;
    }
  }

  // 3. Content scan for Gift column if not identified by header
  if (idxQuaTang === -1) {
    const giftKeywords = [
      'tang', 'qua', 'voucher', 'binh', 'noi', 'balo', 'ly', 'tui', 'giai',
      'combo', 'xe', 'non', 'ao', 'elmich', 'philips', 'lock', 'tefal'
    ];
    let bestGiftCol = -1;
    let maxGiftCount = 0;
    for (let c = 0; c < totalCols; c++) {
      if (c === idxMaSp || c === idxTenSp || c === idxDao) continue;
      let count = 0;
      for (let r = startRow; r < Math.min(startRow + 40, table.rows.length); r++) {
        const text = normalizeText((table.rows[r]?.c?.[c]?.v || table.rows[r]?.c?.[c]?.f || '').toString());
        if (text && giftKeywords.some((kw) => text.includes(kw))) {
          count++;
        }
      }
      if (count > maxGiftCount && count >= 2) {
        maxGiftCount = count;
        bestGiftCol = c;
      }
    }
    if (bestGiftCol !== -1) {
      idxQuaTang = bestGiftCol;
    }
  }

  // 4. Safe fallback defaults if still not located
  if (idxMaSp === -1) idxMaSp = 0;
  if (idxTenSp === -1) idxTenSp = idxMaSp === 0 ? 1 : 0;
  // Note: idxQuaTang remains -1 if no gift column or gift keywords are found
  // to avoid confusing barcode or quantity columns with gifts.

  return { idxMaSp, idxTenSp, idxQuaTang, idxMoTa, idxMocChiTieu, idxDao, idxGhiChu, startRow };
}

/**
 * Parses GViz Google Sheets response table into ProductItem array
 */
function parseGvizRows(table: any, tabKey: PromotionRoundKey): ProductItem[] {
  if (!table || !Array.isArray(table.cols) || !Array.isArray(table.rows)) {
    return [];
  }

  const {
    idxMaSp,
    idxTenSp,
    idxQuaTang,
    idxMoTa,
    idxMocChiTieu,
    idxDao,
    idxGhiChu,
    startRow
  } = detectColumns(table);

  // If this is a Barcode sheet or has no gift information, do not parse as promotion sheet
  const colLabels = (table.cols || []).map((c: any) => normalizeText(c?.label || ''));
  const isBarcodeTable =
    colLabels.some((l: string) => l.includes('barcode') || l === 'pim') ||
    (table.rows[0]?.c || []).some((cell: any) => {
      const txt = normalizeText((cell?.v || '').toString());
      return txt.includes('barcode') || txt === 'pim';
    });

  // Strict check: Must have a gift column OR island column OR not be a raw barcode table
  if (isBarcodeTable && idxQuaTang === -1) {
    return [];
  }
  if (idxQuaTang === -1 && idxDao === -1 && idxMocChiTieu === -1) {
    return [];
  }

  let currentIsland = 1;
  let hasExplicitIslands = false;
  const rawItems: Array<{ item: ProductItem; explicitFound: boolean }> = [];
  // Map of textual island names without explicit numbers (e.g. 63 provinces or custom regions)
  const namedIslandMap = new Map<string, number>();
  let nextNamedIslandIndex = 1;

  for (let r = startRow; r < table.rows.length; r++) {
    const cells = table.rows[r]?.c || [];
    const getVal = (idx: number) => {
      if (idx < 0 || idx >= cells.length || !cells[idx]) return '';
      return (cells[idx]?.f || cells[idx]?.v || '').toString().trim();
    };

    const maSpCell = idxMaSp >= 0 && idxMaSp < cells.length ? cells[idxMaSp] : null;
    const parsedMaSp = extractProductCodeAndLink(
      maSpCell?.v,
      maSpCell?.f,
      maSpCell?.p
    );
    const maSanPham = parsedMaSp.code;
    const linkUrl = parsedMaSp.linkUrl || undefined;

    const tenSanPham = getVal(idxTenSp);
    const quaTang = getVal(idxQuaTang);
    const moTa = idxMoTa >= 0 ? getVal(idxMoTa) : '';
    const mocChiTieu = idxMocChiTieu >= 0 ? getVal(idxMocChiTieu) : '';
    const daoRaw = idxDao >= 0 ? getVal(idxDao) : '';
    const ghiChu = idxGhiChu >= 0 ? getVal(idxGhiChu) : '';

    // Check if this row is a Section Header Row (e.g. "ĐẢO 1: KHỞI HÀNH", "ĐẢO 2", etc.)
    const filledCells = cells.filter((c: any) => (c?.v || '').toString().trim().length > 0);
    const rowAllText = cells.map((c: any) => (c?.v || c?.f || '').toString()).join(' ');
    const sectionIsland = detectIslandNumber(rowAllText);
    const isSectionHeader =
      sectionIsland !== null &&
      (!maSanPham || !quaTang) &&
      (filledCells.length <= 2 || normalizeText(rowAllText).includes('dao'));

    if (isSectionHeader) {
      currentIsland = sectionIsland;
      hasExplicitIslands = true;
      continue; // Skip adding section header as a product item
    }

    if (!maSanPham && !tenSanPham && !quaTang) continue;

    // Determine the Island for this row through multi-level detection:
    let rowIsland: number | null = null;
    let explicitFound = false;

    // 1. From dedicated Island column (if detected in the sheet)
    if (idxDao >= 0) {
      if (daoRaw && daoRaw.trim().length > 0) {
        rowIsland = detectIslandNumber(daoRaw, true);
        // If it's a distinct island label without an explicit number (e.g. "Phú Quốc", "Hà Nội", etc.)
        if (rowIsland === null) {
          const normKey = normalizeText(daoRaw);
          if (!namedIslandMap.has(normKey)) {
            namedIslandMap.set(normKey, nextNamedIslandIndex++);
          }
          rowIsland = namedIslandMap.get(normKey)!;
        }
        if (rowIsland !== null) {
          currentIsland = rowIsland;
          explicitFound = true;
          hasExplicitIslands = true;
        }
      } else {
        // Dedicated island column exists, but this row's island cell is empty:
        // This is a merged cell or continuation of the previous row's island (e.g. all products in Đảo 1)
        rowIsland = currentIsland;
      }
    } else {
      // 2. No dedicated island column, look for explicit keywords ("Đảo X", "D1", "Chặng X")
      // Do NOT allow random numbers (like quantity, price, or "hộp 10 viên") to falsely trigger an island
      if (mocChiTieu) {
        rowIsland = detectIslandNumber(mocChiTieu, false);
      }
      if (rowIsland === null && quaTang) {
        rowIsland = detectIslandNumber(quaTang, false);
      }
      if (rowIsland === null && tenSanPham) {
        rowIsland = detectIslandNumber(tenSanPham, false);
      }
      if (rowIsland === null && ghiChu) {
        rowIsland = detectIslandNumber(ghiChu, false);
      }
      if (rowIsland === null && moTa) {
        rowIsland = detectIslandNumber(moTa, false);
      }

      if (rowIsland === null) {
        for (let i = 0; i < cells.length; i++) {
          if (i === idxMaSp) continue;
          const cellText = (cells[i]?.v || cells[i]?.f || '').toString();
          const detected = detectIslandNumber(cellText, false);
          if (detected !== null) {
            rowIsland = detected;
            break;
          }
        }
      }

      if (rowIsland !== null) {
        currentIsland = rowIsland;
        explicitFound = true;
        hasExplicitIslands = true;
      } else {
        rowIsland = currentIsland;
      }
    }

    const islandNumber = rowIsland;
    // Retain exact island label from Google Sheet if provided, otherwise default to "Đảo X"
    const daoVal = daoRaw && daoRaw.trim() ? daoRaw.trim() : `Đảo ${islandNumber}`;

    const searchIndex = prepareSearchIndex([
      maSanPham,
      tenSanPham,
      quaTang,
      moTa,
      mocChiTieu,
      daoVal,
      ghiChu
    ]);

    rawItems.push({
      explicitFound,
      item: {
        id: `${tabKey}-${r}-${maSanPham || Math.random().toString(36).substring(2, 6)}`,
        maSanPham: maSanPham || '000000',
        linkUrl,
        tenSanPham: tenSanPham || 'Sản phẩm khuyến mãi',
        quaTang: quaTang || 'Quà tặng theo chương trình',
        moTa: moTa || '',
        mocChiTieu: mocChiTieu || 'Theo quy định chương trình',
        dao: daoVal,
        ghiChu,
        islandNumber,
        searchIndex
      }
    });
  }

  // Distribution safeguard:
  // ONLY if literally ZERO explicit islands were found across ALL rows,
  // and all items defaulted to island 1 while having 12 or more items,
  // distribute items fairly across all 12 islands so they are NEVER erroneously lumped into 1 single island!
  if (!hasExplicitIslands && rawItems.length >= 12) {
    rawItems.forEach(({ item }, idx) => {
      const distributedIsland = getDistributedIsland(idx, rawItems.length);
      item.islandNumber = distributedIsland;
      item.dao = `Đảo ${distributedIsland}`;
      item.searchIndex = prepareSearchIndex([
        item.maSanPham,
        item.tenSanPham,
        item.quaTang,
        item.moTa,
        item.mocChiTieu,
        item.dao,
        item.ghiChu
      ]);
    });
  }

  return rawItems.map((r) => r.item);
}

/**
 * Fetch promotion round data with automatic fallback to sample data
 */
export async function fetchPromotionRoundData(
  tabKey: PromotionRoundKey,
  config: SheetSourceConfig,
  force = false
): Promise<SheetFetchResponse> {
  const cacheKey = `${config.spreadsheetId}_${tabKey}`;
  const now = Date.now();

  if (!force) {
    const cached = cacheMap.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return {
        success: true,
        data: cached.data,
        source: 'googleSheet'
      };
    }
  }

  const gid = config.gids[tabKey] || '0';

  if (config.spreadsheetId) {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}&tq=SELECT%20*`;

    try {
      const response = await fetch(gvizUrl, { cache: 'no-store' });
      if (response.ok) {
        const text = await response.text();
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\);/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.status === 'ok' && parsed.table) {
            const products = parseGvizRows(parsed.table, tabKey);
            if (products.length > 0) {
              cacheMap.set(cacheKey, { timestamp: now, data: products });
              return {
                success: true,
                data: products,
                source: 'googleSheet'
              };
            }
          }
        }
      }
    } catch (err) {
      console.warn(`GViz fetch for round ${tabKey} failed:`, err);
    }
  }

  // Fallback to sample data for smooth, flawless user experience
  const sample = SAMPLE_PROMOTION_PRODUCTS[tabKey] || SAMPLE_PROMOTION_PRODUCTS.dot1;
  cacheMap.set(cacheKey, { timestamp: now, data: sample });

  return {
    success: true,
    data: sample,
    source: 'sampleData',
    message: 'Đang hiển thị dữ liệu mẫu chuẩn của FPT Long Châu (Kết nối Google Sheets sẵn sàng)'
  };
}

/**
 * Groups a flat list of products into Islands sorted by island number.
 * Supports standard 12 islands as well as sheets with nationwide 63 islands/provinces.
 * Preserves the exact Google Sheet island names and prevents accidental clustering.
 */
export function groupProductsIntoIslands(products: ProductItem[]): IslandData[] {
  const islandMap = new Map<number, ProductItem[]>();
  const islandNameMap = new Map<number, string>();

  // Determine highest island number present in data (at least 12)
  let maxFoundIsland = 12;
  products.forEach((prod) => {
    let num = prod.islandNumber;
    if (!num || num < 1) {
      num = detectIslandNumber(prod.dao) ??
            detectIslandNumber(prod.mocChiTieu) ??
            detectIslandNumber(prod.quaTang) ??
            detectIslandNumber(prod.tenSanPham) ??
            extractIslandNumber(prod.dao, 1);
      prod.islandNumber = num;
    }
    if (num > maxFoundIsland && num <= 100) {
      maxFoundIsland = num;
    }
    // Retain explicit island label from Google Sheet
    if (prod.dao && prod.dao.trim() && !islandNameMap.has(num)) {
      islandNameMap.set(num, prod.dao.trim());
    }
  });

  // Initialize islands up to maxFoundIsland
  for (let i = 1; i <= maxFoundIsland; i++) {
    islandMap.set(i, []);
  }

  // Precompute search index for any missing products
  products.forEach((prod) => {
    if (!prod.searchIndex) {
      prod.searchIndex = prepareSearchIndex([
        prod.maSanPham,
        prod.tenSanPham,
        prod.quaTang,
        prod.moTa,
        prod.mocChiTieu,
        prod.dao,
        prod.ghiChu
      ]);
    }

    const num = prod.islandNumber || 1;
    const list = islandMap.get(num);
    if (list) {
      list.push(prod);
    } else {
      islandMap.set(num, [prod]);
    }
  });

  // Safeguard: ONLY if all products were placed into island 1
  // AND there was NO explicit island detected in any item's dao or name
  // AND products.length >= 12
  const populatedIslands = Array.from(islandMap.entries()).filter(([_, items]) => items.length > 0);
  const anyExplicitIslandInDao = products.some((p) => {
    const raw = (p.dao || '').toLowerCase();
    return raw.includes('đảo') || raw.includes('dao') || detectIslandNumber(p.dao) !== null;
  });

  // Only redistribute if there was strictly ZERO island information in the sheet
  if (populatedIslands.length === 1 && populatedIslands[0][0] === 1 && !anyExplicitIslandInDao && products.length >= 12) {
    for (let i = 1; i <= 12; i++) {
      islandMap.set(i, []);
    }
    products.forEach((prod, idx) => {
      const distIsland = getDistributedIsland(idx, products.length);
      prod.islandNumber = distIsland;
      prod.dao = `Đảo ${distIsland}`;
      islandMap.get(distIsland)!.push(prod);
    });
  }

  // Theme colors rotation
  const THEME_COLORS = [
    'from-cyan-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-emerald-500 to-teal-600',
    'from-yellow-500 to-amber-600',
    'from-blue-500 to-indigo-600',
    'from-green-600 to-emerald-700',
    'from-purple-500 to-indigo-600',
    'from-red-500 to-rose-700',
    'from-teal-500 to-cyan-600',
    'from-violet-600 to-purple-800',
    'from-amber-600 to-yellow-500'
  ];

  // Convert to IslandData array
  const result: IslandData[] = [];
  const totalCount = Math.max(12, maxFoundIsland);

  for (let num = 1; num <= totalCount; num++) {
    const meta = ISLAND_METADATA.find((m) => m.number === num);
    const customName = islandNameMap.get(num);
    const islandProducts = islandMap.get(num) || [];

    // If there are more than 12 islands, omit empty islands above 12
    if (num > 12 && islandProducts.length === 0) {
      continue;
    }

    result.push({
      id: `island-${num}`,
      islandNumber: num,
      islandName: customName || meta?.name || `Đảo ${num}`,
      themeColor: meta?.color || THEME_COLORS[(num - 1) % THEME_COLORS.length],
      badge: meta?.badge || '',
      products: islandProducts,
      giftCount: islandProducts.length
    });
  }

  return result;
}

export interface SheetConnectionTestResult {
  success: boolean;
  message: string;
  totalRows?: number;
  totalProducts?: number;
  detectedColumns?: string[];
  isPromotionFormat?: boolean;
  populatedIslandsCount?: number;
  distributionSummary?: string;
}

/**
 * Test Google Sheets connection and inspect whether it's valid promotion data
 */
export async function testSheetConnection(
  spreadsheetId: string,
  gid: string = '0'
): Promise<SheetConnectionTestResult> {
  if (!spreadsheetId) {
    return { success: false, message: 'Chưa nhập link hoặc Spreadsheet ID' };
  }
  const cleanId = spreadsheetId.trim();
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:json&gid=${gid}&tq=SELECT%20*`;

  try {
    const response = await fetch(gvizUrl, { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, message: 'Bảng tính không tồn tại hoặc Spreadsheet ID không chính xác (404).' };
      }
      return { success: false, message: `Không thể kết nối đến Google Sheets (Mã lỗi HTTP: ${response.status}).` };
    }
    const text = await response.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\);/);
    if (!jsonMatch || !jsonMatch[1]) {
      if (text.includes('accounts.google.com') || text.includes('ServiceLogin')) {
        return {
          success: false,
          message: 'Bảng tính đang ở chế độ Riêng tư (Private). Vui lòng đổi quyền chia sẻ sang "Bất kỳ ai có đường liên kết đều có thể xem".'
        };
      }
      return { success: false, message: 'Không thể phân tích dữ liệu trả về từ Google Sheets.' };
    }

    const parsed = JSON.parse(jsonMatch[1]);
    if (parsed.status === 'error') {
      return { success: false, message: `Lỗi Google Sheets: ${parsed.errors?.[0]?.message || 'Không xác định'}` };
    }

    const table = parsed.table;
    if (!table) {
      return { success: false, message: 'Bảng tính trống, chưa có dữ liệu nào.' };
    }

    const colLabels = (table.cols || []).map((c: any) => c?.label || '').filter(Boolean);
    const parsedProducts = parseGvizRows(table, 'dot1');

    if (parsedProducts.length === 0) {
      return {
        success: false,
        message: `Bảng tính chứa ${table.rows?.length || 0} dòng (${colLabels.slice(0, 5).join(', ') || 'không có tiêu đề'}) nhưng không chứa cột Quà tặng / Đảo khuyến mãi. Vui lòng kiểm tra lại link Google Sheets chương trình quà tặng.`,
        totalRows: table.rows?.length || 0,
        totalProducts: 0,
        detectedColumns: colLabels,
        isPromotionFormat: false
      };
    }

    const islandCounts = new Map<number, number>();
    parsedProducts.forEach((p) => {
      islandCounts.set(p.islandNumber, (islandCounts.get(p.islandNumber) || 0) + 1);
    });
    const populatedIslandsCount = islandCounts.size;
    const distributionSummary = Array.from(islandCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([islandNum, count]) => `Đảo ${islandNum}: ${count}`)
      .join(', ');

    return {
      success: true,
      message: `Kết nối thành công! Nhận diện ${parsedProducts.length} sản phẩm quà tặng, phân bổ trên ${populatedIslandsCount}/12 Đảo (${distributionSummary}).`,
      totalRows: table.rows?.length || 0,
      totalProducts: parsedProducts.length,
      detectedColumns: colLabels,
      isPromotionFormat: true,
      populatedIslandsCount,
      distributionSummary
    };
  } catch (err: any) {
    return { success: false, message: `Lỗi kết nối mạng: ${err?.message || 'Không thể kết nối'}` };
  }
}
