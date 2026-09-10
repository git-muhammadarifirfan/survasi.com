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
    lg: 'w-4 h-4',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3.5 ${className}`}>
      <div className="flex items-center space-x-2.5">
        <div className={`${dotSizes[size]} bg-indigo-600 rounded-full animate-dot-1 shadow-sm`} />
        <div className={`${dotSizes[size]} bg-indigo-500 rounded-full animate-dot-2 shadow-sm`} />
        <div className={`${dotSizes[size]} bg-indigo-400 rounded-full animate-dot-3 shadow-sm`} />
      </div>
      {text && (
        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase animate-pulse font-sans">
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
