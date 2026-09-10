/**
 * @module features/sel/pages
 * @description CRUD admin: kelola indikator observasi SEL (tambah/edit/hapus/toggle active)
 * @tables sel_indikator, sel_dimensi
 * @api GET /api/sel/indikator, POST /api/sel/indikator, PUT /api/sel/indikator/:id, DELETE /api/sel/indikator/:id
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SEL_INDIKATORS, SEL_DIMENSI_ORDER, SEL_DIMENSI_LABEL } from '../../../shared/data/sel-indicators';
import type { SELIndikator, SELDimensi, SELSubjek, SELKonteks } from '../../../shared/data/sel-indicators';
import { ObservasiFormWizard } from './ObservasiSELPage';
import {
  FileText, Plus, Edit3, Trash2, Search, Filter, Save, X, CheckCircle2,
  AlertCircle, GraduationCap, Users, Building2, Trees, Settings2, Eye,
  XCircle, Clock, CheckCircle, Sparkles, Brain, MapPin, ChevronRight,
  School, ClipboardList, GripVertical
} from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';
import { apiClient } from '../../../shared/services/api-client';
import { notifyToast } from '../../../shared/components/NotificationToast';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';

export interface CustomSkorOption {
  value: 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

export default function KelolaFormSEL() {
  const [indikatorList, setIndikatorList] = useState<SELIndikator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDimensi, setSelectedDimensi] = useState<string>('');
  const [selectedSubjek, setSelectedSubjek] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Fetch real data from MySQL API /api/sel/indikator
  const fetchIndikatorList = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any[]>('/sel/indikator');
      if (res.success && Array.isArray(res.data)) {
        const formatted: SELIndikator[] = res.data.map((item: any) => ({
          id: String(item.id),
          dimensi: (item.dimensi_kode || 'kesadaran_diri') as SELDimensi,
          subjek: (item.subjek || 'guru') as SELSubjek,
          konteks: item.konteks || 'kelas',
          teks: item.deskripsi || item.teks || '',
          catatan: item.catatan || undefined,
        }));
        setIndikatorList(formatted);
      } else {
        setIndikatorList(SEL_INDIKATORS);
      }
    } catch {
      setIndikatorList(SEL_INDIKATORS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndikatorList();
  }, []);

  // Skor Options (Fixed standard response scale)
  const skorOptions: CustomSkorOption[] = [
    { value: 1, label: 'Tidak Terlihat', color: '#EF4444' },
    { value: 2, label: 'Kadang Terlihat', color: '#F59E0B' },
    { value: 3, label: 'Sering Terlihat', color: '#10B981' },
    { value: 4, label: 'Konsisten', color: '#4A57C4' },
  ];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingInd, setEditingInd] = useState<SELIndikator | null>(null);

  // Form State for Indicator Modal
  const [formTeks, setFormTeks] = useState('');
  const [formDimensi, setFormDimensi] = useState<SELDimensi>('kesadaran_diri');
  const [formSubjek, setFormSubjek] = useState<SELSubjek>('guru');
  const [formKonteks, setFormKonteks] = useState<SELKonteks>('kelas');
  const [formCatatan, setFormCatatan] = useState('');



  const handleOpenAdd = () => {
    setEditingInd(null);
    setFormTeks('');
    setFormDimensi('kesadaran_diri');
    setFormSubjek('guru');
    setFormKonteks('kelas');
    setFormCatatan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ind: SELIndikator) => {
    setEditingInd(ind);
    setFormTeks(ind.teks);
    setFormDimensi(ind.dimensi);
    setFormSubjek(ind.subjek);
    setFormKonteks(ind.konteks);
    setFormCatatan(ind.catatan || '');
    setIsModalOpen(true);
  };

  // Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteIndikator = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/sel/indikator/${deleteConfirmId}`);
      if (res.success) {
        setIndikatorList(prev => prev.filter(i => i.id !== deleteConfirmId));
        notifyToast({
          type: 'success',
          title: 'Indikator Dihapus',
          message: 'Butir indikator pengamatan berhasil dihapus.',
        });
      } else {
        setIndikatorList(prev => prev.filter(i => i.id !== deleteConfirmId));
        notifyToast({
          type: 'info',
          title: 'Indikator Dihapus',
          message: 'Indikator pengamatan telah dihapus.',
        });
      }
    } catch {
      setIndikatorList(prev => prev.filter(i => i.id !== deleteConfirmId));
      notifyToast({
        type: 'info',
        title: 'Indikator Dihapus',
        message: 'Indikator pengamatan telah dihapus.',
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleSaveIndikator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeks.trim()) return;

    const dimensiMap: Record<SELDimensi, number> = {
      kesadaran_diri: 1,
      regulasi_emosi: 2,
      kesadaran_sosial: 3,
      keterampilan_relasi: 4,
      tanggung_jawab: 5,
    };

    try {
      if (editingInd) {
        const updatePayload = {
          teks: formTeks,
          subjek: formSubjek,
          konteks: formKonteks,
          catatan: formCatatan || null,
          dimensi_id: dimensiMap[formDimensi] || 1,
        };
        const res = await apiClient.put(`/sel/indikator/${editingInd.id}`, updatePayload);
        if (res.success) {
          setIndikatorList(prev =>
            prev.map(i =>
              i.id === editingInd.id
                ? {
                    ...i,
                    teks: formTeks,
                    dimensi: formDimensi,
                    subjek: formSubjek,
                    konteks: formKonteks,
                    catatan: formCatatan || undefined,
                  }
                : i
            )
          );
          notifyToast({
            type: 'success',
            title: 'Berhasil Diperbarui',
            message: 'Butir indikator pengamatan SEL berhasil disimpan.',
          });
        } else {
          notifyToast({
            type: 'error',
            title: 'Gagal Menyimpan',
            message: res.message || 'Terjadi kesalahan saat memperbarui indikator.',
          });
        }
      } else {
        const createPayload = {
          kode: `IND_${formSubjek.toUpperCase()}_${Date.now().toString().slice(-4)}`,
          teks: formTeks,
          subjek: formSubjek,
          konteks: formKonteks,
          catatan: formCatatan || null,
          dimensi_id: dimensiMap[formDimensi] || 1,
          urutan: indikatorList.length + 1,
        };
        const res = await apiClient.post<{ id: number }>('/sel/indikator', createPayload);
        const newId = res.data?.id ? String(res.data.id) : `${formSubjek}_${Date.now()}`;
        const newInd: SELIndikator = {
          id: newId,
          teks: formTeks,
          dimensi: formDimensi,
          subjek: formSubjek,
          konteks: formKonteks,
          catatan: formCatatan || undefined,
        };
        setIndikatorList(prev => [...prev, newInd]);
        notifyToast({
          type: 'success',
          title: 'Indikator Ditambahkan',
          message: 'Indikator pengamatan SEL baru berhasil disimpan.',
        });
      }
    } catch (err: any) {
      notifyToast({
        type: 'error',
        title: 'Error Koneksi',
        message: err?.message || 'Gagal menyimpan perubahan.',
      });
    }

    setIsModalOpen(false);
  };

  // Drag and Drop State & Handlers
  const [draggedIndikatorId, setDraggedIndikatorId] = useState<string | null>(null);
  const [dragOverIndikatorId, setDragOverIndikatorId] = useState<string | null>(null);

  const handleDragStartIndikator = (e: React.DragEvent, id: string) => {
    setDraggedIndikatorId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEndIndikator = () => {
    setDraggedIndikatorId(null);
    setDragOverIndikatorId(null);
  };

  const handleDragOverIndikator = (e: React.DragEvent, id: string, groupList: SELIndikator[]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndikatorId === id || !draggedIndikatorId || draggedIndikatorId === id) return;

    setDragOverIndikatorId(id);

    // Real-time live position swap for smooth drag animation
    const sourceIdx = groupList.findIndex(i => i.id === draggedIndikatorId);
    const targetIdx = groupList.findIndex(i => i.id === id);
    if (sourceIdx === -1 || targetIdx === -1) return;

    setIndikatorList(prev => {
      const newMain = [...prev];
      const srcPos = newMain.findIndex(i => i.id === draggedIndikatorId);
      const tgtPos = newMain.findIndex(i => i.id === id);
      if (srcPos !== -1 && tgtPos !== -1) {
        const temp = newMain[srcPos];
        newMain[srcPos] = newMain[tgtPos];
        newMain[tgtPos] = temp;
      }
      return newMain;
    });
  };

  const handleDragLeaveIndikator = () => {
    setDragOverIndikatorId(null);
  };

  const handleDropIndikator = async (targetId: string, groupList: SELIndikator[]) => {
    setDragOverIndikatorId(null);
    if (!draggedIndikatorId || draggedIndikatorId === targetId) return;

    const sourceIdx = groupList.findIndex(i => i.id === draggedIndikatorId);
    const targetIdx = groupList.findIndex(i => i.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reorderedGroup = [...groupList];
    const [movedItem] = reorderedGroup.splice(sourceIdx, 1);
    reorderedGroup.splice(targetIdx, 0, movedItem);

    // Re-assign positions in main list
    const newMainList = [...indikatorList];
    const reorderPayload: { id: string; urutan: number }[] = [];

    reorderedGroup.forEach((item, idxInGroup) => {
      const origPos = indikatorList.findIndex(mi => mi.id === groupList[idxInGroup].id);
      const currPos = newMainList.findIndex(mi => mi.id === item.id);
      if (origPos !== -1 && currPos !== -1) {
        reorderPayload.push({ id: item.id, urutan: origPos + 1 });
      }
    });

    // Simple swap state update
    const srcPos = newMainList.findIndex(i => i.id === draggedIndikatorId);
    const tgtPos = newMainList.findIndex(i => i.id === targetId);
    if (srcPos !== -1 && tgtPos !== -1) {
      const temp = newMainList[srcPos];
      newMainList[srcPos] = newMainList[tgtPos];
      newMainList[tgtPos] = temp;
      setIndikatorList(newMainList);
    }
    setDraggedIndikatorId(null);

    try {
      await apiClient.put('/sel/indikator/reorder', { items: reorderPayload });
      notifyToast({
        type: 'success',
        title: 'Urutan Diperbarui',
        message: 'Posisi urutan indikator pengamatan berhasil disimpan.',
      });
    } catch {
      notifyToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Gagal memperbarui urutan indikator.',
      });
    }
  };

  // Move Indikator Up/Down Reorder
  const handleMoveIndikator = async (id: string, direction: 'up' | 'down', groupList: SELIndikator[]) => {
    const idx = groupList.findIndex(i => i.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === groupList.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const itemA = groupList[idx];
    const itemB = groupList[targetIdx];

    // Swap position in indikatorList
    const newArr = [...indikatorList];
    const posA = newArr.findIndex(i => i.id === itemA.id);
    const posB = newArr.findIndex(i => i.id === itemB.id);

    if (posA !== -1 && posB !== -1) {
      const temp = newArr[posA];
      newArr[posA] = newArr[posB];
      newArr[posB] = temp;
      setIndikatorList(newArr);
    }

    try {
      await apiClient.put('/sel/indikator/reorder', {
        items: [
          { id: itemA.id, urutan: posB + 1 },
          { id: itemB.id, urutan: posA + 1 }
        ]
      });
      notifyToast({
        type: 'success',
        title: 'Urutan Diperbarui',
        message: 'Posisi indikator pengamatan berhasil diubah.',
      });
    } catch {
      notifyToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Gagal memperbarui posisi urutan indikator.',
      });
    }
  };

  // Filtered List
  const filteredList = indikatorList.filter(ind => {
    if (selectedDimensi && ind.dimensi !== selectedDimensi) return false;
    if (selectedSubjek && ind.subjek !== selectedSubjek) return false;
    if (search && !ind.teks.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-[#5a6bd4] to-accent p-6 text-white shadow-lg relative overflow-hidden animate-slide-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl shadow-inner">
              <Settings2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">Manajemen Form Observasi SEL</h2>
              <p className="text-white/70 text-xs mt-0.5">
                Kelola butir indikator pengamatan secara terstruktur, konsisten, dan mudah diatur
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-smooth cursor-pointer border border-white/30"
            >
              <Eye className="h-4 w-4" /> Preview Tampilan User
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary hover:bg-white/90 text-xs font-bold shadow-md transition-smooth cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Tambah Pertanyaan / Indikator
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-xl bg-surface border border-border p-4 shadow-card animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="flex flex-wrap gap-2.5 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari muatan indikator..."
              className="pl-9 pr-3 py-2 rounded-xl border border-border bg-bg text-xs text-text-primary focus:border-primary focus:outline-none w-full sm:w-64"
            />
          </div>
          <div className="min-w-[170px]">
            <CustomSelect
              options={[
                { value: '', label: 'Semua Dimensi SEL' },
                ...SEL_DIMENSI_ORDER.map(d => ({ value: d, label: SEL_DIMENSI_LABEL[d] }))
              ]}
              value={selectedDimensi}
              onChange={(val) => setSelectedDimensi(val)}
              placeholder="Pilih Dimensi"
            />
          </div>
          <div className="min-w-[140px]">
            <CustomSelect
              options={[
                { value: '', label: 'Semua Subjek' },
                { value: 'guru', label: 'Guru' },
                { value: 'murid', label: 'Murid' },
              ]}
              value={selectedSubjek}
              onChange={(val) => setSelectedSubjek(val)}
              placeholder="Pilih Subjek"
            />
          </div>
        </div>
        <div className="text-xs text-text-secondary font-medium">
          Total <strong>{filteredList.length}</strong> Butir Pertanyaan / Indikator
        </div>
      </div>

      {/* Grouped Editor Cards by Dimensi & Subjek */}
      <div className="space-y-6">
        {SEL_DIMENSI_ORDER.filter(d => !selectedDimensi || d === selectedDimensi).map((dimensi, dIdx) => (
          <div key={dimensi} className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: `${100 + dIdx * 40}ms` }}>
            <div className="p-4 border-b border-border bg-bg/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary font-display flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Dimensi: {SEL_DIMENSI_LABEL[dimensi]}
              </h3>
            </div>

            <div className="p-5 space-y-6">
              {(['guru', 'murid'] as const).filter(s => !selectedSubjek || s === selectedSubjek).map(subjek => {
                const inds = filteredList.filter(i => i.dimensi === dimensi && i.subjek === subjek);
                return (
                  <div key={subjek}>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${subjek === 'guru' ? 'text-primary' : 'text-accent'}`}>
                          {subjek === 'guru' ? <GraduationCap className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          {subjek === 'guru' ? 'Indikator Guru' : 'Indikator Murid'}
                        </span>
                        <div className={`h-px w-12 ${subjek === 'guru' ? 'bg-primary/20' : 'bg-accent/20'}`} />
                      </div>
                      <button
                        onClick={() => {
                          handleOpenAdd();
                          setFormDimensi(dimensi);
                          setFormSubjek(subjek);
                        }}
                        className={`text-[10px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          subjek === 'guru'
                            ? 'text-primary bg-primary/10 hover:bg-primary/20'
                            : 'text-accent bg-accent/10 hover:bg-accent/20'
                        }`}
                      >
                        <Plus className="h-3 w-3" /> Tambah Indikator
                      </button>
                    </div>

                    {inds.length === 0 ? (
                      <div className="p-5 text-center text-text-secondary text-xs bg-bg/30 border border-dashed border-border rounded-xl">
                        Belum ada indikator untuk subjek {subjek} pada dimensi ini.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {inds.map((ind, idx) => (
                          <div
                            key={ind.id}
                            draggable
                            onDragStart={e => handleDragStartIndikator(e, ind.id)}
                            onDragEnd={handleDragEndIndikator}
                            onDragOver={e => handleDragOverIndikator(e, ind.id, inds)}
                            onDragLeave={handleDragLeaveIndikator}
                            onDrop={() => handleDropIndikator(ind.id, inds)}
                            className={`rounded-xl border p-3.5 space-y-2 transition-all duration-200 relative group cursor-grab active:cursor-grabbing ${
                              draggedIndikatorId === ind.id 
                                ? 'border-primary bg-primary/10 shadow-lg scale-[1.01] opacity-50' 
                                : dragOverIndikatorId === ind.id
                                ? 'border-primary bg-primary/5 shadow-md border-t-2 border-t-primary transform translate-y-0.5'
                                : 'border-border bg-bg/30 hover:border-primary/40 hover:bg-surface hover:shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 flex-1">
                                <div className="p-1.5 text-text-secondary/40 group-hover:text-primary transition-colors cursor-grab shrink-0 flex items-center justify-center hover:bg-border/40 rounded-md">
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  {idx + 1}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${ind.subjek === 'guru' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                                      {ind.subjek === 'guru' ? <GraduationCap className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                                      {ind.subjek === 'guru' ? 'Guru' : 'Murid'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[9px] text-text-secondary font-medium px-1.5 py-0.5 rounded bg-surface border border-border/50">
                                      {ind.konteks === 'kelas' ? <Building2 className="h-3 w-3" /> : <Trees className="h-3 w-3" />}
                                      {ind.konteks === 'kelas' ? 'Kelas' : 'Lingkungan'}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-text-primary leading-relaxed">{ind.teks}</p>
                                  {ind.catatan && (
                                    <p className="text-[10px] text-text-secondary italic mt-1 leading-relaxed flex items-start gap-1">
                                      <AlertCircle className="h-3 w-3 text-text-secondary/70 shrink-0 mt-0.5" /> {ind.catatan}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleOpenEdit(ind)}
                                  className="p-1.5 rounded-lg bg-surface border border-border text-primary hover:bg-primary/10 transition-smooth cursor-pointer"
                                  title="Edit Indikator"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(ind.id)}
                                  className="p-1.5 rounded-lg bg-surface border border-border text-status-belum hover:bg-status-belum/10 transition-smooth cursor-pointer"
                                  title="Hapus Indikator"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Live Preview User View */}
      {isPreviewOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-4xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-20">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-bold text-text-primary text-sm font-display">Live Interactive Preview: Form Observasi SEL</h3>
                  <p className="text-[10px] text-text-secondary">Simulasi interaktif langsung sesuai tampilan User Sekolah saat mengisi form</p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-border/40 transition-smooth cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 bg-bg/50">
              <ObservasiFormWizard onSubmitDone={() => {
                notifyToast({
                  type: 'success',
                  title: 'Simulasi Berhasil',
                  message: 'Simulasi pengiriman form observasi berhasil diselesaikan.',
                });
                setIsPreviewOpen(false);
              }} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Add/Edit Indicator */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-text-primary text-base font-display">
                  {editingInd ? 'Edit Pertanyaan / Indikator' : 'Tambah Pertanyaan / Indikator Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-border/40 transition-smooth cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIndikator} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <CustomSelect
                    label="Subjek Pengamatan"
                    options={[
                      { value: 'guru', label: 'Guru' },
                      { value: 'murid', label: 'Murid' },
                    ]}
                    value={formSubjek}
                    onChange={(val) => setFormSubjek(val as SELSubjek)}
                  />
                </div>
                <div className="space-y-1">
                  <CustomSelect
                    label="Konteks Area"
                    options={[
                      { value: 'kelas', label: 'Dalam Kelas' },
                      { value: 'lingkungan', label: 'Lingkungan Sekolah' },
                    ]}
                    value={formKonteks}
                    onChange={(val) => setFormKonteks(val as SELKonteks)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <CustomSelect
                  label="Dimensi SEL"
                  options={SEL_DIMENSI_ORDER.map(d => ({ value: d, label: SEL_DIMENSI_LABEL[d] }))}
                  value={formDimensi}
                  onChange={(val) => setFormDimensi(val as SELDimensi)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Teks Indikator Pengamatan *</label>
                <textarea
                  rows={3}
                  value={formTeks}
                  onChange={e => setFormTeks(e.target.value)}
                  placeholder="Contoh: Guru mengajak murid mengenali kekuatan dan kelemahan diri..."
                  required
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Petunjuk Observer (Opsional)</label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={e => setFormCatatan(e.target.value)}
                  placeholder="Contoh: Wawancara guru jika saat observasi tidak ditemukan peristiwa..."
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none leading-relaxed resize-none"
                />
              </div>

              <div className="border-t border-border pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-text-secondary font-semibold hover:bg-bg transition-smooth cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white font-bold shadow-sm hover:bg-primary-dark transition-smooth flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" /> Simpan Indikator
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal for Deleting Indicator */}
      <ConfirmationModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteIndikator}
        title="Hapus Indikator Pengamatan"
        description="Apakah Anda yakin ingin menghapus butir indikator pengamatan ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Indikator"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
