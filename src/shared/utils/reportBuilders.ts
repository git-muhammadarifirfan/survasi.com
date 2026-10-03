/**
 * @file reportBuilders.ts
 * @description Penyusun laporan ekspor dari data REAL backend. Setiap builder
 *   mengambil data terbaru dari API lalu mengembalikan ExportPayload yang siap
 *   diunduh sebagai XLSX/CSV lewat `exportTable`.
 */
import { apiClient, withQuery } from '../services/api-client';
import { fmtDateTime, STATUS_PENGISIAN_LABEL, type ExportPayload } from './tableExport';

export interface ReportFilter {
  kabupaten_id?: number;
  kabupaten_nama?: string;
  kecamatan?: string;
  status?: string;
}

export function filterLabel(f: ReportFilter): string {
  const parts = [f.kabupaten_nama || 'Semua Kabupaten/Kota'];
  if (f.kecamatan) parts.push(`Kec. ${f.kecamatan}`);
  if (f.status) parts.push(`Status: ${STATUS_PENGISIAN_LABEL[f.status] || f.status}`);
  return parts.join(' • ');
}

const fileSuffix = (f: ReportFilter) =>
  [f.kabupaten_nama, f.kecamatan].filter(Boolean).join('_') || 'SemuaWilayah';

const JK: Record<string, string> = { L: 'Laki-laki', P: 'Perempuan' };
const IMPL: Record<string, string> = { sudah: 'Sudah seluruhnya', sebagian: 'Sebagian', belum: 'Belum/Tidak' };
const IDENTITY_ROLES = new Set(['nama', 'jenis_kelamin', 'posisi', 'sekolah', 'kabupaten', 'kecamatan']);

// ─── 1. Data mentah survei BSAN (semua pertanyaan & jawaban) ────────────────
export async function buildSurveiLengkap(f: ReportFilter): Promise<ExportPayload> {
  const res = await apiClient.get<any>(withQuery('/responden/export-full', { kabupaten_id: f.kabupaten_id, kecamatan: f.kecamatan }));
  const { respondents = [], questions = [], answers = {} } = res.data || {};
  const answerQs = (questions as any[]).filter(q => !IDENTITY_ROLES.has(q.role));

  const columns = [
    'No', 'Waktu Kirim', 'NPSN', 'Nama Sekolah', 'Jenjang', 'Status Sekolah', 'Kabupaten/Kota', 'Kecamatan',
    'Akun Pengisi', 'Email Akun', 'Nama Responden', 'Jenis Kelamin', 'Posisi',
    'Penerima Modul', 'Status Implementasi', 'Kelas Mengajar',
    ...answerQs.map((q: any, i: number) => `P${i + 1}. ${q.teks_pertanyaan}${q.is_active ? '' : ' (nonaktif)'}`),
  ];
  const rows = (respondents as any[]).map((r, i) => {
    const a = answers[r.responden_id] || {};
    return [
      i + 1, fmtDateTime(r.submitted_at), r.npsn, r.sekolah, r.jenjang, r.status_sekolah, r.kabupaten, r.kecamatan,
      r.akun_nama, r.akun_email, r.nama, JK[r.jenis_kelamin] || r.jenis_kelamin, r.posisi,
      r.penerima_modul, r.penerima_modul === 'Ya' ? (IMPL[r.status_implementasi] || '-') : 'Belum menerima modul', r.kelas_mengajar,
      ...answerQs.map((q: any) => a[q.id] || ''),
    ];
  });

  const katalog = answerQs.map((q: any, i: number) => {
    let opsi = '';
    try {
      const arr = typeof q.opsi_jawaban === 'string' ? JSON.parse(q.opsi_jawaban) : q.opsi_jawaban;
      if (Array.isArray(arr)) opsi = arr.join(' | ');
    } catch { /* teks bebas */ }
    return [`P${i + 1}`, q.kode_pertanyaan, q.section_title, q.teks_pertanyaan, q.tipe, opsi, q.modul_id ? `Modul ${q.modul_id}` : '-', q.is_active ? 'Aktif' : 'Nonaktif'];
  });

  return {
    title: 'Data Lengkap Survei Implementasi BSAN',
    wilayah: `${filterLabel(f)} • ${respondents.length} responden`,
    filename: `Survei_BSAN_Lengkap_${fileSuffix(f)}`,
    sheets: [
      { name: 'Data Survei', columns, rows },
      { name: 'Katalog Pertanyaan', columns: ['Kolom', 'Kode', 'Bagian', 'Pertanyaan', 'Tipe', 'Opsi Jawaban', 'Modul', 'Status'], rows: katalog },
    ],
  };
}

// ─── 2. Observasi SEL lengkap ────────────────────────────────────────────────
const JANGKAUAN: Record<number, string> = {
  1: 'Seluruh siswa', 2: 'Lebih dari separuh siswa', 3: 'Kurang dari separuh siswa', 4: 'Sebagian kecil siswa',
};
const arr = (v: unknown) => {
  if (!v) return '';
  try {
    const p = typeof v === 'string' ? JSON.parse(v) : v;
    return Array.isArray(p) ? p.join(', ') : String(p);
  } catch {
    return String(v);
  }
};
const num2 = (v: unknown) => (v === null || v === undefined || v === '' ? '' : Number(Number(v).toFixed(2)));

export async function buildObservasiSel(f: ReportFilter): Promise<ExportPayload> {
  const res = await apiClient.get<any>(withQuery('/sel/export-full', { kabupaten_id: f.kabupaten_id }));
  let { sessions = [], questions = [], answers = {} } = res.data || {};
  if (f.kecamatan) sessions = (sessions as any[]).filter(s => s.kecamatan === f.kecamatan);

  const columns = [
    'No', 'Tanggal Observasi', 'NPSN', 'Nama Sekolah', 'Kabupaten/Kota', 'Kecamatan', 'Observer', 'Email Observer',
    'Kelas Diamati', 'Mata Pelajaran', 'Inisial Guru', 'JK Guru', 'Lokasi Diamati', 'Waktu Pengamatan',
    'Siswa L', 'Siswa P', 'Disabilitas L', 'Disabilitas P', 'Jangkauan Siswa',
    'Skor Guru (1-4)', 'Skor Murid (1-4)', 'Skor Total (1-4)',
    'Kesadaran Diri', 'Regulasi Emosi', 'Kesadaran Sosial', 'Keterampilan Relasi', 'Tanggung Jawab',
    'Skor Kuesioner BSAN (%)',
    ...(questions as any[]).flatMap((q: any) => [
      `[${q.subjek}] ${q.dimensi_nama}: ${q.teks} — Skor`,
      `[${q.subjek}] ${q.dimensi_nama}: ${q.teks} — Catatan`,
    ]),
  ];
  const rows = (sessions as any[]).map((s, i) => {
    const a = answers[s.id] || {};
    return [
      i + 1, String(s.tanggal || '').slice(0, 10), s.npsn, s.sekolah_nama, s.kabupaten, s.kecamatan, s.observer_nama, s.observer_email,
      s.kelas_diamati, s.mata_pelajaran, s.guru_inisial, JK[s.guru_jk] || s.guru_jk, arr(s.lokasi_diamati), arr(s.waktu_pengamatan),
      s.jumlah_siswa_l, s.jumlah_siswa_p, s.siswa_disabilitas_l, s.siswa_disabilitas_p,
      `${JANGKAUAN[s.jangkauan_siswa] || '-'}${s.jangkauan_siswa === 4 && s.jumlah_siswa_sebagian_kecil ? ` (${s.jumlah_siswa_sebagian_kecil} siswa)` : ''}`,
      num2(s.guru_total), num2(s.murid_total), num2(s.total_rata),
      num2(s.kesadaran_diri), num2(s.regulasi_emosi), num2(s.kesadaran_sosial), num2(s.keterampilan_relasi), num2(s.tanggung_jawab),
      s.kuisioner_score ?? 'Belum mengisi kuesioner',
      ...(questions as any[]).flatMap((q: any) => [a[q.id]?.skor ?? 'Tidak teramati', a[q.id]?.catatan || '']),
    ];
  });

  // Rekap per sekolah (rata-rata seluruh sesi)
  const bySchool = new Map<string, any[]>();
  (sessions as any[]).forEach(s => {
    const k = String(s.sekolah_id);
    if (!bySchool.has(k)) bySchool.set(k, []);
    bySchool.get(k)!.push(s);
  });
  const avg = (list: any[], key: string) => {
    const v = list.map(x => Number(x[key])).filter(n => Number.isFinite(n) && n > 0);
    return v.length ? Number((v.reduce((a, b) => a + b, 0) / v.length).toFixed(2)) : '';
  };
  const rekap = [...bySchool.values()].map((list, i) => [
    i + 1, list[0].npsn, list[0].sekolah_nama, list[0].kabupaten, list[0].kecamatan, list.length,
    avg(list, 'guru_total'), avg(list, 'murid_total'), avg(list, 'total_rata'),
    avg(list, 'kesadaran_diri'), avg(list, 'regulasi_emosi'), avg(list, 'kesadaran_sosial'), avg(list, 'keterampilan_relasi'), avg(list, 'tanggung_jawab'),
    list[0].kuisioner_score ?? '',
  ]);

  return {
    title: 'Data Observasi SEL (Social-Emotional Learning)',
    wilayah: `${filterLabel(f)} • ${sessions.length} sesi`,
    filename: `Observasi_SEL_${fileSuffix(f)}`,
    sheets: [
      { name: 'Data Sesi Observasi', columns, rows },
      {
        name: 'Rekap per Sekolah',
        columns: ['No', 'NPSN', 'Nama Sekolah', 'Kabupaten/Kota', 'Kecamatan', 'Jumlah Sesi', 'Rata Guru', 'Rata Murid', 'Rata Total',
          'Kesadaran Diri', 'Regulasi Emosi', 'Kesadaran Sosial', 'Keterampilan Relasi', 'Tanggung Jawab', 'Skor Kuesioner (%)'],
        rows: rekap,
      },
      {
        name: 'Katalog Indikator',
        columns: ['No', 'Kode', 'Subjek', 'Dimensi', 'Indikator'],
        rows: (questions as any[]).map((q: any, i: number) => [i + 1, q.kode, q.subjek, q.dimensi_nama, q.teks]),
      },
    ],
  };
}

// ─── 3. Profil & status pengisian sekolah ────────────────────────────────────
export async function fetchSchools(f: ReportFilter): Promise<any[]> {
  const res: any = await apiClient.get<any[]>(withQuery('/sekolah', {
    kabupaten_id: f.kabupaten_id, kecamatan: f.kecamatan, status: f.status, limit: 5000,
  }));
  return Array.isArray(res?.data) ? res.data : [];
}

export async function buildStatusSekolah(f: ReportFilter): Promise<ExportPayload> {
  const schools = await fetchSchools(f);
  const columns = ['No', 'NPSN', 'Nama Sekolah', 'Jenjang', 'Status Sekolah', 'Akreditasi', 'Kabupaten/Kota', 'Kecamatan',
    'Status Pengisian', 'Aktivitas Terakhir', 'Akun Terdaftar', 'Jumlah Guru', 'Jumlah Siswa', 'Sesi Observasi SEL', 'Alamat', 'Email', 'Telepon'];
  const rows = schools.map((s, i) => [
    i + 1, s.npsn, s.nama, s.jenjang, s.status_sekolah, s.akreditasi, s.kabupaten, s.kecamatan,
    STATUS_PENGISIAN_LABEL[s.status] || s.status, fmtDateTime(s.last_updated), Number(s.is_registered) ? 'Ya' : 'Belum',
    s.total_guru, s.total_siswa, s.observasi_count, s.alamat, s.email, s.telepon,
  ]);
  const count = (st: string) => schools.filter(s => s.status === st).length;
  const ringkasan = [
    ['Total sekolah', schools.length],
    ['Selesai mengisi', count('sudah')],
    ['Proses mengisi', count('sebagian')],
    ['Belum mengisi', count('belum')],
    ['Tingkat penyelesaian (%)', schools.length ? Number(((count('sudah') / schools.length) * 100).toFixed(1)) : 0],
    ['Akun sekolah terdaftar', schools.filter(s => Number(s.is_registered)).length],
  ];
  return {
    title: 'Profil & Status Pengisian Sekolah Sasaran',
    wilayah: filterLabel(f),
    filename: `Status_Sekolah_${fileSuffix(f)}`,
    sheets: [
      { name: 'Status Sekolah', columns, rows },
      { name: 'Ringkasan', columns: ['Indikator', 'Nilai'], rows: ringkasan },
    ],
  };
}

// ─── 4. Rekap partisipasi per kecamatan ──────────────────────────────────────
export async function buildRekapWilayah(f: ReportFilter): Promise<ExportPayload> {
  const [kec, kab] = await Promise.all([
    apiClient.get<any[]>(withQuery('/dashboard/regional-stats', { kabupaten_id: f.kabupaten_id, kecamatan: f.kecamatan })),
    apiClient.get<any[]>('/dashboard/kabupaten-stats'),
  ]);
  const kecRows = (kec.data || []).map((r: any, i: number) => [
    i + 1, r.kabupaten, r.kecamatan, r.total, r.sudah, r.sebagian, r.belum, r.rate, r.partisipasi,
  ]);
  const kabRows = (kab.data || [])
    .filter((r: any) => !f.kabupaten_id || Number(r.id) === f.kabupaten_id)
    .map((r: any, i: number) => [i + 1, r.kabupaten, r.total, r.sudah, r.sebagian, r.belum, r.rate, r.partisipasi]);
  return {
    title: 'Rekapitulasi Partisipasi Survei BSAN per Wilayah',
    wilayah: filterLabel(f),
    filename: `Rekap_Wilayah_${fileSuffix(f)}`,
    sheets: [
      { name: 'Per Kecamatan', columns: ['No', 'Kabupaten/Kota', 'Kecamatan', 'Total Sekolah', 'Selesai', 'Proses', 'Belum', 'Penyelesaian (%)', 'Partisipasi (%)'], rows: kecRows },
      { name: 'Per Kabupaten', columns: ['No', 'Kabupaten/Kota', 'Total Sekolah', 'Selesai', 'Proses', 'Belum', 'Penyelesaian (%)', 'Partisipasi (%)'], rows: kabRows },
    ],
  };
}

// ─── 5. Matriks kuadran per kecamatan ───────────────────────────────────────
export function kuadranLabel(implementasi: number, kesiapan: number): string {
  if (implementasi >= 60 && kesiapan >= 60) return 'Kuadran I — Mandiri';
  if (implementasi < 60 && kesiapan >= 60) return 'Kuadran II — Potensial';
  if (implementasi >= 60 && kesiapan < 60) return 'Kuadran III — Perlu Sarana';
  return 'Kuadran IV — Intervensi';
}

export async function buildMatriks(f: ReportFilter): Promise<ExportPayload> {
  const res = await apiClient.get<any[]>(withQuery('/analisis/matriks', { kabupaten_id: f.kabupaten_id, kecamatan: f.kecamatan }));
  const rows = (res.data || []).map((r: any, i: number) => [
    i + 1, r.kabupaten, r.kecamatan, r.jumlah_sekolah, r.total_responden,
    Number(r.penerimaan_persen || 0), Number(r.implementasi_persen || 0),
    kuadranLabel(Number(r.implementasi_persen || 0), Number(r.penerimaan_persen || 0)),
  ]);
  return {
    title: 'Matriks 4 Kuadran — Kesiapan (Penerimaan Modul) vs Implementasi',
    wilayah: filterLabel(f),
    filename: `Matriks_Kuadran_${fileSuffix(f)}`,
    sheets: [{
      name: 'Matriks Kuadran',
      columns: ['No', 'Kabupaten/Kota', 'Kecamatan', 'Sekolah Responden', 'Responden', 'Kesiapan / Penerimaan Modul (%)', 'Implementasi (%)', 'Kuadran'],
      rows,
    }],
  };
}
