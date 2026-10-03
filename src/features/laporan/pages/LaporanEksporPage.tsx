/**
 * @module features/laporan/pages
 * @description Generate & download laporan CSV dengan filter wilayah — format konsisten BSAN.
 * @tables laporan_export, satuan_pendidikan, responden_survey, sel_sesi_observasi
 * @queries database/queries/laporan_export.sql → semua query
 * @api POST /api/laporan/generate, GET /api/laporan/download/:id, GET /api/laporan/history
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { database, schoolsData } from '../../../shared/data/data-source';
import {
  Download, CheckCircle2, Building2, ChevronLeft, ChevronRight,
  X, FileText, Users, BarChart3, Table2, Brain, Grid3X3, Layers
} from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import CustomSelect from '../../../shared/components/CustomSelect';
import { notifyToast } from '../../../shared/components/NotificationToast';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import ConnectionErrorCard from '../../../shared/components/ConnectionErrorCard';
import {
  buildBsanCsvHeader, buildCsvRow, triggerDownload, safeFilename, dateStamp
} from '../../../shared/utils/exportCSV';

// ─── Export type definitions ──────────────────────────────────

type ExportType =
  | 'survei_bsan_lengkap'
  | 'observasi_sel'
  | 'profil_sekolah'
  | 'rekapitulasi_kecamatan'
  | 'matriks_kuadran';

interface ExportOption {
  id: ExportType;
  icon: typeof FileText;
  label: string;
  desc: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'survei_bsan_lengkap',
    icon: FileText,
    label: '1. Hasil Survei Implementasi BSAN (Data Mentah Lengkap)',
    desc: 'Seluruh data kuesioner dari pengajar & kepala sekolah (Identitas, NPSN, Pelatihan, Media, dll).',
  },
  {
    id: 'observasi_sel',
    icon: Brain,
    label: '2. Hasil Observasi SEL (Social-Emotional Learning)',
    desc: 'Data penilaian observasi 5 dimensi SEL, skor guru & murid, dan status cross-validasi.',
  },
  {
    id: 'profil_sekolah',
    icon: Building2,
    label: '3. Profil & Status Pengisian Sekolah Sasaran',
    desc: 'Data master sekolah sasaran BSAN beserta status progres pengisian survei.',
  },
  {
    id: 'rekapitulasi_kecamatan',
    icon: BarChart3,
    label: '4. Rekapitulasi Partisipasi Survei per Kecamatan',
    desc: 'Ringkasan statistik tingkat partisipasi pengisian survei per kecamatan.',
  },
  {
    id: 'matriks_kuadran',
    icon: Grid3X3,
    label: '5. Matriks Evaluasi 4 Kuadran (Kesiapan vs Implementasi)',
    desc: 'Data posisi evaluasi 4 kuadran (kesiapan sarana vs tingkat implementasi modul).',
  },
];

// ─── Main Component ───────────────────────────────────────────

export default function LaporanEkspor() {
  const [selectedKab, setSelectedKab] = useState<string>('');
  const [selectedKec, setSelectedKec] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<ExportType>('survei_bsan_lengkap');
  const [isExporting, setIsExporting] = useState(false);

  // ── Data queries ──
  const { data: dbKabupatenList = [] } = useQuery({
    queryKey: ['db-kabupaten-laporan'],
    queryFn: () => database.getKabupatenList(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: dbKecamatanList = [] } = useQuery({
    queryKey: ['db-kecamatan-laporan', selectedKab],
    queryFn: () => database.getKecamatanList(selectedKab),
    staleTime: 5 * 60 * 1000,
  });

  const { data: schools = [], isLoading, isError, error: fetchError, refetch } = useQuery({
    queryKey: ['schools-laporan', selectedKab, selectedKec, selectedStatus],
    queryFn: () => database.getSchools({
      kabupaten: selectedKab || undefined,
      kecamatan: selectedKec || undefined,
      status: selectedStatus || undefined,
    }),
  });

  // Respondents data for "survei_bsan_lengkap" export
  const { data: exportFullData } = useQuery({
    queryKey: ['respondents-laporan-full', selectedKab],
    queryFn: () => apiClient.responden.getExportFull(selectedKab ? parseInt(selectedKab) : undefined),
    enabled: showExportModal && selectedExportType === 'survei_bsan_lengkap',
  });

  // SEL Scores data for "observasi_sel" export
  const { data: selScores = [] } = useQuery({
    queryKey: ['sel-scores-laporan', selectedKab],
    queryFn: () => database.getSELScores({ kabupaten: selectedKab || undefined }),
    enabled: showExportModal && selectedExportType === 'observasi_sel',
  });

  // Matriks data for "matriks_kuadran" export
  const { data: matriksData = [] } = useQuery({
    queryKey: ['matriks-data-laporan', selectedKab],
    queryFn: () => database.getMatriksKuadranData({ kabupaten: selectedKab || undefined }),
    enabled: showExportModal && selectedExportType === 'matriks_kuadran',
  });

  // Helper NPSN lookup from schoolsData
  const getNpsn = (sekolahNama: string): string => {
    const found = schoolsData.find(
      s => s.nama.toLowerCase().trim() === sekolahNama.toLowerCase().trim()
    );
    return found?.npsn || '';
  };

  // ── Metrics ──
  const total = schools.length;
  const sudah = schools.filter(s => s.status === 'sudah').length;
  const rate = total > 0 ? Math.round((sudah / total) * 100) : 0;

  // ── Pagination ──
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

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      sudah: { label: 'Lengkap', cls: 'bg-status-sudah/10 text-status-sudah' },
      sebagian: { label: 'Sebagian', cls: 'bg-status-sebagian/10 text-status-sebagian' },
      belum: { label: 'Belum Mengisi', cls: 'bg-status-belum/10 text-status-belum' },
    };
    const s = map[status] || map.belum;
    return <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold ${s.cls}`}>{s.label}</span>;
  };

  // ── Export builders ──

  const buildSurveiBsanLengkapCsv = () => {
    const wilayah = [selectedKab || 'Semua Kabupaten', selectedKec || 'Semua Kecamatan'].join(' — ');
    const fullData = exportFullData?.data;
    const respondents = fullData?.respondents || [];
    const questions = fullData?.questions || [];
    const answersMap = fullData?.answers || {};

    let out = buildBsanCsvHeader({
      title: 'DATA HASIL SURVEI IMPLEMENTASI BSAN (RAW RESPONDEN)',
      wilayah,
      totalInfo: `Total Responden: ${respondents.length}`,
    });

    const headers = [
      'Timestamp', 'No.', 'NPSN Sekolah', 'Nama Sekolah', 'Nama Responden', 'Jenis Kelamin', 'Posisi',
      'Kabupaten', 'Kecamatan',
      'Penerima Modul BSAN', 'Penyelenggara Pelatihan',
      'Status Implementasi', 'Kelas Mengajar'
    ];
    
    // Append all question texts to header
    questions.forEach((q: any) => headers.push(q.teks_pertanyaan));
    
    out += buildCsvRow(headers) + '\n';
    
    respondents.forEach((r: any, i: number) => {
      const ts = r.submitted_at || new Date().toISOString().replace('T', ' ').substring(0, 19);
      const rowData = [
        ts,
        i + 1,
        r.npsn || getNpsn(r.sekolah),
        r.sekolah,
        r.nama,
        r.jenis_kelamin,
        r.posisi,
        r.kabupaten,
        r.kecamatan,
        r.penerima_modul,
        r.penyelenggara_pelatihan || '',
        r.status_implementasi || '',
        r.kelas_mengajar || '',
      ];
      
      // Append answers for each question
      const respondentAnswers = answersMap[r.responden_id] || {};
      questions.forEach((q: any) => {
        rowData.push(respondentAnswers[q.id] || '');
      });
      
      out += buildCsvRow(rowData) + '\n';
    });

    return out;
  };

  const buildObservasiSelCsv = () => {
    const wilayah = selectedKab || 'Semua Kabupaten';
    let out = buildBsanCsvHeader({
      title: 'DATA HASIL OBSERVASI SOCIAL-EMOTIONAL LEARNING (SEL) BSAN',
      wilayah,
      totalInfo: `Total Sekolah Diobservasi: ${selScores.length}`,
    });

    out += buildCsvRow([
      'Timestamp', 'No.', 'NPSN', 'Nama Sekolah', 'Kabupaten', 'Kecamatan', 'Tanggal Observasi',
      'Skor Guru (1-4)', 'Skor Murid (1-4)', 'Skor Total (1-4)',
      'Kesadaran Diri', 'Regulasi Emosi', 'Kesadaran Sosial', 'Keterampilan Relasi', 'Tanggung Jawab',
      'Skor Kuesioner BSAN (%)', 'Status Cross Validasi'
    ]) + '\n';

    selScores.forEach((s, i) => {
      const dimMap: Record<string, string> = {};
      s.dimensi.forEach(d => { dimMap[d.dimensi] = d.rataRata?.toFixed(2) || '0.00'; });
      const klaim = s.kuisionerScore >= 60;
      const selOk = s.totalRata >= 2.5;
      const status = klaim && selOk ? 'Unggul' : !klaim && selOk ? 'Hidden Gem' : klaim && !selOk ? 'Overclaimer' : 'Intervensi';
      const ts = s.tanggal ? `${s.tanggal} 08:00:00` : new Date().toISOString().replace('T', ' ').substring(0, 19);

      out += buildCsvRow([
        ts,
        i + 1,
        getNpsn(s.sekolahNama),
        s.sekolahNama,
        s.kabupaten,
        s.kecamatan,
        s.tanggal,
        s.guruTotal.toFixed(2),
        s.muridTotal.toFixed(2),
        s.totalRata.toFixed(2),
        dimMap['kesadaran_diri'] || '0.00',
        dimMap['regulasi_emosi'] || '0.00',
        dimMap['kesadaran_sosial'] || '0.00',
        dimMap['keterampilan_relasi'] || '0.00',
        dimMap['tanggung_jawab'] || '0.00',
        s.kuisionerScore,
        status,
      ]) + '\n';
    });

    return out;
  };

  const buildProfilSekolahCsv = () => {
    const wilayah = [selectedKab || 'Semua Kabupaten', selectedKec || 'Semua Kecamatan'].join(' — ');
    let out = buildBsanCsvHeader({
      title: 'PROFIL & STATUS PENGISIAN SEKOLAH SASARAN BSAN',
      wilayah,
      totalInfo: `Total Sekolah: ${schools.length} | Partisipasi: ${rate}%`,
    });

    out += buildCsvRow([
      'Timestamp', 'No.', 'NPSN', 'Nama Sekolah', 'Kabupaten', 'Kecamatan',
      'Status Pengisian', 'Akreditasi', 'Jumlah Siswa', 'Jumlah Guru',
      'Alamat', 'Email', 'Telepon',
    ]) + '\n';
    schools.forEach((s, i) => {
      const statusLabel = s.status === 'sudah' ? 'Lengkap' : s.status === 'sebagian' ? 'Sebagian' : 'Belum Mengisi';
      const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
      out += buildCsvRow([
        ts,
        i + 1,
        s.npsn,
        s.nama,
        s.kabupaten,
        s.kecamatan,
        statusLabel,
        s.akreditasi,
        s.totalSiswa,
        s.totalGuru,
        s.alamat,
        s.email,
        s.telepon,
      ]) + '\n';
    });

    return out;
  };

  const buildRekapCsv = () => {
    const wilayah = selectedKab || 'Semua Kabupaten';

    const groupMap: Record<string, { kabupaten: string; total: number; sudah: number; sebagian: number; belum: number }> = {};
    schools.forEach(s => {
      const key = `${s.kabupaten}||${s.kecamatan}`;
      if (!groupMap[key]) groupMap[key] = { kabupaten: s.kabupaten, total: 0, sudah: 0, sebagian: 0, belum: 0 };
      groupMap[key].total += 1;
      if (s.status === 'sudah') groupMap[key].sudah += 1;
      else if (s.status === 'sebagian') groupMap[key].sebagian += 1;
      else groupMap[key].belum += 1;
    });

    let out = buildBsanCsvHeader({
      title: 'REKAPITULASI PARTISIPASI SURVEI BSAN PER KECAMATAN',
      wilayah,
      totalInfo: `Total Sekolah: ${schools.length} | Partisipasi: ${rate}%`,
    });

    out += buildCsvRow([
      'Timestamp', 'No.', 'Kabupaten', 'Kecamatan',
      'Total Sekolah', 'Sudah Mengisi', 'Sebagian Mengisi', 'Belum Mengisi',
      'Partisipasi (%)',
    ]) + '\n';
    Object.entries(groupMap).forEach(([key, g], idx) => {
      const kecamatan = key.split('||')[1];
      const pct = g.total > 0 ? Math.round((g.sudah / g.total) * 100) : 0;
      const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
      out += buildCsvRow([
        ts,
        idx + 1, g.kabupaten, kecamatan,
        g.total, g.sudah, g.sebagian, g.belum, `${pct}%`,
      ]) + '\n';
    });

    return out;
  };

  const buildMatriksKuadranCsv = () => {
    const wilayah = selectedKab || 'Semua Wilayah';
    let out = buildBsanCsvHeader({
      title: 'MATRIKS EVALUASI 4 KUADRAN (KESIAPAN VS IMPLEMENTASI) BSAN',
      wilayah,
      totalInfo: `Total Data: ${matriksData.length}`,
    });

    const getKuadranLabel = (impl: number, read: number): string =>
      impl >= 60 && read >= 60 ? 'Kuadran I — Mandiri'
        : impl < 60 && read >= 60 ? 'Kuadran II — Potensial'
          : impl >= 60 && read < 60 ? 'Kuadran III — Perlu Sarana'
            : 'Kuadran IV — Intervensi';

    out += buildCsvRow([
      'Timestamp', 'No.', 'NPSN', 'Nama Sekolah / Kecamatan',
      'Tingkat Kesiapan (%)', 'Tingkat Implementasi (%)',
      'Status', 'Posisi Kuadran',
    ]) + '\n';

    matriksData.forEach((p, i) => {
      const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
      out += buildCsvRow([
        ts,
        i + 1,
        getNpsn(p.name),
        p.name,
        p.readiness,
        p.implementation,
        p.status,
        getKuadranLabel(p.implementation, p.readiness),
      ]) + '\n';
    });

    return out;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setShowExportModal(false);

    try {
      await new Promise(r => setTimeout(r, 800)); // UX delay

      let csv = '';
      let filename = '';
      const stamp = dateStamp();
      const kabSafe = safeFilename(selectedKab || 'SemuaWilayah');

      switch (selectedExportType) {
        case 'survei_bsan_lengkap':
          csv = buildSurveiBsanLengkapCsv();
          filename = `Hasil_Survei_Lengkap_${kabSafe}_${stamp}.csv`;
          break;
        case 'observasi_sel':
          csv = buildObservasiSelCsv();
          filename = `Hasil_Observasi_SEL_BSAN_${kabSafe}_${stamp}.csv`;
          break;
        case 'profil_sekolah':
          csv = buildProfilSekolahCsv();
          filename = `Profil_Sekolah_BSAN_${kabSafe}_${stamp}.csv`;
          break;
        case 'rekapitulasi_kecamatan':
          csv = buildRekapCsv();
          filename = `Rekapitulasi_Kecamatan_BSAN_${kabSafe}_${stamp}.csv`;
          break;
        case 'matriks_kuadran':
          csv = buildMatriksKuadranCsv();
          filename = `Matriks_Kuadran_BSAN_${kabSafe}_${stamp}.csv`;
          break;
      }

      triggerDownload(csv, filename);
      notifyToast({
        type: 'success',
        title: 'Ekspor Berhasil',
        message: `${filename} telah diunduh.`,
      });
    } catch (err) {
      console.error('Export error', err);
      notifyToast({ type: 'error', title: 'Ekspor Gagal', message: 'Terjadi kesalahan saat ekspor.' });
    } finally {
      setIsExporting(false);
    }
  };

  if (isError) {
    return (
      <ConnectionErrorCard
        title="Gagal Memuat Data Laporan"
        message={(fetchError as any)?.message || 'Gagal terhubung ke server.'}
        onRetry={() => refetch()}
      />
    );
  }

  // ── Render ──
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-card bg-surface p-6 shadow-card border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">Pusat Laporan & Ekspor Data</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Pilih jenis data yang ingin diekspor (Survei BSAN, Observasi SEL, Profil Sekolah, Matriks Kuadran, Rekapitulasi).
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          disabled={isExporting}
          className="flex items-center space-x-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-5 py-3 text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-smooth cursor-pointer disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          <span>Ekspor Data</span>
        </button>
      </div>

      {/* Exporting overlay */}
      {isExporting && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 animate-fade-in">
          <div className="bg-surface p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-border">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
            <h3 className="text-lg font-bold text-text-primary font-display mb-2">Menyusun Berkas CSV</h3>
            <p className="text-sm text-text-secondary text-center">Memformat kolom dan baris data...</p>
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
            <Table2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">Persentase Partisipasi</span>
            <h4 className="text-xl font-bold text-accent mt-0.5">
              <AnimatedCounter value={rate} suffix="%" />
            </h4>
          </div>
        </div>
      </div>

      {/* Filters + Table */}
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
                ...dbKabupatenList.map(k => ({ value: k.nama, label: k.nama }))
              ]}
              placeholder="Semua Kabupaten"
              enableSearch={true}
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
                ...dbKecamatanList.map(k => ({ value: k.nama, label: `Kec. ${k.nama.replace(/^Kec\.\s*/i, '')}` }))
              ]}
              placeholder="Semua Kecamatan"
              enableSearch={true}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-bg/40 border-b border-border">
                <th className="py-3 px-5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Timestamp</th>
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
                  <td colSpan={8} className="py-12 text-center">
                    <ThreeDotsLoader text="Memuat data laporan sekolah..." />
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-secondary">Tidak ada data sekolah terfilter.</td>
                </tr>
              ) : (
                paged.map((s, idx) => (
                  <tr key={s.id || idx} className="border-b border-border/40 hover:bg-bg/10">
                    <td className="py-3.5 px-5 font-mono text-text-secondary text-[11px] whitespace-nowrap">{s.lastUpdated || '2026-10-03 08:00:00'}</td>
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
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {getPageRange().map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-smooth ${currentPage === p ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-bg'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Simple Vertical Column Export Modal (Clean, Minimal, Mobile Friendly) ── */}
      {showExportModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full border border-border flex flex-col animate-scale-in max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-border bg-bg/40 rounded-t-2xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm sm:text-base font-display">Pilih Data Ekspor</h3>
                  <p className="text-[11px] text-text-secondary font-medium mt-0.5">
                    Wilayah: <strong>{selectedKab || 'Semua Kabupaten'}</strong> {selectedKec ? `— Kec. ${selectedKec}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-border/40 transition-smooth">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body — Stacked 1 Column List Downward (Simple & Mobile-Friendly, No Color Badges) */}
            <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto">
              {EXPORT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = selectedExportType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedExportType(opt.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30'
                        : 'border-border bg-bg/30 hover:bg-bg hover:border-border/80'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                      isSelected ? 'bg-primary text-white' : 'bg-border/30 text-text-secondary'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-xs sm:text-sm leading-snug ${
                        isSelected ? 'text-primary' : 'text-text-primary'
                      }`}>
                        {opt.label}
                      </h4>
                      <p className="text-text-secondary text-[11px] mt-0.5 leading-relaxed line-clamp-2">
                        {opt.desc}
                      </p>
                    </div>

                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-5 border-t border-border bg-bg/30 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
              <button onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-surface text-text-secondary text-xs font-semibold hover:bg-bg transition-smooth">
                Batal
              </button>
              <button onClick={handleExport}
                className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-5 py-2 text-xs font-bold shadow-md transition-smooth active:scale-95 cursor-pointer">
                <Download className="h-4 w-4" />
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
