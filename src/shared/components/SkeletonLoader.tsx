/**
 * @module shared/components
 * @description Komponen Skeleton Loader untuk memuat status placeholder UI
 */

import React from 'react';

interface SkeletonProps {
  type?: 'card' | 'table' | 'chart' | 'list' | 'text' | 'form';
  count?: number;
  height?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  type = 'card',
  count = 1,
  height,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 rounded-md skeleton-shimmer" />
              <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
            </div>
            <div className="w-32 h-8 rounded-lg skeleton-shimmer" />
            <div className="w-20 h-3 rounded-md skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs ${className}`}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="w-40 h-5 rounded-md skeleton-shimmer" />
          <div className="w-24 h-8 rounded-lg skeleton-shimmer" />
        </div>
        <div className="p-4 space-y-3">
          {items.map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-2 border-b border-slate-50">
              <div className="w-12 h-4 rounded-md skeleton-shimmer" />
              <div className="flex-1 h-4 rounded-md skeleton-shimmer" />
              <div className="w-24 h-4 rounded-md skeleton-shimmer" />
              <div className="w-16 h-6 rounded-full skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <div className="w-36 h-5 rounded-md skeleton-shimmer" />
          <div className="w-20 h-4 rounded-md skeleton-shimmer" />
        </div>
        <div className={`${height || 'h-64'} w-full rounded-xl skeleton-shimmer`} />
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 ${className}`}>
        <div className="w-48 h-6 rounded-md skeleton-shimmer" />
        <div className="space-y-4">
          {items.map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="w-32 h-4 rounded-md skeleton-shimmer" />
              <div className="w-full h-11 rounded-xl skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className={`w-full ${height || 'h-4'} rounded-md skeleton-shimmer`} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
