import React from 'react';

interface ZaloIconProps {
  className?: string;
}

/**
 * Official Zalo Brand Icon
 * Vivid blue rounded background with crisp white Zalo logotype
 */
export const ZaloIcon: React.FC<ZaloIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Blue background with rounded corners */}
    <rect width="48" height="48" rx="11" fill="#0068FF" />

    {/* Zalo white text logo */}
    <g fill="#FFFFFF">
      {/* 'Z' */}
      <path
        d="M11 17.5C11 16.67 11.67 16 12.5 16H22.5C23.33 16 24 16.67 24 17.5C24 18.05 23.7 18.55 23.23 18.82L16.2 24.5H22.5C23.33 24.5 24 25.17 24 26C24 26.83 23.33 27.5 22.5 27.5H12.5C11.67 27.5 11 26.83 11 26C11 25.45 11.3 24.95 11.77 24.68L18.8 19H12.5C11.67 19 11 18.33 11 17.5Z"
      />
      {/* 'a' */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.5 20C26.57 20 25 21.57 25 23.5C25 25.43 26.57 27 28.5 27C29.6 27 30.55 26.5 31.15 25.7V26.25C31.15 26.94 31.71 27.5 32.4 27.5C33.09 27.5 33.65 26.94 33.65 26.25V21.25C33.65 20.56 33.09 20 32.4 20C31.71 20 31.15 20.56 31.15 21.25V21.3C30.55 20.5 29.6 20 28.5 20ZM28.5 22C29.6 22 30.5 22.9 30.5 24C30.5 25.1 29.6 26 28.5 26C27.4 26 26.5 25.1 26.5 24C26.5 22.9 27.4 22 28.5 22Z"
      />
      {/* 'l' */}
      <path
        d="M36 16.5C36 15.67 36.67 15 37.5 15C38.33 15 39 15.67 39 16.5V26C39 26.83 38.33 27.5 37.5 27.5C36.67 27.5 36 26.83 36 26V16.5Z"
      />
      {/* 'o' */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M44 23.5C44 21.57 42.43 20 40.5 20C38.57 20 37 21.57 37 23.5C37 25.43 38.57 27 40.5 27C42.43 27 44 25.43 44 23.5ZM40.5 22C41.6 22 42.5 22.9 42.5 24C42.5 25.1 41.6 26 40.5 26C39.4 26 38.5 25.1 38.5 24C38.5 22.9 39.4 22 40.5 22Z"
      />
    </g>
  </svg>
);
