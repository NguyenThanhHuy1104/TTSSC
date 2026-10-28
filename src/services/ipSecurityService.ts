export interface IpWhitelistEntry {
  id: string;
  ip: string;
  label: string;
  createdAt: string;
}

export interface IpCheckResult {
  success: boolean;
  clientIp: string;
  detectedIps: string[];
  enabled: boolean;
  isAllowed: boolean;
  whitelist: IpWhitelistEntry[];
  updatedAt: string;
  message?: string;
}

const LOCAL_IP_CONFIG_KEY = 'ssc_ip_whitelist_config_v3';
const CACHED_PUBLIC_IP_KEY = 'ssc_detected_public_ip';

/**
 * Checks if current browser is strictly in the AI Studio Build App environment (ais-dev- or localhost).
 * Returns false when published / shared out (ais-pre- or production domain).
 */
export function isBuildAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const host = window.location.hostname || '';
    return host.startsWith('ais-dev-') || host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * Checks if current browser is in the Admin AI Studio Dev Workspace or has authenticated as Admin
 */
export function isAdminWorkspaceSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const host = window.location.hostname || '';
    if (host.startsWith('ais-dev-') || host === 'localhost') {
      return true;
    }
    if (
      sessionStorage.getItem('ssc_admin_auth') === 'true' ||
      localStorage.getItem('ssc_admin_auth') === 'true'
    ) {
      return true;
    }
  } catch {}
  return false;
}

/**
 * Detect public IPv4/IPv6 from client browser (fast timeout so it never blocks)
 */
export async function detectClientPublicIp(): Promise<string> {
  try {
    const cached = sessionStorage.getItem(CACHED_PUBLIC_IP_KEY);
    if (cached) return cached;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        const ip = String(data.ip).trim();
        sessionStorage.setItem(CACHED_PUBLIC_IP_KEY, ip);
        return ip;
      }
    }
  } catch {
    // Fallback to server-side X-Forwarded-For detection
  }
  return sessionStorage.getItem(CACHED_PUBLIC_IP_KEY) || '';
}

/**
 * Client-side IP rule matcher
 */
export function matchIpClientSide(clientIp: string, ruleIp: string): boolean {
  const cleanClient = (clientIp || '').trim();
  const cleanRule = (ruleIp || '').trim();
  if (!cleanClient || !cleanRule) return false;
  if (cleanRule === '*' || cleanClient === cleanRule) return true;

  if (cleanRule.includes('*')) {
    const regexStr =
      '^' +
      cleanRule
        .split('.')
        .map((seg) => (seg === '*' ? '[0-9a-fA-F:]+?' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        .join('\\.') +
      '$';
    try {
      if (new RegExp(regexStr).test(cleanClient)) return true;
    } catch {}
  }

  if (cleanRule.endsWith('/24')) {
    const base = cleanRule.replace('/24', '').split('.').slice(0, 3).join('.');
    const clientBase = cleanClient.split('.').slice(0, 3).join('.');
    if (base && base === clientBase) return true;
  } else if (cleanRule.endsWith('/16')) {
    const base = cleanRule.replace('/16', '').split('.').slice(0, 2).join('.');
    const clientBase = cleanClient.split('.').slice(0, 2).join('.');
    if (base && base === clientBase) return true;
  }

  return false;
}

/**
 * Check current IP authorization status with the server
 */
export async function checkIpAccess(): Promise<IpCheckResult> {
  const isAdminDev = isAdminWorkspaceSession();
  const publicIp = await detectClientPublicIp();

  try {
    const params = new URLSearchParams();
    if (publicIp) params.set('clientIp', publicIp);
    if (isAdminDev) params.set('isAdminDev', '1');

    const url = `/api/security/ip-check?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data: IpCheckResult = await res.json();
      try {
        localStorage.setItem(
          LOCAL_IP_CONFIG_KEY,
          JSON.stringify({
            enabled: data.enabled,
            whitelist: data.whitelist,
            updatedAt: data.updatedAt
          })
        );
      } catch {}
      return {
        ...data,
        isAllowed: isAdminDev ? true : data.isAllowed
      };
    }
  } catch (err) {
    console.warn('Could not reach /api/security/ip-check, using cached config:', err);
  }

  // Fallback to localStorage if server is unreachable
  try {
    const saved = localStorage.getItem(LOCAL_IP_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const enabled = Boolean(parsed.enabled);
      const whitelist: IpWhitelistEntry[] = Array.isArray(parsed.whitelist) ? parsed.whitelist : [];
      const ipToUse = publicIp || '118.69.12.170';
      const isAllowed =
        isAdminDev || !enabled || whitelist.some((item) => matchIpClientSide(ipToUse, item.ip));
      return {
        success: true,
        clientIp: ipToUse,
        detectedIps: [ipToUse],
        enabled,
        isAllowed,
        whitelist,
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    }
  } catch {}

  return {
    success: true,
    clientIp: publicIp || '118.69.12.170',
    detectedIps: [publicIp || '118.69.12.170'],
    enabled: true,
    isAllowed: isAdminDev,
    whitelist: [],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Update IP Whitelist configuration (Admin only)
 */
export async function saveIpWhitelistConfig(
  password: string,
  enabled: boolean,
  whitelist: IpWhitelistEntry[],
  clientIp?: string
): Promise<IpCheckResult> {
  const res = await fetch('/api/security/ip-whitelist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password,
      enabled,
      whitelist,
      clientIp
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Không thể lưu cấu hình IP');
  }

  try {
    localStorage.setItem(
      LOCAL_IP_CONFIG_KEY,
      JSON.stringify({
        enabled: data.enabled,
        whitelist: data.whitelist,
        updatedAt: data.updatedAt
      })
    );
  } catch {}

  return data;
}

/**
 * Quick-authorize current visitor IP using admin password
 */
export async function authorizeCurrentIp(
  password: string,
  clientIp: string,
  label?: string
): Promise<IpCheckResult> {
  const res = await fetch('/api/security/ip-whitelist/add-current', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password,
      clientIp,
      label
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Mật khẩu quản trị không đúng');
  }

  try {
    sessionStorage.setItem('ssc_admin_auth', 'true');
    localStorage.setItem('ssc_admin_auth', 'true');
  } catch {}

  return data;
}
