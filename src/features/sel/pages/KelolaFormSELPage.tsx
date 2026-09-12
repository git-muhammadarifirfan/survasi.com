/**
 * @module features/sel/pages
 * @description Admin Builder: Kelola Form Observasi SEL (Konteks Observasi + Dimensi SEL Indikator)
 * @tables sel_indikator, sel_dimensi, sel_konteks_options, satuan_pendidikan
 * @api GET/POST/PUT/DELETE /api/sel/indikator, GET/POST/PUT/DELETE /api/sel/konteks, GET/POST /api/sel/dimensi
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
  School, ClipboardList, GripVertical, Layers, BookOpen, CheckSquare,
  FolderPlus, PlusCircle
} from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';
import { apiClient } from '../../../shared/services/api-client';
import { notifyToast } from '../../../shared/components/NotificationToast';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import ConnectionErrorCard from '../../../shared/components/ConnectionErrorCard';

export interface CustomSkorOption {
  value: 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

export default function KelolaFormSEL() {
  const [indikatorList, setIndikatorList] = useState<SELIndikator[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubjek, setSelectedSubjek] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Konteks options CRUD State
  const [konteksList, setKonteksList] = useState<any[]>([]);
  const [konteksLoading, setKonteksLoading] = useState(false);
  const [isKonteksModalOpen, setIsKonteksModalOpen] = useState(false);
  const [editingKonteks, setEditingKonteks] = useState<any | null>(null);
  const [formKonteksKategori, setFormKonteksKategori] = useState<'lokasi' | 'waktu' | 'jangkauan' | 'mapel'>('lokasi');
  const [formKonteksLabel, setFormKonteksLabel] = useState('');
  const [formKonteksValueCode, setFormKonteksValueCode] = useState('');
  const [formKonteksUrutan, setFormKonteksUrutan] = useState<number>(1);
  const [deleteKonteksConfirmId, setDeleteKonteksConfirmId] = useState<number | null>(null);

  // Drag & Drop State for Konteks Options
  const [draggedKonteksId, setDraggedKonteksId] = useState<number | null>(null);
  const [dragOverKonteksId, setDragOverKonteksId] = useState<number | null>(null);

  // Custom Dimensi State & Handlers
  const [customDimensiList, setCustomDimensiList] = useState<{ key: string; label: string }[]>([]);
  const [isAddDimensiModalOpen, setIsAddDimensiModalOpen] = useState(false);
  const [newDimensiTitle, setNewDimensiTitle] = useState('');

  // Fetch real dimensions from MySQL API /api/sel/dimensi
  const fetchDimensiList = async () => {
    try {
      const res = await apiClient.sel.getDimensi();
      if (res.success && Array.isArray(res.data)) {
        const customItems = res.data
          .filter((d: any) => !SEL_DIMENSI_ORDER.includes(d.kode))
          .map((d: any) => ({ key: d.kode, label: d.nama }));
        setCustomDimensiList(customItems);
      }
    } catch (err) {
      console.error('[KelolaFormSEL] Error fetching dimensi:', err);
    }
  };

  // Fetch real indicators data from MySQL API /api/sel/indikator
  const fetchIndikatorList = async () => {
    try {
      setLoading(true);
      setFetchError(null);
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
        setFetchError(res.message || 'Gagal memuat indikator pengamatan SEL.');
      }
    } catch (err: any) {
      setFetchError(err?.message || 'Gagal terhubung ke sistem. Silakan periksa koneksi internet Anda atau coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real Konteks options from MySQL API /api/sel/konteks
  const fetchKonteksList = async () => {
    try {
      setKonteksLoading(true);
      const res = await apiClient.sel.getKonteks(undefined, true);
      if (res.success && Array.isArray(res.data)) {
        setKonteksList(res.data);
      }
    } catch (err: any) {
      console.error('[KelolaFormSEL] Error fetching konteks:', err);
    } finally {
      setKonteksLoading(false);
    }
  };

  useEffect(() => {
    fetchDimensiList();
    fetchIndikatorList();
    fetchKonteksList();
  }, []);

  const handleAddDimensi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDimensiTitle.trim()) return;
    const key = newDimensiTitle.trim().toLowerCase().replace(/\s+/g, '_');

    try {
      const res = await apiClient.sel.createDimensi({
        kode: key,
        nama: newDimensiTitle.trim(),
        modul_bsan_kode: 'with_myself',
      });
      if (res.success) {
        setCustomDimensiList((prev) => [...prev, { key, label: newDimensiTitle.trim() }]);
        notifyToast({
          type: 'success',
          title: 'Dimensi Baru Ditambahkan',
          message: `Dimensi "${newDimensiTitle}" berhasil disimpan.`,
        });
      }
    } catch (err: any) {
      setCustomDimensiList((prev) => [...prev, { key, label: newDimensiTitle.trim() }]);
      notifyToast({
        type: 'success',
        title: 'Dimensi Baru Ditambahkan',
        message: `Dimensi "${newDimensiTitle}" berhasil dibuat dan siap diisi indikator.`,
      });
    } finally {
      setNewDimensiTitle('');
      setIsAddDimensiModalOpen(false);
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingInd, setEditingInd] = useState<SELIndikator | null>(null);

  // Form State for Indicator Modal
  const [formTeks, setFormTeks] = useState('');
  const [formDimensi, setFormDimensi] = useState<string>('kesadaran_diri');
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

  // Handlers for Konteks Options Drag & Drop
  const handleDragStartKonteks = (e: React.DragEvent, id: number) => {
    setDraggedKonteksId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
  };

  const handleDragEndKonteks = () => {
    setDraggedKonteksId(null);
    setDragOverKonteksId(null);
  };

  const handleDragOverKonteks = (e: React.DragEvent, id: number, groupList: any[]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverKonteksId === id || !draggedKonteksId || draggedKonteksId === id) return;

    setDragOverKonteksId(id);

    const sourceIdx = groupList.findIndex(i => i.id === draggedKonteksId);
    const targetIdx = groupList.findIndex(i => i.id === id);
    if (sourceIdx === -1 || targetIdx === -1) return;

    setKonteksList(prev => {
      const newMain = [...prev];
      const srcPos = newMain.findIndex(i => i.id === draggedKonteksId);
      const tgtPos = newMain.findIndex(i => i.id === id);
      if (srcPos !== -1 && tgtPos !== -1) {
        const temp = newMain[srcPos];
        newMain[srcPos] = newMain[tgtPos];
        newMain[tgtPos] = temp;
      }
      return newMain;
    });
  };

  const handleDropKonteks = async (targetId: number, groupList: any[]) => {
    setDragOverKonteksId(null);
    if (!draggedKonteksId || draggedKonteksId === targetId) return;

    const sourceIdx = groupList.findIndex(i => i.id === draggedKonteksId);
    const targetIdx = groupList.findIndex(i => i.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reorderedGroup = [...groupList];
    const [movedItem] = reorderedGroup.splice(sourceIdx, 1);
    reorderedGroup.splice(targetIdx, 0, movedItem);

    const reorderPayload = reorderedGroup.map((item, idx) => ({
      id: item.id,
      urutan: idx + 1,
    }));

    setDraggedKonteksId(null);

    try {
      await apiClient.sel.reorderKonteks(reorderPayload);
      notifyToast({
        type: 'success',
        title: 'Urutan Diperbarui',
        message: 'Posisi urutan opsi konteks berhasil disimpan.',
      });
    } catch {
      notifyToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Gagal memperbarui urutan opsi konteks.',
      });
    }
  };

  // Handlers for Konteks Options CRUD
  const handleOpenAddKonteks = (kategori: 'lokasi' | 'waktu' | 'jangkauan' | 'mapel' = 'lokasi') => {
    setEditingKonteks(null);
    setFormKonteksKategori(kategori);
    setFormKonteksLabel('');
    setFormKonteksValueCode('');
    const count = konteksList.filter(k => k.kategori === kategori).length;
    setFormKonteksUrutan(count + 1);
    setIsKonteksModalOpen(true);
  };

  const handleOpenEditKonteks = (item: any) => {
    setEditingKonteks(item);
    setFormKonteksKategori(item.kategori);
    setFormKonteksLabel(item.label);
    setFormKonteksValueCode(item.value_code);
    setFormKonteksUrutan(item.urutan || 1);
    setIsKonteksModalOpen(true);
  };

  const handleSaveKonteks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKonteksLabel.trim()) return;

    try {
      if (editingKonteks) {
        const res = await apiClient.sel.updateKonteks(editingKonteks.id, {
          kategori: formKonteksKategori,
          label: formKonteksLabel.trim(),
          value_code: formKonteksValueCode.trim() || formKonteksLabel.trim(),
          urutan: formKonteksUrutan,
        });
        if (res.success) {
          notifyToast({ type: 'success', title: 'Opsi Diperbarui', message: 'Opsi konteks lapangan berhasil disimpan.' });
          fetchKonteksList();
        }
      } else {
        const res = await apiClient.sel.createKonteks({
          kategori: formKonteksKategori,
          label: formKonteksLabel.trim(),
          value_code: formKonteksValueCode.trim() || formKonteksLabel.trim(),
          urutan: formKonteksUrutan,
        });
        if (res.success) {
          notifyToast({ type: 'success', title: 'Opsi Ditambahkan', message: 'Opsi konteks lapangan baru berhasil ditambahkan.' });
          fetchKonteksList();
        }
      }
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Gagal Menyimpan', message: err?.message || 'Kendala sistem saat menyimpan.' });
    } finally {
      setIsKonteksModalOpen(false);
    }
  };

  const confirmDeleteKonteks = async () => {
    if (!deleteKonteksConfirmId) return;
    try {
      await apiClient.sel.deleteKonteks(deleteKonteksConfirmId);
      setKonteksList(prev => prev.filter(k => k.id !== deleteKonteksConfirmId));
      notifyToast({ type: 'error', title: 'Opsi Dihapus', message: 'Opsi konteks lapangan berhasil dihapus.' });
    } catch {
      notifyToast({ type: 'error', title: 'Gagal Menghapus', message: 'Terjadi kesalahan saat menghapus opsi konteks.' });
    } finally {
      setDeleteKonteksConfirmId(null);
    }
  };

  // Confirmation Modal State for Indikator Delete
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteIndikator = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/sel/indikator/${deleteConfirmId}`);
      setIndikatorList((prev) => prev.filter((i) => i.id !== deleteConfirmId));
      notifyToast({
        type: 'error',
        title: 'Indikator Dihapus',
        message: res.message || 'Butir indikator pengamatan berhasil dihapus.',
      });
    } catch {
      setIndikatorList((prev) => prev.filter((i) => i.id !== deleteConfirmId));
      notifyToast({
        type: 'error',
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

    const dimensiMap: Record<string, number> = {
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

  // Drag and Drop State & Handlers for Indicators
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

  const handleDragLeaveIndikator = () => {
    setDragOverIndikatorId(null);
  };

  const handleDragOverIndikator = (e: React.DragEvent, id: string, groupList: SELIndikator[]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndikatorId === id || !draggedIndikatorId || draggedIndikatorId === id) return;

    setDragOverIndikatorId(id);

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

  const handleDropIndikator = async (targetId: string, groupList: SELIndikator[]) => {
    setDragOverIndikatorId(null);
    if (!draggedIndikatorId || draggedIndikatorId === targetId) return;

    const sourceIdx = groupList.findIndex(i => i.id === draggedIndikatorId);
    const targetIdx = groupList.findIndex(i => i.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reorderedGroup = [...groupList];
    const [movedItem] = reorderedGroup.splice(sourceIdx, 1);
    reorderedGroup.splice(targetIdx, 0, movedItem);

    const newMainList = [...indikatorList];
    const reorderPayload: { id: string; urutan: number }[] = [];

    reorderedGroup.forEach((item, idxInGroup) => {
      const origPos = indikatorList.findIndex(mi => mi.id === groupList[idxInGroup].id);
      const currPos = newMainList.findIndex(mi => mi.id === item.id);
      if (origPos !== -1 && currPos !== -1) {
        reorderPayload.push({ id: item.id, urutan: origPos + 1 });
      }
    });

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

  // Combined Dimensi List (Standard + Custom)
  const allDimensiList = [
    ...SEL_DIMENSI_ORDER.map(d => ({ key: d as string, label: SEL_DIMENSI_LABEL[d] })),
    ...customDimensiList,
  ];

  // Filtered List for Indicators
  const filteredList = indikatorList.filter(ind => {
    if (selectedSection && selectedSection !== 'konteks' && ind.dimensi !== selectedSection) return false;
    if (selectedSubjek && ind.subjek !== selectedSubjek) return false;
    if (search && !ind.teks.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Render Category Konteks Option List with Drag-and-Drop
  const renderKonteksCategoryList = (kategori: 'lokasi' | 'waktu' | 'jangkauan' | 'mapel', title: string, IconComponent: any) => {
    const items = konteksList.filter(k => k.kategori === kategori);

    return (
      <div className="rounded-xl border border-border bg-bg/30 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              <IconComponent className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-text-primary">{title}</h4>
          </div>
          <button
            type="button"
            onClick={() => handleOpenAddKonteks(kategori)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Opsi
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-[11px] text-text-secondary italic pl-9">Belum ada opsi untuk kategori ini.</p>
        ) : (
          <div className="space-y-2 pl-9">
            {items.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={e => handleDragStartKonteks(e, item.id)}
                onDragEnd={handleDragEndKonteks}
                onDragOver={e => handleDragOverKonteks(e, item.id, items)}
                onDrop={() => handleDropKonteks(item.id, items)}
                className={`rounded-xl border p-3 flex items-center justify-between gap-3 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                  draggedKonteksId === item.id
                    ? 'border-primary bg-primary/10 shadow-lg scale-[1.01] opacity-50'
                    : dragOverKonteksId === item.id
                      ? 'border-primary bg-primary/5 shadow-md border-t-2 border-t-primary'
                      : 'border-border bg-surface hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="p-1 text-text-secondary/40 hover:text-primary transition-colors cursor-grab shrink-0 flex items-center justify-center rounded">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-semibold text-text-primary truncate">{item.label}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditKonteks(item)}
                    className="p-1.5 rounded-lg bg-surface border border-border text-primary hover:bg-primary/10 transition-smooth cursor-pointer"
                    title="Edit Opsi"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteKonteksConfirmId(item.id)}
                    className="p-1.5 rounded-lg bg-surface border border-border text-status-belum hover:bg-status-belum/10 transition-smooth cursor-pointer"
                    title="Hapus Opsi"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex items-center justify-center">
        <ThreeDotsLoader text="Memuat instrumen form observasi SEL..." />
      </div>
    );
  }

  if (fetchError) {
    return (
      <ConnectionErrorCard
        title="Gagal Memuat Form Observasi SEL"
        message={fetchError}
        onRetry={() => {
          fetchDimensiList();
          fetchIndikatorList();
          fetchKonteksList();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl bg-surface border border-border p-6 shadow-card animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
              <Settings2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-text-primary">Manajemen Form Observasi SEL</h2>
              <p className="text-text-secondary text-xs mt-0.5">
                Pengaturan pertanyaan indikator dan opsi dimensi pengamatan lapangan
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsAddDimensiModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-smooth cursor-pointer border border-white/30"
            >
              <FolderPlus className="h-4 w-4 text-white" /> Tambah Dimensi Baru
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-smooth cursor-pointer border border-white/30"
            >
              <Eye className="h-4 w-4 text-white" /> Preview Form User
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary hover:bg-white/90 text-xs font-bold shadow-md transition-smooth cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Tambah Pertanyaan Baru
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
              placeholder="Cari pertanyaan / indikator..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-3 py-2 rounded-xl border border-border bg-bg text-text-primary text-xs focus:border-primary focus:outline-none transition-smooth"
            />
          </div>

          <CustomSelect
            options={[
              { value: '', label: 'Semua Dimensi' },
              { value: 'konteks', label: 'Dimensi: Informasi Konteks Observasi' },
              ...allDimensiList.map(d => ({ value: d.key, label: `Dimensi: ${d.label}` })),
            ]}
            value={selectedSection}
            onChange={v => setSelectedSection(v)}
            size="sm"
            className="w-64"
          />

          <CustomSelect
            options={[
              { value: '', label: 'Semua Subjek' },
              { value: 'guru', label: 'Guru' },
              { value: 'murid', label: 'Murid' },
            ]}
            value={selectedSubjek}
            onChange={v => setSelectedSubjek(v)}
            size="sm"
            className="w-36"
          />
        </div>
        <div className="text-xs text-text-secondary font-medium flex items-center gap-3">
          <span>Opsi Konteks DB: <strong>{konteksList.length}</strong></span>
          <span>•</span>
          <span>Indikator SEL: <strong>{filteredList.length}</strong></span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* DIMENSI: INFORMASI KONTEKS OBSERVASI                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {(!selectedSection || selectedSection === 'konteks') && (
        <div className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden animate-slide-up">
          {/* Section Header */}
          <div className="p-4 border-b border-border bg-bg/30 flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary font-display flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Dimensi: Informasi Konteks Observasi Lapangan
            </h3>
          </div>

          {/* Section Rows List */}
          <div className="p-5 space-y-4">
            {/* Row 1: Sekolah Sasaran */}
            <div className="rounded-xl border border-border bg-bg/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                  <School className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">1. Data Sekolah Sasaran (Terintegrasi)</h4>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Nama sekolah, NPSN, kecamatan, dan kabupaten terhubung langsung secara otomatis dari data induk sekolah.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0 self-start sm:self-auto flex items-center gap-1">
                <School className="h-3 w-3" /> Data Sekolah Resmi
              </span>
            </div>

            {/* Row 2: Lingkungan / Lokasi Diamati (with Drag & Drop) */}
            {renderKonteksCategoryList('lokasi', '2. Pilihan Lingkungan / Lokasi Diamati', Building2)}

            {/* Row 3: Waktu Pengamatan (with Drag & Drop) */}
            {renderKonteksCategoryList('waktu', '3. Pilihan Waktu Pengamatan', Clock)}

            {/* Row 4: Jangkauan Siswa saat Observasi (with Drag & Drop) */}
            {renderKonteksCategoryList('jangkauan', '4. Pilihan Jangkauan Siswa saat Observasi', Users)}

            {/* Row 5: Preset Mata Pelajaran (with Drag & Drop) */}
            {renderKonteksCategoryList('mapel', '5. Preset Pilihan Mata Pelajaran', BookOpen)}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* DIMENSI SEL INDIKATOR (GURU & MURID)                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
          {allDimensiList.filter(d => !selectedSection || selectedSection === d.key || selectedSection === 'konteks').map((dimensiItem, dIdx) => {
          const dimensi = dimensiItem.key;
          if (selectedSection === 'konteks') return null; // Only show section 1 when section=konteks is selected

          return (
            <div key={dimensi} className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: `${100 + dIdx * 40}ms` }}>
              <div className="p-4 border-b border-border bg-bg/30 flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary font-display flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> Dimensi: {dimensiItem.label}
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
                          className={`text-[10px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${subjek === 'guru'
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
                              onDragOver={e => handleDragOverIndikator(e, ind.id, inds)}
                              onDragLeave={handleDragLeaveIndikator}
                              onDrop={() => handleDropIndikator(ind.id, inds)}
                              className={`rounded-xl border p-3.5 space-y-2 transition-all duration-200 relative group ${draggedIndikatorId === ind.id
                                  ? 'border-primary bg-primary/10 shadow-lg scale-[1.01] opacity-50'
                                  : dragOverIndikatorId === ind.id
                                    ? 'border-primary bg-primary/5 shadow-md border-t-2 border-t-primary transform translate-y-0.5'
                                    : 'border-border bg-bg/30 hover:border-primary/40 hover:bg-surface hover:shadow-xs'
                                }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 flex-1">
                                  <div
                                    draggable
                                    onDragStart={e => handleDragStartIndikator(e, ind.id)}
                                    onDragEnd={handleDragEndIndikator}
                                    className="p-1.5 text-text-secondary/40 group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center hover:bg-border/40 rounded-md"
                                    title="Tarik & Geser untuk mengubah urutan"
                                  >
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
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleOpenEdit(ind);
                                    }}
                                    className="p-1.5 rounded-lg bg-surface border border-border text-primary hover:bg-primary/10 transition-smooth cursor-pointer"
                                    title="Edit Indikator"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setDeleteConfirmId(ind.id);
                                    }}
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
          );
        })}
      </div>

      {/* Modal Add Dimensi Baru */}
      {isAddDimensiModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-visible animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-text-primary text-sm font-display">Tambah Dimensi SEL Baru</h3>
              </div>
              <button
                onClick={() => setIsAddDimensiModalOpen(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-bg transition-smooth cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddDimensi} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Nama Dimensi SEL *</label>
                <input
                  type="text"
                  value={newDimensiTitle}
                  onChange={e => setNewDimensiTitle(e.target.value)}
                  placeholder="Contoh: Kesadaran Lingkungan & Keamanan"
                  required
                  className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-text-primary focus:border-primary focus:outline-none text-xs"
                />
              </div>

              <div className="border-t border-border pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDimensiModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-text-secondary font-semibold hover:bg-bg transition-smooth cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white font-bold shadow-sm hover:bg-primary-dark transition-smooth flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" /> Simpan Dimensi SEL
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Live Preview User View */}
      {isPreviewOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-4xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-20">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-text-primary font-display">Preview Form Observasi SEL (Tampilan Pengawas / Observer)</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-bg transition-smooth cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <ObservasiFormWizard />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Admin Add/Edit Indikator */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-lg overflow-visible animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-text-primary text-sm font-display">
                  {editingInd ? 'Edit Pertanyaan / Indikator' : 'Tambah Pertanyaan / Indikator Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-bg transition-smooth cursor-pointer"
              >
                <X className="h-4 w-4" />
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
                    label="Konteks Pengamatan"
                    options={[
                      { value: 'kelas', label: 'Di Dalam Kelas' },
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
                  options={allDimensiList.map(d => ({ value: d.key, label: d.label }))}
                  value={formDimensi}
                  onChange={(val) => setFormDimensi(val as string)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Teks Indikator Pertanyaan *</label>
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

      {/* Modal Add/Edit Konteks Option */}
      {isKonteksModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-visible animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-text-primary text-sm font-display">
                  {editingKonteks ? 'Edit Opsi Konteks Lapangan' : 'Tambah Opsi Konteks Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsKonteksModalOpen(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-bg transition-smooth cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKonteks} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <CustomSelect
                  label="Kategori Konteks *"
                  options={[
                    { value: 'lokasi', label: 'Lingkungan / Lokasi Diamati' },
                    { value: 'waktu', label: 'Waktu Pengamatan' },
                    { value: 'jangkauan', label: 'Jangkauan Siswa' },
                    { value: 'mapel', label: 'Preset Mata Pelajaran' },
                  ]}
                  value={formKonteksKategori}
                  onChange={(val) => setFormKonteksKategori(val as any)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Nama Opsi Pilihan *</label>
                <input
                  type="text"
                  value={formKonteksLabel}
                  onChange={e => {
                    setFormKonteksLabel(e.target.value);
                    if (!editingKonteks) setFormKonteksValueCode(e.target.value);
                  }}
                  placeholder="Contoh: Laboratorium Komputer"
                  required
                  className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-text-primary focus:border-primary focus:outline-none text-xs font-semibold"
                />
              </div>

              <div className="border-t border-border pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKonteksModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-text-secondary font-semibold hover:bg-bg transition-smooth cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white font-bold shadow-sm hover:bg-primary-dark transition-smooth flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" /> Simpan Opsi Konteks
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
        title="Hapus Pertanyaan Indikator"
        description="Apakah Anda yakin ingin menghapus butir pertanyaan ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Pertanyaan"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Confirmation Modal for Deleting Konteks Option */}
      <ConfirmationModal
        isOpen={deleteKonteksConfirmId !== null}
        onClose={() => setDeleteKonteksConfirmId(null)}
        onConfirm={confirmDeleteKonteks}
        title="Hapus Opsi Konteks"
        description="Apakah Anda yakin ingin menghapus opsi konteks ini?"
        confirmLabel="Hapus Opsi"
        cancelLabel="Batal"
        variant="danger"
      />
    </div>
  );
}

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
