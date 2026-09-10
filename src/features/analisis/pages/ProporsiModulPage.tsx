/**
 * @module features/analisis/pages
 * @description Analisis proporsi penerima modul, penyelenggara, status implementasi
 * @tables responden_survey, jawaban_survey, pertanyaan_survey, kecamatan
 * @queries database/queries/proporsi_modul.sql → semua query
 * @api GET /api/analisis/proporsi?kabupaten_id=
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { database, KABUPATEN_LIST } from '../../../shared/data/data-source';
import type { ProporsiModulData } from '../../../shared/data/data-source';
import {
  PieChart as PieIcon, ChevronDown, GraduationCap, TrendingUp, BookOpen, Users, Award, Building2,
  CheckCircle2, Info, ArrowUpRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';

const TABS = [
  { id: 'penerima', label: 'Proporsi Penerima', icon: PieIcon },
  { id: 'pelatihan', label: 'Distribusi Pelatihan', icon: GraduationCap },
  { id: 'implementasi', label: 'Status Implementasi', icon: TrendingUp },
  { id: 'kemudahan', label: 'Kemudahan Modul', icon: BookOpen },
  { id: 'keterlibatan', label: 'Media & Keterlibatan', icon: Users },
  { id: 'dukungan', label: 'Dukungan Kepsek & Program', icon: Award },
  { id: 'infrastruktur', label: 'Infrastruktur Sekolah', icon: Building2 },
] as const;

type TabId = typeof TABS[number]['id'];

// Custom Recharts Tooltip yang Rapi & Jelas
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface p-3 rounded-xl border border-border shadow-xl text-xs z-50 animate-scale-in">
        <p className="font-bold text-text-primary mb-1.5 border-b border-border/60 pb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-text-secondary">{entry.name}:</span>
              </div>
              <span className="font-bold font-display text-text-primary">
                {entry.value} {typeof entry.value === 'number' && entry.value <= 100 && entry.unit === '%' ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function ProporsiModul() {
  const [activeTab, setActiveTab] = useState<TabId>('penerima');
  const [kabupaten, setKabupaten] = useState('Kab. Sidoarjo');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['proporsiModul', kabupaten],
    queryFn: () => database.getProporsiModulData(kabupaten),
  });

  const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon || PieIcon;

  // Colors Palette dari PDF & System
  const COLOR_EMERALD = '#10B981';
  const COLOR_ROSE = '#F43F5E';
  const COLOR_INDIGO = '#4F46E5';
  const COLOR_VIOLET = '#7C3AED';
  const COLOR_AMBER = '#F59E0B';
  const COLOR_SLATE = '#64748B';

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header Container */}
      <div className="rounded-2xl bg-surface p-6 shadow-card border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ActiveIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-text-primary">Proporsi Modul BSAN</h2>
              <p className="text-xs text-text-secondary">
                Visualisasi data survei real wilayah {kabupaten} (1.101 Responden).
              </p>
            </div>
          </div>
        </div>

        {/* Filter Kabupaten */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-bg border border-border text-xs font-bold text-text-primary hover:border-primary/50 transition-smooth cursor-pointer min-w-[200px] justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span>{kabupaten}</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-30 w-full rounded-xl bg-surface border border-border shadow-card-hover py-1 animate-scale-in">
              {KABUPATEN_LIST.map((k) => (
                <button
                  key={k.id}
                  onClick={() => { setKabupaten(k.id); setDropdownOpen(false); }}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-xs text-left font-medium transition-smooth cursor-pointer ${
                    kabupaten === k.id ? 'bg-primary/10 text-primary font-bold' : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: k.color }} />
                  {k.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigasi Tabs ber-Animasi */}
      <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold border transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/25 scale-[1.02]'
                  : 'bg-surface text-text-secondary border-border hover:bg-bg hover:text-text-primary hover:border-border/80'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-primary'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Konten Halaman */}
      {isLoading || !data ? (
        <div className="rounded-2xl bg-surface p-16 text-center border border-border">
          <p className="text-xs text-text-secondary font-medium animate-pulse">Memuat visualisasi proporsi modul...</p>
        </div>
      ) : (
        <div key={`${activeTab}-${kabupaten}`} className="space-y-6 animate-fade-in">
          {/* ================= TAB 1: PROPORSI PENERIMA ================= */}
          {activeTab === 'penerima' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Ringkasan & Pie Chart */}
              <div className="lg:col-span-5 rounded-2xl bg-surface p-6 shadow-card border border-border flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h3 className="text-base font-bold text-text-primary font-display">
                      Proporsi Penerima Materi Modul
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      Total {data.proporsiPenerima.totalResponden} Responden
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    Diagram ini menggambarkan persentase pengajar dan kepala sekolah yang telah menerima modul BSAN di {kabupaten}.
                  </p>

                  <div className="h-64 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Menerima (Ya)', value: data.proporsiPenerima.ya },
                            { name: 'Belum Menerima (Tidak)', value: data.proporsiPenerima.tidak },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          isAnimationActive={true}
                          animationDuration={800}
                        >
                          <Cell fill={COLOR_EMERALD} />
                          <Cell fill={COLOR_ROSE} />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                      <span className="text-2xl font-extrabold font-display text-text-primary">
                        <AnimatedCounter value={data.proporsiPenerima.ya} suffix="%" />
                      </span>
                      <span className="text-[10px] text-text-secondary font-medium">Menerima</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-[11px] text-text-secondary font-medium mb-0.5">Sudah Menerima</p>
                    <p className="text-lg font-bold font-display text-emerald-600">
                      <AnimatedCounter value={data.proporsiPenerima.ya} suffix="%" />
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <p className="text-[11px] text-text-secondary font-medium mb-0.5">Belum Menerima</p>
                    <p className="text-lg font-bold font-display text-rose-600">
                      <AnimatedCounter value={data.proporsiPenerima.tidak} suffix="%" />
                    </p>
                  </div>
                </div>
              </div>

              {/* Distribusi per Kecamatan */}
              <div className="lg:col-span-7 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Penerima Materi Modul per Kecamatan
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Sebaran cakupan modul di tiap-tiap kecamatan wilayah {kabupaten}.
                  </p>
                </div>

                <div className="h-[360px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.distribusiPerKecamatan}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="kecamatan" type="category" tick={{ fontSize: 11 }} width={90} tickFormatter={(val) => typeof val === 'string' && val.length > 15 ? val.slice(0, 14) + '...' : val} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="ya"
                        name="Menerima Modul (%)"
                        fill={COLOR_INDIGO}
                        radius={[0, 6, 6, 0]}
                        barSize={14}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: DISTRIBUSI PELATIHAN ================= */}
          {activeTab === 'pelatihan' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Penyelenggara Pelatihan (Left Card) */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Distribusi Penyelenggara Pelatihan Modul BSAN
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Diagram ini menunjukkan sebaran lembaga penyelenggara pelatihan Modul BSAN. Diseminasi KKG/KKKS menjadi jalur utama pelatihan dengan jumlah tertinggi, diikuti INOVASI-Dinas Pendidikan dan jalur mandiri.
                  </p>
                </div>

                <div className="h-[420px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.penyelenggaraPelatihan}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="nama"
                        type="category"
                        tick={{ fontSize: 11, fill: '#475569' }}
                        width={150}
                        tickFormatter={(val) => {
                          if (typeof val === 'string' && val.length > 22) {
                            return val.slice(0, 20) + '...';
                          }
                          return val;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="jumlah"
                        name="Jumlah Guru Terlatih"
                        fill={COLOR_VIOLET}
                        radius={[0, 6, 6, 0]}
                        barSize={18}
                        isAnimationActive={true}
                        animationDuration={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sebaran Kecamatan (Right Card) */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Distribusi Pelatihan BSAN per Kecamatan
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Grafik sebaran penerima materi modul menggambarkan cakupan pelatihan secara ringkas dan jelas di tiap kecamatan.
                  </p>
                </div>

                <div className="h-[420px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.distribusiPerKecamatan}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="kecamatan"
                        type="category"
                        tick={{ fontSize: 11, fill: '#475569' }}
                        width={130}
                        tickFormatter={(val) => {
                          if (typeof val === 'string' && val.length > 18) {
                            return val.slice(0, 16) + '...';
                          }
                          return val;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
                      <Bar dataKey="ya" name="Pernah Pelatihan (Ya)" fill={COLOR_EMERALD} stackId="a" barSize={16} isAnimationActive={true} animationDuration={800} />
                      <Bar dataKey="tidak" name="Belum Pelatihan (Tidak)" fill={COLOR_ROSE} stackId="a" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={true} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: STATUS IMPLEMENTASI ================= */}
          {activeTab === 'implementasi' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Berdasarkan Posisi Responden */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Status Implementasi Berdasarkan Posisi Responden
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Grafik ini menunjukkan bahwa implementasi Modul BSAN di sebagian besar posisi masih didominasi responden yang belum menerima pelatihan atau baru menerapkannya sebagian.
                  </p>
                </div>

                <div className="h-[420px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.statusImplementasiPosisi}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="posisi"
                        type="category"
                        tick={{ fontSize: 11, fill: '#475569' }}
                        width={140}
                        tickFormatter={(val) => {
                          if (typeof val === 'string' && val.length > 20) {
                            return val.slice(0, 18) + '...';
                          }
                          return val;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
                      <Bar dataKey="belumMenerima" name="Belum Menerima" fill={COLOR_ROSE} stackId="a" barSize={16} isAnimationActive={true} animationDuration={800} />
                      <Bar dataKey="sebagian" name="Ya, Sebagian" fill={COLOR_AMBER} stackId="a" barSize={16} isAnimationActive={true} animationDuration={800} />
                      <Bar dataKey="sudah" name="Ya, Sudah Seluruhnya" fill={COLOR_EMERALD} stackId="a" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={true} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Implementasi per Kecamatan */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Status Implementasi per Kecamatan
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Implementasi Modul BSAN antar kecamatan belum merata, memperlihatkan perlunya pendampingan rutin di tingkat daerah.
                  </p>
                </div>

                <div className="h-[420px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.statusImplementasiKecamatan}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="kecamatan"
                        type="category"
                        tick={{ fontSize: 11, fill: '#475569' }}
                        width={130}
                        tickFormatter={(val) => {
                          if (typeof val === 'string' && val.length > 18) {
                            return val.slice(0, 16) + '...';
                          }
                          return val;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
                      <Bar dataKey="belumMenerima" name="Belum Menerima" fill={COLOR_ROSE} stackId="a" barSize={16} isAnimationActive={true} animationDuration={800} />
                      <Bar dataKey="sebagian" name="Ya, Sebagian" fill={COLOR_AMBER} stackId="a" barSize={16} isAnimationActive={true} animationDuration={800} />
                      <Bar dataKey="sudah" name="Ya, Sudah Seluruhnya" fill={COLOR_EMERALD} stackId="a" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={true} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: KEMUDAHAN MODUL ================= */}
          {activeTab === 'kemudahan' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kelas Awal */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-base font-bold text-text-primary font-display">
                      Kemudahan Modul — Kelas Awal
                    </h3>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Guru menilai materi dasar pada Alur 1 paling mudah dipahami, sementara materi kesadaran diri yang kompleks pada Alur 3 dirasa lebih sulit.
                  </p>
                </div>

                <div className="h-[320px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.kemudahanModul.kelasAwal.mudah}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="modul" type="category" tick={{ fontSize: 10 }} width={150} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="persen" name="Tingkat Kemudahan (%)" fill={COLOR_EMERALD} radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={true} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Kelas Tinggi */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <h3 className="text-base font-bold text-text-primary font-display">
                      Kemudahan Modul — Kelas Tinggi
                    </h3>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Materi pengenalan emosi Alur 1 dinilai paling mudah diajarkan. Sebaliknya, materi anatomi/konsep diri yang mendalam memerlukan penguatan strategi.
                  </p>
                </div>

                <div className="h-[320px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.kemudahanModul.kelasTinggi.mudah}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="modul" type="category" tick={{ fontSize: 10 }} width={150} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="persen" name="Tingkat Kemudahan (%)" fill={COLOR_INDIGO} radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={true} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: MEDIA & KETERLIBATAN ================= */}
          {activeTab === 'keterlibatan' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Media Pembelajaran */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Penggunaan Media Pembelajaran
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Media gambar dan LKPD mendominasi pilihan guru kelas awal, sementara kelas tinggi bertumpu pada media audio-visual yang dinamis.
                  </p>
                </div>

                <div className="h-[320px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.mediaPembelajaran.kelasAwal}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="media" type="category" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="persen" name="Persentase Penggunaan (%)" fill={COLOR_VIOLET} radius={[0, 6, 6, 0]} barSize={18} isAnimationActive={true} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Keterlibatan & Refleksi Guru */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4 flex flex-col justify-between">
                <div>
                  <div className="border-b border-border pb-3 mb-4">
                    <h3 className="text-base font-bold text-text-primary font-display">
                      Tingkat Keaktifan Siswa & Refleksi Guru
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      Implementasi Modul BSAN efektif mendorong partisipasi aktif siswa di mana mayoritas guru melaporkan lebih dari 70% siswa terlibat aktif.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {data.keterlibatanSiswa.map((k, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-bg border border-border/60 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-text-primary">{k.kategori}</p>
                          <p className="text-[11px] text-text-secondary">{k.jumlah} Responden Guru</p>
                        </div>
                        <span className="text-base font-extrabold font-display text-emerald-600">
                          <AnimatedCounter value={k.persen} suffix="%" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Catatan Refleksi Pengajar</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {data.refleksiGuru[0] || 'Refleksi rutin selesai aktivitas mempererat iklim belajar aman dan membangun kepercayaan diri murid.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: DUKUNGAN KEPSEK & PROGRAM ================= */}
          {activeTab === 'dukungan' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Dukungan Kepsek */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Bentuk Dukungan Kepala Sekolah
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Kepala sekolah menunjukkan komitmen melalui sosialisasi, memimpin refleksi guru, serta mengintegrasikan program ke dalam kurikulum sekolah.
                  </p>
                </div>

                <div className="h-[320px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.dukunganKepsek}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="metode" type="category" tick={{ fontSize: 10 }} width={140} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="jumlah" name="Jumlah Kepsek" fill={COLOR_INDIGO} radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={true} animationDuration={300} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Program Sekolah */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Program Sekolah Pendukung BSAN
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Fokus kuat pada pembiasaan karakter, penganggaran via RKS/RKAS, serta penyusunan SOP dan tim antikekerasan.
                  </p>
                </div>

                <div className="h-[320px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.rencanaAksi}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="program" type="category" tick={{ fontSize: 10 }} width={140} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="jumlah" name="Jumlah Sekolah" fill={COLOR_EMERALD} radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={true} animationDuration={300} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: INFRASTRUKTUR & FASILITAS ================= */}
          {activeTab === 'infrastruktur' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kondisi Fasilitas */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Kondisi Fasilitas Ruangan per Kecamatan
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Tingkat kelayakan kondisi fasilitas ruangan sekolah di tiap kecamatan wilayah {kabupaten}.
                  </p>
                </div>

                <div className="h-[500px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.kondisiFasilitas}
                      layout="vertical"
                      margin={{ top: 10, right: 25, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#64748B' }} />
                      <YAxis
                        dataKey="kecamatan"
                        type="category"
                        tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }}
                        width={150}
                        tickFormatter={(val) => {
                          if (typeof val === 'string' && val.length > 20) {
                            return val.slice(0, 18) + '...';
                          }
                          return val;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, paddingBottom: 12 }} />
                      <Bar dataKey="baik" name="Kondisi Baik (%)" fill={COLOR_EMERALD} stackId="a" barSize={22} isAnimationActive={true} animationDuration={300} />
                      <Bar dataKey="cukup" name="Kondisi Cukup (%)" fill={COLOR_AMBER} stackId="a" barSize={22} isAnimationActive={true} animationDuration={300} />
                      <Bar dataKey="rusak" name="Kondisi Rusak (%)" fill={COLOR_ROSE} stackId="a" radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={true} animationDuration={300} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Kelayakan Ruang Kelas */}
              <div className="lg:col-span-6 rounded-2xl bg-surface p-6 shadow-card border border-border space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-text-primary font-display">
                    Persentase Ruang Kelas Layak per Kecamatan
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Rata-rata ketersediaan dan kelayakan ruang kelas penunjang kegiatan belajar mengajar.
                  </p>
                </div>

                <div className="h-[500px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.kelayakanRuangKelas}
                      layout="vertical"
                      margin={{ top: 10, right: 25, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#64748B' }} />
                      <YAxis
                        dataKey="kecamatan"
                        type="category"
                        tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }}
                        width={150}
                        tickFormatter={(val) => {
                          if (typeof val === 'string' && val.length > 20) {
                            return val.slice(0, 18) + '...';
                          }
                          return val;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="persentase" name="Ruang Kelas Layak (%)" fill={COLOR_INDIGO} radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={true} animationDuration={300} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
