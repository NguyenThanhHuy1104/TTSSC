import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const HOST = '0.0.0.0';

// In-memory cache for hidden modules & watermark configuration
let inMemoryHiddenModules: string[] = ['luong-thuong', 'luong-thuong-thuoc', 'luong-thuong-ve-tinh', 'vi-pham'];
let inMemoryModuleVisibility: Record<string, boolean> = {
  'luong-thuong': false,
  'luong-thuong-thuoc': false,
  'luong-thuong-ve-tinh': false,
  'vi-pham': false,
  'barcode': true,
  'links': true
};
let inMemoryShowWatermark = true;
let inMemoryUpdatedAt = new Date().toISOString();

// Load initial configuration from public/system_config.json if present
const publicConfigPath = path.join(process.cwd(), 'public', 'system_config.json');
try {
  if (fs.existsSync(publicConfigPath)) {
    const content = fs.readFileSync(publicConfigPath, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed.hiddenModules)) {
      inMemoryHiddenModules = parsed.hiddenModules;
    }
    if (parsed.moduleVisibility && typeof parsed.moduleVisibility === 'object') {
      inMemoryModuleVisibility = { ...inMemoryModuleVisibility, ...parsed.moduleVisibility };
    }
    if (typeof parsed.showWatermark === 'boolean') {
      inMemoryShowWatermark = parsed.showWatermark;
    }
    inMemoryUpdatedAt = parsed.updatedAt || inMemoryUpdatedAt;
  }
} catch (e) {
  console.warn('Could not read initial system_config.json:', e);
}

async function startServer() {
  const app = express();

  // Middleware for parsing JSON bodies (support large IP list imports)
  app.use(express.json({ limit: '10mb' }));

  // ==========================================
  // ANALYTICS & DAILY VISIT TRACKING
  // ==========================================
  const analyticsFilePath = path.join(process.cwd(), 'public', 'analytics.json');

  function getVietnamTodayDate(): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return formatter.format(new Date());
    } catch {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
  }

  function getVietnamFormattedDate(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  let inMemoryAnalytics: {
    daily: Record<string, number>;
    visitors: Record<string, string[]>;
    totalVisits: number;
    lastUpdated: string;
  } = {
    daily: {},
    visitors: {},
    totalVisits: 0,
    lastUpdated: new Date().toISOString()
  };

  // Load from disk if exists
  try {
    if (fs.existsSync(analyticsFilePath)) {
      const content = fs.readFileSync(analyticsFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.totalVisits === 'number' && parsed.daily) {
        inMemoryAnalytics = {
          daily: parsed.daily || {},
          visitors: parsed.visitors || {},
          totalVisits: parsed.totalVisits || 0,
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('Could not read analytics.json:', err);
  }

  function saveAnalyticsToDisk() {
    try {
      fs.writeFileSync(analyticsFilePath, JSON.stringify(inMemoryAnalytics, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write analytics.json:', e);
    }
  }

  // GET /api/analytics/stats
  app.get('/api/analytics/stats', (req, res) => {
    const today = getVietnamTodayDate();
    const todayVisits = inMemoryAnalytics.daily[today] || 0;
    res.json({
      success: true,
      todayVisits,
      totalVisits: inMemoryAnalytics.totalVisits || todayVisits,
      date: today,
      formattedDate: getVietnamFormattedDate(today)
    });
  });

  // POST /api/analytics/visit (Real visit counter; ignores F5 / duplicate refreshes)
  app.post('/api/analytics/visit', (req, res) => {
    const today = getVietnamTodayDate();
    const { clientId, isReload } = req.body || {};

    if (typeof inMemoryAnalytics.daily[today] !== 'number') {
      inMemoryAnalytics.daily[today] = 0;
    }
    if (!Array.isArray(inMemoryAnalytics.visitors[today])) {
      inMemoryAnalytics.visitors[today] = [];
    }

    const visitorId = String(clientId || '').trim();
    const alreadyCounted =
      Boolean(isReload) ||
      (visitorId !== '' && inMemoryAnalytics.visitors[today].includes(visitorId));

    if (!alreadyCounted) {
      if (visitorId) {
        inMemoryAnalytics.visitors[today].push(visitorId);
      }
      inMemoryAnalytics.daily[today] += 1;
      inMemoryAnalytics.totalVisits = (inMemoryAnalytics.totalVisits || 0) + 1;
      inMemoryAnalytics.lastUpdated = new Date().toISOString();
      saveAnalyticsToDisk();
    }

    res.json({
      success: true,
      todayVisits: inMemoryAnalytics.daily[today],
      totalVisits: inMemoryAnalytics.totalVisits,
      date: today,
      formattedDate: getVietnamFormattedDate(today)
    });
  });

  // ==========================================
  // IP WHITELIST ACCESS CONTROL (QUẢN TRỊ IP)
  // ==========================================
  interface IpWhitelistEntry {
    id: string;
    ip: string;
    label: string;
    createdAt: string;
  }

  interface IpWhitelistConfig {
    enabled: boolean;
    whitelist: IpWhitelistEntry[];
    updatedAt: string;
  }

  const ipWhitelistPath = path.join(process.cwd(), 'public', 'ip_whitelist.json');

  let inMemoryIpConfig: IpWhitelistConfig = {
    enabled: true,
    whitelist: [
      {
        id: 'ip-admin-main',
        ip: '118.69.12.170',
        label: 'IP Quản trị viên (Admin)',
        createdAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  };

  function loadIpWhitelistFromDisk() {
    try {
      if (fs.existsSync(ipWhitelistPath)) {
        const raw = fs.readFileSync(ipWhitelistPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.enabled === 'boolean' && Array.isArray(parsed.whitelist)) {
          inMemoryIpConfig = {
            enabled: parsed.enabled,
            whitelist: parsed.whitelist,
            updatedAt: parsed.updatedAt || new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('Could not read ip_whitelist.json:', err);
    }
  }

  loadIpWhitelistFromDisk();

  function saveIpWhitelistToDisk(config: IpWhitelistConfig) {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(ipWhitelistPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write public/ip_whitelist.json:', err);
    }

    try {
      const distPath = path.join(process.cwd(), 'dist', 'ip_whitelist.json');
      if (fs.existsSync(path.dirname(distPath))) {
        fs.writeFileSync(distPath, JSON.stringify(config, null, 2), 'utf-8');
      }
    } catch {
      // Ignore in dev
    }
  }

  function normalizeIp(rawIp: string): string {
    if (!rawIp) return '';
    let ip = rawIp.trim();
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    if (ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    if (ip === '::1') {
      return '127.0.0.1';
    }
    return ip;
  }

  function extractClientIps(req: express.Request, clientReportedIp?: string): { primaryIp: string; allIps: string[] } {
    const candidates: string[] = [];

    if (clientReportedIp && typeof clientReportedIp === 'string') {
      const cleanedClient = normalizeIp(clientReportedIp);
      if (cleanedClient) candidates.push(cleanedClient);
    }

    const cfIp = req.headers['cf-connecting-ip'];
    if (typeof cfIp === 'string' && cfIp.trim()) {
      candidates.push(normalizeIp(cfIp));
    }

    const xRealIp = req.headers['x-real-ip'];
    if (typeof xRealIp === 'string' && xRealIp.trim()) {
      candidates.push(normalizeIp(xRealIp));
    }

    const xForwardedFor = req.headers['x-forwarded-for'];
    if (typeof xForwardedFor === 'string' && xForwardedFor.trim()) {
      const parts = xForwardedFor.split(',').map((p) => normalizeIp(p)).filter(Boolean);
      candidates.push(...parts);
    } else if (Array.isArray(xForwardedFor)) {
      for (const item of xForwardedFor) {
        const norm = normalizeIp(item);
        if (norm) candidates.push(norm);
      }
    }

    if (req.socket?.remoteAddress) {
      candidates.push(normalizeIp(req.socket.remoteAddress));
    }

    const uniqueIps = Array.from(new Set(candidates.filter(Boolean)));
    // Prefer public non-private IP as primaryIp if available
    const publicIp = uniqueIps.find(
      (ip) =>
        ip !== '127.0.0.1' &&
        !ip.startsWith('10.') &&
        !ip.startsWith('192.168.') &&
        !ip.startsWith('169.254.') &&
        !/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
    );

    return {
      primaryIp: publicIp || uniqueIps[0] || '127.0.0.1',
      allIps: uniqueIps.length > 0 ? uniqueIps : ['127.0.0.1']
    };
  }

  function doesIpMatchRule(clientIp: string, ruleIp: string): boolean {
    const cleanClient = normalizeIp(clientIp);
    const cleanRule = ruleIp.trim();
    if (!cleanClient || !cleanRule) return false;
    if (cleanRule === '*' || cleanClient === cleanRule) return true;

    // Support wildcard e.g. 113.161.72.* or 192.168.*
    if (cleanRule.includes('*')) {
      const regexStr = '^' + cleanRule.split('.').map((seg) => (seg === '*' ? '[0-9a-fA-F:]+?' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('\\.') + '$';
      try {
        const reg = new RegExp(regexStr);
        if (reg.test(cleanClient)) return true;
      } catch {}
    }

    // Support prefix / CIDR /24, /16, /8 shorthand
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

  function isClientAllowedByWhitelist(candidateIps: string[], config: IpWhitelistConfig): boolean {
    if (!config.enabled) return true;
    if (!Array.isArray(config.whitelist) || config.whitelist.length === 0) return false;

    for (const ip of candidateIps) {
      for (const entry of config.whitelist) {
        if (doesIpMatchRule(ip, entry.ip)) {
          return true;
        }
      }
    }
    return false;
  }

  // GET /api/security/ip-check?clientIp=...
  app.get('/api/security/ip-check', (req, res) => {
    loadIpWhitelistFromDisk();
    const clientReportedIp = (req.query.clientIp as string) || '';
    const isAdminDev = req.query.isAdminDev === '1';
    const { primaryIp, allIps } = extractClientIps(req, clientReportedIp);
    const candidateClientIps = allIps.filter(
      (ip) => ip && ip !== '::1' && !ip.startsWith('169.254.')
    );
    const ipsToCheck = candidateClientIps.length > 0 ? candidateClientIps : [primaryIp];

    // Ensure the current Admin's active IP(s) are registered so Admin is never locked out
    const hasCurrentAdminSession = inMemoryIpConfig.whitelist.some(
      (w) => w.id === 'ip-admin-current-session'
    );
    if ((isAdminDev || !hasCurrentAdminSession) && primaryIp) {
      let modified = false;
      for (const adminIp of ipsToCheck) {
        if (!inMemoryIpConfig.whitelist.some((w) => w.ip === adminIp)) {
          inMemoryIpConfig.whitelist.unshift({
            id: adminIp === primaryIp ? 'ip-admin-current-session' : `ip-admin-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            ip: adminIp,
            label: 'IP Quản trị viên (Admin)',
            createdAt: new Date().toISOString()
          });
          modified = true;
        }
      }
      if (!inMemoryIpConfig.whitelist.some((w) => w.id === 'ip-admin-current-session')) {
        inMemoryIpConfig.whitelist.unshift({
          id: 'ip-admin-current-session',
          ip: primaryIp,
          label: 'IP Quản trị viên (Admin)',
          createdAt: new Date().toISOString()
        });
        modified = true;
      }
      if (modified) {
        inMemoryIpConfig.updatedAt = new Date().toISOString();
        saveIpWhitelistToDisk(inMemoryIpConfig);
      }
    }

    const isAllowed = isAdminDev || isClientAllowedByWhitelist(ipsToCheck, inMemoryIpConfig);

    return res.json({
      success: true,
      clientIp: primaryIp,
      detectedIps: allIps,
      enabled: inMemoryIpConfig.enabled,
      isAllowed,
      whitelist: inMemoryIpConfig.whitelist,
      updatedAt: inMemoryIpConfig.updatedAt
    });
  });

  // POST /api/security/ip-whitelist (Update whitelist & enabled state)
  app.post('/api/security/ip-whitelist', (req, res) => {
    const { password, enabled, whitelist } = req.body || {};

    if (password !== 'ssc87333' && password !== '3015751773') {
      return res.status(403).json({
        success: false,
        message: 'Mật khẩu quản trị không chính xác!'
      });
    }

    const nextEnabled = typeof enabled === 'boolean' ? enabled : inMemoryIpConfig.enabled;
    let nextWhitelist = inMemoryIpConfig.whitelist;

    if (Array.isArray(whitelist)) {
      const seen = new Set<string>();
      nextWhitelist = [];
      for (const item of whitelist) {
        const cleanIp = String(item.ip || '').trim();
        if (!cleanIp || seen.has(cleanIp)) continue;
        seen.add(cleanIp);
        nextWhitelist.push({
          id: String(item.id || `ip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
          ip: cleanIp,
          label: String(item.label || 'IP được cấp phép').trim(),
          createdAt: String(item.createdAt || new Date().toISOString())
        });
      }
    }

    inMemoryIpConfig = {
      enabled: nextEnabled,
      whitelist: nextWhitelist,
      updatedAt: new Date().toISOString()
    };

    saveIpWhitelistToDisk(inMemoryIpConfig);

    const { primaryIp, allIps } = extractClientIps(req, req.body?.clientIp);
    const isAllowed = isClientAllowedByWhitelist([primaryIp], inMemoryIpConfig);

    return res.json({
      success: true,
      clientIp: primaryIp,
      detectedIps: allIps,
      enabled: inMemoryIpConfig.enabled,
      isAllowed,
      whitelist: inMemoryIpConfig.whitelist,
      updatedAt: inMemoryIpConfig.updatedAt,
      message: 'Đã lưu cấu hình giới hạn IP thành công!'
    });
  });

  // POST /api/security/ip-whitelist/add-current (Quickly authorize current IP with admin password)
  app.post('/api/security/ip-whitelist/add-current', (req, res) => {
    const { password, clientIp: reportedIp, label } = req.body || {};

    if (password !== 'ssc87333' && password !== '3015751773') {
      return res.status(403).json({
        success: false,
        message: 'Mật khẩu quản trị không chính xác!'
      });
    }

    loadIpWhitelistFromDisk();
    const { primaryIp, allIps } = extractClientIps(req, reportedIp);
    const targetIp = normalizeIp(reportedIp || primaryIp);

    const exists = inMemoryIpConfig.whitelist.some((item) => item.ip === targetIp);
    if (!exists && targetIp) {
      inMemoryIpConfig.whitelist.unshift({
        id: `ip-${Date.now()}`,
        ip: targetIp,
        label: (label || 'IP Quản trị viên / Được cấp phép').trim(),
        createdAt: new Date().toISOString()
      });
      inMemoryIpConfig.updatedAt = new Date().toISOString();
      saveIpWhitelistToDisk(inMemoryIpConfig);
    }

    return res.json({
      success: true,
      clientIp: targetIp,
      detectedIps: allIps,
      enabled: inMemoryIpConfig.enabled,
      isAllowed: true,
      whitelist: inMemoryIpConfig.whitelist,
      updatedAt: inMemoryIpConfig.updatedAt,
      message: `Đã thêm IP ${targetIp} vào danh sách cho phép!`
    });
  });

  // API Routes MUST go first
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // GET current public hidden modules configuration
  app.get('/api/config/hidden-modules', (req, res) => {
    // Try to refresh from file if exists
    try {
      if (fs.existsSync(publicConfigPath)) {
        const content = fs.readFileSync(publicConfigPath, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.hiddenModules)) {
          inMemoryHiddenModules = parsed.hiddenModules;
          inMemoryUpdatedAt = parsed.updatedAt || inMemoryUpdatedAt;
        }
      }
    } catch {
      // Use in-memory if file read fails
    }

    res.json({
      success: true,
      hiddenModules: inMemoryHiddenModules,
      updatedAt: inMemoryUpdatedAt,
      totalHidden: inMemoryHiddenModules.length
    });
  });

  // POST update public hidden modules configuration
  app.post('/api/config/hidden-modules', (req, res) => {
    const { hiddenModules } = req.body;

    if (!Array.isArray(hiddenModules)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu hiddenModules phải là một danh sách các mã định danh module (array).'
      });
    }

    const cleanIds: string[] = Array.from(
      new Set(hiddenModules.map((id: any) => String(id).trim()).filter(Boolean))
    );

    inMemoryHiddenModules = cleanIds;
    inMemoryUpdatedAt = new Date().toISOString();

    const configData = {
      hiddenModules: cleanIds,
      showWatermark: inMemoryShowWatermark,
      updatedAt: inMemoryUpdatedAt,
      updatedBy: 'admin'
    };

    // Save to public/system_config.json (source)
    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(publicConfigPath, JSON.stringify(configData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to public/system_config.json:', err);
    }

    // If dist/ directory exists (production / build output), also save to dist/system_config.json
    try {
      const distConfigPath = path.join(process.cwd(), 'dist', 'system_config.json');
      if (fs.existsSync(path.dirname(distConfigPath))) {
        fs.writeFileSync(distConfigPath, JSON.stringify(configData, null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('Could not write to dist/system_config.json (normal in dev):', err);
    }

    return res.json({
      success: true,
      hiddenModules: cleanIds,
      showWatermark: inMemoryShowWatermark,
      updatedAt: inMemoryUpdatedAt,
      message: `Đã lưu cấu hình công khai (${cleanIds.length} module đang ẩn). Khách truy cập bên ngoài sẽ thấy đúng thiết lập này.`
    });
  });

  // GET /api/config/module-visibility
  app.get('/api/config/module-visibility', (req, res) => {
    try {
      if (fs.existsSync(publicConfigPath)) {
        const content = fs.readFileSync(publicConfigPath, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed.moduleVisibility && typeof parsed.moduleVisibility === 'object') {
          inMemoryModuleVisibility = { ...inMemoryModuleVisibility, ...parsed.moduleVisibility };
        }
      }
    } catch {}

    return res.json({
      success: true,
      moduleVisibility: inMemoryModuleVisibility,
      updatedAt: inMemoryUpdatedAt
    });
  });

  // POST /api/config/module-visibility
  app.post('/api/config/module-visibility', (req, res) => {
    const { moduleVisibility } = req.body || {};
    if (moduleVisibility && typeof moduleVisibility === 'object') {
      inMemoryModuleVisibility = { ...inMemoryModuleVisibility, ...moduleVisibility };
      inMemoryUpdatedAt = new Date().toISOString();

      const hiddenIds = Object.keys(inMemoryModuleVisibility).filter(
        (key) => inMemoryModuleVisibility[key] === false
      );
      inMemoryHiddenModules = hiddenIds;

      const configData = {
        hiddenModules: hiddenIds,
        moduleVisibility: inMemoryModuleVisibility,
        showWatermark: inMemoryShowWatermark,
        updatedAt: inMemoryUpdatedAt,
        updatedBy: 'admin'
      };

      try {
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(publicConfigPath, JSON.stringify(configData, null, 2), 'utf-8');
      } catch (err) {
        console.error('Error writing moduleVisibility to public/system_config.json:', err);
      }

      try {
        const distConfigPath = path.join(process.cwd(), 'dist', 'system_config.json');
        if (fs.existsSync(path.dirname(distConfigPath))) {
          fs.writeFileSync(distConfigPath, JSON.stringify(configData, null, 2), 'utf-8');
        }
      } catch {}

      return res.json({
        success: true,
        moduleVisibility: inMemoryModuleVisibility,
        updatedAt: inMemoryUpdatedAt,
        message: 'Đã lưu trạng thái hiển thị module thành công.'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Dữ liệu moduleVisibility không hợp lệ.'
    });
  });

  // GET /api/config/watermark
  app.get('/api/config/watermark', (req, res) => {
    try {
      if (fs.existsSync(publicConfigPath)) {
        const content = fs.readFileSync(publicConfigPath, 'utf-8');
        const parsed = JSON.parse(content);
        if (typeof parsed.showWatermark === 'boolean') {
          inMemoryShowWatermark = parsed.showWatermark;
        }
      }
    } catch {}

    return res.json({
      success: true,
      showWatermark: inMemoryShowWatermark,
      updatedAt: inMemoryUpdatedAt
    });
  });

  // POST /api/config/watermark
  app.post('/api/config/watermark', (req, res) => {
    const { showWatermark } = req.body || {};
    if (typeof showWatermark === 'boolean') {
      inMemoryShowWatermark = showWatermark;
      inMemoryUpdatedAt = new Date().toISOString();

      const configData = {
        hiddenModules: inMemoryHiddenModules,
        showWatermark: inMemoryShowWatermark,
        updatedAt: inMemoryUpdatedAt,
        updatedBy: 'admin'
      };

      try {
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(publicConfigPath, JSON.stringify(configData, null, 2), 'utf-8');
      } catch (err) {
        console.error('Error writing watermark to public/system_config.json:', err);
      }

      try {
        const distConfigPath = path.join(process.cwd(), 'dist', 'system_config.json');
        if (fs.existsSync(path.dirname(distConfigPath))) {
          fs.writeFileSync(distConfigPath, JSON.stringify(configData, null, 2), 'utf-8');
        }
      } catch {}
    }

    return res.json({
      success: true,
      showWatermark: inMemoryShowWatermark,
      updatedAt: inMemoryUpdatedAt
    });
  });

  // ==========================================
  // COMMON LINKS CONFIG SYNC API
  // Đồng bộ cấu hình Google Sheet tra cứu Link thường dùng
  // ==========================================
  const publicCommonLinksConfigPath = path.join(process.cwd(), 'public', 'common_links_config.json');
  let inMemoryCommonLinksConfig = {
    SPREADSHEET_ID: '1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9',
    SHEET_GID: '0',
    SHEET_NAME: 'LinkThuongDung',
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9/edit?gid=0#gid=0',
    API_URL: '',
    updatedAt: new Date().toISOString()
  };

  try {
    if (fs.existsSync(publicCommonLinksConfigPath)) {
      const savedConfig = JSON.parse(fs.readFileSync(publicCommonLinksConfigPath, 'utf-8'));
      inMemoryCommonLinksConfig = { ...inMemoryCommonLinksConfig, ...savedConfig };
    }
  } catch {}

  app.get('/api/config/common-links', (req, res) => {
    return res.json({
      success: true,
      config: inMemoryCommonLinksConfig
    });
  });

  app.post('/api/config/common-links', (req, res) => {
    const body = req.body || {};
    inMemoryCommonLinksConfig = {
      ...inMemoryCommonLinksConfig,
      ...body,
      updatedAt: new Date().toISOString()
    };

    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(publicCommonLinksConfigPath, JSON.stringify(inMemoryCommonLinksConfig, null, 2), 'utf-8');
      const distConfig = path.join(process.cwd(), 'dist', 'common_links_config.json');
      if (fs.existsSync(path.dirname(distConfig))) {
        fs.writeFileSync(distConfig, JSON.stringify(inMemoryCommonLinksConfig, null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('Error saving common_links_config.json:', err);
    }

    return res.json({
      success: true,
      config: inMemoryCommonLinksConfig
    });
  });

  // ==========================================
  // SALARY & BONUS POLICY CONFIGURATION (CHÍNH SÁCH LƯƠNG THƯỞNG)
  // ==========================================
  const publicSalaryPolicyConfigPath = path.join(process.cwd(), 'public', 'salary_policy_config.json');
  let inMemorySalaryPolicyConfig = {
    SPREADSHEET_ID: '1sUq27k_7YJQBERTJ-5x0F40Xa6yVGbY8',
    SHEET_GID: '700211878',
    SHEET_NAME: 'ChinhSachLuongThuong',
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/1sUq27k_7YJQBERTJ-5x0F40Xa6yVGbY8/edit?gid=700211878#gid=700211878',
    API_URL: '',
    updatedAt: new Date().toISOString()
  };

  try {
    if (fs.existsSync(publicSalaryPolicyConfigPath)) {
      const savedConfig = JSON.parse(fs.readFileSync(publicSalaryPolicyConfigPath, 'utf-8'));
      inMemorySalaryPolicyConfig = { ...inMemorySalaryPolicyConfig, ...savedConfig };
    }
  } catch {}

  app.get('/api/config/salary-policy', (req, res) => {
    return res.json({
      success: true,
      config: inMemorySalaryPolicyConfig
    });
  });

  app.post('/api/config/salary-policy', (req, res) => {
    const body = req.body || {};
    inMemorySalaryPolicyConfig = {
      ...inMemorySalaryPolicyConfig,
      ...body,
      updatedAt: new Date().toISOString()
    };

    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(publicSalaryPolicyConfigPath, JSON.stringify(inMemorySalaryPolicyConfig, null, 2), 'utf-8');
      const distConfig = path.join(process.cwd(), 'dist', 'salary_policy_config.json');
      if (fs.existsSync(path.dirname(distConfig))) {
        fs.writeFileSync(distConfig, JSON.stringify(inMemorySalaryPolicyConfig, null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('Error saving salary_policy_config.json:', err);
    }

    return res.json({
      success: true,
      config: inMemorySalaryPolicyConfig
    });
  });

  // ==========================================
  // PENALTY RULES CONFIGURATION (QUY ĐỊNH VI PHẠM)
  // ==========================================
  const publicPenaltyConfigPath = path.join(process.cwd(), 'public', 'penalty_config.json');
  let inMemoryPenaltyConfig = {
    SPREADSHEET_ID: '1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9',
    SHEET_GID: '935493309',
    SHEET_NAME: 'QuyDinhViPham',
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/1-U29zs1oFdDYMOCNYSMWMXxJzXD63_L9/edit?gid=935493309#gid=935493309',
    API_URL: '',
    updatedAt: new Date().toISOString()
  };

  try {
    if (fs.existsSync(publicPenaltyConfigPath)) {
      const savedConfig = JSON.parse(fs.readFileSync(publicPenaltyConfigPath, 'utf-8'));
      inMemoryPenaltyConfig = { ...inMemoryPenaltyConfig, ...savedConfig };
    }
  } catch {}

  app.get('/api/config/penalty', (req, res) => {
    return res.json({
      success: true,
      config: inMemoryPenaltyConfig
    });
  });

  app.post('/api/config/penalty', (req, res) => {
    const body = req.body || {};
    inMemoryPenaltyConfig = {
      ...inMemoryPenaltyConfig,
      ...body,
      updatedAt: new Date().toISOString()
    };

    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(publicPenaltyConfigPath, JSON.stringify(inMemoryPenaltyConfig, null, 2), 'utf-8');
      const distConfig = path.join(process.cwd(), 'dist', 'penalty_config.json');
      if (fs.existsSync(path.dirname(distConfig))) {
        fs.writeFileSync(distConfig, JSON.stringify(inMemoryPenaltyConfig, null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('Error saving penalty_config.json:', err);
    }

    return res.json({
      success: true,
      config: inMemoryPenaltyConfig
    });
  });

  // ==========================================
  // BARCODE LOOKUP CONFIGURATION (TRA CỨU BARCODE)
  // ==========================================
  const publicBarcodeConfigPath = path.join(process.cwd(), 'public', 'barcode_config.json');
  let inMemoryBarcodeConfig = {
    SPREADSHEET_ID: '1-i-eXMU9y0Se68wsvycK5-t8r4aFpo7iVi9ZgsoGX0M',
    SHEET_GID: '0',
    SHEET_NAME: 'BarcodeSanPham',
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/1-i-eXMU9y0Se68wsvycK5-t8r4aFpo7iVi9ZgsoGX0M/edit?gid=0#gid=0',
    API_URL: '',
    updatedAt: new Date().toISOString()
  };

  try {
    if (fs.existsSync(publicBarcodeConfigPath)) {
      const savedConfig = JSON.parse(fs.readFileSync(publicBarcodeConfigPath, 'utf-8'));
      inMemoryBarcodeConfig = { ...inMemoryBarcodeConfig, ...savedConfig };
    }
  } catch {}

  app.get('/api/config/barcode', (req, res) => {
    return res.json({
      success: true,
      config: inMemoryBarcodeConfig
    });
  });

  app.post('/api/config/barcode', (req, res) => {
    const body = req.body || {};
    inMemoryBarcodeConfig = {
      ...inMemoryBarcodeConfig,
      ...body,
      updatedAt: new Date().toISOString()
    };

    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(publicBarcodeConfigPath, JSON.stringify(inMemoryBarcodeConfig, null, 2), 'utf-8');
      const distConfig = path.join(process.cwd(), 'dist', 'barcode_config.json');
      if (fs.existsSync(path.dirname(distConfig))) {
        fs.writeFileSync(distConfig, JSON.stringify(inMemoryBarcodeConfig, null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('Error saving barcode_config.json:', err);
    }

    return res.json({
      success: true,
      config: inMemoryBarcodeConfig
    });
  });

  // ==========================================
  // SPAM FILTER CONFIGURATION API (CHẶN TỪ KHÓA SPAM CHATBOT)
  // Lưu trữ bền vững vào public/spam_config.json và dist/spam_config.json
  // ==========================================
  const publicSpamConfigPath = path.join(process.cwd(), 'public', 'spam_config.json');
  let inMemorySpamConfig: any = {
    enabled: true,
    defaultReply:
      '⚠️ **Cảnh báo vi phạm nội dung:**\nTin nhắn của bạn chứa từ khóa không phù hợp hoặc mang tính chất spam. Trợ lý ảo SSC chỉ hỗ trợ tra cứu nghiệp vụ Quy chế xử lý kỷ luật và Barcode sản phẩm FPT Retail & Long Châu. Vui lòng gửi câu hỏi đúng quy định hỗ trợ công việc shop!',
    rules: [
      { id: 'spam-1', keyword: 'đm', customReply: '', enabled: true, createdAt: 1700000000001 },
      { id: 'spam-2', keyword: 'dcm', customReply: '', enabled: true, createdAt: 1700000000002 },
      { id: 'spam-3', keyword: 'vcl', customReply: '', enabled: true, createdAt: 1700000000003 },
      { id: 'spam-4', keyword: 'chửi', customReply: '', enabled: true, createdAt: 1700000000004 },
      { id: 'spam-5', keyword: 'lừa đảo', customReply: '', enabled: true, createdAt: 1700000000005 },
      { id: 'spam-6', keyword: 'quảng cáo', customReply: '', enabled: true, createdAt: 1700000000006 },
      {
        id: 'spam-7',
        keyword: 'vay tiền',
        customReply: '⚠️ Trợ lý ảo SSC không hỗ trợ các dịch vụ tài chính/vay tiền cá nhân. Vui lòng chỉ đặt câu hỏi liên quan đến nghiệp vụ shop!',
        enabled: true,
        createdAt: 1700000000007
      },
      { id: 'spam-8', keyword: 'cờ bạc', customReply: '', enabled: true, createdAt: 1700000000008 }
    ],
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };

  try {
    if (fs.existsSync(publicSpamConfigPath)) {
      const savedConfig = JSON.parse(fs.readFileSync(publicSpamConfigPath, 'utf-8'));
      inMemorySpamConfig = { ...inMemorySpamConfig, ...savedConfig };
    }
  } catch (err) {
    console.warn('Could not read initial spam_config.json:', err);
  }

  app.get('/api/config/spam-filter', (req, res) => {
    try {
      if (fs.existsSync(publicSpamConfigPath)) {
        const savedConfig = JSON.parse(fs.readFileSync(publicSpamConfigPath, 'utf-8'));
        inMemorySpamConfig = { ...inMemorySpamConfig, ...savedConfig };
      }
    } catch {}

    return res.json({
      success: true,
      config: inMemorySpamConfig
    });
  });

  app.post('/api/config/spam-filter', (req, res) => {
    const body = req.body || {};
    inMemorySpamConfig = {
      ...inMemorySpamConfig,
      ...body,
      updatedAt: new Date().toISOString()
    };

    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(publicSpamConfigPath, JSON.stringify(inMemorySpamConfig, null, 2), 'utf-8');
      const distConfig = path.join(process.cwd(), 'dist', 'spam_config.json');
      if (fs.existsSync(path.dirname(distConfig))) {
        fs.writeFileSync(distConfig, JSON.stringify(inMemorySpamConfig, null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('Error saving spam_config.json:', err);
    }

    return res.json({
      success: true,
      config: inMemorySpamConfig
    });
  });

  // ==========================================
  // ZALO CONTACT IMAGE MANAGEMENT API
  // Lưu trữ ảnh Zalo thực tế vào public/zalo_contact.jpg, src/assets/images/zalo_contact.jpg và dist/zalo_contact.jpg
  // ==========================================
  app.post('/api/config/zalo-image', (req, res) => {
    const { imageBase64, reset } = req.body || {};

    try {
      const publicJpg = path.join(process.cwd(), 'public', 'zalo_contact.jpg');
      const srcJpg = path.join(process.cwd(), 'src', 'assets', 'images', 'zalo_contact.jpg');
      const distJpg = path.join(process.cwd(), 'dist', 'zalo_contact.jpg');

      if (reset) {
        return res.json({ success: true, message: 'Đã đặt lại ảnh mặc định.' });
      }

      if (imageBase64 && typeof imageBase64 === 'string') {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        fs.writeFileSync(publicJpg, buffer);

        if (fs.existsSync(path.dirname(srcJpg))) {
          fs.writeFileSync(srcJpg, buffer);
        }

        if (fs.existsSync(path.dirname(distJpg))) {
          fs.writeFileSync(distJpg, buffer);
        }

        return res.json({
          success: true,
          message: 'Đã lưu ảnh Zalo vào bộ nhớ hệ thống thành công!'
        });
      }
    } catch (err: any) {
      console.error('Error saving zalo image:', err);
      return res.status(500).json({ success: false, message: err?.message || 'Lỗi lưu ảnh Zalo' });
    }

    return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ' });
  });

  // ==========================================
  // BARCODE LOOKUP HISTORY & EXCEL EXPORT API
  // Lưu trữ toàn bộ lịch sử tra cứu (Thành công / Thất bại, Thời gian, IP client) & Tải file Excel
  // ==========================================
  interface BarcodeLogItem {
    id: string;
    productCode: string;
    barcode?: string;
    productName?: string;
    status: 'success' | 'failed';
    message?: string;
    timestamp: number;
    formattedTime: string;
    clientIp: string;
    isAdmin?: boolean;
  }

  const barcodeLogsFile = path.join(process.cwd(), 'public', 'barcode_lookup_logs.json');
  let inMemoryBarcodeLogs: BarcodeLogItem[] = [];

  try {
    if (fs.existsSync(barcodeLogsFile)) {
      const content = fs.readFileSync(barcodeLogsFile, 'utf-8');
      inMemoryBarcodeLogs = JSON.parse(content);
      if (!Array.isArray(inMemoryBarcodeLogs)) inMemoryBarcodeLogs = [];
    }
  } catch (err) {
    console.warn('Error reading barcode_lookup_logs.json:', err);
  }

  const persistBarcodeLogs = () => {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(barcodeLogsFile, JSON.stringify(inMemoryBarcodeLogs, null, 2), 'utf-8');
      const distLogs = path.join(process.cwd(), 'dist', 'barcode_lookup_logs.json');
      if (fs.existsSync(path.dirname(distLogs))) {
        fs.writeFileSync(distLogs, JSON.stringify(inMemoryBarcodeLogs, null, 2), 'utf-8');
      }
    } catch (e) {
      console.warn('Failed to persist barcode logs:', e);
    }
  };

  // POST /api/barcode/history/record - Ghi nhận lịch sử tra cứu
  app.post('/api/barcode/history/record', (req, res) => {
    try {
      const { productCode, barcode, productName, status, message, clientIp: providedIp, isAdmin } = req.body || {};
      const forwarded = (req.headers['x-forwarded-for'] as string) || '';
      const detectedIp =
        providedIp ||
        (forwarded ? forwarded.split(',')[0].trim() : '') ||
        req.socket.remoteAddress ||
        '127.0.0.1';

      const now = new Date();
      const formattedTime = now.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const cleanCode = (productCode || '').toString().trim().toUpperCase();
      if (!cleanCode) {
        return res.status(400).json({ success: false, message: 'Mã sản phẩm không hợp lệ' });
      }

      const isClientAdmin = isAdmin === true || req.headers['x-admin-auth'] === 'true';

      const logItem: BarcodeLogItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productCode: cleanCode,
        barcode: barcode ? String(barcode).trim() : '',
        productName: productName ? String(productName).trim() : '',
        status: status === 'failed' ? 'failed' : 'success',
        message: message ? String(message).trim() : '',
        timestamp: Date.now(),
        formattedTime,
        clientIp: String(detectedIp).replace('::ffff:', ''),
        isAdmin: isClientAdmin
      };

      // Add to top of array, keep up to 2000 records
      inMemoryBarcodeLogs.unshift(logItem);
      if (inMemoryBarcodeLogs.length > 2000) {
        inMemoryBarcodeLogs = inMemoryBarcodeLogs.slice(0, 2000);
      }

      persistBarcodeLogs();

      return res.json({
        success: true,
        item: logItem,
        total: inMemoryBarcodeLogs.length
      });
    } catch (err: any) {
      console.error('Error logging barcode lookup:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/barcode/history - Lấy danh sách lịch sử tra cứu
  app.get('/api/barcode/history', (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    return res.json({
      success: true,
      total: inMemoryBarcodeLogs.length,
      logs: inMemoryBarcodeLogs.slice(0, limit)
    });
  });

  // DELETE /api/barcode/history - Xóa lịch sử (mặc định để lại lịch sử của admin)
  app.delete('/api/barcode/history', (req, res) => {
    const id = req.query.id as string;
    const keepAdmin = req.query.keepAdmin !== 'false';
    if (id) {
      inMemoryBarcodeLogs = inMemoryBarcodeLogs.filter((item) => item.id !== id);
    } else if (keepAdmin) {
      // Xóa lịch sử tra cứu thông thường, để lại lịch sử của admin
      inMemoryBarcodeLogs = inMemoryBarcodeLogs.filter((item) => item.isAdmin === true);
    } else {
      inMemoryBarcodeLogs = [];
    }
    persistBarcodeLogs();
    return res.json({ success: true, total: inMemoryBarcodeLogs.length });
  });

  // GET /api/barcode/history/export - Xuất file Excel lịch sử tra cứu
  app.get('/api/barcode/history/export', async (req, res) => {
    try {
      const XLSX = await import('xlsx');
      const rows = inMemoryBarcodeLogs.map((item, index) => ({
        'STT': index + 1,
        'Thời gian tra cứu': item.formattedTime || new Date(item.timestamp).toLocaleString('vi-VN'),
        'Mã sản phẩm': item.productCode,
        'Mã Barcode': item.barcode || '---',
        'Tên sản phẩm': item.productName || '---',
        'Trạng thái': item.status === 'success' ? 'Thành công' : 'Thất bại (Không tìm thấy)',
        'Ghi chú / Kết quả': item.message || (item.status === 'success' ? 'Tìm thấy mã vạch' : 'Mã không tồn tại trong Sheet'),
        'Địa chỉ IP truy cập': item.clientIp || '---'
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      // Auto-fit column widths
      worksheet['!cols'] = [
        { wch: 6 },  // STT
        { wch: 22 }, // Thời gian
        { wch: 15 }, // Mã SP
        { wch: 18 }, // Mã Barcode
        { wch: 40 }, // Tên SP
        { wch: 24 }, // Trạng thái
        { wch: 30 }, // Ghi chú
        { wch: 18 }  // IP
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'LichSuTraCuuBarcode');
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const dateStr = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Lich_Su_Tra_Cuu_Barcode_${dateStr}.xlsx`);
      return res.send(excelBuffer);
    } catch (err: any) {
      console.error('Error exporting barcode history Excel:', err);
      return res.status(500).send('Lỗi khi xuất file Excel');
    }
  });

  // ==========================================
  // LONG CHAU PRODUCT DIRECT RESOLVER & JUMP
  // Tự động phân tích kết quả tìm kiếm Long Châu để nhảy thẳng vào trang chi tiết sản phẩm
  // ==========================================
  interface ResolvedProduct {
    directProductUrl: string;
    directImageUrl: string | null;
    name: string;
    timestamp: number;
  }

  const productResolutionCache = new Map<string, ResolvedProduct>();

  async function resolveLongChauProduct(code: string): Promise<ResolvedProduct | null> {
    const cleanCode = code.trim();
    if (!cleanCode) return null;

    // Check in-memory cache (24 hours TTL)
    const cached = productResolutionCache.get(cleanCode);
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached;
    }

    try {
      const searchUrl = `https://nhathuoclongchau.com.vn/tim-kiem?s=${encodeURIComponent(cleanCode)}`;
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
        }
      });

      if (!res.ok) return null;
      const html = await res.text();
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (!nextDataMatch) return null;

      const data = JSON.parse(nextDataMatch[1]);
      const products = data.props?.pageProps?.initProducts?.products || [];
      if (!products.length) return null;

      // Prioritize product with matching sku / displayCode, or pick first product
      const exact = products.find((p: any) => p.sku === cleanCode || p.displayCode === cleanCode) || products[0];
      const slug = exact.slug ? (exact.slug.startsWith('/') ? exact.slug.slice(1) : exact.slug) : '';
      const directProductUrl = slug
        ? (slug.startsWith('http') ? slug : `https://nhathuoclongchau.com.vn/${slug}`)
        : searchUrl;
      const directImageUrl = exact.image || null;
      const name = exact.name || exact.webName || '';

      const result: ResolvedProduct = {
        directProductUrl,
        directImageUrl,
        name,
        timestamp: Date.now()
      };
      productResolutionCache.set(cleanCode, result);
      return result;
    } catch (err) {
      console.error('Error resolving Long Chau product:', err);
      return null;
    }
  }

  // GET /api/product/resolve?code=...
  // Trả về directProductUrl và directImageUrl
  app.get('/api/product/resolve', async (req, res) => {
    const code = ((req.query.code as string) || '').trim();
    if (!code) {
      return res.status(400).json({ success: false, message: 'Thiếu mã sản phẩm (code).' });
    }

    const resolved = await resolveLongChauProduct(code);
    if (!resolved) {
      return res.json({
        success: true,
        found: false,
        productCode: code,
        directProductUrl: `https://nhathuoclongchau.com.vn/tim-kiem?s=${encodeURIComponent(code)}`,
        directImageUrl: null,
        fallbackSearchUrl: `https://nhathuoclongchau.com.vn/tim-kiem?s=${encodeURIComponent(code)}`
      });
    }

    return res.json({
      success: true,
      found: true,
      productCode: code,
      directProductUrl: resolved.directProductUrl,
      directImageUrl: resolved.directImageUrl,
      productName: resolved.name,
      fallbackSearchUrl: `https://nhathuoclongchau.com.vn/tim-kiem?s=${encodeURIComponent(code)}`
    });
  });

  // GET /api/product/jump?code=...
  // Tự động HTTP 302 chuyển hướng thẳng vào trang sản phẩm trên Long Châu (bỏ qua trang tìm kiếm)
  app.get('/api/product/jump', async (req, res) => {
    const code = ((req.query.code as string) || '').trim();
    if (!code) {
      return res.redirect('https://nhathuoclongchau.com.vn');
    }

    const resolved = await resolveLongChauProduct(code);
    if (resolved && resolved.directProductUrl) {
      return res.redirect(resolved.directProductUrl);
    }

    return res.redirect(`https://nhathuoclongchau.com.vn/tim-kiem?s=${encodeURIComponent(code)}`);
  });

  // ==========================================
  // PRODUCT IMAGE SEARCH & SECURE IMAGE PROXY
  // Tự động tìm kiếm ảnh sản phẩm thực tế và proxy để vượt rào CORS / Hotlink
  // ==========================================
  interface ProductImageSearchResult {
    url: string;
    thumbnail: string;
    title: string;
  }

  const productImageSearchCache = new Map<string, { images: ProductImageSearchResult[]; timestamp: number }>();

  async function searchProductImages(searchTerm: string): Promise<ProductImageSearchResult[]> {
    const cleanTerm = searchTerm.trim();
    if (!cleanTerm) return [];

    const cached = productImageSearchCache.get(cleanTerm.toLowerCase());
    if (cached && Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
      return cached.images;
    }

    try {
      // 1. Lấy vqd token từ DuckDuckGo
      const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(cleanTerm)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
        }
      });
      const html = await tokenRes.text();
      const vqdMatch = html.match(/vqd=[\"']?([^&\"'\s]+)/);
      if (!vqdMatch) return [];

      const vqd = vqdMatch[1];
      const imgRes = await fetch(`https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(cleanTerm)}&vqd=${vqd}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
        }
      });
      if (!imgRes.ok) return [];
      const data: any = await imgRes.json();
      const rawResults = data.results || [];
      const results: ProductImageSearchResult[] = [];

      for (const item of rawResults) {
        if (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
          // Bỏ qua icon svg hoặc placeholder
          if (!item.image.endsWith('.svg') && !item.image.includes('placeholder')) {
            results.push({
              url: item.image,
              thumbnail: item.thumbnail || item.image,
              title: item.title || ''
            });
            if (results.length >= 6) break;
          }
        }
      }

      productImageSearchCache.set(cleanTerm.toLowerCase(), { images: results, timestamp: Date.now() });
      return results;
    } catch (err) {
      console.error('Error searching product images:', err);
      return [];
    }
  }

  // GET /api/product/image-search?query=...&code=...
  app.get('/api/product/image-search', async (req, res) => {
    const query = ((req.query.query as string) || (req.query.name as string) || '').trim();
    const code = ((req.query.code as string) || '').trim();
    const searchTarget = query || code;

    if (!searchTarget) {
      return res.status(400).json({ success: false, message: 'Thiếu query hoặc code tìm ảnh' });
    }

    let images = await searchProductImages(searchTarget);
    if (!images.length && query && code) {
      images = await searchProductImages(code);
    }

    const primary = images[0]?.url || null;
    const proxiedPrimary = primary ? `/api/image/proxy?url=${encodeURIComponent(primary)}` : null;

    return res.json({
      success: true,
      images,
      primaryImage: primary,
      proxiedPrimaryImage: proxiedPrimary
    });
  });

  // GET /api/image/proxy?url=...
  // Vượt rào CORS & hotlinking protection của các web thuốc / cdn / Google Drive
  app.get('/api/image/proxy', async (req, res) => {
    let targetUrl = ((req.query.url as string) || '').trim();
    if (!targetUrl) {
      return res.status(400).send('Invalid image URL');
    }

    // Tự động xử lý nếu là link chia sẻ Google Drive
    const driveMatch =
      targetUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
      targetUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i) ||
      targetUrl.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);

    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1];
      // Ưu tiên tải trực tiếp từ lh3 hoặc thumbnail
      targetUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      const parsed = new URL(targetUrl);
      let imgRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': parsed.origin
        },
        redirect: 'follow'
      });

      // Nếu link Google Drive lh3 bị lỗi, thử lại qua thumbnail endpoint
      if (!imgRes.ok && driveMatch && driveMatch[1]) {
        const thumbUrl = `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`;
        imgRes = await fetch(thumbUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/*,*/*'
          },
          redirect: 'follow'
        });
      }

      if (!imgRes.ok) {
        return res.status(imgRes.status).send('Failed to fetch image');
      }

      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      const arrayBuffer = await imgRes.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      console.warn('Proxy error for image:', err);
      return res.status(500).send('Proxy error');
    }
  });

  // Serve public assets directly
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware in dev mode OR static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`SSC 87333 Portal server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
