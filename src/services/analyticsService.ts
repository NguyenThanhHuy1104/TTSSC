/**
 * Analytics Service for Tracking Real Daily & Total Visits
 * Trung tâm SSC - 87333
 */

export interface VisitStats {
  todayVisits: number;
  totalVisits: number;
  date: string;
  formattedDate: string;
}

const STORAGE_SESSION_VISIT_KEY = 'ssc_session_recorded_v2';
const STORAGE_DAILY_VISIT_KEY = 'ssc_last_visit_date_v2';
const STORAGE_CLIENT_ID_KEY = 'ssc_visitor_client_id';
const STORAGE_STATS_KEY = 'ssc_visit_stats_cache_v2';

// Helper to get formatted date in Vietnam time (YYYY-MM-DD)
export function getVietnamDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date()); // YYYY-MM-DD
  } catch {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}

// Format number with dots (e.g. 1.250)
export function formatVisitCount(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toLocaleString('vi-VN');
}

function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let cid = localStorage.getItem(STORAGE_CLIENT_ID_KEY);
    if (!cid) {
      cid = `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(STORAGE_CLIENT_ID_KEY, cid);
    }
    return cid;
  } catch {
    return `v-${Date.now()}`;
  }
}

function isPageReloadF5(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const navEntries = window.performance?.getEntriesByType?.('navigation') as
      | PerformanceNavigationTiming[]
      | undefined;
    if (navEntries && navEntries.length > 0 && navEntries[0].type === 'reload') {
      return true;
    }
  } catch {}
  return false;
}

function getFallbackStats(): VisitStats {
  const todayStr = getVietnamDateString();
  try {
    const cached = localStorage.getItem(STORAGE_STATS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.date === todayStr && typeof parsed.todayVisits === 'number') {
        return parsed;
      }
    }
  } catch {}

  return {
    todayVisits: 1,
    totalVisits: 1,
    date: todayStr,
    formattedDate: new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  };
}

/**
 * Record a real visit (once per visitor/session per day; F5 reload does NOT increment)
 */
export async function recordVisit(): Promise<VisitStats> {
  const todayStr = getVietnamDateString();
  const clientId = getOrCreateClientId();
  const isReload = isPageReloadF5();

  let alreadyRecordedToday = false;
  if (typeof window !== 'undefined') {
    try {
      const sessionRecorded = sessionStorage.getItem(STORAGE_SESSION_VISIT_KEY);
      const lastVisitDate = localStorage.getItem(STORAGE_DAILY_VISIT_KEY);
      if (sessionRecorded === todayStr || lastVisitDate === todayStr) {
        alreadyRecordedToday = true;
      }
      sessionStorage.setItem(STORAGE_SESSION_VISIT_KEY, todayStr);
      localStorage.setItem(STORAGE_DAILY_VISIT_KEY, todayStr);
    } catch {}
  }

  // If this is an F5 reload AND already recorded today, just fetch stats without incrementing
  const shouldIncrement = !alreadyRecordedToday;

  try {
    const endpoint = shouldIncrement ? '/api/analytics/visit' : '/api/analytics/stats';
    const res = await fetch(endpoint, {
      method: shouldIncrement ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: shouldIncrement
        ? JSON.stringify({
            clientId,
            isReload: isReload && alreadyRecordedToday
          })
        : undefined
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.todayVisits === 'number') {
        const stats: VisitStats = {
          todayVisits: data.todayVisits,
          totalVisits: data.totalVisits ?? data.todayVisits,
          date: data.date || todayStr,
          formattedDate: data.formattedDate || new Date().toLocaleDateString('vi-VN')
        };
        try {
          localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
        } catch {}
        return stats;
      }
    }
  } catch (err) {
    console.warn('Analytics API error, using fallback:', err);
  }

  return getFallbackStats();
}

/**
 * Fetch latest stats without incrementing (for polling)
 */
export async function fetchVisitStats(): Promise<VisitStats> {
  try {
    const res = await fetch('/api/analytics/stats', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.todayVisits === 'number') {
        const stats: VisitStats = {
          todayVisits: data.todayVisits,
          totalVisits: data.totalVisits ?? data.todayVisits,
          date: data.date || getVietnamDateString(),
          formattedDate: data.formattedDate || new Date().toLocaleDateString('vi-VN')
        };
        try {
          localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
        } catch {}
        return stats;
      }
    }
  } catch {
    // silent catch
  }
  return getFallbackStats();
}
