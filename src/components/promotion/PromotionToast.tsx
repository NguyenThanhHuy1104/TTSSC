import React from 'react';
import { ToastNotification } from '../../types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toast: ToastNotification | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-800 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
