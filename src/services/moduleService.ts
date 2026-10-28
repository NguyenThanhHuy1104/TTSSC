import { CATEGORIES } from '../data/categories';
import { DEFAULT_SYSTEM_CONFIG } from '../data/systemConfig';

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  type: 'category' | 'feature';
  iconName?: string;
  categorySlug?: string;
}

export const FEATURE_MODULES: SystemModule[] = [
  {
    id: 'khuyen-mai',
    name: 'Module 12 Đảo Quà Tặng',
    description: 'Tra cứu chương trình khuyến mãi theo đợt & danh sách 12 đảo quà tặng Long Châu',
    type: 'feature',
    iconName: 'Compass'
  },
  {
    id: 'vi-pham',
    name: 'Module Tra cứu Vi phạm & Xử phạt',
    description: 'Công cụ tra cứu nội dung vi phạm và khung kỷ luật nhân sự Long Châu',
    type: 'feature',
    iconName: 'ShieldAlert'
  },
  {
    id: 'barcode',
    name: 'Module Tra cứu Barcode',
    description: 'Tra cứu thông tin hàng hóa, sản phẩm thông qua mã vạch Barcode',
    type: 'feature',
    iconName: 'Barcode'
  },
  {
    id: 'ssc-bot',
    name: 'Module Trợ lý ảo SSC Bot',
    description: 'Bé Long Châu - Robot hỗ trợ tra cứu nhanh quy định và mức phạt',
    type: 'feature',
    iconName: 'Bot'
  },
  {
    id: 'notice-panel',
    name: 'Module Lưu ý Vi phạm',
    description: 'Bảng cảnh báo lũy kế và hạn mức trừ thưởng trên trang tra cứu',
    type: 'feature',
    iconName: 'AlertTriangle'
  },
  {
    id: 'featured',
    name: 'Module Bài nổi bật',
    description: 'Mục hiển thị các quy trình quan trọng, nổi bật',
    type: 'feature',
    iconName: 'Star'
  },
  {
    id: 'newest',
    name: 'Module Hướng dẫn mới',
    description: 'Mục hiển thị các bài viết quy trình mới cập nhật',
    type: 'feature',
    iconName: 'Sparkles'
  },
  {
    id: 'favorites',
    name: 'Module Đã lưu',
    description: 'Mục lưu trữ các bài hướng dẫn yêu thích của người dùng',
    type: 'feature',
    iconName: 'Bookmark'
  }
];

export const CATEGORY_MODULES: SystemModule[] = CATEGORIES.map((cat) => ({
  id: cat.id,
  name: `Module ${cat.name}`,
  description: cat.description,
  type: 'category',
  iconName: cat.iconName,
  categorySlug: cat.slug
}));

export const ALL_SYSTEM_MODULES: SystemModule[] = [
  ...FEATURE_MODULES,
  ...CATEGORY_MODULES
];

const STORAGE_KEY = 'ssc_hidden_modules_v1';
const SERVER_SYNC_TIMESTAMP_KEY = 'ssc_modules_sync_time_v1';

/**
 * Reads hidden modules with priority:
 * 1. URL search params `?hidden=mod1,mod2` (for direct shared links with explicit config)
 * 2. localStorage `ssc_hidden_modules_v1`
 * 3. Default embedded system config
 */
export function getHiddenModules(): string[] {
  try {
    // 1. URL Query override if specified
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const urlHidden = params.get('hidden');
      if (urlHidden !== null) {
        const parsed = urlHidden.split(',').map((s) => s.trim()).filter(Boolean);
        return parsed;
      }
    }

    // 2. LocalStorage
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Error reading hidden modules:', e);
  }

  // 3. System defaults
  return DEFAULT_SYSTEM_CONFIG.hiddenModules || [];
}

/**
 * Fetch server-side or public system config.
 * Works seamlessly in both full-stack (via /api/config/hidden-modules)
 * and static publish (via /system_config.json).
 */
export async function fetchServerHiddenModules(): Promise<string[]> {
  const timestamp = Date.now();
  let serverList: string[] | null = null;

  // Try API route first
  try {
    const res = await fetch(`/api/config/hidden-modules?t=${timestamp}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.hiddenModules)) {
        serverList = json.hiddenModules;
      }
    }
  } catch {
    // API not reachable, fallback to static public json
  }

  // Fallback to static public/system_config.json if API failed
  if (serverList === null) {
    try {
      const res = await fetch(`/system_config.json?t=${timestamp}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.hiddenModules)) {
          serverList = json.hiddenModules;
        }
      }
    } catch {
      // Fallback failed as well
    }
  }

  if (serverList !== null) {
    // Save to localStorage and notify UI if URL doesn't have ?hidden param
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (!params.has('hidden')) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverList));
          localStorage.setItem(SERVER_SYNC_TIMESTAMP_KEY, String(Date.now()));
          window.dispatchEvent(new CustomEvent('ssc_hidden_modules_changed', { detail: serverList }));
        }
      }
    } catch (e) {
      console.error('Failed to update local cache with server config:', e);
    }
    return serverList;
  }

  return getHiddenModules();
}

/**
 * Syncs hidden modules to the backend server and public file so outside users get the same config.
 */
export async function syncHiddenModulesToServer(hiddenIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/config/hidden-modules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hiddenModules: hiddenIds,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || 'Đã lưu cấu hình công khai lên hệ thống thành công!'
      };
    } else {
      return {
        success: false,
        message: 'Server phản hồi mã lỗi: ' + res.status
      };
    }
  } catch (e: any) {
    return {
      success: false,
      message: 'Không thể kết nối tới server API: ' + (e?.message || 'Lỗi mạng')
    };
  }
}

/**
 * Saves hidden modules locally and synchronously broadcasts event,
 * while asynchronously syncing to the backend server.
 */
export function saveHiddenModules(hiddenIds: string[], syncToServer = true): void {
  try {
    const cleanIds = Array.from(new Set(hiddenIds.map((id) => id.trim()).filter(Boolean)));
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanIds));
      window.dispatchEvent(new CustomEvent('ssc_hidden_modules_changed', { detail: cleanIds }));
    }

    if (syncToServer) {
      syncHiddenModulesToServer(cleanIds).catch((err) => {
        console.warn('Background server sync warning:', err);
      });
    }
  } catch (e) {
    console.error('Error saving hidden modules:', e);
  }
}

export function toggleHideModule(id: string): string[] {
  const current = getHiddenModules();
  let updated: string[];
  if (current.includes(id)) {
    updated = current.filter((mId) => mId !== id);
  } else {
    updated = [...current, id];
  }
  saveHiddenModules(updated, true);
  return updated;
}

export function isModuleHidden(id: string, hiddenList?: string[]): boolean {
  const list = hiddenList || getHiddenModules();
  return list.includes(id);
}

export function resetAllHiddenModules(): void {
  saveHiddenModules([], true);
}

/**
 * Generates a shareable URL that embeds the hidden module configuration
 * in the query parameter so any visitor viewing that URL sees the exact same hidden modules.
 */
export function getShareableConfigUrl(hiddenIds: string[]): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  if (hiddenIds.length > 0) {
    url.searchParams.set('hidden', hiddenIds.join(','));
  } else {
    url.searchParams.delete('hidden');
  }
  return url.toString();
}

/**
 * Export current hidden modules configuration as a JSON file download.
 */
export function exportConfigAsJson(hiddenIds: string[]): void {
  const config = {
    appName: 'Trung Tâm SSC - 87333',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    hiddenModules: hiddenIds,
    totalHidden: hiddenIds.length
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ssc_module_config_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a JSON configuration file and apply hidden modules.
 */
export async function importConfigFromJson(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        let list: string[] = [];
        if (Array.isArray(parsed)) {
          list = parsed;
        } else if (parsed && Array.isArray(parsed.hiddenModules)) {
          list = parsed.hiddenModules;
        } else {
          throw new Error('Định dạng file cấu hình không hợp lệ');
        }
        const clean = Array.from(new Set(list.map((id) => String(id).trim()).filter(Boolean)));
        saveHiddenModules(clean, true);
        resolve(clean);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file cấu hình'));
    reader.readAsText(file);
  });
}

