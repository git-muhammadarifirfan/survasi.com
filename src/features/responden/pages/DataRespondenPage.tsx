/**
 * @module features/responden/pages
 * @description Tabel data responden / sasaran sekolah dengan filter, search, pagination, dan fitur Send Reminder terintegrasi Database MySQL
 * @tables satuan_pendidikan, users, notifikasi, responden_survey
 * @queries database/queries/data_responden.sql → semua query
 * @api GET /api/sekolah, POST /api/sekolah/:id/reminder
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { database, KECAMATAN_LIST, KABUPATEN_LIST } from '../../../shared/data/data-source';
import type { School } from '../../../shared/data/data-source';
import { apiClient } from '../../../shared/services/api-client';
import {
  Search, ChevronLeft, ChevronRight, Send, Users, Check, X,
  Download, Eye, Building2, CheckCircle2, AlertCircle, Clock, ShieldCheck, UserX
} from 'lucide-react';

import CustomSelect from '../../../shared/components/CustomSelect';
import { notifyToast } from '../../../shared/components/NotificationToast';
import PaginationCardMinimal from '../../../shared/components/PaginationCardMinimal';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';

interface DataRespondenProps {
  activeKecamatan: string | null;
  setActiveKecamatan: (kec: string | null) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export default function DataResponden({ activeKecamatan, setActiveKecamatan, searchTerm, onSearchChange }: DataRespondenProps) {
  const [kabupatenFilter, setKabupatenFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [remindedSchools, setRemindedSchools] = useState<Record<string, boolean>>({});
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [activeModalTab, setActiveModalTab] = useState('modul1');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const perPage = 15;

  const { data: schools = [], isLoading, refetch } = useQuery({
    queryKey: ['schools-responden', kabupatenFilter, activeKecamatan, statusFilter, searchTerm],
    queryFn: () => database.getSchools({
      kabupaten: kabupatenFilter || undefined,
      kecamatan: activeKecamatan || undefined,
      status: statusFilter || undefined,
      search: searchTerm || undefined,
    }),
  });

  const totalPages = Math.max(1, Math.ceil(schools.length / perPage));
  const paged = schools.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paged.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paged.map(s => s.npsn));
    }
  };

  const toggleSelectRow = (npsn: string) => {
    setSelectedIds(prev =>
      prev.includes(npsn) ? prev.filter(id => id !== npsn) : [...prev, npsn]
    );
  };

  const handleSendReminder = async (sch: School) => {
    if (!sch.is_registered) {
      notifyToast({
        type: 'warning',
        title: 'Sekolah Belum Terdaftar',
        message: `Pengingat tidak dapat dikirim karena ${sch.nama} belum terhubung dengan akun terdaftar di sistem.`,
      });
      return;
    }

    try {
      setSendingReminderId(sch.id);
      const res = await apiClient.sekolah.sendReminder(sch.id);
      if (res.success) {
        setRemindedSchools(prev => ({ ...prev, [sch.id]: true }));
        notifyToast({
          type: 'success',
          title: 'Pengingat Terkirim ke Database',
          message: res.message || `Notifikasi pengingat BSAN berhasil dikirimkan ke akun ${sch.nama}.`,
        });
      }
    } catch (err: any) {
      notifyToast({
        type: 'error',
        title: 'Gagal Mengirim Pengingat',
        message: err.message || 'Terjadi kesalahan saat memproses pengingat.',
      });
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleBulkRemind = async () => {
    if (selectedIds.length === 0) return;
    
    const selectedSchools = paged.filter(s => selectedIds.includes(s.npsn));
    const registeredSchools = selectedSchools.filter(s => s.is_registered);
    const unregisteredCount = selectedSchools.length - registeredSchools.length;

    if (registeredSchools.length === 0) {
      notifyToast({
        type: 'warning',
        title: 'Pengingat Tidak Dapat Dikirim',
        message: 'Semua sekolah yang Anda pilih belum terhubung dengan akun terdaftar di database.',
      });
      return;
    }

    let successCount = 0;
    for (const sch of registeredSchools) {
      try {
        const res = await apiClient.sekolah.sendReminder(sch.id);
        if (res.success) {
          setRemindedSchools(prev => ({ ...prev, [sch.id]: true }));
          successCount++;
        }
      } catch (err) {
        console.error(`Failed sending reminder to ${sch.nama}:`, err);
      }
    }

    notifyToast({
      type: 'success',
      title: 'Broadcast Reminder Berhasil',
      message: `Pengingat berhasil disimpan di database untuk ${successCount} sekolah terdaftar.${unregisteredCount > 0 ? ` (${unregisteredCount} sekolah dilewati karena belum terdaftar)` : ''}`,
    });

    setSelectedIds([]);
    setIsBulkMode(false);
  };

  const statusBadge = (status: string) => {
    if (status === 'sudah') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Sudah Mengisi</span>
        </span>
      );
    }
    if (status === 'sebagian') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Sebagian</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        <span>Belum Mengisi</span>
      </span>
    );
  };

  // Fetch Real Survey Answers from Database
  const { data: realAnswersRes, isLoading: isLoadingAnswers } = useQuery({
    queryKey: ['school-real-answers', selectedSchool?.id],
    queryFn: () => (selectedSchool ? apiClient.sekolah.getAnswers(selectedSchool.id) : null),
    enabled: !!selectedSchool,
  });

  const realAnswersList = realAnswersRes?.data || [];
  const respondenInfo = realAnswersRes?.responden;

  // Group real database questions into tabs by section or default chunks
  const sectionsInAnswers = Array.from(new Set(realAnswersList.map(a => a.section || 'identitas')));

  const handleExportCSV = (sch: School) => {
    let csv = 'No,Kode,Section,Pertanyaan,Jawaban Real Responden\n';
    realAnswersList.forEach((q, idx) => {
      csv += `"${idx + 1}","${q.kode}","${q.section}","${q.pertanyaan.replace(/"/g, '""')}","${q.jawaban.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hasil_Survei_BSAN_${sch.nama.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notifyToast({
      type: 'success',
      title: 'Ekspor Berhasil',
      message: `Jawaban survei ${sch.nama} berhasil diekspor!`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header Banner & Filters */}
      <div className="rounded-2xl bg-surface p-6 shadow-card border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold font-display text-text-primary">Data Responden & Sasaran Sekolah</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Daftar seluruh satuan pendidikan sasaran, status akun terdaftar, dan pemantauan pengisian BSAN.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                setSelectedIds([]);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isBulkMode
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>{isBulkMode ? 'Tutup Pilihan Massal' : 'Pilih Massal (Bulk Action)'}</span>
            </button>
            <span className="text-xs font-semibold text-text-primary">{schools.length} sekolah terdaftar</span>
          </div>
        </div>

        {/* Bulk Action Sticky Bar when triggered */}
        {isBulkMode && (
          <div className="p-3 mb-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.length === paged.length && paged.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-indigo-950">
                Terpilih <strong>{selectedIds.length}</strong> dari <strong>{paged.length}</strong> sekolah di halaman ini
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={handleBulkRemind}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Broadcast Reminder Database ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Cari sekolah atau NPSN..."
              value={searchTerm}
              onChange={(e) => { onSearchChange(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-border bg-bg/60 py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder-text-secondary/60 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
            />
          </div>

          <div className="relative">
            <CustomSelect
              options={[
                { value: '', label: 'Semua Kabupaten/Kota' },
                ...KABUPATEN_LIST.map(k => ({ value: k.name, label: k.name }))
              ]}
              value={kabupatenFilter}
              onChange={(val) => { setKabupatenFilter(val); setCurrentPage(1); }}
              placeholder="Pilih Kabupaten"
            />
          </div>

          <div className="relative">
            <CustomSelect
              options={[
                { value: '', label: 'Semua Kecamatan' },
                ...KECAMATAN_LIST.map((k) => ({ value: k, label: k }))
              ]}
              value={activeKecamatan || ''}
              onChange={(val) => { setActiveKecamatan(val || null); setCurrentPage(1); }}
              placeholder="Pilih Kecamatan"
              enableSearch={true}
            />
          </div>

          <div className="relative">
            <CustomSelect
              options={[
                { value: '', label: 'Semua Status Pengisian' },
                { value: 'sudah', label: 'Sudah Mengisi' },
                { value: 'sebagian', label: 'Sebagian Mengisi' },
                { value: 'belum', label: 'Belum Mengisi' },
              ]}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
              placeholder="Pilih Status"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-surface shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg/60 border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
                {isBulkMode && (
                  <th className="py-3.5 px-4 text-center w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paged.length && paged.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3.5 px-5 text-left">NPSN</th>
                <th className="py-3.5 px-5 text-left">Nama Sekolah & Akun</th>
                <th className="py-3.5 px-5 text-left hidden md:table-cell">Kecamatan / Kab</th>
                <th className="py-3.5 px-5 text-center hidden lg:table-cell">Akreditasi</th>
                <th className="py-3.5 px-5 text-center">Status Pengisian</th>
                <th className="py-3.5 px-5 text-center">Aksi Reminder & Jawaban</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={isBulkMode ? 7 : 6} className="py-16 text-center">
                    <LoadingIndicator type="line-spinner" size="md" label="Memuat data sekolah sasaran..." />
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={isBulkMode ? 7 : 6} className="py-16 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20 shadow-xs">
                        <Users className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-text-primary font-display">Tidak Ada Data Sekolah</h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Tidak ditemukan sekolah sasaran yang sesuai dengan kriteria filter pencarian Anda.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((s) => (
                  <tr key={s.id} className="table-row-hover">
                    {isBulkMode && (
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s.npsn)}
                          onChange={() => toggleSelectRow(s.npsn)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-primary">{s.npsn}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-primary text-xs truncate max-w-[220px]">{s.nama}</p>
                        {s.is_registered ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60" title="Akun terdaftar dan terintegrasi di database">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Terdaftar</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-500 border border-slate-200" title="Belum memiliki akun terdaftar atau email terhubung">
                            <UserX className="w-2.5 h-2.5 text-slate-400" />
                            <span>Tanpa Akun</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-text-secondary font-normal block mt-0.5">
                        {s.jenjang || 'SD'} • {s.statusSekolah || 'Negeri'} {s.email ? `• ${s.email}` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-text-secondary hidden md:table-cell">
                      <span className="font-semibold text-text-primary block">{s.kecamatan}</span>
                      <span className="text-[10px]">{s.kabupaten}</span>
                    </td>
                    <td className="py-3.5 px-5 text-center text-xs text-text-secondary hidden lg:table-cell font-semibold">
                      {s.akreditasi || 'A'}
                    </td>
                    <td className="py-3.5 px-5 text-center">{statusBadge(s.status)}</td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Send Reminder Action */}
                        {s.status === 'sudah' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200" title="Sekolah ini telah menyelesaikan seluruh instrumen survei BSAN">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Selesai Mengisi</span>
                          </span>
                        ) : remindedSchools[s.id] ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Terkirim</span>
                          </span>
                        ) : !s.is_registered ? (
                          <button
                            type="button"
                            disabled
                            onClick={() => handleSendReminder(s)}
                            title="Sekolah ini belum memiliki akun terdaftar atau email terhubung, sehingga reminder tidak dapat dikirim."
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-medium cursor-not-allowed opacity-75"
                          >
                            <AlertCircle className="w-3 h-3 text-slate-400" />
                            <span>Belum Terdaftar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={sendingReminderId === s.id}
                            onClick={() => handleSendReminder(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-xs transition-smooth active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            {sendingReminderId === s.id ? (
                              <LoadingIndicator type="line-spinner" size="sm" color="#ffffff" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Kirim Reminder</span>
                          </button>
                        )}

                        {/* View Answer Action if school filled survey */}
                        {(s.status === 'sudah' || s.status === 'sebagian') && (
                          <button
                            type="button"
                            onClick={() => { setSelectedSchool(s); setActiveModalTab('modul1'); }}
                            className="inline-flex items-center space-x-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[10px] font-bold transition-smooth active:scale-95 cursor-pointer shadow-xs"
                          >
                            <Eye className="h-3 w-3 text-white" />
                            <span>Jawaban</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Pagination */}
        <div className="p-3 border-t border-border/50 bg-bg/20">
          <PaginationCardMinimal
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={schools.length}
            itemsPerPage={perPage}
          />
        </div>
      </div>

      {/* Modal Preview Jawaban Real */}
      {selectedSchool && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-100 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                    {selectedSchool.nama}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                    NPSN: {selectedSchool.npsn} • {selectedSchool.kecamatan}, {selectedSchool.kabupaten}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0 ml-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 bg-slate-50/30 border-b border-slate-100 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveModalTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeModalTab === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                Semua ({realAnswersList.length})
              </button>
              {sectionsInAnswers.map(secKey => (
                <button
                  type="button"
                  key={secKey}
                  onClick={() => setActiveModalTab(secKey)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap capitalize cursor-pointer ${
                    activeModalTab === secKey
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {secKey.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Modal Body / Answer List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs font-normal text-slate-800 bg-slate-50/20">
              {isLoadingAnswers ? (
                <div className="py-16 text-center space-y-3">
                  <LoadingIndicator type="line-spinner" size="md" color="#10b981" />
                  <p className="text-xs text-slate-500 font-medium">Memuat data jawaban dari database MySQL...</p>
                </div>
              ) : realAnswersList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-medium">
                  Belum ada jawaban tersimpan di database untuk sekolah ini.
                </div>
              ) : (
                realAnswersList
                  .filter(q => activeModalTab === 'all' || q.section === activeModalTab)
                  .map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-2 shadow-xs transition hover:border-slate-300">
                      <div className="flex items-start space-x-2.5">
                        <span className="flex h-5 min-w-[20px] px-1.5 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-slate-800 text-xs sm:text-sm leading-relaxed">
                          {q.pertanyaan}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
                        {q.jawaban}
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 text-center sm:text-left truncate">
                Responden: <span className="font-bold text-slate-800">{respondenInfo?.nama || 'Responden Sekolah'}</span> {respondenInfo?.posisi ? `(${respondenInfo.posisi})` : ''}
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSchool(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCSV(selectedSchool)}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
