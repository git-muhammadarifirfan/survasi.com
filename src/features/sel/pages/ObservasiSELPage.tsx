/**
 * @module features/sel/pages
 * @description Form wizard observasi lapangan SEL — 55+ indikator per sesi
 * @tables sel_sesi_observasi, sel_jawaban_observasi, sel_indikator, sel_dimensi, satuan_pendidikan
 * @api POST /api/sel/sesi, PUT /api/sel/sesi/:id, POST /api/sel/jawaban
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { database, KABUPATEN_LIST, KECAMATAN_LIST } from '../../../shared/data/data-source';
import type { SELJawaban, SELObservasiSession, SELSchoolScore } from '../../../shared/data/data-source';
import {
  SEL_INDIKATORS, SEL_DIMENSI_ORDER, SEL_DIMENSI_LABEL,
  SEL_SKOR_LABEL, getIndikatorsByFilter,
} from '../../../shared/data/sel-indicators';
import type { SELDimensi, SELSkor } from '../../../shared/data/sel-indicators';
import {
  ClipboardList, ChevronLeft, ChevronRight, Save, Send, CheckCircle2,
  Eye, EyeOff, MapPin, Users, BookOpen, Brain, AlertCircle, X,
  School, Star, RefreshCw, Filter, XCircle, Clock, CheckCircle, Sparkles, Building2, Trees,
  GraduationCap, List, Search, Calendar
} from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';

// ─── Helpers ────────────────────────────────────────────────────

const SKOR_OPTIONS: { value: SELSkor; label: string; icon: typeof XCircle; color: string; selColor: string }[] = [
  { value: 1, label: 'Tidak Terlihat',   icon: XCircle,     color: 'text-status-belum',    selColor: 'border-status-belum   bg-status-belum/5' },
  { value: 2, label: 'Kadang Terlihat',  icon: Clock,       color: 'text-status-sebagian', selColor: 'border-status-sebagian bg-status-sebagian/5' },
  { value: 3, label: 'Sering Terlihat',  icon: CheckCircle, color: 'text-status-sudah',    selColor: 'border-status-sudah   bg-status-sudah/5' },
  { value: 4, label: 'Konsisten',        icon: Sparkles,    color: 'text-primary',         selColor: 'border-primary        bg-primary/5' },
];

const LOKASI_OPTIONS = ['Ruang kelas', 'Halaman sekolah', 'Lorong kelas', 'Kantin sekolah', 'Perpustakaan sekolah', 'Mushola'];
const WAKTU_OPTIONS = ['Sebelum masuk kelas', 'Istirahat', 'Pulang sekolah', 'Ekstrakurikuler'];
const JANGKAUAN_OPTIONS = [
  { value: 1 as const, label: 'Menjangkau seluruh siswa' },
  { value: 2 as const, label: 'Lebih dari separuh siswa' },
  { value: 3 as const, label: 'Kurang separuh siswa' },
  { value: 4 as const, label: 'Hanya sebagian kecil siswa' },
];

function buildInitialJawaban(): SELJawaban[] {
  return SEL_INDIKATORS.map(ind => ({ indikatorId: ind.id, skor: null, catatan: '' }));
}

function SkorBadge({ skor }: { skor: number }) {
  const color = skor >= 3.5 ? 'bg-primary/10 text-primary' : skor >= 2.5 ? 'bg-status-sudah/10 text-status-sudah' : skor >= 1.5 ? 'bg-status-sebagian/10 text-status-sebagian' : 'bg-status-belum/10 text-status-belum';
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${color}`}>{skor.toFixed(1)}/4</span>;
}

// ══════════════════════════════════════════════════════════════
//  BAGIAN 1: KARTU INDIKATOR (dipakai oleh form isian)
// ══════════════════════════════════════════════════════════════

function IndikatorCard({
  indikator, jawaban, onSkorChange, onCatatanChange,
}: {
  indikator: (typeof SEL_INDIKATORS)[0];
  jawaban: SELJawaban | undefined;
  onSkorChange: (id: string, skor: SELSkor | null) => void;
  onCatatanChange: (id: string, catatan: string) => void;
}) {
  const [showCatatan, setShowCatatan] = useState(false);
  const skor = jawaban?.skor ?? null;
  const currentOpt = SKOR_OPTIONS.find(s => s.value === skor);
  const CurrentIcon = currentOpt?.icon;

  return (
    <div className={`rounded-xl border-2 transition-all duration-200 p-4 space-y-3 ${skor ? 'border-primary/25 bg-primary/3' : 'border-border bg-bg/30'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${indikator.subjek === 'guru' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {indikator.subjek === 'guru' ? <GraduationCap className="h-3 w-3" /> : <Users className="h-3 w-3" />}
              {indikator.subjek === 'guru' ? 'Guru' : 'Murid'}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] text-text-secondary font-medium px-1.5 py-0.5 rounded bg-bg border border-border/50">
              {indikator.konteks === 'kelas' ? <Building2 className="h-3 w-3" /> : <Trees className="h-3 w-3" />}
              {indikator.konteks === 'kelas' ? 'Kelas' : 'Lingkungan'}
            </span>
          </div>
          <p className="text-xs font-semibold text-text-primary leading-relaxed">{indikator.teks}</p>
          {indikator.catatan && (
            <p className="text-[10px] text-text-secondary italic mt-1 leading-relaxed flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-text-secondary/70 shrink-0" /> {indikator.catatan}
            </p>
          )}
        </div>
        {skor && currentOpt && CurrentIcon && (
          <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${currentOpt.color} bg-surface border border-border/60 shadow-xs`}>
            <CurrentIcon className="h-3.5 w-3.5" /> {skor}/4
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SKOR_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const isSelected = skor === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSkorChange(indikator.id, isSelected ? null : opt.value)}
              className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? `${opt.selColor} ${opt.color} shadow-sm scale-[1.02]`
                  : 'border-border/60 text-text-secondary hover:text-text-primary hover:border-border bg-bg/50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isSelected ? opt.color : 'text-text-secondary/70'}`} />
              <span className="leading-tight text-center">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => onSkorChange(indikator.id, null)}
          className="text-[10px] font-medium text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors">
          <X className="h-3 w-3" /> Tidak bisa diamati
        </button>
        <button type="button" onClick={() => setShowCatatan(!showCatatan)}
          className="text-[10px] font-medium text-primary flex items-center gap-1 transition-colors">
          {showCatatan ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showCatatan ? 'Tutup' : '+ Catatan'}
        </button>
      </div>

      {showCatatan && (
        <textarea rows={2} placeholder="Tulis catatan temuan..."
          value={jawaban?.catatan || ''}
          onChange={e => onCatatanChange(indikator.id, e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none resize-none placeholder-text-secondary/50"
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  BAGIAN 2: WIZARD FORM ISIAN (untuk role 'school' / observer)
// ══════════════════════════════════════════════════════════════

type StepId = 'konteks' | SELDimensi | 'review';
const STEPS: { id: StepId; label: string; icon: typeof Brain }[] = [
  { id: 'konteks',             label: 'Konteks',    icon: MapPin },
  { id: 'kesadaran_diri',      label: 'Kes. Diri',  icon: Brain },
  { id: 'regulasi_emosi',      label: 'Reg. Emosi', icon: Users },
  { id: 'kesadaran_sosial',    label: 'Kes. Sosial',icon: School },
  { id: 'keterampilan_relasi', label: 'Relasi',     icon: Users },
  { id: 'tanggung_jawab',      label: 'Tgg. Jawab', icon: ClipboardList },
  { id: 'review',              label: 'Review',     icon: CheckCircle2 },
];

export function ObservasiFormWizard({ onSubmitDone }: { onSubmitDone?: () => void }) {
  const queryClient = useQueryClient();
  const [stepIdx, setStepIdx] = useState(0);
  const [kabupaten, setKabupaten]     = useState('Kab. Sidoarjo');
  const [kecamatan, setKecamatan]     = useState('');
  const [sekolahNama, setSekolahNama] = useState('');
  const [observerNama, setObserverNama] = useState('');
  const [tanggal, setTanggal]         = useState(new Date().toISOString().split('T')[0]);
  const [lokasiDiamati, setLokasiDiamati] = useState<string[]>([]);
  const [waktuPengamatan, setWaktuPengamatan] = useState<string[]>([]);
  const [jangkauanSiswa, setJangkauanSiswa] = useState<1|2|3|4>(2);
  const [jumlahSiswaL, setJumlahSiswaL] = useState(0);
  const [jumlahSiswaP, setJumlahSiswaP] = useState(0);
  const [disabilitasL, setDisabilitasL] = useState(0);
  const [disabilitasP, setDisabilitasP] = useState(0);
  const [kelas, setKelas]             = useState('');
  const [guruInisial, setGuruInisial] = useState('');
  const [guruJK, setGuruJK]           = useState<'L'|'P'>('P');
  const [mapel, setMapel]             = useState('');
  const [jawaban, setJawaban]         = useState<SELJawaban[]>(buildInitialJawaban);
  const [toast, setToast]             = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const submitMutation = useMutation({
    mutationFn: (s: Omit<SELObservasiSession, 'id'>) => database.saveObservasiSEL(s),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selScores'] });
      queryClient.invalidateQueries({ queryKey: ['selHeatmap'] });
      queryClient.invalidateQueries({ queryKey: ['selMatriks'] });
      queryClient.invalidateQueries({ queryKey: ['selStats'] });
      queryClient.invalidateQueries({ queryKey: ['selObservations'] });
      onSubmitDone?.();
    },
  });

  const handleSkorChange = (id: string, skor: SELSkor | null) =>
    setJawaban(prev => prev.map(j => j.indikatorId === id ? { ...j, skor } : j));
  const handleCatatanChange = (id: string, catatan: string) =>
    setJawaban(prev => prev.map(j => j.indikatorId === id ? { ...j, catatan } : j));
  const toggleLokasi = (v: string) => setLokasiDiamati(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const toggleWaktu  = (v: string) => setWaktuPengamatan(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  const currentStep = STEPS[stepIdx];
  const isKonteks = currentStep.id === 'konteks';
  const isReview  = currentStep.id === 'review';
  const isDimensi = !isKonteks && !isReview;
  const currentDimensiInds = isDimensi ? getIndikatorsByFilter({ dimensi: currentStep.id as SELDimensi }) : [];
  const filledInStep = currentDimensiInds.filter(ind => {
    const j = jawaban.find(jj => jj.indikatorId === ind.id);
    return j?.skor !== null && j?.skor !== undefined;
  }).length;
  const totalFilled = jawaban.filter(j => j.skor !== null).length;

  const handleSubmit = () => {
    if (!sekolahNama.trim() || !kecamatan) { showToast('Harap isi nama sekolah dan kecamatan.'); return; }
    submitMutation.mutate({
      sekolahId: 'manual_' + Date.now(),
      sekolahNama, kecamatan: `Kec. ${kecamatan}`, kabupaten,
      observerNama, tanggal, lokasiDiamati, waktuPengamatan, jangkauanSiswa,
      jumlahSiswaL, jumlahSiswaP, siswaDisabilitasL: disabilitasL,
      siswaDisabilitasP: disabilitasP, kelasDiamati: kelas,
      namaGuruInisial: guruInisial, jenisKelaminGuru: guruJK, mataPelajaran: mapel,
      jawaban, status: 'submitted',
    });
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-3 shadow-xl text-xs font-semibold animate-scale-in">
          <AlertCircle className="h-4 w-4" />{toast}
        </div>
      )}

      {/* Header Stepper */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-accent p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/20 rounded-xl"><ClipboardList className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-bold font-display">Form Observasi Lapangan SEL</h2>
            <p className="text-white/70 text-[11px]">Isi data sesuai pengamatan langsung di lapangan</p>
          </div>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === stepIdx;
            const isDone = idx < stepIdx;
            return (
              <button key={step.id} type="button" onClick={() => setStepIdx(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive ? 'bg-white text-primary shadow-md' :
                  isDone   ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}>
                {isDone ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                {step.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 bg-white/20 rounded-full h-1.5">
          <div className="bg-white rounded-full h-1.5 transition-all duration-500"
            style={{ width: `${(stepIdx / (STEPS.length - 1)) * 100}%` }} />
        </div>
        <p className="text-white/60 text-[10px] mt-1">Langkah {stepIdx + 1} dari {STEPS.length}</p>
      </div>

      {/* ─── KONTEKS ─── */}
      {isKonteks && (
        <div className="rounded-2xl bg-surface border border-border shadow-card p-6 space-y-5">
          <h3 className="text-sm font-bold text-text-primary font-display flex items-center gap-2 border-b border-border pb-4">
            <MapPin className="h-4 w-4 text-primary" /> Informasi Konteks Observasi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <CustomSelect
                label="Kabupaten / Kota *"
                options={KABUPATEN_LIST.map(k => ({ value: k.name, label: k.name }))}
                value={kabupaten}
                onChange={(val) => setKabupaten(val)}
              />
            </div>
            <div className="space-y-1">
              <CustomSelect
                label="Kecamatan *"
                options={[
                  { value: '', label: '-- Pilih Kecamatan --' },
                  ...KECAMATAN_LIST.map(k => ({ value: k, label: k }))
                ]}
                value={kecamatan}
                onChange={(val) => setKecamatan(val)}
                enableSearch={true}
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-text-secondary uppercase text-[10px]">Nama Sekolah *</label>
              <input type="text" value={sekolahNama} onChange={e => setSekolahNama(e.target.value)}
                placeholder="SDN Candi 1 Sidoarjo"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase text-[10px]">Nama Observer</label>
              <input type="text" value={observerNama} onChange={e => setObserverNama(e.target.value)} placeholder="Nama / Inisial"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase text-[10px]">Tanggal Observasi</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase text-[10px]">Jumlah Siswa (L / P)</label>
              <div className="flex gap-2">
                <input type="number" min={0} value={jumlahSiswaL} onChange={e => setJumlahSiswaL(+e.target.value)} placeholder="L"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
                <input type="number" min={0} value={jumlahSiswaP} onChange={e => setJumlahSiswaP(+e.target.value)} placeholder="P"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase text-[10px]">Siswa Disabilitas (L / P)</label>
              <div className="flex gap-2">
                <input type="number" min={0} value={disabilitasL} onChange={e => setDisabilitasL(+e.target.value)} placeholder="L"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
                <input type="number" min={0} value={disabilitasP} onChange={e => setDisabilitasP(+e.target.value)} placeholder="P"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-text-secondary uppercase text-[10px]">Lingkungan yang Diamati</label>
            <div className="flex flex-wrap gap-2">
              {LOKASI_OPTIONS.map(loc => (
                <button key={loc} type="button" onClick={() => toggleLokasi(loc)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border-2 transition-smooth cursor-pointer ${
                    lokasiDiamati.includes(loc) ? 'bg-primary border-primary text-white shadow-sm' : 'bg-bg border-border text-text-secondary hover:border-primary/40'
                  }`}>{loc}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-bold text-text-secondary uppercase text-[10px]">Waktu Pengamatan</label>
            <div className="flex flex-wrap gap-2">
              {WAKTU_OPTIONS.map(w => (
                <button key={w} type="button" onClick={() => toggleWaktu(w)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border-2 transition-smooth cursor-pointer ${
                    waktuPengamatan.includes(w) ? 'bg-accent border-accent text-white shadow-sm' : 'bg-bg border-border text-text-secondary hover:border-accent/40'
                  }`}>{w}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-bold text-text-secondary uppercase text-[10px]">Jangkauan Siswa saat Observasi</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {JANGKAUAN_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setJangkauanSiswa(opt.value)}
                  className={`p-3 rounded-xl border-2 text-left text-[11px] font-semibold transition-smooth cursor-pointer ${
                    jangkauanSiswa === opt.value ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-bg text-text-secondary hover:border-primary/30'
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Info Kelas yang Diamati
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Kelas</label>
                <input type="text" value={kelas} onChange={e => setKelas(e.target.value)} placeholder="4A"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Inisial Guru</label>
                <input type="text" value={guruInisial} onChange={e => setGuruInisial(e.target.value)} placeholder="RW"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1">
                <CustomSelect
                  label="JK Guru"
                  options={[
                    { value: 'P', label: 'Perempuan' },
                    { value: 'L', label: 'Laki-laki' },
                  ]}
                  value={guruJK}
                  onChange={(val) => setGuruJK(val as 'L'|'P')}
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Mata Pelajaran</label>
                <input type="text" value={mapel} onChange={e => setMapel(e.target.value)} placeholder="Tematik"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── DIMENSI SEL ─── */}
      {isDimensi && (
        <div className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border bg-bg/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary font-display">
                  Dimensi: {SEL_DIMENSI_LABEL[currentStep.id as SELDimensi]}
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Beri skor 1–4 tiap indikator yang terlihat</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-display text-primary">{filledInStep}<span className="text-sm text-text-secondary font-normal">/{currentDimensiInds.length}</span></div>
                <div className="text-[10px] text-text-secondary">terisi</div>
              </div>
            </div>
            <div className="mt-3 bg-border rounded-full h-1.5">
              <div className="bg-primary rounded-full h-1.5 transition-all"
                style={{ width: `${currentDimensiInds.length > 0 ? (filledInStep / currentDimensiInds.length) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="p-5 space-y-4">
            {(['guru', 'murid'] as const).map(subjek => {
              const inds = currentDimensiInds.filter(i => i.subjek === subjek);
              if (!inds.length) return null;
              return (
                <div key={subjek}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${subjek === 'guru' ? 'text-primary' : 'text-accent'}`}>
                      {subjek === 'guru' ? <GraduationCap className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      {subjek === 'guru' ? 'Indikator Guru' : 'Indikator Murid'}
                    </span>
                    <div className={`flex-1 h-px ${subjek === 'guru' ? 'bg-primary/20' : 'bg-accent/20'}`} />
                  </div>
                  <div className="space-y-3">
                    {inds.map(ind => (
                      <IndikatorCard key={ind.id} indikator={ind}
                        jawaban={jawaban.find(j => j.indikatorId === ind.id)}
                        onSkorChange={handleSkorChange}
                        onCatatanChange={handleCatatanChange}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── REVIEW ─── */}
      {isReview && (
        <div className="rounded-2xl bg-surface border border-border shadow-card p-6 space-y-5">
          <h3 className="text-sm font-bold text-text-primary font-display flex items-center gap-2 border-b border-border pb-4">
            <List className="h-4 w-4 text-primary" /> Review & Kirim Observasi
          </h3>
          <div className="bg-bg rounded-xl p-4 border border-border/50 space-y-2 text-xs">
            {[['Sekolah', sekolahNama || 'Belum diisi'], ['Kecamatan', kecamatan ? `Kec. ${kecamatan}` : 'Belum diisi'], ['Tanggal', tanggal], ['Observer', observerNama || 'Belum diisi']].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/40 pb-1.5 last:border-0">
                <span className="text-text-secondary font-medium">{k}</span>
                <span className="text-text-primary font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-primary">Progres per Dimensi</h4>
            {SEL_DIMENSI_ORDER.map(d => {
              const inds = getIndikatorsByFilter({ dimensi: d });
              const filled = inds.filter(ind => jawaban.find(j => j.indikatorId === ind.id)?.skor != null).length;
              return (
                <div key={d} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-text-primary">{SEL_DIMENSI_LABEL[d]}</span>
                    <span className="text-text-secondary">{filled}/{inds.length}</span>
                  </div>
                  <div className="bg-border rounded-full h-1.5">
                    <div className="bg-primary rounded-full h-1.5 transition-all"
                      style={{ width: `${inds.length > 0 ? (filled / inds.length) * 100 : 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary font-display">{totalFilled}<span className="text-base text-text-secondary font-normal">/{SEL_INDIKATORS.length}</span></div>
            <div className="text-xs text-text-secondary mt-1">total indikator terisi</div>
          </div>
          {!sekolahNama.trim() && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-status-belum/10 border border-status-belum/20 text-xs font-semibold text-status-belum">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> Nama sekolah harus diisi.
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between rounded-xl bg-surface border border-border shadow-card p-4">
        <button type="button" disabled={stepIdx === 0} onClick={() => setStepIdx(i => i - 1)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth">
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </button>
        <button type="button" onClick={() => showToast('Draft disimpan!')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-bg transition-smooth">
          <Save className="h-3.5 w-3.5" /> Draft
        </button>
        {!isReview ? (
          <button type="button" onClick={() => setStepIdx(i => i + 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-sm transition-smooth">
            Selanjutnya <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit}
            disabled={submitMutation.isPending || !sekolahNama.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-status-sudah hover:bg-status-sudah/90 text-white text-xs font-bold shadow-md transition-smooth disabled:opacity-50">
            {submitMutation.isPending
              ? <><div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Menyimpan...</>
              : <><Send className="h-3.5 w-3.5" /> Kirim Observasi</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  BAGIAN 3: ADMIN CRUD PANEL
// ══════════════════════════════════════════════════════════════

function SessionDetailModal({ session, onClose, onDelete }: {
  session: SELObservasiSession;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  // Compute scores per dimensi for display
  const jawabanMap: Record<string, SELSkor | null> = {};
  session.jawaban.forEach(j => { jawabanMap[j.indikatorId] = j.skor; });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h3 className="font-bold text-text-primary text-base font-display">{session.sekolahNama}</h3>
            <p className="text-[11px] text-text-secondary">{session.kecamatan} · {session.kabupaten} · {session.tanggal}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-secondary hover:bg-border/40 transition-smooth">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Meta info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {[
              ['Observer', session.observerNama || '—'],
              ['Kelas', session.kelasDiamati || '—'],
              ['Guru', `${session.namaGuruInisial} (${session.jenisKelaminGuru})`],
              ['Mata Pelajaran', session.mataPelajaran || '—'],
              ['Siswa L/P', `${session.jumlahSiswaL}/${session.jumlahSiswaP}`],
              ['Status', session.status],
            ].map(([k, v]) => (
              <div key={k} className="bg-bg rounded-xl p-3 border border-border/50">
                <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">{k}</div>
                <div className="font-semibold text-text-primary mt-0.5 capitalize">{v}</div>
              </div>
            ))}
          </div>

          {/* Lokasi & Waktu */}
          <div className="flex flex-wrap gap-2">
            {session.lokasiDiamati.map(l => (
              <span key={l} className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-lg font-medium">{l}</span>
            ))}
            {session.waktuPengamatan.map(w => (
              <span key={w} className="text-[10px] px-2 py-1 bg-accent/10 text-accent rounded-lg font-medium">{w}</span>
            ))}
          </div>

          {/* Jawaban per dimensi summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary">Skor Per Dimensi</h4>
            <div className="space-y-2">
              {SEL_DIMENSI_ORDER.map(dim => {
                const label = SEL_DIMENSI_LABEL[dim];
                const list = getIndikatorsByFilter({ dimensi: dim });
                const filled = list.map(i => jawabanMap[i.id]).filter(v => v !== null && v !== undefined) as SELSkor[];
                const avg = filled.length > 0 ? (filled.reduce((a, b) => a + b, 0) / filled.length).toFixed(2) : '—';
                return (
                  <div key={dim} className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border/50 text-xs">
                    <span className="font-medium text-text-primary">{label}</span>
                    <span className="font-bold text-primary">{avg} / 4.0</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan dengan isian */}
          {session.jawaban.some(j => j.catatan) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-text-primary">Catatan Observer</h4>
              {session.jawaban.filter(j => j.catatan).map(j => {
                const ind = SEL_INDIKATORS.find(i => i.id === j.indikatorId);
                return (
                  <div key={j.indikatorId} className="p-3 bg-bg rounded-xl border border-border/50 text-xs">
                    <p className="text-text-secondary font-medium mb-1 line-clamp-1">{ind?.teks}</p>
                    <p className="text-text-primary italic">"{j.catatan}"</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action buttons - Read only */}
        </div>
      </div>
    </div>,
    document.body
  );
}


function AdminObservasiPanel() {
  const queryClient = useQueryClient();
  const [selectedKab, setSelectedKab] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<SELObservasiSession | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const { data: rawSessions = [], isLoading, refetch } = useQuery({
    queryKey: ['selObservations', selectedKab],
    queryFn: () => database.getSELObservations({ kabupaten: selectedKab || undefined }),
  });

  const { data: selStats } = useQuery({
    queryKey: ['selStats'],
    queryFn: database.getSELSummaryStats,
  });

  const sessions = rawSessions;

  const visibleSessions = sessions
    .filter(s => !deletedIds.has(s.id))
    .filter(s => {
      if (!search) return true;
      return s.sekolahNama.toLowerCase().includes(search.toLowerCase()) ||
        s.kecamatan.toLowerCase().includes(search.toLowerCase()) ||
        s.observerNama?.toLowerCase().includes(search.toLowerCase());
    });

  const handleDelete = (id: string) => {
    setDeletedIds(prev => new Set([...prev, id]));
    queryClient.invalidateQueries({ queryKey: ['selStats'] });
  };

  return (
    <div className="space-y-5">
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-[#5a6bd4] to-accent p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">Manajemen Sesi Observasi SEL</h2>
              <p className="text-white/70 text-[11px] mt-0.5">Admin · Lihat & pantau semua data hasil observasi lapangan</p>
            </div>
          </div>
          {selStats && (
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Total Sesi', val: selStats.totalDiobservasi },
                { label: 'Perlu Intervensi', val: selStats.butuhIntervensi },
              ].map(item => (
                <div key={item.label} className="bg-white/20 rounded-xl px-4 py-2.5 text-center">
                  <div className="text-white/70 text-[9px] uppercase tracking-wider font-bold">{item.label}</div>
                  <div className="text-white font-bold text-xl font-display">{item.val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-xl bg-surface border border-border p-3 shadow-card">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary pointer-events-none" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari sekolah / observer..."
              className="pl-9 pr-3 py-2 rounded-xl border border-border bg-bg text-xs text-text-primary focus:border-primary focus:outline-none w-56" />
          </div>
          <div className="min-w-[170px]">
            <CustomSelect
              options={[
                { value: '', label: 'Semua Kabupaten' },
                ...KABUPATEN_LIST.map(k => ({ value: k.name, label: k.name }))
              ]}
              value={selectedKab}
              onChange={(val) => setSelectedKab(val)}
              placeholder="Pilih Kabupaten"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-secondary font-medium">
            {visibleSessions.length} sesi ditemukan
          </span>
          <button onClick={() => refetch()}
            className="p-2 rounded-xl border border-border text-text-secondary hover:bg-bg hover:text-text-primary transition-smooth">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Summary Row */}
      {selStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Sesi Diobservasi', value: selStats.totalDiobservasi, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/8' },
            { label: 'Rata-rata Guru', value: `${selStats.rataGuruAll}/4`, icon: GraduationCap, color: 'text-status-sudah', bg: 'bg-status-sudah/8' },
            { label: 'Rata-rata Murid', value: `${selStats.rataMuridAll}/4`, icon: Users, color: 'text-accent', bg: 'bg-accent/8' },
            { label: 'Butuh Intervensi', value: selStats.butuhIntervensi, icon: AlertCircle, color: 'text-status-belum', bg: 'bg-status-belum/8' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl bg-surface border border-border shadow-card p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl ${item.bg}`}><Icon className={`h-4 w-4 ${item.color}`} /></div>
                <div>
                  <div className={`text-xl font-bold font-display ${item.color}`}>{item.value}</div>
                  <div className="text-[10px] text-text-secondary font-medium">{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sessions Table */}
      <div className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border bg-bg/30 flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary font-display flex items-center gap-2">
            <List className="h-4 w-4 text-primary" /> Daftar Semua Sesi Observasi
          </h3>
          <span className="text-[10px] text-text-secondary font-medium">Klik icon detail atau baris tabel untuk melihat detail sesi</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="bg-bg/40 border-b border-border">
                <th className="py-3 px-4 text-left text-[10px] font-bold text-text-secondary uppercase tracking-wider">Sekolah</th>
                <th className="py-3 px-3 text-left text-[10px] font-bold text-text-secondary uppercase">Observer</th>
                <th className="py-3 px-3 text-center text-[10px] font-bold text-text-secondary uppercase">Tanggal</th>
                <th className="py-3 px-3 text-center text-[10px] font-bold text-text-secondary uppercase">Guru</th>
                <th className="py-3 px-3 text-center text-[10px] font-bold text-text-secondary uppercase">Murid</th>
                <th className="py-3 px-3 text-center text-[10px] font-bold text-text-secondary uppercase">Status</th>
                <th className="py-3 px-3 text-center text-[10px] font-bold text-text-secondary uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-12 text-center text-text-secondary animate-pulse">Memuat data...</td></tr>
              ) : visibleSessions.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-text-secondary">Tidak ada sesi ditemukan.</td></tr>
              ) : (
                visibleSessions.map(session => {
                  // Compute quick skor
                  const jawabanMap: Record<string, SELSkor | null> = {};
                  session.jawaban.forEach(j => { jawabanMap[j.indikatorId] = j.skor; });
                  const guruVals = SEL_INDIKATORS.filter(i => i.subjek === 'guru').map(i => jawabanMap[i.id]).filter((v): v is SELSkor => v != null);
                  const muridVals = SEL_INDIKATORS.filter(i => i.subjek === 'murid').map(i => jawabanMap[i.id]).filter((v): v is SELSkor => v != null);
                  const guruAvg = guruVals.length ? Math.round((guruVals.reduce((a,b)=>a+b,0)/guruVals.length)*10)/10 : 0;
                  const muridAvg = muridVals.length ? Math.round((muridVals.reduce((a,b)=>a+b,0)/muridVals.length)*10)/10 : 0;

                  return (
                    <tr key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="border-b border-border/40 hover:bg-bg/30 cursor-pointer transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-text-primary">{session.sekolahNama}</p>
                        <p className="text-[9px] text-text-secondary">{session.kecamatan} · {session.kabupaten}</p>
                      </td>
                      <td className="py-3 px-3 text-text-secondary">{session.observerNama || '—'}</td>
                      <td className="py-3 px-3 text-center text-text-secondary">
                        <span className="flex items-center justify-center gap-1">
                          <Calendar className="h-3 w-3" />{session.tanggal}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <SkorBadge skor={guruAvg} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <SkorBadge skor={muridAvg} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          session.status === 'submitted' ? 'bg-status-sudah/10 text-status-sudah' : 'bg-status-sebagian/10 text-status-sebagian'
                        }`}>{session.status}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-smooth"
                            title="Lihat Detail">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border/50 bg-bg/20 text-[10px] text-text-secondary text-center">
          Menampilkan {visibleSessions.length} dari {sessions.length} total sesi observasi
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  EXPORT UTAMA — tergantung userRole
// ══════════════════════════════════════════════════════════════

export default function ObservasiSEL({ userRole = 'pengawas' }: { userRole?: 'admin' | 'pengawas' }) {
  const [submitted, setSubmitted] = useState(false);

  // Admin → CRUD panel manajemen
  if (userRole === 'admin') {
    return <AdminObservasiPanel />;
  }

  // School/Observer → Form isian wizard
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-4">
        <div className="w-20 h-20 rounded-full bg-status-sudah/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-status-sudah" />
        </div>
        <h2 className="text-2xl font-bold font-display text-text-primary">Observasi Berhasil Dikirim!</h2>
        <p className="text-sm text-text-secondary max-w-md leading-relaxed">
          Data observasi SEL telah tersimpan dan akan segera diproses oleh tim Dinas Pendidikan.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-dark transition-smooth">
          Observasi Sekolah Lain
        </button>
      </div>
    );
  }

  return <ObservasiFormWizard onSubmitDone={() => setSubmitted(true)} />;
}
