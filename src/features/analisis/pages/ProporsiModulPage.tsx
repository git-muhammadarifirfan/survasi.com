/**
 * @module features/analisis/pages
 * @description Proporsi Modul BSAN — seluruh visualisasi dihitung realtime dari jawaban
 *   survei di database (responden_survey + jawaban_survey). Narasi insight dibentuk
 *   otomatis dari angka aktual, tanpa teks klaim statis.
 * @api GET /api/analisis/proporsi?kabupaten_id=&kecamatan=
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  PieChart as PieIcon, GraduationCap, TrendingUp, BookOpen, Users, Award, Building2, Quote,
} from 'lucide-react';
import { database } from '../../../shared/data/data-source';
import type { ProporsiModulData } from '../../../shared/data/data-source';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import ConnectionErrorCard from '../../../shared/components/ConnectionErrorCard';
import ExportMenu from '../../../shared/components/ExportMenu';
import { exportTable } from '../../../shared/utils/tableExport';
import {
  PageHeader, Card, StatCard, BarList, StackedRow, Legend, EmptyState,
  WilayahFilter, wilayahText, type WilayahValue,
} from '../../../shared/components/analytics/AnalyticsUI';

const TABS = [
  { id: 'penerima', label: 'Penerima Modul', icon: PieIcon },
  { id: 'pelatihan', label: 'Pelatihan', icon: GraduationCap },
  { id: 'implementasi', label: 'Implementasi', icon: TrendingUp },
  { id: 'kemudahan', label: 'Kemudahan Modul', icon: BookOpen },
  { id: 'keterlibatan', label: 'Media & Keaktifan', icon: Users },
  { id: 'dukungan', label: 'Dukungan Kepsek', icon: Award },
  { id: 'profil', label: 'Profil Sekolah', icon: Building2 },
] as const;
type TabId = typeof TABS[number]['id'];

const C = {
  sudah: '#10B981', sebagian: '#F59E0B', tidak: '#94A3B8', belum: '#F43F5E',
  indigo: '#4F46E5', violet: '#7C3AED', teal: '#0D9488',
};

const IMPL_SEGMENTS = (r: { belumMenerima: number; tidakMenerapkan: number; sebagian: number; sudah: number }) => [
  { key: 'sudah', label: 'Sudah seluruhnya', value: r.sudah, color: C.sudah },
  { key: 'sebagian', label: 'Sebagian', value: r.sebagian, color: C.sebagian },
  { key: 'tidak', label: 'Menerima, belum menerapkan', value: r.tidakMenerapkan, color: C.tidak },
  { key: 'belum', label: 'Belum menerima modul', value: r.belumMenerima, color: C.belum },
];

/** Kalimat ringkas dari item teratas sebuah distribusi */
function topInsight(items: { label: string; persen: number; jumlah: number }[], noun: string): string | null {
  const top = items.find(i => i.jumlah > 0);
  if (!top) return null;
  return `${noun} paling banyak: "${top.label}" (${top.persen}%, ${top.jumlah} responden).`;
}

function Insight({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="text-xs text-text-secondary leading-relaxed bg-bg border border-border/60 rounded-xl px-3 py-2">{text}</p>;
}

export default function ProporsiModul() {
  const [activeTab, setActiveTab] = useState<TabId>('penerima');
  const [wilayah, setWilayah] = useState<WilayahValue>({});

  const { data, isLoading, isError, error, refetch, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ['proporsiModul', wilayah.kabupatenNama, wilayah.kecamatan],
    queryFn: () => database.getProporsiModulData({ kabupaten: wilayah.kabupatenNama, kecamatan: wilayah.kecamatan }),
  });

  const handleExport = (format: 'xlsx' | 'csv') => {
    if (!data) return;
    const d = data;
    exportTable({
      title: 'Proporsi Modul BSAN',
      wilayah: `${wilayahText(wilayah)} • ${d.totalResponden} responden`,
      filename: `Proporsi_Modul_${wilayahText(wilayah)}`,
      sheets: [
        { name: 'Penerima per Kecamatan', columns: ['Kabupaten/Kota', 'Kecamatan', 'Responden', 'Menerima Modul', 'Menerima (%)', 'Belum (%)'],
          rows: d.distribusiPerKecamatan.map(r => [r.kabupaten, r.kecamatan, r.total, r.jumlahYa, r.ya, r.tidak]) },
        { name: 'Penyelenggara Pelatihan', columns: ['Penyelenggara', 'Jumlah Responden', 'Persen (%)'],
          rows: d.penyelenggaraPelatihan.map(r => [r.nama, r.jumlah, r.persen]) },
        { name: 'Implementasi per Posisi', columns: ['Posisi', 'Responden', 'Sudah (%)', 'Sebagian (%)', 'Belum Menerapkan (%)', 'Belum Menerima (%)'],
          rows: d.statusImplementasiPosisi.map(r => [r.posisi, r.total, r.sudah, r.sebagian, r.tidakMenerapkan, r.belumMenerima]) },
        { name: 'Implementasi per Kecamatan', columns: ['Kecamatan', 'Responden', 'Sudah (%)', 'Sebagian (%)', 'Belum Menerapkan (%)', 'Belum Menerima (%)'],
          rows: d.statusImplementasiKecamatan.map(r => [r.kecamatan, r.total, r.sudah, r.sebagian, r.tidakMenerapkan, r.belumMenerima]) },
        { name: 'Kemudahan & Kesulitan', columns: ['Kelas', 'Kategori', 'Bagian Modul', 'Jumlah', 'Persen (%)'],
          rows: [
            ...d.kemudahanModul.kelasAwal.mudah.map(r => ['Kelas Awal', 'Mudah', r.modul, r.jumlah, r.persen]),
            ...d.kemudahanModul.kelasAwal.sulit.map(r => ['Kelas Awal', 'Sulit', r.modul, r.jumlah, r.persen]),
            ...d.kemudahanModul.kelasTinggi.mudah.map(r => ['Kelas Tinggi', 'Mudah', r.modul, r.jumlah, r.persen]),
            ...d.kemudahanModul.kelasTinggi.sulit.map(r => ['Kelas Tinggi', 'Sulit', r.modul, r.jumlah, r.persen]),
          ] },
        { name: 'Media Pembelajaran', columns: ['Kelas', 'Media', 'Jumlah', 'Persen (%)'],
          rows: [
            ...d.mediaPembelajaran.kelasAwal.map(r => ['Kelas Awal', r.media, r.jumlah, r.persen]),
            ...d.mediaPembelajaran.kelasTinggi.map(r => ['Kelas Tinggi', r.media, r.jumlah, r.persen]),
          ] },
        { name: 'Keaktifan & Refleksi', columns: ['Indikator', 'Pilihan', 'Jumlah', 'Persen (%)'],
          rows: [
            ...d.keterlibatanSiswa.map(r => ['Keaktifan murid', r.kategori, r.jumlah, r.persen]),
            ...d.refleksiMurid.map(r => ['Refleksi dengan murid', r.label, r.jumlah, r.persen]),
            ...d.refleksiGuruFreq.map(r => ['Refleksi dengan guru lain', r.label, r.jumlah, r.persen]),
            ...d.kesepakatanKelas.map(r => ['Kesepakatan kelas', r.label, r.jumlah, r.persen]),
          ] },
        { name: 'Dukungan & Program', columns: ['Kategori', 'Bentuk', 'Jumlah', 'Persen (%)'],
          rows: [
            ...d.dukunganKepsek.map(r => ['Dukungan kepala sekolah', r.metode, r.jumlah, r.persen]),
            ...d.rencanaAksi.map(r => ['Program sekolah', r.program, r.jumlah, r.persen]),
          ] },
        { name: 'Profil Sekolah', columns: ['Kecamatan', 'Jumlah Sekolah', 'Total Guru', 'Total Siswa', 'Rasio Siswa/Guru', 'Sekolah Selesai Survei (%)'],
          rows: d.profilSekolah.map(r => [r.kecamatan, r.jumlahSekolah, r.totalGuru, r.totalSiswa, r.rasio, r.cakupan]) },
      ],
    }, format);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <PageHeader
        icon={<PieIcon className="h-5 w-5" />}
        title="Proporsi Modul BSAN"
        subtitle={data
          ? `${wilayahText(wilayah)} • ${data.totalResponden} responden dari ${data.totalSekolahResponden} sekolah`
          : wilayahText(wilayah)}
        actions={
          <>
            <WilayahFilter value={wilayah} onChange={setWilayah} />
            <ExportMenu disabled={!data} onExport={handleExport} />
          </>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold border transition cursor-pointer ${
                active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-text-secondary border-border hover:text-text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-20 rounded-2xl bg-surface border border-border"><ThreeDotsLoader text="Mengolah data proporsi..." /></div>
      ) : isError || !data ? (
        <ConnectionErrorCard title="Gagal Memuat Proporsi Modul" message={(error as any)?.message || 'Gagal terhubung ke server.'} onRetry={() => refetch()} />
      ) : data.totalResponden === 0 && activeTab !== 'profil' ? (
        <Card><EmptyState title="Belum ada responden" message={`Belum ada survei terkirim untuk ${wilayahText(wilayah)}. Grafik akan muncul otomatis begitu sekolah mengirim survei.`} /></Card>
      ) : (
        <TabContent tab={activeTab} d={data} />
      )}
    </div>
  );
}

function TabContent({ tab, d }: { tab: TabId; d: ProporsiModulData }) {
  if (tab === 'penerima') {
    const p = d.proporsiPenerima;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-5" title="Proporsi Penerima Materi Modul" subtitle={`Dari ${p.totalResponden} responden guru & kepala sekolah`}>
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ name: 'Sudah menerima', value: p.jumlahYa }, { name: 'Belum menerima', value: p.jumlahTidak }]}
                  innerRadius="62%" outerRadius="90%" paddingAngle={3} dataKey="value" stroke="none">
                  <Cell fill={C.sudah} />
                  <Cell fill={C.belum} />
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [`${v} responden`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold font-display text-text-primary">{p.ya}%</span>
              <span className="text-[11px] text-text-secondary">sudah menerima</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <StatCard label="Sudah" value={p.jumlahYa} sub={`${p.ya}% responden`} tone="sudah" />
            <StatCard label="Belum" value={p.jumlahTidak} sub={`${p.tidak}% responden`} tone="belum" />
          </div>
        </Card>
        <Card className="lg:col-span-7" title="Penerima Modul per Kecamatan" subtitle="Persentase responden yang sudah menerima materi modul BSAN">
          <BarList color={C.indigo} items={d.distribusiPerKecamatan.map(r => ({ label: `${r.kecamatan} (${r.total} resp.)`, value: r.ya, count: r.jumlahYa }))} />
        </Card>
      </div>
    );
  }

  if (tab === 'pelatihan') {
    const items = d.penyelenggaraPelatihan.map(r => ({ label: r.nama, persen: r.persen, jumlah: r.jumlah }));
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Penyelenggara Pelatihan Modul BSAN" subtitle={`Pilihan ganda — dari ${d.penyelenggaraAnswered} responden yang menjawab`}>
          <div className="space-y-4">
            <Insight text={topInsight(items, 'Jalur pelatihan')} />
            <BarList color={C.violet} items={d.penyelenggaraPelatihan.map(r => ({ label: r.nama, value: r.persen, count: r.jumlah }))} />
          </div>
        </Card>
        <Card title="Cakupan Pelatihan per Kecamatan" subtitle="Responden yang sudah menerima materi (%)">
          <div className="space-y-3">
            <Legend items={[{ label: 'Sudah menerima', color: C.sudah }, { label: 'Belum', color: C.belum }]} />
            {d.distribusiPerKecamatan.map(r => (
              <StackedRow key={r.kecamatan} label={r.kecamatan} total={r.total}
                segments={[{ key: 'ya', label: 'Sudah', value: r.ya, color: C.sudah }, { key: 'tidak', label: 'Belum', value: r.tidak, color: C.belum }]} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (tab === 'implementasi') {
    const t = d.implementasiTotal;
    const legend = IMPL_SEGMENTS(t).map(s => ({ label: s.label, color: s.color }));
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Sudah seluruhnya" value={`${t.sudah}%`} tone="sudah" />
          <StatCard label="Sebagian" value={`${t.sebagian}%`} tone="sebagian" />
          <StatCard label="Belum menerapkan" value={`${t.tidakMenerapkan}%`} tone="netral" />
          <StatCard label="Belum menerima" value={`${t.belumMenerima}%`} tone="belum" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card title="Status Implementasi per Posisi" subtitle="Proporsi responden pada tiap posisi">
            <div className="space-y-3.5">
              <Legend items={legend} />
              {d.statusImplementasiPosisi.map(r => <StackedRow key={r.posisi} label={r.posisi} total={r.total} segments={IMPL_SEGMENTS(r)} />)}
            </div>
          </Card>
          <Card title="Status Implementasi per Kecamatan" subtitle="Diurutkan dari implementasi penuh tertinggi">
            <div className="space-y-3.5">
              <Legend items={legend} />
              {d.statusImplementasiKecamatan.map(r => <StackedRow key={r.kecamatan} label={r.kecamatan} total={r.total} segments={IMPL_SEGMENTS(r)} />)}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (tab === 'kemudahan') {
    const block = (title: string, k: ProporsiModulData['kemudahanModul']['kelasAwal']) => (
      <Card title={title} subtitle={`Pilihan ganda — ${k.answered} responden menjawab`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <p className="text-xs font-bold text-status-sudah">Paling mudah diterapkan</p>
            <BarList color={C.sudah} items={k.mudah.map(r => ({ label: r.modul, value: r.persen, count: r.jumlah }))} />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-status-belum">Paling sulit diterapkan</p>
            <BarList color={C.belum} items={k.sulit.map(r => ({ label: r.modul, value: r.persen, count: r.jumlah }))} />
          </div>
        </div>
      </Card>
    );
    return (
      <div className="space-y-5">
        {block('Kelas Awal (1–3)', d.kemudahanModul.kelasAwal)}
        {block('Kelas Tinggi (4–6)', d.kemudahanModul.kelasTinggi)}
      </div>
    );
  }

  if (tab === 'keterlibatan') {
    const ket = d.keterlibatanSiswa.map(r => ({ label: r.kategori, persen: r.persen, jumlah: r.jumlah }));
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card title="Media Pembelajaran — Kelas Awal" subtitle={`${d.mediaPembelajaran.answeredAwal} responden menjawab`}>
            <BarList color={C.violet} items={d.mediaPembelajaran.kelasAwal.map(r => ({ label: r.media, value: r.persen, count: r.jumlah }))} />
          </Card>
          <Card title="Media Pembelajaran — Kelas Tinggi" subtitle={`${d.mediaPembelajaran.answeredTinggi} responden menjawab`}>
            <BarList color={C.indigo} items={d.mediaPembelajaran.kelasTinggi.map(r => ({ label: r.media, value: r.persen, count: r.jumlah }))} />
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card title="Keaktifan Murid" subtitle={`${d.keterlibatanAnswered} jawaban (kelas awal + tinggi)`}>
            <div className="space-y-3">
              <Insight text={topInsight(ket, 'Tingkat keaktifan')} />
              <BarList color={C.teal} items={d.keterlibatanSiswa.map(r => ({ label: r.kategori, value: r.persen, count: r.jumlah }))} />
            </div>
          </Card>
          <Card title="Refleksi Guru dengan Murid">
            <BarList color={C.sudah} items={d.refleksiMurid.map(r => ({ label: r.label, value: r.persen, count: r.jumlah }))} />
          </Card>
          <Card title="Kesepakatan Kelas">
            <BarList color={C.indigo} items={d.kesepakatanKelas.map(r => ({ label: r.label, value: r.persen, count: r.jumlah }))} />
          </Card>
        </div>
        <Card title="Temuan Refleksi Guru & Murid" subtitle="Kutipan jawaban terbaru dari responden">
          {d.refleksiGuru.length === 0 ? <EmptyState message="Belum ada catatan temuan refleksi." /> : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {d.refleksiGuru.slice(0, 8).map((t, i) => (
                <li key={i} className="flex gap-2 p-3 rounded-xl bg-bg border border-border/60 text-xs text-text-secondary leading-relaxed">
                  <Quote className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    );
  }

  if (tab === 'dukungan') {
    const duk = d.dukunganKepsek.map(r => ({ label: r.metode, persen: r.persen, jumlah: r.jumlah }));
    const prog = d.rencanaAksi.map(r => ({ label: r.program, persen: r.persen, jumlah: r.jumlah }));
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Bentuk Dukungan Kepala Sekolah" subtitle={`Pilihan ganda — ${d.dukunganAnswered} responden menjawab`}>
          <div className="space-y-3">
            <Insight text={topInsight(duk, 'Dukungan')} />
            <BarList color={C.indigo} items={d.dukunganKepsek.map(r => ({ label: r.metode, value: r.persen, count: r.jumlah }))} />
          </div>
        </Card>
        <Card title="Program Sekolah Pendukung BSAN" subtitle={`Pilihan ganda — ${d.programAnswered} responden menjawab`}>
          <div className="space-y-3">
            <Insight text={topInsight(prog, 'Program')} />
            <BarList color={C.sudah} items={d.rencanaAksi.map(r => ({ label: r.program, value: r.persen, count: r.jumlah }))} />
          </div>
        </Card>
      </div>
    );
  }

  // profil — data master sekolah (bukan survei)
  return (
    <Card title="Profil Sekolah per Kecamatan" subtitle="Sumber: data master satuan pendidikan (jumlah guru & siswa) dan status survei realtime">
      {d.profilSekolah.length === 0 ? <EmptyState /> : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="py-2.5 px-4 font-semibold">Kecamatan</th>
                <th className="py-2.5 px-2 font-semibold text-right">Sekolah</th>
                <th className="py-2.5 px-2 font-semibold text-right">Guru</th>
                <th className="py-2.5 px-2 font-semibold text-right">Siswa</th>
                <th className="py-2.5 px-2 font-semibold text-right">Siswa/Guru</th>
                <th className="py-2.5 px-4 font-semibold">Selesai Survei</th>
              </tr>
            </thead>
            <tbody>
              {d.profilSekolah.map(r => (
                <tr key={r.kecamatan} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 px-4 font-semibold text-text-primary">{r.kecamatan}</td>
                  <td className="py-2.5 px-2 text-right tabular-nums">{r.jumlahSekolah}</td>
                  <td className="py-2.5 px-2 text-right tabular-nums">{r.totalGuru.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-2 text-right tabular-nums">{r.totalSiswa.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-2 text-right tabular-nums">{r.rasio || '-'}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 min-w-[60px] rounded-full bg-border/60 overflow-hidden">
                        <div className="h-full bg-status-sudah rounded-full" style={{ width: `${r.cakupan}%` }} />
                      </div>
                      <span className="tabular-nums font-semibold w-10 text-right">{r.cakupan}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
