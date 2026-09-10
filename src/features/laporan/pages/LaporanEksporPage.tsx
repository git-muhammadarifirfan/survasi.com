/**
 * @module features/laporan/pages
 * @description Generate & download laporan PDF/Excel/DOCX dengan filter wilayah dan modul
 * @tables laporan_export, satuan_pendidikan, responden_survey, sel_sesi_observasi
 * @queries database/queries/laporan_export.sql → semua query
 * @api POST /api/laporan/generate, GET /api/laporan/download/:id, GET /api/laporan/history
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { database, KABUPATEN_LIST, KECAMATAN_LIST } from '../../../shared/data/data-source';
import { Download, Filter, CheckCircle2, Building2, ChevronLeft, ChevronRight, X, Check, Settings, Award } from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import CustomSelect from '../../../shared/components/CustomSelect';

interface ColumnOption {
  id: string;
  label: string;
  category: 'metadata' | 'survey';
}

export default function LaporanEkspor() {
  // Main page states
  const [selectedKab, setSelectedKab] = useState<string>('');
  const [selectedKec, setSelectedKec] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Modal states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('excel');
  const [exportType, setExportType] = useState<'metadata' | 'answers'>('metadata');
  const [rowLimit, setRowLimit] = useState<number>(0); // 0 means all
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'npsn', 'nama', 'kecamatan', 'status', 'akreditasi', 'totalSiswa', 'totalGuru'
  ]);
  
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const columnOptions: ColumnOption[] = [
    { id: 'npsn', label: 'NPSN', category: 'metadata' },
    { id: 'nama', label: 'Nama Sekolah', category: 'metadata' },
    { id: 'kabupaten', label: 'Kabupaten', category: 'metadata' },
    { id: 'kecamatan', label: 'Kecamatan', category: 'metadata' },
    { id: 'status', label: 'Status Pengisian', category: 'metadata' },
    { id: 'akreditasi', label: 'Akreditasi', category: 'metadata' },
    { id: 'alamat', label: 'Alamat Lengkap', category: 'metadata' },
    { id: 'totalSiswa', label: 'Jumlah Siswa', category: 'metadata' },
    { id: 'totalGuru', label: 'Jumlah Guru', category: 'metadata' },
    { id: 'telepon', label: 'Nomor Telepon', category: 'metadata' },
    { id: 'email', label: 'Email Sekolah', category: 'metadata' },
    
    { id: 'm1', label: 'Modul 1 (Literasi & Numerasi)', category: 'survey' },
    { id: 'm2', label: 'Modul 2 (Pengembangan Karakter)', category: 'survey' },
    { id: 'm3', label: 'Modul 3 (Kepemimpinan Instruksional)', category: 'survey' },
    { id: 'm4', label: 'Modul 4 (Lingkungan Belajar)', category: 'survey' },
    { id: 'm5', label: 'Modul 5 (Kemitraan Orang Tua)', category: 'survey' },
  ];

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schoolsExportMain', selectedKab, selectedKec, selectedStatus],
    queryFn: () => database.getSchools({
      kabupaten: selectedKab || undefined,
      kecamatan: selectedKec || undefined,
      status: selectedStatus || undefined
    })
  });

  const total = schools.length;
  const sudah = schools.filter(s => s.status === 'sudah').length;
  const rate = total > 0 ? Math.round((sudah / total) * 100) : 0;

  const totalPages = Math.max(1, Math.ceil(schools.length / perPage));
  const paged = schools.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getPageRange = () => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  const toggleColumn = (id: string) => {
    setSelectedColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      sudah: { label: 'Lengkap', cls: 'bg-status-sudah/10 text-status-sudah' },
      sebagian: { label: 'Sebagian', cls: 'bg-status-sebagian/10 text-status-sebagian' },
      belum: { label: 'Belum Mengisi', cls: 'bg-status-belum/10 text-status-belum' },
    };
    const s = map[status] || map.belum;
    return <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold ${s.cls}`}>{s.label}</span>;
  };

  const getMockAnswers = (schoolName: string) => {
    const answers = {
      m1: 'Ya, rutin setiap bulan melalui forum KKG kelas awal.',
      m2: 'Sangat baik, 3 projek per tahun bertema kearifan lokal.',
      m3: 'Cukup (1-2 kali per semester oleh kepala sekolah).',
      m4: 'Sangat Baik & Kondusif dengan sarana memadai.',
      m5: 'Ya, berkala setiap bagi rapor / semester.'
    };
    const prefix = schoolName.length % 2 === 0 ? 'Secara umum, ' : '';
    return {
      m1: prefix + answers.m1,
      m2: prefix + answers.m2,
      m3: prefix + answers.m3,
      m4: prefix + answers.m4,
      m5: prefix + answers.m5,
    };
  };

  const handleExportData = () => {
    if (schools.length === 0) {
      alert('Tidak ada data sekolah untuk diekspor.');
      return;
    }
    setIsExporting(true);
    setShowExportModal(false);

    setTimeout(() => {
      let outputContent = '';
      let filename = `Laporan_Survei_BSAN_${Date.now()}`;
      
      // Filter list based on limit
      const exportList = rowLimit > 0 ? schools.slice(0, rowLimit) : schools;

      if (exportFormat === 'json') {
        const jsonOutput = exportList.map(s => {
          const obj: Record<string, any> = {};
          const surveyAnswers = getMockAnswers(s.nama);
          selectedColumns.forEach(col => {
            if (col.startsWith('m')) {
              obj[col] = s.status === 'belum' ? 'Belum mengisi' : (surveyAnswers as any)[col];
            } else {
              obj[col] = (s as any)[col];
            }
          });
          return obj;
        });
        outputContent = JSON.stringify(jsonOutput, null, 2);
        filename += '.json';
      } else {
        const separator = exportFormat === 'excel' ? '\t' : ',';
        const ext = exportFormat === 'excel' ? 'xls' : 'csv';
        filename += `.${ext}`;

        // Header Title
        outputContent += `LAPORAN HASIL EVALUASI IMPLEMENTASI BSAN${separator}\n`;
        outputContent += `Dinas Pendidikan Provinsi Jawa Timur${separator}\n`;
        outputContent += `Wilayah Filter: ${selectedKab || 'Semua Kabupaten'} - ${selectedKec || 'Semua Kecamatan'}${separator}\n`;
        outputContent += `Waktu Cetak: ${new Date().toLocaleString('id-ID')}${separator}\n`;
        outputContent += `Total Sasaran: ${exportList.length} Sekolah | Partisipasi: ${rate}%${separator}\n\n`;

        // Column Titles
        const headerTitles = selectedColumns.map(colId => {
          const opt = columnOptions.find(o => o.id === colId);
          return `"${opt ? opt.label : colId}"`;
        });
        outputContent += headerTitles.join(separator) + '\n';

        // Data Rows
        exportList.forEach(s => {
          const surveyAnswers = getMockAnswers(s.nama);
          const rowData = selectedColumns.map(colId => {
            if (colId.startsWith('m')) {
              if (s.status === 'belum') return '"Belum mengisi"';
              return `"${(surveyAnswers as any)[colId]}"`;
            }
            const val = (s as any)[colId] || '';
            return `"${val}"`;
          });
          outputContent += rowData.join(separator) + '\n';
        });
      }

      const mimeType = exportFormat === 'json' ? 'application/json' : 'text/csv;charset=utf-8;';
      const blob = new Blob([outputContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setShowToast('Berkas laporan berhasil diekspor');
      setTimeout(() => setShowToast(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-status-sudah text-white px-4 py-3 shadow-xl text-xs font-semibold animate-scale-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-card bg-surface p-6 shadow-card border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">Pusat Laporan & Ekspor Data</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Saring data sekolah, lihat progres survei secara langsung, dan lakukan penyesuaian ekspor.
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-5 py-3 text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-smooth cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Ekspor Laporan</span>
        </button>
      </div>

      {/* Loading Modal Overlay */}
      {isExporting && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 animate-fade-in">
          <div className="bg-surface p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-border">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
            <h3 className="text-lg font-bold text-text-primary font-display mb-2">Memproses Dokumen</h3>
            <p className="text-sm text-text-secondary text-center">Menyusun baris dan kolom yang disesuaikan...</p>
          </div>
        </div>,
        document.body
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-card bg-surface border border-border shadow-card flex items-center space-x-4">
          <div className="p-3.5 bg-primary/8 text-primary rounded-2xl">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Sekolah Terfilter</span>
            <h4 className="text-xl font-bold text-text-primary mt-0.5">
              <AnimatedCounter value={total} suffix=" SD" />
            </h4>
          </div>
        </div>
        <div className="p-5 rounded-card bg-surface border border-border shadow-card flex items-center space-x-4">
          <div className="p-3.5 bg-status-sudah/8 text-status-sudah rounded-2xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-status-sudah uppercase tracking-wider block">Selesai Mengisi</span>
            <h4 className="text-xl font-bold text-status-sudah mt-0.5">
              <AnimatedCounter value={sudah} suffix=" SD" />
            </h4>
          </div>
        </div>
        <div className="p-5 rounded-card bg-surface border border-border shadow-card flex items-center space-x-4">
          <div className="p-3.5 bg-accent/8 text-accent rounded-2xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">Persentase Partisipasi</span>
            <h4 className="text-xl font-bold text-accent mt-0.5">
              <AnimatedCounter value={rate} suffix="%" />
            </h4>
          </div>
        </div>
      </div>

      {/* Filters & Direct Table View */}
      <div className="rounded-card bg-surface shadow-card border border-border overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-border bg-bg/20 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-text-secondary uppercase">Kabupaten / Kota</label>
            <CustomSelect
              value={selectedKab}
              onChange={(val) => { setSelectedKab(val); setSelectedKec(''); setCurrentPage(1); }}
              options={[
                { value: '', label: 'Semua Kabupaten (Target Jatim)' },
                ...KABUPATEN_LIST.map(k => ({ value: k.name, label: k.name }))
              ]}
              placeholder="Semua Kabupaten (Target Jatim)"
              size="md"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-text-secondary uppercase">Kecamatan</label>
            <CustomSelect
              value={selectedKec}
              onChange={(val) => { setSelectedKec(val); setCurrentPage(1); }}
              options={[
                { value: '', label: 'Semua Kecamatan' },
                ...KECAMATAN_LIST.map(k => ({ value: `Kec. ${k}`, label: `Kec. ${k}` }))
              ]}
              placeholder="Semua Kecamatan"
              size="md"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-text-secondary uppercase">Status Pengisian</label>
            <CustomSelect
              value={selectedStatus}
              onChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'sudah', label: 'Lengkap Mengisi' },
                { value: 'sebagian', label: 'Sebagian Mengisi' },
                { value: 'belum', label: 'Belum Mengisi' },
              ]}
              placeholder="Semua Status"
              size="md"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-bg/40 border-b border-border">
                <th className="py-3 px-5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">NPSN</th>
                <th className="py-3 px-5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Nama Sekolah</th>
                <th className="py-3 px-5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Kecamatan</th>
                <th className="py-3 px-5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Akreditasi</th>
                <th className="py-3 px-5 text-[10px] font-bold text-text-secondary uppercase tracking-wider text-center">Status</th>
                <th className="py-3 px-5 text-[10px] font-bold text-text-secondary uppercase tracking-wider text-center">Siswa</th>
                <th className="py-3 px-5 text-[10px] font-bold text-text-secondary uppercase tracking-wider text-center">Guru</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-secondary animate-pulse">Memuat data...</td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-secondary">Tidak ada data sekolah terfilter.</td>
                </tr>
              ) : (
                paged.map((s, idx) => (
                  <tr key={s.id || idx} className="border-b border-border/40 hover:bg-bg/10">
                    <td className="py-3.5 px-5 font-mono text-primary font-semibold">{s.npsn}</td>
                    <td className="py-3.5 px-5 font-semibold text-text-primary">{s.nama}</td>
                    <td className="py-3.5 px-5 text-text-secondary">{s.kecamatan}</td>
                    <td className="py-3.5 px-5 text-text-secondary">{s.akreditasi}</td>
                    <td className="py-3.5 px-5 text-center">{statusBadge(s.status)}</td>
                    <td className="py-3.5 px-5 text-center text-text-primary font-medium">{s.totalSiswa}</td>
                    <td className="py-3.5 px-5 text-center text-text-primary font-medium">{s.totalGuru}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border/50 bg-bg/30">
            <p className="text-[10px] text-text-secondary font-medium">
              Hal. {currentPage} dari {totalPages} ({schools.length} total)
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

      {/* Export Configuration Modal Dialog */}
      {showExportModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full border border-border flex flex-col h-[85vh] animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-border bg-bg/50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm">Sesuaikan & Ekspor Laporan</h3>
                  <p className="text-[10px] text-text-secondary font-medium">Atur format berkas, filter data, dan kolom sebelum diunduh.</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-border/40 transition-smooth"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
              {/* Export Type Selection */}
              <div className="space-y-2">
                <label className="font-bold text-text-secondary uppercase">Jenis Data Ekspor</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setExportType('metadata');
                      setSelectedColumns(['npsn', 'nama', 'kecamatan', 'status', 'akreditasi', 'totalSiswa', 'totalGuru']);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-smooth cursor-pointer ${
                      exportType === 'metadata'
                        ? 'border-primary bg-primary/5 text-text-primary font-bold shadow-sm'
                        : 'border-border bg-bg/40 text-text-secondary hover:bg-bg'
                    }`}
                  >
                    <p className="text-xs">Profil & Status Sekolah</p>
                    <p className="text-[10px] text-text-secondary/70 font-medium mt-1">Data master wilayah, akreditasi, dan jumlah sarana siswa.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExportType('answers');
                      setSelectedColumns(['npsn', 'nama', 'kecamatan', 'm1', 'm2', 'm3', 'm4', 'm5']);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-smooth cursor-pointer ${
                      exportType === 'answers'
                        ? 'border-primary bg-primary/5 text-text-primary font-bold shadow-sm'
                        : 'border-border bg-bg/40 text-text-secondary hover:bg-bg'
                    }`}
                  >
                    <p className="text-xs">Rincian Jawaban Kuesioner</p>
                    <p className="text-[10px] text-text-secondary/70 font-medium mt-1">Skor per modul & agregat indikator survei sekolah.</p>
                  </button>
                </div>
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <label className="font-bold text-text-secondary uppercase">Format Berkas Unduhan</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'excel', label: 'MS Excel (.xls)', desc: 'Tabular format' },
                    { id: 'csv', label: 'CSV Comma', desc: 'Flat text format' },
                    { id: 'json', label: 'JSON Object', desc: 'Web developers' }
                  ].map(fmt => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setExportFormat(fmt.id as any)}
                      className={`p-3 rounded-xl border text-center transition-smooth cursor-pointer ${
                        exportFormat === fmt.id
                          ? 'border-primary bg-primary/8 text-primary font-bold shadow-sm'
                          : 'border-border bg-bg/40 text-text-secondary hover:bg-bg'
                      }`}
                    >
                      <p className="text-[11px]">{fmt.label}</p>
                      <p className="text-[8px] text-text-secondary/70 mt-0.5">{fmt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row Limit Options */}
              <div className="space-y-2">
                <label className="font-bold text-text-secondary uppercase">Batasi Jumlah Baris (Sekolah)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 0, label: 'Semua Data' },
                    { val: 10, label: '10 Sekolah' },
                    { val: 50, label: '50 Sekolah' },
                    { val: 100, label: '100 Sekolah' }
                  ].map(lim => (
                    <button
                      key={lim.val}
                      type="button"
                      onClick={() => setRowLimit(lim.val)}
                      className={`p-2 rounded-lg border text-center transition-smooth cursor-pointer ${
                        rowLimit === lim.val
                          ? 'border-primary bg-primary/5 text-primary font-bold'
                          : 'border-border bg-bg/40 text-text-secondary hover:bg-bg'
                      }`}
                    >
                      <span className="text-[10px]">{lim.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Columns Selector Checklist */}
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="font-bold text-text-secondary uppercase block">Pilih Kolom Ekspor</label>
                <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                  {columnOptions
                    .filter(o => o.category === (exportType === 'metadata' ? 'metadata' : 'survey') || o.id === 'npsn' || o.id === 'nama' || o.id === 'kecamatan')
                    .map(col => {
                      const isSelected = selectedColumns.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => toggleColumn(col.id)}
                          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl border text-left transition-smooth cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-text-primary font-semibold'
                              : 'border-border bg-bg/40 text-text-secondary hover:bg-bg'
                          }`}
                        >
                          <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${isSelected ? 'border-primary bg-primary text-white' : 'border-border'}`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span className="text-[10px] leading-tight truncate">{col.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-bg/30 flex justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-surface text-text-secondary text-xs font-semibold hover:bg-bg transition-smooth"
              >
                Batal
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center space-x-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white px-5 py-2 text-xs font-bold shadow-md transition-smooth active:scale-95 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Laporan</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
