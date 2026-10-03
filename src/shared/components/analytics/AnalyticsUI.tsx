/**
 * @file AnalyticsUI.tsx
 * @description Komponen UI bersama untuk halaman analisis & dashboard:
 *   header halaman, filter wilayah (kabupaten → kecamatan dari database),
 *   kartu statistik, daftar bar horizontal responsif, empty state, dan
 *   penanda data realtime.
 */
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Inbox, Radio } from 'lucide-react';
import CustomSelect from '../CustomSelect';
import { apiClient, withQuery } from '../../services/api-client';

// ─── Wilayah filter ──────────────────────────────────────────────────────────

export interface WilayahValue {
  kabupatenId?: number;
  kabupatenNama?: string;
  kecamatan?: string;
}

/** Query params backend dari nilai filter wilayah */
export function wilayahQuery(v: WilayahValue) {
  return { kabupaten_id: v.kabupatenId, kecamatan: v.kecamatan };
}

export function wilayahText(v: WilayahValue): string {
  if (v.kecamatan) return `Kec. ${v.kecamatan}${v.kabupatenNama ? `, ${v.kabupatenNama}` : ''}`;
  return v.kabupatenNama || 'Semua Wilayah';
}

export function WilayahFilter({ value, onChange, showKecamatan = true }: {
  value: WilayahValue;
  onChange: (v: WilayahValue) => void;
  showKecamatan?: boolean;
}) {
  const { data: kabList = [] } = useQuery({
    queryKey: ['master-kabupaten'],
    queryFn: async () => (await apiClient.get<any[]>('/sekolah/kabupaten')).data || [],
    staleTime: 10 * 60_000,
    refetchInterval: false,
  });
  const { data: kecList = [] } = useQuery({
    queryKey: ['master-kecamatan', value.kabupatenId ?? 'all'],
    queryFn: async () => (await apiClient.get<any[]>(withQuery('/sekolah/kecamatan', { kabupaten_id: value.kabupatenId }))).data || [],
    staleTime: 10 * 60_000,
    refetchInterval: false,
    enabled: showKecamatan,
  });

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <div className="w-full sm:w-52">
        <CustomSelect
          options={[{ value: '', label: 'Semua Kabupaten/Kota' }, ...kabList.map((k: any) => ({ value: String(k.id), label: k.nama }))]}
          value={value.kabupatenId ? String(value.kabupatenId) : ''}
          onChange={(val) => {
            const k = kabList.find((x: any) => String(x.id) === String(val));
            onChange({ kabupatenId: k ? Number(k.id) : undefined, kabupatenNama: k?.nama, kecamatan: undefined });
          }}
          size="md"
        />
      </div>
      {showKecamatan && (
        <div className="w-full sm:w-52">
          <CustomSelect
            options={[{ value: '', label: 'Semua Kecamatan' }, ...kecList.map((k: any) => ({ value: k.nama, label: value.kabupatenId ? k.nama : `${k.nama} • ${k.kabupaten_nama}` }))]}
            value={value.kecamatan || ''}
            onChange={(val) => onChange({ ...value, kecamatan: val || undefined })}
            enableSearch
            size="md"
          />
        </div>
      )}
    </div>
  );
}

// ─── Layout pieces ───────────────────────────────────────────────────────────

export function PageHeader({ icon, title, subtitle, actions, meta }: {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface border border-border shadow-card p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">{icon}</div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold font-display text-text-primary leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-text-secondary mt-1 leading-relaxed">{subtitle}</p>}
            {meta && <div className="mt-2">{meta}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ title, subtitle, right, children, className = '' }: {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-surface border border-border shadow-card p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-bold text-text-primary font-display">{title}</h3>}
            {subtitle && <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{subtitle}</p>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES: Record<string, string> = {
  primary: 'text-primary bg-primary/10',
  sudah: 'text-status-sudah bg-status-sudah/10',
  sebagian: 'text-status-sebagian bg-status-sebagian/10',
  belum: 'text-status-belum bg-status-belum/10',
  netral: 'text-status-netral bg-status-netral/10',
  indigo: 'text-indigo-600 bg-indigo-500/10',
};

export function StatCard({ label, value, sub, icon, tone = 'primary' }: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: keyof typeof TONES | string;
}) {
  const t = TONES[tone] || TONES.primary;
  return (
    <div className="rounded-2xl bg-surface border border-border shadow-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">{label}</span>
        {icon && <span className={`p-1.5 rounded-lg ${t}`}>{icon}</span>}
      </div>
      <div className={`mt-2 text-2xl font-bold font-display ${t.split(' ')[0]}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-secondary mt-0.5">{sub}</div>}
    </div>
  );
}

export function EmptyState({ title = 'Belum ada data', message }: { title?: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed border-border bg-bg/50">
      <Inbox className="h-8 w-8 text-text-secondary/50 mb-2" />
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      {message && <p className="text-xs text-text-secondary mt-1 max-w-sm">{message}</p>}
    </div>
  );
}

/** Daftar bar horizontal — label panjang tetap terbaca di layar kecil. */
export function BarList({ items, color = 'var(--color-primary)', unit = '%', showCount = true, emptyMessage }: {
  items: { label: string; value: number; count?: number }[];
  color?: string;
  unit?: string;
  showCount?: boolean;
  emptyMessage?: string;
}) {
  if (!items.length || items.every(i => !i.value && !i.count)) {
    return <EmptyState message={emptyMessage || 'Belum ada jawaban untuk indikator ini.'} />;
  }
  const max = unit === '%' ? 100 : Math.max(...items.map(i => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((it, idx) => (
        <li key={`${it.label}-${idx}`}>
          <div className="flex items-start justify-between gap-3 text-xs">
            <span className="text-text-primary font-medium leading-snug">{it.label}</span>
            <span className="shrink-0 font-bold text-text-primary tabular-nums">
              {unit === '%' ? `${it.value}%` : it.value}
              {showCount && it.count != null && unit === '%' && (
                <span className="ml-1 font-medium text-text-secondary">({it.count})</span>
              )}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-border/60 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((it.value / max) * 100, 100)}%`, backgroundColor: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Bar bertumpuk 100% (mis. status implementasi) dengan legenda. */
export function StackedRow({ label, total, segments }: {
  label: string;
  total?: number;
  segments: { key: string; label: string; value: number; color: string }[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
        <span className="font-semibold text-text-primary truncate">{label}</span>
        {total != null && <span className="text-text-secondary shrink-0">{total} responden</span>}
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-border/50">
        {segments.map(s => s.value > 0 && (
          <div key={s.key} title={`${s.label}: ${s.value}%`} style={{ width: `${s.value}%`, backgroundColor: s.color }} />
        ))}
      </div>
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map(i => (
        <span key={i.label} className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/** Penanda bahwa data diambil realtime + waktu pembaruan terakhir. */
export function LiveBadge({ updatedAt, fetching }: { updatedAt?: number; fetching?: boolean }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(x => x + 1), 15_000);
    return () => clearInterval(t);
  }, []);
  const time = updatedAt ? new Date(updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-status-sudah/30 bg-status-sudah/10 px-2.5 py-1 text-[10px] font-bold text-status-sudah">
      <Radio className={`h-3 w-3 ${fetching ? 'animate-pulse' : ''}`} />
      <span>Realtime · {fetching ? 'memperbarui…' : `diperbarui ${time}`}</span>
    </span>
  );
}

export const STATUS_META: Record<string, { label: string; short: string; cls: string; color: string }> = {
  sudah: { label: 'Selesai Mengisi', short: 'Selesai', cls: 'bg-status-sudah/10 text-status-sudah border-status-sudah/20', color: 'var(--status-sudah)' },
  sebagian: { label: 'Proses Mengisi', short: 'Proses', cls: 'bg-status-sebagian/10 text-status-sebagian border-status-sebagian/20', color: 'var(--status-sebagian)' },
  belum: { label: 'Belum Mengisi', short: 'Belum', cls: 'bg-status-belum/10 text-status-belum border-status-belum/20', color: 'var(--status-belum)' },
};

export function StatusBadge({ status, live }: { status: string; live?: boolean }) {
  const m = STATUS_META[status] || STATUS_META.belum;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${m.cls}`}>
      {live && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
      {m.short}
    </span>
  );
}

/** "5 menit lalu" dari timestamp */
export function timeAgo(v?: string | null): string {
  if (!v) return '-';
  const diff = (Date.now() - new Date(v).getTime()) / 1000;
  if (Number.isNaN(diff)) return '-';
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
