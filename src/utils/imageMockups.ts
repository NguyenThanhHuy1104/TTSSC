// Helper to generate clean, professional UI mockup SVGs for help center guide steps

export function generateStepMockup(config: {
  title: string;
  badgeText?: string;
  fields?: { label: string; value: string; active?: boolean; stepNum?: number }[];
  buttons?: { label: string; primary?: boolean; stepNum?: number }[];
  annotations?: { stepNum: number; text: string; x: number; y: number }[];
  activeStepNumber?: number;
}): string {
  const { title, badgeText = 'SSC System', fields = [], buttons = [], annotations = [], activeStepNumber } = config;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" style="border-radius:10px; background:#f8fafc; font-family: system-ui, -apple-system, sans-serif;">
      <!-- Window Frame -->
      <rect width="800" height="450" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- Header Bar -->
      <path d="M0 10 C0 4.477 4.477 0 10 0 L790 0 C795.523 0 800 4.477 800 10 L800 44 L0 44 Z" fill="#1e293b"/>
      <!-- Window Controls -->
      <circle cx="20" cy="22" r="6" fill="#ef4444"/>
      <circle cx="38" cy="22" r="6" fill="#f59e0b"/>
      <circle cx="56" cy="22" r="6" fill="#10b981"/>
      <text x="80" y="27" fill="#94a3b8" font-size="13" font-weight="500">https://ar.frt.vn/portal/app</text>

      <!-- App Sub-header -->
      <rect x="0" y="44" width="800" height="50" fill="#2563eb"/>
      <text x="24" y="75" fill="#ffffff" font-size="18" font-weight="700">${title}</text>
      <rect x="680" y="58" width="96" height="24" rx="12" fill="#ffffff" fill-opacity="0.2"/>
      <text x="728" y="74" fill="#ffffff" font-size="11" font-weight="600" text-anchor="middle">${badgeText}</text>

      <!-- Content Layout -->
      <!-- Left Sidebar Mock -->
      <rect x="16" y="110" width="180" height="320" rx="8" fill="#f1f5f9"/>
      <rect x="28" y="126" width="120" height="12" rx="3" fill="#cbd5e1"/>
      <rect x="28" y="152" width="140" height="28" rx="6" fill="${activeStepNumber === 1 ? '#dbeafe' : '#e2e8f0'}" stroke="${activeStepNumber === 1 ? '#2563eb' : 'transparent'}" stroke-width="1.5"/>
      <text x="40" y="170" fill="${activeStepNumber === 1 ? '#1d4ed8' : '#475569'}" font-size="12" font-weight="600">① Quản lý hóa đơn</text>
      <rect x="28" y="188" width="140" height="28" rx="6" fill="#e2e8f0"/>
      <text x="40" y="206" fill="#475569" font-size="12">Tra cứu đơn hàng</text>
      <rect x="28" y="224" width="140" height="28" rx="6" fill="#e2e8f0"/>
      <text x="40" y="242" fill="#475569" font-size="12">Báo cáo tài chính</text>

      <!-- Main Workspace -->
      <rect x="212" y="110" width="572" height="320" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>

      <!-- Form Inputs -->
      ${fields
        .map((field, idx) => {
          const yPos = 135 + idx * 58;
          const isHighlight = field.stepNum && field.stepNum === activeStepNumber;
          return `
          <text x="232" y="${yPos}" fill="#334155" font-size="13" font-weight="600">${field.label}</text>
          <rect x="232" y="${yPos + 8}" width="360" height="34" rx="6" fill="${field.active ? '#eff6ff' : '#f8fafc'}" stroke="${isHighlight ? '#ef4444' : field.active ? '#3b82f6' : '#cbd5e1'}" stroke-width="${isHighlight ? '2.5' : '1.5'}"/>
          <text x="244" y="${yPos + 30}" fill="${field.value ? '#0f172a' : '#94a3b8'}" font-size="13">${field.value || 'Nhập thông tin...'}</text>
          ${
            field.stepNum
              ? `
            <circle cx="610" cy="${yPos + 25}" r="14" fill="#ef4444"/>
            <text x="610" y="${yPos + 30}" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">${field.stepNum}</text>
          `
              : ''
          }
        `;
        })
        .join('')}

      <!-- Action Buttons -->
      <g transform="translate(232, 365)">
        ${buttons
          .map((btn, idx) => {
            const xPos = idx * 140;
            const isHighlight = btn.stepNum && btn.stepNum === activeStepNumber;
            return `
            <rect x="${xPos}" y="0" width="125" height="38" rx="6" fill="${btn.primary ? '#2563eb' : '#e2e8f0'}" stroke="${isHighlight ? '#ef4444' : 'transparent'}" stroke-width="${isHighlight ? '3' : '0'}"/>
            <text x="${xPos + 62}" y="24" fill="${btn.primary ? '#ffffff' : '#334155'}" font-size="13" font-weight="600" text-anchor="middle">${btn.label}</text>
            ${
              btn.stepNum
                ? `
              <circle cx="${xPos + 125}" cy="-5" r="12" fill="#ef4444"/>
              <text x="${xPos + 125}" y="-1" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">${btn.stepNum}</text>
            `
                : ''
            }
          `;
          })
          .join('')}
      </g>

      <!-- Annotations / Callouts -->
      ${annotations
        .map(
          ann => `
        <g transform="translate(${ann.x}, ${ann.y})">
          <circle cx="0" cy="0" r="16" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
          <text x="0" y="5" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">${ann.stepNum}</text>
          <rect x="24" y="-14" width="${ann.text.length * 8 + 16}" height="28" rx="6" fill="#1e293b" opacity="0.9"/>
          <text x="32" y="4" fill="#ffffff" font-size="12" font-weight="600">${ann.text}</text>
        </g>
      `
        )
        .join('')}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
