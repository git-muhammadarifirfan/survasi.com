import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface ToastItem {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // in milliseconds
}

let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toastMemoryState: ToastItem[] = [];

export function notifyToast(toast: Omit<ToastItem, 'id'>) {
  const duration = toast.duration || 3500;

  // Deduplicate: If identical title & message already exists, avoid pushing duplicate box
  const existingIdx = toastMemoryState.findIndex(
    (t) => t.title === toast.title && (t.message === toast.message || !toast.message)
  );

  if (existingIdx !== -1) {
    // Refresh existing toast and move to top without creating duplicate cards
    const updated = [...toastMemoryState];
    const existing = updated.splice(existingIdx, 1)[0];
    toastMemoryState = [{ ...existing, duration }, ...updated].slice(0, 2);
  } else {
    const id = Math.random().toString(36).substring(2, 9);
    const newItem: ToastItem = { ...toast, id, duration };
    // Cap at max 2 active toasts to prevent screen clutter
    toastMemoryState = [newItem, ...toastMemoryState].slice(0, 2);
  }

  toastListeners.forEach((listener) => listener([...toastMemoryState]));
}

export function clearAllToasts() {
  toastMemoryState = [];
  toastListeners.forEach((listener) => listener([]));
}

export default function NotificationToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [pausedIds, setPausedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handler = (newToasts: ToastItem[]) => setToasts(newToasts);
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handler);
    };
  }, []);

  const removeToast = (id: string) => {
    toastMemoryState = toastMemoryState.filter((t) => t.id !== id);
    setToasts([...toastMemoryState]);
  };

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Timer & Progress logic per toast
  useEffect(() => {
    if (toasts.length === 0) return;

    const interval = setInterval(() => {
      setToasts((currentToasts) => {
        let hasChanges = false;
        const nextToasts = currentToasts.filter((t) => {
          if (pausedIds[t.id]) return true;
          const currentProg = progresses[t.id] ?? 100;
          const step = (100 / (t.duration || 5000)) * 100; // 100ms interval
          const nextProg = currentProg - step;

          if (nextProg <= 0) {
            hasChanges = true;
            toastMemoryState = toastMemoryState.filter((item) => item.id !== t.id);
            return false;
          }

          setProgresses((prev) => ({ ...prev, [t.id]: nextProg }));
          return true;
        });

        return hasChanges ? nextToasts : currentToasts;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [toasts, pausedIds, progresses]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const type = toast.type || 'success';
        const isCollapsed = collapsedIds[toast.id];
        const isPaused = pausedIds[toast.id];
        const progress = progresses[toast.id] ?? 100;
        const secondsLeft = Math.ceil(((toast.duration || 5000) * (progress / 100)) / 1000);

        const typeStyles = {
          success: {
            bgIcon: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            badge: 'bg-emerald-500 text-white',
            bar: 'bg-emerald-500',
            border: 'border-emerald-200/80',
            Icon: CheckCircle2,
            badgeText: 'BERHASIL',
          },
          error: {
            bgIcon: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
            badge: 'bg-rose-500 text-white',
            bar: 'bg-rose-500',
            border: 'border-rose-200/80',
            Icon: XCircle,
            badgeText: 'GAGAL',
          },
          warning: {
            bgIcon: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            badge: 'bg-amber-500 text-white',
            bar: 'bg-amber-500',
            border: 'border-amber-200/80',
            Icon: AlertTriangle,
            badgeText: 'PERHATIAN',
          },
          info: {
            bgIcon: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
            badge: 'bg-indigo-500 text-white',
            bar: 'bg-indigo-500',
            border: 'border-indigo-200/80',
            Icon: Info,
            badgeText: 'INFORMASI',
          },
        }[type];

        const IconComponent = typeStyles.Icon;

        return (
          <div
            key={toast.id}
            onMouseEnter={() => setPausedIds((p) => ({ ...p, [toast.id]: true }))}
            onMouseLeave={() => setPausedIds((p) => ({ ...p, [toast.id]: false }))}
            className={`pointer-events-auto w-full bg-white rounded-2xl border ${typeStyles.border} shadow-2xl shadow-slate-900/15 overflow-hidden transition-all duration-300 animate-in slide-in-from-top-4 fade-in duration-200`}
          >
            {/* Header / Main Row */}
            <div className="p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2.5 rounded-2xl border shrink-0 ${typeStyles.bgIcon}`}>
                  <IconComponent className="w-5 h-5 stroke-[2.25]" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${typeStyles.badge}`}>
                      {typeStyles.badgeText}
                    </span>
                  </div>
                  <h4 className="text-xs md:text-sm font-bold text-slate-900 leading-tight">
                    {toast.title}
                  </h4>
                  {toast.message && !isCollapsed && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {toast.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                <button
                  type="button"
                  onClick={() => toggleCollapse(toast.id)}
                  className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title={isCollapsed ? 'Perluas' : 'Sembunyikan detail'}
                >
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collapsible Detail & Progress Banner */}
            {!isCollapsed && (
              <div className="px-4 pb-2.5 pt-1 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-500">
                <span>
                  Otomatis menutup <strong>{secondsLeft}s</strong>.{' '}
                  <button
                    type="button"
                    onClick={() => setPausedIds((p) => ({ ...p, [toast.id]: !p[toast.id] }))}
                    className="font-bold text-slate-700 hover:underline cursor-pointer"
                  >
                    {isPaused ? 'Lanjutkan' : 'Tahan'}
                  </button>
                </span>
              </div>
            )}

            {/* Bottom Progress Bar */}
            <div className="w-full bg-slate-100 h-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ease-linear ${typeStyles.bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
