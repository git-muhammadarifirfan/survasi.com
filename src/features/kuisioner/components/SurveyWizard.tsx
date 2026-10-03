/**
 * @module features/kuisioner/components
 * @description Wizard pengisian Kuesioner BSAN (akun sekolah & mode simulasi admin).
 *
 *  - Auto-fetch HANYA: nama (dari akun, masih bisa diubah untuk guru lain), nama sekolah,
 *    kabupaten, dan kecamatan (terkunci, diambil dari sekolah yang terdaftar di akun).
 *  - Pertanyaan bersyarat: bagian Kelas Awal/Kelas Tinggi hanya muncul sesuai kelas yang
 *    diajar, pertanyaan "Jika ya…" hanya muncul bila jawaban sebelumnya "Ya/Sudah".
 *  - Status sekolah otomatis menjadi PROSES saat mulai mengisi, SELESAI saat terkirim.
 *  - Draft tersimpan otomatis per akun (localStorage) dan bisa dilanjutkan.
 *  - Layout responsif: header progres sticky + navigasi bawah sticky di mobile.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Check, ChevronLeft, ChevronRight, Send, Save, Lock, Building2, MapPin, PlayCircle, ShieldCheck,
  WifiOff, AlertCircle, CheckCircle2, FileText, Clock, UserPlus, LayoutDashboard, Loader2,
} from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import { database } from '../../../shared/data/data-source';
import CustomSelect from '../../../shared/components/CustomSelect';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import { notifyToast } from '../../../shared/components/NotificationToast';
import { saveDraft, getDraft, clearDraft } from '../../../shared/utils/draftStorage';

export interface WizardQuestion {
  id: number;
  modul_id: number | null;
  kode_pertanyaan: string;
  teks_pertanyaan: string;
  tipe: string;
  opsi_jawaban: string[] | null;
  urutan: number;
  is_required: boolean | number;
  section: string;
  role?: string | null;
}

interface Props {
  questions: WizardQuestion[];
  sectionOrder: string[];
  sectionMeta: Record<string, { title: string; desc: string }>;
  userRole: 'admin' | 'pengawas' | 'sekolah';
  /** Mode simulasi admin (tanpa layar sambutan, bisa memilih sekolah) */
  simulation?: boolean;
}

type Answers = Record<number, any>;

const LOCKED_ROLES = new Set(['sekolah', 'kabupaten', 'kecamatan']);
const DRAFT_PING_MS = 60_000;

const isEmpty = (v: any) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
const startsNo = (v: any) => typeof v === 'string' && /^(tidak|belum)/i.test(v.trim());
const stripKab = (s: string) => s.replace(/^(kab\.?|kabupaten|kota)\s+/i, '').trim();

export default function SurveyWizard({ questions, sectionOrder, sectionMeta, userRole, simulation = false }: Props) {
  const qc = useQueryClient();
  const isSekolah = userRole === 'sekolah';

  const { data: profile } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => (await apiClient.auth.getProfile()).data,
    staleTime: 60_000,
    refetchInterval: false,
  });
  const { data: myStatus } = useQuery({
    queryKey: ['survey-my-status'],
    queryFn: async () => (await apiClient.get<any>('/survey/my-status')).data,
    enabled: isSekolah,
  });
  // Daftar sekolah hanya dibutuhkan admin (mode simulasi memilih sekolah)
  const { data: schools = [] } = useQuery({
    queryKey: ['wizard-schools'],
    queryFn: () => database.getSchools(),
    enabled: !isSekolah,
    staleTime: 10 * 60_000,
    refetchInterval: false,
  });

  const draftKey = `kuisioner_u${profile?.id ?? 'anon'}`;
  const byRole = useMemo(() => {
    const m: Record<string, WizardQuestion> = {};
    questions.forEach(q => { if (q.role && !m[q.role]) m[q.role] = q; });
    return m;
  }, [questions]);

  const [started, setStarted] = useState(simulation);
  const [answers, setAnswers] = useState<Answers>({});
  const [secIdx, setSecIdx] = useState(0);
  const [adminSchoolId, setAdminSchoolId] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [draftInfo, setDraftInfo] = useState<{ step: number; lastUpdated: string } | null>(null);
  const lastPing = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── Nilai identitas dari akun / sekolah terpilih ──
  const adminSchool = schools.find(s => String(s.id) === adminSchoolId);
  const identity = useMemo(() => {
    const kabNama: string = isSekolah ? (profile?.kabupaten_nama || myStatus?.sekolah?.kabupaten || '') : (adminSchool?.kabupaten || '');
    const kabQ = byRole.kabupaten;
    const kabOpt = kabQ?.opsi_jawaban?.find(o => o.toLowerCase() === stripKab(kabNama).toLowerCase());
    return {
      nama: profile?.nama || '',
      sekolah: isSekolah ? (profile?.sekolah_nama || myStatus?.sekolah?.nama || '') : (adminSchool?.nama || ''),
      kabupaten: kabOpt || kabNama,
      kecamatan: isSekolah ? (profile?.kecamatan_nama || myStatus?.sekolah?.kecamatan || '') : (adminSchool?.kecamatan || ''),
    };
  }, [isSekolah, profile, myStatus, adminSchool, byRole]);

  // Paksa nilai terkunci (sekolah/kabupaten/kecamatan) & isi nama bila kosong
  useEffect(() => {
    setAnswers(prev => {
      const next = { ...prev };
      let changed = false;
      for (const role of ['sekolah', 'kabupaten', 'kecamatan'] as const) {
        const q = byRole[role];
        const v = identity[role];
        if (q && v && next[q.id] !== v) { next[q.id] = v; changed = true; }
      }
      const qn = byRole.nama;
      if (qn && identity.nama && isEmpty(next[qn.id])) { next[qn.id] = identity.nama; changed = true; }
      return changed ? next : prev;
    });
  }, [identity, byRole]);

  // Cek draft tersimpan untuk akun ini
  useEffect(() => {
    if (!profile?.id) return;
    const d = getDraft<Answers>(draftKey);
    if (d && Object.keys(d.data || {}).length) setDraftInfo({ step: d.step, lastUpdated: d.lastUpdated });
  }, [profile?.id, draftKey]);

  // ── Visibilitas bersyarat ──
  const ans = (role: string) => (byRole[role] ? answers[byRole[role].id] : undefined);
  const isVisible = (q: WizardQuestion): boolean => {
    const penerima = ans('penerima_modul');
    const belumMenerima = typeof penerima === 'string' && /^belum/i.test(penerima);
    const tidakImpl = startsNo(ans('status_implementasi'));
    const kelas = String(ans('kelas_mengajar') || '');
    if (q.role === 'penyelenggara') return !belumMenerima;
    if (q.section === 'implementasi_awal' || q.section === 'implementasi_tinggi') {
      if (belumMenerima || tidakImpl) return false;
      if (!kelas) return false;
      if (q.section === 'implementasi_awal' && !/awal/i.test(kelas)) return false;
      if (q.section === 'implementasi_tinggi' && !/tinggi/i.test(kelas)) return false;
    }
    const pairs: Record<string, string> = {
      temuan_murid_awal: 'refleksi_murid_awal', temuan_guru_awal: 'refleksi_guru_awal',
      temuan_murid_tinggi: 'refleksi_murid_tinggi', temuan_guru_tinggi: 'refleksi_guru_tinggi',
    };
    if (q.role && pairs[q.role]) {
      const parent = ans(pairs[q.role]);
      if (isEmpty(parent) || startsNo(parent)) return false;
    }
    return true;
  };

  const visibleQs = questions.filter(isVisible);
  const sections = sectionOrder.filter(k => visibleQs.some(q => q.section === k));
  const safeIdx = Math.min(secIdx, Math.max(sections.length - 1, 0));
  const currentKey = sections[safeIdx];
  const currentQs = visibleQs.filter(q => q.section === currentKey);
  const meta = sectionMeta[currentKey] || { title: currentKey, desc: '' };
  const requiredQs = visibleQs.filter(q => q.is_required);
  const answeredCount = requiredQs.filter(q => !isEmpty(answers[q.id])).length;
  const progress = requiredQs.length ? Math.round((answeredCount / requiredQs.length) * 100) : 0;
  const sectionDone = (k: string) => visibleQs.filter(q => q.section === k && q.is_required).every(q => !isEmpty(answers[q.id]));

  // ── Status PROSES realtime ──
  const pingDraft = (force = false) => {
    if (!isSekolah) return;
    const now = Date.now();
    if (!force && now - lastPing.current < DRAFT_PING_MS) return;
    lastPing.current = now;
    apiClient.post('/survey/draft', {}).then(() => qc.invalidateQueries({ queryKey: ['survey-my-status'] })).catch(() => {});
  };

  const start = (restore: boolean) => {
    if (restore) {
      const d = getDraft<Answers>(draftKey);
      if (d) { setAnswers(prev => ({ ...d.data, ...lockedOnly(prev, false) })); setSecIdx(d.step || 0); }
    } else {
      clearDraft(draftKey);
      setAnswers(prev => lockedOnly(prev));
      setSecIdx(0);
    }
    setDraftInfo(null);
    setStarted(true);
    pingDraft(true);
  };

  /** Pertahankan hanya jawaban identitas (sekolah/wilayah, opsional nama) */
  const lockedOnly = (a: Answers, withNama = true): Answers => {
    const out: Answers = {};
    (withNama ? ['nama', 'sekolah', 'kabupaten', 'kecamatan'] : ['sekolah', 'kabupaten', 'kecamatan']).forEach(r => {
      const q = byRole[r];
      if (q && !isEmpty(a[q.id])) out[q.id] = a[q.id];
    });
    return out;
  };

  /** Sekolah: sekolah/kabupaten/kecamatan terkunci. Admin: kabupaten/kecamatan mengikuti sekolah yang dipilih. */
  const isLocked = (q: WizardQuestion) => isSekolah
    ? LOCKED_ROLES.has(q.role || '')
    : q.role === 'kabupaten' || q.role === 'kecamatan';

  const setAnswer = (q: WizardQuestion, value: any) => {
    if (isLocked(q)) return;
    if (highlight === q.id) setHighlight(null);
    setAnswers(prev => {
      const next = { ...prev, [q.id]: value };
      saveDraft(draftKey, next, safeIdx);
      return next;
    });
    setLastSaved(new Date());
    pingDraft();
  };

  const scrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateSection = (): boolean => {
    const missing = currentQs.find(q => q.is_required && isEmpty(answers[q.id]));
    if (missing) {
      setHighlight(missing.id);
      document.getElementById(`q-${missing.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      notifyToast({ type: 'warning', title: 'Belum lengkap', message: `Pertanyaan wajib belum dijawab: "${missing.teks_pertanyaan.trim().slice(0, 80)}"` });
      return false;
    }
    if (!isSekolah && currentQs.some(q => q.role === 'sekolah') && !adminSchoolId) {
      notifyToast({ type: 'warning', title: 'Pilih sekolah', message: 'Mode simulasi admin: pilih sekolah terlebih dahulu.' });
      return false;
    }
    return true;
  };

  const goTo = (idx: number) => {
    if (idx > safeIdx && !validateSection()) return;
    setSecIdx(idx);
    saveDraft(draftKey, answers, idx);
    scrollTop();
  };

  const submit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const jawaban = visibleQs
        .filter(q => !isEmpty(answers[q.id]))
        .map(q => ({ pertanyaan_id: q.id, tipe: q.tipe, value: answers[q.id] }));
      const res = await apiClient.post('/survey/submit', { jawaban, sekolah_id: isSekolah ? undefined : Number(adminSchoolId) || undefined });
      if (!res.success) throw new Error(res.message || 'Gagal mengirim survei.');
      clearDraft(draftKey);
      setSubmitted(true);
      qc.invalidateQueries();
      notifyToast({ type: 'success', title: 'Survei terkirim', message: 'Jawaban tersimpan di database dan langsung masuk ke analisis.' });
    } catch (err: any) {
      if (!navigator.onLine) {
        saveDraft(draftKey, answers, safeIdx);
        notifyToast({ type: 'warning', title: 'Koneksi terputus', message: 'Jawaban disimpan sebagai draft. Kirim ulang saat online.' });
      } else {
        notifyToast({ type: 'error', title: 'Gagal mengirim', message: err?.message || 'Terjadi kesalahan.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillAnother = () => {
    setAnswers(prev => {
      const keep = lockedOnly(prev);
      const qn = byRole.nama;
      if (qn) delete keep[qn.id]; // responden berikutnya mengisi namanya sendiri
      return keep;
    });
    setSecIdx(0);
    setSubmitted(false);
    setStarted(true);
    scrollTop();
  };

  // ═══ Layar: belum terhubung sekolah ═══
  if (isSekolah && profile && !profile.sekolah_id) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl bg-surface border border-border shadow-card p-8 text-center space-y-3">
        <AlertCircle className="h-10 w-10 text-status-sebagian mx-auto" />
        <h2 className="text-lg font-bold text-text-primary">Akun belum terhubung ke sekolah</h2>
        <p className="text-sm text-text-secondary">Survei hanya dapat diisi oleh akun yang terdaftar pada satu sekolah. Hubungi admin untuk menautkan sekolah Anda.</p>
      </div>
    );
  }

  // ═══ Layar: terkirim ═══
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto my-6 rounded-3xl bg-surface border border-border shadow-card p-6 sm:p-10 text-center space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-status-sudah/10 text-status-sudah flex items-center justify-center mx-auto"><Check className="h-8 w-8" /></div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-text-primary font-display">Terima kasih, survei terkirim!</h2>
          <p className="text-sm text-text-secondary">Status sekolah kini <strong className="text-status-sudah">Selesai</strong>. Data langsung diolah di dashboard & analisis.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button onClick={fillAnother} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark cursor-pointer">
            <UserPlus className="h-4 w-4" /> Isi untuk responden lain
          </button>
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-bg border border-border text-sm font-bold text-text-primary hover:bg-border/40">
            <LayoutDashboard className="h-4 w-4" /> Ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ═══ Layar sambutan ═══
  if (!started) {
    const st = myStatus?.status_pengisian as string | undefined;
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {isOffline && <OfflineBanner />}
        <div className="rounded-3xl bg-surface border border-border shadow-card p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
              <ShieldCheck className="h-3.5 w-3.5" /> Instrumen Resmi Monitoring BSAN
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">Kuesioner Implementasi BSAN</h1>
            <p className="text-sm text-text-secondary leading-relaxed">Isi satu kuesioner untuk setiap guru/kepala sekolah. Identitas sekolah terisi otomatis dari akun Anda.</p>
          </div>

          {isSekolah && (
            <div className="rounded-2xl bg-bg border border-border p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <InfoItem icon={<Building2 className="h-4 w-4" />} label="Sekolah" value={identity.sekolah || '…'} />
              <InfoItem icon={<MapPin className="h-4 w-4" />} label="Kecamatan / Kabupaten" value={`${identity.kecamatan || '…'} / ${profile?.kabupaten_nama || '…'}`} />
              <InfoItem icon={<CheckCircle2 className="h-4 w-4" />} label="Status" value={st === 'sudah' ? `Selesai • ${myStatus?.total_responden || 0} survei` : st === 'sebagian' ? 'Proses mengisi' : 'Belum mengisi'} />
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
            <Chip icon={<FileText className="h-3.5 w-3.5" />}>{sections.length} bagian</Chip>
            <Chip icon={<Save className="h-3.5 w-3.5" />}>Draft otomatis</Chip>
            <Chip icon={<Clock className="h-3.5 w-3.5" />}>± 10 menit</Chip>
          </div>

          {draftInfo ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-text-primary">Ada draft yang belum dikirim</p>
              <p className="text-xs text-text-secondary">Terakhir disimpan {new Date(draftInfo.lastUpdated).toLocaleString('id-ID')}.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => start(true)} className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark cursor-pointer">
                  <PlayCircle className="h-5 w-5" /> Lanjutkan draft
                </button>
                <button onClick={() => start(false)} className="flex-1 h-12 rounded-xl bg-surface border border-border font-bold text-sm text-text-primary hover:bg-bg cursor-pointer">Mulai baru</button>
              </div>
            </div>
          ) : (
            <button onClick={() => start(false)} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark shadow-sm cursor-pointer">
              <PlayCircle className="h-5 w-5" /> Mulai Pengisian
            </button>
          )}
        </div>
      </div>
    );
  }

  // ═══ Wizard ═══
  return (
    <div ref={topRef} className="max-w-3xl mx-auto pb-28 lg:pb-10 scroll-mt-4">
      {isOffline && <div className="mb-3"><OfflineBanner /></div>}

      {/* Header progres (sticky) */}
      <div className="sticky top-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-5 py-3 bg-surface/95 backdrop-blur border-b sm:border border-border sm:rounded-2xl shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Bagian {safeIdx + 1} dari {sections.length}</p>
            <h2 className="text-sm sm:text-base font-bold text-text-primary truncate">{meta.title}</h2>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black font-display text-primary leading-none">{progress}%</p>
            <p className="text-[10px] text-text-secondary">{answeredCount}/{requiredQs.length} terjawab</p>
          </div>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-border/60 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
          {sections.map((k, i) => {
            const done = sectionDone(k);
            const active = i === safeIdx;
            return (
              <button key={k} type="button" onClick={() => goTo(i)}
                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                  active ? 'bg-primary text-white border-primary' : done ? 'bg-status-sudah/10 text-status-sudah border-status-sudah/20' : 'bg-bg text-text-secondary border-border'
                }`}>
                {done && !active ? <Check className="h-3 w-3" /> : <span>{i + 1}.</span>}
                <span className="max-w-[140px] truncate">{(sectionMeta[k]?.title || k)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {meta.desc && <p className="text-xs text-text-secondary mt-4 px-1">{meta.desc}</p>}

      {/* Pertanyaan */}
      <div className="mt-4 space-y-3">
        {currentQs.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={i + 1}
            value={answers[q.id]}
            highlighted={highlight === q.id}
            locked={isLocked(q)}
            autoFromAccount={q.role === 'nama' && !!identity.nama && answers[q.id] === identity.nama}
            onChange={(v) => setAnswer(q, v)}
            schoolPicker={!isSekolah && q.role === 'sekolah' ? (
              <CustomSelect
                options={[{ value: '', label: '-- Pilih sekolah (simulasi admin) --' }, ...schools.map(s => ({ value: s.id, label: `${s.nama} (${s.npsn}) • ${s.kecamatan}` }))]}
                value={adminSchoolId}
                onChange={(v) => setAdminSchoolId(String(v || ''))}
                enableSearch
              />
            ) : null}
          />
        ))}
      </div>

      {/* Navigasi (sticky di mobile) */}
      <div className="fixed lg:static inset-x-0 bottom-0 z-30 lg:z-auto mt-6 bg-surface/95 lg:bg-transparent backdrop-blur lg:backdrop-blur-none border-t lg:border-0 border-border px-4 lg:px-0 pt-3 lg:pt-0"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button type="button" disabled={safeIdx === 0} onClick={() => goTo(safeIdx - 1)}
            className="h-12 px-4 rounded-xl bg-bg border border-border text-sm font-bold text-text-primary disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer">
            <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          <div className="flex-1 text-center text-[10px] text-text-secondary hidden sm:block">
            {lastSaved ? `Draft tersimpan ${lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Draft tersimpan otomatis'}
          </div>
          {safeIdx < sections.length - 1 ? (
            <button type="button" onClick={() => goTo(safeIdx + 1)}
              className="flex-1 sm:flex-none h-12 px-6 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark inline-flex items-center justify-center gap-1 cursor-pointer">
              Lanjut <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" disabled={submitting} onClick={() => { if (validateSection()) setConfirmOpen(true); }}
              className="flex-1 sm:flex-none h-12 px-6 rounded-xl bg-status-sudah text-white text-sm font-bold hover:opacity-90 inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Kirim Survei
            </button>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
        title="Kirim jawaban survei?"
        description={`${answeredCount} dari ${requiredQs.length} pertanyaan wajib terjawab untuk responden "${(byRole.nama && answers[byRole.nama.id]) || '-'}" di ${identity.sekolah || 'sekolah terpilih'}. Jawaban yang terkirim tidak dapat diubah.`}
        confirmLabel="Ya, kirim"
        cancelLabel="Periksa lagi"
        variant="purple"
        icon={Send}
        isLoading={submitting}
      />
    </div>
  );
}

// ─── Sub-komponen ────────────────────────────────────────────────────────────

function OfflineBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-medium">
      <WifiOff className="h-4 w-4 shrink-0" /> Anda sedang offline. Jawaban tetap tersimpan sebagai draft di perangkat ini.
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-text-secondary font-semibold">{label}</p>
        <p className="text-xs font-bold text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg border border-border font-medium">{icon}{children}</span>;
}

function QuestionCard({ q, index, value, highlighted, locked, autoFromAccount, onChange, schoolPicker }: {
  q: WizardQuestion;
  index: number;
  value: any;
  highlighted: boolean;
  locked: boolean;
  autoFromAccount: boolean;
  onChange: (v: any) => void;
  schoolPicker: React.ReactNode;
}) {
  const answered = !isEmpty(value);
  const opts = q.opsi_jawaban || [];
  const wide = opts.some(o => o.length > 36);

  return (
    <div id={`q-${q.id}`} className={`rounded-2xl border bg-surface p-4 sm:p-5 transition scroll-mt-40 ${
      highlighted ? 'border-status-belum ring-2 ring-status-belum/20' : locked ? 'border-border bg-bg/60' : 'border-border'
    }`}>
      <div className="flex items-start gap-3 mb-3">
        <span className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${answered ? 'bg-status-sudah/10 text-status-sudah' : 'bg-primary/10 text-primary'}`}>
          {answered ? <Check className="h-3.5 w-3.5" /> : index}
        </span>
        <label className="text-sm font-semibold text-text-primary leading-snug pt-0.5">
          {q.teks_pertanyaan.trim()}
          {!!q.is_required && !locked && <span className="text-status-belum ml-1">*</span>}
          {q.tipe === 'checkbox' && <span className="block text-[11px] font-normal text-text-secondary mt-0.5">Boleh pilih lebih dari satu</span>}
        </label>
      </div>

      {locked ? (
        <div className="flex items-center gap-2 rounded-xl bg-surface border border-border px-3.5 py-3">
          <Lock className="h-4 w-4 text-text-secondary shrink-0" />
          <span className="text-sm font-semibold text-text-primary">{value || 'Terisi otomatis dari data sekolah'}</span>
          <span className="ml-auto text-[10px] font-bold text-status-sudah bg-status-sudah/10 px-2 py-0.5 rounded-md shrink-0">Dari akun</span>
        </div>
      ) : schoolPicker ? (
        schoolPicker
      ) : (q.tipe === 'radio' || (q.tipe === 'dropdown' && opts.length <= 6)) && opts.length ? (
        <div className={`grid gap-2 ${wide ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {opts.map(o => {
            const sel = value === o;
            return (
              <button key={o} type="button" onClick={() => onChange(o)}
                className={`flex items-center gap-3 text-left min-h-[48px] px-3.5 py-3 rounded-xl border text-sm transition cursor-pointer ${
                  sel ? 'border-primary bg-primary/5 text-text-primary font-semibold ring-1 ring-primary/30' : 'border-border hover:bg-bg text-text-primary'
                }`}>
                <span className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${sel ? 'border-primary' : 'border-border'}`}>
                  {sel && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <span className="leading-snug">{o}</span>
              </button>
            );
          })}
        </div>
      ) : q.tipe === 'dropdown' && opts.length ? (
        <CustomSelect options={opts.map(o => ({ value: o, label: o }))} value={value || ''} onChange={onChange} placeholder="-- Pilih jawaban --" enableSearch={opts.length > 8} />
      ) : q.tipe === 'checkbox' && opts.length ? (
        <div className={`grid gap-2 ${wide ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {opts.map(o => {
            const arr: string[] = Array.isArray(value) ? value : [];
            const sel = arr.includes(o);
            const isNone = /^belum ada$/i.test(o);
            return (
              <button key={o} type="button"
                onClick={() => {
                  if (sel) onChange(arr.filter(x => x !== o));
                  else if (isNone) onChange([o]); // "Belum ada" eksklusif
                  else onChange([...arr.filter(x => !/^belum ada$/i.test(x)), o]);
                }}
                className={`flex items-center gap-3 text-left min-h-[48px] px-3.5 py-3 rounded-xl border text-sm transition cursor-pointer ${
                  sel ? 'border-primary bg-primary/5 font-semibold ring-1 ring-primary/30' : 'border-border hover:bg-bg'
                } text-text-primary`}>
                <span className={`h-4 w-4 rounded-md border-2 shrink-0 flex items-center justify-center ${sel ? 'border-primary bg-primary text-white' : 'border-border'}`}>
                  {sel && <Check className="h-3 w-3" />}
                </span>
                <span className="leading-snug">{o}</span>
              </button>
            );
          })}
        </div>
      ) : q.role === 'nama' || q.role === 'no_wa' ? (
        <div className="space-y-1.5">
          <input
            type={q.role === 'no_wa' ? 'tel' : 'text'}
            inputMode={q.role === 'no_wa' ? 'tel' : 'text'}
            value={value || ''}
            onChange={e => onChange(q.role === 'no_wa' ? e.target.value.replace(/[^\d+\s-]/g, '') : e.target.value)}
            placeholder={q.role === 'no_wa' ? 'Contoh: 081234567890' : 'Nama lengkap responden'}
            className="w-full h-12 px-3.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {autoFromAccount && <p className="text-[11px] text-status-sudah font-medium">Terisi otomatis dari nama akun — ubah bila responden adalah guru lain.</p>}
        </div>
      ) : (
        <textarea
          rows={3}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Tuliskan jawaban Anda…"
          className="w-full px-3.5 py-3 rounded-xl border border-border bg-surface text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y min-h-[96px]"
        />
      )}
    </div>
  );
}
