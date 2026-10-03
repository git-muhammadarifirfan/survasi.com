/**
 * @module features/kuisioner/pages
 * @description Form wizard kuisioner BSAN — Real DB API, offline draft saving, step validation & 3-dot loading
 * @tables pertanyaan_survey, jawaban_survey, responden_survey
 * @api GET /api/survey/questions, POST /api/survey/submit
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Save, ShieldCheck, Plus, Edit3, Trash2, X, Eye, Layers, FileText, GripVertical, Building2,
} from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import CustomSelect from '../../../shared/components/CustomSelect';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import { notifyToast } from '../../../shared/components/NotificationToast';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import ConnectionErrorCard from '../../../shared/components/ConnectionErrorCard';
import SurveyWizard from '../components/SurveyWizard';

interface KuisionerProps {
  userRole: 'admin' | 'pengawas' | 'sekolah';
}

export interface ApiQuestionItem {
  id: number;
  modul_id: number | null;
  kode_pertanyaan: string;
  teks_pertanyaan: string;
  tipe: 'dropdown' | 'checkbox' | 'text' | 'radio' | 'scale' | 'school_select' | 'kabupaten_select' | 'kecamatan_select';
  opsi_jawaban: string[] | null;
  urutan: number;
  is_required: boolean;
  section: string;
  target_kelas: string;
  /** Peran semantik dari backend (nama, sekolah, kabupaten, kecamatan, penerima_modul, …) */
  role?: string | null;
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
  const [error, setError] = useState<string | null>(null);

  // Modal Admin CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ApiQuestionItem | null>(null);
  const [formTeks, setFormTeks] = useState('');
  const [formKode, setFormKode] = useState('');
  const [formTipe, setFormTipe] = useState<'dropdown' | 'checkbox' | 'text' | 'radio' | 'scale' | 'school_select' | 'kabupaten_select' | 'kecamatan_select'>('radio');
  const [formSection, setFormSection] = useState('identitas');
  const [formModulId, setFormModulId] = useState<number | null>(1);
  const [formOpsi, setFormOpsi] = useState('');
  const [formOpsiList, setFormOpsiList] = useState<string[]>(['Sudah', 'Belum', 'Dalam Proses']);
  const [formIsRequired, setFormIsRequired] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Database Query for Sections
  const { data: dbSectionsData = [], refetch: refetchSections } = useQuery({
    queryKey: ['survey-sections'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<Array<{ id: number; section_key: string; title: string; description: string; urutan: number }>>('/survey/sections');
        return res.data || [];
      } catch {
        return [];
      }
    },
  });

  // Section Modal State (Add & Edit)
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [sectionFormTitle, setSectionFormTitle] = useState('');
  const [sectionFormDesc, setSectionFormDesc] = useState('');

  // Mode simulasi pengisian (admin) — form pengisian ditangani SurveyWizard
  const [hasStarted, setHasStarted] = useState(false);

  // Fetch Questions from API (sudah berisi `role` semantik dari backend)
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const res = await apiClient.get<ApiQuestionItem[]>('/survey/questions');
        if (res.success && res.data) {
          setQuestions(res.data.map((q, idx) => ({ ...q, kode_pertanyaan: `Q${idx + 1}` })));
        } else {
          setError(res.message || 'Gagal memuat pertanyaan survei.');
        }
      } catch {
        setError('Gagal terhubung ke server.');
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
    setFormModulId(1);
    setFormOpsiList(['Sudah', 'Belum', 'Dalam Proses']);
    setFormIsRequired(true);
    setIsModalOpen(true);
  };

  const handleOpenEditQuestion = (q: ApiQuestionItem) => {
    setEditingQuestion(q);
    setFormKode(q.kode_pertanyaan);
    setFormTeks(q.teks_pertanyaan);
    setFormTipe(q.tipe);
    setFormSection(q.section);
    setFormModulId(q.modul_id || null);
    
    const existingArr = Array.isArray(q.opsi_jawaban) && q.opsi_jawaban.length > 0 
      ? q.opsi_jawaban 
      : ['Sudah', 'Belum', 'Dalam Proses'];
      
    setFormOpsiList(existingArr);
    setFormIsRequired(q.is_required);
    setIsModalOpen(true);
  };

  // Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteSectionConfirmKey, setDeleteSectionConfirmKey] = useState<string | null>(null);
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
      setQuestions((prev) => {
        const remaining = prev.filter((q) => !selectedQuestionIds.includes(q.id));
        return remaining.map((q, idx) => ({ ...q, kode_pertanyaan: `Q${idx + 1}` }));
      });
      notifyToast({
        type: 'error',
        title: 'Hapus Massal Berhasil',
        message: `${selectedQuestionIds.length} pertanyaan berhasil dihapus.`,
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
      setQuestions((prev) => {
        const remaining = prev.filter((q) => q.id !== deleteConfirmId);
        return remaining.map((q, idx) => ({ ...q, kode_pertanyaan: `Q${idx + 1}` }));
      });
      notifyToast({
        type: 'success',
        title: 'Pertanyaan Dihapus',
        message: res?.message || 'Pertanyaan berhasil dihapus.',
      });
    } catch (err: any) {
      notifyToast({
        type: 'error',
        title: 'Gagal Hapus Pertanyaan',
        message: err?.message || 'Terjadi kesalahan saat menghapus pertanyaan.',
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const confirmDeleteSection = async () => {
    if (!deleteSectionConfirmKey) return;
    const secKey = deleteSectionConfirmKey;
    const secMeta = allSectionMeta[secKey] || { title: secKey };
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/survey/sections/${secKey}`);
      
      setQuestions((prev) => {
        const remaining = prev.filter((q) => q.section !== secKey);
        return remaining.map((q, idx) => ({ ...q, kode_pertanyaan: `Q${idx + 1}` }));
      });

      await refetchSections();

      notifyToast({
        type: 'success',
        title: 'Section Dihapus',
        message: res?.message || `Section "${secMeta.title}" dan pertanyaannya berhasil dihapus.`,
      });
    } catch (err: any) {
      notifyToast({
        type: 'error',
        title: 'Gagal Hapus Section',
        message: err?.message || 'Terjadi kesalahan saat menghapus section.',
      });
    } finally {
      setIsDeleting(false);
      setDeleteSectionConfirmKey(null);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeks.trim()) return;

    const parsedOpsi = formOpsiList
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      modul_id: formModulId,
      kode_pertanyaan: formKode,
      teks_pertanyaan: formTeks,
      tipe: formTipe,
      section: formSection,
      opsi_jawaban: (formTipe !== 'text' && formTipe !== 'school_select' && formTipe !== 'kabupaten_select' && formTipe !== 'kecamatan_select')
        ? (parsedOpsi.length > 0 ? parsedOpsi : null)
        : null,
      is_required: formIsRequired,
    };

    try {
      if (editingQuestion) {
        const res = await apiClient.put(`/survey/questions/${editingQuestion.id}`, payload);
        setQuestions(prev =>
          prev.map(q =>
            q.id === editingQuestion.id
              ? {
                  ...q,
                  modul_id: formModulId,
                  kode_pertanyaan: formKode,
                  teks_pertanyaan: formTeks,
                  tipe: formTipe,
                  section: formSection,
                  opsi_jawaban: payload.opsi_jawaban,
                  is_required: formIsRequired,
                }
              : q
          )
        );
        notifyToast({ type: 'success', title: 'Berhasil Diperbarui', message: res?.message || 'Instrumen pertanyaan survei berhasil diubah.' });
      } else {
        const res = await apiClient.post<{ id?: number }>('/survey/questions', payload);
        const newId = (res as any)?.id || (res as any)?.data?.id || Date.now();
        const newQ: ApiQuestionItem = {
          id: Number(newId),
          modul_id: formModulId,
          kode_pertanyaan: formKode,
          teks_pertanyaan: formTeks,
          tipe: formTipe,
          opsi_jawaban: payload.opsi_jawaban,
          urutan: questions.length + 1,
          is_required: formIsRequired,
          section: formSection,
          target_kelas: '1-6',
        };
        setQuestions(prev => [...prev, newQ]);
        notifyToast({ type: 'success', title: 'Berhasil Ditambahkan', message: 'Instrumen pertanyaan survei baru telah disimpan.' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Gagal Menyimpan', message: err?.message || 'Terjadi kesalahan saat menyimpan pertanyaan.' });
      setIsModalOpen(false);
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

  // Combined metadata (DB Sections primary, SECTION_METADATA as fallback)
  const allSectionMeta: Record<string, { title: string; desc: string }> = {};
  if (dbSectionsData && dbSectionsData.length > 0) {
    dbSectionsData.forEach(sec => {
      allSectionMeta[sec.section_key] = {
        title: sec.title,
        desc: sec.description || 'Bagian instrumen kuesioner',
      };
    });
  } else {
    Object.assign(allSectionMeta, SECTION_METADATA);
  }

  const handleOpenAddSection = () => {
    setEditingSectionKey(null);
    setSectionFormTitle('');
    setSectionFormDesc('');
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (secKey: string) => {
    const meta = allSectionMeta[secKey] || { title: secKey, desc: '' };
    setEditingSectionKey(secKey);
    setSectionFormTitle(meta.title);
    setSectionFormDesc(meta.desc);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionFormTitle.trim()) return;

    try {
      if (editingSectionKey) {
        const res = await apiClient.put(`/survey/sections/${editingSectionKey}`, {
          title: sectionFormTitle.trim(),
          description: sectionFormDesc.trim(),
        });
        await refetchSections();
        notifyToast({
          type: 'success',
          title: 'Section Diperbarui',
          message: res?.message || 'Informasi section berhasil diperbarui.',
        });
      } else {
        const res = await apiClient.post<{ data: { section_key: string; title: string; description: string } }>('/survey/sections', {
          title: sectionFormTitle.trim(),
          description: sectionFormDesc.trim(),
        });
        await refetchSections();
        notifyToast({
          type: 'success',
          title: 'Section Ditambahkan',
          message: res?.message || 'Section baru berhasil disimpan.',
        });
      }
      setIsSectionModalOpen(false);
    } catch (err: any) {
      notifyToast({
        type: 'error',
        title: 'Gagal Menyimpan Section',
        message: err?.message || 'Terjadi kesalahan saat menyimpan section.',
      });
    }
  };

  // Group questions by section (prioritize active order from DB)
  const activeQuestionsSectionKeys = Array.from(new Set(questions.map(q => q.section)));
  const sectionsList = dbSectionsData && dbSectionsData.length > 0
    ? Array.from(new Set([...dbSectionsData.map(s => s.section_key), ...activeQuestionsSectionKeys]))
    : Array.from(new Set([...Object.keys(SECTION_METADATA), ...activeQuestionsSectionKeys]));

  if (loading) {
    return (
      <div className="py-20 text-center flex items-center justify-center">
        <ThreeDotsLoader text="Memuat instrumen kuisioner..." />
      </div>
    );
  }

  if (error) {
    return (
      <ConnectionErrorCard
        title="Gagal Memuat Kuisioner Survei"
        message={error || 'Sistem tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda atau coba beberapa saat lagi.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (userRole !== 'admin') {
    return (
      <SurveyWizard
        questions={questions}
        sectionOrder={sectionsList}
        sectionMeta={allSectionMeta}
        userRole={userRole}
      />
    );
  }

  // ADMIN MANAGEMENT VIEW
  if (userRole === 'admin') {
    const groupedSections = Array.from(new Set([...Object.keys(allSectionMeta), ...questions.map(q => q.section)]));

    return (
      <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in pb-12">
        {/* Header Banner */}
        <div className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
              Instrumen & Bank Soal Kuisioner BSAN
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Kelola struktur pertanyaan, tipe isian (Esai/Pilihan), dan status kewajiban instrumen survei.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setHasStarted(!hasStarted)}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${hasStarted
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
            >
              <Eye className="w-4 h-4" />
              <span>{hasStarted ? 'Kelola Bank Soal (CRUD)' : 'Mode Pengisian (User View)'}</span>
            </button>

            {!hasStarted && (
              <>
                <button
                  onClick={() => {
                    setIsBulkMode(!isBulkMode);
                    setSelectedQuestionIds([]);
                  }}
                  className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${isBulkMode
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{isBulkMode ? 'Tutup Massal' : 'Pilih Massal'}</span>
                </button>
                <button
                  onClick={() => handleOpenAddSection()}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Tambah Section</span>
                </button>
                <button
                  onClick={() => handleOpenAddQuestion()}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pertanyaan</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mode simulasi: admin mencoba alur pengisian persis seperti akun sekolah */}
        {hasStarted && (
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-3 sm:p-5">
            <p className="mb-3 px-1 text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Simulasi pengisian — pilih sekolah, jawaban yang dikirim tersimpan atas nama sekolah tersebut.
            </p>
            <SurveyWizard
              questions={questions}
              sectionOrder={sectionsList}
              sectionMeta={allSectionMeta}
              userRole="admin"
              simulation
            />
          </div>
        )}

        {!hasStarted && (<>
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
          {sectionsList.map((secKey, sIdx) => {
            const secMeta = allSectionMeta[secKey] || {
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
                    {secMeta.desc && <p className="text-xs text-slate-500 mt-0.5">{secMeta.desc}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
                      {secQuestions.length} Pertanyaan
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAddQuestion(secKey)}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pertanyaan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditSection(secKey)}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                      title="Edit Judul & Deskripsi Section"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit Section</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteSectionConfirmKey(secKey);
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                      title="Hapus Section Ini & Seluruh Pertanyaannya"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus Section</span>
                    </button>
                  </div>
                </div>

                {/* Questions Items */}
                <div className="p-6 space-y-3">
                  {secQuestions.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
                      <p className="text-xs text-slate-500 font-medium">Bagian ini belum memiliki butir pertanyaan.</p>
                      <button
                        type="button"
                        onClick={() => handleOpenAddQuestion(secKey)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Pertanyaan Pertama</span>
                      </button>
                    </div>
                  ) : (
                    secQuestions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      onDragOver={e => handleDragOver(e, q.id, secQuestions)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDropQuestion(q.id, secQuestions)}
                      className={`p-4 rounded-xl bg-white border transition-all duration-200 flex items-center justify-between gap-4 group ${draggedQuestionId === q.id
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
                        <div
                          draggable
                          onDragStart={e => handleDragStart(e, q.id)}
                          onDragEnd={handleDragEnd}
                          className="p-1.5 rounded-md text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center"
                          title="Tarik & Geser untuk mengubah urutan"
                        >
                          <GripVertical className="w-5 h-5 stroke-[2.5]" />
                        </div>

                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {qIdx + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-800 leading-snug">
                            {q.teks_pertanyaan}
                            {q.is_required && <span className="text-red-500 ml-1">*</span>}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-slate-400">
                            <span>
                              Tipe: <strong className="text-indigo-600 capitalize">
                                {q.tipe === 'school_select' || q.kode_pertanyaan === 'Q4'
                                  ? 'Pilih Sekolah'
                                  : q.tipe === 'text'
                                    ? 'Teks Isian / Esai'
                                    : q.tipe === 'radio'
                                      ? 'Pilihan Ganda (Radio)'
                                      : q.tipe === 'checkbox'
                                        ? 'Pilihan Jamak (Checkbox)'
                                        : q.tipe === 'dropdown'
                                          ? 'Pilihan Dropdown'
                                          : q.tipe}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>{q.is_required ? 'Wajib Diisi' : 'Opsional'}</span>
                            {q.modul_id && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-indigo-700 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px]">
                                  Modul {q.modul_id}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleOpenEditQuestion(q);
                          }}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition text-xs font-medium inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setDeleteConfirmId(q.id);
                          }}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 transition cursor-pointer"
                          title="Hapus Pertanyaan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )))
                }
                </div>
              </div>
            );
          })}
        </div>

        </>)}

        {/* Modal Admin Add/Edit Question */}
        {isModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-visible animate-scale-in">
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
                <div className="grid grid-cols-3 gap-3">
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
                  <div>
                    <CustomSelect
                      label="Bagian / Section"
                      options={Object.entries(allSectionMeta).map(([k, meta]) => ({ value: k, label: meta.title }))}
                      value={formSection}
                      onChange={val => setFormSection(val)}
                      size="md"
                    />
                  </div>
                  <div>
                    <CustomSelect
                      label="Modul BSAN"
                      options={[
                        { value: '', label: '-- Non-Modul --' },
                        { value: 1, label: 'Modul 1: Literasi & Numerasi Dasar' },
                        { value: 2, label: 'Modul 2: Disiplin Positif & Antiperundungan' },
                        { value: 3, label: 'Modul 3: Kesehatan Emosi & Pengelolaan Stres' },
                        { value: 4, label: 'Modul 4: Kebersihan & Kesehatan Lingkungan' },
                        { value: 5, label: 'Modul 5: Kemitraan Orang Tua & Komite' },
                      ]}
                      value={formModulId || ''}
                      onChange={val => setFormModulId(val ? parseInt(val) : null)}
                      size="md"
                    />
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
                  <div>
                    <CustomSelect
                      label="Tipe Isian"
                      options={[
                        { value: 'radio', label: 'Pilihan Ganda (Radio)' },
                        { value: 'checkbox', label: 'Pilihan Jamak (Checkbox)' },
                        { value: 'dropdown', label: 'Dropdown Options (Pilihan Dropdown)' },
                        { value: 'text', label: 'Teks Isian / Esai' },
                        { value: 'school_select', label: 'Pilih Sekolah (Auto Search)' },
                        { value: 'kabupaten_select', label: 'Pilih Kabupaten / Kota (Auto Search)' },
                        { value: 'kecamatan_select', label: 'Pilih Kecamatan (Auto Search)' },
                      ]}
                      value={formTipe}
                      onChange={val => {
                        const newTipe = val as any;
                        setFormTipe(newTipe);
                        if ((newTipe === 'radio' || newTipe === 'dropdown' || newTipe === 'checkbox') && formOpsiList.length === 0) {
                          setFormOpsiList(['Sudah', 'Belum', 'Dalam Proses']);
                        }
                      }}
                      size="md"
                    />
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

                {formTipe === 'school_select' && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1 animate-fade-in">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>Pilih Sekolah Otomatis</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Pertanyaan ini akan menampilkan pencarian nama sekolah secara otomatis dari sistem. Opsi pilihan tidak perlu diinput manual.
                    </p>
                  </div>
                )}

                {formTipe !== 'text' && formTipe !== 'school_select' && formTipe !== 'kabupaten_select' && formTipe !== 'kecamatan_select' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-600 uppercase text-[10px]">
                        Daftar Opsi Pilihan ({formOpsiList.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormOpsiList(prev => [...prev, `Pilihan ${prev.length + 1}`])}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Tambah Opsi</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {formOpsiList.map((optVal, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                            {optIdx + 1}
                          </div>
                          <input
                            type="text"
                            value={optVal}
                            onChange={(e) => {
                              const newArr = [...formOpsiList];
                              newArr[optIdx] = e.target.value;
                              setFormOpsiList(newArr);
                            }}
                            placeholder={`Tulis opsi ${optIdx + 1}...`}
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={formOpsiList.length <= 1}
                            onClick={() => setFormOpsiList(prev => prev.filter((_, i) => i !== optIdx))}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Hapus opsi ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
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

        {/* Confirmation Modal for Delete Section */}
        <ConfirmationModal
          isOpen={deleteSectionConfirmKey !== null}
          onClose={() => setDeleteSectionConfirmKey(null)}
          onConfirm={confirmDeleteSection}
          title={`Hapus Section "${deleteSectionConfirmKey ? (allSectionMeta[deleteSectionConfirmKey]?.title || deleteSectionConfirmKey) : ''}"?`}
          description={`Apakah Anda yakin ingin menghapus bagian ini beserta seluruh (${deleteSectionConfirmKey ? questions.filter(q => q.section === deleteSectionConfirmKey).length : 0}) butir pertanyaannya? Pertanyaan pada bagian ini akan dinonaktifkan di database.`}
          confirmLabel="Hapus Section"
          cancelLabel="Batal"
          variant="danger"
          isLoading={isDeleting}
        />

        {/* Add / Edit Section Modal */}
        {isSectionModalOpen && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {editingSectionKey ? 'Edit Informasi Section' : 'Tambah Section Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSection} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Judul Section / Bagian <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Evaluasi Media Pembelajaran"
                    value={sectionFormTitle}
                    onChange={(e) => setSectionFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Deskripsi / Penjelasan Singkat
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Penjelasan singkat mengenai bagian kuesioner ini..."
                    value={sectionFormDesc}
                    onChange={(e) => setSectionFormDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSectionModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    {editingSectionKey ? 'Simpan Perubahan' : 'Tambah Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }
}
