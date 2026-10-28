import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { CountdownTimerBadge } from './common/CountdownTimerBadge';
import {
  Barcode,
  Search,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sliders,
  Code2,
  CheckCircle2,
  Printer,
  Sparkles,
  X,
  ScanLine,
  ArrowRight,
  CheckCircle,
  Eye,
  Loader2,
  Download,
  Globe
} from 'lucide-react';
import {
  lookupBarcode,
  searchProductSuggestions,
  saveBarcodeHistory,
  getBarcodeConfig,
  saveBarcodeConfig,
  clearBarcodeCache,
  getGoogleAppsScriptCode,
  getLongChauSearchUrl,
  loadProductMap,
  ProductBarcodeItem,
  BarcodeConfig
} from '../services/barcodeService';

export const BarcodeLookup: React.FC = () => {
  // --- Form & State ---
  const [productCodeInput, setProductCodeInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchedCode, setSearchedCode] = useState<string>('');
  const [currentProduct, setCurrentProduct] = useState<ProductBarcodeItem | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copyToast, setCopyToast] = useState<boolean>(false);
  const [autoRefocus, setAutoRefocus] = useState<boolean>(false);
  const [barcodeRenderError, setBarcodeRenderError] = useState<boolean>(false);

  // --- Real-time Suggestions State ---
  const [suggestions, setSuggestions] = useState<ProductBarcodeItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState<boolean>(false);

  // --- Modals & Settings ---
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showGasModal, setShowGasModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printCopies, setPrintCopies] = useState<number>(1);
  const [downloadToast, setDownloadToast] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [config, setConfig] = useState<BarcodeConfig>(getBarcodeConfig());
  const [gasCodeCopied, setGasCodeCopied] = useState<boolean>(false);
  const [refreshSuccessMessage, setRefreshSuccessMessage] = useState<string>('');

  // --- Auto-Sync 30s Countdown State ---
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString('vi-VN'));

  // Helper to require admin password for sensitive settings
  const requireAdminAuth = (action: () => void) => {
    const isAuth = sessionStorage.getItem('ssc_admin_auth') === 'true';
    if (isAuth) {
      action();
    } else {
      const entered = window.prompt('Nhập mật khẩu quản trị để tiếp tục:');
      if (entered === 'ssc87333') {
        sessionStorage.setItem('ssc_admin_auth', 'true');
        action();
      } else if (entered !== null) {
        alert('Mật khẩu không chính xác!');
      }
    }
  };

  // Background silent sync without disturbing user input
  const handleSilentAutoSync = async () => {
    if (isAutoSyncing || isLoading) return;
    setIsAutoSyncing(true);
    try {
      clearBarcodeCache();
      await searchProductSuggestions('');
      setLastSyncedTime(new Date().toLocaleTimeString('vi-VN'));
    } catch (e) {
      console.warn('Auto sync sheet error:', e);
    } finally {
      setIsAutoSyncing(false);
    }
  };

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const svgBarcodeRef = useRef<SVGSVGElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const printPreviewRef = useRef<HTMLDivElement>(null);

  // Initial Load: Focus input & warm up cache in background
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Warm up product map silently
    loadProductMap().catch(() => {});
  }, []);

  // Handle Click Outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Flag to suppress suggestions when a suggestion or search has just been picked
  const isManuallySelectedRef = useRef<boolean>(false);

  // Real-time suggestions lookup on typing
  useEffect(() => {
    // If just selected from suggestions/history, don't reopen suggestions
    if (isManuallySelectedRef.current) {
      isManuallySelectedRef.current = false;
      return;
    }

    const raw = productCodeInput.trim();
    if (!raw) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let isMounted = true;
    setIsSearchingSuggestions(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchProductSuggestions(raw);
        if (isMounted) {
          // If already selected in between, don't show
          if (!isManuallySelectedRef.current) {
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
          }
        }
      } catch (err) {
        if (isMounted) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (isMounted) {
          setIsSearchingSuggestions(false);
        }
      }
    }, 40);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [productCodeInput]);

  // Render CODE128 Barcode with digits underneath (larger bars & spaced out digits matching barcode width)
  useEffect(() => {
    if (!currentProduct || !currentProduct.barcode) {
      return;
    }

    const rawBarcode = currentProduct.barcode.trim();
    if (!rawBarcode || !svgBarcodeRef.current) {
      return;
    }

    setBarcodeRenderError(false);

    const applyBarcodeSpacing = (svg: SVGSVGElement | null) => {
      if (!svg) return;
      try {
        const rects = svg.querySelectorAll('rect');
        let minX = Infinity;
        let maxX = -Infinity;

        rects.forEach((rect) => {
          const fill = (rect.getAttribute('fill') || '').toUpperCase();
          const w = parseFloat(rect.getAttribute('width') || '0');
          // Exclude full background white rect if present
          if (fill === '#FFFFFF' || fill === 'WHITE' || fill === '#FFF') {
            return;
          }
          const x = parseFloat(rect.getAttribute('x') || '0');
          if (!isNaN(x) && !isNaN(w) && w > 0) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x + w);
          }
        });

        const textEl = svg.querySelector('text');
        if (textEl && isFinite(minX) && isFinite(maxX) && maxX > minX) {
          const barsWidth = maxX - minX;
          const centerX = minX + barsWidth / 2;
          // Span the full width of the barcode bars evenly
          const targetWidth = Math.max(barsWidth * 0.98, 40);
          textEl.setAttribute('textLength', targetWidth.toFixed(1));
          textEl.setAttribute('lengthAdjust', 'spacing');
          textEl.setAttribute('x', centerX.toFixed(1));
          textEl.setAttribute('text-anchor', 'middle');
          textEl.setAttribute('font-size', '18');
          textEl.setAttribute('font-weight', 'bold');
          textEl.style.fontSize = '18px';
          textEl.style.fontWeight = 'bold';
          textEl.style.letterSpacing = 'normal';
        }
      } catch (err) {
        console.warn('Could not adjust barcode text spacing:', err);
      }
    };

    try {
      // CODE128 chuẩn với vạch to hơn & số bên dưới
      JsBarcode(svgBarcodeRef.current, rawBarcode, {
        format: 'CODE128',
        lineColor: '#000000',
        background: '#FFFFFF',
        width: 2.7, // Tăng độ dày vạch (mã vạch to lên)
        height: 98, // Tăng chiều cao vạch (mã vạch to lên)
        displayValue: true, // Số bên dưới vạch
        font: 'monospace',
        fontOptions: 'bold',
        fontSize: 18,
        textMargin: 8,
        margin: 10,
        valid: (valid) => {
          if (!valid) throw new Error('Invalid CODE128 format');
        },
      });
      applyBarcodeSpacing(svgBarcodeRef.current);
    } catch (e) {
      console.warn('CODE128 direct render failed, fallback to auto:', e);
      try {
        JsBarcode(svgBarcodeRef.current, rawBarcode, {
          format: 'auto',
          lineColor: '#000000',
          background: '#FFFFFF',
          width: 2.7,
          height: 98,
          displayValue: true,
          font: 'monospace',
          fontOptions: 'bold',
          fontSize: 18,
          textMargin: 8,
          margin: 10,
        });
        applyBarcodeSpacing(svgBarcodeRef.current);
      } catch (err2) {
        setBarcodeRenderError(true);
      }
    }
  }, [currentProduct]);

  // Execute Search
  const handleSearch = async (overrideCode?: string, forceRefresh: boolean = false) => {
    const code = (overrideCode !== undefined ? overrideCode : productCodeInput).trim();
    if (!code) {
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    // Dismiss suggestions immediately
    setShowSuggestions(false);
    setSuggestions([]);

    setIsLoading(true);
    setNotFound(false);
    setErrorMessage('');
    setCurrentProduct(null);
    setSearchedCode(code);

    try {
      const result = await lookupBarcode(code, forceRefresh);
      if (result.success && result.product) {
        setCurrentProduct(result.product);
        setNotFound(false);

        // Save to history (SUCCESS)
        await saveBarcodeHistory({
          productCode: result.product.productCode,
          barcode: result.product.barcode,
          productName: result.product.productName,
          status: 'success',
          message: 'Tìm thấy mã vạch thành công'
        });
      } else {
        setNotFound(true);
        setCurrentProduct(null);
        const errMsg = result.message || 'Không tìm thấy mã sản phẩm trong Google Sheet';
        setErrorMessage(errMsg);

        // Save to history (FAILED)
        await saveBarcodeHistory({
          productCode: code,
          barcode: '',
          productName: '',
          status: 'failed',
          message: errMsg
        });
      }
    } catch (err: any) {
      setNotFound(true);
      setCurrentProduct(null);
      const errMsg = err?.message || 'Lỗi khi kết nối Google Sheet';
      setErrorMessage(errMsg);

      // Save to history (FAILED)
      await saveBarcodeHistory({
        productCode: code,
        barcode: '',
        productName: '',
        status: 'failed',
        message: errMsg
      });
    } finally {
      setIsLoading(false);
      if (autoRefocus && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  };

  // Click on a Suggested Product
  const handleSelectSuggestion = (item: ProductBarcodeItem) => {
    // 0. Set flag to prevent debounced typing from reopening suggestions
    isManuallySelectedRef.current = true;

    // 1. Update input
    setProductCodeInput(item.productCode);
    setSearchedCode(item.productCode);

    // 2. Hide suggestions immediately (Khi click vào sản phẩm gợi ý thì mất đi phần gợi ý)
    setShowSuggestions(false);
    setSuggestions([]);

    // 3. Display result directly
    setNotFound(false);
    setErrorMessage('');
    setCurrentProduct(item);

    // 4. Save to history (SUCCESS from suggestions)
    saveBarcodeHistory({
      productCode: item.productCode,
      barcode: item.barcode || '',
      productName: item.productName || '',
      status: 'success',
      message: 'Chọn từ gợi ý sản phẩm'
    });

    // 5. Refocus input for scanner readiness
    if (autoRefocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  };

  // Enter Key trigger
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If suggestions are visible and exactly 1 result, pick it
      if (showSuggestions && suggestions.length === 1) {
        handleSelectSuggestion(suggestions[0]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Copy Barcode to Clipboard
  const handleCopyBarcode = () => {
    if (!currentProduct?.barcode) return;
    navigator.clipboard.writeText(currentProduct.barcode);
    setCopyToast(true);
    setTimeout(() => {
      setCopyToast(false);
    }, 2000);
  };

  // Clear & Reset
  const handleResetSearch = () => {
    setProductCodeInput('');
    setCurrentProduct(null);
    setNotFound(false);
    setErrorMessage('');
    setSearchedCode('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Select from History


  // Manual Force Refresh Google Sheet Cache
  const handleForceRefreshSheet = async () => {
    setIsLoading(true);
    clearBarcodeCache();
    setRefreshSuccessMessage('');
    try {
      if (productCodeInput.trim()) {
        await handleSearch(productCodeInput, true);
      } else {
        await lookupBarcode('__WARMUP__', true);
      }
      setLastSyncedTime(new Date().toLocaleTimeString('vi-VN'));
      setRefreshSuccessMessage('Đã đồng bộ dữ liệu mới nhất từ Google Sheet thành công!');
      setTimeout(() => setRefreshSuccessMessage(''), 4000);
    } catch (e: any) {
      alert('Không thể làm mới: ' + (e?.message || 'Lỗi mạng'));
    } finally {
      setIsLoading(false);
    }
  };

  // Save Settings
  const handleSaveConfig = () => {
    saveBarcodeConfig(config);
    setShowConfigModal(false);
    handleForceRefreshSheet();
  };

  // Open Print Preview Modal when clicking "IN BARCODE"
  const handlePrintBarcode = () => {
    if (!currentProduct || !currentProduct.barcode) {
      alert('Chưa có mã vạch sản phẩm để in!');
      return;
    }
    setShowPrintModal(true);
  };

  const handleOpenLongChau = () => {
    if (!currentProduct) return;
    const targetUrl = getLongChauSearchUrl(currentProduct.productCode);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Execute direct printing with multiple label copies (Chỉ hiện: Tên sản phẩm, Mã sản phẩm, Barcode)
  const executeIframePrint = (copies = 1) => {
    if (!currentProduct || !currentProduct.barcode) {
      return;
    }

    const svgElement = svgBarcodeRef.current;
    let svgHtml = '';
    if (svgElement) {
      svgHtml = svgElement.outerHTML;
    } else {
      svgHtml = `<div style="font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 10px;">*${currentProduct.barcode}*</div>`;
    }

    const safeName = currentProduct.productName || 'SẢN PHẨM';
    const safeCode = currentProduct.productCode;
    const safeBarcode = currentProduct.barcode;

    // Create labels html based on copies count
    const labelsHtml = Array.from({ length: Math.max(1, copies) })
      .map(
        () => `
        <div class="label-box">
          <div class="prod-name">${safeName}</div>
          <div class="meta-row">
            <span>MÃ SP: <strong>${safeCode}</strong></span>
          </div>
          <div class="barcode-svg-container">
            ${svgHtml}
          </div>
        </div>
      `
      )
      .join('');

    // Create an isolated hidden iframe for clean thermal printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>In Barcode - ${safeCode}</title>
          <style>
            @page {
              size: auto;
              margin: 3mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              background: #ffffff;
              color: #000000;
              display: flex;
              flex-direction: column;
              gap: 6mm;
              justify-content: center;
              align-items: center;
              padding: 2px;
            }
            .label-box {
              width: 100%;
              max-width: 380px;
              border: 2px solid #000;
              border-radius: 6px;
              padding: 10px 12px;
              text-align: center;
              background: #fff;
              page-break-inside: avoid;
              page-break-after: always;
            }
            .label-box:last-child {
              page-break-after: auto;
            }
            .prod-name {
              font-size: 13px;
              font-weight: 800;
              line-height: 1.3;
              text-transform: uppercase;
              margin-bottom: 6px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .meta-row {
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 12px;
              font-weight: 800;
              padding: 4px 10px;
              background: #f0f0f0;
              border-radius: 4px;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
            }
            .barcode-svg-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 2px 0 0 0;
            }
            .barcode-svg-container svg {
              width: 100% !important;
              max-width: 320px;
              height: auto !important;
            }
          </style>
        </head>
        <body>
          ${labelsHtml}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Iframe print error, falling back to print dialog:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 250);
  };

  // Download Barcode Image with: Tên sản phẩm, Mã sản phẩm, Mã vạch (vạch + số bên dưới)
  const handleDownloadBarcodeImage = () => {
    if (!currentProduct || !currentProduct.barcode) {
      alert('Chưa có thông tin barcode để tải ảnh!');
      return;
    }

    const svgElement = svgBarcodeRef.current;
    if (!svgElement) {
      alert('Không tìm thấy hình mã vạch để xuất ảnh!');
      return;
    }

    setIsDownloading(true);

    try {
      const prodName = (currentProduct.productName || 'SẢN PHẨM').trim();
      const prodCode = currentProduct.productCode.trim();
      const barcodeStr = currentProduct.barcode.trim();

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        // High resolution scale (2x for retina/crispness)
        const scale = 2;
        const canvasWidth = 560 * scale;
        const padding = 28 * scale;
        const contentWidth = canvasWidth - padding * 2;

        // Temporary canvas to calculate wrapped text lines for Product Name
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.font = `bold ${17 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;

        const words = prodName.toUpperCase().split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
          const testWidth = tempCtx.measureText(testLine).width;
          if (testWidth > contentWidth && currentLine) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }

        // Compute layout measurements
        const nameLineHeight = 24 * scale;
        const nameSectionHeight = lines.length * nameLineHeight;
        const badgeHeight = 34 * scale;
        const svgHeight = ((img.height || 100) / (img.width || 300)) * contentWidth;
        const barcodeDrawHeight = Math.min(Math.max(svgHeight, 105 * scale), 165 * scale);
        const totalHeight = padding * 2 + nameSectionHeight + (10 * scale) + badgeHeight + (14 * scale) + barcodeDrawHeight + (8 * scale);

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. White Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, totalHeight);

        // 2. Outer Border (Bo góc nhẹ thanh lịch)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3 * scale;
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(8 * scale, 8 * scale, canvasWidth - 16 * scale, totalHeight - 16 * scale, 12 * scale);
          ctx.stroke();
        } else {
          ctx.strokeRect(8 * scale, 8 * scale, canvasWidth - 16 * scale, totalHeight - 16 * scale);
        }

        let currentY = padding + 6 * scale;

        // 3. Product Name (Tên sản phẩm)
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${17 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (const line of lines) {
          ctx.fillText(line, canvasWidth / 2, currentY);
          currentY += nameLineHeight;
        }

        currentY += 8 * scale;

        // 4. Meta Badge: Chỉ hiển thị Mã SP (Bố cục gọn gàng, cân đối)
        const badgeY = currentY;
        const badgeText = `MÃ SẢN PHẨM: ${prodCode}`;
        ctx.font = `bold ${14 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
        const textMetrics = ctx.measureText(badgeText);
        const badgeWidth = Math.min(contentWidth, Math.max(textMetrics.width + 36 * scale, 220 * scale));
        const badgeX = (canvasWidth - badgeWidth) / 2;

        ctx.fillStyle = '#f1f5f9';
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6 * scale);
          ctx.fill();
        } else {
          ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
        }

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, canvasWidth / 2, badgeY + badgeHeight / 2);

        currentY += badgeHeight + 14 * scale;

        // 5. Crisp Barcode SVG Image (Mã vạch to + số bên dưới)
        const barcodeDrawWidth = contentWidth * 0.96;
        const barcodeDrawX = (canvasWidth - barcodeDrawWidth) / 2;
        ctx.drawImage(img, barcodeDrawX, currentY, barcodeDrawWidth, barcodeDrawHeight);

        // 6. Trigger PNG file download
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `Barcode_${prodCode}_${barcodeStr}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);

        setDownloadToast(true);
        setTimeout(() => setDownloadToast(false), 2500);
        setIsDownloading(false);
      };

      img.onerror = () => {
        setIsDownloading(false);
        URL.revokeObjectURL(blobUrl);
        alert('Có lỗi khi tạo ảnh tải xuống. Vui lòng thử lại!');
      };

      img.src = blobUrl;
    } catch (err) {
      console.error('Download barcode error:', err);
      setIsDownloading(false);
      alert('Có lỗi xảy ra khi tạo ảnh barcode!');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* --- Top Header Info --- */}
      <div className="text-center space-y-1 pt-1 pb-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          TRA CỨU BARCODE SẢN PHẨM
        </h1>
      </div>

      {/* --- Main Centered Container --- */}
      <div className="max-w-4xl mx-auto space-y-4 w-full">
          {/* --- 1. Ô TÌM KIẾM MÀU VÀNG NÂU (Amber / Warm Bronze) --- */}
          <div
            ref={searchContainerRef}
            className="bg-gradient-to-br from-amber-50/90 via-amber-50/60 to-orange-50/40 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/40 border-2 border-amber-500/70 dark:border-amber-600/70 rounded-xl shadow-sm p-3.5 sm:p-4 space-y-3 relative transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
                <label
                  htmlFor="product-code-input"
                  className="block text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 uppercase tracking-wide"
                >
                  MÃ SẢN PHẨM:
                </label>
              </div>

              <div className="flex items-center gap-2">
                {productCodeInput.trim().length > 0 && (
                  <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                    {productCodeInput.trim().length}/8 ký tự
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleForceRefreshSheet();
                  }}
                  disabled={isLoading || isAutoSyncing}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/90 dark:bg-stone-800 text-amber-950 dark:text-amber-200 font-bold hover:bg-amber-300 dark:hover:bg-stone-700 transition-colors border border-amber-300 dark:border-stone-700 cursor-pointer text-[11px]"
                  title="Tự động đồng bộ sau mỗi 30 giây. Bấm để làm mới ngay!"
                >
                  <CountdownTimerBadge
                    initialSeconds={30}
                    isPaused={!autoSyncEnabled}
                    isRefreshing={isAutoSyncing || isLoading}
                    resetTrigger={lastSyncedTime}
                    onTimeout={handleSilentAutoSync}
                    render={(seconds) => (
                      <>
                        <RefreshCw className={`w-3 h-3 ${isAutoSyncing || isLoading ? 'animate-spin text-amber-700 dark:text-amber-400' : 'text-amber-700 dark:text-amber-400'}`} />
                        <strong>{seconds}s</strong>
                      </>
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-700/70 dark:text-amber-400/80">
                    <Barcode className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <input
                    ref={inputRef}
                    id="product-code-input"
                    type="text"
                    value={productCodeInput}
                    onChange={(e) => setProductCodeInput(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Nhập mã sản phẩm (VD: 00015165, 00017414, 00007304...)"
                    className="w-full pl-9 pr-9 py-2.5 sm:py-3 text-sm sm:text-base font-mono font-bold bg-white dark:bg-stone-950 border-2 border-amber-400 dark:border-amber-700/80 rounded-lg focus:border-amber-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:text-stone-400 dark:placeholder:text-stone-500 text-stone-950 dark:text-amber-50 shadow-inner"
                    autoComplete="off"
                    autoFocus
                  />
                  {productCodeInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductCodeInput('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                        if (inputRef.current) inputRef.current.focus();
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-700/60 hover:text-amber-900 dark:text-amber-400/60 dark:hover:text-amber-200 cursor-pointer"
                      title="Xóa trắng"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={isLoading || !productCodeInput.trim()}
                  className="sm:w-32 py-2.5 sm:py-3 px-4 rounded-lg font-black text-sm text-white bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-stone-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-900/30"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tìm...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 stroke-[2.5]" />
                      <span>TRA CỨU</span>
                    </>
                  )}
                </button>
              </div>

              {/* --- AUTOCOMPLETE SUGGESTIONS DROPDOWN (5 gợi ý, hoặc 1 mã duy nhất khi đủ 8 số) --- */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 sm:right-36 mt-1.5 z-40 bg-white dark:bg-stone-900 border-2 border-amber-500 dark:border-amber-600 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-amber-100/90 dark:bg-amber-950/90 px-2.5 py-1.5 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between text-[10px] font-bold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                      {productCodeInput.trim().length === 8
                        ? '1 KẾT QUẢ ĐÚNG DUY NHẤT (8 SỐ)'
                        : `GỢI Ý ${suggestions.length} SẢN PHẨM PHÙ HỢP`}
                    </span>
                    <span className="text-[9px] text-amber-800/80 dark:text-amber-400/80 font-normal">
                      Click để chọn
                    </span>
                  </div>

                  <div className="divide-y divide-amber-100 dark:divide-stone-800 max-h-64 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors flex items-center justify-between gap-2.5 group cursor-pointer"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded border border-amber-300/80 dark:border-amber-800">
                              {item.productCode}
                            </span>
                            {item.barcode && (
                              <span className="font-mono text-[11px] text-stone-600 dark:text-stone-400">
                                Barcode: {item.barcode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                            {item.productName || '(Chưa có tên)'}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center text-amber-700 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sync alert if any */}
            {refreshSuccessMessage && (
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>{refreshSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* --- Loading State --- */}
          {isLoading && (
            <div className="bg-white dark:bg-slate-900 border-2 border-sky-300 dark:border-sky-800 rounded-xl p-6 text-center space-y-2 animate-in fade-in">
              <div className="inline-flex p-2.5 bg-sky-50 dark:bg-sky-950 rounded-full text-sky-600 dark:text-sky-400 animate-pulse">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Đang tra cứu dữ liệu từ Google Sheet...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Mã đang tìm: <span className="font-bold text-sky-600">{searchedCode}</span>
              </p>
            </div>
          )}

          {/* --- 2. Ô KẾT QUẢ MÀU XANH BIỂN (Ocean Blue / Cyan-Marine) --- */}
          {!isLoading && currentProduct && (
            <div className="bg-white dark:bg-slate-900 border-2 border-sky-500 dark:border-sky-600 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Card Top Banner - Ocean Blue */}
              <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-700 px-4 py-2.5 flex items-center justify-between text-white shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h2 className="text-sm sm:text-base font-black tracking-wider uppercase">
                    THÔNG TIN SẢN PHẨM
                  </h2>
                </div>
              </div>

              <div className="p-3.5 sm:p-5">
                {/* 2-Column Split: Mobile = BARCODE FIRST (order-1), PRODUCT INFO SECOND (order-2); Desktop = Side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                  {/* === CỘT THÔNG TIN: MÃ SẢN PHẨM, TÊN SẢN PHẨM, BARCODE DẠNG SỐ (Mobile: order-2, Desktop: md:order-1) === */}
                  <div className="order-2 md:order-1 md:col-span-6 xl:col-span-6 flex flex-col justify-between space-y-3 bg-sky-50/90 dark:bg-sky-950/40 p-3.5 sm:p-4 rounded-xl border border-sky-200 dark:border-sky-800">
                    <div className="space-y-3">
                      {/* Mã sản phẩm */}
                      <div className="border-b border-sky-200/80 dark:border-sky-800/80 pb-2">
                        <span className="text-[11px] font-black text-sky-800 dark:text-sky-300 uppercase tracking-wide">
                          MÃ SẢN PHẨM:
                        </span>
                        <p className="text-xl sm:text-2xl font-black font-mono text-sky-950 dark:text-sky-100 mt-0.5">
                          {currentProduct.productCode}
                        </p>
                      </div>

                      {/* Tên sản phẩm */}
                      <div className="border-b border-sky-200/80 dark:border-sky-800/80 pb-2">
                        <span className="text-[11px] font-black text-sky-800 dark:text-sky-300 uppercase tracking-wide">
                          TÊN SẢN PHẨM:
                        </span>
                        <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug mt-0.5">
                          {currentProduct.productName || '(Chưa có tên trong Sheet)'}
                        </p>
                      </div>

                      {/* Barcode dạng số */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-sky-800 dark:text-sky-300 uppercase tracking-wide">
                            BARCODE DẠNG SỐ:
                          </span>
                          <span className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold">
                            (Giữ số 0 ở đầu)
                          </span>
                        </div>
                        <div className="mt-1 p-2 bg-white dark:bg-slate-900 rounded-lg border border-sky-200 dark:border-sky-800 shadow-xs">
                          <p className="text-lg sm:text-xl font-black font-mono tracking-wider text-slate-950 dark:text-white select-all">
                            {currentProduct.barcode || '(Trống)'}
                          </p>
                        </div>
                      </div>

                      {/* Nút Mở trang web Nhà thuốc Long Châu */}
                      {/* Nút Mở trang xem hình ảnh sản phẩm */}
                      <button
                        type="button"
                        onClick={handleOpenLongChau}
                        className="w-full py-2.5 px-3 rounded-lg font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white shadow-xs hover:shadow transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer border border-emerald-500/50"
                        title="Xem hình ảnh và chi tiết sản phẩm trên web Long Châu"
                      >
                        <div className="flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-100" />
                          <span>XEM HÌNH ẢNH SẢN PHẨM ↗</span>
                        </div>
                        <span className="text-[10px] font-normal text-emerald-100/90">
                          Mở trang xem hình ảnh và chi tiết sản phẩm trên web Long Châu
                        </span>
                      </button>
                    </div>

                    <div className="pt-1 text-[10px] text-sky-800/70 dark:text-sky-400 font-medium">
                      ✓ Đã tối ưu hóa lưu lịch sử tra cứu tự động
                    </div>
                  </div>

                  {/* === CỘT BARCODE VẠCH (SVG) & KHU VỰC ẢNH SẢN PHẨM NGAY BÊN DƯỚI (Mobile: order-1, Desktop: md:order-2) === */}
                  <div className="order-1 md:order-2 md:col-span-6 xl:col-span-6 flex flex-col justify-between space-y-3">
                    {/* 1. Hình Barcode vạch */}
                    {currentProduct.barcode ? (
                      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-3 sm:p-4 rounded-xl border-2 border-sky-200 dark:border-sky-800 shadow-inner overflow-hidden min-h-[140px]">
                        {barcodeRenderError ? (
                          <div className="p-3 text-center bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg space-y-1 w-full">
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                              Không thể tạo hình Barcode từ chuỗi: {currentProduct.barcode}
                            </p>
                          </div>
                        ) : (
                          <div className="w-full flex flex-col items-center justify-center">
                            {/* Mã sản phẩm - Tên sản phẩm phía trên mã vạch */}
                            <div className="w-full text-center font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 px-2 mb-2 leading-snug">
                              <span className="font-mono text-sky-700 dark:text-sky-300 font-black">{currentProduct.productCode}</span>
                              {currentProduct.productName && (
                                <>
                                  <span className="mx-1.5 text-slate-400 font-normal">-</span>
                                  <span className="font-semibold text-slate-900 dark:text-slate-100">{currentProduct.productName}</span>
                                </>
                              )}
                            </div>

                            {/* SVG Barcode output */}
                            <svg
                              ref={svgBarcodeRef}
                              className="max-w-full h-auto select-none"
                              style={{ minWidth: '190px' }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold text-center">
                        Sản phẩm này chưa có Barcode trong Google Sheet.
                      </div>
                    )}

                    {/* 2. Action Buttons: TẢI ẢNH BARCODE & TRA CỨU MÃ KHÁC (Đã ẩn icon sao chép, in tem) */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleDownloadBarcodeImage}
                        disabled={!currentProduct.barcode || isDownloading}
                        className="w-full py-2.5 px-3 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Tải ảnh Barcode kèm mã SP và tên"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                            <span>ĐANG TẢI ẢNH...</span>
                          </>
                        ) : downloadToast ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3] shrink-0" />
                            <span>ĐÃ TẢI ẢNH BARCODE</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 shrink-0" />
                            <span>TẢI ẢNH BARCODE</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleResetSearch}
                        className="w-full py-2 px-3 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>TRA CỨU MÃ KHÁC</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- Not Found State --- */}
          {!isLoading && notFound && (
            <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-xl p-5 text-center space-y-2 animate-in fade-in duration-200">
              <div className="inline-flex p-2.5 bg-red-100 dark:bg-red-900/60 rounded-full text-red-600 dark:text-red-300">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-red-900 dark:text-red-200 uppercase">
                KHÔNG TÌM THẤY SẢN PHẨM
              </h3>
              <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">
                {errorMessage || 'Vui lòng kiểm tra lại Mã sản phẩm.'}
              </p>
              <div className="text-xs text-red-600 dark:text-red-400 font-mono">
                Mã đã tra cứu: <span className="font-bold underline">{searchedCode}</span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="py-2 px-4 rounded-lg font-bold text-xs bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nhập lại mã sản phẩm khác</span>
                </button>
              </div>
            </div>
          )}
      </div>

      {/* --- Toast Notification --- */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-150">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900 font-black text-xs">
            ✓
          </div>
          <span className="font-bold text-sm">Đã sao chép Barcode vào Clipboard!</span>
        </div>
      )}

      {/* --- Modal: XEM TRƯỚC VÀ IN TEM BARCODE (Print Preview Modal) --- */}
      {showPrintModal && currentProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 uppercase">
                  XEM TRƯỚC BẢN IN TEM BARCODE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select Print Copies */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Số lượng tem cần in:
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPrintCopies(num)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      printCopies === num
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Realistic Thermal Label Sticker Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                <span>Mẫu tem in thực tế (Chuẩn máy in tem nhiệt):</span>
                <span>Khổ 50mm × 30mm</span>
              </div>
              <div
                ref={printPreviewRef}
                className="p-4 sm:p-5 bg-white border-2 border-dashed border-slate-900 rounded-xl text-center text-black space-y-2.5 shadow-inner select-none"
              >
                <div className="text-sm sm:text-base font-black uppercase text-slate-950 leading-snug line-clamp-2">
                  {currentProduct.productName || 'SẢN PHẨM'}
                </div>
                <div className="flex justify-center text-xs font-bold bg-slate-100 p-1.5 rounded-lg text-slate-900">
                  <span>MÃ SP: <strong>{currentProduct.productCode}</strong></span>
                </div>
                <div className="py-2 flex justify-center overflow-x-auto">
                  {svgBarcodeRef.current && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: svgBarcodeRef.current.outerHTML,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDownloadBarcodeImage}
                disabled={!currentProduct.barcode || isDownloading}
                className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                title="Tải ảnh tem này về máy"
              >
                <Download className="w-4 h-4" />
                <span>TẢI ẢNH</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-all"
                >
                  ĐÓNG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    executeIframePrint(printCopies);
                  }}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>IN NGAY ({printCopies} TEM)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal: Cấu hình kết nối Google Sheet --- */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  CẤU HÌNH KẾT NỐI GOOGLE SHEET
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Spreadsheet ID:
                </label>
                <input
                  type="text"
                  value={config.SPREADSHEET_ID}
                  onChange={(e) => setConfig({ ...config, SPREADSHEET_ID: e.target.value.trim() })}
                  className="w-full p-2.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sheet GID:
                </label>
                <input
                  type="text"
                  value={config.SHEET_GID}
                  onChange={(e) => setConfig({ ...config, SHEET_GID: e.target.value.trim() })}
                  className="w-full p-2.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Apps Script Web App URL (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={config.API_URL || ''}
                  onChange={(e) => setConfig({ ...config, API_URL: e.target.value.trim() })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full p-2.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-700 hover:bg-amber-800 text-white cursor-pointer"
              >
                LƯU & ĐỒNG BỘ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal: Code.gs Google Apps Script Template --- */}
      {showGasModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  MÃ NGUỒN GOOGLE APPS SCRIPT (CODE.GS)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGasModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Bạn có thể copy đoạn mã dưới đây vào <strong>Tiện ích mở rộng &gt; Apps Script</strong> trong Google Sheet để triển khai thành Web App độc lập.
            </p>

            <pre className="p-3 bg-slate-950 text-slate-100 rounded-xl text-xs font-mono max-h-80 overflow-y-auto select-all">
              {getGoogleAppsScriptCode()}
            </pre>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getGoogleAppsScriptCode());
                  setGasCodeCopied(true);
                  setTimeout(() => setGasCodeCopied(false), 2500);
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-1.5 cursor-pointer"
              >
                {gasCodeCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>ĐÃ SAO CHÉP MÃ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>SAO CHÉP CODE.GS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
