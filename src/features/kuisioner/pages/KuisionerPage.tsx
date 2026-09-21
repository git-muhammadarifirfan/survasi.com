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
  BookOpen, ChevronLeft, ChevronRight, Check, Save, Send, HelpCircle,
  AlertCircle, PlayCircle, ShieldCheck, WifiOff, RefreshCw, Plus, Edit3,
  Trash2, X, Eye, Layers, FileText, GripVertical, Building2, CheckCircle2
} from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import { database } from '../../../shared/data/data-source';
import CustomSelect from '../../../shared/components/CustomSelect';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import SkeletonLoader from '../../../shared/components/SkeletonLoader';
import { saveDraft, getDraft, clearDraft } from '../../../shared/utils/draftStorage';
import { throttle } from '../../../shared/utils/throttle';
import { notifyToast } from '../../../shared/components/NotificationToast';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';
import ConnectionErrorCard from '../../../shared/components/ConnectionErrorCard';

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

  // Database Queries for Dynamic Auto-Fetch Dropdowns
  const { data: dbSchoolsList = [] } = useQuery({
    queryKey: ['db-schools-kuisioner'],
    queryFn: () => database.getSchools(),
  });

  const { data: dbKabupatenList = [] } = useQuery({
    queryKey: ['db-kabupaten-kuisioner'],
    queryFn: () => apiClient.sekolah.getKabupaten().then(res => res.data || []),
  });

  const { data: dbKecamatanList = [] } = useQuery({
    queryKey: ['db-kecamatan-kuisioner'],
    queryFn: () => apiClient.sekolah.getKecamatan().then(res => res.data || []),
  });

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

  // Form state
  const [hasStarted, setHasStarted] = useState(false);
  const [activeSecIdx, setActiveSecIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
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

  // User profile state for auto-fill
  const [userProfile, setUserProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('bsan_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch live profile from /api/auth/me if logged in
  useEffect(() => {
    apiClient.auth.getProfile()
      .then(res => {
        if (res.success && res.data) {
          setUserProfile(res.data);
          localStorage.setItem('bsan_user_profile', JSON.stringify(res.data));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Questions from API
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const res = await apiClient.get<ApiQuestionItem[]>('/survey/questions');
        if (res.success && res.data) {
          const mapped = res.data.map((q, idx) => ({
            ...q,
            kode_pertanyaan: `Q${idx + 1}`,
          }));
          setQuestions(mapped);

          // Check draft
          const draft = getDraft<Record<number, any>>('kuisioner');
          if (draft && Object.keys(draft.data).length > 0) {
            setDraftFound(true);
            setAnswers(draft.data);
          }
        } else {
          setError(res.message || 'Gagal memuat pertanyaan survei.');
        }
      } catch (err: any) {
        setError('Gagal terhubung ke server.');
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // Auto pre-fill initial answers from user account profile whenever userProfile or questions change
  useEffect(() => {
    if (!userProfile || questions.length === 0) return;
    setAnswers(prev => {
      const updated = { ...prev };
      let changed = false;

      // Find user school detail if available
      const matchedSchool = dbSchoolsList.find(s => s.nama === userProfile.sekolah_nama || s.id === userProfile.sekolah_id);
      const userKab = userProfile.kabupaten_nama || matchedSchool?.kabupaten || '';
      const userKec = userProfile.kecamatan_nama || matchedSchool?.kecamatan || '';

      questions.forEach(q => {
        if (q.kode_pertanyaan === 'Q1' && userProfile.nama && !updated[q.id]) {
          updated[q.id] = userProfile.nama;
          changed = true;
        }
        if ((q.kode_pertanyaan === 'Q4' || q.tipe === 'school_select' || q.teks_pertanyaan.toLowerCase().includes('sekolah')) && userProfile.sekolah_nama && !updated[q.id]) {
          updated[q.id] = userProfile.sekolah_nama;
          changed = true;
        }
        if ((q.kode_pertanyaan === 'Q5' || q.tipe === 'kabupaten_select') && userKab && !updated[q.id]) {
          updated[q.id] = userKab;
          changed = true;
        }
        if ((q.kode_pertanyaan === 'Q6' || q.tipe === 'kecamatan_select') && userKec && !updated[q.id]) {
          updated[q.id] = userKec;
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [userProfile, questions, dbSchoolsList]);

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

  // Submit Confirmation Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const confirmSubmitSurvey = async () => {
    setIsSubmitModalOpen(false);
    setSubmitting(true);
    try {
      const payloadAnswers = Object.entries(answers).map(([qIdStr, val]) => {
        const qId = parseInt(qIdStr);
        const qObj = questions.find(q => q.id === qId);
        return {
          pertanyaan_id: qId,
          tipe: qObj?.tipe || 'text',
          value: val,
        };
      });

      const getAnsByCode = (code: string) => {
        const q = questions.find(item => item.kode_pertanyaan === code);
        return q ? answers[q.id] : null;
      };

      const q4Val = getAnsByCode('Q4');
      const matchedSchool = dbSchoolsList.find(s => s.nama === q4Val || s.npsn === q4Val || s.id === Number(q4Val))
        || (userProfile?.sekolah_id ? dbSchoolsList.find(s => s.id === userProfile.sekolah_id) : null);

      const payload = {
        nama: getAnsByCode('Q1') || userProfile?.nama || 'Responden Survei',
        jenis_kelamin: getAnsByCode('Q2') === 'Perempuan' ? 'P' : 'L',
        posisi: getAnsByCode('Q3') || userProfile?.jabatan || 'Guru Kelas',
        sekolah_id: matchedSchool?.id || userProfile?.sekolah_id || null,
        npsn: matchedSchool?.npsn || (typeof q4Val === 'string' && q4Val.length <= 20 ? q4Val : null),
        kabupaten_id: matchedSchool?.kabupaten_id || userProfile?.kabupaten_id || 1,
        kecamatan_id: matchedSchool?.kecamatan_id || userProfile?.kecamatan_id || 1,
        penerima_modul: getAnsByCode('Q7') || 'Ya',
        penyelenggara_pelatihan: getAnsByCode('Q8'),
        status_implementasi: getAnsByCode('Q9') || 'sudah',
        kelas_mengajar: getAnsByCode('Q10'),
        no_wa: getAnsByCode('Q37'),
        jawaban: payloadAnswers,
      };

      const res = await apiClient.post('/survey/submit', payload);
      if (res.success) {
        clearDraft('kuisioner');
        setSubmitted(true);
        notifyToast({
          type: 'success',
          title: 'Survei Berhasil Dikirim!',
          message: 'Jawaban survei Anda telah resmi tersimpan.',
        });
      } else {
        notifyToast({ type: 'error', title: 'Gagal Mengirim', message: res.message || 'Gagal mengirim survei.' });
      }
    } catch {
      notifyToast({ type: 'error', title: 'Kendala Sistem', message: 'Gagal terhubung ke sistem. Silakan coba lagi.' });
    } finally {
      setSubmitting(false);
    }
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

  const triggerToast = (msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    notifyToast({ type, title: 'Kuesioner BSAN', message: msg });
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
  const currentSectionKey = sectionsList[activeSecIdx] || 'identitas';
  const currentQuestions = questions.filter(q => q.section === currentSectionKey);
  const currentMeta = allSectionMeta[currentSectionKey] || {
    title: currentSectionKey.toUpperCase(),
    desc: 'Pertanyaan survei BSAN',
  };

  // Handle answer change & Auto Save Draft
  const handleAnswerChange = (qId: number, value: any) => {
    if (highlightedQuestionId === qId) setHighlightedQuestionId(null);
    const updated = { ...answers, [qId]: value };
    setAnswers(updated);
    saveDraft('kuisioner', updated, activeSecIdx);

    // Update status pengisian sekolah menjadi 'sebagian' jika draft terisi
    const targetSchId = userProfile?.sekolah_id || answers[4] || 1;
    apiClient.post('/survey/draft', { sekolah_id: targetSchId }).catch(() => {});
  };

  const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToQuestion = (qId: number) => {
    setHighlightedQuestionId(qId);
    setTimeout(() => {
      const el = document.getElementById(`question-card-${qId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => {
      setHighlightedQuestionId((curr) => (curr === qId ? null : curr));
    }, 4000);
  };

  // Step Validation: Check required fields in current section
  const validateCurrentSection = (): boolean => {
    for (const q of currentQuestions) {
      if (q.is_required) {
        const ans = answers[q.id];
        if (ans === undefined || ans === null || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
          setValidationError(`Pertanyaan wajib: "${q.kode_pertanyaan}. ${q.teks_pertanyaan}" belum diisi.`);
          notifyToast({
            type: 'warning',
            title: 'Pertanyaan Belum Lengkap',
            message: `Pertanyaan "${q.kode_pertanyaan}. ${q.teks_pertanyaan}" wajib diisi.`,
          });
          scrollToQuestion(q.id);
          return false;
        }
      }
    }
    setValidationError(null);
    return true;
  };

  const goToSection = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= sectionsList.length) return;

    if (targetIdx <= activeSecIdx) {
      setActiveSecIdx(targetIdx);
      setValidationError(null);
      scrollToTop();
      return;
    }

    if (!validateCurrentSection()) {
      scrollToTop();
      return;
    }

    setActiveSecIdx(targetIdx);
    setValidationError(null);
    saveDraft('kuisioner', answers, targetIdx);
    scrollToTop();
  };

  const handleNextStep = () => {
    if (!validateCurrentSection()) {
      scrollToTop();
      return;
    }
    if (activeSecIdx < sectionsList.length - 1) {
      const nextIdx = activeSecIdx + 1;
      setActiveSecIdx(nextIdx);
      saveDraft('kuisioner', answers, nextIdx);
      scrollToTop();
    }
  };

  const handlePrevStep = () => {
    if (activeSecIdx > 0) {
      const prevIdx = activeSecIdx - 1;
      setActiveSecIdx(prevIdx);
      saveDraft('kuisioner', answers, prevIdx);
      scrollToTop();
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
            Jawaban kuesioner BSAN Anda telah berhasil disimpan. Data ini akan digunakan untuk analisis efektivitas program di Jawa Timur.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setSubmitted(false);
              setHasStarted(true);
            }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-md cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Isi Ulang / Edit Jawaban</span>
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setHasStarted(false);
              setAnswers({});
              setActiveSecIdx(0);
            }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Form Baru</span>
          </button>
        </div>
      </div>
    );
  }

  // Welcome / Start Screen (Only for Pengawas)
  if (!hasStarted && userRole !== 'admin') {
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

        <div className="bg-surface text-text-primary rounded-2xl p-6 lg:p-8 shadow-card border border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full text-[11px] font-semibold text-primary border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Instrumen Resmi Evaluasi Mutu BSAN Jawa Timur</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-text-primary font-display">
                Kuesioner Monitoring BSAN
              </h1>
              <p className="text-text-secondary text-xs lg:text-sm leading-relaxed">
                Ukur efektivitas, hambatan, serta adopsi modul Budaya Sekolah Aman dan Nyaman secara langsung.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5 font-medium bg-bg px-3 py-1.5 rounded-xl border border-border">
                  <FileText className="w-3.5 h-3.5 text-primary" /> {questions.length} Instrumen Soal
                </span>
                <span className="flex items-center gap-1.5 font-medium bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <Save className="w-3.5 h-3.5 text-emerald-400" /> Draft Otomatis
                </span>
                <span className="flex items-center gap-1.5 font-medium bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Estimasi ~10 Mnt
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center">
              <button
                onClick={() => setHasStarted(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Mulai Pengisian</span>
              </button>
            </div>
          </div>
        </div>
      </div>
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

        {/* If Has Started Mode = Render Full User View Form Wizard for Admin */}
        {hasStarted && (
          <div className="bg-slate-50 p-4 rounded-3xl border border-indigo-100 shadow-xs">
            <div className="mb-4 px-2 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Simulasi Pengisian Kuesioner (Mode Pengawas / Sekolah Real-time)</span>
              </span>
            </div>
            {/* Render Wizard View */}
          </div>
        )}

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

  // PENGAWAS USER VIEW (WIZARD PENGISIAN)
  // Active Wizard Screen
  return (
    <div className="space-y-6 pb-16">
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
            const meta = allSectionMeta[secKey] || { title: secKey };
            return (
              <button
                key={secKey}
                type="button"
                onClick={() => goToSection(idx)}
                title={`Langkah ${idx + 1}: ${meta.title}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? 'bg-indigo-600 shadow-sm ring-2 ring-indigo-300' : isCompleted ? 'bg-emerald-500 hover:opacity-80' : 'bg-slate-200 hover:bg-slate-300'
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
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        {currentQuestions.map((q, idx) => {
          const currentVal = answers[q.id] || '';
          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              onClick={() => {
                if (highlightedQuestionId === q.id) setHighlightedQuestionId(null);
              }}
              className={`p-4 rounded-xl border transition-all duration-200 space-y-2.5 ${
                highlightedQuestionId === q.id
                  ? 'border-2 border-rose-500 bg-rose-50/20 shadow-xs'
                  : 'bg-slate-50/40 border-slate-200/70 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <label className="text-sm font-semibold text-slate-800 leading-snug">
                  <span className="text-indigo-600 font-bold mr-1.5">{idx + 1}.</span>
                  {q.teks_pertanyaan}
                  {q.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>

              {/* Input rendering based on type */}
              {q.tipe === 'school_select' && (
                <div className="max-w-md space-y-1">
                  <CustomSelect
                    label=""
                    options={[
                      { value: '', label: '-- Pilih / Cari Nama Sekolah Sasaran --' },
                      ...dbSchoolsList.map(s => ({
                        value: s.nama,
                        label: `${s.nama} (${s.npsn || 'NPSN'}) • Kec. ${s.kecamatan}, ${s.kabupaten}`,
                      }))
                    ]}
                    value={currentVal}
                    onChange={(val) => handleAnswerChange(q.id, val)}
                    placeholder="Pilih atau cari nama sekolah..."
                    enableSearch={true}
                  />
                  {userProfile?.sekolah_nama && currentVal === userProfile.sekolah_nama ? (
                    <p className="text-[11px] text-emerald-600 font-medium italic mt-1 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Asal Sekolah terisi otomatis dari akun terintegrasi: <strong>{userProfile.sekolah_nama}</strong></span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Daftar sekolah terintegrasi secara otomatis dari data resmi.</span>
                    </p>
                  )}
                </div>
              )}

              {q.tipe === 'kabupaten_select' && (
                <div className="max-w-md space-y-1">
                  <CustomSelect
                    label=""
                    options={[
                      { value: '', label: '-- Pilih Kabupaten / Kota --' },
                      ...dbKabupatenList.map(k => ({
                        value: k.nama,
                        label: k.nama,
                      }))
                    ]}
                    value={currentVal}
                    onChange={(val) => handleAnswerChange(q.id, val)}
                    placeholder="Pilih Kabupaten / Kota..."
                    enableSearch={true}
                  />
                  {userProfile?.kabupaten_nama && currentVal === userProfile.kabupaten_nama && (
                    <p className="text-[11px] text-emerald-600 font-medium italic mt-1 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Kabupaten terisi otomatis dari akun terintegrasi: <strong>{userProfile.kabupaten_nama}</strong></span>
                    </p>
                  )}
                </div>
              )}

              {q.tipe === 'kecamatan_select' && (
                <div className="max-w-md space-y-1">
                  <CustomSelect
                    label=""
                    options={[
                      { value: '', label: '-- Pilih Kecamatan --' },
                      ...dbKecamatanList.map(k => ({
                        value: k.nama,
                        label: `${k.nama} • ${k.kabupaten_nama || ''}`,
                      }))
                    ]}
                    value={currentVal}
                    onChange={(val) => handleAnswerChange(q.id, val)}
                    placeholder="Pilih Kecamatan..."
                    enableSearch={true}
                  />
                  {currentVal && (userProfile?.kecamatan_nama === currentVal || dbSchoolsList.some(s => s.nama === userProfile?.sekolah_nama && s.kecamatan === currentVal)) && (
                    <p className="text-[11px] text-emerald-600 font-medium italic mt-1 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Kecamatan terisi otomatis dari akun terintegrasi: <strong>{currentVal}</strong></span>
                    </p>
                  )}
                </div>
              )}

              {q.tipe === 'dropdown' && q.opsi_jawaban && (
                <div className="max-w-md">
                  <CustomSelect
                    placeholder="-- Pilih Jawaban --"
                    options={q.opsi_jawaban.map((opt) => ({ value: opt, label: opt }))}
                    value={currentVal}
                    onChange={(val) => handleAnswerChange(q.id, val)}
                    size="md"
                  />
                </div>
              )}

              {q.tipe === 'radio' && q.opsi_jawaban && (
                <div className={`grid gap-2.5 ${
                  q.opsi_jawaban.some(opt => opt.length > 40)
                    ? 'grid-cols-1'
                    : 'grid-cols-1 md:grid-cols-2'
                }`}>
                  {q.opsi_jawaban.map((opt, i) => {
                    const isSelected = currentVal === opt;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`flex items-start justify-between p-3.5 rounded-xl text-left border text-xs font-medium transition-all duration-200 cursor-pointer ${isSelected
                          ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                      >
                        <span className="leading-relaxed flex-1 pr-3">{opt}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.tipe === 'checkbox' && q.opsi_jawaban && (
                <div className={`grid gap-2.5 ${
                  q.opsi_jawaban.some(opt => opt.length > 40)
                    ? 'grid-cols-1'
                    : 'grid-cols-1 md:grid-cols-2'
                }`}>
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
                        className={`flex items-start justify-between p-3.5 rounded-xl text-left border text-xs font-medium transition-all duration-200 cursor-pointer ${isChecked
                          ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                      >
                        <span className="leading-relaxed flex-1 pr-3">{opt}</span>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${isChecked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.tipe === 'text' && (
                <div className="space-y-1">
                  <textarea
                    rows={q.kode_pertanyaan === 'Q1' ? 1 : 2}
                    value={currentVal}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Tuliskan jawaban Anda secara rinci..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  {q.kode_pertanyaan === 'Q1' && userProfile?.nama && currentVal === userProfile.nama && (
                    <p className="text-[11px] text-emerald-600 font-medium italic flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 w-fit">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Nama Responden terisi otomatis dari akun terintegrasi: <strong>{userProfile.nama}</strong></span>
                    </p>
                  )}
                </div>
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
              onClick={() => {
                if (!validateCurrentSection()) return;
                setIsSubmitModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
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

      {/* Confirmation Modal for Submitting Survey */}
      <ConfirmationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={confirmSubmitSurvey}
        title="Kirim Jawaban Survei"
        description="Apakah Anda yakin ingin mengirimkan seluruh jawaban survei ini? Jawaban yang telah dikirim tidak dapat diubah."
        confirmLabel="Ya, Kirim Sekarang"
        cancelLabel="Batal"
        variant="purple"
        icon={Send}
        isLoading={submitting}
      />

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
        description={`Apakah Anda yakin ingin menghapus ${selectedQuestionIds.length} pertanyaan terpilih? Seluruh instrumen tersebut akan dihapus permanen.`}
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
        description={`Apakah Anda yakin ingin menghapus bagian ini beserta seluruh (${deleteSectionConfirmKey ? questions.filter(q => q.section === deleteSectionConfirmKey).length : 0}) butir pertanyaannya? Pertanyaan pada bagian ini akan dinonaktifkan.`}
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
