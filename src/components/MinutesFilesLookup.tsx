import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, RefreshCw, Download, FileText, CheckCircle2, FolderDown } from 'lucide-react';
import { MinuteFileItem } from '../types';
import { fetchMinutesFilesFromSheet, searchMinutesFiles } from '../services/minutesFilesService';

interface MinutesFilesLookupProps {
  onOpenAdminConfig?: (tab?: string) => void;
}

export const MinutesFilesLookup: React.FC<MinutesFilesLookupProps> = () => {
  const [files, setFiles] = useState<MinuteFileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchMinutesFilesFromSheet(false);
        if (isMounted) {
          setFiles(res.data);
        }
      } catch (err) {
        console.error('Failed to load minutes files:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [files]);

  const filteredFiles = useMemo(() => {
    return searchMinutesFiles(files, searchQuery, selectedCategory);
  }, [files, searchQuery, selectedCategory]);

  const handleDownloadFile = (item: MinuteFileItem) => {
    setDownloadingId(item.id);
    setTimeout(() => {
      setDownloadingId(null);
      const rawUrl = item.fileUrl && item.fileUrl !== '#' ? item.fileUrl.trim() : '';
      
      let downloadUrl = rawUrl;
      
      // Match Google Drive, Google Sheets, or Google Docs
      const driveFileMatch = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const driveIdMatch = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      const sheetMatch = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      const docMatch = rawUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      
      if (driveFileMatch && driveFileMatch[1]) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${driveFileMatch[1]}`;
      } else if (driveIdMatch && driveIdMatch[1]) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${driveIdMatch[1]}`;
      } else if (sheetMatch && sheetMatch[1]) {
        // Automatically export Google Sheet as Excel (.xlsx)
        const gidMatch = rawUrl.match(/[?&#]gid=([0-9]+)/);
        const gidParam = gidMatch && gidMatch[1] ? `&gid=${gidMatch[1]}` : '';
        downloadUrl = `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=xlsx${gidParam}`;
      } else if (docMatch && docMatch[1]) {
        // Automatically export Google Doc as PDF
        downloadUrl = `https://docs.google.com/document/d/${docMatch[1]}/export?format=pdf`;
      } else if (!rawUrl) {
        // Fallback automatic blob download with file name
        const dummyContent = `TRUNG TÂM DỊCH VỤ KHỐI SHOP (SSC-87333)\nTên tài liệu: ${item.fileName}\nDanh mục: ${item.category}\nThời gian tải: ${new Date().toLocaleString('vi-VN')}`;
        const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = (item.fileName || 'Tai_lieu_SSC') + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        return;
      }

      // Trigger automatic file download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = item.fileName || 'tai_lieu.xlsx';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 500);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetchMinutesFilesFromSheet(true);
      setFiles(res.data);
    } catch (err) {
      console.error('Failed to refresh minutes files:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-start p-3 sm:p-6 bg-transparent">
      {/* Title */}
      <div className="text-center space-y-1 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center justify-center gap-2">
          <FolderDown className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          <span>BIÊN BẢN &amp; FILE TÀI LIỆU</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Đồng bộ trực tiếp từ Google Sheet — Tải xuống văn bản và biểu mẫu nội bộ nhanh chóng
        </p>
      </div>

      {/* Search Bar & Refresh */}
      <div className="w-full max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tên biên bản, file tài liệu..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-55 shrink-0"
          title="Đồng bộ lại từ Google Sheet"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Đồng bộ Google Sheet</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div className="w-full max-w-3xl mx-auto mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả danh mục' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Files List View (File name on left, Download button on right, NO RAW LINKS SHOWN) */}
      <div className="w-full max-w-3xl mx-auto space-y-3">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Đang đồng bộ biên bản &amp; file từ Google Sheet...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy file hoặc biên bản phù hợp</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Xóa từ khóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          filteredFiles.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-400/60 shadow-xs hover:shadow-md transition-all duration-200"
            >
              {/* Left: Icon + File Name + Category Badge + File Size (NO RAW LINKS SHOWN) */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.category && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] tracking-wide">
                        {item.category}
                      </span>
                    )}
                    {item.fileSize && (
                      <span className="text-[10px] font-mono font-medium text-slate-400">
                        {item.fileSize}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
                    {item.fileName}
                  </h3>
                </div>
              </div>

              {/* Right: Clean Download Button (NO RAW LINKS SHOWN AT ALL) */}
              <div className="shrink-0 w-full sm:w-auto flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(item)}
                  disabled={downloadingId === item.id}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
                >
                  {downloadingId === item.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Tải về</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
