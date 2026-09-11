import React from 'react';

interface ThreeDotsLoaderProps {
  text?: string;
  fullScreen?: boolean;
  type?: 'line-spinner' | 'line-simple' | 'dot-circle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThreeDotsLoader: React.FC<ThreeDotsLoaderProps> = ({
  text = 'Memuat...',
  fullScreen = false,
  type = 'line-spinner',
  size = 'md',
  className = '',
}) => {
  const spinnerSizes = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size];

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {type === 'line-spinner' && (
        <svg
          className={`animate-spin text-indigo-600 ${spinnerSizes}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {type === 'line-simple' && (
        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/60">
          <div className="w-1/2 h-full bg-indigo-600 rounded-full animate-[shimmer_1.5s_infinite]" />
        </div>
      )}

      {type === 'dot-circle' && (
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s] shadow-xs" />
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s] shadow-xs" />
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-400 animate-bounce shadow-xs" />
        </div>
      )}

      {text && (
        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase font-sans">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white transition-opacity duration-300 ease-in-out">
        {content}
      </div>
    );
  }

  return content;
};

export default ThreeDotsLoader;
