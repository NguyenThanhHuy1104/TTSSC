export type NoticeType = 'info' | 'warning' | 'danger' | 'success';

export interface GuideNotice {
  type: NoticeType;
  title?: string;
  content: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface GuideStep {
  id: string;
  title: string;
  content: string;
  image?: string;
  imageCaption?: string;
  videoUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  copyableText?: string;
  copyableLabel?: string;
  notice?: GuideNotice;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  thumbnail?: string;
  featured?: boolean;
  isNew?: boolean;
  updatedAt: string; // ISO date string e.g. "2026-08-13"
  readingTime: number; // in minutes
  author?: string;
  keywords?: string[];
  videoUrl?: string;
  videoDuration?: string;
  videoDescription?: string;
  steps: GuideStep[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  iconName: string;
  description: string;
  color: string; // Tailwind color class
}

// --- Types for HR Violations & Penalties Lookup (Tra cứu Vi phạm & Mức Xử phạt) ---
export interface PenaltyRuleItem {
  id: string;
  columnA: string; // Thông tin nhóm 1 (Nhóm lớn)
  columnB: string; // Thông tin nhóm 2 (Nhóm nhỏ)
  columnC: string; // Thông tin nhóm 3 (Phân loại)
  keyword: string; // Cột D: Nội dung / từ khóa dùng để tìm kiếm
  description: string; // Cột E: Mô tả
  columnF?: string; // Cột F: Dữ liệu khác nếu có
  officialEmployeePenalty: string; // Cột G: Nhân viên ký hợp đồng chính thức
  probationEmployeePenalty: string; // Cột H: Nhân viên thử việc
  rawRowIndex?: number;
  isCustom?: boolean; // Được thêm bởi User Admin
  customKeywords?: string[]; // Danh sách từ khóa tìm kiếm bổ sung / từ đồng nghĩa
  createdAt?: string;
  updatedAt?: string;
  searchIndex?: string; // Precomputed normalized string for fast tone-free matching
}

export interface PenaltyConfig {
  SPREADSHEET_ID: string;
  SHEET_GID: string;
  SHEET_NAME?: string;
  SHEET_URL?: string;
  API_URL?: string; // Google Apps Script Web App URL
}

export interface PenaltyHierarchyGroup {
  name: string;
  subGroups: {
    name: string;
    categories: {
      name: string;
      items: PenaltyRuleItem[];
    }[];
  }[];
}

// --- Types for Promotion Rounds & 12 Islands (12 Đảo Quà Tặng) ---
export interface ProductItem {
  id: string;
  maSanPham: string; // Cột Mã SP
  linkUrl?: string; // Link truy cập nếu xuất hiện link trên mã SP
  tenSanPham: string; // Cột Tên SP
  quaTang: string; // Cột Quà Tặng
  moTa: string; // Cột Mô tả / Điều kiện
  mocChiTieu: string; // Cột Mốc chi tiêu (ví dụ: "Từ 500.000đ")
  dao: string; // Cột Đảo (ví dụ: "Đảo 1 - Khởi Hành")
  ghiChu?: string; // Cột Ghi chú
  islandNumber: number; // 1 -> 12
  imageUrl?: string; // Ảnh sản phẩm (nếu có)
  unitPrice?: string; // Giá bán (nếu có)
  searchIndex?: string; // Precomputed normalized string for fast search
}

export interface IslandData {
  id: string;
  islandNumber: number; // 1 -> 12
  islandName: string; // Ví dụ: "Đảo 1: Khởi Hành"
  themeColor?: string;
  badge?: string;
  description?: string;
  products: ProductItem[];
  giftCount: number;
}

export type PromotionRoundKey = 'dot1' | 'dot2' | 'dot3' | 'dot5';

export interface PromotionRound {
  id: string;
  tabKey: PromotionRoundKey;
  label: string;
  title: string;
  dateRange: string;
  status: 'active' | 'upcoming' | 'ended';
  description: string;
  sheetGid: string;
  highlightText?: string;
}

export interface SheetSourceConfig {
  spreadsheetId: string;
  gids: Record<PromotionRoundKey, string>;
  apiKey?: string;
  customCsvUrl?: string;
  fullSheetUrl?: string;
  lastSyncedAt?: string;
}

export interface ToastNotification {
  id: number;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

// --- Types for Frequently Used Links Lookup (Tra cứu link thường dùng) ---
export interface CommonLinkItem {
  id: string;
  title: string; // Tên đường link
  url: string; // Link đính kèm
  description?: string; // Ghi chú / Mô tả
  category?: string; // Phân loại / Nhóm
  icon?: string;
  rawRowIndex?: number;
  searchIndex?: string;
}

export interface CommonLinksConfig {
  SPREADSHEET_ID: string;
  SHEET_GID: string;
  SHEET_NAME?: string;
  SHEET_URL?: string;
  API_URL?: string;
}

// --- Types for Salary & Bonus Policy Lookup (Tra cứu Chính sách Lương thưởng) ---
export interface SalaryPolicyItem {
  id: string;
  title: string; // Tên chính sách (Cột A)
  category: string; // Phân loại / Nhóm (Cột B)
  imageUrl: string; // Link ảnh / Infographic / Poster (Cột C hoặc B)
  targetAudience?: string; // Đối tượng áp dụng (Cột D)
  summary?: string; // Tóm tắt / Nội dung chính / Mức thưởng (Cột E)
  effectiveDate?: string; // Ngày hiệu lực / Thời hạn (Cột F hoặc C)
  detailUrl?: string; // Link văn bản / File chi tiết (Cột G)
  badge?: string; // Huy hiệu nổi bật (HOT, MỚI, TIÊU ĐIỂM...)
  rawRowIndex?: number;
  searchIndex?: string;
  originalImageUrl?: string;
  driveFileId?: string;
}

export interface SalaryPolicyConfig {
  SPREADSHEET_ID: string;
  SHEET_GID: string;
  SHEET_NAME?: string;
  SHEET_URL?: string;
  API_URL?: string;
}

// --- Types for Minutes & Files (Biên bản, File) ---
export interface MinuteFileItem {
  id: string;
  fileName: string;
  fileUrl: string;
  category?: string;
  fileSize?: string;
  updatedAt?: string;
  searchIndex?: string;
}

export interface MinutesFilesConfig {
  SPREADSHEET_ID: string;
  SHEET_GID: string;
  SHEET_NAME?: string;
  SHEET_URL?: string;
  API_URL?: string;
}

