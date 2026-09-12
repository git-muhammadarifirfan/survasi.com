import React from 'react';
import ThreeDotsLoader from './ThreeDotsLoader';
import ConnectionErrorCard from './ConnectionErrorCard';

interface FetchStatusContainerProps {
  isLoading: boolean;
  isError: boolean;
  error?: any;
  loadingText?: string;
  errorTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function FetchStatusContainer({
  isLoading,
  isError,
  error,
  loadingText = 'Memuat data...',
  errorTitle = 'Gagal Memuat Data',
  errorMessage,
  onRetry,
  isRetrying = false,
  children,
  compact = false,
  className = '',
}: FetchStatusContainerProps) {
  if (isLoading) {
    return (
      <div className={`py-12 text-center flex items-center justify-center min-h-[160px] ${className}`}>
        <ThreeDotsLoader text={loadingText} />
      </div>
    );
  }

  if (isError) {
    const finalMsg =
      errorMessage ||
      (typeof error === 'string'
        ? error
        : error?.message ||
          'Sistem tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda atau coba beberapa saat lagi.');

    return (
      <div className={`py-6 px-4 ${className}`}>
        <ConnectionErrorCard
          title={errorTitle}
          message={finalMsg}
          onRetry={onRetry}
          isRetrying={isRetrying}
          compact={compact}
        />
      </div>
    );
  }

  return <>{children}</>;
}

export default FetchStatusContainer;
