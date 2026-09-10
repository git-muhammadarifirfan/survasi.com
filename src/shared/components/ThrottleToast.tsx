/**
 * @module shared/components
 * @description Toast melayang untuk notifikasi Throttling, Rate Limit, Login/Logout & Akses Sistem
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastPayload {
  type: ToastType;
  title: string;
  message: string;
}

/**
 * Dispatch helper untuk memunculkan notifikasi Toast dari mana saja
 */
export function notifyToast(payload: ToastPayload) {
  window.dispatchEvent(
    new CustomEvent('bsan_toast_notify', {
      detail: payload,
    })
  );
}

export const ThrottleToast: React.FC = () => {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    // Listener Rate Limit
    const handleExceeded = (e: Event) => {
      const customEvt = e as CustomEvent<{ message?: string }>;
      setToast({
        type: 'warning',
        title: 'Proteksi Server & Rate Limiting',
        message:
          customEvt.detail?.message ||
          'Terlalu banyak permintaan! Sistem membatasi akses berulang untuk menjaga kestabilan server.',
      });
    };

    // Listener Toast Umum (Login, Logout, Switch Role)
    const handleNotify = (e: Event) => {
      const customEvt = e as CustomEvent<ToastPayload>;
      if (customEvt.detail) {
        setToast(customEvt.detail);
      }
    };

    window.addEventListener('bsan_rate_limit_exceeded', handleExceeded);
    window.addEventListener('bsan_toast_notify', handleNotify);

    return () => {
      window.removeEventListener('bsan_rate_limit_exceeded', handleExceeded);
      window.removeEventListener('bsan_toast_notify', handleNotify);
    };
  }, []);

  // Auto-dismiss setelah 4 detik
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-950/90 text-white border-emerald-500/40',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      titleColor: 'text-emerald-300',
    },
    info: {
      bg: 'bg-indigo-950/90 text-white border-indigo-500/40',
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
      titleColor: 'text-indigo-300',
    },
    warning: {
      bg: 'bg-amber-950/90 text-white border-amber-500/40',
      icon: <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />,
      titleColor: 'text-amber-300',
    },
    error: {
      bg: 'bg-rose-950/90 text-white border-rose-500/40',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
      titleColor: 'text-rose-300',
    },
  }[toast.type];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border animate-scale-in max-w-md w-full mx-4 transition-all duration-300">
      <div className={`flex items-center space-x-3 w-full p-4 rounded-2xl ${styles.bg} border shadow-2xl`}>
        {styles.icon}
        <div className="flex-1 text-xs">
          <h5 className={`font-bold ${styles.titleColor}`}>{toast.title}</h5>
          <p className="mt-0.5 text-slate-200">{toast.message}</p>
        </div>
        <button
          onClick={() => setToast(null)}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ThrottleToast;
