import React, { useState, useEffect } from 'react';
import { List, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { GuideStep } from '../types';

interface TableOfContentsProps {
  steps: GuideStep[];
  activeStepId?: string;
  onSelectStep: (stepId: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  steps,
  activeStepId,
  onSelectStep
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <>
      {/* Mobile Collapsible TOC Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          type="button"
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs font-semibold text-sm text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>NỘI DUNG MỤC LỤC ({steps.length} BƯỚC)</span>
          </div>
          {isOpenMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpenMobile && (
          <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {steps.map((step, idx) => {
              const isActive = activeStepId === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    onSelectStep(step.id);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate pr-2">
                    {idx + 1}. {step.title}
                  </span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Sticky Sidebar TOC */}
      <div className="hidden lg:block sticky top-24 w-72 shrink-0 self-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs tracking-wider uppercase">
          <List className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Mục lục bài viết</span>
        </div>

        <div className="space-y-1">
          {steps.map((step, idx) => {
            const isActive = activeStepId === step.id;
            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs leading-snug transition-all flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800/80 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
