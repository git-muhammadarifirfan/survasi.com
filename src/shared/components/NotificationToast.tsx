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
  const id = Math.random().toString(36).substring(2, 9);
  const newItem: ToastItem = { ...toast, id, duration: toast.duration || 5000 };
  toastMemoryState = [newItem, ...toastMemoryState];
  toastListeners.forEach((listener) => listener([...toastMemoryState]));
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
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const type = toast.type || 'success';
        const isCollapsed = collapsedIds[toast.id];
        const isPaused = pausedIds[toast.id];
        const progress = progresses[toast.id] ?? 100;
        const secondsLeft = Math.ceil(((toast.duration || 5000) * (progress / 100)) / 1000);

        const typeStyles = {
          success: {
            bgIcon: 'bg-emerald-100 text-emerald-600 border-emerald-200',
            bar: 'bg-emerald-500',
            Icon: CheckCircle2,
          },
          error: {
            bgIcon: 'bg-rose-100 text-rose-600 border-rose-200',
            bar: 'bg-rose-500',
            Icon: CheckCircle2,
          },
          warning: {
            bgIcon: 'bg-amber-100 text-amber-600 border-amber-200',
            bar: 'bg-amber-500',
            Icon: AlertTriangle,
          },
          info: {
            bgIcon: 'bg-indigo-100 text-indigo-600 border-indigo-200',
            bar: 'bg-indigo-500',
            Icon: Info,
          },
        }[type];

        const IconComponent = typeStyles.Icon;

        return (
          <div
            key={toast.id}
            onMouseEnter={() => setPausedIds((p) => ({ ...p, [toast.id]: true }))}
            onMouseLeave={() => setPausedIds((p) => ({ ...p, [toast.id]: false }))}
            className="pointer-events-auto w-full bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden transition-all duration-300 animate-in slide-in-from-top-4 fade-in duration-200"
          >
            {/* Header / Main Row */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-full border shadow-2xs shrink-0 ${typeStyles.bgIcon}`}>
                  <IconComponent className="w-4 h-4 stroke-[2.25]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                    {toast.title}
                  </h4>
                  {toast.message && !isCollapsed && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
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
              <div className="px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Notifikasi akan menutup dalam <strong>{secondsLeft}s</strong>.{' '}
                  <button
                    onClick={() => setPausedIds((p) => ({ ...p, [toast.id]: !p[toast.id] }))}
                    className="font-bold text-slate-700 hover:underline cursor-pointer"
                  >
                    {isPaused ? 'Klik untuk lanjut' : 'Klik untuk jeda'}
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
