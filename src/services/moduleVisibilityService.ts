export interface ModuleVisibilityConfig {
  'luong-thuong': boolean;
  'luong-thuong-thuoc': boolean;
  'luong-thuong-ve-tinh': boolean;
  'vi-pham': boolean;
  'barcode': boolean;
  'links': boolean;
  'minutes-files': boolean;
}

// Default configuration
export const DEFAULT_MODULE_VISIBILITY: ModuleVisibilityConfig = {
  'luong-thuong': false,
  'luong-thuong-thuoc': false,
  'luong-thuong-ve-tinh': false,
  'vi-pham': false,
  'barcode': true,
  'links': true,
  'minutes-files': true
};

const STORAGE_KEY = 'ssc_module_visibility_config_v3';

export function getModuleVisibilityConfig(): ModuleVisibilityConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_MODULE_VISIBILITY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MODULE_VISIBILITY };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_MODULE_VISIBILITY,
      ...parsed
    };
  } catch {
    return { ...DEFAULT_MODULE_VISIBILITY };
  }
}

export function saveModuleVisibilityConfig(config: ModuleVisibilityConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('ssc_module_visibility_changed', { detail: config }));
  } catch (e) {
    console.error('Failed to save module visibility config', e);
  }

  // Also sync to server so published app immediately reflects change
  try {
    fetch('/api/config/module-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleVisibility: config })
    }).catch(() => {});
  } catch {}
}

export async function fetchServerModuleVisibility(): Promise<ModuleVisibilityConfig> {
  const timestamp = Date.now();
  try {
    const res = await fetch(`/api/config/module-visibility?t=${timestamp}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.moduleVisibility && typeof data.moduleVisibility === 'object') {
        const merged: ModuleVisibilityConfig = {
          ...DEFAULT_MODULE_VISIBILITY,
          ...data.moduleVisibility
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('ssc_module_visibility_changed', { detail: merged }));
        return merged;
      }
    }
  } catch {}

  // Fallback to static system_config.json
  try {
    const res = await fetch(`/system_config.json?t=${timestamp}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.moduleVisibility && typeof data.moduleVisibility === 'object') {
        const merged: ModuleVisibilityConfig = {
          ...DEFAULT_MODULE_VISIBILITY,
          ...data.moduleVisibility
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('ssc_module_visibility_changed', { detail: merged }));
        return merged;
      }
    }
  } catch {}

  return getModuleVisibilityConfig();
}

export function isModuleVisible(moduleId: keyof ModuleVisibilityConfig): boolean {
  const config = getModuleVisibilityConfig();
  return config[moduleId] !== false;
}

export function resetModuleVisibilityConfig(): ModuleVisibilityConfig {
  saveModuleVisibilityConfig(DEFAULT_MODULE_VISIBILITY);
  return { ...DEFAULT_MODULE_VISIBILITY };
}
