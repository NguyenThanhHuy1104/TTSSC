import React from 'react';
import { Play, Clock, Video } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  duration?: string;
  description?: string;
  compact?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title = 'Video hướng dẫn thao tác chi tiết',
  duration,
  description,
  compact = false
}) => {
  // Helper to get embeddable iframe URL for youtube or standard video tag
  const getEmbedUrl = (rawUrl: string) => {
    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = rawUrl.match(regExp);
      const id = match && match[2].length === 11 ? match[2] : null;
      return id ? `https://www.youtube.com/embed/${id}` : rawUrl;
    }
    return rawUrl;
  };

  const isIframeEmbed = url.includes('youtube.com') || url.includes('vimeo.com') || url.includes('embed');
  const embedUrl = getEmbedUrl(url);

  return (
    <div className={`my-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${compact ? 'p-3' : 'p-4 md:p-6'}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold text-sm md:text-base">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Video className="w-4 h-4" />
          </div>
          <h3>{title}</h3>
        </div>
        {duration && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" />
            {duration}
          </span>
        )}
      </div>

      {/* Responsive 16:9 Aspect Ratio Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
        {isIframeEmbed ? (
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video controls className="w-full h-full object-contain">
            <source src={url} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        )}
      </div>

      {description && (
        <p className="mt-3 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
