/**
 * @module features/sel/pages
 * @description Heatmap per kecamatan, radar per sekolah, matriks SEL, tabel sesi observasi
 * @tables sel_sesi_observasi, sel_jawaban_observasi, sel_indikator, sel_dimensi, satuan_pendidikan
 * @queries database/queries/analisis_sel.sql → semua query
 * @api GET /api/sel/analisis/heatmap, GET /api/sel/analisis/scores, GET /api/sel/analisis/radar/:sekolah_id
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { database, KABUPATEN_LIST } from '../../../shared/data/data-source';
import type { SELSchoolScore, SELHeatmapRow } from '../../../shared/data/data-source';
import { SEL_DIMENSI_ORDER, SEL_DIMENSI_LABEL } from '../../../shared/data/sel-indicators';
import type { SELDimensi } from '../../../shared/data/sel-indicators';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import {
  Brain, Users, GraduationCap, AlertTriangle, TrendingUp,
  ChevronDown, Filter, Eye, BookOpen, Star, Info, X,
  Award, Gem, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight,
  MapPin
} from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import CustomSelect from '../../../shared/components/CustomSelect';

// ─── Helpers ───────────────────────────────────────────────────

const SEL_COLORS: Record<SELDimensi, string> = {
  kesadaran_diri:      '#4A57C4',
  regulasi_emosi:      '#10B981',
  kesadaran_sosial:    '#F59E0B',
  keterampilan_relasi: '#8B5CF6',
  tanggung_jawab:      '#EF4444',
};

function skorKategori(skor: number): { label: string; color: string; bg: string } {
  if (skor >= 3.5) return { label: 'Konsisten',   color: '#4A57C4', bg: 'bg-primary/10 text-primary border border-primary/20' };
  if (skor >= 2.5) return { label: 'Sering',      color: '#10B981', bg: 'bg-status-sudah/10 text-status-sudah border border-status-sudah/20' };
  if (skor >= 1.5) return { label: 'Kadang',      color: '#F59E0B', bg: 'bg-status-sebagian/10 text-status-sebagian border border-status-sebagian/20' };
  return                  { label: 'Tidak',       color: '#EF4444', bg: 'bg-status-belum/10 text-status-belum border border-status-belum/20' };
}

function SkorBadge({ skor }: { skor: number }) {
  const k = skorKategori(skor);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${k.bg}`}>
      {skor.toFixed(1)} · {k.label}
    </span>
  );
}

function HeatCell({ skor }: { skor: number }) {
  // High-contrast, bold, crisp pill colors for clear readability
  let colorStyle = { bg: 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400 font-bold' };
  if (skor >= 3.0) {
    colorStyle = { bg: 'bg-indigo-600/15 border-indigo-600/30 text-indigo-700 dark:text-indigo-300 font-extrabold' };
  } else if (skor >= 2.5) {
    colorStyle = { bg: 'bg-emerald-600/15 border-emerald-600/30 text-emerald-700 dark:text-emerald-300 font-bold' };
  } else if (skor >= 2.0) {
    colorStyle = { bg: 'bg-amber-600/15 border-amber-600/30 text-amber-700 dark:text-amber-400 font-bold' };
  }

  return (
    <td className="px-2 py-2 text-center border-b border-border/30">
      <div className={`inline-flex items-center justify-center min-w-[46px] px-2.5 py-1 rounded-lg text-xs tracking-wide border shadow-xs transition-all ${colorStyle.bg}`}>
        {skor > 0 ? skor.toFixed(1) : '—'}
      </div>
    </td>
  );
}

// ─── Cross Validasi Matriks ─────────────────────────────────────

function CrossValidasiInfo({ kuisioner, sel }: { kuisioner: number; sel: number }) {
  const klaim = kuisioner >= 60;
  const realita = sel >= 2.5;
  if (klaim && realita)   return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-status-sudah bg-status-sudah/10 border border-status-sudah/20 px-2 py-0.5 rounded-full"><Award className="h-3 w-3" /> Unggul</span>;
  if (!klaim && realita)  return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full"><Gem className="h-3 w-3" /> Hidden Gem</span>;
  if (klaim && !realita)  return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-status-sebagian bg-status-sebagian/10 border border-status-sebagian/20 px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" /> Overclaim</span>;
  return                         <span className="inline-flex items-center gap-1 text-[9px] font-bold text-status-belum bg-status-belum/10 border border-status-belum/20 px-2 py-0.5 rounded-full"><ShieldAlert className="h-3 w-3" /> Intervensi</span>;
}

// ─── Detail Modal ───────────────────────────────────────────────

function DetailModal({ score, onClose }: { score: SELSchoolScore; onClose: () => void }) {
  const radarData = score.dimensi.map(d => ({
    subject: d.label.split(' ')[0], // short label
    Guru: d.guruSkor,
    Murid: d.muridSkor,
    fullMark: 4,
  }));

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
      <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h3 className="font-bold text-text-primary text-base font-display">{score.sekolahNama}</h3>
            <p className="text-[11px] text-text-secondary">{score.kecamatan} · {score.kabupaten} · {score.tanggal}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-secondary hover:bg-border/40 transition-smooth">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Score Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Guru Total', value: score.guruTotal, icon: GraduationCap, color: 'text-primary bg-primary/10' },
              { label: 'Murid Total', value: score.muridTotal, icon: Users, color: 'text-accent bg-accent/10' },
              { label: 'Rata-rata', value: score.totalRata, icon: Star, color: 'text-status-sudah bg-status-sudah/10' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-bg rounded-xl p-3.5 border border-border/50 text-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-bold text-text-primary font-display">{item.value.toFixed(1)}<span className="text-xs text-text-secondary">/4</span></div>
                  <div className="text-[10px] text-text-secondary font-medium mt-0.5">{item.label}</div>
                </div>
              );
            })}
          </div>

          {/* Radar Chart */}
          <div className="bg-bg rounded-xl p-4 border border-border/50">
            <h4 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> Radar 5 Dimensi SEL
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} />
                  <Radar name="Guru" dataKey="Guru" stroke="#4A57C4" fill="#4A57C4" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Murid" dataKey="Murid" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per Dimensi Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-primary" /> Detail Per Dimensi
            </h4>
            {score.dimensi.map(d => (
              <div key={d.dimensi} className="flex items-center justify-between p-3 bg-bg rounded-xl border border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEL_COLORS[d.dimensi] }} />
                  <span className="text-xs font-semibold text-text-primary">{d.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-text-secondary">G: <strong className="text-text-primary">{d.guruSkor.toFixed(1)}</strong></span>
                  <span className="text-text-secondary">M: <strong className="text-text-primary">{d.muridSkor.toFixed(1)}</strong></span>
                  <SkorBadge skor={d.rataRata} />
                </div>
              </div>
            ))}
          </div>

          {/* Cross Validasi */}
          <div className="p-4 rounded-xl border border-border/50 bg-bg/50">
            <h4 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-accent" /> Cross Validasi: Kuesioner vs Observasi
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-xs text-text-secondary">
                Skor Kuesioner BSAN: <strong className="text-text-primary">{score.kuisionerScore}%</strong> ·
                Skor SEL: <strong className="text-text-primary">{score.totalRata.toFixed(1)}/4</strong>
              </div>
              <CrossValidasiInfo kuisioner={score.kuisionerScore} sel={score.totalRata} />
            </div>
            <div className="mt-2 text-[10px] text-text-secondary leading-relaxed flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                {score.kuisionerScore >= 60 && score.totalRata >= 2.5
                  ? 'Sekolah ini konsisten antara laporan sendiri dan hasil observasi lapangan. Bisa dijadikan referensi best practice.'
                  : score.kuisionerScore < 60 && score.totalRata >= 2.5
                  ? 'Sekolah ini memperlihatkan perilaku SEL yang baik namun belum penuh mengisi survei. Perlu didorong untuk melengkapi.'
                  : score.kuisionerScore >= 60 && score.totalRata < 2.5
                  ? 'Ada gap antara klaim sekolah dan hasil observasi. Perlu verifikasi dan pendampingan lebih lanjut.'
                  : 'Baik kuesioner maupun observasi menunjukkan skor rendah. Prioritas utama untuk intervensi program.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function AnalisisSEL() {
  const [selectedKab, setSelectedKab] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'matriks' | 'daftar'>('overview');
  const [selectedScore, setSelectedScore] = useState<SELSchoolScore | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['selScores', selectedKab],
    queryFn: () => database.getSELScores({ kabupaten: selectedKab || undefined }),
  });

  const { data: heatmap = [] } = useQuery({
    queryKey: ['selHeatmap', selectedKab],
    queryFn: () => database.getSELHeatmap(selectedKab || undefined),
  });

  const { data: matriksData = [] } = useQuery({
    queryKey: ['selMatriks', selectedKab],
    queryFn: () => database.getSELMatriksData({ kabupaten: selectedKab || undefined }),
  });

  const { data: stats } = useQuery({
    queryKey: ['selStats'],
    queryFn: () => database.getSELSummaryStats(),
  });

  // Aggregated radar: rata-rata semua sekolah
  const avgRadarData = SEL_DIMENSI_ORDER.map(d => {
    const guruVals = scores.map(s => s.dimensi.find(dd => dd.dimensi === d)?.guruSkor || 0);
    const muridVals = scores.map(s => s.dimensi.find(dd => dd.dimensi === d)?.muridSkor || 0);
    const avgGuru  = scores.length ? Math.round((guruVals.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    const avgMurid = scores.length ? Math.round((muridVals.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    return { subject: SEL_DIMENSI_LABEL[d], Guru: avgGuru, Murid: avgMurid, fullMark: 4 };
  });

  // Bar chart: avg per dimensi, guru vs murid
  const barData = SEL_DIMENSI_ORDER.map(d => {
    const guruVals = scores.map(s => s.dimensi.find(dd => dd.dimensi === d)?.guruSkor || 0);
    const muridVals = scores.map(s => s.dimensi.find(dd => dd.dimensi === d)?.muridSkor || 0);
    return {
      dimensi: SEL_DIMENSI_LABEL[d].split(' ')[0], // short
      Guru: scores.length ? Math.round((guruVals.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
      Murid: scores.length ? Math.round((muridVals.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
    };
  });

  // Cross validation quadrant counts
  const q1 = matriksData.filter(p => p.kuisionerScore >= 60 && p.selScore >= 2.5).length;
  const q2 = matriksData.filter(p => p.kuisionerScore < 60 && p.selScore >= 2.5).length;
  const q3 = matriksData.filter(p => p.kuisionerScore >= 60 && p.selScore < 2.5).length;
  const q4 = matriksData.filter(p => p.kuisionerScore < 60 && p.selScore < 2.5).length;

  const tabs = [
    { id: 'overview',  label: 'Overview SEL',      icon: Brain },
    { id: 'heatmap',   label: 'Heatmap Wilayah',   icon: Filter },
    { id: 'matriks',   label: 'Cross Validasi',     icon: TrendingUp },
    { id: 'daftar',    label: 'Daftar Sekolah',     icon: BookOpen },
  ] as const;

  // Pagination calculation for Daftar Sekolah tab
  const sortedScores = [...scores].sort((a, b) => b.totalRata - a.totalRata);
  const totalPages = Math.ceil(sortedScores.length / itemsPerPage) || 1;
  const paginatedScores = sortedScores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-5 animate-fade-in">
      {selectedScore && (
        <DetailModal score={selectedScore} onClose={() => setSelectedScore(null)} />
      )}

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-[#5a6bd4] to-accent p-6 text-white shadow-lg relative overflow-hidden animate-slide-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">Analisis Observasi SEL</h2>
              <p className="text-white/70 text-[11px]">Social-Emotional Learning • BSAN Jawa Timur</p>
            </div>
          </div>
          {stats && (
            <div className="flex flex-wrap gap-4 mt-4">
              {[
                { label: 'Sekolah Diobservasi', value: stats.totalDiobservasi },
                { label: 'Rata-rata Skor Guru', value: `${stats.rataGuruAll}/4` },
                { label: 'Rata-rata Skor Murid', value: `${stats.rataMuridAll}/4` },
                { label: 'Butuh Intervensi', value: stats.butuhIntervensi },
              ].map(item => (
                <div key={item.label} className="bg-white/20 rounded-xl px-4 py-2.5">
                  <div className="text-white/70 text-[9px] uppercase tracking-wider font-bold">{item.label}</div>
                  <div className="text-white font-bold text-lg font-display">{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kabupaten Filter + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-surface border border-border p-3 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex gap-1 flex-wrap">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-smooth cursor-pointer ${
                  activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
        <div className="min-w-[180px]">
          <CustomSelect
            options={[
              { value: '', label: 'Semua Kabupaten' },
              ...KABUPATEN_LIST.map(k => ({ value: k.name, label: k.name }))
            ]}
            value={selectedKab}
            onChange={(val) => { setSelectedKab(val); setCurrentPage(1); }}
            placeholder="Pilih Kabupaten"
          />
        </div>
      </div>

      {/* ═══ TAB: OVERVIEW ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fade-in">
          {/* Radar + Bar side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Radar Chart */}
            <div className="rounded-2xl bg-surface border border-border shadow-card p-5 animate-scale-in">
              <h3 className="text-sm font-bold text-text-primary font-display mb-1">Radar 5 Dimensi SEL</h3>
              <p className="text-[11px] text-text-secondary mb-4">Rata-rata semua sekolah yang diobservasi</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={avgRadarData} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} />
                    <Radar name="Guru" dataKey="Guru" stroke="#4A57C4" fill="#4A57C4" fillOpacity={0.35} strokeWidth={2} dot />
                    <Radar name="Murid" dataKey="Murid" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} dot />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 12, fontSize: 12 }}
                      formatter={(v: any) => [`${v}/4`, '']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart Guru vs Murid */}
            <div className="rounded-2xl bg-surface border border-border shadow-card p-5 animate-scale-in" style={{ animationDelay: '100ms' }}>
              <h3 className="text-sm font-bold text-text-primary font-display mb-1">Perbandingan Guru vs Murid</h3>
              <p className="text-[11px] text-text-secondary mb-4">Rata-rata skor per dimensi (skala 1–4)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="dimensi" tick={{ fill: 'var(--color-text-secondary)', fontSize: 9 }} />
                    <YAxis domain={[0, 4]} tickFormatter={v => v.toFixed(1)} tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 12, fontSize: 12 }}
                      formatter={(v: any) => [`${v}/4`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Guru" fill="#4A57C4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Murid" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary Cards per Dimensi */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {SEL_DIMENSI_ORDER.map((d, i) => {
              const vals = scores.map(s => s.dimensi.find(dd => dd.dimensi === d)?.rataRata || 0);
              const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
              const kat = skorKategori(avg);
              return (
                <div key={d} className="rounded-xl bg-surface border border-border shadow-card p-4 text-center animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="w-2.5 h-2.5 rounded-full mx-auto mb-2" style={{ backgroundColor: SEL_COLORS[d] }} />
                  <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wide leading-tight mb-1">{SEL_DIMENSI_LABEL[d]}</div>
                  <div className="text-2xl font-bold font-display" style={{ color: kat.color }}>
                    <AnimatedCounter value={avg} decimals={1} />
                  </div>
                  <div className="text-[9px] text-text-secondary mt-0.5">/4 · {kat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-primary/5 border border-primary/15 p-5 animate-slide-up">
              <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Dimensi Terkuat</h4>
              {scores.length > 0 && (() => {
                const dimensiAvgs = SEL_DIMENSI_ORDER.map(d => {
                  const vals = scores.map(s => s.dimensi.find(dd => dd.dimensi === d)?.rataRata || 0);
                  return { d, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
                });
                const top = dimensiAvgs.sort((a, b) => b.avg - a.avg).slice(0, 2);
                return top.map(({ d, avg }) => (
                  <div key={d} className="flex items-center justify-between py-2 border-b border-primary/10 last:border-0">
                    <span className="text-xs font-semibold text-text-primary">{SEL_DIMENSI_LABEL[d]}</span>
                    <SkorBadge skor={parseFloat(avg.toFixed(1))} />
                  </div>
                ));
              })()}
            </div>

            <div className="rounded-2xl bg-status-belum/5 border border-status-belum/15 p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h4 className="text-sm font-bold text-status-belum mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Perlu Perhatian</h4>
              {scores.length > 0 && (() => {
                const dimensiAvgs = SEL_DIMENSI_ORDER.map(d => {
                  const vals = scores.map(s => s.dimensi.find(dd => dd.dimensi === d)?.rataRata || 0);
                  return { d, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
                });
                const bottom = dimensiAvgs.sort((a, b) => a.avg - b.avg).slice(0, 2);
                return bottom.map(({ d, avg }) => (
                  <div key={d} className="flex items-center justify-between py-2 border-b border-status-belum/10 last:border-0">
                    <span className="text-xs font-semibold text-text-primary">{SEL_DIMENSI_LABEL[d]}</span>
                    <SkorBadge skor={parseFloat(avg.toFixed(1))} />
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: HEATMAP ═══ */}
      {activeTab === 'heatmap' && (
        <div className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-border">
            <h3 className="text-sm font-bold text-text-primary font-display">Heatmap SEL per Kecamatan × Dimensi</h3>
            <p className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-3 flex-wrap">
              <span>Perbandingan skor rata-rata dimensi SEL:</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> ≥3.0 Baik</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-status-sudah inline-block" /> 2.5–2.9 Berkembang Baik</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-status-sebagian inline-block" /> 2.0–2.4 Cukup</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-status-belum inline-block" /> &lt;2.0 Perlu Intervensi</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="bg-bg/60 border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-text-secondary uppercase tracking-wider sticky left-0 bg-bg/60">Kecamatan</th>
                  <th className="px-2 py-3 text-center text-[10px] font-bold text-text-secondary uppercase tracking-wider">Sekolah</th>
                  {SEL_DIMENSI_ORDER.map(d => (
                    <th key={d} className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: SEL_COLORS[d] }}>
                      {SEL_DIMENSI_LABEL[d].split(' ')[0]}
                    </th>
                  ))}
                  <th className="px-2 py-3 text-center text-[10px] font-bold text-text-secondary uppercase tracking-wider">Rata-rata</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="py-12 text-center text-text-secondary text-xs animate-pulse">Memuat data heatmap...</td></tr>
                ) : heatmap.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-text-secondary text-xs">Belum ada data observasi.</td></tr>
                ) : (
                  heatmap.map((row, idx) => (
                    <tr key={row.kecamatan} className="hover:bg-bg/30 transition-colors animate-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                      <td className="px-4 py-2.5 font-semibold text-text-primary sticky left-0 bg-surface border-b border-border/30">
                        {row.kecamatan}
                        <span className="block text-[9px] text-text-secondary font-normal">{row.kabupaten}</span>
                      </td>
                      <td className="px-2 py-2.5 text-center text-text-secondary font-medium border-b border-border/30">{row.jumlahSekolah}</td>
                      {SEL_DIMENSI_ORDER.map(d => (
                        <HeatCell key={d} skor={row.dimensiScores[d] || 0} />
                      ))}
                      <td className="px-2 py-2.5 text-center border-b border-border/30">
                        <SkorBadge skor={row.rataRata} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border/50 bg-bg/30 flex flex-wrap gap-4 text-[10px] text-text-secondary items-center justify-between">
            <span className="flex items-center gap-1 font-medium"><Info className="h-3.5 w-3.5 text-primary" /> Visualisasi bersih dan nyaman dilihat untuk evaluasi cepat antar wilayah</span>
            <span className="font-semibold">{heatmap.length} Wilayah Terdaftar</span>
          </div>
        </div>
      )}

      {/* ═══ TAB: CROSS VALIDASI ═══ */}
      {activeTab === 'matriks' && (
        <div className="space-y-5 animate-fade-in">
          {/* Quadrant Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Unggul', sub: 'Klaim & Observasi tinggi', count: q1, color: 'text-status-sudah', bg: 'border-status-sudah/20', icon: Award, desc: 'Best practice — jadikan rujukan' },
              { label: 'Hidden Gem', sub: 'Klaim rendah, Observasi tinggi', count: q2, color: 'text-primary', bg: 'border-primary/20', icon: Gem, desc: 'Dorong melengkapi kuesioner' },
              { label: 'Overclaimer', sub: 'Klaim tinggi, Observasi rendah', count: q3, color: 'text-status-sebagian', bg: 'border-status-sebagian/20', icon: AlertTriangle, desc: 'Perlu verifikasi lapangan' },
              { label: 'Intervensi', sub: 'Klaim & Observasi rendah', count: q4, color: 'text-status-belum', bg: 'border-status-belum/20', icon: ShieldAlert, desc: 'Prioritas pendampingan' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`rounded-2xl bg-surface border ${item.bg} shadow-card p-5 animate-slide-up`} style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${item.color}`}>{item.label}</span>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <h3 className={`text-2xl font-black font-display ${item.color}`}>
                    <AnimatedCounter value={item.count} suffix=" SD" />
                  </h3>
                  <p className="text-[10px] text-text-secondary font-medium mt-1">{item.sub}</p>
                  <p className="text-[9px] text-text-secondary/70 mt-1 italic">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Scatter Plot */}
          <div className="rounded-2xl bg-surface border border-border shadow-card p-5 animate-scale-in">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-text-primary font-display">Scatter Plot: Kuesioner vs Observasi SEL</h3>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Sumbu X = Skor kuesioner BSAN self-report (0–100%) · Sumbu Y = Skor SEL hasil observasi (1–4)
              </p>
            </div>
            {/* Quadrant Labels */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-[10px] font-bold">
              <div className="bg-primary/5 border border-primary/15 rounded-xl px-3 py-2 text-primary flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1.5"><Gem className="h-3.5 w-3.5" /> Hidden Gem</span>
                  <span className="block font-normal text-text-secondary mt-0.5">Klaim rendah, SEL tinggi</span>
                </div>
              </div>
              <div className="bg-status-sudah/5 border border-status-sudah/15 rounded-xl px-3 py-2 text-status-sudah flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> Unggul</span>
                  <span className="block font-normal text-text-secondary mt-0.5">Klaim & SEL tinggi</span>
                </div>
              </div>
              <div className="bg-status-belum/5 border border-status-belum/15 rounded-xl px-3 py-2 text-status-belum flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> Intervensi</span>
                  <span className="block font-normal text-text-secondary mt-0.5">Keduanya rendah</span>
                </div>
              </div>
              <div className="bg-status-sebagian/5 border border-status-sebagian/15 rounded-xl px-3 py-2 text-status-sebagian flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Overclaimer</span>
                  <span className="block font-normal text-text-secondary mt-0.5">Klaim tinggi, SEL rendah</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" dataKey="kuisionerScore" name="Kuesioner" domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    label={{ value: 'Skor Kuesioner BSAN (%)', position: 'bottom', offset: 0, fontSize: 10, fill: 'var(--color-text-secondary)' }}
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                  />
                  <YAxis type="number" dataKey="selScore" name="SEL Score" domain={[1, 4]}
                    label={{ value: 'Skor Observasi SEL (1-4)', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-secondary)' }}
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                  />
                  <ZAxis range={[60, 60]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 12, fontSize: 12 }}
                    formatter={(v: any, name: any) => [
                      name === 'kuisionerScore' ? `${v}%` : `${v}/4`,
                      name === 'kuisionerScore' ? 'Kuesioner' : 'SEL'
                    ]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                  />
                  <Scatter
                    name="Sekolah"
                    data={matriksData}
                    isAnimationActive
                  >
                    {matriksData.map((entry, i) => {
                      const color = entry.kuisionerScore >= 60 && entry.selScore >= 2.5 ? '#10B981'
                        : entry.kuisionerScore < 60 && entry.selScore >= 2.5 ? '#4A57C4'
                        : entry.kuisionerScore >= 60 && entry.selScore < 2.5 ? '#F59E0B'
                        : '#EF4444';
                      return <Cell key={i} fill={color} className="cursor-pointer" />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            {/* Reference Lines description */}
            <p className="text-[10px] text-text-secondary text-center mt-2">Garis pembagi: X = 60% (kuesioner) · Y = 2.5 (observasi SEL)</p>
          </div>
        </div>
      )}

      {/* ═══ TAB: DAFTAR SEKOLAH ═══ */}
      {activeTab === 'daftar' && (
        <div className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary font-display">Daftar Hasil Observasi SEL</h3>
              <p className="text-[11px] text-text-secondary mt-0.5">{sortedScores.length} sekolah diobservasi · Klik baris untuk detail lengkap</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-bg/40 border-b border-border">
                  <th className="py-3 px-4 text-left text-[10px] font-bold text-text-secondary uppercase tracking-wider">Sekolah</th>
                  <th className="py-3 px-3 text-center text-[10px] font-bold text-text-secondary uppercase">Guru</th>
                  <th className="py-3 px-3 text-center text-[10px] font-bold text-text-secondary uppercase">Murid</th>
                  {SEL_DIMENSI_ORDER.map(d => (
                    <th key={d} className="py-3 px-2 text-center text-[10px] font-bold uppercase" style={{ color: SEL_COLORS[d] }}>
                      {SEL_DIMENSI_LABEL[d].split(' ')[0]}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center text-[10px] font-bold text-text-secondary uppercase">Total</th>
                  <th className="py-3 px-3 text-center text-[10px] font-bold text-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={10} className="py-12 text-center text-text-secondary animate-pulse">Memuat data...</td></tr>
                ) : paginatedScores.length === 0 ? (
                  <tr><td colSpan={10} className="py-12 text-center text-text-secondary">Belum ada data.</td></tr>
                ) : (
                  paginatedScores.map((score, idx) => (
                    <tr
                      key={score.sekolahId}
                      onClick={() => setSelectedScore(score)}
                      className="border-b border-border/40 hover:bg-bg/30 cursor-pointer transition-colors animate-slide-up"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-text-primary">{score.sekolahNama}</p>
                        <p className="text-[9px] text-text-secondary">{score.kecamatan} · {score.tanggal}</p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-primary">{score.guruTotal.toFixed(1)}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-status-sudah">{score.muridTotal.toFixed(1)}</span>
                      </td>
                      {SEL_DIMENSI_ORDER.map(d => {
                        const ds = score.dimensi.find(dd => dd.dimensi === d);
                        const s = ds?.rataRata || 0;
                        const color = s >= 3 ? '#4A57C4' : s >= 2.5 ? '#10B981' : s >= 2 ? '#F59E0B' : '#EF4444';
                        return (
                          <td key={d} className="py-3 px-2 text-center">
                            <span className="font-bold" style={{ color }}>{s.toFixed(1)}</span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-3 text-center">
                        <SkorBadge skor={score.totalRata} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <CrossValidasiInfo kuisioner={score.kuisionerScore} sel={score.totalRata} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-border bg-bg/20 flex items-center justify-between text-xs">
            <span className="text-text-secondary text-[11px]">
              Menampilkan {sortedScores.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} – {Math.min(currentPage * itemsPerPage, sortedScores.length)} dari {sortedScores.length} sekolah
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition-smooth text-text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-text-primary font-semibold px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition-smooth text-text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
