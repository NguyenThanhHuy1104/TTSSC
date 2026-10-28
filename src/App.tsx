import React, { useState, useEffect, useCallback } from 'react';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BarcodeLookup } from './components/BarcodeLookup';
import { PenaltyLookup } from './components/PenaltyLookup';
import { CommonLinksLookup } from './components/CommonLinksLookup';
import { SalaryPolicyLookup } from './components/SalaryPolicyLookup';
import { PenaltyChatbot } from './components/PenaltyChatbot';
import { BackToTop } from './components/BackToTop';
import { IpBlockedScreen } from './components/IpBlockedScreen';
import { HalloweenWatermark } from './components/HalloweenWatermark';
import { HomePage } from './components/HomePage';
import { LeftSidebar } from './components/LeftSidebar';
import { AdminUnifiedConfigModal, AdminMainTab, AdminSheetSubTab } from './components/AdminUnifiedConfigModal';
import { ZaloContactModal } from './components/ZaloContactModal';
import { MinutesFilesLookup } from './components/MinutesFilesLookup';

import {
  getModuleVisibilityConfig,
  fetchServerModuleVisibility,
  ModuleVisibilityConfig
} from './services/moduleVisibilityService';
import { fetchPenaltiesFromSheet, fetchPenaltyConfigFromServer } from './services/penaltyService';
import { fetchBarcodeConfigFromServer } from './services/barcodeService';
import { fetchSalaryPolicyConfigFromServer } from './services/salaryPolicyService';
import { fetchCommonLinksConfigFromServer } from './services/commonLinksService';
import { fetchSpamFilterConfigFromServer } from './services/spamFilterService';
import { DEFAULT_PENALTY_DATA } from './data/penaltiesData';
import { PenaltyRuleItem } from './types';
import {
  recordVisit,
  fetchVisitStats,
  formatVisitCount,
  VisitStats
} from './services/analyticsService';
import {
  checkIpAccess,
  isAdminWorkspaceSession,
  isBuildAppEnvironment,
  IpCheckResult
} from './services/ipSecurityService';
import { ShieldAlert, Barcode, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation State: 'home' | 'barcode' | 'vi-pham' | 'links' | 'luong-thuong' | 'minutes-files' (Default: 'home')
  const [currentNav, setCurrentNav] = useState<'home' | 'vi-pham' | 'barcode' | 'links' | 'luong-thuong' | 'minutes-files'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('vi-pham')) {
        return 'vi-pham';
      }
      if (hash.includes('links') || hash.includes('link-thuong-dung')) {
        return 'links';
      }
      if (hash.includes('minutes-files') || hash.includes('bien-ban') || hash.includes('file')) {
        return 'minutes-files';
      }
      if (hash.includes('luong-thuong') || hash.includes('chinh-sach')) {
        return 'luong-thuong';
      }
      if (hash.includes('barcode')) {
        return 'barcode';
      }
      if (hash.includes('home') || hash.includes('trang-chu')) {
        return 'home';
      }
      const saved = localStorage.getItem('ssc_active_nav');
      if (saved === 'vi-pham' || saved === 'links' || saved === 'minutes-files' || saved === 'luong-thuong' || saved === 'barcode' || saved === 'home') {
        return saved;
      }
    }
    return 'home';
  });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ssc_theme') === 'dark';
    }
    return false;
  });

  // Check if running inside Build App (ais-dev / localhost) vs Published App
  const isBuildApp = isBuildAppEnvironment();

  // Halloween Watermark State (Default: false, turned off)
  const [showWatermark, setShowWatermark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ssc_halloween_watermark', 'false');
    }
    return false;
  });

  // Load public watermark setting from server / system_config.json so Published App reflects Build App state
  useEffect(() => {
    const syncWatermarkFromServer = async () => {
      try {
        const res = await fetch(`/api/config/watermark?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.showWatermark === 'boolean') {
            setShowWatermark(data.showWatermark);
            localStorage.setItem('ssc_halloween_watermark', String(data.showWatermark));
            return;
          }
        }
      } catch {}

      try {
        const fallback = await fetch(`/system_config.json?t=${Date.now()}`, { cache: 'no-store' });
        if (fallback.ok) {
          const data = await fallback.json();
          if (typeof data.showWatermark === 'boolean') {
            setShowWatermark(data.showWatermark);
            localStorage.setItem('ssc_halloween_watermark', String(data.showWatermark));
          }
        }
      } catch {}
    };

    syncWatermarkFromServer();
  }, []);

  const handleToggleWatermark = () => {
    setShowWatermark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ssc_halloween_watermark', String(next));
      } catch {}
      fetch('/api/config/watermark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showWatermark: next })
      }).catch(() => {});
      return next;
    });
  };

  // SSC Chatbot & Penalty Rules States
  const [penaltyRules, setPenaltyRules] = useState<PenaltyRuleItem[]>(DEFAULT_PENALTY_DATA);
  const [selectedPenaltyId, setSelectedPenaltyId] = useState<string | null>(null);
  const [selectedPenaltyTrigger, setSelectedPenaltyTrigger] = useState<number>(0);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ssc_chatbot_open');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return true;
  });

  // Daily & Total Visits Analytics State (Real visit count)
  const [visitStats, setVisitStats] = useState<VisitStats>({
    todayVisits: 1,
    totalVisits: 1,
    date: '',
    formattedDate: ''
  });

  // IP Whitelist Security State (Admin workspace enters immediately; external links block from initial load until IP is verified)
  const [ipStatus, setIpStatus] = useState<IpCheckResult>(() => {
    const isAdmin = isAdminWorkspaceSession();
    return {
      success: true,
      clientIp: '',
      detectedIps: [],
      enabled: true,
      isAllowed: isAdmin,
      whitelist: [],
      updatedAt: ''
    };
  });
  const [isIpChecking, setIsIpChecking] = useState<boolean>(() => !isAdminWorkspaceSession());
  // Unified Admin Config Modal State (Sheets, IP Whitelist, Barcode History, System)
  const [adminConfigOpen, setAdminConfigOpen] = useState<boolean>(false);
  const [adminConfigInitialTab, setAdminConfigInitialTab] = useState<AdminMainTab | AdminSheetSubTab>('sheets');
  const [isZaloModalOpen, setIsZaloModalOpen] = useState<boolean>(false);

  // Module Visibility & Submodule state
  const [moduleVisibility, setModuleVisibility] = useState<ModuleVisibilityConfig>(() =>
    getModuleVisibilityConfig()
  );

  // Interface Zoom Level (Default 80% as requested: "Mặc định 80% nha")
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ssc_app_zoom_v4');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0.4 && val <= 1.5) return val;
      }
    }
    return 0.8;
  });

  const handleToggleZoom = useCallback(() => {
    setZoomLevel((prev) => {
      const next = prev === 0.8 ? 1.0 : 0.8;
      try {
        localStorage.setItem('ssc_app_zoom_v4', String(next));
      } catch {}
      return next;
    });
  }, []);
  const [activeSalarySubModule, setActiveSalarySubModule] = useState<'all' | 'shop-thuoc' | 'shop-ve-tinh'>('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchServerModuleVisibility().then((config) => {
      if (config) {
        setModuleVisibility(config);
      }
    });

    // Pre-sync all persistent configurations from server (survives publishes & cross-devices)
    fetchSpamFilterConfigFromServer().catch(() => {});
    fetchPenaltyConfigFromServer().catch(() => {});
    fetchBarcodeConfigFromServer().catch(() => {});
    fetchSalaryPolicyConfigFromServer().catch(() => {});
    fetchCommonLinksConfigFromServer().catch(() => {});

    const handleVisUpdate = () => {
      setModuleVisibility(getModuleVisibilityConfig());
    };
    window.addEventListener('ssc_module_visibility_changed', handleVisUpdate);
    return () => window.removeEventListener('ssc_module_visibility_changed', handleVisUpdate);
  }, []);

  // Auto-fallback to home if current navigation target is currently hidden
  useEffect(() => {
    if (
      (currentNav === 'luong-thuong' && moduleVisibility['luong-thuong'] === false) ||
      (currentNav === 'links' && moduleVisibility['links'] === false)
    ) {
      setCurrentNav('home');
      try {
        localStorage.setItem('ssc_active_nav', 'home');
      } catch {}
    }
  }, [currentNav, moduleVisibility]);

  const handleOpenAdminConfig = useCallback((tab: AdminMainTab | AdminSheetSubTab = 'sheets') => {
    setAdminConfigInitialTab(tab);
    setAdminConfigOpen(true);
  }, []);

  const performIpCheck = useCallback(async () => {
    if (!isAdminWorkspaceSession()) {
      setIsIpChecking(true);
    }
    try {
      const res = await checkIpAccess();
      setIpStatus(res);
    } finally {
      setIsIpChecking(false);
    }
  }, []);

  useEffect(() => {
    performIpCheck();
  }, [performIpCheck]);

  // Record visitor session & fetch daily visit counter
  useEffect(() => {
    recordVisit().then((stats) => {
      if (stats && typeof stats.todayVisits === 'number') {
        setVisitStats(stats);
      }
    });

    const interval = setInterval(() => {
      fetchVisitStats().then((stats) => {
        if (stats && typeof stats.todayVisits === 'number') {
          setVisitStats(stats);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Sync Dark Mode with HTML, Body, and color-scheme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('ssc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('ssc_theme', 'light');
    }
  }, [darkMode]);

  // Preload penalties data for fast search in both view and chatbot
  useEffect(() => {
    fetchPenaltiesFromSheet().then((res) => {
      if (res.success && res.data.length > 0) {
        setPenaltyRules(res.data);
      }
    });
  }, []);

  // Hash Navigation Sync (Default to 'home' when no hash or #/home)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('vi-pham')) {
        setCurrentNav('vi-pham');
        localStorage.setItem('ssc_active_nav', 'vi-pham');
      } else if (hash.includes('links') || hash.includes('link-thuong-dung')) {
        setCurrentNav('links');
        localStorage.setItem('ssc_active_nav', 'links');
      } else if (hash.includes('minutes-files') || hash.includes('bien-ban') || hash.includes('file')) {
        setCurrentNav('minutes-files');
        localStorage.setItem('ssc_active_nav', 'minutes-files');
      } else if (hash.includes('luong-thuong') || hash.includes('chinh-sach')) {
        setCurrentNav('luong-thuong');
        localStorage.setItem('ssc_active_nav', 'luong-thuong');
      } else if (hash.includes('barcode')) {
        setCurrentNav('barcode');
        localStorage.setItem('ssc_active_nav', 'barcode');
      } else if (hash.includes('home') || hash.includes('trang-chu')) {
        setCurrentNav('home');
        localStorage.setItem('ssc_active_nav', 'home');
      } else {
        const saved = localStorage.getItem('ssc_active_nav');
        if (saved === 'vi-pham' || saved === 'links' || saved === 'minutes-files' || saved === 'luong-thuong' || saved === 'barcode' || saved === 'home') {
          setCurrentNav(saved);
        } else {
          setCurrentNav('home');
          localStorage.setItem('ssc_active_nav', 'home');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (nav: string, sub?: 'all' | 'shop-thuoc' | 'shop-ve-tinh') => {
    const target: 'home' | 'vi-pham' | 'links' | 'luong-thuong' | 'barcode' | 'minutes-files' =
      nav === 'vi-pham'
        ? 'vi-pham'
        : nav === 'links'
        ? 'links'
        : nav === 'minutes-files'
        ? 'minutes-files'
        : nav === 'luong-thuong'
        ? 'luong-thuong'
        : nav === 'barcode'
        ? 'barcode'
        : 'home';
    setCurrentNav(target);
    if (sub) {
      setActiveSalarySubModule(sub);
    }
    localStorage.setItem('ssc_active_nav', target);
    window.location.hash = `#/${target}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleChatbot = (open: boolean) => {
    setIsChatbotOpen(open);
    localStorage.setItem('ssc_chatbot_open', String(open));
  };

  const handleSelectPenaltyFromChatbot = (id: string) => {
    if (!id) return;
    const cleanId = String(id).replace(/^(?:#?ID|#)/i, '').trim();
    if (!cleanId) return;
    setSelectedPenaltyId(`ID${cleanId}`);
    setSelectedPenaltyTrigger((prev) => prev + 1);
    if (currentNav !== 'vi-pham') {
      handleNavigate('vi-pham');
    }
  };

  // Show Internal Network Warning immediately from start; never show inner UI unless IP is verified allowed
  if (isIpChecking || (ipStatus.enabled && !ipStatus.isAllowed)) {
    return (
      <>
        <IpBlockedScreen
          ipStatus={ipStatus}
          onRecheck={performIpCheck}
          onAuthorized={(updated) => setIpStatus(updated)}
          onOpenAdminModal={() => handleOpenAdminConfig('ip')}
          showWatermark={showWatermark}
        />
        <AdminUnifiedConfigModal
          isOpen={adminConfigOpen}
          onClose={() => setAdminConfigOpen(false)}
          initialTab="ip"
          ipStatus={ipStatus}
          onIpUpdated={(updated) => setIpStatus(updated)}
          showWatermark={showWatermark}
          onToggleWatermark={isBuildApp ? handleToggleWatermark : undefined}
        />
      </>
    );
  }

  return (
    <div
      style={{ zoom: zoomLevel }}
      className={`relative min-h-screen ${darkMode ? 'dark ' : ''}bg-[#F4F7FB] dark:bg-[#07090E] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-600 selection:text-white overflow-x-hidden`}
    >
      {/* Ambient Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-slate-50/90 to-indigo-50/60 dark:from-[#07090E] dark:via-[#0B0F19] dark:to-[#090D16]" />
        <div className="absolute -top-28 -left-28 w-[520px] h-[520px] rounded-full bg-sky-200/45 dark:bg-blue-600/10 blur-[110px]" />
        <div className="absolute top-1/4 -right-28 w-[480px] h-[480px] rounded-full bg-indigo-200/40 dark:bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] rounded-full bg-amber-100/50 dark:bg-emerald-500/5 blur-[130px]" />
        <div className="absolute inset-0 bg-dot-grid" />
      </div>

      {/* Halloween Watermark with 2 Large Pumpkins */}
      {showWatermark && <HalloweenWatermark />}

      {/* Header with Navigation & Dark Mode Toggle */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        activeNav={currentNav}
        activeSalarySubModule={activeSalarySubModule}
        onNavigate={handleNavigate}
        onOpenAdminConfig={handleOpenAdminConfig}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        zoomLevel={zoomLevel}
        onToggleZoom={handleToggleZoom}
      />

      {/* Main Workspace Layout with Left Sidebar (100% screen width) */}
      <div className="relative z-10 flex-1 w-full max-w-full px-3 sm:px-5 lg:px-6 py-4 sm:py-6 flex gap-4 lg:gap-6 items-start">
        {/* Left Sidebar for function selection tabs & submodules */}
        <LeftSidebar
          activeNav={currentNav}
          onNavigate={handleNavigate}
          activeSalarySubModule={activeSalarySubModule}
          onSalarySubModuleChange={setActiveSalarySubModule}
          moduleVisibility={moduleVisibility}
          onOpenAdminConfig={handleOpenAdminConfig}
          onOpenZaloModal={() => setIsZaloModalOpen(true)}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Workspace Content Area */}
        <main className="flex-1 min-w-0">
          {currentNav === 'home' ? (
            <div className="animate-in fade-in duration-200">
              <HomePage
                onNavigate={handleNavigate}
                onOpenAdminConfig={handleOpenAdminConfig}
                onOpenZaloModal={() => setIsZaloModalOpen(true)}
                todayVisits={visitStats.todayVisits}
                totalVisits={visitStats.totalVisits}
              />
            </div>
           ) : currentNav === 'vi-pham' ? (
            <div className="animate-in fade-in duration-200">
              <PenaltyLookup
                selectedPenaltyId={selectedPenaltyId}
                selectedPenaltyTrigger={selectedPenaltyTrigger}
              />
            </div>
          ) : currentNav === 'links' ? (
            <div className="animate-in fade-in duration-200">
              <CommonLinksLookup onOpenAdminConfig={handleOpenAdminConfig} />
            </div>
          ) : currentNav === 'minutes-files' ? (
            <div className="animate-in fade-in duration-200">
              <MinutesFilesLookup onOpenAdminConfig={handleOpenAdminConfig} />
            </div>
          ) : currentNav === 'luong-thuong' ? (
            <div className="animate-in fade-in duration-200">
              <SalaryPolicyLookup
                onOpenAdminConfig={handleOpenAdminConfig}
                initialSubModule={activeSalarySubModule}
                onSubModuleChange={setActiveSalarySubModule}
                showShopThuoc={moduleVisibility['luong-thuong-thuoc']}
                showShopVeTinh={moduleVisibility['luong-thuong-ve-tinh']}
              />
            </div>
          ) : (
            <div className="animate-in fade-in duration-200">
              <BarcodeLookup />
            </div>
          )}
        </main>
      </div>

      {/* Unified Admin Config Modal: Sheets, IP Security, Barcode History & System */}
      <AdminUnifiedConfigModal
        isOpen={adminConfigOpen}
        onClose={() => setAdminConfigOpen(false)}
        initialTab={adminConfigInitialTab}
        ipStatus={ipStatus}
        onIpUpdated={(updated) => setIpStatus(updated)}
        showWatermark={showWatermark}
        onToggleWatermark={isBuildApp ? handleToggleWatermark : undefined}
      />

      {/* Zalo Contact Info Modal (Tài đây / Thông tin liên hệ SSC qua Zalo) */}
      <ZaloContactModal
        isOpen={isZaloModalOpen}
        onClose={() => setIsZaloModalOpen(false)}
      />

      {/* Global AI / Rule Chatbot for Vi phạm */}
      <PenaltyChatbot
        items={penaltyRules.length > 0 ? penaltyRules : DEFAULT_PENALTY_DATA}
        onSelectPenaltyId={handleSelectPenaltyFromChatbot}
        selectedPenaltyId={selectedPenaltyId}
        isOpen={isChatbotOpen}
        onToggleOpen={handleToggleChatbot}
        onNavigate={handleNavigate}
      />

      {/* Back To Top Button */}
      <BackToTop />

      {/* Footer with visit stats, watermark toggle, unified admin & IP button */}
      <Footer
        activeNav={currentNav}
        onNavigate={handleNavigate}
        todayVisits={visitStats.todayVisits}
        totalVisits={visitStats.totalVisits}
        showWatermark={showWatermark}
        onToggleWatermark={isBuildApp ? handleToggleWatermark : undefined}
        ipRestrictionEnabled={ipStatus.enabled}
        onOpenIpAdmin={() => handleOpenAdminConfig('ip')}
        onOpenAdminConfig={handleOpenAdminConfig}
        onOpenZaloModal={() => setIsZaloModalOpen(true)}
      />
    </div>
  );
}
