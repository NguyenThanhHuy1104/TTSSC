import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * 1. Tra cứu Lô Date: Hộp hàng 3D màu xanh + Kính lúp vàng viền vàng
 */
export const IconBoxSearch3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boxTop" x1="50" y1="15" x2="50" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="boxLeft" x1="22" y1="36" x2="50" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="boxRight" x1="78" y1="36" x2="50" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1D4ED8" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="goldRim" x1="55" y1="45" x2="85" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="goldHandle" x1="68" y1="68" x2="92" y2="92" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="70%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#854D0E" />
      </linearGradient>
      <filter id="shadowBox" x="10" y="10" width="85" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowBox)">
      {/* 3D Box Top */}
      <path d="M50 16L76 30L50 44L24 30L50 16Z" fill="url(#boxTop)" stroke="#93C5FD" strokeWidth="1" />
      {/* 3D Box Left Side */}
      <path d="M24 30L50 44V72L24 58V30Z" fill="url(#boxLeft)" />
      {/* 3D Box Right Side */}
      <path d="M50 44L76 30V58L50 72V44Z" fill="url(#boxRight)" />
      {/* White Shipping Label on Box Side */}
      <path d="M30 42L44 49V56L30 49V42Z" fill="#EFF6FF" opacity="0.9" />
      <line x1="33" y1="46" x2="41" y2="50" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33" y1="49" x2="39" y2="52" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" />

      {/* 3D Golden Magnifying Glass */}
      {/* Handle */}
      <rect x="71" y="65" width="8" height="26" rx="4" transform="rotate(-45 71 65)" fill="url(#goldHandle)" stroke="#78350F" strokeWidth="1" />
      {/* Glass & Rim */}
      <circle cx="61" cy="55" r="16" fill="#60A5FA" fillOpacity="0.35" stroke="url(#goldRim)" strokeWidth="3.5" />
      <circle cx="61" cy="55" r="13" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
      {/* Glass Highlight */}
      <path d="M53 50C54 46 58 44 63 45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
    </g>
  </svg>
);

/**
 * 2. Tra cứu Barcode: Thẻ mã vạch 3D màu xanh + Kính lúp vàng viền vàng
 */
export const IconBarcodeSearch3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="barcodeCard" x1="20" y1="20" x2="70" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#DBEAFE" />
      </linearGradient>
      <linearGradient id="barcodeBorder" x1="20" y1="20" x2="70" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="goldRim2" x1="55" y1="45" x2="85" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="goldHandle2" x1="68" y1="68" x2="92" y2="92" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="70%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#854D0E" />
      </linearGradient>
      <filter id="shadowBarcode" x="10" y="10" width="85" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowBarcode)">
      {/* 3D Rounded Card with Blue Gradient Frame */}
      <rect x="20" y="24" width="52" height="42" rx="12" fill="url(#barcodeCard)" stroke="url(#barcodeBorder)" strokeWidth="3" />
      {/* Barcode Lines */}
      <line x1="28" y1="34" x2="28" y2="56" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round" />
      <line x1="34" y1="34" x2="34" y2="56" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
      <line x1="39" y1="34" x2="39" y2="56" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" />
      <line x1="46" y1="34" x2="46" y2="56" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="51" y1="34" x2="51" y2="56" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round" />
      <line x1="57" y1="34" x2="57" y2="56" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
      <line x1="63" y1="34" x2="63" y2="56" stroke="#1D4ED8" strokeWidth="3.5" strokeLinecap="round" />

      {/* 3D Golden Magnifying Glass */}
      <rect x="71" y="65" width="8" height="26" rx="4" transform="rotate(-45 71 65)" fill="url(#goldHandle2)" stroke="#78350F" strokeWidth="1" />
      <circle cx="61" cy="55" r="16" fill="#60A5FA" fillOpacity="0.35" stroke="url(#goldRim2)" strokeWidth="3.5" />
      <circle cx="61" cy="55" r="13" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
      <path d="M53 50C54 46 58 44 63 45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
    </g>
  </svg>
);

/**
 * 3. Tìm Calllog: Tai nghe ống nghe điện thoại 3D màu xanh + Kính lúp vàng
 */
export const IconCalllogSearch3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="phoneGrad" x1="25" y1="20" x2="65" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="goldRim3" x1="55" y1="45" x2="85" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="goldHandle3" x1="68" y1="68" x2="92" y2="92" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="70%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#854D0E" />
      </linearGradient>
      <filter id="shadowCall" x="10" y="10" width="85" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowCall)">
      {/* Sound Waves */}
      <path d="M46 20C54 22 58 28 59 35" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 14C63 17 70 26 71 37" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Curved Telephone Handset */}
      <path
        d="M26 34C24 28 29 22 35 23L42 24C45 25 47 28 46 31L43 38C42 40 39 41 37 41C36 41 36 43 38 46C41 51 45 55 50 58C52 59 54 59 55 57L61 53C64 51 67 52 69 55L71 61C73 66 69 72 63 71C46 68 31 54 26 34Z"
        fill="url(#phoneGrad)"
        stroke="#BFDBFE"
        strokeWidth="1.5"
      />

      {/* 3D Golden Magnifying Glass */}
      <rect x="71" y="65" width="8" height="26" rx="4" transform="rotate(-45 71 65)" fill="url(#goldHandle3)" stroke="#78350F" strokeWidth="1" />
      <circle cx="61" cy="55" r="16" fill="#60A5FA" fillOpacity="0.35" stroke="url(#goldRim3)" strokeWidth="3.5" />
      <circle cx="61" cy="55" r="13" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
      <path d="M53 50C54 46 58 44 63 45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
    </g>
  </svg>
);

/**
 * 4. Lấy QR CODE: Mã QR 3D màu xanh với khung quét 4 góc
 */
export const IconQrCode3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="qrCard" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#DBEAFE" />
      </linearGradient>
      <linearGradient id="qrBorder" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <filter id="shadowQr" x="10" y="10" width="80" height="80" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowQr)">
      {/* 3D Card Base */}
      <rect x="18" y="18" width="64" height="64" rx="16" fill="url(#qrCard)" stroke="url(#qrBorder)" strokeWidth="3" />

      {/* Top Left Target Box */}
      <rect x="28" y="28" width="16" height="16" rx="4" fill="#2563EB" />
      <rect x="32" y="32" width="8" height="8" rx="2" fill="#EFF6FF" />
      <rect x="34" y="34" width="4" height="4" rx="1" fill="#1D4ED8" />

      {/* Top Right Target Box */}
      <rect x="56" y="28" width="16" height="16" rx="4" fill="#2563EB" />
      <rect x="60" y="32" width="8" height="8" rx="2" fill="#EFF6FF" />
      <rect x="62" y="34" width="4" height="4" rx="1" fill="#1D4ED8" />

      {/* Bottom Left Target Box */}
      <rect x="28" y="56" width="16" height="16" rx="4" fill="#2563EB" />
      <rect x="32" y="60" width="8" height="8" rx="2" fill="#EFF6FF" />
      <rect x="34" y="62" width="4" height="4" rx="1" fill="#1D4ED8" />

      {/* QR Center Data Dots */}
      <rect x="48" y="32" width="4" height="4" rx="1" fill="#3B82F6" />
      <rect x="48" y="44" width="4" height="4" rx="1" fill="#1D4ED8" />
      <rect x="56" y="48" width="4" height="4" rx="1" fill="#2563EB" />
      <rect x="64" y="56" width="4" height="4" rx="1" fill="#1D4ED8" />
      <rect x="52" y="60" width="4" height="4" rx="1" fill="#3B82F6" />
      <rect x="60" y="64" width="4" height="4" rx="1" fill="#2563EB" />
      <rect x="44" y="52" width="4" height="4" rx="1" fill="#1E40AF" />
    </g>
  </svg>
);

/**
 * 5. Lối tắt link thường dùng: Dải băng rôn ruy băng 3D màu xanh + Ngôi sao
 */
export const IconRibbonBookmark3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ribbonGrad" x1="30" y1="15" x2="70" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <filter id="shadowRibbon" x="15" y="10" width="70" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#shadowRibbon)">
      {/* 3D Bookmark Ribbon Banner with V Cut at bottom */}
      <path
        d="M28 18C28 15 30 14 34 14H66C70 14 72 15 72 18V78L50 64L28 78V18Z"
        fill="url(#ribbonGrad)"
        stroke="#93C5FD"
        strokeWidth="1.5"
      />

      {/* Gloss Highlight line */}
      <path d="M34 18V68" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />

      {/* Circular Medal Badge */}
      <circle cx="50" cy="38" r="14" fill="#1E40AF" stroke="#DBEAFE" strokeWidth="2.5" />
      <circle cx="50" cy="38" r="12" fill="#2563EB" />

      {/* White Star */}
      <path
        d="M50 28L52.5 35H60L54 39.5L56.5 47L50 42.5L43.5 47L46 39.5L40 35H47.5L50 28Z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
);

/**
 * 6. Ping IP Shop: Tháp máy chủ Server 3D màu xanh + Sóng Wi-Fi phát tín hiệu
 */
export const IconPingIpShop3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="serverGrad1" x1="25" y1="42" x2="75" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="serverGrad2" x1="25" y1="60" x2="75" y2="74" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <filter id="shadowServer" x="15" y="10" width="70" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowServer)">
      {/* Wi-Fi Waves */}
      <path d="M42 32C46 29 54 29 58 32" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
      <path d="M35 25C44 20 56 20 65 25" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 18C41 12 59 12 72 18" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />

      {/* Top Server Block */}
      <rect x="24" y="42" width="52" height="15" rx="7" fill="url(#serverGrad1)" stroke="#93C5FD" strokeWidth="1.5" />
      <circle cx="34" cy="49.5" r="2.5" fill="#34D399" />
      <circle cx="42" cy="49.5" r="2.5" fill="#60A5FA" />
      <line x1="52" y1="49.5" x2="68" y2="49.5" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" />

      {/* Bottom Server Block */}
      <rect x="24" y="61" width="52" height="15" rx="7" fill="url(#serverGrad2)" stroke="#93C5FD" strokeWidth="1.5" />
      <circle cx="34" cy="68.5" r="2.5" fill="#34D399" />
      <circle cx="42" cy="68.5" r="2.5" fill="#60A5FA" />
      <line x1="52" y1="68.5" x2="68" y2="68.5" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * 7. Tra cứu Link: Mắt xích xích liên kết 3D màu xanh + Kính lúp vàng viền vàng
 */
export const IconLinkSearch3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chain1" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="chain2" x1="35" y1="35" x2="75" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="goldRim4" x1="55" y1="45" x2="85" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="goldHandle4" x1="68" y1="68" x2="92" y2="92" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="70%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#854D0E" />
      </linearGradient>
      <filter id="shadowLink" x="10" y="10" width="85" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowLink)">
      {/* 3D Chain Link Upper */}
      <rect x="25" y="24" width="34" height="18" rx="9" transform="rotate(-45 25 24)" fill="none" stroke="url(#chain1)" strokeWidth="6" strokeLinecap="round" />
      {/* 3D Chain Link Lower */}
      <rect x="42" y="41" width="34" height="18" rx="9" transform="rotate(-45 42 41)" fill="none" stroke="url(#chain2)" strokeWidth="6" strokeLinecap="round" />

      {/* 3D Golden Magnifying Glass */}
      <rect x="71" y="65" width="8" height="26" rx="4" transform="rotate(-45 71 65)" fill="url(#goldHandle4)" stroke="#78350F" strokeWidth="1" />
      <circle cx="61" cy="55" r="16" fill="#60A5FA" fillOpacity="0.35" stroke="url(#goldRim4)" strokeWidth="3.5" />
      <circle cx="61" cy="55" r="13" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
      <path d="M53 50C54 46 58 44 63 45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
    </g>
  </svg>
);

/**
 * 8. Hướng dẫn Infographic: Bảng vẽ biểu đồ chân đứng 3D màu xanh
 */
export const IconInfographic3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boardGrad" x1="20" y1="20" x2="80" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#DBEAFE" />
      </linearGradient>
      <filter id="shadowInfo" x="15" y="10" width="70" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowInfo)">
      {/* Easel Tripod Legs */}
      <line x1="50" y1="20" x2="50" y2="82" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="40" y1="55" x2="28" y2="84" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="60" y1="55" x2="72" y2="84" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />

      {/* 3D Whiteboard Screen with Blue Rounded Frame */}
      <rect x="22" y="24" width="56" height="42" rx="10" fill="url(#boardGrad)" stroke="#3B82F6" strokeWidth="3.5" />

      {/* Bar Chart Columns on Board */}
      <rect x="30" y="48" width="6" height="10" rx="2" fill="#60A5FA" />
      <rect x="40" y="40" width="6" height="18" rx="2" fill="#3B82F6" />
      <rect x="50" y="34" width="6" height="24" rx="2" fill="#1D4ED8" />

      {/* Line Chart Trend Arc */}
      <path d="M33 46L43 38L53 32L68 34" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="68" cy="34" r="3.5" fill="#3B82F6" />
    </g>
  </svg>
);

/**
 * 9. Chính sách, Lương, Thưởng: Chồng đồng tiền xu 3D màu xanh + Ngôi sao & chữ đ
 */
export const IconSalaryCoins3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="coinGrad" x1="25" y1="35" x2="75" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="coinTop" x1="25" y1="35" x2="75" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>
      <filter id="shadowCoin" x="15" y="15" width="70" height="75" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#shadowCoin)">
      {/* 3D Coin Stack Cylinder */}
      {/* Base Layer */}
      <path d="M26 62C26 56 37 51 50 51C63 51 74 56 74 62V70C74 76 63 80 50 80C37 80 26 76 26 70V62Z" fill="#1E3A8A" />
      {/* Middle Layer */}
      <path d="M26 50C26 44 37 40 50 40C63 40 74 44 74 50V58C74 64 63 68 50 68C37 68 26 64 26 58V50Z" fill="url(#coinGrad)" />
      {/* Top Coin Cap */}
      <ellipse cx="50" cy="44" rx="24" ry="11" fill="url(#coinTop)" stroke="#BFDBFE" strokeWidth="1.5" />

      {/* Currency Symbol 'đ' */}
      <text x="44" y="48" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif">đ</text>

      {/* Star Badge Floating Top Right */}
      <circle cx="68" cy="30" r="9" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M68 24L69.5 28.5H74L70.5 31L72 35.5L68 33L64 35.5L65.5 31L62 28.5H66.5L68 24Z" fill="#FFFFFF" />
    </g>
  </svg>
);

/**
 * 10. Cài PM, Mail, Camera: Laptop 3D màu xanh + Màn hình phong bì thư
 */
export const IconLaptopMail3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="laptopScreen" x1="26" y1="24" x2="74" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="laptopBase" x1="18" y1="64" x2="82" y2="74" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <filter id="shadowLaptop" x="12" y="18" width="76" height="65" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowLaptop)">
      {/* Laptop Screen Display */}
      <rect x="25" y="24" width="50" height="38" rx="6" fill="url(#laptopScreen)" stroke="#93C5FD" strokeWidth="2" />

      {/* Glowing White/Blue Envelope on Screen */}
      <rect x="33" y="33" width="34" height="20" rx="3" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
      <path d="M33 34L50 45L67 34" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />

      {/* Laptop Keyboard Base */}
      <path d="M16 66C16 64 18 63 21 63H79C82 63 84 64 84 66L81 72C80 74 78 75 75 75H25C22 75 20 74 19 72L16 66Z" fill="url(#laptopBase)" />
      {/* Trackpad Notch */}
      <rect x="44" y="65" width="12" height="3" rx="1.5" fill="#93C5FD" />
    </g>
  </svg>
);

/**
 * 11. Phép cưới / Hỷ sự / Kết hôn: Cặp nhẫn cưới 3D màu xanh đính kim cương & Trái tim hỷ
 */
export const IconWeddingLeave3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ringBlue1" x1="20" y1="30" x2="65" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="50%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="ringGold" x1="45" y1="20" x2="85" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="60%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="diamondGrad" x1="56" y1="12" x2="72" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="40%" stopColor="#BAE6FD" />
        <stop offset="100%" stopColor="#38BDF8" />
      </linearGradient>
      <filter id="shadowWedding" x="10" y="10" width="85" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#shadowWedding)">
      {/* Background Soft Floating Hearts */}
      <path
        d="M26 24C24 21 21 21 19 23C17 25 17 28 20 31L26 36L32 31C35 28 35 25 33 23C31 21 28 21 26 24Z"
        fill="#F472B6"
        opacity="0.85"
      />
      <path
        d="M78 38C76 35 73 35 71 37C69 39 69 42 72 45L78 50L84 45C87 42 87 39 85 37C83 35 80 35 78 38Z"
        fill="#F43F5E"
        opacity="0.75"
      />

      {/* Left Wedding Ring (Men's 3D Blue Ring) */}
      <circle cx="40" cy="56" r="22" stroke="url(#ringBlue1)" strokeWidth="6.5" fill="none" />
      <circle cx="40" cy="56" r="18" stroke="#DBEAFE" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Right Wedding Ring (Women's 3D Gold Ring with Diamond) */}
      <circle cx="62" cy="46" r="20" stroke="url(#ringGold)" strokeWidth="6" fill="none" />
      <circle cx="62" cy="46" r="16.5" stroke="#FEF08A" strokeWidth="1" fill="none" opacity="0.7" />

      {/* Sparkling Cut 3D Diamond atop the Gold Ring */}
      <path
        d="M62 14L70 22L62 30L54 22L62 14Z"
        fill="url(#diamondGrad)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      <path d="M57 22H67" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
      <path d="M62 14V30" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />

      {/* Diamond Sparkle Rays */}
      <path d="M62 8V11" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 16L75 14" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 16L49 14" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * 12. Bảo hành thiết bị y tế: Máy đo y tế 3D màu xanh + Khiên bảo hành & Cờ lê sửa chữa
 */
export const IconMedicalWarranty3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldWarranty" x1="30" y1="18" x2="70" y2="78" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="wrenchGrad" x1="55" y1="50" x2="85" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="60%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="goldCheckBadge" x1="58" y1="56" x2="82" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
      <filter id="shadowMedWarranty" x="10" y="10" width="85" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowMedWarranty)">
      {/* 3D Medical Device Monitor Base */}
      <rect x="18" y="22" width="46" height="38" rx="8" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2.5" />
      {/* Monitor Display */}
      <rect x="23" y="27" width="36" height="24" rx="4" fill="#1E3A8A" />
      {/* Green Vital Pulse Line (Heartbeat) */}
      <path
        d="M26 39H32L35 32L39 46L43 35L46 41H55"
        stroke="#34D399"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3D Protective Warranty Shield */}
      <path
        d="M60 22L76 28V46C76 58 67 66 60 70C53 66 44 58 44 46V28L60 22Z"
        fill="url(#shieldWarranty)"
        stroke="#BFDBFE"
        strokeWidth="2"
      />
      {/* Inner White Medical Cross on Shield */}
      <path
        d="M57 32H63V38H69V44H63V50H57V44H51V38H57V32Z"
        fill="#FFFFFF"
      />

      {/* 3D Crossed Repair Tool / Wrench */}
      <path
        d="M66 58L80 72C82 74 85 73 86 71C87 69 87 66 84 64L72 52"
        stroke="url(#wrenchGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Verified Guarantee Gold Checkmark Badge */}
      <circle cx="72" cy="68" r="11" fill="url(#goldCheckBadge)" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M68 68L71 71L77 65" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * 13. Hóa đơn điện tử / e-Invoice: Tờ hóa đơn 3D màu xanh + Dấu mộc xanh & Mã vạch
 */
export const IconInvoiceBill3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="billGrad" x1="25" y1="16" x2="75" y2="82" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EFF6FF" />
      </linearGradient>
      <linearGradient id="billBorder" x1="25" y1="16" x2="75" y2="82" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <filter id="shadowInvoice" x="15" y="10" width="70" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowInvoice)">
      {/* 3D Bill Document with folded bottom-right corner */}
      <rect x="24" y="16" width="52" height="68" rx="8" fill="url(#billGrad)" stroke="url(#billBorder)" strokeWidth="2.5" />
      {/* Document Header Line */}
      <rect x="32" y="24" width="22" height="5" rx="2.5" fill="#2563EB" />
      <rect x="58" y="24" width="10" height="5" rx="2.5" fill="#60A5FA" />
      {/* Text Lines */}
      <line x1="32" y1="36" x2="68" y2="36" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="43" x2="62" y2="43" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="50" x2="68" y2="50" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

      {/* Barcode Strip at bottom */}
      <line x1="32" y1="68" x2="32" y2="76" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="68" x2="36" y2="76" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round" />
      <line x1="42" y1="68" x2="42" y2="76" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="46" y1="68" x2="46" y2="76" stroke="#1E40AF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="51" y1="68" x2="51" y2="76" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round" />

      {/* Blue Verified e-Invoice Stamp */}
      <circle cx="64" cy="62" r="11" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M60 62L63 65L69 59" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * 14. Kiểm kê tồn kho: Bìa kẹp hồ sơ Checklist 3D màu xanh + Thùng hàng
 */
export const IconInventoryCheck3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="clipGrad" x1="20" y1="18" x2="70" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <filter id="shadowInv" x="12" y="10" width="76" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowInv)">
      {/* 3D Clipboard Board */}
      <rect x="22" y="18" width="50" height="66" rx="8" fill="url(#clipGrad)" stroke="#93C5FD" strokeWidth="1.5" />
      {/* Inner Paper Sheet */}
      <rect x="27" y="26" width="40" height="52" rx="4" fill="#FFFFFF" />

      {/* Top Silver Metallic Clip */}
      <rect x="36" y="14" width="22" height="10" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="47" cy="18" r="2" fill="#64748B" />

      {/* Check Item 1 */}
      <circle cx="34" cy="35" r="3.5" fill="#34D399" />
      <path d="M32.5 35L33.5 36.5L36 33.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="41" y1="35" x2="60" y2="35" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Check Item 2 */}
      <circle cx="34" cy="46" r="3.5" fill="#34D399" />
      <path d="M32.5 46L33.5 47.5L36 44.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="41" y1="46" x2="56" y2="46" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Check Item 3 */}
      <circle cx="34" cy="57" r="3.5" fill="#60A5FA" />
      <path d="M32.5 57L33.5 58.5L36 55.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="41" y1="57" x2="58" y2="57" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />

      {/* Small Floating 3D Storage Box at Bottom Right */}
      <rect x="58" y="60" width="22" height="18" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
      <path d="M58 66H80" stroke="#B45309" strokeWidth="1.5" />
      <path d="M69 60V78" stroke="#B45309" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * 15. Đổi trả hàng / Thu hồi: Thùng hàng 3D màu xanh + Mũi tên hoàn trả xoay vòng
 */
export const IconReturnExchange3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="returnBox" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <filter id="shadowReturn" x="12" y="12" width="76" height="76" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowReturn)">
      {/* 3D Box in Center */}
      <rect x="28" y="28" width="44" height="44" rx="10" fill="url(#returnBox)" stroke="#BFDBFE" strokeWidth="2" />
      {/* Packaging Tape */}
      <path d="M50 28V72" stroke="#93C5FD" strokeWidth="6" opacity="0.6" />
      <path d="M28 50H72" stroke="#93C5FD" strokeWidth="6" opacity="0.6" />

      {/* Circular Return Exchange Arrows Around Box */}
      {/* Top Arc Arrow (Clockwise) */}
      <path
        d="M26 34C31 20 50 16 68 20"
        stroke="#22D3EE"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M68 15L74 21L67 27" fill="#22D3EE" />

      {/* Bottom Arc Arrow (Counter-Clockwise) */}
      <path
        d="M74 66C69 80 50 84 32 80"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M32 85L26 79L33 73" fill="#F59E0B" />
    </g>
  </svg>
);

/**
 * 16. Bảo hiểm y tế BHYT: Thẻ bảo hiểm 3D màu xanh + Chữ thập y tế & Khiên bảo vệ
 */
export const IconHealthInsurance3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="insureCard" x1="18" y1="26" x2="82" y2="74" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#0D9488" />
      </linearGradient>
      <filter id="shadowInsure" x="12" y="16" width="76" height="68" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowInsure)">
      {/* 3D Insurance Card */}
      <rect x="18" y="26" width="64" height="48" rx="12" fill="url(#insureCard)" stroke="#93C5FD" strokeWidth="2" />

      {/* Gold Smart Chip */}
      <rect x="28" y="36" width="12" height="10" rx="2.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
      <line x1="28" y1="41" x2="40" y2="41" stroke="#CA8A04" strokeWidth="0.8" />
      <line x1="34" y1="36" x2="34" y2="46" stroke="#CA8A04" strokeWidth="0.8" />

      {/* White Medical Cross Badge with Shield Outline */}
      <circle cx="62" cy="50" r="14" fill="#FFFFFF" fillOpacity="0.2" stroke="#FFFFFF" strokeWidth="1.5" />
      <path
        d="M59 42H65V47H70V53H65V58H59V53H54V47H59V42Z"
        fill="#FFFFFF"
      />

      {/* Card Info Lines */}
      <rect x="28" y="56" width="18" height="3" rx="1.5" fill="#BFDBFE" />
      <rect x="28" y="62" width="26" height="3" rx="1.5" fill="#BFDBFE" opacity="0.7" />
    </g>
  </svg>
);

/**
 * 17. Giao hàng / Vận chuyển: Xe giao hàng nhanh 3D màu xanh + Hộp hàng
 */
export const IconFastDelivery3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vanGrad" x1="20" y1="30" x2="80" y2="65" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <filter id="shadowVan" x="10" y="20" width="80" height="65" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowVan)">
      {/* Motion Speed Lines */}
      <line x1="12" y1="42" x2="22" y2="42" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="48" x2="18" y2="48" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="54" x2="24" y2="54" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Delivery Van Body */}
      <path
        d="M26 36C26 33 28 31 31 31H60C62 31 63 32 64 34L72 44C73 45 74 47 74 49V61C74 63 72 65 70 65H28C26 65 24 63 24 61V38C24 36 25 36 26 36Z"
        fill="url(#vanGrad)"
        stroke="#BFDBFE"
        strokeWidth="1.5"
      />
      {/* Front Windshield Window */}
      <path d="M62 36L69 45H58V36H62Z" fill="#EFF6FF" opacity="0.9" />

      {/* Wheels */}
      <circle cx="38" cy="65" r="9" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
      <circle cx="38" cy="65" r="3.5" fill="#E2E8F0" />

      <circle cx="66" cy="65" r="9" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
      <circle cx="66" cy="65" r="3.5" fill="#E2E8F0" />

      {/* Package Box on Van Side */}
      <rect x="36" y="42" width="14" height="12" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
      <path d="M36 47H50" stroke="#B45309" strokeWidth="1" />
    </g>
  </svg>
);

/**
 * 18. Camera giám sát shop: Camera vòm / mắt thần 3D màu xanh + Đèn LED bảo vệ
 */
export const IconCameraCctv3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="camDome" x1="25" y1="20" x2="75" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="50%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <filter id="shadowCam" x="12" y="15" width="76" height="75" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowCam)">
      {/* Ceiling Mount Base Plate */}
      <rect x="22" y="18" width="56" height="12" rx="6" fill="#1E40AF" stroke="#93C5FD" strokeWidth="1.5" />
      <rect x="30" y="30" width="40" height="8" rx="3" fill="#2563EB" />

      {/* 3D Blue Camera Dome Sphere */}
      <circle cx="50" cy="52" r="24" fill="url(#camDome)" stroke="#BFDBFE" strokeWidth="2" />

      {/* High-Tech Black Camera Lens */}
      <circle cx="50" cy="52" r="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
      <circle cx="50" cy="52" r="8" fill="#1E293B" />
      <circle cx="48" cy="50" r="3" fill="#38BDF8" opacity="0.8" />

      {/* Red/Green Active Recording LED */}
      <circle cx="64" cy="40" r="3" fill="#EF4444" />
      <circle cx="64" cy="40" r="1.5" fill="#FCA5A5" />

      {/* Infrared Wave Arcs */}
      <path d="M40 76C46 80 54 80 60 76" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 82C44 88 56 88 66 82" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * 19. Đổi mật khẩu Inside RSA / SSO: Khóa an ninh 3D màu xanh + Chìa khóa vàng vi mạch
 */
export const IconSecurityInside3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lockBody" x1="25" y1="36" x2="75" y2="82" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="lockShackle" x1="32" y1="16" x2="68" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
      <filter id="shadowLock" x="12" y="10" width="76" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#shadowLock)">
      {/* 3D Metallic Shackle */}
      <path
        d="M34 40V28C34 19 41 12 50 12C59 12 66 19 66 28V40"
        stroke="url(#lockShackle)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* 3D Blue Padlock Body */}
      <rect x="24" y="38" width="52" height="46" rx="14" fill="url(#lockBody)" stroke="#93C5FD" strokeWidth="2" />

      {/* Cyber Circuit Glow Lines on Padlock */}
      <path d="M30 46H38V54" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 46H62V54" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="54" r="1.5" fill="#93C5FD" />
      <circle cx="62" cy="54" r="1.5" fill="#93C5FD" />

      {/* Golden Keyhole with Light */}
      <circle cx="50" cy="57" r="6" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      <path d="M48 59L46 72H54L52 59" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
      <circle cx="50" cy="57" r="2.5" fill="#78350F" />
    </g>
  </svg>
);

/**
 * 20. Nhà thuốc FPT Long Châu / Website / Dược phẩm: Cửa hàng nhà thuốc 3D màu xanh + Chữ thập y tế
 */
export const IconPharmacyStore3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="roofGrad" x1="16" y1="20" x2="84" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <filter id="shadowStore" x="10" y="15" width="80" height="75" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowStore)">
      {/* Awning Canopy Roof */}
      <path d="M18 36L24 22H76L82 36H18Z" fill="url(#roofGrad)" stroke="#93C5FD" strokeWidth="1.5" />
      {/* Canopy Stripes */}
      <path d="M30 22L27 36H37L39 22H30Z" fill="#EFF6FF" opacity="0.9" />
      <path d="M52 22L50 36H60L61 22H52Z" fill="#EFF6FF" opacity="0.9" />

      {/* Store Building Base */}
      <rect x="22" y="36" width="56" height="46" rx="6" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2.5" />

      {/* Big Blue Medical Cross Signboard in Center */}
      <rect x="36" y="44" width="28" height="28" rx="8" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
      <path
        d="M47 50H53V55H58V61H53V66H47V61H42V55H47V50Z"
        fill="#FFFFFF"
      />

      {/* Glass Entrance Door */}
      <rect x="42" y="74" width="16" height="8" rx="2" fill="#93C5FD" opacity="0.7" />
    </g>
  </svg>
);

/**
 * 21. Chấm công & Ca làm việc: Máy quét vân tay chấm công 3D màu xanh + Đồng hồ giờ
 */
export const IconTimeAttendance3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="timeCard" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <filter id="shadowTime" x="12" y="12" width="76" height="76" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowTime)">
      {/* 3D Attendance Device Housing */}
      <rect x="20" y="20" width="60" height="60" rx="16" fill="url(#timeCard)" stroke="#93C5FD" strokeWidth="2" />

      {/* Clock Face Display */}
      <circle cx="50" cy="42" r="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
      <circle cx="50" cy="42" r="2" fill="#FFFFFF" />
      {/* Clock Hands at 8:00 AM */}
      <line x1="50" y1="42" x2="50" y2="32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="42" x2="42" y2="46" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />

      {/* Biometric Fingerprint Glow Area at bottom */}
      <rect x="34" y="62" width="32" height="12" rx="6" fill="#1E293B" stroke="#34D399" strokeWidth="1.5" />
      {/* Green Verified Check Pulse */}
      <path d="M42 68L47 71L58 65" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * 22. Google Drive / Thư mục đám mây: Thư mục Folder 3D màu xanh + Biểu tượng Cloud
 */
export const IconCloudDrive3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="folderBack" x1="20" y1="24" x2="80" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="folderFront" x1="20" y1="36" x2="80" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <filter id="shadowDrive" x="12" y="15" width="76" height="75" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowDrive)">
      {/* Folder Back Tab */}
      <path d="M22 30C22 26 25 24 28 24H42L48 30H74C77 30 80 33 80 36V70H22V30Z" fill="url(#folderBack)" />

      {/* White Document Paper inside Folder */}
      <rect x="28" y="28" width="44" height="24" rx="4" fill="#EFF6FF" />
      <line x1="34" y1="34" x2="52" y2="34" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="40" x2="60" y2="40" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

      {/* Folder Front Flap */}
      <path d="M18 42C18 38 21 36 24 36H76C79 36 82 38 82 42V72C82 76 79 78 76 78H24C21 78 18 76 18 72V42Z" fill="url(#folderFront)" stroke="#93C5FD" strokeWidth="1.5" />

      {/* Cloud Icon on Front */}
      <path
        d="M44 60C44 57 46 55 49 55C50 52 53 50 56 50C59 50 62 52 63 55C65 55 68 57 68 60C68 63 65 65 62 65H46C44 65 44 62 44 60Z"
        fill="#FFFFFF"
        opacity="0.9"
      />
    </g>
  </svg>
);

/**
 * 23. E-Learning / Đào tạo / Khóa thi: Mũ cử nhân 3D màu xanh + Sách mở
 */
export const IconEducationCap3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="capGrad" x1="20" y1="20" x2="80" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <filter id="shadowEdu" x="12" y="15" width="76" height="75" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#shadowEdu)">
      {/* Open Book Base */}
      <path d="M22 62C34 58 46 60 50 64C54 60 66 58 78 62V78C66 74 54 76 50 80C46 76 34 74 22 78V62Z" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
      <line x1="50" y1="64" x2="50" y2="80" stroke="#1D4ED8" strokeWidth="2.5" />

      {/* Graduation Mortarboard Rhombus Top */}
      <polygon points="50,18 84,32 50,44 16,32" fill="url(#capGrad)" stroke="#BFDBFE" strokeWidth="1.5" />

      {/* Cap Skull Cap Band underneath */}
      <path d="M30 38V50C30 55 39 58 50 58C61 58 70 55 70 50V38" fill="#1E40AF" stroke="#93C5FD" strokeWidth="1" />

      {/* Gold Tassel Button & String */}
      <circle cx="50" cy="31" r="3" fill="#FACC15" />
      <path d="M50 31L68 40V54" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="65" y="52" width="6" height="8" rx="2" fill="#CA8A04" />
    </g>
  </svg>
);

/**
 * 24. Quy định vi phạm / Kỷ luật / Pháp chế: Cán cân công lý 3D màu xanh & vàng
 */
export const IconLawScales3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldLaw" x1="20" y1="16" x2="80" y2="82" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <filter id="shadowLaw" x="12" y="12" width="76" height="80" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#shadowLaw)">
      {/* 3D Blue Shield Background */}
      <path
        d="M50 16L78 24V48C78 64 66 74 50 82C34 74 22 64 22 48V24L50 16Z"
        fill="url(#shieldLaw)"
        stroke="#93C5FD"
        strokeWidth="2"
      />

      {/* Golden Scales of Justice */}
      {/* Central Pillar */}
      <line x1="50" y1="30" x2="50" y2="66" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="28" r="4" fill="#FDE047" />
      {/* Pillar Base */}
      <rect x="42" y="64" width="16" height="4" rx="2" fill="#EAB308" />

      {/* Horizontal Beam */}
      <line x1="32" y1="36" x2="68" y2="36" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />

      {/* Left Pan */}
      <line x1="32" y1="36" x2="28" y2="48" stroke="#FEF08A" strokeWidth="1.2" />
      <line x1="32" y1="36" x2="36" y2="48" stroke="#FEF08A" strokeWidth="1.2" />
      <path d="M26 48C26 53 38 53 38 48Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />

      {/* Right Pan */}
      <line x1="68" y1="36" x2="64" y2="48" stroke="#FEF08A" strokeWidth="1.2" />
      <line x1="68" y1="36" x2="72" y2="48" stroke="#FEF08A" strokeWidth="1.2" />
      <path d="M62 48C62 53 74 53 74 48Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
    </g>
  </svg>
);

/**
 * 25. Tổng đài CSKH / Hotline 87333: Tai nghe tổng đài viên 3D màu xanh + Micro
 */
export const IconSupportHeadset3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="headsetGrad" x1="20" y1="20" x2="80" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <filter id="shadowSupport" x="12" y="12" width="76" height="76" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowSupport)">
      {/* Headband Arc */}
      <path
        d="M26 50C26 34 37 22 50 22C63 22 74 34 74 50"
        stroke="url(#headsetGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left Earpad */}
      <rect x="20" y="44" width="12" height="22" rx="6" fill="#1D4ED8" stroke="#BFDBFE" strokeWidth="1.5" />
      {/* Right Earpad */}
      <rect x="68" y="44" width="12" height="22" rx="6" fill="#1D4ED8" stroke="#BFDBFE" strokeWidth="1.5" />

      {/* Microphone Boom */}
      <path d="M26 60C26 72 38 76 48 76" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Mic Capsule with Cyan LED */}
      <rect x="46" y="72" width="10" height="8" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
      <circle cx="51" cy="76" r="2" fill="#38BDF8" />
    </g>
  </svg>
);

/**
 * 26. Chương trình khuyến mãi / Quà tặng / Voucher: Hộp quà 3D màu xanh + Nơ vàng
 */
export const IconPromotionGift3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="giftBox" x1="22" y1="36" x2="78" y2="82" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="giftRibbon" x1="22" y1="20" x2="78" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="70%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <filter id="shadowGift" x="12" y="15" width="76" height="75" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowGift)">
      {/* 3D Box Body */}
      <rect x="24" y="44" width="52" height="38" rx="8" fill="url(#giftBox)" stroke="#93C5FD" strokeWidth="1.5" />

      {/* 3D Box Lid */}
      <rect x="20" y="36" width="60" height="12" rx="4" fill="#2563EB" stroke="#BFDBFE" strokeWidth="1.5" />

      {/* Gold Vertical Ribbon */}
      <rect x="46" y="36" width="8" height="46" fill="url(#giftRibbon)" />
      {/* Gold Horizontal Ribbon */}
      <rect x="24" y="58" width="52" height="8" fill="url(#giftRibbon)" />

      {/* Big 3D Bow Knot on Top */}
      <path
        d="M50 36C44 26 34 26 36 32C38 38 48 36 50 36Z"
        fill="url(#giftRibbon)"
        stroke="#CA8A04"
        strokeWidth="1"
      />
      <path
        d="M50 36C56 26 66 26 64 32C62 38 52 36 50 36Z"
        fill="url(#giftRibbon)"
        stroke="#CA8A04"
        strokeWidth="1"
      />
      <circle cx="50" cy="36" r="4.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
    </g>
  </svg>
);

/**
 * 27. Đơn thuốc / Toa thuốc y tế Rx: Kẹp đơn thuốc 3D màu xanh + Ký hiệu Rx & Bút
 */
export const IconPrescriptionRx3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rxGrad" x1="25" y1="18" x2="75" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EFF6FF" />
      </linearGradient>
      <filter id="shadowRx" x="15" y="10" width="70" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowRx)">
      {/* 3D Prescription Paper Document */}
      <rect x="24" y="16" width="52" height="68" rx="8" fill="url(#rxGrad)" stroke="#3B82F6" strokeWidth="2.5" />

      {/* Big Blue 'Rx' Symbol */}
      <text x="32" y="38" fill="#1D4ED8" fontSize="20" fontWeight="900" fontFamily="serif">℞</text>

      {/* Prescription Content Lines */}
      <line x1="32" y1="48" x2="68" y2="48" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="56" x2="62" y2="56" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="64" x2="68" y2="64" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

      {/* Doctor Pen / Signature */}
      <path d="M54 72C58 70 64 74 68 70" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * 28. Bỏ chặn Pop-ups / Trình duyệt Chrome: Cửa sổ trình duyệt 3D màu xanh + Khiên mở khóa
 */
export const IconBrowserPopup3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="browserWindow" x1="18" y1="20" x2="82" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#DBEAFE" />
      </linearGradient>
      <filter id="shadowBrowser" x="10" y="12" width="80" height="76" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowBrowser)">
      {/* 3D Browser Window Frame */}
      <rect x="18" y="20" width="64" height="54" rx="10" fill="url(#browserWindow)" stroke="#3B82F6" strokeWidth="2.5" />
      {/* Browser Tab Bar */}
      <path d="M18 20H82V32H18V20Z" fill="#2563EB" />
      {/* 3 Window Control Dots */}
      <circle cx="26" cy="26" r="2.5" fill="#EF4444" />
      <circle cx="33" cy="26" r="2.5" fill="#F59E0B" />
      <circle cx="40" cy="26" r="2.5" fill="#10B981" />

      {/* Pop-up Window Floating In Front */}
      <rect x="36" y="38" width="40" height="34" rx="6" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
      <rect x="36" y="38" width="40" height="8" rx="2" fill="#60A5FA" />
      {/* Unlocked Pop-up Shield */}
      <circle cx="56" cy="56" r="7" fill="#34D399" />
      <path d="M53 56L55 58L59 54" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * 29. Nhóm trao đổi / Zalo / FPT Chat: Bong bóng chat đối thoại 3D màu xanh
 */
export const IconChatMessages3D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chatBubble1" x1="20" y1="20" x2="70" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="chatBubble2" x1="40" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <filter id="shadowChat" x="12" y="15" width="76" height="75" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowChat)">
      {/* Main Left Bubble */}
      <path
        d="M20 40C20 28 32 20 48 20C64 20 76 28 76 40C76 52 64 60 48 60C44 60 40 59 36 57L24 64L27 53C23 49 20 45 20 40Z"
        fill="url(#chatBubble1)"
        stroke="#93C5FD"
        strokeWidth="1.5"
      />
      {/* 3 Message Dots */}
      <circle cx="38" cy="40" r="3" fill="#FFFFFF" />
      <circle cx="48" cy="40" r="3" fill="#FFFFFF" />
      <circle cx="58" cy="40" r="3" fill="#FFFFFF" />

      {/* Small Right Bubble */}
      <path
        d="M52 54C52 48 58 44 66 44C74 44 80 48 80 54C80 60 74 64 66 64C64 64 62 63.5 60 62.5L54 66L55.5 60.5C53.5 58.5 52 56.5 52 54Z"
        fill="url(#chatBubble2)"
        stroke="#BAE6FD"
        strokeWidth="1"
      />
    </g>
  </svg>
);

/**
 * 30. Google Sheet / Bảng tính / Spreadsheet: Bảng tính 2D màu xanh + Lưới ô tính & Cột hàng
 */
export const IconGoogleSheet2D: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sheetCard" x1="20" y1="16" x2="80" y2="84" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EFF6FF" />
      </linearGradient>
      <linearGradient id="sheetHeader" x1="20" y1="16" x2="80" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <filter id="shadowSheet" x="12" y="10" width="76" height="85" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#shadowSheet)">
      {/* Spreadsheet Base */}
      <rect x="20" y="16" width="60" height="68" rx="10" fill="url(#sheetCard)" stroke="#3B82F6" strokeWidth="2.5" />
      {/* Top Banner Header */}
      <path d="M20 26C20 20.4772 24.4772 16 30 16H70C75.5228 16 80 20.4772 80 26V34H20V26Z" fill="url(#sheetHeader)" />
      {/* Sheet Icon/Title in header */}
      <rect x="28" y="22" width="16" height="6" rx="2" fill="#FFFFFF" />
      <circle cx="72" cy="25" r="3" fill="#60A5FA" />
      {/* Table Grid lines */}
      <rect x="28" y="42" width="44" height="34" rx="4" fill="#F8FAFC" stroke="#93C5FD" strokeWidth="1.5" />
      {/* Columns & rows */}
      <line x1="28" y1="50" x2="72" y2="50" stroke="#BFDBFE" strokeWidth="1" />
      <line x1="28" y1="58" x2="72" y2="58" stroke="#BFDBFE" strokeWidth="1" />
      <line x1="28" y1="66" x2="72" y2="66" stroke="#BFDBFE" strokeWidth="1" />
      <line x1="42" y1="42" x2="42" y2="76" stroke="#BFDBFE" strokeWidth="1" />
      <line x1="56" y1="42" x2="56" y2="76" stroke="#BFDBFE" strokeWidth="1" />
      {/* Highlighted cells */}
      <rect x="43" y="51" width="12" height="6" rx="1" fill="#60A5FA" opacity="0.6" />
      <rect x="57" y="59" width="14" height="6" rx="1" fill="#34D399" opacity="0.7" />
    </g>
  </svg>
);



