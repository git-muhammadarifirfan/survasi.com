/**
 * @module features/analisis/pages
 * @description Gap Funnel implementasi BSAN — 6 tahap dari total sekolah sasaran sampai
 *   implementasi penuh. Semua angka dihitung realtime per sekolah dari database; rekomendasi
 *   tindak lanjut dibentuk dari tahap dengan penyusutan terbesar.
 * @api GET /api/analisis/funnel?kabupaten_id=&kecamatan=
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, ArrowDownRight, Lightbulb, MapPin } from 'lucide-react';
import { apiClient, withQuery } from '../../../shared/services/api-client';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import ConnectionErrorCard from '../../../shared/components/ConnectionErrorCard';
import ExportMenu from '../../../shared/components/ExportMenu';
import { exportTable } from '../../../shared/utils/tableExport';
import {
  PageHeader, Card, EmptyState, WilayahFilter, wilayahQuery, wilayahText, type WilayahValue,
} from '../../../shared/components/analytics/AnalyticsUI';

interface GapFunnelProps {
  activeKecamatan: string | null;
}

interface Stage { key: string; name: string; schools: number; percentage: number; dropOff: number }
interface KecRow { kecamatan: string; kabupaten: string; total: number; mulai: number; selesai: number; menerima: number; implementasi: number; penuh: number; konversi: number }

const STAGE_COLORS = ['#312E81', '#4F46E5', '#0D9488', '#7C3AED', '#F59E0B', '#10B981'];

const ADVICE: Record<string, string> = {
  mulai: 'Banyak sekolah belum mulai mengisi. Kirim pengingat dari Dashboard → Prioritas Follow-Up dan pastikan akun sekolah sudah terdaftar.',
  selesai: 'Sekolah sudah mulai mengisi tetapi belum mengirim. Hubungi operator sekolah berstatus "Proses" agar menyelesaikan kuesioner.',
  menerima: 'Responden yang mengisi banyak yang belum menerima materi modul. Prioritaskan diseminasi/pelatihan modul BSAN di wilayah ini.',
  implementasi: 'Modul sudah diterima tetapi belum diterapkan di kelas. Perlu pendampingan praktik (KKG, supervisi kepala sekolah).',
  penuh: 'Implementasi masih sebagian. Dorong penerapan seluruh alur/tema dan refleksi rutin agar implementasi menjadi penuh.',
};

export default function GapFunnel({ activeKecamatan }: GapFunnelProps) {
  const [wilayah, setWilayah] = useState<WilayahValue>({ kecamatan: activeKecamatan || undefined });

  useEffect(() => {
    if (activeKecamatan) setWilayah(w => ({ ...w, kecamatan: activeKecamatan }));
  }, [activeKecamatan]);

  const { data, isLoading, isError, error, refetch, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ['funnel', wilayah.kabupatenId, wilayah.kecamatan],
    queryFn: async () => {
      const res: any = await apiClient.get<Stage[]>(withQuery('/analisis/funnel', wilayahQuery(wilayah)));
      return { stages: (res.data || []) as Stage[], perKecamatan: (res.perKecamatan || []) as KecRow[], total: Number(res.totalSasaran || 0) };
    },
  });

  const stages = data?.stages || [];
  const perKec = data?.perKecamatan || [];
  const worst = stages.slice(1).filter(s => s.dropOff > 0).sort((a, b) => b.dropOff - a.dropOff).slice(0, 3);

  const handleExport = (format: 'xlsx' | 'csv') => exportTable({
    title: 'Analisis Gap Funnel Implementasi BSAN',
    wilayah: wilayahText(wilayah),
    filename: `Gap_Funnel_${wilayahText(wilayah)}`,
    sheets: [
      { name: 'Funnel', columns: ['Tahap', 'Jumlah Sekolah', 'Dari Total (%)', 'Penyusutan dari Tahap Sebelumnya (%)'],
        rows: stages.map(s => [s.name, s.schools, s.percentage, s.dropOff]) },
      { name: 'Per Kecamatan', columns: ['Kabupaten/Kota', 'Kecamatan', 'Total Sekolah', 'Mulai Mengisi', 'Selesai Survei', 'Menerima Modul', 'Implementasi', 'Implementasi Penuh', 'Konversi Selesai (%)'],
        rows: perKec.map(r => [r.kabupaten, r.kecamatan, r.total, r.mulai, r.selesai, r.menerima, r.implementasi, r.penuh, r.konversi]) },
    ],
  }, format);

  if (isError) {
    return <ConnectionErrorCard title="Gagal Memuat Gap Funnel" message={(error as any)?.message || 'Gagal terhubung ke server.'} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <PageHeader
        icon={<Layers className="h-5 w-5" />}
        title="Analisis Gap Funnel Implementasi BSAN"
        subtitle={`Konversi & penyusutan dari total sekolah sasaran hingga implementasi penuh — ${wilayahText(wilayah)}`}
        actions={<><WilayahFilter value={wilayah} onChange={setWilayah} /><ExportMenu disabled={!stages.length} onExport={handleExport} /></>}
      />

      {isLoading ? (
        <div className="py-20 rounded-2xl bg-surface border border-border"><ThreeDotsLoader text="Menghitung funnel..." /></div>
      ) : !data?.total ? (
        <Card><EmptyState title="Tidak ada sekolah sasaran" message="Tidak ada sekolah pada filter wilayah ini." /></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2" title="Diagram Corong Konversi" right={
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Sasaran: {data.total.toLocaleString('id-ID')} sekolah</span>
            }>
              <div className="space-y-3">
                {stages.map((s, idx) => (
                  <div key={s.key}>
                    <div className="flex items-center justify-between gap-3 text-xs mb-1">
                      <span className="font-semibold text-text-primary">{idx + 1}. {s.name}</span>
                      <span className="font-bold tabular-nums text-text-primary shrink-0">{s.schools.toLocaleString('id-ID')} <span className="text-text-secondary font-medium">({s.percentage}%)</span></span>
                    </div>
                    <div className="h-9 rounded-xl bg-border/40 overflow-hidden">
                      <div className="h-full rounded-xl transition-all duration-700 flex items-center px-3"
                        style={{ width: `${Math.max(s.percentage, s.schools > 0 ? 2 : 0)}%`, backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length] }} />
                    </div>
                    {idx > 0 && s.dropOff > 0 && (
                      <p className="mt-1 text-[11px] font-semibold text-status-belum flex items-center gap-1">
                        <ArrowDownRight className="h-3.5 w-3.5" /> Penyusutan {s.dropOff}% dari tahap sebelumnya
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Rekomendasi Tindak Lanjut" subtitle="Dihitung dari tahap dengan penyusutan terbesar">
              {worst.length === 0 ? (
                <EmptyState title="Tidak ada penyusutan" message="Seluruh sekolah sasaran berhasil melewati semua tahap." />
              ) : (
                <ul className="space-y-3">
                  {worst.map(s => (
                    <li key={s.key} className="p-3.5 rounded-xl bg-bg border border-border/60">
                      <p className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4 text-status-sebagian" />
                        {s.name} <span className="text-status-belum">(-{s.dropOff}%)</span>
                      </p>
                      <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">{ADVICE[s.key]}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card title="Rincian per Kecamatan" subtitle="Diurutkan dari konversi selesai survei terendah (prioritas pendampingan)">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[720px] text-xs">
                <thead>
                  <tr className="text-left text-text-secondary border-b border-border">
                    <th className="py-2.5 px-4 font-semibold">Kecamatan</th>
                    {['Sasaran', 'Mulai', 'Selesai', 'Terima Modul', 'Implementasi', 'Penuh'].map(h => (
                      <th key={h} className="py-2.5 px-2 font-semibold text-right">{h}</th>
                    ))}
                    <th className="py-2.5 px-4 font-semibold">Konversi</th>
                  </tr>
                </thead>
                <tbody>
                  {perKec.map(r => (
                    <tr key={`${r.kabupaten}-${r.kecamatan}`} className="border-b border-border/50 last:border-0 hover:bg-bg/60">
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-text-primary flex items-center gap-1"><MapPin className="h-3 w-3 text-text-secondary" />{r.kecamatan}</span>
                        <span className="text-[10px] text-text-secondary">{r.kabupaten}</span>
                      </td>
                      {[r.total, r.mulai, r.selesai, r.menerima, r.implementasi, r.penuh].map((v, i) => (
                        <td key={i} className="py-2.5 px-2 text-right tabular-nums">{v}</td>
                      ))}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 min-w-[60px] rounded-full bg-border/60 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${r.konversi}%`, backgroundColor: r.konversi >= 50 ? 'var(--status-sudah)' : r.konversi > 0 ? 'var(--status-sebagian)' : 'var(--status-belum)' }} />
                          </div>
                          <span className="tabular-nums font-semibold w-9 text-right">{r.konversi}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
