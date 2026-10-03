/**
 * @file exportExcel.ts
 * @description Multi-sheet Excel (.xlsx) exporter using SheetJS (xlsx).
 *   Shares identical data logic & parameters with CSV exports.
 */

import * as XLSX from 'xlsx';

export function cleanCellValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str === 'null' || str === 'undefined' || str === 'NaN' || str.toLowerCase() === 'jawaban esai') return '';
  return str;
}

export function formatTimestampISO(dateVal: unknown): string {
  if (!dateVal) return '';
  const str = String(dateVal).trim();
  if (str === 'null' || str === 'undefined' || str === 'NaN') return '';
  
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    return str;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Trigger download of an XLSX workbook using SheetJS.
 */
export function downloadXlsxWorkbook(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename);
}

// ─── 1. Survei BSAN Multi-Sheet Exporter ───
export function createSurveiBsanExcel(payload: {
  respondents: any[];
  questions: any[];
  answersMap: Record<string | number, Record<string | number, any>>;
  schools?: any[];
  wilayah?: string;
}): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const { respondents, questions, answersMap, schools = [] } = payload;

  // Sheet 1: Data Mentah Survei
  const surveyHeaders = ['Timestamp'];
  questions.forEach((q: any) => {
    surveyHeaders.push(cleanCellValue(q.teks_pertanyaan));
  });

  const surveyRows: any[][] = [surveyHeaders];
  respondents.forEach((r: any) => {
    const ts = formatTimestampISO(r.submitted_at);
    const row = [ts];
    const rAnswers = answersMap[r.responden_id] || {};
    questions.forEach((q: any) => {
      row.push(cleanCellValue(rAnswers[q.id]));
    });
    surveyRows.push(row);
  });

  const wsSurvey = XLSX.utils.aoa_to_sheet(surveyRows);
  XLSX.utils.book_append_sheet(wb, wsSurvey, 'Data Survei');

  // Sheet 2: Ringkasan & Profil Sekolah
  const schoolHeaders = [
    'No.', 'NPSN', 'Nama Sekolah', 'Kabupaten', 'Kecamatan',
    'Status Pengisian', 'Akreditasi', 'Total Siswa', 'Total Guru',
    'Alamat', 'Email', 'Telepon'
  ];
  const schoolRows: any[][] = [schoolHeaders];
  schools.forEach((s: any, idx: number) => {
    const statusLabel = s.status === 'sudah' ? 'Lengkap' : s.status === 'sebagian' ? 'Sebagian' : 'Belum Mengisi';
    schoolRows.push([
      idx + 1,
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
      cleanCellValue(s.telepon)
    ]);
  });
  const wsSchools = XLSX.utils.aoa_to_sheet(schoolRows);
  XLSX.utils.book_append_sheet(wb, wsSchools, 'Ringkasan & Profil');

  // Sheet 3: Metadata Pertanyaan Kuesioner
  const qHeaders = ['No.', 'Kode Pertanyaan', 'Modul ID', 'Tipe', 'Teks Pertanyaan', 'Opsi Jawaban'];
  const qRows: any[][] = [qHeaders];
  questions.forEach((q: any, idx: number) => {
    let opsiStr = '';
    if (q.opsi_jawaban) {
      try {
        const parsed = typeof q.opsi_jawaban === 'string' ? JSON.parse(q.opsi_jawaban) : q.opsi_jawaban;
        opsiStr = Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
      } catch {
        opsiStr = String(q.opsi_jawaban);
      }
    }
    qRows.push([
      idx + 1,
      cleanCellValue(q.kode_pertanyaan),
      q.modul_id || '',
      cleanCellValue(q.tipe),
      cleanCellValue(q.teks_pertanyaan),
      cleanCellValue(opsiStr)
    ]);
  });
  const wsMeta = XLSX.utils.aoa_to_sheet(qRows);
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Katalog Pertanyaan');

  return wb;
}

// ─── 2. Observasi SEL Multi-Sheet Exporter ───
export function createObservasiSelExcel(payload: {
  sessions: any[];
  questions: any[];
  answersMap: Record<string | number, Record<string | number, any>>;
  schoolsDataLookup?: (nama: string) => string;
}): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const { sessions, questions, answersMap, schoolsDataLookup } = payload;

  const getNpsn = (nama: string) => (schoolsDataLookup ? schoolsDataLookup(nama) : '');

  // Sheet 1: Data Observasi SEL
  const selHeaders = [
    'Timestamp', 'No.', 'NPSN', 'Nama Sekolah', 'Kabupaten', 'Kecamatan', 'Tanggal Observasi',
    'Lokasi Diamati', 'Waktu Pengamatan', 'Kelas Diamati', 'Mata Pelajaran',
    'Guru Inisial', 'Guru JK', 'Jangkauan Siswa', 'Jumlah Siswa (L/P)', 'Siswa Disabilitas (L/P)',
    'Observer', 'Skor Guru Total (1-4)', 'Skor Murid Total (1-4)', 'Skor Total Sesi (1-4)',
    'Kesadaran Diri (Avg)', 'Regulasi Emosi (Avg)', 'Kesadaran Sosial (Avg)', 'Keterampilan Relasi (Avg)', 'Tanggung Jawab (Avg)',
    'Skor Kuesioner BSAN (%)'
  ];

  questions.forEach((q: any) => {
    selHeaders.push(`[${cleanCellValue(q.dimensi_nama).toUpperCase()} - ${cleanCellValue(q.subjek).toUpperCase()}] ${cleanCellValue(q.teks)} (SKOR)`);
    selHeaders.push(`[${cleanCellValue(q.dimensi_nama).toUpperCase()} - ${cleanCellValue(q.subjek).toUpperCase()}] ${cleanCellValue(q.teks)} (CATATAN)`);
  });

  const selRows: any[][] = [selHeaders];

  sessions.forEach((s: any, idx: number) => {
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

    const row: any[] = [
      ts,
      idx + 1,
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
      parseFloat(s.guru_total || 0),
      parseFloat(s.murid_total || 0),
      parseFloat(s.total_rata || 0),
      parseFloat(s.kesadaran_diri || 0),
      parseFloat(s.regulasi_emosi || 0),
      parseFloat(s.kesadaran_sosial || 0),
      parseFloat(s.keterampilan_relasi || 0),
      parseFloat(s.tanggung_jawab || 0),
      parseFloat(s.kuisioner_score || 0)
    ];

    const rAns = answersMap[s.id] || {};
    questions.forEach((q: any) => {
      const ans = rAns[q.id];
      row.push(ans?.skor !== undefined && ans?.skor !== null ? ans.skor : '');
      row.push(cleanCellValue(ans?.catatan));
    });

    selRows.push(row);
  });

  const wsSel = XLSX.utils.aoa_to_sheet(selRows);
  XLSX.utils.book_append_sheet(wb, wsSel, 'Data Observasi SEL');

  // Sheet 2: Rekap Skor Per Sekolah
  const rekapMap: Record<string, {
    npsn: string; sekolah: string; kabupaten: string; kecamatan: string;
    sesiCount: number; guruSum: number; muridSum: number; totalSum: number;
    kdSum: number; reSum: number; ksSum: number; krSum: number; tjSum: number;
  }> = {};

  sessions.forEach((s: any) => {
    const key = s.sekolah_nama || 'Unknown';
    if (!rekapMap[key]) {
      rekapMap[key] = {
        npsn: s.npsn || getNpsn(s.sekolah_nama),
        sekolah: s.sekolah_nama,
        kabupaten: s.kabupaten,
        kecamatan: s.kecamatan,
        sesiCount: 0, guruSum: 0, muridSum: 0, totalSum: 0,
        kdSum: 0, reSum: 0, ksSum: 0, krSum: 0, tjSum: 0,
      };
    }
    const r = rekapMap[key];
    r.sesiCount++;
    r.guruSum += parseFloat(s.guru_total || 0);
    r.muridSum += parseFloat(s.murid_total || 0);
    r.totalSum += parseFloat(s.total_rata || 0);
    r.kdSum += parseFloat(s.kesadaran_diri || 0);
    r.reSum += parseFloat(s.regulasi_emosi || 0);
    r.ksSum += parseFloat(s.kesadaran_sosial || 0);
    r.krSum += parseFloat(s.keterampilan_relasi || 0);
    r.tjSum += parseFloat(s.tanggung_jawab || 0);
  });

  const rekapHeaders = [
    'No.', 'NPSN', 'Nama Sekolah', 'Kabupaten', 'Kecamatan', 'Jumlah Sesi',
    'Rata Guru (1-4)', 'Rata Murid (1-4)', 'Total Skor (1-4)',
    'Kesadaran Diri', 'Regulasi Emosi', 'Kesadaran Sosial', 'Keterampilan Relasi', 'Tanggung Jawab'
  ];
  const rekapRows: any[][] = [rekapHeaders];
  Object.values(rekapMap).forEach((r, idx) => {
    const count = r.sesiCount || 1;
    rekapRows.push([
      idx + 1,
      r.npsn,
      r.sekolah,
      r.kabupaten,
      r.kecamatan,
      r.sesiCount,
      (r.guruSum / count).toFixed(2),
      (r.muridSum / count).toFixed(2),
      (r.totalSum / count).toFixed(2),
      (r.kdSum / count).toFixed(2),
      (r.reSum / count).toFixed(2),
      (r.ksSum / count).toFixed(2),
      (r.krSum / count).toFixed(2),
      (r.tjSum / count).toFixed(2)
    ]);
  });
  const wsRekap = XLSX.utils.aoa_to_sheet(rekapRows);
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap Skor Per Sekolah');

  // Sheet 3: Katalog Indikator SEL
  const indHeaders = ['No.', 'Kode Indikator', 'Subjek', 'Dimensi', 'Teks Indikator'];
  const indRows: any[][] = [indHeaders];
  questions.forEach((q: any, idx: number) => {
    indRows.push([
      idx + 1,
      cleanCellValue(q.kode_indikator),
      cleanCellValue(q.subjek),
      cleanCellValue(q.dimensi_nama),
      cleanCellValue(q.teks)
    ]);
  });
  const wsInd = XLSX.utils.aoa_to_sheet(indRows);
  XLSX.utils.book_append_sheet(wb, wsInd, 'Daftar Indikator SEL');

  return wb;
}

// ─── 3. Profil Sekolah Multi-Sheet Exporter ───
export function createProfilSekolahExcel(payload: { schools: any[]; wilayah?: string }): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const { schools } = payload;

  const headers = [
    'No.', 'NPSN', 'Nama Sekolah', 'Kabupaten', 'Kecamatan',
    'Status Pengisian', 'Akreditasi', 'Jumlah Siswa', 'Jumlah Guru',
    'Alamat', 'Email', 'Telepon'
  ];
  const rows: any[][] = [headers];

  schools.forEach((s: any, idx: number) => {
    const statusLabel = s.status === 'sudah' ? 'Lengkap' : s.status === 'sebagian' ? 'Sebagian' : 'Belum Mengisi';
    rows.push([
      idx + 1,
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
      cleanCellValue(s.telepon)
    ]);
  });
  const wsMain = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsMain, 'Profil Sekolah');

  // Sheet 2: Summary Stats
  const total = schools.length;
  const sudah = schools.filter((s: any) => s.status === 'sudah').length;
  const sebagian = schools.filter((s: any) => s.status === 'sebagian').length;
  const belum = schools.filter((s: any) => s.status === 'belum').length;
  const pct = total > 0 ? Math.round((sudah / total) * 100) : 0;

  const summaryRows = [
    ['Metric', 'Nilai'],
    ['Total Sekolah Sasaran', total],
    ['Selesai Mengisi (Lengkap)', sudah],
    ['Sebagian Mengisi', sebagian],
    ['Belum Mengisi', belum],
    ['Tingkat Partisipasi (%)', `${pct}%`]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Statistis');

  return wb;
}

// ─── 4. Rekapitulasi Kecamatan Multi-Sheet Exporter ───
export function createRekapKecamatanExcel(payload: { schools: any[]; wilayah?: string }): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const { schools } = payload;

  const groupMap: Record<string, { kabupaten: string; total: number; sudah: number; sebagian: number; belum: number }> = {};
  schools.forEach(s => {
    const key = `${s.kabupaten}||${s.kecamatan}`;
    if (!groupMap[key]) groupMap[key] = { kabupaten: s.kabupaten, total: 0, sudah: 0, sebagian: 0, belum: 0 };
    groupMap[key].total += 1;
    if (s.status === 'sudah') groupMap[key].sudah += 1;
    else if (s.status === 'sebagian') groupMap[key].sebagian += 1;
    else groupMap[key].belum += 1;
  });

  const headers = [
    'No.', 'Kabupaten', 'Kecamatan',
    'Total Sekolah', 'Sudah Mengisi', 'Sebagian Mengisi', 'Belum Mengisi',
    'Partisipasi (%)'
  ];
  const rows: any[][] = [headers];

  Object.entries(groupMap).forEach(([key, g], idx) => {
    const kecamatan = key.split('||')[1];
    const pct = g.total > 0 ? Math.round((g.sudah / g.total) * 100) : 0;
    rows.push([
      idx + 1,
      g.kabupaten,
      kecamatan,
      g.total,
      g.sudah,
      g.sebagian,
      g.belum,
      `${pct}%`
    ]);
  });

  const wsMain = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsMain, 'Rekapitulasi Kecamatan');

  return wb;
}

// ─── 5. Matriks Kuadran Multi-Sheet Exporter ───
export function createMatriksKuadranExcel(payload: { matriksData: any[]; getNpsn?: (nama: string) => string }): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const { matriksData, getNpsn } = payload;

  const getKuadranLabel = (impl: number, read: number): string =>
    impl >= 60 && read >= 60 ? 'Kuadran I — Mandiri'
      : impl < 60 && read >= 60 ? 'Kuadran II — Potensial'
        : impl >= 60 && read < 60 ? 'Kuadran III — Perlu Sarana'
          : 'Kuadran IV — Intervensi';

  const headers = [
    'No.', 'NPSN', 'Nama Sekolah / Kecamatan',
    'Tingkat Kesiapan (%)', 'Tingkat Implementasi (%)',
    'Status', 'Posisi Kuadran'
  ];
  const rows: any[][] = [headers];

  matriksData.forEach((p: any, idx: number) => {
    rows.push([
      idx + 1,
      getNpsn ? getNpsn(p.name) : '',
      cleanCellValue(p.name),
      p.readiness,
      p.implementation,
      cleanCellValue(p.status),
      getKuadranLabel(p.implementation, p.readiness)
    ]);
  });

  const wsMain = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsMain, 'Matriks 4 Kuadran');

  return wb;
}
