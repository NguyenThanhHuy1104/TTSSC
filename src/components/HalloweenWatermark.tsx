import React from 'react';

export const HalloweenWatermark: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* Top-Left Spiderweb Watermark */}
      <svg
        className="absolute top-0 left-0 w-44 h-44 sm:w-64 sm:h-64 text-orange-500/15 dark:text-orange-400/15"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M0 0 L200 40 M0 0 L180 100 M0 0 L140 155 M0 0 L90 190 M0 0 L35 200"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M40 8 Q36 22 28 31 Q18 38 7 40"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M80 16 Q72 44 56 62 Q36 76 14 80"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M120 24 Q108 66 84 93 Q54 114 21 120"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M160 32 Q144 88 112 124 Q72 152 28 160"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* Top-Right Spiderweb Watermark */}
      <svg
        className="absolute top-0 right-0 w-44 h-44 sm:w-64 sm:h-64 text-orange-500/15 dark:text-orange-400/15 -scale-x-100"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M0 0 L200 40 M0 0 L180 100 M0 0 L140 155 M0 0 L90 190 M0 0 L35 200"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M40 8 Q36 22 28 31 Q18 38 7 40"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M80 16 Q72 44 56 62 Q36 76 14 80"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M120 24 Q108 66 84 93 Q54 114 21 120"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M160 32 Q144 88 112 124 Q72 152 28 160"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* Center Diagonal Halloween Text & Bats Watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="-rotate-12 flex flex-col items-center gap-2 opacity-[0.055] dark:opacity-[0.07]">
          <span className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.2em] uppercase text-orange-600 dark:text-orange-400 whitespace-nowrap">
            🎃 HALLOWEEN 🎃
          </span>
          <span className="text-xl sm:text-3xl font-extrabold tracking-[0.35em] uppercase text-amber-600 dark:text-amber-400">
            SSC • 87333
          </span>
        </div>
      </div>

      {/* Floating Bats */}
      <svg
        className="absolute top-16 left-[18%] w-16 h-10 sm:w-24 sm:h-14 text-orange-600/20 dark:text-orange-400/20 -rotate-12"
        viewBox="0 0 120 60"
        fill="currentColor"
      >
        <path d="M60 22 C55 12, 48 12, 46 20 C32 8, 12 12, 2 28 C16 26, 26 32, 32 42 C40 34, 48 36, 60 48 C72 36, 80 34, 88 42 C94 32, 104 26, 118 28 C108 12, 88 8, 74 20 C72 12, 65 12, 60 22 Z" />
      </svg>

      <svg
        className="absolute top-24 right-[16%] w-14 h-9 sm:w-20 sm:h-12 text-orange-600/20 dark:text-orange-400/20 rotate-12"
        viewBox="0 0 120 60"
        fill="currentColor"
      >
        <path d="M60 22 C55 12, 48 12, 46 20 C32 8, 12 12, 2 28 C16 26, 26 32, 32 42 C40 34, 48 36, 60 48 C72 36, 80 34, 88 42 C94 32, 104 26, 118 28 C108 12, 88 8, 74 20 C72 12, 65 12, 60 22 Z" />
      </svg>

      {/* ============================================================
          QUẢ BÍ NGÔ TO SỐ 1 (BÊN TRÁI - GIANT JACK-O'-LANTERN #1)
         ============================================================ */}
      <div className="absolute -bottom-8 -left-8 sm:bottom-2 sm:left-2 opacity-25 dark:opacity-30 transition-opacity">
        <svg
          className="w-60 h-60 sm:w-80 sm:h-80 md:w-96 md:h-96 drop-shadow-[0_0_35px_rgba(249,115,22,0.45)]"
          viewBox="0 0 300 300"
          fill="none"
        >
          <defs>
            <radialGradient id="pumpkinGlowLeft" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="65%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>
            <linearGradient id="eyeGlowLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          <g transform="rotate(-8 150 160)">
            {/* Curly Vine */}
            <path
              d="M162 55 C185 35, 210 50, 200 70 C192 85, 175 72, 185 60"
              stroke="#15803d"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Pumpkin Stem */}
            <path
              d="M136 68 C132 38, 148 20, 168 18 C175 18, 178 26, 170 34 C158 44, 158 56, 162 68 Z"
              fill="#166534"
              stroke="#14532d"
              strokeWidth="3"
            />

            {/* Outer Left & Right Ribs */}
            <ellipse
              cx="82"
              cy="170"
              rx="58"
              ry="88"
              fill="url(#pumpkinGlowLeft)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />
            <ellipse
              cx="218"
              cy="170"
              rx="58"
              ry="88"
              fill="url(#pumpkinGlowLeft)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />

            {/* Mid Left & Right Ribs */}
            <ellipse
              cx="112"
              cy="172"
              rx="56"
              ry="94"
              fill="url(#pumpkinGlowLeft)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />
            <ellipse
              cx="188"
              cy="172"
              rx="56"
              ry="94"
              fill="url(#pumpkinGlowLeft)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />

            {/* Center Main Rib */}
            <ellipse
              cx="150"
              cy="174"
              rx="54"
              ry="97"
              fill="url(#pumpkinGlowLeft)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />

            {/* Left Triangle Eye */}
            <polygon
              points="102,115 72,155 124,152"
              fill="url(#eyeGlowLeft)"
              stroke="#431407"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Right Triangle Eye */}
            <polygon
              points="198,115 176,152 228,155"
              fill="url(#eyeGlowLeft)"
              stroke="#431407"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Triangle Nose */}
            <polygon
              points="150,148 134,174 166,174"
              fill="url(#eyeGlowLeft)"
              stroke="#431407"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Big Carved Jack-o'-lantern Grin with Teeth */}
            <path
              d="M68 188 L98 205 L110 190 L132 206 L150 206 L168 206 L190 190 L202 205 L232 188 L216 232 L186 222 L174 240 L126 240 L114 222 L84 232 Z"
              fill="url(#eyeGlowLeft)"
              stroke="#431407"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {/* ============================================================
          QUẢ BÍ NGÔ TO SỐ 2 (BÊN PHẢI - GIANT JACK-O'-LANTERN #2)
         ============================================================ */}
      <div className="absolute -bottom-8 -right-8 sm:bottom-2 sm:right-2 opacity-25 dark:opacity-30 transition-opacity">
        <svg
          className="w-60 h-60 sm:w-80 sm:h-80 md:w-96 md:h-96 drop-shadow-[0_0_35px_rgba(249,115,22,0.45)]"
          viewBox="0 0 300 300"
          fill="none"
        >
          <defs>
            <radialGradient id="pumpkinGlowRight" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="65%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>
            <linearGradient id="eyeGlowRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          <g transform="rotate(8 150 160)">
            {/* Curly Vine */}
            <path
              d="M138 55 C115 35, 90 50, 100 70 C108 85, 125 72, 115 60"
              stroke="#15803d"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Pumpkin Stem */}
            <path
              d="M164 68 C168 38, 152 20, 132 18 C125 18, 122 26, 130 34 C142 44, 142 56, 138 68 Z"
              fill="#166534"
              stroke="#14532d"
              strokeWidth="3"
            />

            {/* Outer Left & Right Ribs */}
            <ellipse
              cx="82"
              cy="170"
              rx="58"
              ry="88"
              fill="url(#pumpkinGlowRight)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />
            <ellipse
              cx="218"
              cy="170"
              rx="58"
              ry="88"
              fill="url(#pumpkinGlowRight)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />

            {/* Mid Left & Right Ribs */}
            <ellipse
              cx="112"
              cy="172"
              rx="56"
              ry="94"
              fill="url(#pumpkinGlowRight)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />
            <ellipse
              cx="188"
              cy="172"
              rx="56"
              ry="94"
              fill="url(#pumpkinGlowRight)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />

            {/* Center Main Rib */}
            <ellipse
              cx="150"
              cy="174"
              rx="54"
              ry="97"
              fill="url(#pumpkinGlowRight)"
              stroke="#7c2d12"
              strokeWidth="3.5"
            />

            {/* Left Mischievous Eye */}
            <polygon
              points="96,112 70,152 126,148"
              fill="url(#eyeGlowRight)"
              stroke="#431407"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Right Mischievous Eye */}
            <polygon
              points="204,112 174,148 230,152"
              fill="url(#eyeGlowRight)"
              stroke="#431407"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Triangle Nose */}
            <polygon
              points="150,146 134,172 166,172"
              fill="url(#eyeGlowRight)"
              stroke="#431407"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Wide Spooky Smile */}
            <path
              d="M66 184 C90 208, 118 214, 150 214 C182 214, 210 208, 234 184 L220 228 L195 218 L182 238 L150 232 L118 238 L105 218 L80 228 Z"
              fill="url(#eyeGlowRight)"
              stroke="#431407"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};
