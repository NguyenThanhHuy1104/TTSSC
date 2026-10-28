import React from 'react';
import { Info, AlertTriangle, AlertOctagon, CheckCircle2, ExternalLink } from 'lucide-react';
import { GuideNotice } from '../types';

interface NoticeBoxProps {
  notice: GuideNotice;
}

export const NoticeBox: React.FC<NoticeBoxProps> = ({ notice }) => {
  const { type, title, content, actionUrl, actionLabel } = notice;

  const config = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-50/80 dark:bg-blue-950/40',
      borderColor: 'border-blue-300 dark:border-blue-800',
      textColor: 'text-blue-900 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      defaultTitle: 'Thông tin'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50/80 dark:bg-amber-950/40',
      borderColor: 'border-amber-300 dark:border-amber-800',
      textColor: 'text-amber-900 dark:text-amber-200',
      iconColor: 'text-amber-600 dark:text-amber-400',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      defaultTitle: 'Lưu ý'
    },
    danger: {
      icon: AlertOctagon,
      bgColor: 'bg-rose-50/80 dark:bg-rose-950/40',
      borderColor: 'border-rose-300 dark:border-rose-800',
      textColor: 'text-rose-900 dark:text-rose-200',
      iconColor: 'text-rose-600 dark:text-rose-400',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
      defaultTitle: 'Cảnh báo'
    },
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-300 dark:border-emerald-800',
      textColor: 'text-emerald-900 dark:text-emerald-200',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      defaultTitle: 'Hoàn tất'
    }
  };

  const currentConfig = config[type] || config.info;
  const IconComponent = currentConfig.icon;

  return (
    <div className={`my-4 p-4 rounded-xl border ${currentConfig.bgColor} ${currentConfig.borderColor} transition-all duration-200`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 mt-0.5 shrink-0 ${currentConfig.iconColor}`} />
        <div className="flex-1">
          <h4 className={`font-semibold text-sm mb-1 ${currentConfig.textColor}`}>
            {title || currentConfig.defaultTitle}
          </h4>
          <p className={`text-sm leading-relaxed ${currentConfig.textColor} opacity-90`}>
            {content}
          </p>
          {actionUrl && (
            <div className="mt-3">
              <a
                href={actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all shadow-xs hover:shadow-md ${currentConfig.btnBg}`}
              >
                <span>{actionLabel || 'Xem hướng dẫn ↗'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
