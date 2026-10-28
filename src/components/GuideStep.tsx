import React from 'react';
import { ExternalLink, Maximize2 } from 'lucide-react';
import { GuideStep as GuideStepType } from '../types';
import { NoticeBox } from './NoticeBox';
import { CopyButton } from './CopyButton';
import { VideoPlayer } from './VideoPlayer';

interface GuideStepProps {
  step: GuideStepType;
  stepIndex: number;
  onImageClick?: (imageUrl: string, caption?: string, stepTitle?: string) => void;
}

export const GuideStep: React.FC<GuideStepProps> = ({
  step,
  stepIndex,
  onImageClick
}) => {
  // Simple Markdown-like renderer for list items / bold text in content
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return null;
          // Strip any stray asterisks
          const cleanLine = line.replace(/\*/g, '');
          const trimmed = cleanLine.trim();
          if (trimmed.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-blue-500 dark:text-blue-400 font-bold mt-1">•</span>
                <span>{trimmed.substring(2)}</span>
              </div>
            );
          }
          return <p key={idx}>{cleanLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div
      id={`step-${step.id}`}
      className="scroll-mt-28 mb-10 p-5 md:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:border-blue-200 dark:hover:border-blue-900/50"
    >
      {/* Header Title */}
      <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {step.title}
        </h2>
      </div>

      {/* Main Step Content */}
      <div>
        {renderFormattedContent(step.content)}

        {/* Action Link Button if present */}
        {step.actionUrl && (
          <div className="my-4">
            <a
              href={step.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm shadow-sm transition-all hover:shadow-md cursor-pointer group"
            >
              <span>{step.actionLabel || 'MỞ HỆ THỐNG ↗'}</span>
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        )}

        {/* Copyable snippet if present */}
        {step.copyableText && (
          <CopyButton textToCopy={step.copyableText} label={step.copyableLabel} />
        )}

        {/* Notice callout box if present */}
        {step.notice && <NoticeBox notice={step.notice} />}

        {/* Step Image with Lightbox Zoom trigger */}
        {step.image && (
          <div className="my-5">
            <div
              onClick={() => onImageClick && onImageClick(step.image!, step.imageCaption, step.title)}
              className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={step.image}
                alt={step.imageCaption || step.title}
                className="w-full h-auto max-h-[480px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs md:text-sm backdrop-blur-[2px]">
                <Maximize2 className="w-5 h-5" />
                <span>Phóng to ảnh</span>
              </div>
            </div>
            {step.imageCaption && (
              <p className="mt-2 text-center text-xs md:text-sm text-slate-500 dark:text-slate-400 italic">
                {step.imageCaption}
              </p>
            )}
          </div>
        )}

        {/* Step Specific Video Player if present */}
        {step.videoUrl && (
          <VideoPlayer
            url={step.videoUrl}
            title={`Video thao tác mẫu - Bước ${stepIndex + 1}`}
            compact
          />
        )}
      </div>
    </div>
  );
};
