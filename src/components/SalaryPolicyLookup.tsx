import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Coins,
  Search,
  RotateCw,
  Settings,
  X,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Download,
  Calendar,
  Users,
  Award,
  Sparkles,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  LayoutGrid,
  Rows,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Check,
  Image as ImageIcon,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { SalaryPolicyItem, SalaryPolicyConfig } from '../types';
import {
  fetchSalaryPoliciesFromSheet,
  searchSalaryPolicies,
  getSalaryPolicyConfig,
  saveSalaryPolicyConfig,
  parseGoogleSheetUrl,
  extractGoogleDriveId
} from '../services/salaryPolicyService';
import { AdminSheetConfigModal } from './AdminSheetConfigModal';

export function isSatelliteShopPolicy(item: SalaryPolicyItem): boolean {
  const text = `${item.title} ${item.category} ${item.targetAudience || ''} ${item.badge || ''} ${item.summary || ''}`.toLowerCase();
  return text.includes('vệ tinh') || text.includes('ve tinh') || text.includes('satellite');
}

export interface SalaryPolicyLookupProps {
  onOpenAdminConfig?: (tab: 'salary' | 'penalty' | 'barcode' | 'links') => void;
  initialSubModule?: 'all' | 'shop-thuoc' | 'shop-ve-tinh';
  onSubModuleChange?: (sub: 'all' | 'shop-thuoc' | 'shop-ve-tinh') => void;
  showShopThuoc?: boolean;
  showShopVeTinh?: boolean;
}

/**
 * Resilient Photo Card Image with multi-stage fallback (Direct LH3 -> Drive Thumbnail -> Server Proxy -> Form Poster Placeholder)
 */
const PolicyCardImage: React.FC<{
  item: SalaryPolicyItem;
  className?: string;
  onClick?: () => void;
  aspectClass?: string;
}> = ({ item, className = '', onClick, aspectClass = 'aspect-[3/4]' }) => {
  const [retryStage, setRetryStage] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Compute drive ID
  const driveId = item.driveFileId || extractGoogleDriveId(item.originalImageUrl || item.imageUrl);

  // Compute ordered fallback candidates
  const candidateUrls = useMemo(() => {
    const list: string[] = [];
    if (driveId) {
      list.push(`https://lh3.googleusercontent.com/d/${driveId}`);
      list.push(`https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`);
      list.push(`/api/image/proxy?url=${encodeURIComponent(`https://lh3.googleusercontent.com/d/${driveId}`)}`);
      list.push(`/api/image/proxy?url=${encodeURIComponent(`https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`)}`);
    } else {
      if (item.imageUrl) {
        list.push(item.imageUrl);
        if (item.imageUrl.startsWith('http')) {
          list.push(`/api/image/proxy?url=${encodeURIComponent(item.imageUrl)}`);
        }
      }
    }
    return list;
  }, [item, driveId]);

  const currentSrc = candidateUrls[retryStage] || item.imageUrl;

  const handleImageError = () => {
    if (retryStage < candidateUrls.length - 1) {
      setRetryStage((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  // If all attempts failed or no image URL provided, render an elegant Form Ảnh placeholder
  if (hasError || !currentSrc) {
    return (
      <div
        className={`relative w-full ${aspectClass} bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 rounded-2xl p-5 flex flex-col justify-between border-2 border-dashed border-amber-500/40 overflow-hidden cursor-pointer select-none`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
            {item.badge || item.category || 'CHÍNH SÁCH'}
          </span>
          <Coins className="w-5 h-5 text-amber-400 opacity-80" />
        </div>

        <div className="space-y-2 text-center my-auto px-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <FileSpreadsheet className="w-6 h-6 text-amber-400" />
          </div>
          <h4 className="font-black text-sm text-white line-clamp-3 leading-snug">
            {item.title}
          </h4>
          {item.effectiveDate && (
            <p className="text-[11px] text-amber-200/90 font-medium">
              📅 Hiệu lực: {item.effectiveDate}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300">
          <span className="font-semibold">Mở xem chi tiết &rarr;</span>
          {driveId && (
            <span className="text-[10px] text-slate-400 underline">Google Drive</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${aspectClass} bg-slate-950 rounded-2xl overflow-hidden group cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-center ${className}`}
      onClick={onClick}
    >
      {/* Loading Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
            <RotateCw className="w-5 h-5 animate-spin text-amber-400" />
            <span>Đang tải form ảnh...</span>
          </div>
        </div>
      )}

      {/* Main Poster Image */}
      <img
        src={currentSrc}
        alt={item.title}
        className={`w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleImageError}
      />

      {/* Top Banner Tag */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none z-10">
        <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
          {item.badge || item.category || 'MỚI'}
        </span>

        {item.effectiveDate && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md text-amber-200 text-[10px] font-bold border border-white/10 shadow-md">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>{item.effectiveDate}</span>
          </span>
        )}
      </div>

      {/* Hover Zoom Prompt */}
      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/95 text-slate-900 text-xs font-black shadow-xl">
          <Maximize2 className="w-4 h-4 text-amber-600" />
          <span>Bấm để phóng to ảnh</span>
        </span>
      </div>
    </div>
  );
};

const LightboxImage: React.FC<{
  item: SalaryPolicyItem;
  className?: string;
  style?: React.CSSProperties;
}> = ({ item, className = '', style }) => {
  const [retryStage, setRetryStage] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const driveId = item.driveFileId || extractGoogleDriveId(item.originalImageUrl || item.imageUrl);

  const candidateUrls = useMemo(() => {
    const list: string[] = [];
    if (driveId) {
      // 1. Direct Google Usercontent with explicit max-res dimensions (làm nét tối đa, tránh nhòe)
      list.push(`https://lh3.googleusercontent.com/d/${driveId}=w3840`);
      list.push(`https://lh3.googleusercontent.com/d/${driveId}=w2560`);
      list.push(`https://lh3.googleusercontent.com/d/${driveId}`);
      // 2. High-res thumbnail endpoints
      list.push(`https://drive.google.com/thumbnail?id=${driveId}&sz=w2560`);
      list.push(`https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`);
      // 3. Server-side proxy with high-res headers
      list.push(`/api/image/proxy?url=${encodeURIComponent(`https://lh3.googleusercontent.com/d/${driveId}=w3840`)}`);
      list.push(`/api/image/proxy?url=${encodeURIComponent(`https://lh3.googleusercontent.com/d/${driveId}`)}`);
      list.push(`/api/image/proxy?url=${encodeURIComponent(`https://drive.google.com/thumbnail?id=${driveId}&sz=w2560`)}`);
    } else if (item.imageUrl) {
      list.push(item.imageUrl);
      if (item.imageUrl.startsWith('http')) {
        list.push(`/api/image/proxy?url=${encodeURIComponent(item.imageUrl)}`);
      }
    }
    return list;
  }, [item, driveId]);

  const currentSrc = candidateUrls[retryStage] || item.imageUrl;

  if (hasError || !currentSrc) {
    return (
      <div className="max-w-md p-8 bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl text-center space-y-4 shadow-2xl">
        <Coins className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-white font-black text-lg">{item.title}</h3>
        {item.summary && <p className="text-slate-300 text-xs">{item.summary}</p>}
        {item.detailUrl && (
          <a
            href={item.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            <span>Mở liên kết Drive / Chi tiết</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={item.title}
      className={className}
      style={style}
      onError={() => {
        if (retryStage < candidateUrls.length - 1) {
          setRetryStage((prev) => prev + 1);
        } else {
          setHasError(true);
        }
      }}
    />
  );
};

export const SalaryPolicyLookup: React.FC<SalaryPolicyLookupProps> = ({
  onOpenAdminConfig,
  initialSubModule = 'all',
  onSubModuleChange,
  showShopThuoc = true,
  showShopVeTinh = true
}) => {
  const [policies, setPolicies] = useState<SalaryPolicyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<string>('default');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Submodule Shop Type: 'all' | 'shop-thuoc' | 'shop-ve-tinh'
  const [activeShopType, setActiveShopType] = useState<'all' | 'shop-thuoc' | 'shop-ve-tinh'>(initialSubModule);

  useEffect(() => {
    if (initialSubModule) {
      setActiveShopType(initialSubModule);
    }
  }, [initialSubModule]);

  const handleSelectShopType = (type: 'all' | 'shop-thuoc' | 'shop-ve-tinh') => {
    setActiveShopType(type);
    if (onSubModuleChange) onSubModuleChange(type);
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');
  // Default to "form-photo" (Lưới Form ảnh) as requested by user
  const [viewMode, setViewMode] = useState<'form-photo' | 'large' | 'table'>('form-photo');

  // Lightbox modal state for full-resolution image view with Zoom & Pan & ESC
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Fallback Admin config modal if parent doesn't provide onOpenAdminConfig
  const [localAdminConfigOpen, setLocalAdminConfigOpen] = useState<boolean>(false);

  // Load policies
  const loadPolicies = async (force = false) => {
    if (force) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetchSalaryPoliciesFromSheet(force);
      setPolicies(res.data);
      if (res.lastUpdated) {
        setLastUpdated(res.lastUpdated);
      }
      setDataSource(res.source);
      if (res.message) {
        setStatusMessage(res.message);
      } else {
        setStatusMessage('');
      }
    } catch (err: any) {
      console.error('Failed to load salary policies:', err);
      setStatusMessage('Không thể tải từ Google Sheet, đang hiển thị danh sách dự phòng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPolicies(false);
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    policies.forEach((item) => {
      const cat = (item.category || '').trim();
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [policies]);

  // Compute unique target audiences
  const audiences = useMemo(() => {
    const set = new Set<string>();
    policies.forEach((item) => {
      const aud = (item.targetAudience || '').trim();
      if (aud) set.add(aud);
    });
    return Array.from(set);
  }, [policies]);

  // Submodule Counts
  const shopThuocCount = useMemo(
    () => policies.filter((p) => !isSatelliteShopPolicy(p)).length,
    [policies]
  );
  const shopVeTinhCount = useMemo(
    () => policies.filter((p) => isSatelliteShopPolicy(p)).length,
    [policies]
  );

  // Filtered policies based on search and submodule shop type
  const filteredPolicies = useMemo(() => {
    let list = searchSalaryPolicies(policies, searchQuery, selectedCategory, selectedAudience);
    if (activeShopType === 'shop-thuoc') {
      list = list.filter((p) => !isSatelliteShopPolicy(p));
    } else if (activeShopType === 'shop-ve-tinh') {
      list = list.filter((p) => isSatelliteShopPolicy(p));
    }
    return list;
  }, [policies, searchQuery, selectedCategory, selectedAudience, activeShopType]);

  // Handle Lightbox Open
  const handleOpenLightbox = (index: number) => {
    setActiveLightboxIndex(index);
    setZoomLevel(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleCloseLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
    setZoomLevel(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const handlePrevLightbox = useCallback(() => {
    setActiveLightboxIndex((prev) => {
      if (prev !== null && prev > 0) {
        setZoomLevel(1);
        setRotation(0);
        setPanPosition({ x: 0, y: 0 });
        setIsDragging(false);
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleNextLightbox = useCallback(() => {
    setActiveLightboxIndex((prev) => {
      if (prev !== null && prev < filteredPolicies.length - 1) {
        setZoomLevel(1);
        setRotation(0);
        setPanPosition({ x: 0, y: 0 });
        setIsDragging(false);
        return prev + 1;
      }
      return prev;
    });
  }, [filteredPolicies.length]);

  // Global ESC and Arrow key listener for Lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevLightbox();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextLightbox();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((z) => Math.min(5, Number((z + 0.25).toFixed(2))));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoomLevel((z) => {
          const next = Math.max(0.4, Number((z - 0.25).toFixed(2)));
          if (next <= 1) setPanPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
        setRotation(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, handleCloseLightbox, handlePrevLightbox, handleNextLightbox]);

  // Mouse wheel zoom handler (lăn chuột để phóng to/thu nhỏ)
  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    setZoomLevel((prev) => {
      const nextZoom = Math.max(0.4, Math.min(5, Number((prev + zoomFactor).toFixed(2))));
      if (nextZoom <= 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  };

  // Mouse drag handlers (giữ chuột để kéo ảnh)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on left click (button === 0)
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetZoomPan = () => {
    setZoomLevel(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleDownloadImage = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleOpenConfig = () => {
    if (onOpenAdminConfig) {
      onOpenAdminConfig('salary');
    } else {
      setLocalAdminConfigOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto px-3 sm:px-6">
      {/* Prominent Header Banner (Tiêu đề rõ to trên cùng) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-6 opacity-15 hidden sm:block pointer-events-none">
          <Coins className="w-36 h-36" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-amber-100 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>HỆ THỐNG TRA CỨU ĐÃI NGỘ SSC</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm">
              CHÍNH SÁCH LƯƠNG THƯỞNG
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={() => loadPolicies(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
              title="Đồng bộ lại từ Google Sheet"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Đang cập nhật...' : 'Làm mới'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenConfig}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-amber-50 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md hover:shadow-lg"
              title="Mở cấu hình Google Sheet"
            >
              <Settings className="w-4 h-4 text-amber-600" />
              <span>Cấu hình Sheet</span>
            </button>
          </div>
        </div>

        {/* Status subline */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-100/90 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            {lastUpdated ? (
              <span>Cập nhật lúc: {lastUpdated.toLocaleTimeString('vi-VN')}</span>
            ) : (
              <span>Hệ thống hoạt động bình thường</span>
            )}
          </div>
          <div className="font-bold text-white">
            Tổng cộng: {policies.length} chính sách đang áp dụng
          </div>
        </div>
      </div>

      {/* SUBMODULE SELECTOR: TẤT CẢ | SHOP THUỐC | SHOP VỆ TINH */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 sm:p-2.5 bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl border border-amber-500/20">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Phân hệ chính sách:</span>
          </span>

          <button
            type="button"
            onClick={() => handleSelectShopType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeShopType === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Tất cả</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-slate-900 font-mono font-bold">
              {policies.length}
            </span>
          </button>

          {showShopThuoc !== false && (
            <button
              type="button"
              onClick={() => handleSelectShopType('shop-thuoc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeShopType === 'shop-thuoc'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>💊 Shop thuốc</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-slate-900 font-mono font-bold">
                {shopThuocCount}
              </span>
            </button>
          )}

          {showShopVeTinh !== false && (
            <button
              type="button"
              onClick={() => handleSelectShopType('shop-ve-tinh')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeShopType === 'shop-ve-tinh'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>🛰️ Shop vệ tinh</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-slate-900 font-mono font-bold">
                {shopVeTinhCount}
              </span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 px-2">
          Hiển thị <strong>{filteredPolicies.length}</strong> chính sách
        </div>
      </div>

      {/* Main Search, Filter & View Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm chính sách, mức thưởng, đối tượng, KPI..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700 shrink-0 self-end md:self-auto">
            {/* View 1: Form Ảnh (Photo form) */}
            <button
              type="button"
              onClick={() => setViewMode('form-photo')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === 'form-photo'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Giao diện hiển thị theo form ảnh / áp phích"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
              <span>Form Ảnh</span>
            </button>

            {/* View 2: Ảnh lớn cuộn */}
            <button
              type="button"
              onClick={() => setViewMode('large')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === 'large'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Xem ảnh khổ lớn / Infographic cuộn"
            >
              <Rows className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khổ lớn</span>
            </button>

            {/* View 3: Bảng tra cứu */}
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Danh sách bảng tra cứu"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bảng tra cứu</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 shrink-0 mr-1">
            Danh mục:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả ({policies.length})
          </button>
          {categories.map((cat) => {
            const count = policies.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Audience Filter Pills */}
        {audiences.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 shrink-0 mr-1">
              Đối tượng:
            </span>
            <button
              type="button"
              onClick={() => setSelectedAudience('ALL')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                selectedAudience === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mọi vị trí
            </button>
            {audiences.map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => setSelectedAudience(aud)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedAudience === aud
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {aud}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-pulse p-4 space-y-4"
            >
              <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPolicies.length === 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center space-y-4">
          <Coins className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            Không tìm thấy chính sách phù hợp
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh mục.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedAudience('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs cursor-pointer hover:bg-amber-600 transition-colors"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      )}

      {/* VIEW MODE 1: GIAO DIỆN HIỂN THỊ THEO FORM ẢNH (Photo Poster Frame Cards) */}
      {!loading && viewMode === 'form-photo' && filteredPolicies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredPolicies.map((item, index) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 p-3 sm:p-4 shadow-sm hover:shadow-2xl transition-all duration-300"
            >
              {/* PHOTO FRAME (KHUNG FORM ẢNH CHUẨN POSTER) */}
              <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-inner">
                <PolicyCardImage
                  item={item}
                  aspectClass="aspect-[3/4]"
                  onClick={() => handleOpenLightbox(index)}
                />
              </div>

              {/* DETAILS & TITLE */}
              <div className="pt-3.5 px-1 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    <span>{item.category}</span>
                    {item.targetAudience && (
                      <span className="text-slate-500 dark:text-slate-400 font-semibold normal-case flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{item.targetAudience}</span>
                      </span>
                    )}
                  </div>

                  {/* Prominent Policy Title */}
                  <h3
                    className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer line-clamp-2"
                    onClick={() => handleOpenLightbox(index)}
                    title={item.title}
                  >
                    {item.title}
                  </h3>

                  {item.summary && item.summary !== item.title && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>

                {/* ACTION TOOLBAR UNDER EACH PHOTO CARD */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenLightbox(index)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-black transition-colors cursor-pointer shadow-2xs"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Xem phóng to</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(item.imageUrl, item.title)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Tải ảnh áp phích về máy"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {(item.originalImageUrl || item.detailUrl) && (
                      <a
                        href={item.originalImageUrl || item.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Mở tài liệu gốc trên Google Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: XEM ẢNH KHỔ LỚN (INFOGRAPHIC STREAM) */}
      {!loading && viewMode === 'large' && filteredPolicies.length > 0 && (
        <div className="space-y-8">
          {filteredPolicies.map((item, index) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                      {item.badge || item.category}
                    </span>
                    {item.effectiveDate && (
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        Áp dụng: {item.effectiveDate}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadImage(item.imageUrl, item.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải ảnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenLightbox(index)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Toàn màn hình</span>
                  </button>
                </div>
              </div>

              {/* Large Image Frame */}
              <div className="p-4 sm:p-6 bg-slate-950 flex items-center justify-center">
                <PolicyCardImage
                  item={item}
                  aspectClass="max-h-[650px] w-auto"
                  onClick={() => handleOpenLightbox(index)}
                />
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {item.summary || item.title}
                </p>
                {(item.originalImageUrl || item.detailUrl) && (
                  <a
                    href={item.originalImageUrl || item.detailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở file gốc</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 3: BẢNG TỔNG HỢP (TABLE VIEW) */}
      {!loading && viewMode === 'table' && filteredPolicies.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 w-28">Form ảnh</th>
                  <th className="py-3 px-4">Tên chính sách &amp; Nội dung</th>
                  <th className="py-3 px-4 w-36">Danh mục</th>
                  <th className="py-3 px-4 w-32">Ngày hiệu lực</th>
                  <th className="py-3 px-4 w-32 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredPolicies.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div
                        className="w-20 aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90"
                        onClick={() => handleOpenLightbox(idx)}
                      >
                        <PolicyCardImage item={item} aspectClass="w-full h-full" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-600 cursor-pointer text-sm"
                          onClick={() => handleOpenLightbox(idx)}
                        >
                          {item.title}
                        </span>
                        {item.summary && (
                          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {item.effectiveDate || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenLightbox(idx)}
                          className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer"
                          title="Xem phóng to"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadImage(item.imageUrl, item.title)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                          title="Tải ảnh"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL-SCREEN LIGHTBOX MODAL WITH ZOOM & PAN */}
      {activeLightboxIndex !== null && filteredPolicies[activeLightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/20">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black uppercase">
                {activeLightboxIndex + 1} / {filteredPolicies.length}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 max-w-xl">
                {filteredPolicies[activeLightboxIndex].title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() =>
                  setZoomLevel((z) => {
                    const next = Math.max(0.4, Number((z - 0.25).toFixed(2)));
                    if (next <= 1) setPanPosition({ x: 0, y: 0 });
                    return next;
                  })
                }
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetZoomPan}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold cursor-pointer"
                title="Đặt lại kích thước ban đầu (100%)"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(5, Number((z + 0.25).toFixed(2))))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Phóng to (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Xoay ảnh 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadImage(
                    filteredPolicies[activeLightboxIndex].imageUrl,
                    filteredPolicies[activeLightboxIndex].title
                  )
                }
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Tải ảnh về máy"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCloseLightbox}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                title="Đóng (phím ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Canvas with Wheel Zoom & Mouse Drag Pan */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden my-3 select-none"
            onWheel={handleWheelZoom}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default'
            }}
          >
            {activeLightboxIndex > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevLightbox();
                }}
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md cursor-pointer transition-all"
                title="Chính sách trước (Phím ←)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div
              className={`max-w-full max-h-full flex items-center justify-center ${
                isDragging ? 'transition-none' : 'transition-transform duration-150'
              }`}
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                willChange: 'transform'
              }}
            >
              <LightboxImage
                item={filteredPolicies[activeLightboxIndex]}
                className="max-h-[82vh] max-w-[92vw] object-contain shadow-2xl rounded-lg pointer-events-none transition-all"
                style={{
                  imageRendering: zoomLevel > 1.2 ? ('-webkit-optimize-contrast' as any) : 'auto',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  filter: zoomLevel > 1.2 ? 'contrast(103%) brightness(101%)' : 'none'
                }}
              />
            </div>

            {activeLightboxIndex < filteredPolicies.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextLightbox();
                }}
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md cursor-pointer transition-all"
                title="Chính sách kế tiếp (Phím →)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Footer */}
          <div className="pt-2 text-center text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 border-t border-white/15">
            <div className="flex items-center gap-2 flex-wrap text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-semibold">
                🖱️ Lăn chuột: Phóng to / Thu nhỏ
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-sky-300 font-semibold">
                ✋ Giữ chuột kéo: Di chuyển ảnh
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                ⌨️ Phím ESC: Đóng
              </span>
            </div>

            <div className="flex items-center gap-2">
              {zoomLevel !== 1 && (
                <button
                  type="button"
                  onClick={handleResetZoomPan}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Đặt lại về 100%
                </button>
              )}

              {filteredPolicies[activeLightboxIndex].detailUrl && (
                <a
                  href={filteredPolicies[activeLightboxIndex].detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở văn bản gốc</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fallback Local Admin Config Modal */}
      {localAdminConfigOpen && (
        <AdminSheetConfigModal
          isOpen={localAdminConfigOpen}
          onClose={() => setLocalAdminConfigOpen(false)}
          initialTab="salary"
          onSuccessRefresh={() => loadPolicies(true)}
        />
      )}
    </div>
  );
};
