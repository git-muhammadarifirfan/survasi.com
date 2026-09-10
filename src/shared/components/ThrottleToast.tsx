/**
 * @module shared/components
 * @description Toast warning melayang untuk notifikasi Throttling / Rate Limit
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const ThrottleToast: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleExceeded = (e: Event) => {
      const customEvt = e as CustomEvent<{ message?: string }>;
      setMessage(
        customEvt.detail?.message ||
          'Terlalu banyak permintaan! Sistem membatasi akses berulang untuk menjaga kestabilan server.'
      );
    };

    window.addEventListener('bsan_rate_limit_exceeded', handleExceeded);
    return () => {
      window.removeEventListener('bsan_rate_limit_exceeded', handleExceeded);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center space-x-3 bg-rose-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-rose-700/80 animate-bounce max-w-md w-full mx-4">
      <ShieldAlert className="w-6 h-6 text-amber-300 shrink-0" />
      <div className="flex-1 text-xs">
        <h5 className="font-bold text-amber-200">Proteksi Server & Rate Limiting</h5>
        <p className="mt-0.5 text-rose-100">{message}</p>
      </div>
      <button
        onClick={() => setMessage(null)}
        className="p-1 text-rose-200 hover:text-white rounded-lg hover:bg-rose-800 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ThrottleToast;
