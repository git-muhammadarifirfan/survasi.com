/**
 * @module shared/components
 * @description Komponen Loading 3-Titik Animasi dengan teks Memuat...
 */

import React from 'react';

interface ThreeDotsLoaderProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThreeDotsLoader: React.FC<ThreeDotsLoaderProps> = ({
  text = 'Memuat Data...',
  fullScreen = false,
  size = 'md',
  className = '',
}) => {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center p-6 space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`${dotSizes[size]} bg-indigo-600 rounded-full animate-dot-1 shadow-sm`} />
        <div className={`${dotSizes[size]} bg-indigo-500 rounded-full animate-dot-2 shadow-sm`} />
        <div className={`${dotSizes[size]} bg-indigo-400 rounded-full animate-dot-3 shadow-sm`} />
      </div>
      {text && (
        <span className="text-sm font-medium text-slate-500 tracking-wide animate-pulse">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-xs">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 min-w-[200px] text-center">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ThreeDotsLoader;
