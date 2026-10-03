/**
 * @file DashboardPage.tsx
 * @module features/dashboard/pages
 * @description
 *   Dashboard per role — seluruh angka diambil realtime dari database (polling otomatis):
 *   - Admin    : KPI status pengisian (Selesai/Proses/Belum), sedang mengisi sekarang,
 *                kinerja per wilayah, progres modul, implementasi, tren, aktivitas live,
 *                follow-up + reminder nyata, dan peringatan dini yang dihitung dari data.
 *   - Sekolah  : profil & status sekolah sendiri, responden yang sudah mengirim,
 *                capaian modul sekolah vs kecamatan vs kabupaten, notifikasi.
 *   - Pengawas : rekap observasi SEL miliknya, sesi terbaru, ringkasan wilayah, notifikasi.
 *
 * @api GET /api/dashboard/{summary,regional-stats,kabupaten-stats,modul-progress,activities,
 *          follow-up,timeseries,insights,sekolah-overview,pengawas-overview}, GET /api/sel/summary-stats
 */
import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Building2, Users, Send, Check, ChevronLeft, ChevronRight, CheckCircle2, BookOpen,
  Clock, Activity, Brain, GraduationCap, AlertTriangle, Radio, ClipboardList, Bell, Eye,
  PlayCircle, UserCheck, LayoutDashboard, Loader2,
} from 'lucide-react';

import { apiClient, withQuery } from '../../../shared/services/api-client';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import TimeSeriesChart from '../../../shared/components/TimeSeriesChart';
import AnomalyWidget from '../../../shared/components/AnomalyWidget';
import GamificationLeaderboard from '../../../shared/components/GamificationLeaderboard';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import { notifyToast } from '../../../shared/components/NotificationToast';
import {
  Card, StatCard, BarList, StackedRow, Legend, EmptyState, StatusBadge, STATUS_META,
  WilayahFilter, wilayahQuery, wilayahText, timeAgo, type WilayahValue,
} from '../../../shared/components/analytics/AnalyticsUI';

interface DashboardProps {
  activeKecamatan: string | null;
  setActiveKecamatan: (kec: string | null) => void;
  userRole: 'admin' | 'pengawas' | 'sekolah';
}

function useProfile() {
  return useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => (await apiClient.auth.getProfile()).data,
    staleTime: 60_000,
    refetchInterval: false,
  });
}

export default function Dashboard({ activeKecamatan, setActiveKecamatan, userRole }: DashboardProps) {
  if (userRole === 'sekolah') return <SekolahDashboard />;
  if (userRole === 'pengawas') return <PengawasDashboard />;
  return <AdminDashboard activeKecamatan={activeKecamatan} setActiveKecamatan={setActiveKecamatan} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

function AdminDashboard({ activeKecamatan, setActiveKecamatan }: { activeKecamatan: string | null; setActiveKecamatan: (k: string | null) => void }) {
  const [wilayahState, setWilayahState] = useState<WilayahValue>({});
  const wilayah: WilayahValue = { ...wilayahState, kecamatan: activeKecamatan || wilayahState.kecamatan };
  const setWilayah = (v: WilayahValue) => {
    setWilayahState({ kabupatenId: v.kabupatenId, kabupatenNama: v.kabupatenNama });
    setActiveKecamatan(v.kecamatan || null);
  };
  const wq = wilayahQuery(wilayah);
  const key = [wq.kabupaten_id ?? 'all', wq.kecamatan ?? 'all'];

  const summaryQ = useQuery({
    queryKey: ['dash-summary', ...key],
    queryFn: async () => (await apiClient.get<any>(withQuery('/dashboard/summary', wq))).data,
  });
  const kabStatsQ = useQuery({
    queryKey: ['dash-kab-stats'],
    queryFn: async () => (await apiClient.get<any[]>('/dashboard/kabupaten-stats')).data || [],
  });
  const kecStatsQ = useQuery({
    queryKey: ['dash-kec-stats', wq.kabupaten_id ?? 'all'],
    queryFn: async () => (await apiClient.get<any[]>(withQuery('/dashboard/regional-stats', { kabupaten_id: wq.kabupaten_id }))).data || [],
  });
  const modulQ = useQuery({
    queryKey: ['dash-modul', ...key],
    queryFn: async () => (await apiClient.get<any[]>(withQuery('/dashboard/modul-progress', wq))).data || [],
  });
  const activitiesQ = useQuery({
    queryKey: ['dash-activities', ...key],
    queryFn: async () => (await apiClient.get<any[]>(withQuery('/dashboard/activities', { ...wq, limit: 12 }))).data || [],
  });
  const tsQ = useQuery({
    queryKey: ['dash-timeseries', ...key],
    queryFn: async () => (await apiClient.get<any[]>(withQuery('/dashboard/timeseries', { ...wq, days: 14 }))).data || [],
  });
  const insightsQ = useQuery({
    queryKey: ['dash-insights', ...key],
    queryFn: async () => (await apiClient.get<any[]>(withQuery('/dashboard/insights', wq))).data || [],
  });
  const selQ = useQuery({
    queryKey: ['dash-sel', wq.kabupaten_id ?? 'all'],
    queryFn: async () => (await apiClient.sel.getSummaryStats(wq.kabupaten_id)).data,
  });

  const s = summaryQ.data;
  const total = Number(s?.total_sekolah || 0);
  const regionRows: any[] = wilayah.kabupatenId
    ? (kecStatsQ.data || [])
    : (kabStatsQ.data || []);
  const [showAllRegion, setShowAllRegion] = useState(false);
  const visibleRegion = showAllRegion ? regionRows : regionRows.slice(0, 10);

  const statusSegments = (r: any) => {
    const t = Number(r.total || 0) || 1;
    return [
      { key: 'sudah', label: 'Selesai', value: Math.round((Number(r.sudah || 0) / t) * 1000) / 10, color: STATUS_META.sudah.color },
      { key: 'sebagian', label: 'Proses', value: Math.round((Number(r.sebagian || 0) / t) * 1000) / 10, color: STATUS_META.sebagian.color },
      { key: 'belum', label: 'Belum', value: Math.round((Number(r.belum || 0) / t) * 1000) / 10, color: STATUS_META.belum.color },
    ];
  };

  const leaderboardData = useMemo(() => (kecStatsQ.data || [])
    .filter((k: any) => !wq.kecamatan || k.kecamatan === wq.kecamatan)
    .map((k: any) => ({ kecamatan: k.kecamatan, kabupaten: k.kabupaten, total: k.total, belum: k.belum, sebagian: k.sebagian, sudah: k.sudah, rate: k.rate })),
  [kecStatsQ.data, wq.kecamatan]);

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      {/* Header + filter */}
      <div className="rounded-2xl bg-surface border border-border shadow-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><LayoutDashboard className="h-5 w-5" /></div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold font-display text-text-primary">Dashboard Monitoring BSAN</h1>
            <p className="text-xs text-text-secondary mt-0.5">{wilayahText(wilayah)} • {total.toLocaleString('id-ID')} sekolah sasaran</p>
          </div>
        </div>
        <WilayahFilter value={wilayah} onChange={setWilayah} />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatCard label="Sekolah Sasaran" value={<AnimatedCounter value={total} />} sub={`${Number(s?.akun_terdaftar || 0)} punya akun`} icon={<Building2 className="h-4 w-4" />} tone="primary" />
        <StatCard label="Selesai" value={<AnimatedCounter value={Number(s?.sudah || 0)} />} sub="Sudah mengirim survei" icon={<CheckCircle2 className="h-4 w-4" />} tone="sudah" />
        <StatCard label="Proses" value={<AnimatedCounter value={Number(s?.proses || 0)} />}
          sub={<span className="inline-flex items-center gap-1"><Radio className="h-3 w-3 text-status-sebagian animate-pulse" />{Number(s?.sedang_mengisi || 0)} mengisi sekarang</span>}
          icon={<Activity className="h-4 w-4" />} tone="sebagian" />
        <StatCard label="Belum" value={<AnimatedCounter value={Number(s?.belum || 0)} />} sub="Belum ada aktivitas" icon={<Clock className="h-4 w-4" />} tone="belum" />
        <StatCard label="Penyelesaian" value={<AnimatedCounter value={Number(s?.response_rate || 0)} suffix="%" decimals={1} />} sub={`Partisipasi ${Number(s?.partisipasi_rate || 0)}%`} icon={<TrendingUp className="h-4 w-4" />} tone="indigo" />
        <StatCard label="Responden" value={<AnimatedCounter value={Number(s?.total_responden || 0)} />} sub={`+${Number(s?.responden_hari_ini || 0)} hari ini`} icon={<Users className="h-4 w-4" />} tone="primary" />
      </div>

      {/* SEL banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl"><Brain className="h-5 w-5 text-primary" /></div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">Observasi SEL • Ringkasan Lapangan</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              {Number(selQ.data?.totalDiobservasi || 0) > 0
                ? `${selQ.data.totalSesi || 0} sesi dari ${selQ.data.totalDiobservasi} sekolah • tertinggi: ${selQ.data.topSekolah}`
                : 'Belum ada sesi observasi SEL pada wilayah ini.'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Diobservasi', value: `${selQ.data?.totalDiobservasi || 0} SD`, icon: Building2, c: 'text-primary' },
            { label: 'Rata Guru', value: `${Number(selQ.data?.rataGuruAll || 0).toFixed(1)}/4`, icon: GraduationCap, c: 'text-status-sudah' },
            { label: 'Rata Murid', value: `${Number(selQ.data?.rataMuridAll || 0).toFixed(1)}/4`, icon: Users, c: 'text-accent' },
            { label: 'Intervensi', value: `${selQ.data?.butuhIntervensi || 0} SD`, icon: AlertTriangle, c: 'text-status-belum' },
          ].map(it => (
            <div key={it.label} className="flex items-center gap-1.5 bg-surface rounded-xl px-3 py-2 border border-border/60">
              <it.icon className={`h-3.5 w-3.5 ${it.c}`} />
              <div><div className={`text-[11px] font-black ${it.c}`}>{it.value}</div><div className="text-[9px] text-text-secondary">{it.label}</div></div>
            </div>
          ))}
        </div>
        <Link to="/analisis-sel" className="shrink-0 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-xl inline-flex items-center gap-1 self-start md:self-auto">
          Lihat Analisis SEL <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Region performance + modul */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:items-start">
        <Card className="lg:col-span-2"
          title={`Status Pengisian per ${wilayah.kabupatenId ? 'Kecamatan' : 'Kabupaten/Kota'}`}
          subtitle={wilayah.kabupatenId ? 'Klik baris untuk memfilter dashboard ke kecamatan tersebut' : 'Klik baris untuk melihat kecamatan di kabupaten/kota tersebut'}
          right={<Legend items={[{ label: 'Selesai', color: STATUS_META.sudah.color }, { label: 'Proses', color: STATUS_META.sebagian.color }, { label: 'Belum', color: STATUS_META.belum.color }]} />}
        >
          {regionRows.length === 0 ? <EmptyState /> : (
            <div className="space-y-3.5">
              {visibleRegion.map((r: any) => {
                const name = r.kecamatan || r.kabupaten;
                const active = wq.kecamatan && r.kecamatan === wq.kecamatan;
                return (
                  <button key={name} type="button"
                    onClick={() => {
                      if (wilayah.kabupatenId) setActiveKecamatan(active ? null : r.kecamatan);
                      else setWilayah({ kabupatenId: Number(r.id), kabupatenNama: r.kabupaten });
                    }}
                    className={`w-full text-left rounded-xl p-2 -m-2 transition cursor-pointer ${active ? 'bg-primary/5 ring-1 ring-primary/30' : 'hover:bg-bg'}`}>
                    <StackedRow label={`${name} — ${r.sudah}/${r.total} selesai (${r.rate}%)`} segments={statusSegments(r)} />
                  </button>
                );
              })}
              {regionRows.length > 10 && (
                <button onClick={() => setShowAllRegion(v => !v)} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                  {showAllRegion ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${regionRows.length})`}
                </button>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card title="Capaian Modul BSAN" subtitle="Dari jawaban evaluatif responden" right={<Link to="/modul" className="text-[11px] font-bold text-primary">Detail</Link>}>
            {(modulQ.data || []).length === 0 ? <EmptyState /> : (
              <BarList items={(modulQ.data || []).map((m: any) => ({ label: `${m.nama} • ${m.terisi} responden`, value: Number(m.progres || 0) }))} showCount={false} />
            )}
          </Card>
          <Card title="Implementasi Modul" subtitle={`${Number(s?.total_responden || 0)} responden`}>
            <div className="grid grid-cols-2 gap-2 text-center">
              {[
                { l: 'Menerima modul', v: `${Number(s?.penerima_persen || 0)}%`, c: 'text-primary' },
                { l: 'Implementasi penuh', v: Number(s?.impl_sudah || 0), c: 'text-status-sudah' },
                { l: 'Sebagian', v: Number(s?.impl_sebagian || 0), c: 'text-status-sebagian' },
                { l: 'Belum menerapkan', v: Math.max(Number(s?.impl_belum || 0), 0), c: 'text-status-netral' },
              ].map(x => (
                <div key={x.l} className="rounded-xl bg-bg border border-border/60 p-3">
                  <div className={`text-lg font-black font-display ${x.c}`}>{x.v}</div>
                  <div className="text-[10px] text-text-secondary">{x.l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Trend + leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:items-start [&>div:last-child]:mt-0">
        <Card className="lg:col-span-2" title="Tren Pengiriman Survei (14 Hari)" subtitle="Batang: survei terkirim per hari • Garis: akumulasi sekolah yang selesai">
          <TimeSeriesChart data={tsQ.data || []} />
        </Card>
        <GamificationLeaderboard data={leaderboardData} />
      </div>

      {/* Activity, follow-up, insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Aktivitas Terbaru" subtitle="Survei terkirim & sekolah yang sedang mengisi">
          {(activitiesQ.data || []).length === 0 ? <EmptyState message="Belum ada aktivitas pengisian." /> : (
            <ul className="divide-y divide-border/50">
              {(activitiesQ.data || []).map((a: any, i: number) => (
                <li key={i} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{a.schoolName}</p>
                    <p className="text-[10px] text-text-secondary truncate">
                      {a.tipe === 'submit' ? `Dikirim oleh ${a.pengisi}` : a.live ? 'Sedang mengisi sekarang' : 'Mulai mengisi, belum mengirim'} • {timeAgo(a.time)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} live={a.live} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <FollowUpCard wq={wq} />

        <div className="[&>div]:mt-0">
          <AnomalyWidget anomalies={insightsQ.data || []} />
        </div>
      </div>
    </div>
  );
}

function FollowUpCard({ wq }: { wq: { kabupaten_id?: number; kecamatan?: string } }) {
  const [status, setStatus] = useState<'semua' | 'sebagian' | 'belum'>('semua');
  const [page, setPage] = useState(1);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const perPage = 6;

  const { data = [], isLoading } = useQuery({
    queryKey: ['dash-followup', wq.kabupaten_id ?? 'all', wq.kecamatan ?? 'all', status],
    queryFn: async () => (await apiClient.get<any[]>(withQuery('/dashboard/follow-up', { ...wq, status: status === 'semua' ? undefined : status }))).data || [],
  });

  const reminder = useMutation({
    mutationFn: async (id: string) => apiClient.sekolah.sendReminder(id),
    onSuccess: (res: any, id) => {
      setSent(p => ({ ...p, [id]: true }));
      notifyToast({ type: 'success', title: 'Pengingat Terkirim', message: res?.message || 'Notifikasi pengingat dikirim ke akun sekolah.' });
    },
    onError: (err: any) => notifyToast({ type: 'error', title: 'Gagal Mengirim', message: err?.message || 'Pengingat gagal dikirim.' }),
  });

  const pages = Math.max(1, Math.ceil(data.length / perPage));
  const rows = data.slice((page - 1) * perPage, page * perPage);

  return (
    <Card title="Prioritas Follow-Up" subtitle={`${data.length} sekolah belum selesai`}>
      <div className="flex gap-1.5 mb-3">
        {(['semua', 'sebagian', 'belum'] as const).map(st => (
          <button key={st} onClick={() => { setStatus(st); setPage(1); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${status === st ? 'bg-primary text-white border-primary' : 'bg-bg text-text-secondary border-border'}`}>
            {st === 'semua' ? 'Semua' : st === 'sebagian' ? 'Proses' : 'Belum'}
          </button>
        ))}
      </div>
      {isLoading ? <ThreeDotsLoader size="sm" text="" /> : rows.length === 0 ? <EmptyState title="Semua beres" message="Tidak ada sekolah yang perlu ditindaklanjuti." /> : (
        <ul className="space-y-2">
          {rows.map((sch: any) => {
            const done = sent[sch.id];
            const busy = reminder.isPending && reminder.variables === String(sch.id);
            return (
              <li key={sch.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-bg/60 border border-border/60">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{sch.nama}</p>
                  <p className="text-[10px] text-text-secondary truncate">
                    {sch.kecamatan} • <StatusBadge status={sch.status} />{sch.last_updated && sch.status === 'sebagian' ? ` • ${timeAgo(sch.last_updated)}` : ''}
                  </p>
                </div>
                {sch.is_registered ? (
                  <button disabled={done || busy} onClick={() => reminder.mutate(String(sch.id))}
                    className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition cursor-pointer ${done ? 'bg-status-sudah/10 text-status-sudah' : 'bg-primary text-white hover:bg-primary-dark'}`}>
                    {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : done ? <Check className="h-3 w-3" /> : <Send className="h-3 w-3" />}
                    {done ? 'Terkirim' : 'Ingatkan'}
                  </button>
                ) : (
                  <span className="shrink-0 text-[10px] text-text-secondary italic">Belum punya akun</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-3 mt-3 border-t border-border/50">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded-md hover:bg-bg disabled:opacity-30 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-xs text-text-secondary">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1 rounded-md hover:bg-bg disabled:opacity-30 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEKOLAH
// ═══════════════════════════════════════════════════════════════════════════════

function NotifList({ items }: { items: any[] }) {
  if (!items?.length) return <EmptyState title="Tidak ada pengumuman" message="Notifikasi dari dinas akan muncul di sini." />;
  return (
    <ul className="space-y-2.5">
      {items.map(n => (
        <li key={n.id} className={`p-3 rounded-xl border ${n.is_read ? 'bg-bg border-border/60' : 'bg-primary/5 border-primary/20'}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-primary">{n.tipe}</span>
            <span className="text-[10px] text-text-secondary">{timeAgo(n.created_at)}</span>
          </div>
          <p className="text-xs font-bold text-text-primary mt-1">{n.judul}</p>
          {n.pesan && <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-3">{n.pesan}</p>}
        </li>
      ))}
    </ul>
  );
}

function SekolahDashboard() {
  const { data: profile } = useProfile();
  const { data, isLoading, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ['dash-sekolah'],
    queryFn: async () => (await apiClient.get<any>('/dashboard/sekolah-overview')).data,
  });

  if (isLoading) return <div className="py-20"><ThreeDotsLoader text="Memuat dashboard sekolah..." /></div>;
  if (!data) {
    return (
      <Card>
        <EmptyState title="Akun belum terhubung ke sekolah" message="Akun Anda belum ditautkan dengan data sekolah. Hubungi admin untuk menautkan sekolah agar dapat mengisi survei." />
      </Card>
    );
  }

  const sp = data.sekolah;
  const status = sp.status_pengisian as 'belum' | 'sebagian' | 'sudah';
  const cta = status === 'sudah' ? 'Isi Survei Responden Lain' : status === 'sebagian' ? 'Lanjutkan Pengisian' : 'Mulai Isi Survei';

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      <div className="rounded-2xl bg-surface border border-border shadow-card p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary leading-tight">{sp.nama}</h1>
            <p className="text-xs text-text-secondary mt-1">
              Halo, {profile?.nama || 'Operator'} • NPSN {sp.npsn} • Kec. {sp.kecamatan}, {sp.kabupaten}
            </p>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed max-w-xl">
              {status === 'sudah'
                ? `Sekolah Anda sudah mengirim ${data.total_responden} survei. Guru/kepala sekolah lain masih dapat mengisi menggunakan akun ini.`
                : status === 'sebagian'
                  ? 'Pengisian sedang berjalan (status Proses). Selesaikan dan kirim survei agar status menjadi Selesai.'
                  : 'Sekolah Anda belum mengisi survei BSAN. Mulai pengisian sekarang — data identitas sekolah terisi otomatis.'}
            </p>
          </div>
          <Link to="/kuisioner" className="shrink-0 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition w-full md:w-auto">
            <PlayCircle className="h-5 w-5" /> {cta}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Status" value={STATUS_META[status]?.short} sub={sp.last_updated ? `Aktivitas ${timeAgo(sp.last_updated)}` : 'Belum ada aktivitas'} tone={status} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Survei Terkirim" value={data.total_responden} sub="Responden dari sekolah ini" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Menerima Modul" value={data.penerima_modul} sub={`dari ${data.total_responden} responden`} tone="sudah" icon={<BookOpen className="h-4 w-4" />} />
        <StatCard label={`Kec. ${sp.kecamatan}`} value={`${data.kecamatan_stats.sudah}/${data.kecamatan_stats.total}`} sub={`sekolah selesai • ${data.kecamatan_stats.proses} proses`} tone="indigo" icon={<Building2 className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2" title="Capaian Modul: Sekolah vs Kecamatan vs Kabupaten" subtitle="Dihitung dari jawaban survei evaluatif (0–100%)">
          {data.modul.every((m: any) => m.sekolah == null) ? (
            <EmptyState message="Capaian akan muncul setelah sekolah Anda mengirim survei." />
          ) : (
            <div className="space-y-4">
              <Legend items={[{ label: 'Sekolah Anda', color: 'var(--color-primary)' }, { label: 'Rata-rata kecamatan', color: '#F59E0B' }, { label: 'Rata-rata kabupaten', color: '#94A3B8' }]} />
              {data.modul.map((m: any) => (
                <div key={m.modul_id}>
                  <p className="text-xs font-semibold text-text-primary mb-1.5">{m.nama}</p>
                  {[
                    { v: m.sekolah, c: 'var(--color-primary)' },
                    { v: m.kecamatan, c: '#F59E0B' },
                    { v: m.kabupaten, c: '#94A3B8' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <div className="h-2 flex-1 rounded-full bg-border/50 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${b.v ?? 0}%`, backgroundColor: b.c }} />
                      </div>
                      <span className="w-10 text-right text-[11px] font-bold tabular-nums">{b.v == null ? '–' : `${b.v}%`}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Profil Sekolah">
          <dl className="space-y-2.5 text-xs">
            {[
              ['NPSN', sp.npsn], ['Jenjang', `${sp.jenjang || '-'} (${sp.status_sekolah || '-'})`], ['Akreditasi', sp.akreditasi || '-'],
              ['Kecamatan', sp.kecamatan], ['Kabupaten/Kota', sp.kabupaten], ['Guru / Siswa', `${sp.total_guru ?? 0} / ${sp.total_siswa ?? 0}`],
              ['Alamat', sp.alamat || '-'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="font-semibold text-text-primary text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2" title="Survei yang Sudah Dikirim" subtitle="Responden dari sekolah Anda">
          {data.responden.length === 0 ? <EmptyState message="Belum ada survei yang dikirim." /> : (
            <ul className="divide-y divide-border/50">
              {data.responden.map((r: any) => (
                <li key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><UserCheck className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{r.nama}</p>
                      <p className="text-[10px] text-text-secondary truncate">{r.posisi}{r.kelas_mengajar ? ` • ${r.kelas_mengajar}` : ''}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-text-secondary shrink-0">{timeAgo(r.submitted_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Informasi Dinas" right={<Bell className="h-4 w-4 text-text-secondary" />}>
          <NotifList items={data.notifikasi} />
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PENGAWAS
// ═══════════════════════════════════════════════════════════════════════════════

function PengawasDashboard() {
  const { data: profile } = useProfile();
  const { data, isLoading, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ['dash-pengawas'],
    queryFn: async () => (await apiClient.get<any>('/dashboard/pengawas-overview')).data,
  });

  if (isLoading || !data) return <div className="py-20"><ThreeDotsLoader text="Memuat dashboard pengawas..." /></div>;
  const w = data.wilayah;

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      <div className="rounded-2xl bg-surface border border-border shadow-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">Halo, {profile?.nama || 'Pengawas'}</h1>
          <p className="text-xs text-text-secondary mt-1">
            {data.terakhir ? `Observasi terakhir Anda: ${new Date(data.terakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Anda belum melakukan observasi SEL.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Link to="/observasi-sel" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition">
            <PlayCircle className="h-5 w-5" /> Mulai Observasi
          </Link>
          <Link to="/analisis-sel" className="inline-flex items-center justify-center gap-2 bg-bg border border-border text-text-primary rounded-xl px-5 py-3 text-sm font-bold hover:bg-border/40 transition">
            <Eye className="h-4 w-4" /> Analisis SEL
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Sesi Saya" value={data.total_sesi} sub={`${data.sesi_30_hari} dalam 30 hari`} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Sekolah Saya" value={data.total_sekolah} sub="Sudah Anda observasi" tone="indigo" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Rata Guru" value={data.rata_guru != null ? `${data.rata_guru.toFixed(1)}/4` : '–'} sub="Dari observasi Anda" tone="sudah" icon={<GraduationCap className="h-4 w-4" />} />
        <StatCard label="Rata Murid" value={data.rata_murid != null ? `${data.rata_murid.toFixed(1)}/4` : '–'} sub="Dari observasi Anda" tone="sebagian" icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2" title="Sesi Observasi Terbaru Anda">
          {data.recent.length === 0 ? <EmptyState message="Sesi observasi yang Anda kirim akan muncul di sini." /> : (
            <ul className="divide-y divide-border/50">
              {data.recent.map((r: any) => (
                <li key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{r.sekolah}</p>
                    <p className="text-[10px] text-text-secondary truncate">
                      {new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • Kelas {r.kelas_diamati || '-'} • {r.mata_pelajaran || '-'} • Kec. {r.kecamatan}
                    </p>
                  </div>
                  <span className="text-xs font-black text-primary shrink-0">{r.skor != null ? `${Number(r.skor).toFixed(2)}/4` : '–'}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="space-y-5">
          <Card title="Ringkasan Seluruh Wilayah">
            <div className="space-y-3">
              <StackedRow label={`${w.sudah} selesai • ${w.proses} proses dari ${w.total_sekolah} sekolah`} segments={[
                { key: 'sudah', label: 'Selesai', value: w.total_sekolah ? (w.sudah / w.total_sekolah) * 100 : 0, color: STATUS_META.sudah.color },
                { key: 'proses', label: 'Proses', value: w.total_sekolah ? (w.proses / w.total_sekolah) * 100 : 0, color: STATUS_META.sebagian.color },
              ]} />
              <p className="text-[11px] text-text-secondary">{w.sekolah_diobservasi} sekolah sudah diobservasi SEL oleh seluruh pengawas.</p>
            </div>
          </Card>
          <Card title="Informasi Dinas" right={<Bell className="h-4 w-4 text-text-secondary" />}>
            <NotifList items={data.notifikasi} />
          </Card>
        </div>
      </div>
    </div>
  );
}
