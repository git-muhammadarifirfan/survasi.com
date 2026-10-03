/**
 * @module features/laporan/pages
 * @description Laporan & Ekspor — pusat unduhan data REAL dari database dalam format
 *   Excel (.xlsx, multi-sheet) dan CSV. Setiap laporan diambil langsung dari API saat
 *   tombol ditekan, sehingga isinya selalu data terbaru sesuai filter wilayah/status.
 * @api GET /api/responden/export-full, /api/sel/export-full, /api/sekolah, /api/dashboard/*,
 *      /api/analisis/matriks, POST /api/laporan/generate, GET /api/laporan/history
 */
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileSpreadsheet, FileText, Brain, Building2, BarChart3, Grid3X3, ClipboardList, Search,
  Loader2, History, ChevronLeft, ChevronRight, Download,
} from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import { notifyToast } from '../../../shared/components/NotificationToast';
import { exportTable, type ExportFormat, type ExportPayload } from '../../../shared/utils/tableExport';
import {
  buildSurveiLengkap, buildObservasiSel, buildStatusSekolah, buildRekapWilayah, buildMatriks, fetchSchools,
  type ReportFilter,
} from '../../../shared/utils/reportBuilders';
import {
  Card, EmptyState, StatusBadge, WilayahFilter, wilayahText, timeAgo, type WilayahValue,
} from '../../../shared/components/analytics/AnalyticsUI';
import CustomSelect from '../../../shared/components/CustomSelect';

interface ReportDef {
  id: string;
  icon: typeof FileText;
  title: string;
  desc: string;
  build: (f: ReportFilter) => Promise<ExportPayload>;
  usesStatus?: boolean;
}

const REPORTS: ReportDef[] = [
  { id: 'survei', icon: ClipboardList, title: 'Data Lengkap Survei BSAN', desc: 'Seluruh responden beserta pertanyaan & jawaban', build: buildSurveiLengkap },
  { id: 'sel', icon: Brain, title: 'Data Observasi SEL', desc: 'Sesi observasi, skor indikator & catatan observer', build: buildObservasiSel },
  { id: 'sekolah', icon: Building2, title: 'Status Pengisian Sekolah', desc: 'Daftar sekolah sasaran dengan status pengisian', build: buildStatusSekolah, usesStatus: true },
  { id: 'wilayah', icon: BarChart3, title: 'Rekap Partisipasi Wilayah', desc: 'Capaian selesai/proses/belum per kecamatan & kabupaten', build: buildRekapWilayah },
  { id: 'matriks', icon: Grid3X3, title: 'Matriks 4 Kuadran', desc: 'Penerimaan modul vs implementasi per kecamatan', build: buildMatriks },
];

export default function LaporanEkspor() {
  const qc = useQueryClient();
  const [wilayah, setWilayah] = useState<WilayahValue>({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filter: ReportFilter = {
    kabupaten_id: wilayah.kabupatenId,
    kabupaten_nama: wilayah.kabupatenNama,
    kecamatan: wilayah.kecamatan,
    status: status || undefined,
  };

  const schoolsQ = useQuery({
    queryKey: ['laporan-schools', wilayah.kabupatenId ?? 'all', wilayah.kecamatan ?? 'all', status],
    queryFn: () => fetchSchools(filter),
    refetchInterval: 60_000,
  });
  const historyQ = useQuery({
    queryKey: ['laporan-history'],
    queryFn: async () => (await apiClient.laporan.getHistory()).data || [],
    refetchInterval: false,
  });

  const schools = schoolsQ.data || [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? schools.filter((x: any) => x.nama?.toLowerCase().includes(q) || String(x.npsn || '').includes(q)) : schools;
  }, [schools, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  const runExport = async (r: ReportDef, format: ExportFormat) => {
    const key = `${r.id}-${format}`;
    setBusy(key);
    try {
      const payload = await r.build(r.usesStatus ? filter : { ...filter, status: undefined });
      if (payload.sheets.every(sh => sh.rows.length === 0)) {
        notifyToast({ type: 'warning', title: 'Data Kosong', message: `Belum ada data untuk "${r.title}" pada filter ini. File tetap diunduh berisi header.` });
      }
      const fileName = exportTable(payload, format);
      apiClient.laporan.generate({ tipe: format === 'xlsx' ? 'excel' : 'csv', nama_file: fileName, filter: { ...filter, laporan: r.id, format } })
        .then(() => qc.invalidateQueries({ queryKey: ['laporan-history'] }))
        .catch(() => {});
      notifyToast({ type: 'success', title: 'Ekspor Berhasil', message: `${fileName} berhasil diunduh.` });
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Ekspor Gagal', message: err?.message || 'Gagal mengambil data dari server.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display text-text-primary flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" /> Laporan & Ekspor
          </h1>
          <p className="text-xs text-text-secondary mt-1">Unduh data dari database • {wilayahText(wilayah)}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <WilayahFilter value={wilayah} onChange={(v) => { setWilayah(v); setPage(1); }} showKecamatan={false} />
          <div className="w-full sm:w-40">
            <CustomSelect
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'sudah', label: 'Selesai' },
                { value: 'sebagian', label: 'Proses' },
                { value: 'belum', label: 'Belum' },
              ]}
              value={status}
              onChange={(v) => { setStatus(v); setPage(1); }}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Report list */}
      <div className="space-y-3">
        {REPORTS.map(r => {
          const Icon = r.icon;
          const xlsxKey = `${r.id}-xlsx`;
          const csvKey = `${r.id}-csv`;
          return (
            <div key={r.id} className="rounded-2xl bg-surface border border-border shadow-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-text-primary font-display">{r.title}</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">{r.desc}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" disabled={!!busy} onClick={() => runExport(r, 'xlsx')}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer">
                  {busy === xlsxKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />} Excel
                </button>
                <button type="button" disabled={!!busy} onClick={() => runExport(r, 'csv')}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-bg border border-border text-text-primary hover:bg-border/40 transition disabled:opacity-50 cursor-pointer">
                  {busy === csvKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} CSV
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview + history */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2" title="Pratinjau Sekolah" subtitle={`${filtered.length.toLocaleString('id-ID')} sekolah sesuai filter`}
          right={
            <div className="relative w-44 sm:w-56">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama / NPSN"
                className="w-full h-9 pl-8 pr-3 rounded-xl border border-border bg-bg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          }>
          {schoolsQ.isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : rows.length === 0 ? <EmptyState message="Tidak ada sekolah sesuai filter." /> : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[680px] text-xs">
                  <thead>
                    <tr className="text-left text-text-secondary border-b border-border">
                      <th className="py-2.5 px-3 font-semibold w-12">No.</th>
                      <th className="py-2.5 px-3 font-semibold">Sekolah</th>
                      <th className="py-2.5 px-2 font-semibold">Wilayah</th>
                      <th className="py-2.5 px-2 font-semibold">Status</th>
                      <th className="py-2.5 px-2 font-semibold">Akun</th>
                      <th className="py-2.5 px-3 font-semibold">Aktivitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((x: any, i: number) => (
                      <tr key={x.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 px-3 text-text-secondary tabular-nums">{(page - 1) * perPage + i + 1}</td>
                        <td className="py-2.5 px-3"><p className="font-semibold text-text-primary">{x.nama}</p><p className="text-[10px] text-text-secondary">NPSN {x.npsn}</p></td>
                        <td className="py-2.5 px-2 text-text-secondary">{x.kecamatan}<br /><span className="text-[10px]">{x.kabupaten}</span></td>
                        <td className="py-2.5 px-2"><StatusBadge status={x.status} /></td>
                        <td className="py-2.5 px-2 text-text-secondary">{Number(x.is_registered) ? 'Terdaftar' : '-'}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{x.last_updated ? timeAgo(x.last_updated) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/50 text-xs text-text-secondary">
                  <span>Hal. {page} dari {pages}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-border hover:bg-bg disabled:opacity-30 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg border border-border hover:bg-bg disabled:opacity-30 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        <Card title="Riwayat Ekspor" subtitle="20 ekspor terakhir" right={<History className="h-4 w-4 text-text-secondary" />}>
          {(historyQ.data || []).length === 0 ? <EmptyState title="Belum ada riwayat" message="File yang Anda unduh akan tercatat di sini." /> : (
            <ul className="divide-y divide-border/50">
              {(historyQ.data || []).map((h: any) => (
                <li key={h.id} className="py-2.5 flex items-center gap-2.5">
                  {String(h.nama_file).endsWith('.csv') ? <FileText className="h-4 w-4 text-text-secondary shrink-0" /> : <FileSpreadsheet className="h-4 w-4 text-status-sudah shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{h.nama_file}</p>
                    <p className="text-[10px] text-text-secondary">{timeAgo(h.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
