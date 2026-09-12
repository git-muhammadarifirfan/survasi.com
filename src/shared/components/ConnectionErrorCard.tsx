import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle, ServerOff } from 'lucide-react';

interface ConnectionErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  compact?: boolean;
}

export function ConnectionErrorCard({
  title = 'Gagal Memuat Data',
  message = 'Gagal terhubung ke server.',
  onRetry,
  isRetrying = false,
  className = '',
  compact = false,
}: ConnectionErrorCardProps) {
  const [spinning, setSpinning] = useState(false);

  const handleRetryClick = () => {
    setSpinning(true);
    if (onRetry) {
      onRetry();
    }
    setTimeout(() => setSpinning(false), 1200);
  };

  if (compact) {
    return (
      <div className={`p-5 rounded-2xl bg-surface border border-rose-500/20 shadow-card text-center space-y-3 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mx-auto flex items-center justify-center shadow-xs">
          <WifiOff className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-text-primary">{title}</h4>
          <p className="text-[11px] text-text-secondary mt-0.5 max-w-xs mx-auto leading-relaxed">{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={handleRetryClick}
            disabled={isRetrying || spinning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying || spinning ? 'animate-spin' : ''}`} />
            <span>Coba Lagi</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`p-8 sm:p-12 rounded-3xl bg-surface border border-border shadow-card text-center space-y-5 my-8 sm:my-12 max-w-xl mx-auto animate-fade-in ${className}`}>
      {/* Icon Badge with subtle glowing ring */}
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-rose-500/20 animate-ping opacity-30" />
        <div className="relative w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shadow-sm">
          <WifiOff className="w-8 h-8 stroke-[2]" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-base sm:text-lg font-bold font-display text-text-primary leading-snug">
          {title}
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {message}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={handleRetryClick}
            disabled={isRetrying || spinning}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying || spinning ? 'animate-spin' : ''}`} />
            <span>Coba Muat Ulang Data</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Global Offline Banner component for network disconnection
 */
export function OfflineGlobalBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        setShowRestored(true);
        const timer = setTimeout(() => setShowRestored(false), 4000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [wasOffline]);

  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[999999] bg-rose-600 text-white text-xs font-semibold px-4 py-2 text-center shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
        <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
        <span>Koneksi Internet Terputus. Data atau isian form sementara tidak dapat dikirim.</span>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[999999] bg-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
        <WifiOff className="w-4 h-4 shrink-0 rotate-180" />
        <span>Koneksi Internet Terhubung Kembali!</span>
      </div>
    );
  }

  return null;
}

export default ConnectionErrorCard;
