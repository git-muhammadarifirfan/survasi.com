/**
 * @module features/laporan/pages
 * @description Generate & download laporan Excel (.xlsx Multi-sheet) & CSV (Data Mentah UTF-8 BOM)
 *   dengan filter wilayah — format konsisten BSAN.
 * @tables laporan_export, satuan_pendidikan, responden_survey, sel_sesi_observasi
 * @api GET /api/responden/export-full, GET /api/sel/export
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { database, schoolsData, KABUPATEN_NAME_TO_ID } from '../../../shared/data/data-source';
import { apiClient } from '../../../shared/services/api-client';
import {
  Download, CheckCircle2, Building2, ChevronLeft, ChevronRight,
  X, FileText, BarChart3, Table2, Brain, Grid3X3, FileSpreadsheet, Loader2
} from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import CustomSelect from '../../../shared/components/CustomSelect';
import { notifyToast } from '../../../shared/components/NotificationToast';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import ConnectionErrorCard from '../../../shared/components/ConnectionErrorCard';
import {
  buildBsanCsvHeader, buildCsvRow, triggerDownload, safeFilename, dateStamp
} from '../../../shared/utils/exportCSV';
import {
  downloadXlsxWorkbook, createSurveiBsanExcel, createObservasiSelExcel,
  createProfilSekolahExcel, createRekapKecamatanExcel, createMatriksKuadranExcel,
  cleanCellValue, formatTimestampISO
} from '../../../shared/utils/exportExcel';

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
    desc: 'Seluruh data kuesioner dari pengajar & kepala sekolah (Identitas, NPSN, Pelatihan, Media, Q1-Q34+).',
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
  const [exportFormatLoading, setExportFormatLoading] = useState<'excel' | 'csv' | null>(null);

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

  // ── Single Dataset Fetcher (No query duplication) ──
  const fetchExportDataset = async (type: ExportType) => {
    const kabIdNumber = selectedKab ? KABUPATEN_NAME_TO_ID[selectedKab] : undefined;

    if (type === 'survei_bsan_lengkap') {
      const res = await apiClient.responden.getExportFull(kabIdNumber);
      if (!res || !res.success) {
        throw new Error('Gagal mengambil data survei BSAN dari server.');
      }
      return res.data;
    }

    if (type === 'observasi_sel') {
      const res = await apiClient.sel.getExportFull(kabIdNumber);
      if (!res || !res.success) {
        throw new Error('Gagal mengambil data observasi SEL dari server.');
      }
      return res.data;
    }

    if (type === 'profil_sekolah' || type === 'rekapitulasi_kecamatan') {
      const data = await database.getSchools({
        kabupaten: selectedKab || undefined,
        kecamatan: selectedKec || undefined,
        status: selectedStatus || undefined,
      });
      return data;
    }

    if (type === 'matriks_kuadran') {
      const data = await database.getMatriksKuadranData({ kabupaten: selectedKab || undefined });
      return data;
    }

    throw new Error('Tipe ekspor tidak dikenali.');
  };

  // ── CSV Exporter Builders (Data Mentah UTF-8 BOM) ──

  const buildSurveiBsanLengkapCsv = (dataset: any) => {
    const respondents = dataset?.respondents || [];
    const questions = dataset?.questions || [];
    const answersMap = dataset?.answers || {};

    let out = '';
    const headers = ['Timestamp'];
    questions.forEach((q: any) => headers.push(cleanCellValue(q.teks_pertanyaan)));
    out += buildCsvRow(headers) + '\n';

    respondents.forEach((r: any) => {
      const ts = formatTimestampISO(r.submitted_at);
      const rowData = [ts];
      const respondentAnswers = answersMap[r.responden_id] || {};
      questions.forEach((q: any) => {
        rowData.push(cleanCellValue(respondentAnswers[q.id]));
      });
      out += buildCsvRow(rowData) + '\n';
    });

    return out;
  };

  const buildObservasiSelCsv = (dataset: any) => {
    const sessions = dataset?.sessions || [];
    const questions = dataset?.questions || [];
    const answersMap = dataset?.answers || {};

    let out = '';
    const headers = [
      'Timestamp', 'No.', 'NPSN', 'Nama Sekolah', 'Kabupaten', 'Kecamatan', 'Tanggal Observasi',
      'Lokasi Diamati', 'Waktu Pengamatan', 'Kelas Diamati', 'Mata Pelajaran',
      'Guru Inisial', 'Guru JK',
      'Jangkauan Siswa', 'Jumlah Siswa (L/P)', 'Siswa Disabilitas (L/P)',
      'Observer',
      'Skor Guru Total (1-4)', 'Skor Murid Total (1-4)', 'Skor Total Sesi (1-4)',
      'Kesadaran Diri (Avg)', 'Regulasi Emosi (Avg)', 'Kesadaran Sosial (Avg)', 'Keterampilan Relasi (Avg)', 'Tanggung Jawab (Avg)',
      'Skor Kuesioner BSAN (%)'
    ];

    questions.forEach((q: any) => {
      headers.push(`[${cleanCellValue(q.dimensi_nama).toUpperCase()} - ${cleanCellValue(q.subjek).toUpperCase()}] ${cleanCellValue(q.teks)} (SKOR)`);
      headers.push(`[${cleanCellValue(q.dimensi_nama).toUpperCase()} - ${cleanCellValue(q.subjek).toUpperCase()}] ${cleanCellValue(q.teks)} (CATATAN)`);
    });

    out += buildCsvRow(headers) + '\n';

    sessions.forEach((s: any, i: number) => {
      const ts = formatTimestampISO(s.tanggal ? `${s.tanggal} 08:00:00` : null);

      let jangkauanLabel = '';
      if (s.jangkauan_siswa === 1) jangkauanLabel = 'Seluruh Siswa di Sekolah';
      else if (s.jangkauan_siswa === 2) jangkauanLabel = 'Seluruh Siswa di Kelas';
      else if (s.jangkauan_siswa === 3) jangkauanLabel = 'Sebagian Besar Siswa';
      else if (s.jangkauan_siswa === 4) jangkauanLabel = `Sebagian Kecil Siswa (${s.jumlah_siswa_sebagian_kecil} Siswa)`;

      const safeParseArray = (val: any) => {
        if (!val) return '';
        try {
          const parsed = typeof val === 'string' ? JSON.parse(val) : val;
          return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
        } catch {
          return String(val);
        }
      };

      const rowData = [
        ts,
        i + 1,
        cleanCellValue(s.npsn || getNpsn(s.sekolah_nama)),
        cleanCellValue(s.sekolah_nama),
        cleanCellValue(s.kabupaten),
        cleanCellValue(s.kecamatan),
        cleanCellValue(s.tanggal),
        cleanCellValue(safeParseArray(s.lokasi_diamati)),
        cleanCellValue(safeParseArray(s.waktu_pengamatan)),
        cleanCellValue(s.kelas_diamati),
        cleanCellValue(s.mata_pelajaran),
        cleanCellValue(s.guru_inisial),
        cleanCellValue(s.guru_jk),
        jangkauanLabel,
        `${s.jumlah_siswa_l || 0} / ${s.jumlah_siswa_p || 0}`,
        `${s.siswa_disabilitas_l || 0} / ${s.siswa_disabilitas_p || 0}`,
        cleanCellValue(s.observer_nama),
        s.guru_total || '0',
        s.murid_total || '0',
        s.total_rata || '0',
        s.kesadaran_diri || '0',
        s.regulasi_emosi || '0',
        s.kesadaran_sosial || '0',
        s.keterampilan_relasi || '0',
        s.tanggung_jawab || '0',
        s.kuisioner_score || '0'
      ];

      const respondentAnswers = answersMap[s.id] || {};
      questions.forEach((q: any) => {
        const ans = respondentAnswers[q.id];
        rowData.push(ans?.skor !== undefined && ans?.skor !== null ? ans.skor : '');
        rowData.push(cleanCellValue(ans?.catatan));
      });

      out += buildCsvRow(rowData) + '\n';
    });

    return out;
  };

  const buildProfilSekolahCsv = (schoolList: any[]) => {
    const wilayah = [selectedKab || 'Semua Kabupaten', selectedKec || 'Semua Kecamatan'].join(' — ');
    let out = buildBsanCsvHeader({
      title: 'PROFIL & STATUS PENGISIAN SEKOLAH SASARAN BSAN',
      wilayah,
      totalInfo: `Total Sekolah: ${schoolList.length} | Partisipasi: ${rate}%`,
    });

    out += buildCsvRow([
      'Timestamp', 'No.', 'NPSN', 'Nama Sekolah', 'Kabupaten', 'Kecamatan',
      'Status Pengisian', 'Akreditasi', 'Jumlah Siswa', 'Jumlah Guru',
      'Alamat', 'Email', 'Telepon',
    ]) + '\n';
    schoolList.forEach((s: any, i: number) => {
      const statusLabel = s.status === 'sudah' ? 'Lengkap' : s.status === 'sebagian' ? 'Sebagian' : 'Belum Mengisi';
      const ts = formatTimestampISO(new Date().toISOString());
      out += buildCsvRow([
        ts,
        i + 1,
        cleanCellValue(s.npsn),
        cleanCellValue(s.nama),
        cleanCellValue(s.kabupaten),
        cleanCellValue(s.kecamatan),
        statusLabel,
        cleanCellValue(s.akreditasi),
        s.totalSiswa || 0,
        s.totalGuru || 0,
        cleanCellValue(s.alamat),
        cleanCellValue(s.email),
        cleanCellValue(s.telepon),
      ]) + '\n';
    });

    return out;
  };

  const buildRekapCsv = (schoolList: any[]) => {
    const wilayah = selectedKab || 'Semua Kabupaten';

    const groupMap: Record<string, { kabupaten: string; total: number; sudah: number; sebagian: number; belum: number }> = {};
    schoolList.forEach((s: any) => {
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
      totalInfo: `Total Sekolah: ${schoolList.length} | Partisipasi: ${rate}%`,
    });

    out += buildCsvRow([
      'Timestamp', 'No.', 'Kabupaten', 'Kecamatan',
      'Total Sekolah', 'Sudah Mengisi', 'Sebagian Mengisi', 'Belum Mengisi',
      'Partisipasi (%)',
    ]) + '\n';
    Object.entries(groupMap).forEach(([key, g], idx) => {
      const kecamatan = key.split('||')[1];
      const pct = g.total > 0 ? Math.round((g.sudah / g.total) * 100) : 0;
      const ts = formatTimestampISO(new Date().toISOString());
      out += buildCsvRow([
        ts,
        idx + 1, cleanCellValue(g.kabupaten), cleanCellValue(kecamatan),
        g.total, g.sudah, g.sebagian, g.belum, `${pct}%`,
      ]) + '\n';
    });

    return out;
  };

  const buildMatriksKuadranCsv = (matriksList: any[]) => {
    const wilayah = selectedKab || 'Semua Wilayah';
    let out = buildBsanCsvHeader({
      title: 'MATRIKS EVALUASI 4 KUADRAN (KESIAPAN VS IMPLEMENTASI) BSAN',
      wilayah,
      totalInfo: `Total Data: ${matriksList.length}`,
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

    matriksList.forEach((p: any, i: number) => {
      const ts = formatTimestampISO(new Date().toISOString());
      out += buildCsvRow([
        ts,
        i + 1,
        cleanCellValue(getNpsn(p.name)),
        cleanCellValue(p.name),
        p.readiness,
        p.implementation,
        cleanCellValue(p.status),
        getKuadranLabel(p.implementation, p.readiness),
      ]) + '\n';
    });

    return out;
  };

  // ── Unified Handler for Excel (.xlsx) & CSV ──
  const handleExportFormat = async (format: 'excel' | 'csv', overrideType?: ExportType) => {
    const targetType = overrideType || selectedExportType;
    setIsExporting(true);
    setExportFormatLoading(format);

    try {
      // Fetch raw dataset ONCE
      const dataset: any = await fetchExportDataset(targetType);
      const stamp = dateStamp();
      const kabSafe = safeFilename(selectedKab || 'SemuaWilayah');

      if (format === 'excel') {
        let wb: any;
        let filename = '';

        switch (targetType) {
          case 'survei_bsan_lengkap':
            wb = createSurveiBsanExcel({
              respondents: dataset.respondents || [],
              questions: dataset.questions || [],
              answersMap: dataset.answers || {},
              schools: schools,
              wilayah: selectedKab || 'Semua Kabupaten',
            });
            filename = `Hasil_Survei_Lengkap_${kabSafe}_${stamp}.xlsx`;
            break;

          case 'observasi_sel':
            wb = createObservasiSelExcel({
              sessions: dataset.sessions || [],
              questions: dataset.questions || [],
              answersMap: dataset.answers || {},
              schoolsDataLookup: getNpsn,
            });
            filename = `Hasil_Observasi_SEL_BSAN_${kabSafe}_${stamp}.xlsx`;
            break;

          case 'profil_sekolah':
            wb = createProfilSekolahExcel({
              schools: dataset,
              wilayah: selectedKab || 'Semua Kabupaten',
            });
            filename = `Profil_Sekolah_BSAN_${kabSafe}_${stamp}.xlsx`;
            break;

          case 'rekapitulasi_kecamatan':
            wb = createRekapKecamatanExcel({
              schools: dataset,
              wilayah: selectedKab || 'Semua Kabupaten',
            });
            filename = `Rekapitulasi_Kecamatan_BSAN_${kabSafe}_${stamp}.xlsx`;
            break;

          case 'matriks_kuadran':
            wb = createMatriksKuadranExcel({
              matriksData: dataset,
              getNpsn,
            });
            filename = `Matriks_Kuadran_BSAN_${kabSafe}_${stamp}.xlsx`;
            break;
        }

        downloadXlsxWorkbook(wb, filename);
        notifyToast({
          type: 'success',
          title: 'Ekspor Excel Berhasil',
          message: `Berkas "${filename}" (Format Rapi Multi-Sheet) berhasil dibuat dan diunduh.`,
        });
      } else {
        // CSV Format
        let csv = '';
        let filename = '';

        switch (targetType) {
          case 'survei_bsan_lengkap':
            csv = buildSurveiBsanLengkapCsv(dataset);
            filename = `Hasil_Survei_Lengkap_${kabSafe}_${stamp}.csv`;
            break;

          case 'observasi_sel':
            csv = buildObservasiSelCsv(dataset);
            filename = `Hasil_Observasi_SEL_BSAN_${kabSafe}_${stamp}.csv`;
            break;

          case 'profil_sekolah':
            csv = buildProfilSekolahCsv(dataset);
            filename = `Profil_Sekolah_BSAN_${kabSafe}_${stamp}.csv`;
            break;

          case 'rekapitulasi_kecamatan':
            csv = buildRekapCsv(dataset);
            filename = `Rekapitulasi_Kecamatan_BSAN_${kabSafe}_${stamp}.csv`;
            break;

          case 'matriks_kuadran':
            csv = buildMatriksKuadranCsv(dataset);
            filename = `Matriks_Kuadran_BSAN_${kabSafe}_${stamp}.csv`;
            break;
        }

        triggerDownload(csv, filename);
        notifyToast({
          type: 'success',
          title: 'Ekspor CSV Berhasil',
          message: `Berkas "${filename}" (Data Mentah UTF-8 BOM) berhasil diunduh.`,
        });
      }

      setShowExportModal(false);
    } catch (err: any) {
      console.error('Export failed:', err);
      notifyToast({
        type: 'error',
        title: 'Ekspor Gagal',
        message: err?.message || 'Terjadi kesalahan saat memproses berkas ekspor.',
      });
    } finally {
      setIsExporting(false);
      setExportFormatLoading(null);
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
            Ekspor data Survei BSAN, Observasi SEL, Profil Sekolah, Matriks Kuadran, dan Rekapitulasi dalam format Excel (.xlsx - Multi-sheet) atau CSV (Data Mentah).
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          disabled={isExporting}
          className="flex items-center space-x-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-5 py-3 text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-smooth cursor-pointer disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          <span>Ekspor Data (Excel / CSV)</span>
        </button>
      </div>

      {/* Exporting overlay */}
      {isExporting && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 animate-fade-in">
          <div className="bg-surface p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-border">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
            <h3 className="text-lg font-bold text-text-primary font-display mb-2">
              {exportFormatLoading === 'excel' ? 'Menyusun Berkas Excel (.xlsx)' : 'Menyusun Berkas CSV'}
            </h3>
            <p className="text-xs text-text-secondary text-center">
              {exportFormatLoading === 'excel'
                ? 'Membangun lembar kerja multi-sheet, profil, & katalog...'
                : 'Memformat kolom & data mentah UTF-8 BOM...'}
            </p>
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

      {/* Quick Action Cards for Survei and Observasi SEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Survei BSAN */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm font-display">Survei Implementasi BSAN</h3>
              <p className="text-[11px] text-text-secondary">Data lengkap jawaban kuesioner responden (Q1 - Q34+)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleExportFormat('excel', 'survei_bsan_lengkap')}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handleExportFormat('csv', 'survei_bsan_lengkap')}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Export CSV - Data Mentah</span>
            </button>
          </div>
        </div>

        {/* Card 2: Observasi SEL */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm font-display">Hasil Observasi SEL</h3>
              <p className="text-[11px] text-text-secondary">Penilaian 5 Dimensi SEL, skor guru & murid per sesi</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleExportFormat('excel', 'observasi_sel')}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handleExportFormat('csv', 'observasi_sel')}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Export CSV - Data Mentah</span>
            </button>
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

      {/* ── Modal Ekspor Data dengan 2 Pilihan Format Terpisah (Excel .xlsx Rapi & CSV Data Mentah) ── */}
      {showExportModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-xl w-full border border-border flex flex-col animate-scale-in max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-border bg-bg/40 rounded-t-2xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm sm:text-base font-display">Pusat Ekspor Data BSAN</h3>
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

            {/* Modal Body — Stacked Category Options */}
            <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
                1. Pilih Jenis Data
              </label>

              {EXPORT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = selectedExportType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedExportType(opt.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${isSelected
                      ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30'
                      : 'border-border bg-bg/30 hover:bg-bg hover:border-border/80'
                      }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-border/30 text-text-secondary'
                      }`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-xs sm:text-sm leading-snug ${isSelected ? 'text-primary' : 'text-text-primary'
                        }`}>
                        {opt.label}
                      </h4>
                      <p className="text-text-secondary text-[11px] mt-0.5 leading-relaxed line-clamp-2">
                        {opt.desc}
                      </p>
                    </div>

                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-border'
                      }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer — Dua Pilihan Ekspor Terpisah (Excel .xlsx Rapi vs CSV Data Mentah) */}
            <div className="p-4 px-5 border-t border-border bg-bg/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-b-2xl shrink-0">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl border border-border bg-surface text-text-secondary text-xs font-semibold hover:bg-bg transition-smooth text-center"
              >
                Batal
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 sm:justify-end">
                {/* Option 1: Excel (.xlsx) Rapi - Multi Sheet */}
                <button
                  type="button"
                  onClick={() => handleExportFormat('excel')}
                  disabled={isExporting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-smooth active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isExporting && exportFormatLoading === 'excel' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  <span>Export Excel (.xlsx)</span>
                </button>

                {/* Option 2: CSV Data Mentah UTF-8 BOM */}
                <button
                  type="button"
                  onClick={() => handleExportFormat('csv')}
                  disabled={isExporting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-smooth active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isExporting && exportFormatLoading === 'csv' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span>Export CSV - Data Mentah</span>
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
