/**
 * @module features/sel/pages
 * @description Form wizard observasi lapangan SEL — 55+ indikator per sesi
 * @tables sel_sesi_observasi, sel_jawaban_observasi, sel_indikator, sel_dimensi, satuan_pendidikan
 * @api POST /api/sel/sesi, PUT /api/sel/sesi/:id, POST /api/sel/jawaban
 */

import { useState, useEffect } from 'react';
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
import { apiClient } from '../../../shared/services/api-client';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';
import { notifyToast } from '../../../shared/components/NotificationToast';

// ─── Helpers ──────────────────────────────────────── ────────────

const SKOR_OPTIONS: { value: SELSkor; label: string; icon: typeof XCircle; color: string; selColor: string }[] = [
  { value: 1, label: 'Tidak Terlihat', icon: XCircle, color: 'text-status-belum', selColor: 'border-status-belum   bg-status-belum/5' },
  { value: 2, label: 'Kadang Terlihat', icon: Clock, color: 'text-status-sebagian', selColor: 'border-status-sebagian bg-status-sebagian/5' },
  { value: 3, label: 'Sering Terlihat', icon: CheckCircle, color: 'text-status-sudah', selColor: 'border-status-sudah   bg-status-sudah/5' },
  { value: 4, label: 'Konsisten', icon: Sparkles, color: 'text-primary', selColor: 'border-primary        bg-primary/5' },
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
  indikator, jawaban, onSkorChange, onCatatanChange, isHighlighted, onClearHighlight,
}: {
  indikator: (typeof SEL_INDIKATORS)[0];
  jawaban: SELJawaban | undefined;
  onSkorChange: (id: string, skor: SELSkor | null) => void;
  onCatatanChange: (id: string, catatan: string) => void;
  isHighlighted?: boolean;
  onClearHighlight?: () => void;
}) {
  const [showCatatan, setShowCatatan] = useState(false);
  const skor = jawaban?.skor ?? null;
  const currentOpt = SKOR_OPTIONS.find(s => s.value === skor);
  const CurrentIcon = currentOpt?.icon;

  return (
    <div
      id={`indicator-card-${indikator.id}`}
      onClick={() => {
        if (isHighlighted) onClearHighlight?.();
      }}
      className={`rounded-xl border-2 transition-all duration-200 p-4 space-y-3 ${
        isHighlighted
          ? 'border-rose-500 bg-rose-50/20 shadow-xs'
          : skor ? 'border-primary/25 bg-primary/3' : 'border-border bg-bg/30'
      }`}
    >
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
              onClick={(e) => {
                e.stopPropagation();
                if (isHighlighted) onClearHighlight?.();
                onSkorChange(indikator.id, isSelected ? null : opt.value);
              }}
              className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${isSelected
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
        <button type="button" onClick={() => {
          if (isHighlighted) onClearHighlight?.();
          onSkorChange(indikator.id, null);
        }}
          className="text-[10px] font-medium text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors">
          <X className="h-3 w-3" /> Tidak bisa diamati
        </button>
        <button type="button" onClick={() => {
          if (isHighlighted) onClearHighlight?.();
          setShowCatatan(!showCatatan);
        }}
          className="text-[10px] font-medium text-primary flex items-center gap-1 transition-colors">
          {showCatatan ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showCatatan ? 'Tutup' : '+ Catatan'}
        </button>
      </div>

      {showCatatan && (
        <textarea rows={2} placeholder="Tulis catatan temuan..."
          value={jawaban?.catatan || ''}
          onFocus={() => { if (isHighlighted) onClearHighlight?.(); }}
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
  { id: 'konteks', label: 'Konteks', icon: MapPin },
  { id: 'kesadaran_diri', label: 'Kes. Diri', icon: Brain },
  { id: 'regulasi_emosi', label: 'Reg. Emosi', icon: Users },
  { id: 'kesadaran_sosial', label: 'Kes. Sosial', icon: School },
  { id: 'keterampilan_relasi', label: 'Relasi', icon: Users },
  { id: 'tanggung_jawab', label: 'Tgg. Jawab', icon: ClipboardList },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
];

export function ObservasiFormWizard({ onSubmitDone }: { onSubmitDone?: () => void }) {
  const queryClient = useQueryClient();
  const [stepIdx, setStepIdx] = useState(0);
  const [kabupaten, setKabupaten] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [sekolahNama, setSekolahNama] = useState('');
  const [observerNama, setObserverNama] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [lokasiDiamati, setLokasiDiamati] = useState<string[]>([]);
  const [waktuPengamatan, setWaktuPengamatan] = useState<string[]>([]);
  const [jangkauanSiswa, setJangkauanSiswa] = useState<1 | 2 | 3 | 4>(2);
  const [jumlahSiswaL, setJumlahSiswaL] = useState(0);
  const [jumlahSiswaP, setJumlahSiswaP] = useState(0);
  const [disabilitasL, setDisabilitasL] = useState(0);
  const [disabilitasP, setDisabilitasP] = useState(0);
  const [kelas, setKelas] = useState('');
  const [guruInisial, setGuruInisial] = useState('');
  const [guruJK, setGuruJK] = useState<'L' | 'P'>('P');
  const [mapel, setMapel] = useState('');
  const [jawaban, setJawaban] = useState<SELJawaban[]>(buildInitialJawaban);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSekolahId, setSelectedSekolahId] = useState<number | null>(null);
  const [draftRestoredAt, setDraftRestoredAt] = useState<string | null>(null);
  const [allowDuplicateSession, setAllowDuplicateSession] = useState(false);
  const [selectedExistingSession, setSelectedExistingSession] = useState<SELObservasiSession | null>(null);

  const DRAFT_KEY = 'sel_observasi_form_draft';

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title = 'Form Observasi SEL') => {
    notifyToast({ type, title, message: msg });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restore User Profile & Draft on Mount
  useEffect(() => {
    try {
      const profileStr = localStorage.getItem('bsan_user_profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        if (profile.nama && !observerNama) {
          setObserverNama(profile.nama);
        }
      }
    } catch { }

    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          if (parsed.kabupaten) setKabupaten(parsed.kabupaten);
          if (parsed.kecamatan) setKecamatan(parsed.kecamatan);
          if (parsed.sekolahNama) setSekolahNama(parsed.sekolahNama);
          if (parsed.selectedSekolahId) setSelectedSekolahId(parsed.selectedSekolahId);
          if (parsed.observerNama) setObserverNama(parsed.observerNama);
          if (parsed.tanggal) setTanggal(parsed.tanggal);
          if (parsed.lokasiDiamati) setLokasiDiamati(parsed.lokasiDiamati);
          if (parsed.waktuPengamatan) setWaktuPengamatan(parsed.waktuPengamatan);
          if (parsed.jangkauanSiswa) setJangkauanSiswa(parsed.jangkauanSiswa);
          if (parsed.jumlahSiswaL !== undefined) setJumlahSiswaL(parsed.jumlahSiswaL);
          if (parsed.jumlahSiswaP !== undefined) setJumlahSiswaP(parsed.jumlahSiswaP);
          if (parsed.disabilitasL !== undefined) setDisabilitasL(parsed.disabilitasL);
          if (parsed.disabilitasP !== undefined) setDisabilitasP(parsed.disabilitasP);
          if (parsed.kelas) setKelas(parsed.kelas);
          if (parsed.guruInisial) setGuruInisial(parsed.guruInisial);
          if (parsed.guruJK) setGuruJK(parsed.guruJK);
          if (parsed.mapel) setMapel(parsed.mapel);
          if (parsed.jawaban && Array.isArray(parsed.jawaban)) setJawaban(parsed.jawaban);
          if (parsed.stepIdx !== undefined) setStepIdx(parsed.stepIdx);
          setDraftRestoredAt(parsed.savedAt || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }
      } catch { }
    }
  }, []);

  // Auto-Save Draft on Form Field Changes
  useEffect(() => {
    const isTouched = sekolahNama || observerNama || kelas || guruInisial || mapel || jawaban.some(j => j.skor !== null);
    if (!isTouched) return;

    const draftData = {
      kabupaten, kecamatan, sekolahNama, selectedSekolahId, observerNama, tanggal,
      lokasiDiamati, waktuPengamatan, jangkauanSiswa, jumlahSiswaL, jumlahSiswaP,
      disabilitasL, disabilitasP, kelas, guruInisial, guruJK, mapel, jawaban, stepIdx,
      savedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  }, [
    kabupaten, kecamatan, sekolahNama, selectedSekolahId, observerNama, tanggal,
    lokasiDiamati, waktuPengamatan, jangkauanSiswa, jumlahSiswaL, jumlahSiswaP,
    disabilitasL, disabilitasP, kelas, guruInisial, guruJK, mapel, jawaban, stepIdx
  ]);

  const handleResetDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setKabupaten('');
    setKecamatan('');
    setSekolahNama('');
    setSelectedSekolahId(null);
    setObserverNama('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setLokasiDiamati([]);
    setWaktuPengamatan([]);
    setJangkauanSiswa(2);
    setJumlahSiswaL(0);
    setJumlahSiswaP(0);
    setDisabilitasL(0);
    setDisabilitasP(0);
    setKelas('');
    setGuruInisial('');
    setGuruJK('P');
    setMapel('');
    setJawaban(buildInitialJawaban());
    setStepIdx(0);
    setDraftRestoredAt(null);
    showToast('Draf formulir telah dibersihkan.', 'info', 'Draf Dihapus');
    scrollToTop();
  };

  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);

  const scrollToField = (fieldId: string) => {
    setHighlightedFieldId(fieldId);
    setTimeout(() => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
    setTimeout(() => {
      setHighlightedFieldId((curr) => (curr === fieldId ? null : curr));
    }, 4500);
  };

  // Step Validation Check
  const checkStepValid = (idx: number): { valid: boolean; reason?: string; fieldId?: string } => {
    if (idx === 0) { // Konteks
      if (!kabupaten) return { valid: false, reason: 'Kabupaten/Kota belum dipilih.', fieldId: 'field-kabupaten' };
      if (!kecamatan) return { valid: false, reason: 'Kecamatan belum dipilih.', fieldId: 'field-kecamatan' };
      if (!sekolahNama.trim()) return { valid: false, reason: 'Nama Sekolah Sasaran belum dipilih/diisi.', fieldId: 'field-sekolah' };
      if (!observerNama.trim()) return { valid: false, reason: 'Nama Observer belum diisi.', fieldId: 'field-observer' };
      if (!kelas.trim()) return { valid: false, reason: 'Kelas yang diamati belum diisi.', fieldId: 'field-kelas' };
      if (!guruInisial.trim()) return { valid: false, reason: 'Inisial Guru belum diisi.', fieldId: 'field-guruInisial' };
      if (!mapel.trim()) return { valid: false, reason: 'Mata Pelajaran belum diisi.', fieldId: 'field-mapel' };
      return { valid: true };
    }

    if (idx >= 1 && idx <= 5) { // Dimensions
      const stepKey = STEPS[idx].id;
      const inds = getIndikatorsByFilter({ dimensi: stepKey as SELDimensi });
      const missing = inds.find(ind => {
        const j = jawaban.find(jj => jj.indikatorId === ind.id);
        return j?.skor === null || j?.skor === undefined;
      });
      if (missing) {
        return {
          valid: false,
          reason: `Indikator "${missing.teks}" belum diberi skor.`,
          fieldId: `indicator-card-${missing.id}`,
        };
      }
      return { valid: true };
    }

    return { valid: true };
  };

  const goToStep = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= STEPS.length) return;

    if (targetIdx <= stepIdx) {
      setStepIdx(targetIdx);
      scrollToTop();
      return;
    }

    for (let i = 0; i < targetIdx; i++) {
      const check = checkStepValid(i);
      if (!check.valid) {
        if (stepIdx !== i) setStepIdx(i);
        showToast(`Harap selesaikan Langkah ${i + 1} (${STEPS[i].label}): ${check.reason}`, 'warning', 'Langkah Belum Lengkap');
        if (check.fieldId) {
          scrollToField(check.fieldId);
        } else {
          scrollToTop();
        }
        return;
      }
    }

    setStepIdx(targetIdx);
    scrollToTop();
  };

  // Fetch dynamic Konteks options from MySQL
  const { data: dbKonteksRes } = useQuery({
    queryKey: ['sel-konteks-options'],
    queryFn: () => apiClient.sel.getKonteks(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: allExistingSessions = [] } = useQuery({
    queryKey: ['selObservationsAll'],
    queryFn: () => database.getSELObservations(),
  });

  const existingSchoolSession = sekolahNama
    ? allExistingSessions.find(s => s.sekolahNama.toLowerCase().trim() === sekolahNama.toLowerCase().trim())
    : null;

  const lokasiOptionsList = (dbKonteksRes?.data && dbKonteksRes.data.filter((d: any) => d.kategori === 'lokasi').length > 0)
    ? dbKonteksRes.data.filter((d: any) => d.kategori === 'lokasi').map((d: any) => d.label)
    : LOKASI_OPTIONS;

  const waktuOptionsList = (dbKonteksRes?.data && dbKonteksRes.data.filter((d: any) => d.kategori === 'waktu').length > 0)
    ? dbKonteksRes.data.filter((d: any) => d.kategori === 'waktu').map((d: any) => d.label)
    : WAKTU_OPTIONS;

  const jangkauanOptionsList = (dbKonteksRes?.data && dbKonteksRes.data.filter((d: any) => d.kategori === 'jangkauan').length > 0)
    ? dbKonteksRes.data.filter((d: any) => d.kategori === 'jangkauan').map((d: any) => ({ value: (d.urutan || 1) as (1 | 2 | 3 | 4), label: d.label }))
    : JANGKAUAN_OPTIONS;

  const mapelOptionsList = (dbKonteksRes?.data && dbKonteksRes.data.filter((d: any) => d.kategori === 'mapel').length > 0)
    ? dbKonteksRes.data.filter((d: any) => d.kategori === 'mapel').map((d: any) => d.label)
    : ['Tematik', 'Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'PJOK', 'Pendidikan Agama', 'Seni Budaya & Prakarya'];

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.sel.submitSesi(payload);
      if (!res.success) throw new Error(res.message || 'Gagal menyimpan sesi observasi.');
      return res;
    },
    onSuccess: (res) => {
      localStorage.removeItem(DRAFT_KEY);
      queryClient.invalidateQueries({ queryKey: ['selScores'] });
      queryClient.invalidateQueries({ queryKey: ['selHeatmap'] });
      queryClient.invalidateQueries({ queryKey: ['selMatriks'] });
      queryClient.invalidateQueries({ queryKey: ['selStats'] });
      queryClient.invalidateQueries({ queryKey: ['selObservations'] });
      queryClient.invalidateQueries({ queryKey: ['selObservationsAll'] });
      showToast(res.message || 'Sesi observasi SEL berhasil disimpan ke database MySQL!', 'success', 'Sesi Tersimpan');
      onSubmitDone?.();
    },
    onError: (err: any) => {
      showToast(err.message || 'Gagal menyimpan ke server database. Silakan periksa kembali data Anda.', 'error', 'Gagal Menyimpan');
      scrollToTop();
    }
  });

  const handleSkorChange = (id: string, skor: SELSkor | null) =>
    setJawaban(prev => prev.map(j => j.indikatorId === id ? { ...j, skor } : j));
  const handleCatatanChange = (id: string, catatan: string) =>
    setJawaban(prev => prev.map(j => j.indikatorId === id ? { ...j, catatan } : j));
  const toggleLokasi = (v: string) => setLokasiDiamati(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const toggleWaktu = (v: string) => setWaktuPengamatan(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  const currentStep = STEPS[stepIdx];
  const isKonteks = currentStep.id === 'konteks';
  const isReview = currentStep.id === 'review';
  const isDimensi = !isKonteks && !isReview;
  const currentDimensiInds = isDimensi ? getIndikatorsByFilter({ dimensi: currentStep.id as SELDimensi }) : [];
  const filledInStep = currentDimensiInds.filter(ind => {
    const j = jawaban.find(jj => jj.indikatorId === ind.id);
    return j?.skor !== null && j?.skor !== undefined;
  }).length;
  const totalFilled = jawaban.filter(j => j.skor !== null).length;

  const handleOpenConfirm = () => {
    const check = checkStepValid(0);
    if (!check.valid) {
      showToast(`Harap lengkapi isian Konteks: ${check.reason}`, 'warning', 'Konteks Belum Lengkap');
      setStepIdx(0);
      scrollToTop();
      return;
    }
    for (let i = 1; i <= 5; i++) {
      const checkDim = checkStepValid(i);
      if (!checkDim.valid) {
        showToast(`Harap lengkapi Dimensi ${STEPS[i].label}: ${checkDim.reason}`, 'warning', 'Dimensi Belum Lengkap');
        setStepIdx(i);
        scrollToTop();
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const { data: dbSchoolsOptions = [], isLoading: isLoadingDbSchools } = useQuery({
    queryKey: ['db-schools-wizard', kabupaten, kecamatan],
    queryFn: () => database.getSchools({
      kabupaten: kabupaten || undefined,
      kecamatan: kecamatan || undefined,
    }),
  });

  const handleSelectSchoolFromDb = (nama: string) => {
    setSekolahNama(nama);
    const found = dbSchoolsOptions.find(s => s.nama === nama);
    if (found) {
      setSelectedSekolahId(found.id ? Number(found.id) : null);
      if (found.kecamatan) setKecamatan(found.kecamatan);
      if (found.kabupaten) setKabupaten(found.kabupaten);
    }
  };

  const executeSubmit = () => {
    setShowConfirmModal(false);

    const formattedJawaban = jawaban
      .filter(j => j.skor !== null)
      .map(j => ({
        indikator_id: isNaN(Number(j.indikatorId)) ? undefined : Number(j.indikatorId),
        indikator_kode: j.indikatorId,
        skor: j.skor,
        catatan: j.catatan || null,
      }));

    submitMutation.mutate({
      sekolah_id: selectedSekolahId || undefined,
      sekolah_nama: sekolahNama.trim(),
      kecamatan: kecamatan,
      kabupaten: kabupaten,
      tanggal: tanggal,
      observer_nama: observerNama || 'Observer Pengawas',
      lokasi_diamati: lokasiDiamati.length > 0 ? lokasiDiamati : ['Ruang Kelas'],
      waktu_pengamatan: waktuPengamatan.length > 0 ? waktuPengamatan : ['Jam Pelajaran'],
      jumlah_siswa_l: jumlahSiswaL,
      jumlah_siswa_p: jumlahSiswaP,
      siswa_disabilitas_l: disabilitasL,
      siswa_disabilitas_p: disabilitasP,
      jangkauan_siswa: jangkauanSiswa,
      kelas_diamati: kelas || '4A',
      guru_inisial: guruInisial || 'GR',
      guru_jk: guruJK,
      mata_pelajaran: mapel || 'Tematik',
      jawaban: formattedJawaban,
    });
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {selectedExistingSession && (
        <SessionDetailModal
          session={selectedExistingSession}
          onClose={() => setSelectedExistingSession(null)}
          onDelete={() => { }}
        />
      )}

      {/* Draft Restored Banner */}
      {draftRestoredAt && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3.5 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
            <span>Draf otomatis dipulihkan (Pukul {draftRestoredAt}). Data isian Anda aman tersimpan.</span>
          </div>
          <button
            type="button"
            onClick={handleResetDraft}
            className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 transition-smooth cursor-pointer"
          >
            Riset Draf
          </button>
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
              <button key={step.id} type="button" onClick={() => goToStep(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${isActive ? 'bg-white text-primary shadow-md' :
                    isDone ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
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
            <div
              id="field-kabupaten"
              onClick={() => { if (highlightedFieldId === 'field-kabupaten') setHighlightedFieldId(null); }}
              className={`space-y-1 transition-all duration-200 rounded-xl ${highlightedFieldId === 'field-kabupaten' ? 'border-2 border-rose-500 p-1 bg-rose-50/20' : ''}`}
            >
              <CustomSelect
                label="Kabupaten / Kota *"
                options={KABUPATEN_LIST.map(k => ({ value: k.name, label: k.name }))}
                value={kabupaten}
                onChange={(val) => {
                  if (highlightedFieldId === 'field-kabupaten') setHighlightedFieldId(null);
                  setKabupaten(val);
                }}
              />
            </div>
            <div
              id="field-kecamatan"
              onClick={() => { if (highlightedFieldId === 'field-kecamatan') setHighlightedFieldId(null); }}
              className={`space-y-1 transition-all duration-200 rounded-xl ${highlightedFieldId === 'field-kecamatan' ? 'border-2 border-rose-500 p-1 bg-rose-50/20' : ''}`}
            >
              <CustomSelect
                label="Kecamatan *"
                options={[
                  { value: '', label: '-- Pilih Kecamatan --' },
                  ...KECAMATAN_LIST.map(k => ({ value: k, label: k }))
                ]}
                value={kecamatan}
                onChange={(val) => {
                  if (highlightedFieldId === 'field-kecamatan') setHighlightedFieldId(null);
                  setKecamatan(val);
                }}
                enableSearch={true}
              />
            </div>
            <div
              id="field-sekolah"
              onClick={() => { if (highlightedFieldId === 'field-sekolah') setHighlightedFieldId(null); }}
              className={`sm:col-span-2 space-y-1 transition-all duration-200 rounded-xl ${highlightedFieldId === 'field-sekolah' ? 'border-2 border-rose-500 p-1 bg-rose-50/20' : ''}`}
            >
              <label className="font-bold text-text-secondary uppercase text-[10px]">Nama Sekolah Sasaran *</label>
              <CustomSelect
                label=""
                options={[
                  { value: '', label: isLoadingDbSchools ? 'Memuat daftar sekolah dari database...' : '-- Pilih / Cari Nama Sekolah Sasaran --' },
                  ...dbSchoolsOptions.map(s => ({
                    value: s.nama,
                    label: `${s.nama} (${s.npsn || 'NPSN'}) • Kec. ${s.kecamatan}, ${s.kabupaten}`,
                  }))
                ]}
                value={sekolahNama}
                onChange={(val) => {
                  if (highlightedFieldId === 'field-sekolah') setHighlightedFieldId(null);
                  handleSelectSchoolFromDb(val);
                }}
                placeholder="Pilih atau cari nama sekolah..."
                enableSearch={true}
              />
            </div>

            {existingSchoolSession && !allowDuplicateSession && (
              <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <span>Sesi Observasi SEL untuk Sekolah ini Sudah Pernah Dikirim</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Data pengamatan untuk <strong>{existingSchoolSession.sekolahNama}</strong> telah tersimpan di database (Dikirim pada {existingSchoolSession.tanggal} oleh {existingSchoolSession.observerNama || 'Observer'}).
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedExistingSession(existingSchoolSession)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold shadow-xs hover:bg-amber-50 transition cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>Lihat Detail Sesi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowDuplicateSession(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>+ Input Sesi Observasi Lanjutan Baru</span>
                  </button>
                </div>
              </div>
            )}
            <div
              id="field-observer"
              onClick={() => { if (highlightedFieldId === 'field-observer') setHighlightedFieldId(null); }}
              className={`space-y-1 transition-all duration-200 rounded-xl ${highlightedFieldId === 'field-observer' ? 'border-2 border-rose-500 p-1 bg-rose-50/20' : ''}`}
            >
              <label className="font-bold text-text-secondary uppercase text-[10px]">Nama Observer *</label>
              <input type="text" value={observerNama}
                onFocus={() => { if (highlightedFieldId === 'field-observer') setHighlightedFieldId(null); }}
                onChange={e => setObserverNama(e.target.value)} placeholder="Nama / Inisial"
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
              {lokasiOptionsList.map(loc => (
                <button key={loc} type="button" onClick={() => toggleLokasi(loc)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border-2 transition-smooth cursor-pointer ${lokasiDiamati.includes(loc) ? 'bg-primary border-primary text-white shadow-sm' : 'bg-bg border-border text-text-secondary hover:border-primary/40'
                    }`}>{loc}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-bold text-text-secondary uppercase text-[10px]">Waktu Pengamatan</label>
            <div className="flex flex-wrap gap-2">
              {waktuOptionsList.map(w => (
                <button key={w} type="button" onClick={() => toggleWaktu(w)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border-2 transition-smooth cursor-pointer ${waktuPengamatan.includes(w) ? 'bg-accent border-accent text-white shadow-sm' : 'bg-bg border-border text-text-secondary hover:border-accent/40'
                    }`}>{w}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-bold text-text-secondary uppercase text-[10px]">Jangkauan Siswa saat Observasi</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {jangkauanOptionsList.map(opt => (
                <button key={opt.value + opt.label} type="button" onClick={() => setJangkauanSiswa(opt.value as any)}
                  className={`p-3 rounded-xl border-2 text-left text-[11px] font-semibold transition-smooth cursor-pointer ${jangkauanSiswa === opt.value ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-bg text-text-secondary hover:border-primary/30'
                    }`}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Info Kelas yang Diamati
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div
                id="field-kelas"
                onClick={() => { if (highlightedFieldId === 'field-kelas') setHighlightedFieldId(null); }}
                className={`space-y-1 transition-all duration-200 rounded-xl ${highlightedFieldId === 'field-kelas' ? 'border-2 border-rose-500 p-1 bg-rose-50/20' : ''}`}
              >
                <label className="font-bold text-text-secondary uppercase text-[10px]">Kelas *</label>
                <input type="text" value={kelas}
                  onFocus={() => { if (highlightedFieldId === 'field-kelas') setHighlightedFieldId(null); }}
                  onChange={e => setKelas(e.target.value)} placeholder="4A"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div
                id="field-guruInisial"
                onClick={() => { if (highlightedFieldId === 'field-guruInisial') setHighlightedFieldId(null); }}
                className={`space-y-1 transition-all duration-200 rounded-xl ${highlightedFieldId === 'field-guruInisial' ? 'border-2 border-rose-500 p-1 bg-rose-50/20' : ''}`}
              >
                <label className="font-bold text-text-secondary uppercase text-[10px]">Inisial Guru *</label>
                <input type="text" value={guruInisial}
                  onFocus={() => { if (highlightedFieldId === 'field-guruInisial') setHighlightedFieldId(null); }}
                  onChange={e => setGuruInisial(e.target.value)} placeholder="RW"
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
                  onChange={(val) => setGuruJK(val as 'L' | 'P')}
                />
              </div>
              <div
                id="field-mapel"
                onClick={() => { if (highlightedFieldId === 'field-mapel') setHighlightedFieldId(null); }}
                className={`space-y-1 transition-all duration-200 rounded-xl ${highlightedFieldId === 'field-mapel' ? 'border-2 border-rose-500 p-1 bg-rose-50/20' : ''}`}
              >
                <label className="font-bold text-text-secondary uppercase text-[10px]">Mata Pelajaran *</label>
                <input
                  type="text"
                  list="mapel-list"
                  value={mapel}
                  onFocus={() => { if (highlightedFieldId === 'field-mapel') setHighlightedFieldId(null); }}
                  onChange={e => setMapel(e.target.value)}
                  placeholder="Pilih atau ketik mapel (misal: Tematik)"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                />
                <datalist id="mapel-list">
                  {mapelOptionsList.map(m => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
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
                        isHighlighted={highlightedFieldId === `indicator-card-${ind.id}`}
                        onClearHighlight={() => setHighlightedFieldId(null)}
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
        <button type="button" disabled={stepIdx === 0} onClick={() => goToStep(stepIdx - 1)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth cursor-pointer">
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </button>
        <button type="button" onClick={() => {
          showToast('📌 Draf formulir berhasil disimpan.');
          scrollToTop();
        }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-bg transition-smooth cursor-pointer">
          <Save className="h-3.5 w-3.5" /> Draft
        </button>
        {!isReview ? (
          <button type="button" onClick={() => goToStep(stepIdx + 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-sm transition-smooth cursor-pointer">
            Selanjutnya <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={handleOpenConfirm}
            disabled={submitMutation.isPending || !sekolahNama.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-status-sudah hover:bg-status-sudah/90 text-white text-xs font-bold shadow-md transition-smooth disabled:opacity-50 cursor-pointer">
            {submitMutation.isPending
              ? <><div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Menyimpan...</>
              : <><Send className="h-3.5 w-3.5" /> Kirim Observasi</>}
          </button>
        )}
      </div>

      {/* Modal Alert Konfirmasi Kirim Data Observasi */}
      {showConfirmModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-base font-display">Konfirmasi Kirim Observasi</h3>
                <p className="text-xs text-text-secondary mt-0.5">Pastikan data pengamatan sudah benar sebelum disimpan ke database.</p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
              <p className="font-semibold text-amber-900">
                Pengiriman Data Permanen
              </p>
              <p className="text-[11px] text-amber-800">
                Data observasi SEL akan langsung tersimpan di database MySQL dan dijadikan acuan rekapitulasi Dinas Pendidikan.
              </p>
            </div>

            {/* Ringkasan Data Sesi */}
            <div className="bg-bg/60 rounded-xl p-3.5 border border-border/60 space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-text-secondary font-medium">Sekolah Target:</span>
                <span className="text-text-primary font-bold">{sekolahNama}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-text-secondary font-medium">Wilayah:</span>
                <span className="text-text-primary font-semibold">Kec. {kecamatan || '-'}, {kabupaten}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-text-secondary font-medium">Observer & Tanggal:</span>
                <span className="text-text-primary font-semibold">{observerNama || 'Observer Pengawas'} ({tanggal})</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-text-secondary font-medium">Kelas & Guru:</span>
                <span className="text-text-primary font-semibold">Kelas {kelas || '4A'} • Guru {guruInisial || 'GR'} ({guruJK === 'P' ? 'Perempuan' : 'Laki-laki'})</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-text-secondary font-medium">Indikator Terisi:</span>
                <span className="text-emerald-700 font-bold">{totalFilled} dari {SEL_INDIKATORS.length} Indikator</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-bg text-text-secondary font-semibold text-xs transition-smooth cursor-pointer"
              >
                Batal & Periksa
              </button>
              <button
                type="button"
                onClick={executeSubmit}
                disabled={submitMutation.isPending}
                className="px-4 py-2 rounded-xl bg-status-sudah hover:bg-status-sudah/90 text-white font-bold text-xs shadow-md transition-smooth active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitMutation.isPending ? (
                  <LoadingIndicator type="line-spinner" size="sm" label="" className="text-white" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Ya, Kirim Data</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
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
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'rincian'>('ringkasan');
  const [subjekFilter, setSubjekFilter] = useState<'semua' | 'guru' | 'murid'>('semua');

  // Compute scores per dimensi for display
  const jawabanMap: Record<string, SELSkor | null> = {};
  const catatanMap: Record<string, string> = {};

  (session.jawaban || []).forEach((j: any, idx: number) => {
    const key1 = j.indikatorId ? String(j.indikatorId) : null;
    const key2 = j.indikator_kode ? String(j.indikator_kode) : null;
    const key3 = j.indikator_id ? String(j.indikator_id) : null;
    if (key1) { jawabanMap[key1] = j.skor; if (j.catatan) catatanMap[key1] = j.catatan; }
    if (key2) { jawabanMap[key2] = j.skor; if (j.catatan) catatanMap[key2] = j.catatan; }
    if (key3) { jawabanMap[key3] = j.skor; if (j.catatan) catatanMap[key3] = j.catatan; }

    // Numeric ID to string code mapping fallback
    if (typeof j.indikator_id === 'number' && j.indikator_id > 0 && SEL_INDIKATORS[j.indikator_id - 1]) {
      const mappedCode = SEL_INDIKATORS[j.indikator_id - 1].id;
      if (j.skor !== null && j.skor !== undefined) {
        jawabanMap[mappedCode] = j.skor;
        if (j.catatan) catatanMap[mappedCode] = j.catatan;
      }
    }
    // Sequential index fallback
    if (SEL_INDIKATORS[idx]) {
      const idxCode = SEL_INDIKATORS[idx].id;
      if (jawabanMap[idxCode] === undefined && j.skor !== null && j.skor !== undefined) {
        jawabanMap[idxCode] = j.skor;
        if (j.catatan && !catatanMap[idxCode]) catatanMap[idxCode] = j.catatan;
      }
    }
  });

  const lokasiList = Array.isArray(session.lokasiDiamati) ? session.lokasiDiamati : [];
  const waktuList = Array.isArray(session.waktuPengamatan) ? session.waktuPengamatan : [];
  const totalInSesiArray = (session.jawaban || []).length;
  const totalJawabanTerisi = (session.jawaban || []).filter((j: any) => j.skor !== null && j.skor !== undefined).length;
  const totalTargetDisplay = totalInSesiArray > 0 ? totalInSesiArray : SEL_INDIKATORS.length;

  // Calculate overall average score
  const filledSkors = Object.values(jawabanMap).filter((s): s is SELSkor => s !== null && s !== undefined);
  const overallAvg = filledSkors.length > 0 ? (filledSkors.reduce((a, b) => a + b, 0) / filledSkors.length).toFixed(2) : '—';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Simple Clean Header */}
        <div className="p-4 px-6 border-b border-slate-200 bg-white flex items-center justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                {session.sekolahNama || 'Sesi Observasi SEL'}
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {session.status || 'Submitted'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Kec. {session.kecamatan || '-'}, {session.kabupaten || 'Sidoarjo'} · Observasi: {session.tanggal}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 pt-3">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('ringkasan')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'ringkasan'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Ringkasan Sesi & Dimensi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rincian')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'rincian'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Rincian {totalJawabanTerisi} Indikator ({totalJawabanTerisi}/{totalTargetDisplay} Terisi)
            </button>
          </div>

          {activeTab === 'rincian' && (
            <div className="hidden sm:flex items-center gap-1 mb-2 text-[11px] font-semibold">
              {(['semua', 'guru', 'murid'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSubjekFilter(f)}
                  className={`px-2.5 py-1 rounded-md capitalize transition cursor-pointer ${
                    subjekFilter === f
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f === 'semua' ? 'Semua' : f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Simple Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {activeTab === 'ringkasan' ? (
            <>
              {/* Top Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Rata-Rata Skor SEL</span>
                  <div className="text-xl font-bold text-slate-900">{overallAvg} <span className="text-xs font-normal text-slate-500">/ 4.0</span></div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total Terisi</span>
                  <div className="text-xl font-bold text-emerald-700">{totalJawabanTerisi} <span className="text-xs font-normal text-slate-500">/ {totalTargetDisplay}</span></div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Kelas & Guru</span>
                  <div className="text-sm font-bold text-slate-900 truncate">Kelas {session.kelasDiamati || '4A'}</div>
                  <p className="text-[10px] text-slate-500 truncate">Guru: {session.namaGuruInisial || (session as any).guru_inisial || 'GR'} ({session.jenisKelaminGuru === 'P' ? 'P' : 'L'})</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Observer</span>
                  <div className="text-sm font-bold text-slate-900 truncate">{session.observerNama || 'Observer Pengawas'}</div>
                  <p className="text-[10px] text-slate-500 truncate">{session.mataPelajaran || 'Tematik'}</p>
                </div>
              </div>

              {/* Grid Metadata Detail Sesi */}
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Informasi Detail Pengamatan
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {[
                    ['Mata Pelajaran', session.mataPelajaran || '—'],
                    ['Siswa Laki-laki', `${session.jumlahSiswaL || 0} Siswa`],
                    ['Siswa Perempuan', `${session.jumlahSiswaP || 0} Siswa`],
                    ['Siswa Disabilitas', `${(session.siswaDisabilitasL || 0) + (session.siswaDisabilitasP || 0)} Siswa`],
                    ['Status Pengisian', session.status || 'submitted'],
                    ['Waktu Pengajuan', (session as any).submittedAt || (session as any).submitted_at ? new Date((session as any).submittedAt || (session as any).submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : session.tanggal],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white rounded-lg p-2.5 border border-slate-200">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{k}</div>
                      <div className="font-semibold text-slate-800 mt-0.5 text-xs">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Environment & Observation Time */}
                {(lokasiList.length > 0 || waktuList.length > 0) && (
                  <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide shrink-0">Lokasi & Waktu:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {lokasiList.map((l: string) => (
                        <span key={l} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium border border-indigo-200">{l}</span>
                      ))}
                      {waktuList.map((w: string) => (
                        <span key={w} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium border border-slate-200">{w}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dimension Scores Breakdown */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Skor Rata-Rata Per Dimensi SEL
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SEL_DIMENSI_ORDER.map(dim => {
                    const label = SEL_DIMENSI_LABEL[dim];
                    const list = getIndikatorsByFilter({ dimensi: dim });
                    const filled = list.map(i => jawabanMap[i.id]).filter(v => v !== null && v !== undefined) as SELSkor[];
                    const avgNum = filled.length > 0 ? filled.reduce((a, b) => a + b, 0) / filled.length : 0;
                    const avgStr = filled.length > 0 ? avgNum.toFixed(2) : '—';

                    return (
                      <div key={dim} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <span className="font-semibold text-slate-800 text-xs">{label}</span>
                        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded text-xs">
                          {avgStr} / 4.0
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Observer Temuan Notes */}
              {(session.jawaban || []).some((j: any) => j.catatan) && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Catatan Temuan Observer
                  </h4>
                  <div className="space-y-2">
                    {(session.jawaban || []).filter((j: any) => j.catatan).map((j: any, idx: number) => {
                      const ind = SEL_INDIKATORS.find(i => i.id === j.indikatorId || i.id === j.indikator_kode);
                      return (
                        <div key={j.indikatorId || idx} className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                          <p className="text-amber-800 font-bold text-[10px] uppercase tracking-wide">
                            {ind?.subjek || 'Observer'} · {ind?.teks || j.indikator_teks || `Indikator #${j.indikator_id}`}
                          </p>
                          <p className="text-slate-800 italic text-xs">"{j.catatan}"</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Rincian Indikator Tab */
            <div className="space-y-5">
              {SEL_DIMENSI_ORDER.map(dim => {
                let list = getIndikatorsByFilter({ dimensi: dim });
                if (subjekFilter !== 'semua') {
                  list = list.filter(i => i.subjek === subjekFilter);
                }
                if (list.length === 0) return null;

                return (
                  <div key={dim} className="space-y-2.5">
                    <div className="pb-1 border-b border-slate-200">
                      <h5 className="font-bold text-indigo-700 text-xs uppercase tracking-wide">
                        {SEL_DIMENSI_LABEL[dim]} ({list.length} Indikator)
                      </h5>
                    </div>

                    <div className="space-y-2">
                      {list.map(ind => {
                        const skor = jawabanMap[ind.id];
                        const cat = catatanMap[ind.id];
                        const opt = SKOR_OPTIONS.find(s => s.value === skor);

                        const badgeStyle = skor === 4
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : skor === 3
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : skor === 2
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : skor === 1
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200';

                        return (
                          <div
                            key={ind.id}
                            className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  ind.subjek === 'guru' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}>
                                  {ind.subjek === 'guru' ? 'GURU' : 'MURID'}
                                </span>
                                <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {ind.konteks}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800 leading-relaxed">{ind.teks}</p>
                              {cat && <p className="text-[11px] text-amber-800 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Catatan: "{cat}"</p>}
                            </div>

                            <div className="shrink-0">
                              {skor && opt ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${badgeStyle}`}>
                                  {skor}/4 · {opt.label}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Belum diisi</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Simple Footer */}
        <div className="p-3 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
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

  // Calculate live fallback stats if needed
  const totalDiobservasi = selStats?.totalDiobservasi || visibleSessions.length;
  
  let computedRataGuru = 0;
  let computedRataMurid = 0;
  if (visibleSessions.length > 0) {
    const allAnswers = visibleSessions.flatMap(s => s.jawaban || []);
    const guruSkors = allAnswers.filter(a => String(a.indikatorId || (a as any).indikator_kode).startsWith('guru_') && a.skor !== null && a.skor !== undefined).map(a => Number(a.skor));
    const muridSkors = allAnswers.filter(a => String(a.indikatorId || (a as any).indikator_kode).startsWith('murid_') && a.skor !== null && a.skor !== undefined).map(a => Number(a.skor));
    if (guruSkors.length > 0) computedRataGuru = Number((guruSkors.reduce((a, b) => a + b, 0) / guruSkors.length).toFixed(1));
    if (muridSkors.length > 0) computedRataMurid = Number((muridSkors.reduce((a, b) => a + b, 0) / muridSkors.length).toFixed(1));
  }

  const rataGuru = selStats?.rataGuruAll ? selStats.rataGuruAll : computedRataGuru;
  const rataMurid = selStats?.rataMuridAll ? selStats.rataMuridAll : computedRataMurid;
  const butuhIntervensi = selStats?.butuhIntervensi ?? 0;

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
      <div className="rounded-2xl bg-surface border border-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-text-primary">Manajemen Sesi Observasi SEL</h2>
              <p className="text-text-secondary text-xs mt-0.5">Admin · Lihat & pantau semua data hasil observasi lapangan</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Total Sesi', val: totalDiobservasi },
              { label: 'Perlu Intervensi', val: butuhIntervensi },
            ].map(item => (
              <div key={item.label} className="bg-white/20 rounded-xl px-4 py-2.5 text-center">
                <div className="text-white/70 text-[9px] uppercase tracking-wider font-bold">{item.label}</div>
                <div className="text-white font-bold text-xl font-display">{item.val}</div>
              </div>
            ))}
          </div>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Sesi Diobservasi', value: totalDiobservasi, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/8' },
          { label: 'Rata-rata Guru', value: `${rataGuru}/4`, icon: GraduationCap, color: 'text-status-sudah', bg: 'bg-status-sudah/8' },
          { label: 'Rata-rata Murid', value: `${rataMurid}/4`, icon: Users, color: 'text-accent', bg: 'bg-accent/8' },
          { label: 'Butuh Intervensi', value: butuhIntervensi, icon: AlertCircle, color: 'text-status-belum', bg: 'bg-status-belum/8' },
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
                <tr>
                  <td colSpan={7} className="py-16 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-500/20 shadow-xs">
                        <ClipboardList className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-text-primary font-display">Belum Ada Sesi Observasi SEL</h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Database pengamatan observasi SEL saat ini masih bersih (0 sesi). Data pengamatan akan muncul secara otomatis setelah Pengawas Sekolah menginput hasil pengamatan di lapangan.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleSessions.map(session => {
                  // Compute quick skor
                  const jawabanMap: Record<string, SELSkor | null> = {};
                  session.jawaban.forEach(j => { jawabanMap[j.indikatorId] = j.skor; });
                  const guruVals = SEL_INDIKATORS.filter(i => i.subjek === 'guru').map(i => jawabanMap[i.id]).filter((v): v is SELSkor => v != null);
                  const muridVals = SEL_INDIKATORS.filter(i => i.subjek === 'murid').map(i => jawabanMap[i.id]).filter((v): v is SELSkor => v != null);
                  const guruAvg = guruVals.length ? Math.round((guruVals.reduce((a, b) => a + b, 0) / guruVals.length) * 10) / 10 : 0;
                  const muridAvg = muridVals.length ? Math.round((muridVals.reduce((a, b) => a + b, 0) / muridVals.length) * 10) / 10 : 0;

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
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${session.status === 'submitted' ? 'bg-status-sudah/10 text-status-sudah' : 'bg-status-sebagian/10 text-status-sebagian'
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

export default function ObservasiSEL({ userRole = 'pengawas' }: { userRole?: 'admin' | 'pengawas' | 'sekolah' }) {
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
