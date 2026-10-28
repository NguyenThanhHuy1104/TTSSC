import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  className?: string;
  variant?: 'inline' | 'block';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label,
  className = '',
  variant = 'block'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={handleCopy}
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 ${className}`}
        title="Sao chép"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400">Đã sao chép</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Sao chép</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`p-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 ${className}`}>
      {label && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{label}</p>}
      <div className="flex items-center justify-between gap-3">
        <code className="text-xs md:text-sm font-mono text-slate-800 dark:text-slate-200 break-all select-all font-medium bg-white dark:bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex-1">
          {textToCopy}
        </code>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>SAO CHÉP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
