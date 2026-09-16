/**
 * @file Dashboard.tsx
 * @module features/dashboard/pages
 * @description
 *   Halaman utama dashboard dengan dua mode tampilan:
 *   - Admin Dinas: KPI cards, bar chart response rate per kecamatan/kabupaten,
 *     ring chart progres modul BSAN, panel aktivitas terbaru, SEL insight banner,
 *     tren 7 hari, leaderboard gamifikasi, follow-up list, dan anomaly widget.
 *   - Operator Sekolah: ring chart progres per modul, profil sekolah, radar
 *     benchmarking vs rata-rata kecamatan, rekomendasi, dan pengumuman dinas.
 *
 * @dependencies
 *   - data-source.ts (Fase 1: static JSON — getSchools, getKabupatenStats, etc.)
 *
 * @tables_used (Fase 2 — MySQL)
 *   - satuan_pendidikan (KPI counts, status_pengisian)
 *   - kecamatan, kabupaten (filter wilayah + bar chart)
 *   - responden_survey (modul progress calculation)
 *   - sel_sesi_observasi, sel_jawaban_observasi (SEL insight banner)
 *   - notifikasi (pengumuman → akan ganti static announcements)
 *   - activity_log (aktivitas terbaru)
 *
 * @api_endpoints (Fase 2)
 *   GET /api/dashboard/kpi?kabupaten_id=&kecamatan_id=
 *   GET /api/dashboard/kecamatan-stats?kabupaten_id=
 *   GET /api/dashboard/kabupaten-stats
 *   GET /api/dashboard/recent-activities?limit=5
 *   GET /api/dashboard/time-series?days=7
 *   GET /api/dashboard/modul-progress?kabupaten_id=
 *   GET /api/sel/summary-stats
 *   POST /api/reminders/:school_id
 *
 * @author BSAN Jatim Team
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { database, KABUPATEN_LIST } from '../../../shared/data/data-source';
import { apiClient } from '../../../shared/services/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  TrendingUp, Download, Building2, Award, Users, Filter, Send, Check, ChevronLeft,
  CheckCircle2, AlertCircle, BookOpen, Clock, Activity, Target, X, ChevronRight, Share2, Printer,
  Brain, GraduationCap, AlertTriangle
} from 'lucide-react';

import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import TimeSeriesChart from '../../../shared/components/TimeSeriesChart';
import RadarBenchmarkingChart from '../../../shared/components/RadarBenchmarkingChart';
import AnomalyWidget from '../../../shared/components/AnomalyWidget';
import RecommendationWidget from '../../../shared/components/RecommendationWidget';
import GamificationLeaderboard from '../../../shared/components/GamificationLeaderboard';

interface Announcement {
  id: string;
  type: 'Penting' | 'Info';
  date: string;
  title: string;
  content: string;
}

interface DashboardProps {
  activeKecamatan: string | null;
  setActiveKecamatan: (kec: string | null) => void;
  userRole: 'admin' | 'pengawas' | 'sekolah';
}

export default function Dashboard({ activeKecamatan, setActiveKecamatan, userRole }: DashboardProps) {
  const [selectedKab, setSelectedKab] = useState<string>('');
  const [remindedSchools, setRemindedSchools] = useState<Record<string, boolean>>({});
  const [loadingReminder, setLoadingReminder] = useState<string | null>(null);
  
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  const announcements: Announcement[] = [
    {
      id: 'a1',
      type: 'Penting',
      date: '26 Ags 2026',
      title: 'Batas Akhir Sinkronisasi Dapodik',
      content: 'Bapak/Ibu Kepala Sekolah dan Operator,\n\nMenindaklanjuti edaran dari Kementerian Pendidikan, kami mengingatkan agar seluruh data guru, tenaga kependidikan, serta sarpras di sekolah Anda telah tersinkron dengan Dapodik pusat paling lambat 30 Agustus 2026 pukul 23:59 WIB.\n\nHal ini krusial untuk pencairan dana BOSP tahap selanjutnya. Keterlambatan sinkronisasi dapat berakibat pada penundaan penyaluran dana. Mohon bantuan dan kerja samanya.'
    },
    {
      id: 'a2',
      type: 'Info',
      date: '20 Ags 2026',
      title: 'Bimtek Implementasi Kurikulum Merdeka',
      content: 'Dinas Pendidikan Kabupaten Sidoarjo mengundang perwakilan Kepala Sekolah untuk menghadiri Bimbingan Teknis (Bimtek) Implementasi Kurikulum Merdeka (IKM) tingkat mahir.\n\nKegiatan akan dilaksanakan pada:\nHari/Tanggal: Kamis, 5 September 2026\nTempat: Aula Dinas Pendidikan Sidoarjo\nWaktu: 08.00 WIB - Selesai\n\nSurat undangan resmi beserta daftar nama peserta telah dikirim ke email sekolah masing-masing.'
    }
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  // Query real API endpoints for Dashboard
  const { data: summaryResponse } = useQuery({
    queryKey: ['dashboardSummary', selectedKab],
    queryFn: async () => {
      const res = await apiClient.dashboard.getSummary().catch(() => null);
      return res?.data;
    },
  });

  const { data: kabStats = [] } = useQuery({
    queryKey: ['kabStats'],
    queryFn: async () => {
      const res = await apiClient.dashboard.getKabupatenStats().catch(() => null);
      return Array.isArray(res?.data) ? res.data : database.getKabupatenStats();
    },
  });

  const { data: kecStats = [] } = useQuery({
    queryKey: ['kecStats', selectedKab],
    queryFn: async () => {
      const res = await apiClient.dashboard.getRegionalStats().catch(() => null);
      return Array.isArray(res?.data) ? res.data : database.getKecamatanStats(selectedKab || undefined);
    },
  });

  const { data: modulProgress = [] } = useQuery({
    queryKey: ['modulProgress', selectedKab, activeKecamatan],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/dashboard/modul-progress').catch(() => null);
      return Array.isArray(res?.data) ? res.data : database.getModulProgress({ kabupaten: selectedKab || undefined, kecamatan: activeKecamatan || undefined });
    },
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['recentActivities', selectedKab, activeKecamatan],
    queryFn: async () => {
      const res = await apiClient.dashboard.getActivities({ limit: 10 }).catch(() => null);
      return Array.isArray(res?.data) ? res.data : database.getRecentActivities({ kabupaten: selectedKab || undefined, kecamatan: activeKecamatan || undefined });
    },
  });

  const { data: timeSeriesData = [] } = useQuery({
    queryKey: ['timeSeries', selectedKab, activeKecamatan],
    queryFn: async () => {
      const res = await apiClient.dashboard.getTimeseries().catch(() => null);
      return Array.isArray(res?.data) ? res.data : database.getTimeSeriesData({ kabupaten: selectedKab || undefined, kecamatan: activeKecamatan || undefined });
    },
  });

  const { data: followUpData = [] } = useQuery({
    queryKey: ['followUpData', selectedKab],
    queryFn: async () => {
      const res = await apiClient.dashboard.getFollowUp().catch(() => null);
      return Array.isArray(res?.data) ? res.data : [];
    },
  });

  const { data: schools = [] } = useQuery({
    queryKey: ['schools', selectedKab, activeKecamatan],
    queryFn: () => database.getSchools({
      kabupaten: selectedKab || undefined,
      kecamatan: activeKecamatan || undefined
    }),
  });

  const { data: radarData = [] } = useQuery({
    queryKey: ['radarBenchmarking'],
    queryFn: () => database.getRadarBenchmarkingData('dummy-id'),
  });

  const anomalies = [
    { id: '1', title: 'Ketidaksesuaian Data TIK', description: '5 sekolah melaporkan kesiapan 100% namun tidak memiliki lab komputer.', severity: 'medium' as const },
    { id: '2', title: 'Respons Mandek', description: 'Kec. Sedati tidak ada penambahan respons dalam 48 jam terakhir.', severity: 'high' as const }
  ];

  const recommendations = [
    { id: '1', context: 'Manajemen Kelas', suggestion: 'Jawaban Anda mengindikasikan kesulitan dalam manajemen kelas interaktif.', actionText: 'Pelajari Modul 4 (Hal. 12)', actionLink: '#' },
    { id: '2', context: 'Keterlibatan Orang Tua', suggestion: 'Skor kemitraan Anda di bawah rata-rata kecamatan.', actionText: 'Lihat Panduan Komite', actionLink: '#' }
  ];

  // Real KPI Calculations (from API summaryResponse or fallback schools array)
  const total = Number(summaryResponse?.total_sekolah || schools.length || 1238);
  const sudah = Number(summaryResponse?.sudah || 0);
  const sebagian = Number(summaryResponse?.sebagian || 0);
  const belum = Number(summaryResponse?.belum || (total - sudah - sebagian));
  const rate = Number(summaryResponse?.response_rate || 0.0);

  const followUp = followUpData.length > 0 ? followUpData : schools.filter((s) => s.status === 'belum');
  const totalPages = Math.max(1, Math.ceil(followUp.length / perPage));
  const pagedFollowUp = followUp.slice((currentPage - 1) * perPage, currentPage * perPage);

  const { data: selStatsResponse } = useQuery({
    queryKey: ['selStatsApi'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/sel/summary-stats').catch(() => null);
      return res?.data;
    },
    enabled: userRole === 'admin',
  });

  const selStats = selStatsResponse || {
    totalDiobservasi: 0,
    rataGuruAll: 0,
    rataMuridAll: 0,
    butuhIntervensi: 0,
    topSekolah: '-',
  };

  const reminderMutation = useMutation({
    mutationFn: (id: string) => database.sendReminder(id),
    onSuccess: (_, id) => {
      setRemindedSchools((p) => ({ ...p, [id]: true }));
      setLoadingReminder(null);
    },
  });

  // ─── USER DASHBOARD (Pengawas & Sekolah) ───
  if (userRole === 'pengawas' || userRole === 'sekolah') {
    const mockProgresses = [100, 75, 40];
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-surface border border-border p-6 shadow-card">
          <div className="max-w-2xl">
            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-status-sudah"></span>
              <span>Sesi Aktif</span>
            </p>
            <h2 className="text-2xl font-bold font-display text-text-primary mb-2">Halo, SD Negeri Candi 1</h2>
            <p className="text-text-secondary text-xs leading-relaxed mb-5">
              Anda telah melengkapi <strong>2 dari 3</strong> Modul BSAN (Budaya Sekolah Aman dan Nyaman) tahun 2026. Selesaikan modul tersisa untuk mendapatkan sertifikat dan rapor mutu sekolah.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/kuisioner" className="inline-flex items-center space-x-2 bg-primary text-white rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-primary-dark transition-all shadow-xs">
                <BookOpen className="h-4 w-4" />
                <span>Lanjutkan Survei</span>
              </Link>
              <button 
                onClick={() => alert('Rapor sementara berhasil diunduh. Silakan cek folder Download Anda.')}
                className="inline-flex items-center space-x-2 bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-border/40 transition-all"
              >
                <Download className="h-4 w-4 text-text-secondary" />
                <span>Unduh Rapor Mutu</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-text-primary font-display">Progres Pengisian Modul</h3>
            </div>
             <div className="grid grid-cols-3 gap-4">
              {modulProgress.map((mod, idx) => {
                const prog = mockProgresses[idx];
                const r = 34;
                const circ = 2 * Math.PI * r;
                return (
                  <div key={mod.id} className="flex flex-col items-center text-center">
                    <div className="relative h-20 w-20 mb-3">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="6" className="stroke-border" />
                        <circle
                          cx="40" cy="40" r={r} fill="none" strokeWidth="6"
                          strokeLinecap="round"
                          className="ring-animate"
                          style={{
                            stroke: prog === 100 ? 'var(--status-sudah)' : prog > 0 ? 'var(--color-accent)' : 'var(--status-netral)',
                            strokeDasharray: circ,
                            strokeDashoffset: circ * (1 - prog / 100),
                          }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-primary">
                        <AnimatedCounter value={prog} suffix="%" />
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-text-secondary leading-tight h-8 flex items-center">
                      {mod.nama.replace(/^Modul \d+: /, '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-text-primary font-display">Profil Sekolah</h3>
            </div>
            <div className="space-y-3.5 text-xs">
              {[
                ['Nama Sekolah', 'SDN Candi 1 Sidoarjo'],
                ['NPSN', '20501980'],
                ['Akreditasi', 'A (Sangat Baik)'],
                ['Kabupaten', 'Kab. Sidoarjo'],
                ['Jenjang', 'SD (Negeri)'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-text-secondary font-medium">{label}</span>
                  <span className="text-text-primary font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Radar Benchmarking */}
          <div className="lg:col-span-1 rounded-2xl bg-surface p-6 shadow-card border border-border">
            <h3 className="text-base font-bold text-text-primary font-display mb-2">Benchmarking Kinerja</h3>
            <p className="text-[11px] text-text-secondary">Perbandingan skor sekolah Anda dengan rata-rata kecamatan</p>
            <RadarBenchmarkingChart data={radarData} />
          </div>

          {/* Smart Recommendations */}
          <div className="lg:col-span-1">
            <RecommendationWidget recommendations={recommendations} />
          </div>

          {/* Pengumuman Dinas */}
          <div className="lg:col-span-1 rounded-2xl bg-surface p-6 shadow-card border border-border flex flex-col">
            <div className="flex items-center space-x-2 mb-4 border-b border-border/50 pb-3">
              <AlertCircle className="h-5 w-5 text-accent" />
              <h3 className="text-base font-bold text-text-primary font-display">Informasi Dinas</h3>
            </div>
            
            <div className="space-y-4 flex-1">
              {announcements.map((ann) => (
                <div 
                  key={ann.id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className={`p-4 rounded-xl border transition-smooth cursor-pointer group ${
                    ann.type === 'Penting' 
                      ? 'bg-primary/5 border-primary/10 hover:border-primary/30' 
                      : 'bg-bg border-border/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${ann.type === 'Penting' ? 'text-primary' : 'text-text-secondary'}`}>
                      {ann.type}
                    </span>
                    <span className="text-[10px] text-text-secondary">{ann.date}</span>
                  </div>
                  <h4 className={`font-bold text-sm mb-1 transition-colors ${ann.type === 'Penting' ? 'text-primary group-hover:text-primary-dark' : 'text-text-primary group-hover:text-primary'}`}>
                    {ann.title}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-smooth">
              Lihat Semua Pengumuman
            </button>
          </div>
        </div>
        
        {/* Modal Pengumuman */}
        {selectedAnnouncement && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 animate-fade-in px-4">
            <div className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full border border-border overflow-hidden transform animate-scale-in">
              <div className="flex justify-between items-center p-6 border-b border-border/50 bg-bg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className={`h-5 w-5 ${selectedAnnouncement.type === 'Penting' ? 'text-primary' : 'text-accent'}`} />
                  <h3 className="font-bold text-text-primary">Detail Pengumuman</h3>
                </div>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-1.5 rounded-lg text-text-secondary hover:bg-border/40 transition-smooth"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-md mb-2 ${
                    selectedAnnouncement.type === 'Penting' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                  }`}>
                    {selectedAnnouncement.type}
                  </span>
                  <h2 className="text-xl font-bold text-text-primary mb-1">{selectedAnnouncement.title}</h2>
                  <p className="text-xs text-text-secondary">{selectedAnnouncement.date}</p>
                </div>
                <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed bg-bg/50 p-4 rounded-xl border border-border/50">
                  {selectedAnnouncement.content}
                </div>
              </div>
              <div className="p-4 border-t border-border/50 bg-bg flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    alert('Tautan pengumuman berhasil disalin ke papan klip.');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary bg-surface hover:bg-border/40 border border-border/50 rounded-lg flex items-center space-x-1.5 transition-smooth"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Bagikan</span>
                </button>
                <button 
                  onClick={() => {
                    alert('Pesan telah ditandai sebagai dibaca.');
                    setSelectedAnnouncement(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg flex items-center space-x-1.5 transition-smooth shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Tandai Dibaca</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // ─── ADMIN DINAS DASHBOARD ───
  const kpiCards = [
    { label: 'Total Sasaran Sekolah', value: total, isPct: false, sub: 'SD Terdaftar', icon: Users, color: 'text-primary', bg: 'bg-primary/8' },
    { label: 'Lengkap Mengisi', value: sudah, isPct: false, sub: 'Status Lengkap', icon: CheckCircle2, color: 'text-status-sudah', bg: 'bg-status-sudah/8' },
    { label: 'Sebagian Mengisi', value: sebagian, isPct: false, sub: 'Proses Mengisi', icon: AlertCircle, color: 'text-status-sebagian', bg: 'bg-status-sebagian/8' },
    { label: 'Response Rate', value: rate, isPct: true, sub: 'Tingkat Partisipasi', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/8' },
  ];

  return (
    <div className="space-y-6">
      {/* Kabupaten Filter Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-surface p-4 shadow-card border border-border">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Wilayah Target:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setSelectedKab(''); setActiveKecamatan(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-smooth cursor-pointer ${
              selectedKab === '' ? 'bg-primary text-white shadow-sm' : 'bg-bg text-text-secondary hover:text-text-primary'
            }`}
          >
            Semua Wilayah ({total.toLocaleString()} SD)
          </button>
          {KABUPATEN_LIST.filter(k => k.key !== 'semua').map((k) => (
            <button
              key={k.id}
              onClick={() => { setSelectedKab(k.name); setActiveKecamatan(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-smooth cursor-pointer ${
                selectedKab === k.name ? 'bg-primary text-white shadow-sm' : 'bg-bg text-text-secondary hover:text-text-primary'
              }`}
            >
              {k.name}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-2xl bg-surface p-5 shadow-card border border-border card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
              <h3 className={`text-2xl font-bold font-display ${kpi.color}`}>
                <AnimatedCounter value={kpi.value} suffix={kpi.isPct ? '%' : ''} decimals={kpi.isPct ? 1 : 0} />
              </h3>
              <p className="text-[11px] text-text-secondary font-medium mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* SEL Insight Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">Observasi SEL • Ringkasan Lapangan</h4>
            <p className="text-[10px] text-text-secondary mt-0.5">
              {(selStats?.totalDiobservasi || 0) > 0
                ? `Data dari ${selStats.totalDiobservasi} sekolah yang telah diobservasi enumerator`
                : 'Belum ada data observasi SEL terdaftar (0 Sesi Selesai)'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-center">
          {[
            { label: 'Diobservasi', value: `${selStats?.totalDiobservasi || 0} SD`, icon: Users, color: 'text-primary' },
            { label: 'Rata Guru', value: `${(selStats?.rataGuruAll || 0).toFixed(1)}/4`, icon: GraduationCap, color: 'text-status-sudah' },
            { label: 'Rata Murid', value: `${(selStats?.rataMuridAll || 0).toFixed(1)}/4`, icon: Users, color: 'text-accent' },
            { label: 'Perlu Intervensi', value: `${selStats?.butuhIntervensi || 0} SD`, icon: AlertTriangle, color: 'text-status-belum' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-1.5 bg-surface rounded-xl px-3 py-2 border border-border/60">
                <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                <div className="text-left">
                  <div className={`text-[11px] font-black ${item.color}`}>{item.value}</div>
                  <div className="text-[9px] text-text-secondary">{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>
        <Link to="/analisis-sel"
          className="flex-shrink-0 text-[11px] font-bold text-primary hover:text-primary-dark flex items-center gap-1.5 whitespace-nowrap transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl">
          <span>Lihat Analisis SEL</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Row 2: Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-surface p-6 shadow-card border border-border flex flex-col justify-between h-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
            <div>
              <h3 className="text-base font-bold text-text-primary font-display">
                Kinerja Respon per {selectedKab ? 'Kecamatan' : 'Kabupaten / Kota'}
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5">Klik pada bar untuk drill-down filter wilayah</p>
            </div>
            {activeKecamatan && (
              <button onClick={() => setActiveKecamatan(null)} className="text-xs font-semibold text-primary hover:underline cursor-pointer">
                Reset Filter
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                key={`barchart-${selectedKab || 'all'}-${activeKecamatan || 'none'}`}
                data={(selectedKab ? kecStats : kabStats) as any[]}
                margin={{ top: 5, right: 5, left: -25, bottom: 40 }}
                onClick={(d) => {
                  if (d?.activeLabel) {
                    if (!selectedKab) {
                      setSelectedKab(d.activeLabel as string);
                    } else {
                      setActiveKecamatan(d.activeLabel as string);
                    }
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey={selectedKab ? 'kecamatan' : 'kabupaten'}
                  tickFormatter={(v) => v.replace('Kec. ', '')}
                  angle={-45} textAnchor="end" interval={0}
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 100]} tickFormatter={(v) => `${v}%`}
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(74,87,196,0.04)' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 12, fontSize: 12,
                    boxShadow: 'var(--shadow-card)',
                  }}
                  formatter={(v) => [`${v}%`, 'Response Rate']}
                  labelFormatter={(l) => `Wilayah: ${l}`}
                />
                <Bar
                  key={`bar-${selectedKab || 'all'}-${activeKecamatan || 'none'}`}
                  dataKey="rate"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {(selectedKab ? kecStats : kabStats).map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.rate >= 40 ? 'var(--status-sudah)' : entry.rate >= 20 ? 'var(--status-sebagian)' : 'var(--status-belum)'}
                      className="cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column: Modules progress + Sentiment Analysis */}
        <div className="space-y-5">
          {/* Ring Chart Modules */}
          <div className="rounded-2xl bg-surface p-6 shadow-card border border-border">
            <h3 className="text-base font-bold text-text-primary font-display mb-5">Progres Modul BSAN</h3>
            <div className="space-y-4">
              {modulProgress.map((mod) => {
                const r = 22;
                const circ = 2 * Math.PI * r;
                return (
                  <div key={mod.id} className="flex items-center space-x-4">
                    <div className="relative h-14 w-14 flex-shrink-0">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r={r} fill="none" strokeWidth="4.5" className="stroke-border" />
                        <circle
                          cx="26" cy="26" r={r} fill="none" strokeWidth="4.5"
                          strokeLinecap="round" className="ring-animate"
                          style={{
                            stroke: 'var(--color-accent)',
                            strokeDasharray: circ,
                            strokeDashoffset: circ * (1 - mod.progres / 100),
                          }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-text-primary">
                        <AnimatedCounter value={mod.progres} suffix="%" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{mod.nama}</p>
                      <p className="text-[10px] text-text-secondary">{mod.terisi}/{mod.totalPertanyaan} pertanyaan terisi</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sentiment Analysis Widget */}
          <div className="rounded-2xl bg-surface p-6 shadow-card border border-border">
            <h3 className="text-base font-bold text-text-primary font-display mb-4">Analisis Sentimen Masukan</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-text-secondary">Ulasan Positif</span>
                <span className="font-bold text-status-sudah">72.4% (312 Masukan)</span>
              </div>
              <div className="w-full bg-border h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-status-sudah h-full" style={{ width: '72.4%' }} title="Positif"></div>
                <div className="bg-status-sebagian h-full" style={{ width: '18.2%' }} title="Netral"></div>
                <div className="bg-status-belum h-full" style={{ width: '9.4%' }} title="Negatif"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-status-sudah"></span>
                  <span className="text-text-secondary">Positif (72%)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-status-sebagian"></span>
                  <span className="text-text-secondary">Netral (18%)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-status-belum"></span>
                  <span className="text-text-secondary">Negatif (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Analytics & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl bg-surface p-6 shadow-card border border-border mt-5">
          <h3 className="text-base font-bold text-text-primary font-display mb-2">Tren Pengisian 7 Hari Terakhir</h3>
          <p className="text-[11px] text-text-secondary">Akumulasi sekolah yang sudah dan sedang mengisi survei</p>
          <TimeSeriesChart data={timeSeriesData} />
        </div>
        
        <div>
          <GamificationLeaderboard data={kecStats} />
        </div>
      </div>

      {/* Row 4: Follow-up Prioritas & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <div className="rounded-2xl bg-surface p-6 shadow-card border border-border">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-text-primary font-display">Aktivitas Terbaru</h3>
          </div>
          <div className="space-y-3">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/40 pb-2.5 last:border-0 hover:bg-bg/50 transition-colors p-1 -mx-1 rounded-lg cursor-pointer">
                <div className="min-w-0 mr-2">
                  <p className="text-xs font-semibold text-text-primary truncate">{act.schoolName}</p>
                  <span className="text-[10px] text-text-secondary">{act.time}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  act.status === 'sudah' ? 'bg-status-sudah/10 text-status-sudah' : 'bg-status-sebagian/10 text-status-sebagian'
                }`}>
                  {act.status === 'sudah' ? 'Lengkap' : 'Sebagian'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-text-primary font-display">Prioritas Follow-Up</h3>
            </div>
            <span className="text-[10px] font-bold bg-bg px-2.5 py-1 rounded-full text-text-secondary">
              <AnimatedCounter value={followUp.length} suffix=" Sekolah" />
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {pagedFollowUp.map((sch) => {
              const reminded = remindedSchools[sch.id];
              const loading = loadingReminder === sch.id;
              return (
                <div key={sch.id} className="flex items-center justify-between p-3 rounded-xl bg-bg/60 border border-border/60">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-xs font-semibold text-text-primary truncate">{sch.nama}</p>
                    <p className="text-[10px] text-text-secondary">{sch.kecamatan} • {sch.kabupaten}</p>
                  </div>
                  <button
                    onClick={() => { setLoadingReminder(sch.id); reminderMutation.mutate(sch.id); }}
                    disabled={reminded || loading}
                    className={`flex-shrink-0 flex items-center space-x-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-smooth cursor-pointer ${
                      reminded ? 'bg-status-sudah/10 text-status-sudah' : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {reminded ? <><Check className="h-3 w-3" /><span>Sudah Terkirim</span></> : <><Send className="h-3 w-3" /><span>Reminder</span></>}
                  </button>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-1 pt-2 border-t border-border/50">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 text-text-secondary hover:bg-bg disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-text-secondary px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-text-secondary hover:bg-bg disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="h-full">
          <AnomalyWidget anomalies={anomalies} />
        </div>
      </div>
    </div>
  );
}
