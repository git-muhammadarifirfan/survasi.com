import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, ChevronDown } from 'lucide-react';
import { notifyToast } from './NotificationToast';
import type { ExportFormat } from '../utils/tableExport';

interface ExportMenuProps {
  /** Dipanggil saat user memilih format. Boleh async (mis. ambil data lengkap dari API). */
  onExport: (format: ExportFormat) => unknown | Promise<unknown>;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** Tombol "Ekspor" dengan pilihan Excel (.xlsx) dan CSV — dipakai di seluruh halaman analisis. */
export default function ExportMenu({ onExport, disabled, label = 'Ekspor', className = '' }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const run = async (format: ExportFormat) => {
    setOpen(false);
    setBusy(format);
    try {
      await onExport(format);
      notifyToast({ type: 'success', title: 'Ekspor Berhasil', message: `File ${format === 'xlsx' ? 'Excel' : 'CSV'} berhasil diunduh.` });
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Ekspor Gagal', message: err?.message || 'Gagal menyiapkan file ekspor.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled || !!busy}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        <span>{busy ? 'Menyiapkan…' : label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-40 w-56 rounded-xl bg-surface border border-border shadow-xl py-1.5 animate-scale-in">
          <button
            type="button"
            onClick={() => run('xlsx')}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-bg transition cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <span className="block text-xs font-bold text-text-primary">Excel (.xlsx)</span>
              <span className="block text-[10px] text-text-secondary">Multi-sheet, siap diolah</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => run('csv')}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-bg transition cursor-pointer"
          >
            <FileText className="h-4 w-4 text-slate-500 shrink-0" />
            <span>
              <span className="block text-xs font-bold text-text-primary">CSV (UTF-8)</span>
              <span className="block text-[10px] text-text-secondary">Data mentah, kompatibel Excel</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
