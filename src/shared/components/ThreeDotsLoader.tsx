/**
 * @module shared/components
 * @description Komponen Loading 3-Titik Animasi dengan background putih bersih
 */

import React from 'react';

interface ThreeDotsLoaderProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThreeDotsLoader: React.FC<ThreeDotsLoaderProps> = ({
  text = 'Memuat...',
  fullScreen = false,
  size = 'md',
  className = '',
}) => {
  const dotSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4.5 h-4.5',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="flex items-center space-x-2.5">
        <div className={`${dotSizes[size]} bg-indigo-600 rounded-full animate-dot-1 shadow-sm`} />
        <div className={`${dotSizes[size]} bg-indigo-500 rounded-full animate-dot-2 shadow-sm`} />
        <div className={`${dotSizes[size]} bg-indigo-400 rounded-full animate-dot-3 shadow-sm`} />
      </div>
      {text && (
        <span className="text-sm font-semibold text-slate-600 tracking-wide animate-pulse font-sans">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white animate-fade-in transition-all duration-300">
        <div className="flex flex-col items-center space-y-5 p-8 text-center max-w-sm w-full mx-auto">
          <img src="/bsan_logo.png" className="w-16 h-16 object-contain mb-1 drop-shadow-sm animate-pulse" alt="BSAN Logo" />
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ThreeDotsLoader;
