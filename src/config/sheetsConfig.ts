import { PromotionRound, SheetSourceConfig, PromotionRoundKey } from '../types';

export const PROMOTION_ROUNDS: PromotionRound[] = [
  {
    id: 'dot-1',
    tabKey: 'dot1',
    label: 'Đợt 1',
    title: 'Đợt 1: Khởi Hành Hành Trình Khám Phá',
    dateRange: '01/06 - 15/06/2026',
    status: 'ended',
    description: 'Chương trình mở màn với hơn 100+ phần quà gia dụng và chăm sóc sức khỏe hấp dẫn tại 12 Đảo Long Châu.',
    sheetGid: '0',
    highlightText: 'Đã kết thúc'
  },
  {
    id: 'dot-2',
    tabKey: 'dot2',
    label: 'Đợt 2',
    title: 'Đợt 2: Tăng Tốc Săn Quà Mùa Hè',
    dateRange: '16/06 - 30/06/2026',
    status: 'ended',
    description: 'Nâng cấp quà tặng công nghệ, bình giữ nhiệt cao cấp và voucher mua sắm cho hóa đơn tiêu dùng.',
    sheetGid: '1',
    highlightText: 'Đã kết thúc'
  },
  {
    id: 'dot-3',
    tabKey: 'dot3',
    label: 'Đợt 3',
    title: 'Đợt 3: Đỉnh Cao Ưu Đãi - Đại Tiệc Quà Tặng',
    dateRange: '01/07 - 15/07/2026',
    status: 'ended',
    description: 'Đợt ưu đãi tâm điểm với hàng ngàn quà tặng độc quyền tại 12 Đảo Quà Long Châu.',
    sheetGid: '2',
    highlightText: 'Đã kết thúc'
  },
  {
    id: 'dot-5',
    tabKey: 'dot5',
    label: 'Đợt 5',
    title: 'Đợt 5: Về Đích Rực Rỡ - Siêu Thưởng Cuối Mùa',
    dateRange: '01/08 - 31/08/2026',
    status: 'active',
    description: 'Đợt 5 đang chạy! Vòng cao điểm bùng nổ với các giải thưởng giá trị lớn, quà tặng tri ân đặc biệt tại 12 Đảo Long Châu.',
    sheetGid: '4',
    highlightText: 'Đang diễn ra • Đợt 5 hiện tại'
  }
];

export const DEFAULT_SHEET_CONFIG: SheetSourceConfig = {
  spreadsheetId: '',
  fullSheetUrl: '',
  gids: {
    dot1: '0',
    dot2: '1',
    dot3: '2',
    dot5: '4'
  }
};

const STORAGE_KEY = 'ssc_promotion_sheet_config';
// Barcode catalog spreadsheet ID that was previously mistakenly referenced as promotion sheet
const BARCODE_CATALOG_SHEET_ID = '1-i-eXMU9y0Se68wsvycK5-t8r4aFpo7iVi9ZgsoGX0M';

/**
 * Parse any Google Sheets link or ID to extract spreadsheetId and optional gid
 */
export function parseGoogleSheetUrl(input: string): { spreadsheetId: string; gid?: string } {
  if (!input) return { spreadsheetId: '' };
  const trimmed = input.trim();

  // Pattern 1: Full Google Sheet URL (e.g. https://docs.google.com/spreadsheets/d/{ID}/edit#gid={GID})
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const spreadsheetId = idMatch ? idMatch[1] : (trimmed.startsWith('http') ? '' : trimmed);

  // GID match (e.g. gid=12345 or #gid=12345)
  const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : undefined;

  return { spreadsheetId, gid };
}

/**
 * Build a canonical Google Sheets URL
 */
export function buildGoogleSheetUrl(spreadsheetId: string, gid: string = '0'): string {
  if (!spreadsheetId) return '';
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${gid}`;
}

export function loadSavedConfig(): SheetSourceConfig {
  if (typeof window === 'undefined') return DEFAULT_SHEET_CONFIG;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up stale or invalid barcode catalog sheet ID so user sees authentic 12 islands
      if (parsed.spreadsheetId === BARCODE_CATALOG_SHEET_ID) {
        parsed.spreadsheetId = '';
        parsed.fullSheetUrl = '';
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
      }
      if (parsed.gids && 'dot4' in parsed.gids) {
        delete parsed.gids.dot4;
      }
      return {
        ...DEFAULT_SHEET_CONFIG,
        ...parsed,
        gids: {
          ...DEFAULT_SHEET_CONFIG.gids,
          ...(parsed.gids || {})
        }
      };
    }
  } catch (e) {
    console.error('Failed to load promotion sheet config:', e);
  }
  return DEFAULT_SHEET_CONFIG;
}

export function saveConfig(config: SheetSourceConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save promotion sheet config:', e);
  }
}
