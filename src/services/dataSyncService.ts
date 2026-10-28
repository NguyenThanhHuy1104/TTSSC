import { useState, useEffect } from 'react';
import { fetchCommonLinksFromSheet } from './commonLinksService';
import { fetchVisitStats } from './analyticsService';

const SYNC_INTERVAL_SECONDS = 90;
let currentCountdown = SYNC_INTERVAL_SECONDS;
let isCurrentlySyncing = false;
const listeners = new Set<(countdown: number, syncing: boolean) => void>();
let timerStarted = false;

function notify() {
  listeners.forEach((fn) => fn(currentCountdown, isCurrentlySyncing));
}

/**
 * Thực hiện đồng bộ dữ liệu tự động mỗi 90 giây
 */
export async function performGlobalDataSync() {
  if (isCurrentlySyncing) return;
  isCurrentlySyncing = true;
  notify();

  try {
    // 1. Đồng bộ danh sách link từ Google Sheet
    await fetchCommonLinksFromSheet(true).catch(() => {});
    // 2. Đồng bộ thống kê lượt truy cập
    await fetchVisitStats().catch(() => {});
    // 3. Phát sự kiện toàn cục để các component tự reload dữ liệu mới
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ssc_global_data_synced'));
    }
  } finally {
    isCurrentlySyncing = false;
    currentCountdown = SYNC_INTERVAL_SECONDS;
    notify();
  }
}

function startGlobalTimer() {
  if (timerStarted || typeof window === 'undefined') return;
  timerStarted = true;

  setInterval(() => {
    if (currentCountdown > 1) {
      currentCountdown -= 1;
      notify();
    } else {
      currentCountdown = 0;
      notify();
      performGlobalDataSync();
    }
  }, 1000);
}

/**
 * Hook đếm ngược 90s đồng bộ dữ liệu
 * Hiển thị số đếm ngược nguyên bản (chỉ số, không hiện chữ cái theo yêu cầu)
 */
export function useSyncCountdown() {
  const [state, setState] = useState({
    countdown: currentCountdown,
    isSyncing: isCurrentlySyncing
  });

  useEffect(() => {
    startGlobalTimer();
    const listener = (countdown: number, isSyncing: boolean) => {
      setState({ countdown, isSyncing });
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    countdown: state.countdown,
    isSyncing: state.isSyncing,
    triggerSync: performGlobalDataSync
  };
}
