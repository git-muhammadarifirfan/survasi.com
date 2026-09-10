/**
 * @module features/kuisioner/pages
 * @description Form wizard kuisioner BSAN — Real DB API, offline draft saving, step validation & 3-dot loading
 * @tables pertanyaan_survey, jawaban_survey, responden_survey
 * @api GET /api/survey/questions, POST /api/survey/submit
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, ChevronLeft, ChevronRight, Check, Save, Send, HelpCircle,
  AlertCircle, PlayCircle, ShieldCheck, WifiOff, RefreshCw, Plus, Edit3,
  Trash2, X, Eye, Layers, FileText, GripVertical
} from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import SkeletonLoader from '../../../shared/components/SkeletonLoader';
import { saveDraft, getDraft, clearDraft } from '../../../shared/utils/draftStorage';
import { throttle } from '../../../shared/utils/throttle';
import { notifyToast } from '../../../shared/components/NotificationToast';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';

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
  identitas: { title: 'Identitas Responden', desc: 'Kelola struktur pertanyaan, tipe isian (Esai/Pilihan), dan status kewajiban instrumen survei.' },
  pelatihan: { title: 'Pelatihan & Implementasi', desc: 'Identifikasi pelatihan & tingkat adopsi BSAN' },
  implementasi_awal: { title: 'Implementasi Modul Kelas Awal', desc: 'Evaluasi bagian mudah/sulit & media ajar kelas 1-3' },
  implementasi_tinggi: { title: 'Implementasi Modul Kelas Tinggi', desc: 'Evaluasi bagian mudah/sulit & media ajar kelas 4-6' },
  kepsek: { title: 'Dukungan Kepala Sekolah', desc: 'Dukungan manajemen & program sekolah' },
  refleksi: { title: 'Refleksi & Perubahan Baik', desc: 'Refleksi bersama murid, guru & cerita narasi' },
  kontak: { title: 'Kontak Responden', desc: 'Nomor WhatsApp responden untuk klarifikasi' },
};

export default function Kuisioner({ userRole }: KuisionerProps) {
  const [questions, setQuestions] = useState<ApiQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Admin CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ApiQuestionItem | null>(null);
  const [formTeks, setFormTeks] = useState('');
  const [formKode, setFormKode] = useState('');
  const [formTipe, setFormTipe] = useState<'dropdown' | 'checkbox' | 'text' | 'radio' | 'scale'>('text');
  const [formSection, setFormSection] = useState('identitas');
  const [formOpsi, setFormOpsi] = useState('');
  const [formIsRequired, setFormIsRequired] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
        const res = await apiClient.get<ApiQuestionItem[]>('/survey/questions');
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

  // Admin CRUD Actions
  const handleOpenAddQuestion = (secName?: string) => {
    setEditingQuestion(null);
    setFormKode(`Q${questions.length + 1}`);
    setFormTeks('');
    setFormTipe('radio');
    setFormSection(secName || 'identitas');
    setFormOpsi('');
    setFormIsRequired(true);
    setIsModalOpen(true);
  };

  const handleOpenEditQuestion = (q: ApiQuestionItem) => {
    setEditingQuestion(q);
    setFormKode(q.kode_pertanyaan);
    setFormTeks(q.teks_pertanyaan);
    setFormTipe(q.tipe);
    setFormSection(q.section);
    setFormOpsi(q.opsi_jawaban ? q.opsi_jawaban.join('\n') : '');
    setFormIsRequired(q.is_required);
    setIsModalOpen(true);
  };

  // Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Mode State for Questions
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const toggleSelectQuestion = (id: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedQuestionIds.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(selectedQuestionIds.map((id) => apiClient.delete(`/survey/questions/${id}`)));
      setQuestions((prev) => prev.filter((q) => !selectedQuestionIds.includes(q.id)));
      notifyToast({
        type: 'success',
        title: 'Hapus Massal Berhasil',
        message: `${selectedQuestionIds.length} pertanyaan berhasil dihapus dari database.`,
      });
      setSelectedQuestionIds([]);
      setIsBulkMode(false);
    } catch {
      notifyToast({ type: 'error', title: 'Gagal Hapus', message: 'Beberapa pertanyaan gagal dihapus.' });
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const confirmDeleteQuestion = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/survey/questions/${deleteConfirmId}`);
      if (res.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== deleteConfirmId));
        notifyToast({ type: 'success', title: 'Pertanyaan Dihapus', message: 'Instrumen berhasil dihapus dari database.' });
      } else {
        notifyToast({ type: 'error', title: 'Gagal Hapus', message: res.message || 'Gagal menghapus pertanyaan.' });
      }
    } catch {
      notifyToast({ type: 'error', title: 'Error API', message: 'Gagal terhubung ke server MySQL.' });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeks.trim()) return;

    const parsedOpsi = formOpsi
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      kode_pertanyaan: formKode,
      teks_pertanyaan: formTeks,
      tipe: formTipe,
      section: formSection,
      opsi_jawaban: parsedOpsi.length > 0 ? parsedOpsi : null,
      is_required: formIsRequired,
    };

    try {
      if (editingQuestion) {
        const res = await apiClient.put(`/survey/questions/${editingQuestion.id}`, payload);
        if (res.success) {
          setQuestions(prev =>
            prev.map(q =>
              q.id === editingQuestion.id
                ? { ...q, ...payload, opsi_jawaban: parsedOpsi.length > 0 ? parsedOpsi : null }
                : q
            )
          );
          notifyToast({ type: 'success', title: 'Berhasil Diperbarui', message: 'Instrumen pertanyaan survei berhasil diubah.' });
        }
      } else {
        const res = await apiClient.post<{ id: number }>('/survey/questions', payload);
        if (res.success && res.data) {
          const newQ: ApiQuestionItem = {
            id: res.data.id || Date.now(),
            modul_id: 1,
            kode_pertanyaan: formKode,
            teks_pertanyaan: formTeks,
            tipe: formTipe,
            opsi_jawaban: parsedOpsi.length > 0 ? parsedOpsi : null,
            urutan: questions.length + 1,
            is_required: formIsRequired,
            section: formSection,
            target_kelas: '1-6',
          };
          setQuestions(prev => [...prev, newQ]);
          notifyToast({ type: 'success', title: 'Berhasil Ditambahkan', message: 'Instrumen pertanyaan survei baru telah disimpan ke MySQL.' });
        }
      }
      setIsModalOpen(false);
    } catch {
      notifyToast({ type: 'error', title: 'Error API', message: 'Gagal menyimpan pertanyaan ke MySQL.' });
    }
  };

  // Drag and Drop State & Handler
  const [draggedQuestionId, setDraggedQuestionId] = useState<number | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedQuestionId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
  };

  const handleDragEnd = () => {
    setDraggedQuestionId(null);
    setDragOverQuestionId(null);
  };

  const handleDragOver = (e: React.DragEvent, id: number, currentSectionList: ApiQuestionItem[]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverQuestionId === id || !draggedQuestionId || draggedQuestionId === id) return;

    setDragOverQuestionId(id);

    // Swap positions in main state for smooth preview animation
    const sourceIdx = currentSectionList.findIndex(q => q.id === draggedQuestionId);
    const targetIdx = currentSectionList.findIndex(q => q.id === id);
    if (sourceIdx === -1 || targetIdx === -1) return;

    setQuestions(prev => {
      const newMain = [...prev];
      const srcMainIdx = newMain.findIndex(q => q.id === draggedQuestionId);
      const tgtMainIdx = newMain.findIndex(q => q.id === id);
      if (srcMainIdx !== -1 && tgtMainIdx !== -1) {
        const temp = newMain[srcMainIdx];
        newMain[srcMainIdx] = newMain[tgtMainIdx];
        newMain[tgtMainIdx] = temp;
      }
      return newMain;
    });
  };

  const handleDragLeave = () => {
    setDragOverQuestionId(null);
  };

  const handleDropQuestion = async (targetId: number, currentSectionList: ApiQuestionItem[]) => {
    setDragOverQuestionId(null);
    if (!draggedQuestionId || draggedQuestionId === targetId) return;

    const sourceIdx = currentSectionList.findIndex(q => q.id === draggedQuestionId);
    const targetIdx = currentSectionList.findIndex(q => q.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reorderedSection = [...currentSectionList];
    const [movedItem] = reorderedSection.splice(sourceIdx, 1);
    reorderedSection.splice(targetIdx, 0, movedItem);

    // Re-assign urutan numbers within section
    const reorderPayload: { id: number; urutan: number }[] = [];
    const updatedQuestions = [...questions];

    reorderedSection.forEach((qItem, newIndex) => {
      const originalUrutan = currentSectionList[newIndex].urutan;
      const qInMain = updatedQuestions.find(mq => mq.id === qItem.id);
      if (qInMain) {
        qInMain.urutan = originalUrutan;
        reorderPayload.push({ id: qItem.id, urutan: originalUrutan });
      }
    });

    updatedQuestions.sort((a, b) => a.urutan - b.urutan);
    setQuestions(updatedQuestions);
    setDraggedQuestionId(null);

    // Sync to MySQL
    try {
      await apiClient.put('/survey/questions/reorder', { items: reorderPayload });
      notifyToast({ type: 'success', title: 'Urutan Diperbarui', message: 'Urutan posisi berhasil disimpan ke MySQL.' });
    } catch {
      notifyToast({ type: 'error', title: 'Error API', message: 'Gagal memperbarui urutan ke MySQL.' });
    }
  };

  // Reorder / Move Question Up or Down
  const handleMoveQuestion = async (qId: number, direction: 'up' | 'down', currentSectionList: ApiQuestionItem[]) => {
    const idx = currentSectionList.findIndex(q => q.id === qId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === currentSectionList.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const itemA = currentSectionList[idx];
    const itemB = currentSectionList[targetIdx];

    // Swap urutan
    const updatedQuestions = questions.map(q => {
      if (q.id === itemA.id) return { ...q, urutan: itemB.urutan };
      if (q.id === itemB.id) return { ...q, urutan: itemA.urutan };
      return q;
    }).sort((a, b) => a.urutan - b.urutan);

    setQuestions(updatedQuestions);

    // Save to MySQL
    try {
      await apiClient.put('/survey/questions/reorder', {
        items: [
          { id: itemA.id, urutan: itemB.urutan },
          { id: itemB.id, urutan: itemA.urutan }
        ]
      });
      notifyToast({ type: 'success', title: 'Urutan Diperbarui', message: 'Urutan pertanyaan berhasil disimpan ke MySQL.' });
    } catch {
      notifyToast({ type: 'error', title: 'Error API', message: 'Gagal memperbarui urutan ke MySQL.' });
    }
  };

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

  // Submit Survey (Throttled max 1 click per 2.5s)
  const handleSubmitSurvey = throttle(async () => {
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

      const res = await apiClient.post<{ meesage: string }>('/survey/submit', payload);
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
  }, 2500);

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

  // ADMIN MANAGEMENT VIEW
  if (userRole === 'admin') {
    const groupedSections = Array.from(new Set(questions.map(q => q.section)));

    return (
      <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in pb-12">
        {/* Header Banner */}
        <div className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
              Manajemen Bank Soal Kuisioner BSAN
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Kelola struktur pertanyaan, tipe isian (Esai/Pilihan), dan status kewajiban instrumen survei.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                setSelectedQuestionIds([]);
              }}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                isBulkMode
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isBulkMode ? 'Tutup Pilihan Massal' : 'Pilih Massal (Bulk Action)'}</span>
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Preview Tampilan Pengawas</span>
            </button>
            <button
              onClick={() => handleOpenAddQuestion()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pertanyaan</span>
            </button>
          </div>
        </div>

        {/* Bulk Sticky Bar for Questions */}
        {isBulkMode && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <span className="text-xs font-semibold text-indigo-950">
              Terpilih <strong>{selectedQuestionIds.length}</strong> pertanyaan survei
            </span>
            <button
              type="button"
              disabled={selectedQuestionIds.length === 0}
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Pertanyaan Terpilih ({selectedQuestionIds.length})</span>
            </button>
          </div>
        )}

        {/* List Pertanyaan Terkelompok per Bagian / Section */}
        <div className="space-y-6">
          {groupedSections.map((secKey, sIdx) => {
            const secMeta = SECTION_METADATA[secKey] || {
              title: secKey.toUpperCase(),
              desc: 'Instrumen survei BSAN',
            };
            const secQuestions = questions.filter(q => q.section === secKey);

            return (
              <div key={secKey} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Section Header */}
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      BAGIAN {sIdx + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 font-display">{secMeta.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
                      {secQuestions.length} Pertanyaan
                    </span>
                    <button
                      onClick={() => handleOpenAddQuestion(secKey)}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pertanyaan di Bagian Ini</span>
                    </button>
                  </div>
                </div>

                {/* Questions Items */}
                <div className="p-6 space-y-3">
                  {secQuestions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={e => handleDragStart(e, q.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={e => handleDragOver(e, q.id, secQuestions)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDropQuestion(q.id, secQuestions)}
                      className={`p-4 rounded-xl bg-white border transition-all duration-200 flex items-center justify-between gap-4 group cursor-grab active:cursor-grabbing ${
                        draggedQuestionId === q.id
                          ? 'border-indigo-500 bg-indigo-50/60 shadow-lg scale-[0.99] opacity-40 border-dashed'
                          : dragOverQuestionId === q.id
                          ? 'border-indigo-600 bg-indigo-50/30 scale-[1.01] shadow-md border-t-2'
                          : 'border-slate-200/60 hover:border-indigo-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isBulkMode && (
                          <input
                            type="checkbox"
                            checked={selectedQuestionIds.includes(q.id)}
                            onChange={() => toggleSelectQuestion(q.id)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                          />
                        )}

                        {/* 6-Dots Drag Handle Icon Centered Vertically */}
                        <div className="p-1.5 rounded-md text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition cursor-grab shrink-0 flex items-center justify-center" title="Tarik & Geser untuk mengubah urutan">
                          <GripVertical className="w-5 h-5 stroke-[2.5]" />
                        </div>

                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {qIdx + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-800 leading-snug">
                            {q.kode_pertanyaan}. {q.teks_pertanyaan}
                            {q.is_required && <span className="text-red-500 ml-1">*</span>}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-slate-400">
                            <span>
                              Tipe: <strong className="text-slate-600 capitalize">{q.tipe === 'text' ? 'Teks Isian' : q.tipe === 'radio' ? 'Pilihan Ganda' : q.tipe}</strong>
                            </span>
                            <span>•</span>
                            <span>{q.is_required ? 'Wajib Diisi' : 'Opsional'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition text-xs font-medium inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(q.id)}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 transition cursor-pointer"
                          title="Hapus Pertanyaan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Admin Add/Edit Question */}
        {isModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-base font-display">
                    {editingQuestion ? 'Edit Pertanyaan Survei' : 'Tambah Pertanyaan Survei Baru'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase text-[10px]">Kode Pertanyaan</label>
                    <input
                      type="text"
                      value={formKode}
                      onChange={e => setFormKode(e.target.value)}
                      placeholder="Contoh: Q1, Q2"
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase text-[10px]">Bagian / Section</label>
                    <select
                      value={formSection}
                      onChange={e => setFormSection(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="identitas">Identitas Responden</option>
                      <option value="pelatihan">Pelatihan & Implementasi</option>
                      <option value="implementasi_awal">Implementasi Kelas Awal</option>
                      <option value="implementasi_tinggi">Implementasi Kelas Tinggi</option>
                      <option value="kepsek">Dukungan Kepala Sekolah</option>
                      <option value="refleksi">Refleksi & Perubahan Baik</option>
                      <option value="kontak">Kontak Responden</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase text-[10px]">Teks Pertanyaan *</label>
                  <textarea
                    rows={3}
                    value={formTeks}
                    onChange={e => setFormTeks(e.target.value)}
                    placeholder="Tuliskan butir pertanyaan survei..."
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase text-[10px]">Tipe Isian</label>
                    <select
                      value={formTipe}
                      onChange={e => setFormTipe(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="radio">Pilihan Ganda (Radio)</option>
                      <option value="checkbox">Pilihan Jamak (Checkbox)</option>
                      <option value="dropdown">Dropdown Options</option>
                      <option value="text">Teks Isian / Esai</option>
                    </select>
                  </div>

                  <div className="space-y-1 flex items-center pt-5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsRequired}
                        onChange={e => setFormIsRequired(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-700">Wajib Diisi (Required)</span>
                    </label>
                  </div>
                </div>

                {formTipe !== 'text' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase text-[10px]">
                      Opsi Jawaban (Satu Opsi Per Baris)
                    </label>
                    <textarea
                      rows={3}
                      value={formOpsi}
                      onChange={e => setFormOpsi(e.target.value)}
                      placeholder="Masukkan pilihan 1&#10;Masukkan pilihan 2&#10;Masukkan pilihan 3"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-xs"
                    />
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pertanyaan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Modal Live Preview */}
        {isPreviewOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-base">Preview Form Pengisian Pengawas</h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs text-indigo-600 font-semibold mb-4">
                  ℹ️ Ini adalah tampilan simulasi interaktif bagaimana Pengawas Sekolah melihat & mengisi instrumen survei ini.
                </p>
                {/* Embedded preview widget */}
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  {questions.slice(0, 5).map(q => (
                    <div key={q.id} className="p-4 bg-white rounded-xl border border-slate-200/70 space-y-2">
                      <p className="text-sm font-semibold text-slate-800">{q.kode_pertanyaan}. {q.teks_pertanyaan}</p>
                      {q.opsi_jawaban && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {q.opsi_jawaban.map((opt, oIdx) => (
                            <span key={oIdx} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // PENGAWAS USER VIEW (WIZARD PENGISIAN)
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

      {/* Confirmation Modal for Single Question Delete */}
      <ConfirmationModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteQuestion}
        title="Hapus Pertanyaan Survei"
        description="Apakah Anda yakin ingin menghapus pertanyaan instrumen ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Pertanyaan"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Confirmation Modal for Bulk Delete */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Hapus ${selectedQuestionIds.length} Pertanyaan`}
        description={`Apakah Anda yakin ingin menghapus ${selectedQuestionIds.length} pertanyaan terpilih? Seluruh instrumen tersebut akan dihapus permanen dari MySQL.`}
        confirmLabel="Hapus Semua"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
