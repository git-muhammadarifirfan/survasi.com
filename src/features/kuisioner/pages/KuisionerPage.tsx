/**
 * @module features/kuisioner/pages
 * @description Form wizard kuisioner BSAN — Real DB API, offline draft saving, step validation & 3-dot loading
 * @tables pertanyaan_survey, jawaban_survey, responden_survey
 * @api GET /api/survey/questions, POST /api/survey/submit
 */

import { useState, useEffect } from 'react';
import {
  BookOpen, ChevronLeft, ChevronRight, Check, Save, Send, HelpCircle,
  AlertCircle, PlayCircle, ShieldCheck, WifiOff, RefreshCw
} from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import SkeletonLoader from '../../../shared/components/SkeletonLoader';
import { saveDraft, getDraft, clearDraft } from '../../../shared/utils/draftStorage';

interface KuisionerProps {
  userRole: 'admin' | 'pengawas';
}

export interface ApiQuestionItem {
  id: number;
  modul_id: number | null;
  kode_pertanyaan: string;
  teks_pertanyaan: string;
  tipe: 'dropdown' | 'checkbox' | 'text' | 'radio' | 'scale';
  opsi_jawaban: string[] | null;
  urutan: number;
  is_required: boolean;
  section: string;
  target_kelas: string;
}

const SECTION_METADATA: Record<string, { title: string; desc: string }> = {
  identitas: { title: 'Identitas Responden', desc: 'Informasi data dasar sekolah & pengisi' },
  pelatihan: { title: 'Pelatihan & Implementasi', desc: 'Identifikasi pelatihan & tingkat adopsi BSAN' },
  implementasi_awal: { title: 'Implementasi Modul Kelas Awal', desc: 'Evaluasi bagian mudah/sulit & media ajar kelas 1-3' },
  implementasi_tinggi: { title: 'Implementasi Modul Kelas Tinggi', desc: 'Evaluasi bagian mudah/sulit & media ajar kelas 4-6' },
  kepsek: { title: 'Dukungan Kepala Sekolah', desc: 'Dukungan manajemen & program sekolah' },
  refleksi: { title: 'Refleksi & Perubahan Baik', desc: 'Refleksi bersama murid, guru & cerita narasi' },
  kontak: { title: 'Kontak Responden', desc: 'Nomor WhatsApp responden untuk klarifikasi' },
};

export default function Kuisioner({ userRole }: KuisionerProps) {
  void userRole;
  const [questions, setQuestions] = useState<ApiQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [hasStarted, setHasStarted] = useState(false);
  const [activeSecIdx, setActiveSecIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [draftFound, setDraftFound] = useState(false);

  // Detect offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Questions from API
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const res = await apiClient.get<ApiQuestionItem[]>('/api/survey/questions');
        if (res.success && res.data) {
          setQuestions(res.data);

          // Check draft
          const draft = getDraft<Record<number, any>>('kuisioner');
          if (draft && Object.keys(draft.data).length > 0) {
            setDraftFound(true);
          }
        } else {
          setError(res.message || 'Gagal memuat pertanyaan survei dari database.');
        }
      } catch (err: any) {
        setError('Gagal menghubungkan ke server MySQL API.');
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // Handle Restore Draft
  const handleRestoreDraft = () => {
    const draft = getDraft<Record<number, any>>('kuisioner');
    if (draft) {
      setAnswers(draft.data);
      setActiveSecIdx(draft.step || 0);
      setHasStarted(true);
      setDraftFound(false);
      triggerToast('Draft berhasil dipulihkan!');
    }
  };

  const handleIgnoreDraft = () => {
    clearDraft('kuisioner');
    setDraftFound(false);
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Group questions by section
  const sectionsList = Array.from(new Set(questions.map(q => q.section)));
  const currentSectionKey = sectionsList[activeSecIdx] || 'identitas';
  const currentQuestions = questions.filter(q => q.section === currentSectionKey);
  const currentMeta = SECTION_METADATA[currentSectionKey] || {
    title: currentSectionKey.toUpperCase(),
    desc: 'Pertanyaan survei BSAN',
  };

  // Handle answer change & Auto Save Draft
  const handleAnswerChange = (qId: number, value: any) => {
    const updated = { ...answers, [qId]: value };
    setAnswers(updated);
    saveDraft('kuisioner', updated, activeSecIdx);
  };

  // Step Validation: Check required fields in current section
  const validateCurrentSection = (): boolean => {
    for (const q of currentQuestions) {
      if (q.is_required) {
        const ans = answers[q.id];
        if (ans === undefined || ans === null || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
          setValidationError(`Pertanyaan wajib: "${q.kode_pertanyaan}. ${q.teks_pertanyaan}" belum diisi.`);
          return false;
        }
      }
    }
    setValidationError(null);
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentSection()) return;
    if (activeSecIdx < sectionsList.length - 1) {
      const nextIdx = activeSecIdx + 1;
      setActiveSecIdx(nextIdx);
      saveDraft('kuisioner', answers, nextIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (activeSecIdx > 0) {
      const prevIdx = activeSecIdx - 1;
      setActiveSecIdx(prevIdx);
      saveDraft('kuisioner', answers, prevIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Survey
  const handleSubmitSurvey = async () => {
    if (!validateCurrentSection()) return;

    try {
      setSubmitting(true);
      // Map answers for API payload
      const payloadAnswers = Object.entries(answers).map(([qIdStr, val]) => {
        const qId = parseInt(qIdStr);
        const qObj = questions.find(q => q.id === qId);
        return {
          pertanyaan_id: qId,
          tipe: qObj?.tipe || 'text',
          value: val,
        };
      });

      // Find respondent identity fields (Q1: Nama, Q2: JK, Q3: Posisi, Q4: Asal Sekolah, Q5: Kabupaten)
      const getAnsByCode = (code: string) => {
        const q = questions.find(item => item.kode_pertanyaan === code);
        return q ? answers[q.id] : null;
      };

      const payload = {
        nama: getAnsByCode('Q1') || 'Tanpa Nama',
        jenis_kelamin: getAnsByCode('Q2') === 'Perempuan' ? 'P' : 'L',
        posisi: getAnsByCode('Q3') || 'Guru',
        sekolah_id: 1, // Default to first school if not selected
        npsn: getAnsByCode('Q4') || '20512345',
        kabupaten_id: 1,
        kecamatan_id: 1,
        penerima_modul: getAnsByCode('Q9') || 'Ya',
        penyelenggara_pelatihan: getAnsByCode('Q10'),
        status_implementasi: getAnsByCode('Q11'),
        kelas_mengajar: getAnsByCode('Q12'),
        no_wa: getAnsByCode('Q37'),
        jawaban: payloadAnswers,
      };

      const res = await apiClient.post<{ meesage: string }>('/api/survey/submit', payload);
      if (res.success) {
        clearDraft('kuisioner');
        setSubmitted(true);
      } else {
        triggerToast(res.message || 'Gagal mengirim survei.');
      }
    } catch (err: any) {
      if (!navigator.onLine) {
        saveDraft('kuisioner', answers, activeSecIdx);
        triggerToast('Koneksi terputus! Draft tersimpan secara lokal.');
      } else {
        triggerToast('Terjadi kesalahan saat mengirim jawaban.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center">
          <div className="space-y-2">
            <div className="w-48 h-6 bg-slate-200 rounded animate-pulse" />
            <div className="w-80 h-4 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <SkeletonLoader type="form" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center space-x-3">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="font-semibold text-red-900">Gagal Memuat Kuisioner</h4>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Submitted Screen
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 lg:p-12 border border-slate-100 shadow-xl text-center space-y-6 animate-tab-content">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Check className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Terima Kasih!</h2>
          <p className="text-slate-600">
            Jawaban kuesioner BSAN Anda telah berhasil disimpan ke database real. Data ini akan digunakan untuk analisis efektivitas program di Jawa Timur.
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setHasStarted(false);
            setAnswers({});
            setActiveSecIdx(0);
          }}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Isi Kuesioner Baru</span>
        </button>
      </div>
    );
  }

  // Welcome / Start Screen
  if (!hasStarted) {
    return (
      <div className="space-y-6">
        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center space-x-3 text-sm">
            <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Anda sedang offline. Semua pengisian akan otomatis tersimpan sebagai <strong>Draft Lokal</strong> dan tidak akan hilang.</span>
          </div>
        )}

        {/* Draft Found Modal Banner */}
        {draftFound && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <Save className="w-6 h-6 text-indigo-600 shrink-0" />
              <div>
                <h4 className="font-semibold">Ditemukan Draft Pengisian Sebelumnya</h4>
                <p className="text-xs text-indigo-700">Anda dapat melanjutkan pengisian terakhir tanpa harus memulai dari awal.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleRestoreDraft}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition"
              >
                Lanjutkan Draft
              </button>
              <button
                onClick={handleIgnoreDraft}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition"
              >
                Mulai Baru
              </button>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-8 lg:p-12 shadow-xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-indigo-200 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Survei Resmi BSAN Jawa Timur</span>
          </div>
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Instumen Monitoring & Evaluasi Implementasi BSAN
            </h1>
            <p className="text-indigo-200 text-sm lg:text-base leading-relaxed">
              Survei ini bertujuan untuk mengukur tingkat efektivitas, hambatan, serta respon implementasi modul Budaya Sekolah Aman dan Nyaman (BSAN) di satuan pendidikan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-indigo-700/50">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs text-indigo-300 font-medium">Jumlah Pertanyaan</h4>
              <p className="text-xl font-bold text-white mt-1">{questions.length} Soal</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs text-indigo-300 font-medium">Auto-Save Draft</h4>
              <p className="text-xl font-bold text-white mt-1">Aktif (Local DB)</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs text-indigo-300 font-medium">Estimasi Waktu</h4>
              <p className="text-xl font-bold text-white mt-1">~10-15 Menit</p>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-4">
            <button
              onClick={() => setHasStarted(true)}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-900/50 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Mulai Pengisian Kuesioner</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Wizard Screen
  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Offline Alert Header */}
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span>Koneksi terputus. Mode offline aktif — Jawaban tersimpan di local draft.</span>
          </div>
          <span className="bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
            Draft Offline
          </span>
        </div>
      )}

      {/* Wizard Header Progress */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Bagian {activeSecIdx + 1} dari {sectionsList.length}
            </span>
            <h2 className="text-xl font-bold text-slate-800 mt-0.5">{currentMeta.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentMeta.desc}</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Save className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Draft Otomatis Tersimpan</span>
          </div>
        </div>

        {/* Section Steps Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {sectionsList.map((secKey, idx) => {
            const isActive = idx === activeSecIdx;
            const isCompleted = idx < activeSecIdx;
            return (
              <div
                key={secKey}
                className={`h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-indigo-600 shadow-sm' : isCompleted ? 'bg-emerald-500' : 'bg-slate-100'
                  }`}
              />
            );
          })}
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl flex items-center space-x-3 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium">{validationError}</span>
        </div>
      )}

      {/* Questions Form */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-8">
        {currentQuestions.map(q => {
          const currentVal = answers[q.id] || '';
          return (
            <div key={q.id} className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-4 hover:bg-slate-50 transition">
              <div className="flex items-start justify-between gap-4">
                <label className="text-base font-semibold text-slate-800 leading-snug">
                  <span className="text-indigo-600 font-bold mr-2">{q.kode_pertanyaan}.</span>
                  {q.teks_pertanyaan}
                  {q.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>

              {/* Input rendering based on type */}
              {q.tipe === 'dropdown' && q.opsi_jawaban && (
                <div className="max-w-md">
                  <select
                    value={currentVal}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="">-- Pilih Jawaban --</option>
                    {q.opsi_jawaban.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {q.tipe === 'radio' && q.opsi_jawaban && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.opsi_jawaban.map((opt, i) => {
                    const isSelected = currentVal === opt;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`flex items-center justify-between p-4 rounded-xl text-left border text-sm font-medium transition ${isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.tipe === 'checkbox' && q.opsi_jawaban && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.opsi_jawaban.map((opt, i) => {
                    const selectedArr: string[] = Array.isArray(currentVal) ? currentVal : [];
                    const isChecked = selectedArr.includes(opt);
                    const toggleCheck = () => {
                      if (isChecked) {
                        handleAnswerChange(q.id, selectedArr.filter(item => item !== opt));
                      } else {
                        handleAnswerChange(q.id, [...selectedArr, opt]);
                      }
                    };
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={toggleCheck}
                        className={`flex items-center justify-between p-4 rounded-xl text-left border text-sm font-medium transition ${isChecked
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isChecked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.tipe === 'text' && (
                <textarea
                  rows={3}
                  value={currentVal}
                  onChange={e => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Tuliskan jawaban Anda secara rinci..."
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              )}
            </div>
          );
        })}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            type="button"
            disabled={activeSecIdx === 0}
            onClick={handlePrevStep}
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition ${activeSecIdx === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          {activeSecIdx < sectionsList.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Lanjut Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitSurvey}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
            >
              {submitting ? (
                <ThreeDotsLoader size="sm" text="" className="p-0 flex-row" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Jawaban Survei</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
