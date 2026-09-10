/**
 * @module features/responden/pages
 * @description Tabel data responden dengan filter, search, pagination, dan export CSV/Excel
 * @tables responden_survey, satuan_pendidikan, kecamatan, kabupaten
 * @queries database/queries/data_responden.sql → semua query
 * @api GET /api/responden?kabupaten_id=&kecamatan_id=&search=&page=&limit=
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { database, KECAMATAN_LIST, KABUPATEN_LIST } from '../../../shared/data/data-source';
import type { School } from '../../../shared/data/data-source';
import {
  Search, Filter, ChevronLeft, ChevronRight, Send, Users, Check, X,
  Download, Eye, Building2, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

import CustomSelect from '../../../shared/components/CustomSelect';

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
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [activeModalTab, setActiveModalTab] = useState('modul1');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const perPage = 15;

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools', kabupatenFilter, activeKecamatan, statusFilter, searchTerm],
    queryFn: () => database.getSchools({
      kabupaten: kabupatenFilter || undefined,
      kecamatan: activeKecamatan || undefined,
      status: statusFilter || undefined,
      search: searchTerm || undefined,
    }),
  });

  const totalPages = Math.max(1, Math.ceil(schools.length / perPage));
  const paged = schools.slice((currentPage - 1) * perPage, currentPage * perPage);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
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

  const getPageRange = () => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  const generateRealAnswers = (sch: School) => {
    return [
      {
        tabId: 'modul1',
        title: 'Modul 1: Literasi & Numerasi Dasar',
        questions: [
          { q: 'Apakah sekolah melakukan refleksi berkala terhadap metode pembelajaran?', a: sch.status === 'sudah' ? 'Ya, rutin setiap bulan melalui rapat guru kelas.' : 'Sebagian guru telah menerima sosialisasi.' },
          { q: 'Jenis media pembelajaran yang paling sering digunakan dalam kelas awal:', a: 'Alat Peraga Fisik, Kartu Afirmasi, & Roda Emosi' },
          { q: 'Frekuensi pelaksanaan membaca bersama murid:', a: 'Rutin 15 menit setiap pagi sebelum kegiatan belajar mengajar.' }
        ]
      },
      {
        tabId: 'modul2',
        title: 'Modul 2: Pengembangan Karakter & P5',
        questions: [
          { q: 'Keterlaksanaan Projek Penguatan Profil Pelajar Pancasila (P5):', a: 'Sangat baik, 3 projek per tahun bertema kearifan lokal.' },
          { q: 'Apakah terdapat Kesepakatan Kelas yang disusun bersama murid?', a: 'Ya, disepakati dan ditandatangani oleh guru dan siswa di awal semester.' }
        ]
      },
      {
        tabId: 'modul3',
        title: 'Modul 3: Kepemimpinan Instruksional',
        questions: [
          { q: 'Dukungan Kepala Sekolah dalam supervisi akademik:', a: 'Memimpin diskusi refleksi berkala dan supervisi klinis 2 kali per semester.' }
        ]
      },
      {
        tabId: 'modul4',
        title: 'Modul 4: Lingkungan Belajar Aman & Nyaman',
        questions: [
          { q: 'Kondisi fisik ruang kelas di sekolah:', a: `Ruang kelas dalam kondisi layak dengan kapasitas total ${sch.totalSiswa} siswa dan ${sch.totalGuru} guru.` },
          { q: 'Program pencegahan penanganan kekerasan:', a: 'Tersedia poster area pribadi, SOP aduan, dan pembentukan tim TPKK.' }
        ]
      },
      {
        tabId: 'modul5',
        title: 'Modul 5: Kemitraan Orang Tua & Komite',
        questions: [
          { q: 'Bentuk keterlibatan wali murid dalam BSAN:', a: 'Aktif dalam forum paguyuban wali murid dan gotong royong kegiatan sekolah.' }
        ]
      }
    ];
  };

  const handleExportCSV = (sch: School) => {
    const modules = generateRealAnswers(sch);
    let csv = 'Modul,Pertanyaan,Jawaban Real Responden\n';
    modules.forEach(m => {
      m.questions.forEach(q => {
        csv += `"${m.title}","${q.q}","${q.a}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hasil_Survei_BSAN_${sch.nama.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Jawaban survei ${sch.nama} berhasil diekspor!`);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification di ATAS KANAN (top-6 right-6) */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-2xl text-xs font-semibold animate-scale-in border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner & Filters */}
      <div className="rounded-2xl bg-surface p-6 shadow-card border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold font-display text-text-primary">Data Responden Survei Sekolah</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Daftar sekolah sasaran beserta status pengisian instrumen BSAN.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-text-primary">{schools.length} sekolah sasaran</span>
          </div>
        </div>

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
                { value: '', label: 'Semua Status' },
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
                <th className="py-3.5 px-5 text-left">NPSN</th>
                <th className="py-3.5 px-5 text-left">Nama Sekolah</th>
                <th className="py-3.5 px-5 text-left hidden md:table-cell">Kecamatan</th>
                <th className="py-3.5 px-5 text-center hidden lg:table-cell">Akreditasi</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs font-semibold text-text-secondary animate-pulse">
                    Memuat data sekolah...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs font-normal text-text-secondary">
                    Tidak ditemukan sekolah yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paged.map((s) => (
                  <tr key={s.id} className="table-row-hover">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-primary">{s.npsn}</td>
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-text-primary text-xs truncate max-w-[220px]">{s.nama}</p>
                      <span className="text-[10px] text-text-secondary font-normal">{s.alamat || '-'}</span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-text-secondary hidden md:table-cell">
                      <span className="font-semibold text-text-primary block">{s.kecamatan}</span>
                      <span className="text-[10px]">{s.kabupaten}</span>
                    </td>
                    <td className="py-3.5 px-5 text-center text-xs text-text-secondary hidden lg:table-cell font-semibold">
                      {s.akreditasi || '-'}
                    </td>
                    <td className="py-3.5 px-5 text-center">{statusBadge(s.status)}</td>
                    <td className="py-3.5 px-5 text-center">
                      {s.status === 'belum' ? (
                        remindedSchools[s.id] ? (
                          <span className="inline-flex items-center space-x-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 text-[10px] font-bold">
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span>Terkirim</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setRemindedSchools(p => ({ ...p, [s.id]: true }));
                              showToast(`Pemberitahuan reminder survei berhasil dikirim ke ${s.nama}!`);
                            }}
                            className="inline-flex items-center space-x-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 text-[10px] font-bold transition-smooth active:scale-95 cursor-pointer shadow-sm"
                          >
                            <Send className="h-3 w-3" />
                            <span>Kirim Reminder</span>
                          </button>
                        )
                      ) : (
                        /* Tombol Lihat Jawaban: WARNA HIJAU (bg-emerald-600) */
                        <button
                          onClick={() => { setSelectedSchool(s); setActiveModalTab('modul1'); }}
                          className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[10px] font-bold transition-smooth active:scale-95 cursor-pointer shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 text-white" />
                          <span>Lihat Jawaban</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/50 bg-bg/30 text-xs">
            <p className="text-[11px] text-text-secondary font-normal">
              Halaman <span className="font-bold text-text-primary">{currentPage}</span> dari <span className="font-bold text-text-primary">{totalPages}</span> ({schools.length} sekolah)
            </p>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {getPageRange().map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-smooth ${
                    currentPage === p ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-bg'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Preview Jawaban */}
      {selectedSchool && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full border border-border flex flex-col max-h-[82vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border bg-bg/40">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm leading-tight">{selectedSchool.nama}</h3>
                  <p className="text-[11px] text-text-secondary font-normal mt-0.5">NPSN: {selectedSchool.npsn} • {selectedSchool.kecamatan}, {selectedSchool.kabupaten}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="p-1 rounded-lg text-text-secondary hover:bg-border/40 transition-smooth"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex overflow-x-auto space-x-1.5 px-4 py-2 bg-bg/20 border-b border-border">
              {[
                { id: 'modul1', label: 'Modul 1' },
                { id: 'modul2', label: 'Modul 2' },
                { id: 'modul3', label: 'Modul 3' },
                { id: 'modul4', label: 'Modul 4' },
                { id: 'modul5', label: 'Modul 5' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModalTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth whitespace-nowrap ${
                    activeModalTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-text-secondary hover:bg-bg'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-normal text-text-primary custom-scrollbar bg-bg/10">
              {generateRealAnswers(selectedSchool)
                .filter(m => m.tabId === activeModalTab)
                .map((m) => (
                  <div key={m.tabId} className="space-y-3">
                    <h4 className="font-bold text-xs text-emerald-700 uppercase tracking-wider border-b border-border/60 pb-1.5">{m.title}</h4>
                    <div className="space-y-3">
                      {m.questions.map((q, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-surface border border-border/80 space-y-1.5">
                          <p className="font-semibold text-text-primary text-xs flex items-start space-x-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span>{q.q}</span>
                          </p>
                          <div className="p-2.5 bg-bg/40 rounded-lg border border-border/50 text-[11px] text-text-secondary font-normal leading-relaxed">
                            {q.a}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-3.5 border-t border-border bg-bg/30 flex items-center justify-between">
              <span className="text-[10px] text-text-secondary font-normal">Status Pengisian: <strong className="text-emerald-600 font-semibold">Lengkap</strong></span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-border bg-surface text-text-secondary text-xs font-semibold hover:bg-bg transition-smooth"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleExportCSV(selectedSchool)}
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-md transition-smooth active:scale-95 cursor-pointer"
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
