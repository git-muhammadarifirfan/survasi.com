/**
 * @file data-source.ts
 * @module shared/data
 * @description
 *   Central data access layer — FACADE PATTERN.
 *   Saat ini (Fase 1) semua fungsi membaca dari file JSON statis.
 *   Di Fase 2, isi setiap fungsi `database.*` akan diganti dengan
 *   HTTP API calls ke backend MySQL tanpa mengubah interface/signature.
 *
 *   Semua fungsi sudah async-ready (return Promise) sehingga migrasi
 *   ke database hanya perlu mengganti body function, bukan call site.
 *
 * @migration_guide
 *   1. Buat backend API (Express/NestJS) dengan endpoint per fungsi
 *   2. Ganti body setiap fungsi dari JSON read → fetch('/api/...')
 *   3. Interface (School, SurveyRespondent, etc.) tetap sama
 *   4. Semua komponen yang memanggil `database.*` tidak perlu diubah
 *
 * @tables_mapping (Fase 2)
 *   getSchools()         → satuan_pendidikan JOIN kecamatan JOIN kabupaten
 *   getSurveyData()      → responden_survey JOIN jawaban_survey
 *   getKecamatanStats()  → VIEW v_kecamatan_stats
 *   getKabupatenStats()  → VIEW v_kabupaten_stats
 *   getModulProgress()   → modul_bsan + responden_survey + sel scores
 *   getSELSessions()     → sel_sesi_observasi JOIN sel_jawaban_observasi
 *   getSELSummaryStats() → VIEW v_sel_sesi_scores (aggregated)
 *
 * @author BSAN Jatim Team
 */
import realSchoolsData from './real-schools.json';
import realSurveyData from './real-survey-data.json';
import type { SELDimensi, SELSubjek, SELSkor } from './sel-indicators';
import { SEL_INDIKATORS, hitungSkorRata, SEL_DIMENSI_ORDER, SEL_DIMENSI_LABEL } from './sel-indicators';
import { apiClient } from '../services/api-client';




export interface School {
  id: string;
  npsn: string;
  nama: string;
  kecamatan: string;
  kabupaten: string;
  status: 'belum' | 'sebagian' | 'sudah';
  jenjang: string;
  statusSekolah: string;
  totalGuru: number;
  totalSiswa: number;
  akreditasi: string;
  alamat: string;
  email: string;
  telepon: string;
  lastUpdated?: string;
  user_id?: number | null;
  is_registered?: boolean;
  x: number;
  y: number;
}

export interface SurveyRespondent {
  id: string;
  timestamp: string;
  nama: string;
  jenisKelamin: string;
  posisi: string;
  sekolah: string;
  npsn: string;
  kabupaten: string;
  kecamatan: string;
  penerima: string;
  penyelenggara: string;
  statusImplementasi: string;
  kelasMengajar: string;
}

export interface ModulProgress {
  id: string;
  nama: string;
  progres: number;
  totalPertanyaan: number;
  terisi: number;
}

export interface KecamatanStat {
  kecamatan: string;
  kabupaten: string;
  total: number;
  belum: number;
  sebagian: number;
  sudah: number;
  rate: number;
}

export interface KabupatenStat {
  kabupaten: string;
  total: number;
  belum: number;
  sebagian: number;
  sudah: number;
  rate: number;
  color: string;
}

export interface FunnelStep {
  name: string;
  schools: number;
  percentage: number;
}

export interface MatrixPoint {
  id: string;
  name: string;
  kecamatan: string;
  implementation: number;
  readiness: number;
  status: 'belum' | 'sebagian' | 'sudah';
}

export interface ChallengeStat {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TimeSeriesPoint {
  date: string;
  sudah: number;
  sebagian: number;
}

export interface RadarPoint {
  subject: string;
  sekolah: number;
  kecamatan: number;
  fullMark: number;
}

// ─── SEL Observation Types ───────────────────────────────────

export interface SELJawaban {
  indikatorId: string;
  skor: SELSkor | null;   // null = tidak bisa diamati
  catatan: string;
}

export interface SELObservasiSession {
  id: string;
  sekolahId: string;
  sekolahNama: string;
  kecamatan: string;
  kabupaten: string;
  observerNama: string;
  tanggal: string;
  lokasiDiamati: string[];
  waktuPengamatan: string[];
  jumlahSiswaL: number;
  jumlahSiswaP: number;
  siswaDisabilitasL: number;
  siswaDisabilitasP: number;
  jangkauanSiswa: 1 | 2 | 3 | 4;
  kelasDiamati: string;
  namaGuruInisial: string;
  jenisKelaminGuru: 'L' | 'P';
  mataPelajaran: string;
  jawaban: SELJawaban[];
  status: 'draft' | 'submitted';
}

export interface SELDimensiScore {
  dimensi: SELDimensi;
  label: string;
  guruSkor: number;
  muridSkor: number;
  rataRata: number;
}

export interface SELSchoolScore {
  sekolahId: string;
  sekolahNama: string;
  kecamatan: string;
  kabupaten: string;
  tanggal: string;
  guruTotal: number;
  muridTotal: number;
  totalRata: number;
  dimensi: SELDimensiScore[];
  kuisionerScore: number; // skor dari kuesioner BSAN (0-100)
}

export interface SELHeatmapRow {
  kecamatan: string;
  kabupaten: string;
  jumlahSekolah: number;
  dimensiScores: Record<SELDimensi, number>;
  rataRata: number;
}

export interface SELMatriksPoint {
  id: string;
  name: string;
  kecamatan: string;
  kuisionerScore: number; // sumbu X: skor kuesioner BSAN 0-100
  selScore: number;       // sumbu Y: skor observasi SEL 1-4
  guruSkor: number;
  muridSkor: number;
  status: 'belum' | 'sebagian' | 'sudah';
}

// ─── Mock SEL Observasi Data ──────────────────────────────────

function makeMockJawaban(seed: number): SELJawaban[] {
  return SEL_INDIKATORS.map((ind, idx) => {
    const raw = ((seed * 7 + idx * 13) % 4) + 1;
    // Murid slightly lower than guru
    const adj = ind.subjek === 'murid' ? Math.max(1, raw - 1) : raw;
    return {
      indikatorId: ind.id,
      skor: adj as SELSkor,
      catatan: '',
    };
  });
}

const SEL_MOCK_SESSIONS: SELObservasiSession[] = [
  // Sidoarjo
  { id:'sel_1', sekolahId:'s001', sekolahNama:'SDN Candi 1',      kecamatan:'Kec. Candi',    kabupaten:'Kab. Sidoarjo', observerNama:'Budi S.',  tanggal:'2026-08-20', lokasiDiamati:['Ruang kelas','Halaman'], waktuPengamatan:['Istirahat'], jumlahSiswaL:120, jumlahSiswaP:118, siswaDisabilitasL:1, siswaDisabilitasP:0, jangkauanSiswa:2, kelasDiamati:'4A', namaGuruInisial:'RW', jenisKelaminGuru:'P', mataPelajaran:'Tematik', jawaban: makeMockJawaban(71), status:'submitted' },
  { id:'sel_2', sekolahId:'s002', sekolahNama:'SDN Waru 2',       kecamatan:'Kec. Waru',     kabupaten:'Kab. Sidoarjo', observerNama:'Siti A.',  tanggal:'2026-08-21', lokasiDiamati:['Ruang kelas','Lorong'], waktuPengamatan:['Sebelum masuk'], jumlahSiswaL:98, jumlahSiswaP:102, siswaDisabilitasL:0, siswaDisabilitasP:1, jangkauanSiswa:3, kelasDiamati:'5B', namaGuruInisial:'DH', jenisKelaminGuru:'L', mataPelajaran:'Matematika', jawaban: makeMockJawaban(42), status:'submitted' },
  { id:'sel_3', sekolahId:'s003', sekolahNama:'SDN Gedangan 3',   kecamatan:'Kec. Gedangan', kabupaten:'Kab. Sidoarjo', observerNama:'Ahmad M.', tanggal:'2026-08-22', lokasiDiamati:['Ruang kelas','Kantin'], waktuPengamatan:['Istirahat','Pulang'], jumlahSiswaL:88, jumlahSiswaP:91, siswaDisabilitasL:2, siswaDisabilitasP:1, jangkauanSiswa:1, kelasDiamati:'3C', namaGuruInisial:'AS', jenisKelaminGuru:'P', mataPelajaran:'Bahasa Indonesia', jawaban: makeMockJawaban(93), status:'submitted' },
  { id:'sel_4', sekolahId:'s004', sekolahNama:'SDN Taman 1',      kecamatan:'Kec. Taman',    kabupaten:'Kab. Sidoarjo', observerNama:'Budi S.',  tanggal:'2026-08-23', lokasiDiamati:['Ruang kelas'], waktuPengamatan:['Istirahat'], jumlahSiswaL:140, jumlahSiswaP:135, siswaDisabilitasL:0, siswaDisabilitasP:0, jangkauanSiswa:2, kelasDiamati:'6A', namaGuruInisial:'NK', jenisKelaminGuru:'P', mataPelajaran:'IPA', jawaban: makeMockJawaban(55), status:'submitted' },
  { id:'sel_5', sekolahId:'s005', sekolahNama:'SDN Sedati 2',     kecamatan:'Kec. Sedati',   kabupaten:'Kab. Sidoarjo', observerNama:'Siti A.',  tanggal:'2026-08-24', lokasiDiamati:['Halaman','Lorong'], waktuPengamatan:['Ekskul'], jumlahSiswaL:76, jumlahSiswaP:79, siswaDisabilitasL:1, siswaDisabilitasP:0, jangkauanSiswa:4, kelasDiamati:'2B', namaGuruInisial:'RH', jenisKelaminGuru:'L', mataPelajaran:'PJOK', jawaban: makeMockJawaban(28), status:'submitted' },
  { id:'sel_6', sekolahId:'s006', sekolahNama:'SDN Buduran 1',    kecamatan:'Kec. Buduran',  kabupaten:'Kab. Sidoarjo', observerNama:'Ahmad M.', tanggal:'2026-08-25', lokasiDiamati:['Ruang kelas','Perpustakaan'], waktuPengamatan:['Istirahat'], jumlahSiswaL:112, jumlahSiswaP:108, siswaDisabilitasL:0, siswaDisabilitasP:2, jangkauanSiswa:2, kelasDiamati:'5A', namaGuruInisial:'YP', jenisKelaminGuru:'P', mataPelajaran:'IPS', jawaban: makeMockJawaban(67), status:'submitted' },
  { id:'sel_7', sekolahId:'s007', sekolahNama:'SDN Sukodono 3',   kecamatan:'Kec. Sukodono', kabupaten:'Kab. Sidoarjo', observerNama:'Budi S.',  tanggal:'2026-08-26', lokasiDiamati:['Ruang kelas'], waktuPengamatan:['Sebelum masuk','Istirahat'], jumlahSiswaL:95, jumlahSiswaP:98, siswaDisabilitasL:0, siswaDisabilitasP:0, jangkauanSiswa:3, kelasDiamati:'4C', namaGuruInisial:'MH', jenisKelaminGuru:'L', mataPelajaran:'Tematik', jawaban: makeMockJawaban(81), status:'submitted' },
  { id:'sel_8', sekolahId:'s008', sekolahNama:'SDN Krian 2',      kecamatan:'Kec. Krian',    kabupaten:'Kab. Sidoarjo', observerNama:'Siti A.',  tanggal:'2026-08-27', lokasiDiamati:['Ruang kelas','Halaman','Kantin'], waktuPengamatan:['Istirahat'], jumlahSiswaL:128, jumlahSiswaP:132, siswaDisabilitasL:1, siswaDisabilitasP:1, jangkauanSiswa:1, kelasDiamati:'1A', namaGuruInisial:'EK', jenisKelaminGuru:'P', mataPelajaran:'Tematik', jawaban: makeMockJawaban(34), status:'submitted' },
  { id:'sel_9', sekolahId:'s009', sekolahNama:'SDN Porong 1',     kecamatan:'Kec. Porong',   kabupaten:'Kab. Sidoarjo', observerNama:'Ahmad M.', tanggal:'2026-08-28', lokasiDiamati:['Ruang kelas','Mushola'], waktuPengamatan:['Ekskul'], jumlahSiswaL:84, jumlahSiswaP:87, siswaDisabilitasL:0, siswaDisabilitasP:0, jangkauanSiswa:2, kelasDiamati:'6B', namaGuruInisial:'SR', jenisKelaminGuru:'L', mataPelajaran:'PAI', jawaban: makeMockJawaban(59), status:'submitted' },
  { id:'sel_10',sekolahId:'s010', sekolahNama:'SDN Sidoarjo 4',   kecamatan:'Kec. Sidoarjo', kabupaten:'Kab. Sidoarjo', observerNama:'Budi S.',  tanggal:'2026-08-29', lokasiDiamati:['Ruang kelas'], waktuPengamatan:['Istirahat','Pulang'], jumlahSiswaL:155, jumlahSiswaP:150, siswaDisabilitasL:2, siswaDisabilitasP:1, jangkauanSiswa:2, kelasDiamati:'3A', namaGuruInisial:'LW', jenisKelaminGuru:'P', mataPelajaran:'Tematik', jawaban: makeMockJawaban(47), status:'submitted' },
  // Kota Batu
  { id:'sel_11',sekolahId:'s011', sekolahNama:'SDN Batu 1',       kecamatan:'Kec. Batu',     kabupaten:'Kota Batu',     observerNama:'Rina P.',  tanggal:'2026-08-20', lokasiDiamati:['Ruang kelas','Halaman'], waktuPengamatan:['Istirahat'], jumlahSiswaL:90, jumlahSiswaP:88, siswaDisabilitasL:0, siswaDisabilitasP:1, jangkauanSiswa:2, kelasDiamati:'5A', namaGuruInisial:'TH', jenisKelaminGuru:'P', mataPelajaran:'Tematik', jawaban: makeMockJawaban(72), status:'submitted' },
  { id:'sel_12',sekolahId:'s012', sekolahNama:'SDN Bumiaji 2',    kecamatan:'Kec. Bumiaji',  kabupaten:'Kota Batu',     observerNama:'Rina P.',  tanggal:'2026-08-21', lokasiDiamati:['Ruang kelas'], waktuPengamatan:['Sebelum masuk'], jumlahSiswaL:65, jumlahSiswaP:68, siswaDisabilitasL:1, siswaDisabilitasP:0, jangkauanSiswa:3, kelasDiamati:'4B', namaGuruInisial:'DA', jenisKelaminGuru:'L', mataPelajaran:'Matematika', jawaban: makeMockJawaban(38), status:'submitted' },
  { id:'sel_13',sekolahId:'s013', sekolahNama:'SDN Junrejo 1',    kecamatan:'Kec. Junrejo',  kabupaten:'Kota Batu',     observerNama:'Rina P.',  tanggal:'2026-08-22', lokasiDiamati:['Ruang kelas','Perpustakaan'], waktuPengamatan:['Istirahat','Ekskul'], jumlahSiswaL:78, jumlahSiswaP:80, siswaDisabilitasL:0, siswaDisabilitasP:2, jangkauanSiswa:1, kelasDiamati:'6C', namaGuruInisial:'NI', jenisKelaminGuru:'P', mataPelajaran:'IPA', jawaban: makeMockJawaban(85), status:'submitted' },
  // Kab. Tuban
  { id:'sel_14',sekolahId:'s014', sekolahNama:'SDN Tuban 3',      kecamatan:'Kec. Tuban',    kabupaten:'Kab. Tuban',    observerNama:'Doni K.',  tanggal:'2026-08-20', lokasiDiamati:['Ruang kelas','Kantin'], waktuPengamatan:['Istirahat'], jumlahSiswaL:105, jumlahSiswaP:102, siswaDisabilitasL:1, siswaDisabilitasP:0, jangkauanSiswa:2, kelasDiamati:'5C', namaGuruInisial:'WS', jenisKelaminGuru:'L', mataPelajaran:'IPS', jawaban: makeMockJawaban(61), status:'submitted' },
  { id:'sel_15',sekolahId:'s015', sekolahNama:'SDN Semanding 1',  kecamatan:'Kec. Semanding', kabupaten:'Kab. Tuban',   observerNama:'Doni K.',  tanggal:'2026-08-21', lokasiDiamati:['Ruang kelas'], waktuPengamatan:['Sebelum masuk','Istirahat'], jumlahSiswaL:82, jumlahSiswaP:85, siswaDisabilitasL:0, siswaDisabilitasP:0, jangkauanSiswa:3, kelasDiamati:'3B', namaGuruInisial:'FH', jenisKelaminGuru:'P', mataPelajaran:'Bahasa Indonesia', jawaban: makeMockJawaban(22), status:'submitted' },
  { id:'sel_16',sekolahId:'s016', sekolahNama:'SDN Palang 2',     kecamatan:'Kec. Palang',   kabupaten:'Kab. Tuban',    observerNama:'Doni K.',  tanggal:'2026-08-22', lokasiDiamati:['Ruang kelas','Halaman'], waktuPengamatan:['Istirahat'], jumlahSiswaL:70, jumlahSiswaP:73, siswaDisabilitasL:2, siswaDisabilitasP:1, jangkauanSiswa:4, kelasDiamati:'2A', namaGuruInisial:'PK', jenisKelaminGuru:'L', mataPelajaran:'PJOK', jawaban: makeMockJawaban(49), status:'submitted' },
  { id:'sel_17',sekolahId:'s017', sekolahNama:'SDN Jenu 1',       kecamatan:'Kec. Jenu',     kabupaten:'Kab. Tuban',    observerNama:'Lina M.',  tanggal:'2026-08-23', lokasiDiamati:['Ruang kelas','Lorong'], waktuPengamatan:['Istirahat'], jumlahSiswaL:60, jumlahSiswaP:63, siswaDisabilitasL:0, siswaDisabilitasP:1, jangkauanSiswa:2, kelasDiamati:'4A', namaGuruInisial:'RS', jenisKelaminGuru:'P', mataPelajaran:'Tematik', jawaban: makeMockJawaban(76), status:'submitted' },
  { id:'sel_18',sekolahId:'s018', sekolahNama:'SDN Merakurak 2',  kecamatan:'Kec. Merakurak', kabupaten:'Kab. Tuban',   observerNama:'Lina M.',  tanggal:'2026-08-24', lokasiDiamati:['Ruang kelas'], waktuPengamatan:['Sebelum masuk'], jumlahSiswaL:55, jumlahSiswaP:58, siswaDisabilitasL:1, siswaDisabilitasP:0, jangkauanSiswa:3, kelasDiamati:'5B', namaGuruInisial:'AL', jenisKelaminGuru:'L', mataPelajaran:'Matematika', jawaban: makeMockJawaban(31), status:'submitted' },
];

function computeSELScore(session: SELObservasiSession): SELSchoolScore {
  const jawabanMap: Record<string, SELSkor | null> = {};
  session.jawaban.forEach(j => { jawabanMap[j.indikatorId] = j.skor; });

  const dimensiScores: SELDimensiScore[] = SEL_DIMENSI_ORDER.map(d => ({
    dimensi: d,
    label: SEL_DIMENSI_LABEL[d],
    guruSkor: hitungSkorRata(jawabanMap, 'guru', d),
    muridSkor: hitungSkorRata(jawabanMap, 'murid', d),
    rataRata: hitungSkorRata(jawabanMap, undefined, d),
  }));

  const guruTotal  = hitungSkorRata(jawabanMap, 'guru');
  const muridTotal = hitungSkorRata(jawabanMap, 'murid');
  const totalRata  = Math.round(((guruTotal + muridTotal) / 2) * 10) / 10;

  // Derive kuesioner score from school status in schools data
  const school = schoolsData.find(s => s.nama === session.sekolahNama ||
    s.kecamatan === session.kecamatan);
  const kuisionerScore = school
    ? school.status === 'sudah' ? 75 + (parseInt(school.npsn || '0') % 20)
      : school.status === 'sebagian' ? 40 + (parseInt(school.npsn || '0') % 30)
      : 15 + (parseInt(school.npsn || '0') % 20)
    : 50;

  return {
    sekolahId: session.sekolahId,
    sekolahNama: session.sekolahNama,
    kecamatan: session.kecamatan,
    kabupaten: session.kabupaten,
    tanggal: session.tanggal,
    guruTotal,
    muridTotal,
    totalRata,
    dimensi: dimensiScores,
    kuisionerScore,
  };
}

export const selObservasiData: SELObservasiSession[] = SEL_MOCK_SESSIONS;

// ─── End SEL Data ─────────────────────────────────────────────

export interface ProporsiModulData {
  proporsiPenerima: { ya: number; tidak: number; totalResponden: number };
  distribusiPerKecamatan: { kecamatan: string; ya: number; tidak: number }[];
  penyelenggaraPelatihan: { nama: string; jumlah: number }[];
  statusImplementasiPosisi: { posisi: string; belumMenerima: number; tidakMenerapkan: number; sebagian: number; sudah: number }[];
  statusImplementasiKecamatan: { kecamatan: string; belumMenerima: number; tidakMenerapkan: number; sebagian: number; sudah: number }[];
  kemudahanModul: {
    kelasAwal: { mudah: { modul: string; persen: number }[]; sulit: { modul: string; persen: number }[] };
    kelasTinggi: { mudah: { modul: string; persen: number }[]; sulit: { modul: string; persen: number }[] };
  };
  mediaPembelajaran: {
    kelasAwal: { media: string; persen: number }[];
    kelasTinggi: { media: string; persen: number }[];
  };
  keterlibatanSiswa: { kategori: string; persen: number; jumlah: number }[];
  refleksiGuru: string[];
  dukunganKepsek: { metode: string; jumlah: number }[];
  rencanaAksi: { program: string; jumlah: number }[];
  kondisiFasilitas: { kecamatan: string; baik: number; cukup: number; rusak: number }[];
  rasioGuruSiswa: { kecamatan: string; rasio: number }[];
  kelayakanRuangKelas: { kecamatan: string; rombel: number; kelasLayak: number; persentase: number }[];
}

export const KABUPATEN_NAME_TO_ID: Record<string, number | undefined> = {
  'Semua Wilayah': undefined,
  'Semua Kabupaten': undefined,
  'Kab. Sidoarjo': 1,
  'Kota Batu': 2,
  'Kab. Tuban': 3,
  'Sidoarjo': 1,
  'Batu': 2,
  'Tuban': 3,
};

export const KABUPATEN_LIST = [
  { id: 'Semua Wilayah', name: 'Semua Wilayah', key: 'semua', color: '#6366f1' },
  { id: 'Kab. Sidoarjo', name: 'Kab. Sidoarjo', key: 'sidoarjo', color: '#4A57C4' },
  { id: 'Kota Batu', name: 'Kota Batu', key: 'batu', color: '#6C7AE0' },
  { id: 'Kab. Tuban', name: 'Kab. Tuban', key: 'tuban', color: '#2FB344' }
];

export const KECAMATAN_LIST = [
  // Sidoarjo
  'Waru', 'Taman', 'Gedangan', 'Sedati', 'Buduran', 'Sukodono',
  'Sidoarjo', 'Krian', 'Balong Bendo', 'Tarik', 'Prambon', 'Krembung',
  'Porong', 'Jabon', 'Tanggulangin', 'Tulangan', 'Wonoayu', 'Candi',
  // Batu
  'Batu', 'Bumiaji', 'Junrejo',
  // Tuban
  'Tuban', 'Jenu', 'Merakurak', 'Semanding', 'Palang', 'Widang',
  'Babat', 'Plapak', 'Rengel', 'Soko', 'Parengan', 'Singgahan',
  'Senori', 'Bangilan', 'Jatirogo', 'Kenduruan', 'Montong', 'Kerek',
  'Tambakboyo', 'Bancar'
];

export const schoolsData: School[] = realSchoolsData as School[];
export const respondentsData: SurveyRespondent[] = realSurveyData.respondents as SurveyRespondent[];

export const database = {
  getSchools: async (filters?: {
    kabupaten?: string;
    kecamatan?: string;
    status?: string;
    search?: string;
  }): Promise<School[]> => {
    // 1. Try public getOptions endpoint first (unauthenticated friendly for registration dropdown)
    try {
      const optRes = await apiClient.sekolah.getOptions().catch(() => null);
      if (optRes?.success && Array.isArray(optRes.data) && optRes.data.length > 0) {
        return optRes.data.map((s: any) => ({
          id: String(s.id),
          npsn: s.npsn || '',
          nama: s.nama,
          kecamatan: s.kecamatan_nama || s.kecamatan || '',
          kabupaten: s.kabupaten_nama || s.kabupaten || '',
          status: 'belum',
          jenjang: s.jenjang || 'SD',
          statusSekolah: 'Negeri',
          totalGuru: 0,
          totalSiswa: 0,
          akreditasi: 'A',
          alamat: '',
          email: '',
          telepon: '',
          user_id: null,
          is_registered: false,
          x: 0,
          y: 0,
        }));
      }
    } catch (err) {
      console.warn('[data-source] getOptions fallback:', err);
    }

    // 2. Try full authenticated getAll query if available
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.sekolah.getAll({
        kabupaten_id: kabId,
        status: filters?.status,
        search: filters?.search,
        limit: 2000,
      });
      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((s: any) => ({
          id: String(s.id),
          npsn: s.npsn,
          nama: s.nama,
          kecamatan: s.kecamatan_nama || s.kecamatan || '',
          kabupaten: s.kabupaten_nama || s.kabupaten || '',
          status: s.status || 'belum',
          jenjang: s.jenjang || 'SD',
          statusSekolah: s.status_sekolah || 'Negeri',
          totalGuru: s.total_guru || 0,
          totalSiswa: s.total_siswa || 0,
          akreditasi: s.akreditasi || 'A',
          alamat: s.alamat || '',
          email: s.email || '',
          telepon: s.telepon || '',
          user_id: s.user_id,
          is_registered: Boolean(s.is_registered),
          x: 0,
          y: 0,
        }));
      }
    } catch (err) {
      console.warn('[data-source] getSchools fallback:', err);
    }

    return schoolsData.filter(s => {
      let match = true;
      if (filters?.kabupaten && s.kabupaten !== filters.kabupaten) match = false;
      if (filters?.kecamatan && s.kecamatan !== filters.kecamatan) match = false;
      if (filters?.status && s.status !== filters.status) match = false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        match = s.nama.toLowerCase().includes(q) || s.npsn.includes(q);
      }
      return match;
    });
  },

  getKabupatenList: async (): Promise<Array<{ id: number; nama: string }>> => {
    try {
      const res = await apiClient.sekolah.getKabupaten();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((item: any) => ({
          id: item.id || KABUPATEN_NAME_TO_ID[item.nama || item.name || item] || 1,
          nama: item.nama || item.name || String(item),
        }));
      }
    } catch (err) {
      console.warn('[data-source] getKabupatenList API fallback:', err);
    }
    // Extract unique kabupaten from real-time database schools
    const schools = await database.getSchools();
    const uniqueKabs = Array.from(new Set(schools.map(s => s.kabupaten).filter(Boolean)));
    if (uniqueKabs.length > 0) {
      return uniqueKabs.map((kName, idx) => ({ id: KABUPATEN_NAME_TO_ID[kName] || (idx + 1), nama: kName }));
    }
    return KABUPATEN_LIST.map(k => ({ id: KABUPATEN_NAME_TO_ID[k.name] || 1, nama: k.name }));
  },

  getKecamatanList: async (kabupaten?: string): Promise<Array<{ id: number; nama: string; kabupaten_nama?: string }>> => {
    try {
      const kabIdNum = kabupaten ? KABUPATEN_NAME_TO_ID[kabupaten] : undefined;
      const res = await apiClient.sekolah.getKecamatan(kabIdNum);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((item: any, idx: number) => ({
          id: item.id || (idx + 1),
          nama: item.nama || item.name || String(item),
          kabupaten_nama: item.kabupaten_nama || kabupaten,
        }));
      }
    } catch (err) {
      console.warn('[data-source] getKecamatanList API fallback:', err);
    }
    // Extract unique kecamatan from real-time database schools
    const schools = await database.getSchools({ kabupaten });
    const uniqueKec = Array.from(new Set(schools.map(s => s.kecamatan).filter(Boolean)));
    if (uniqueKec.length > 0) {
      return uniqueKec.map((kName, idx) => ({ id: idx + 1, nama: kName, kabupaten_nama: kabupaten }));
    }
    return KECAMATAN_LIST.map((k, idx) => ({ id: idx + 1, nama: k, kabupaten_nama: kabupaten }));
  },

  getRespondents: async (filters?: {
    kabupaten?: string;
    kecamatan?: string;
    search?: string;
  }): Promise<SurveyRespondent[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.responden.getAll({
        kabupaten_id: kabId,
        search: filters?.search,
        limit: 200,
      });
      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((r: any) => ({
          id: String(r.id),
          timestamp: r.submitted_at ? String(r.submitted_at).slice(0, 19).replace('T', ' ') : '',
          nama: r.nama,
          jenisKelamin: r.jenis_kelamin,
          posisi: r.posisi,
          sekolah: r.sekolah,
          npsn: r.npsn,
          kabupaten: r.kabupaten,
          kecamatan: r.kecamatan,
          penerima: r.penerima_modul,
          penyelenggara: r.penyelenggara_pelatihan || '-',
          statusImplementasi: r.status_implementasi || 'belum',
          kelasMengajar: r.kelas_mengajar || '-',
        }));
      }
    } catch (err) {
      console.warn('[data-source] getRespondents fallback:', err);
    }
    return [];
  },

  getKabupatenStats: async (): Promise<KabupatenStat[]> => {
    return new Promise((resolve) => {
      const stats: Record<string, KabupatenStat> = {
        'Kab. Sidoarjo': { kabupaten: 'Kab. Sidoarjo', total: 0, belum: 0, sebagian: 0, sudah: 0, rate: 0, color: '#4A57C4' },
        'Kota Batu': { kabupaten: 'Kota Batu', total: 0, belum: 0, sebagian: 0, sudah: 0, rate: 0, color: '#6C7AE0' },
        'Kab. Tuban': { kabupaten: 'Kab. Tuban', total: 0, belum: 0, sebagian: 0, sudah: 0, rate: 0, color: '#2FB344' }
      };

      schoolsData.forEach(s => {
        if (stats[s.kabupaten]) {
          stats[s.kabupaten].total++;
          stats[s.kabupaten][s.status]++;
        }
      });

      const list = Object.values(stats).map(item => {
        item.rate = item.total > 0 ? Math.round(((item.sudah + item.sebagian * 0.5) / item.total) * 100) : 0;
        return item;
      }).sort((a, b) => b.rate - a.rate);

      setTimeout(() => resolve(list), 100);
    });
  },

  getKecamatanStats: async (kabupatenFilter?: string): Promise<KecamatanStat[]> => {
    return new Promise((resolve) => {
      const filtered = kabupatenFilter
        ? schoolsData.filter(s => s.kabupaten === kabupatenFilter)
        : schoolsData;

      const stats: Record<string, KecamatanStat> = {};

      filtered.forEach(s => {
        if (!stats[s.kecamatan]) {
          stats[s.kecamatan] = {
            kecamatan: s.kecamatan,
            kabupaten: s.kabupaten,
            total: 0,
            belum: 0,
            sebagian: 0,
            sudah: 0,
            rate: 0
          };
        }
        stats[s.kecamatan].total++;
        stats[s.kecamatan][s.status]++;
      });

      const list = Object.values(stats)
        .map(item => {
          item.rate = item.total > 0 ? Math.round((item.sudah / item.total) * 100) : 0;
          return item;
        })
        .sort((a, b) => b.rate - a.rate);

      setTimeout(() => resolve(list), 100);
    });
  },

  getModulProgress: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<ModulProgress[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.analisis.getModulProgress(kabId);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(item => ({
          id: item.id,
          nama: item.nama,
          progres: item.progres ?? 0,
          totalPertanyaan: item.totalPertanyaan ?? 0,
          terisi: item.terisi ?? 0,
        }));
      }
    } catch (err) {
      console.warn('[data-source] getModulProgress fallback:', err);
    }

    const targetKab = filters?.kabupaten || 'Kab. Sidoarjo';
    const respondents = respondentsData.filter(r => {
      let match = true;
      if (targetKab && r.kabupaten !== targetKab) match = false;
      if (filters?.kecamatan && r.kecamatan !== filters.kecamatan) match = false;
      return match;
    });

    const totalResp = respondents.length || 1;
    const penerimaCount = respondents.filter(r => r.penerima === 'Ya').length;
    const implSudahCount = respondents.filter(r => r.statusImplementasi === 'sudah').length;
    const implSebagianCount = respondents.filter(r => r.statusImplementasi === 'sebagian').length;

    const baseRate = (penerimaCount / totalResp) * 100;
    const implRate = ((implSudahCount + implSebagianCount * 0.5) / totalResp) * 100;

    const selSessions = SEL_MOCK_SESSIONS.filter(s => s.kabupaten === targetKab);
    let selWithMyself = 0;
    let selWithOthers = 0;
    let selWithChallenges = 0;

    if (selSessions.length > 0) {
      const computed = selSessions.map(s => computeSELScore(s));
      const wmAvg = computed.flatMap(c => c.dimensi.filter(d => d.dimensi === 'kesadaran_diri' || d.dimensi === 'regulasi_emosi'));
      if (wmAvg.length > 0) selWithMyself = (wmAvg.reduce((sum, d) => sum + d.rataRata, 0) / wmAvg.length) * 20;

      const woAvg = computed.flatMap(c => c.dimensi.filter(d => d.dimensi === 'kesadaran_sosial' || d.dimensi === 'keterampilan_relasi'));
      if (woAvg.length > 0) selWithOthers = (woAvg.reduce((sum, d) => sum + d.rataRata, 0) / woAvg.length) * 20;

      const wcAvg = computed.flatMap(c => c.dimensi.filter(d => d.dimensi === 'tanggung_jawab'));
      if (wcAvg.length > 0) selWithChallenges = (wcAvg.reduce((sum, d) => sum + d.rataRata, 0) / wcAvg.length) * 20;
    }

    const totalSemuaRespondenWilayah = respondents.length;
    const sudahMengisiKuesionerCount = implSudahCount + implSebagianCount;

    return [
      {
        id: 'with_myself',
        nama: 'With Myself: Dengan Diriku',
        progres: Math.min(100, Math.round(baseRate * 0.40 + implRate * 0.30 + selWithMyself * 0.30)),
        totalPertanyaan: totalSemuaRespondenWilayah,
        terisi: sudahMengisiKuesionerCount,
      },
      {
        id: 'with_others',
        nama: 'With Others: Dengan Orang Lain',
        progres: Math.min(100, Math.round(baseRate * 0.38 + implRate * 0.32 + selWithOthers * 0.30)),
        totalPertanyaan: totalSemuaRespondenWilayah,
        terisi: sudahMengisiKuesionerCount,
      },
      {
        id: 'with_challenges',
        nama: 'With Our Challenges: Dengan Tantangan Kita',
        progres: Math.min(100, Math.round(baseRate * 0.35 + implRate * 0.35 + selWithChallenges * 0.30)),
        totalPertanyaan: totalSemuaRespondenWilayah,
        terisi: sudahMengisiKuesionerCount,
      },
    ];
  },

  getTimeSeriesData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<TimeSeriesPoint[]> => {
    return new Promise((resolve) => {
      const filtered = schoolsData.filter(s => {
        let match = true;
        if (filters?.kabupaten && s.kabupaten !== filters.kabupaten) match = false;
        if (filters?.kecamatan && s.kecamatan !== filters.kecamatan) match = false;
        return match;
      });

      const total = filtered.length || 100;
      const data: TimeSeriesPoint[] = [
        { date: '1 Sep', sudah: Math.floor(total * 0.05), sebagian: Math.floor(total * 0.08) },
        { date: '2 Sep', sudah: Math.floor(total * 0.15), sebagian: Math.floor(total * 0.18) },
        { date: '3 Sep', sudah: Math.floor(total * 0.28), sebagian: Math.floor(total * 0.25) },
        { date: '4 Sep', sudah: Math.floor(total * 0.42), sebagian: Math.floor(total * 0.32) },
        { date: '5 Sep', sudah: Math.floor(total * 0.58), sebagian: Math.floor(total * 0.35) },
        { date: '6 Sep', sudah: Math.floor(total * 0.68), sebagian: Math.floor(total * 0.28) },
        { date: '7 Sep', sudah: Math.floor(total * 0.75), sebagian: Math.floor(total * 0.22) },
      ];
      setTimeout(() => resolve(data), 100);
    });
  },

  getSuaraRespondenData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<any[]> => {
    return new Promise((resolve) => {
      const filtered = schoolsData.filter(s => {
        let match = true;
        if (filters?.kabupaten && s.kabupaten !== filters.kabupaten) match = false;
        if (filters?.kecamatan && s.kecamatan !== filters.kecamatan) match = false;
        return match;
      });

      const templates = [
        { m: 'Modul 1: Literasi & Numerasi', s: 'positif', c: 'Penerapan modul literasi dasar berjalan sangat lancar dibantu media ajar manipulatif, anak-anak jadi lebih antusias.' },
        { m: 'Modul 4: Lingkungan Belajar', s: 'negatif', c: 'Kami sangat membutuhkan bantuan tambahan laptop untuk laboratorium komputer agar pembelajaran literasi digital bisa maksimal.' },
        { m: 'Modul 2: Pengembangan Karakter', s: 'netral', c: 'Pelaksanaan projek P5 terkendala koordinasi waktu dan penyediaan bahan ajar pendukung yang minim dari komite.' },
        { m: 'Modul 3: Kepemimpinan Instruksional', s: 'positif', c: 'Supervisi akademik oleh kepala sekolah sudah rutin dilakukan, sangat membantu peningkatan kompetensi pengajaran guru.' },
        { m: 'Modul 5: Kemitraan Orang Tua', s: 'negatif', c: 'Kehadiran wali murid di forum kelas orang tua masih rendah karena mayoritas bekerja shift pabrik.' },
        { m: 'Modul 4: Lingkungan Belajar', s: 'negatif', c: 'Jaringan internet di sekolah kami sering mati saat siang hari, mengganggu latihan ujian numerasi online.' },
        { m: 'Modul 1: Literasi & Numerasi', s: 'netral', c: 'Kami membutuhkan buku bacaan tingkat awal yang lebih bervariasi untuk pojok baca kelas.' },
        { m: 'Modul 2: Pengembangan Karakter', s: 'positif', c: 'Anak-anak mulai terbiasa dengan budaya 5S setiap pagi di gerbang sekolah.' },
        { m: 'Modul 5: Kemitraan Orang Tua', s: 'positif', c: 'Grup paguyuban wali murid sangat aktif membantu kegiatan peringatan hari besar agama di sekolah.' },
        { m: 'Modul 3: Kepemimpinan Instruksional', s: 'negatif', c: 'Pelatihan guru KKG di tingkat gugus kurang merata, kami harap dinas sering turun langsung.' }
      ];

      const limit = Math.min(filtered.length, 50);
      const data = filtered.slice(0, limit).map((s, idx) => {
        const t = templates[idx % templates.length];
        return {
          id: s.id,
          schoolName: s.nama,
          kecamatan: s.kecamatan,
          modul: t.m,
          comment: t.c,
          sentiment: t.s,
          date: `2026-08-${String(20 - (idx % 10)).padStart(2, '0')}`
        };
      });

      setTimeout(() => resolve(data), 100);
    });
  },

  getGapFunnelData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<FunnelStep[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.analisis.getFunnel(kabId);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('[data-source] getGapFunnelData fallback:', err);
    }

    const filtered = schoolsData.filter(s => {
      let match = true;
      if (filters?.kabupaten && s.kabupaten !== filters.kabupaten) match = false;
      if (filters?.kecamatan && s.kecamatan !== filters.kecamatan) match = false;
      return match;
    });

    const total = filtered.length;
    const mengisi = filtered.filter(s => s.status === 'sudah' || s.status === 'sebagian').length;
    const memenuhiM1 = Math.round(mengisi * 0.78);
    const memenuhiM2 = Math.round(memenuhiM1 * 0.70);
    const memenuhiM3 = Math.round(memenuhiM2 * 0.62);

    return [
      { name: 'Total Sasaran Sekolah', schools: total, percentage: 100 },
      { name: 'Mengisi Survei (Aktif)', schools: mengisi, percentage: total > 0 ? Math.round((mengisi / total) * 100) : 0 },
      { name: 'Memenuhi Tahap 1 & 2', schools: memenuhiM1, percentage: total > 0 ? Math.round((memenuhiM1 / total) * 100) : 0 },
      { name: 'Memenuhi Standar Mutu', schools: memenuhiM2, percentage: total > 0 ? Math.round((memenuhiM2 / total) * 100) : 0 },
      { name: 'Lulus Kategori Utama', schools: memenuhiM3, percentage: total > 0 ? Math.round((memenuhiM3 / total) * 100) : 0 },
    ];
  },

  getMatriksKuadranData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<MatrixPoint[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.analisis.getMatriks(kabId);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((r: any, idx: number) => ({
          id: String(idx + 1),
          name: r.kecamatan,
          kecamatan: r.kecamatan,
          implementation: Number(r.implementasi_persen || 0),
          readiness: Number(r.penerimaan_persen || 0),
          status: (r.implementasi_persen >= 60 ? 'sudah' : r.implementasi_persen >= 30 ? 'sebagian' : 'belum') as any,
        }));
      }
    } catch (err) {
      console.warn('[data-source] getMatriksKuadranData fallback:', err);
    }

    const filtered = schoolsData.filter(s => {
      let match = true;
      if (filters?.kabupaten && s.kabupaten !== filters.kabupaten) match = false;
      if (filters?.kecamatan && s.kecamatan !== filters.kecamatan) match = false;
      return match;
    });

    return filtered.map((s, idx) => {
      let implementation = 0;
      let readiness = 0;
      const seed = (s.npsn ? parseInt(s.npsn) : idx) % 100;

      if (s.status === 'sudah') {
        implementation = 60 + (seed % 35);
        readiness = 65 + (seed % 30);
      } else if (s.status === 'sebagian') {
        implementation = 35 + (seed % 30);
        readiness = 40 + (seed % 35);
      } else {
        implementation = 15 + (seed % 25);
        readiness = 20 + (seed % 30);
      }

      return {
        id: s.id,
        name: s.nama,
        kecamatan: s.kecamatan,
        implementation,
        readiness,
        status: s.status
      };
    }).slice(0, 150);
  },

  getTantanganData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<ChallengeStat[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.analisis.getTantangan(kabId);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const colors = ['#E5484D', '#F5A623', '#4A57C4', '#6C7AE0', '#2FB344'];
        return res.data.map((r: any, idx: number) => ({
          category: r.kategori,
          count: Number(r.jumlah || 0),
          percentage: Number(r.persen || 0),
          color: colors[idx % colors.length],
        }));
      }
    } catch (err) {
      console.warn('[data-source] getTantanganData fallback:', err);
    }

    return [
      { category: 'Keterbatasan Perangkat Digital / Laptop', count: 348, percentage: 36.8, color: '#E5484D' },
      { category: 'Jaringan Internet Tidak Stabil', count: 236, percentage: 25.0, color: '#F5A623' },
      { category: 'Kurangnya Pelatihan Guru tentang BSAN', count: 155, percentage: 16.4, color: '#4A57C4' },
      { category: 'Bahan Ajar Cetak Belum Lengkap', count: 121, percentage: 12.8, color: '#6C7AE0' },
      { category: 'Kurang Kemitraan dari Orang Tua', count: 85, percentage: 9.0, color: '#2FB344' },
    ];
  },

  getRecentActivities: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<{ schoolName: string; status: string; time: string }[]> => {
    return new Promise((resolve) => {
      const filtered = schoolsData.filter(s => {
        let match = true;
        if (filters?.kabupaten && s.kabupaten !== filters.kabupaten) match = false;
        if (filters?.kecamatan && s.kecamatan !== filters.kecamatan) match = false;
        return match;
      });

      const list = filtered
        .filter(s => s.status !== 'belum')
        .slice(0, 5)
        .map((s, idx) => ({
          schoolName: s.nama,
          status: s.status,
          time: `Hari ini, 0${(idx % 8) + 8}:24 WIB`
        }));
      resolve(list);
    });
  },

  getFollowUpList: async (kabupatenFilter?: string): Promise<School[]> => {
    return new Promise((resolve) => {
      const filtered = kabupatenFilter
        ? schoolsData.filter(s => s.kabupaten === kabupatenFilter)
        : schoolsData;

      const list = filtered.filter(s => s.status === 'belum').slice(0, 20);
      resolve(list);
    });
  },

  sendReminder: async (schoolId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 300);
    });
  },

  getProporsiModulData: async (kabupaten?: string): Promise<ProporsiModulData> => {
    return new Promise((resolve) => {
      const targetKab = kabupaten || 'Kab. Sidoarjo';
      const respondents = respondentsData.filter(r => r.kabupaten === targetKab);
      const totalResponden = respondents.length || (targetKab === 'Kota Batu' ? 273 : targetKab === 'Kab. Tuban' ? 715 : 113);

      const yaCount = respondents.filter(r => r.penerima === 'Ya').length;
      const tidakCount = totalResponden - yaCount;
      const yaPercent = Math.round((yaCount / totalResponden) * 100) || (targetKab === 'Kota Batu' ? 54 : targetKab === 'Kab. Tuban' ? 55 : 37);
      const tidakPercent = 100 - yaPercent;

      // Group distribution per kecamatan
      const kecMap: Record<string, { ya: number; tidak: number; total: number }> = {};
      respondents.forEach(r => {
        if (!r.kecamatan) return;
        if (!kecMap[r.kecamatan]) kecMap[r.kecamatan] = { ya: 0, tidak: 0, total: 0 };
        kecMap[r.kecamatan].total++;
        if (r.penerima === 'Ya') kecMap[r.kecamatan].ya++;
        else kecMap[r.kecamatan].tidak++;
      });

      let distribusiPerKecamatan = Object.keys(kecMap).map(k => {
        const item = kecMap[k];
        const yaP = Math.round((item.ya / item.total) * 100);
        return { kecamatan: k, ya: yaP, tidak: 100 - yaP };
      });

      if (distribusiPerKecamatan.length === 0) {
        // Fallback kecamatan list if empty
        const kecs = targetKab === 'Kota Batu' ? ['Batu', 'Bumiaji', 'Junrejo'] :
                     targetKab === 'Kab. Tuban' ? ['Tuban', 'Jenu', 'Merakurak', 'Semanding', 'Palang', 'Widang', 'Bancar'] :
                     ['Sidoarjo', 'Buduran', 'Candi', 'Porong', 'Krembung', 'Krian', 'Waru', 'Taman'];
        distribusiPerKecamatan = kecs.map((k, i) => ({
          kecamatan: k,
          ya: 45 + (i * 5) % 25,
          tidak: 55 - (i * 5) % 25
        }));
      }

      // Penyelenggara Pelatihan
      const penMap: Record<string, number> = {};
      respondents.forEach(r => {
        if (r.penyelenggara && r.penyelenggara !== '-') {
          const items = r.penyelenggara.split(/[,;]/);
          items.forEach(it => {
            let clean = it.trim();
            if (clean.length > 25) {
              if (clean.toLowerCase().includes('inovasi')) clean = 'INOVASI / Dinas';
              else if (clean.toLowerCase().includes('kkg') || clean.toLowerCase().includes('kkks')) clean = 'Diseminasi KKG / KKKS';
              else if (clean.toLowerCase().includes('internal') || clean.toLowerCase().includes('sekolah')) clean = 'Pelatihan Internal Sekolah';
              else clean = clean.slice(0, 22) + '...';
            }
            if (clean) penMap[clean] = (penMap[clean] || 0) + 1;
          });
        }
      });

      let penyelenggaraPelatihan = Object.keys(penMap).map(k => ({ nama: k, jumlah: penMap[k] })).sort((a, b) => b.jumlah - a.jumlah).slice(0, 8);
      if (penyelenggaraPelatihan.length === 0) {
        penyelenggaraPelatihan = [
          { nama: 'INOVASI - Dinas Pendidikan', jumlah: Math.round(totalResponden * 0.45) },
          { nama: 'Diseminasi KKG / KKKS', jumlah: Math.round(totalResponden * 0.38) },
          { nama: 'Pelatihan Internal Sekolah', jumlah: Math.round(totalResponden * 0.22) },
          { nama: 'Mandiri / Online Platform', jumlah: Math.round(totalResponden * 0.15) }
        ];
      }

      // Status Implementasi per Posisi
      const posMap: Record<string, { belumMenerima: number; tidakMenerapkan: number; sebagian: number; sudah: number; total: number }> = {};
      respondents.forEach(r => {
        let pos = (r.posisi || 'Guru').trim();
        // Clean long free-text position answers
        if (pos.length > 25) {
          if (pos.toLowerCase().includes('guru kelas 1')) pos = 'Guru Kelas 1';
          else if (pos.toLowerCase().includes('guru kelas 2')) pos = 'Guru Kelas 2';
          else if (pos.toLowerCase().includes('guru kelas 3')) pos = 'Guru Kelas 3';
          else if (pos.toLowerCase().includes('guru kelas 4')) pos = 'Guru Kelas 4';
          else if (pos.toLowerCase().includes('guru kelas 5')) pos = 'Guru Kelas 5';
          else if (pos.toLowerCase().includes('guru kelas 6')) pos = 'Guru Kelas 6';
          else if (pos.toLowerCase().includes('pjok')) pos = 'Guru PJOK';
          else if (pos.toLowerCase().includes('kepala sekolah')) pos = 'Kepala Sekolah';
          else pos = pos.slice(0, 22) + '...';
        }
        if (!posMap[pos]) posMap[pos] = { belumMenerima: 0, tidakMenerapkan: 0, sebagian: 0, sudah: 0, total: 0 };
        posMap[pos].total++;
        if (r.penerima === 'Tidak') posMap[pos].belumMenerima++;
        else if (r.statusImplementasi === 'sudah') posMap[pos].sudah++;
        else if (r.statusImplementasi === 'sebagian') posMap[pos].sebagian++;
        else posMap[pos].tidakMenerapkan++;
      });

      let statusImplementasiPosisi = Object.keys(posMap).map(p => {
        const item = posMap[p];
        const tot = item.total || 1;
        return {
          posisi: p,
          belumMenerima: Math.round((item.belumMenerima / tot) * 100),
          tidakMenerapkan: Math.round((item.tidakMenerapkan / tot) * 100),
          sebagian: Math.round((item.sebagian / tot) * 100),
          sudah: Math.round((item.sudah / tot) * 100)
        };
      }).slice(0, 10);

      if (statusImplementasiPosisi.length === 0) {
        statusImplementasiPosisi = [
          { posisi: 'Kepala Sekolah', belumMenerima: 15, tidakMenerapkan: 5, sebagian: 30, sudah: 50 },
          { posisi: 'Guru Kelas Awal (1-3)', belumMenerima: 25, tidakMenerapkan: 10, sebagian: 35, sudah: 30 },
          { posisi: 'Guru Kelas Tinggi (4-6)', belumMenerima: 30, tidakMenerapkan: 12, sebagian: 32, sudah: 26 },
          { posisi: 'Guru Mapel / PJOK', belumMenerima: 40, tidakMenerapkan: 15, sebagian: 28, sudah: 17 }
        ];
      }

      // Status Implementasi per Kecamatan
      const kecImplMap: Record<string, { belumMenerima: number; tidakMenerapkan: number; sebagian: number; sudah: number; total: number }> = {};
      respondents.forEach(r => {
        let kec = (r.kecamatan || '').trim();
        if (!kec) return;
        if (kec.length > 25) {
          kec = kec.slice(0, 22) + '...';
        }
        if (!kecImplMap[kec]) kecImplMap[kec] = { belumMenerima: 0, tidakMenerapkan: 0, sebagian: 0, sudah: 0, total: 0 };
        kecImplMap[kec].total++;
        if (r.penerima === 'Tidak') kecImplMap[kec].belumMenerima++;
        else if (r.statusImplementasi === 'sudah') kecImplMap[kec].sudah++;
        else if (r.statusImplementasi === 'sebagian') kecImplMap[kec].sebagian++;
        else kecImplMap[kec].tidakMenerapkan++;
      });

      let statusImplementasiKecamatan = Object.keys(kecImplMap).map(k => {
        const item = kecImplMap[k];
        const tot = item.total || 1;
        return {
          kecamatan: k,
          belumMenerima: Math.round((item.belumMenerima / tot) * 100),
          tidakMenerapkan: Math.round((item.tidakMenerapkan / tot) * 100),
          sebagian: Math.round((item.sebagian / tot) * 100),
          sudah: Math.round((item.sudah / tot) * 100)
        };
      }).slice(0, 10);

      if (statusImplementasiKecamatan.length === 0) {
        statusImplementasiKecamatan = distribusiPerKecamatan.map((d, i) => ({
          kecamatan: d.kecamatan,
          belumMenerima: d.tidak,
          tidakMenerapkan: 10,
          sebagian: 30 + (i * 3) % 15,
          sudah: Math.max(0, d.ya - 10 - ((i * 3) % 15))
        }));
      }

      const data: ProporsiModulData = {
        proporsiPenerima: { ya: yaPercent, tidak: tidakPercent, totalResponden },
        distribusiPerKecamatan,
        penyelenggaraPelatihan,
        statusImplementasiPosisi,
        statusImplementasiKecamatan,
        kemudahanModul: {
          kelasAwal: {
            mudah: [
              { modul: 'Alur 1: Tema 1-5 (Tubuhku & Karakter)', persen: 72 },
              { modul: 'Alur 2: Tema 6-7 (Keunikan & Emosi)', persen: 65 },
              { modul: 'Alur 3: Tema 8-10 (Jaga Diri & Literasi)', persen: 58 },
            ],
            sulit: [
              { modul: 'Alur 1: Tema 1-5 (Tubuhku & Karakter)', persen: 28 },
              { modul: 'Alur 2: Tema 6-7 (Keunikan & Emosi)', persen: 35 },
              { modul: 'Alur 3: Tema 8-10 (Jaga Diri & Literasi)', persen: 42 },
            ],
          },
          kelasTinggi: {
            mudah: [
              { modul: 'Alur 1: Tema 1-4 (Perasaan & Afirmasi)', persen: 68 },
              { modul: 'Alur 2: Tema 5-9 (Persahabatan & Tanggung Jawab)', persen: 62 },
              { modul: 'Alur 3: Tema 10-12 (Kampanye & Refleksi)', persen: 54 },
            ],
            sulit: [
              { modul: 'Alur 1: Tema 1-4 (Perasaan & Afirmasi)', persen: 32 },
              { modul: 'Alur 2: Tema 5-9 (Persahabatan & Tanggung Jawab)', persen: 38 },
              { modul: 'Alur 3: Tema 10-12 (Kampanye & Refleksi)', persen: 46 },
            ],
          },
        },
        mediaPembelajaran: {
          kelasAwal: [
            { media: 'Kartu Afirmasi Positif & Emosi', persen: 82 },
            { media: 'Video & LKPD Interaktif', persen: 74 },
            { media: 'Poster Menjaga Diri & Area Pribadi', persen: 68 },
            { media: 'Papan Ular Tangga & Puzzle Tubuhku', persen: 56 },
            { media: 'Stiker Emoji & Roda Emosi', persen: 48 },
          ],
          kelasTinggi: [
            { media: 'Peta Tubuh & Kartu Cerita', persen: 78 },
            { media: 'Video & Media Gambar', persen: 72 },
            { media: 'Kartu Berhenti, Berpikir & Bertindak', persen: 64 },
            { media: 'Poster Hak Anak & Kampanye', persen: 58 },
            { media: 'Buku Cerita & Stiker Pembaca', persen: 45 },
          ],
        },
        keterlibatanSiswa: [
          { kategori: 'Sangat Aktif (>70% partisipasi)', persen: 38, jumlah: Math.round(totalResponden * 0.38) },
          { kategori: 'Aktif (50-70% partisipasi)', persen: 42, jumlah: Math.round(totalResponden * 0.42) },
          { kategori: 'Kurang Aktif (<50% partisipasi)', persen: 20, jumlah: Math.round(totalResponden * 0.20) },
        ],
        refleksiGuru: [
          'Siswa menjadi jauh lebih terbuka menyampaikan emosi dan perasaan setelah penerapan media Kartu Roda Emosi.',
          'Pembiasaan kesepakatan kelas terbukti menekan angka perundungan verbal di kalangan siswa.',
          'Diperlukan pendampingan berkala bagi sekolah yang belum mengimplementasikan modul secara penuh.',
          'Refleksi rutin antara guru dan kepala sekolah meningkatkan kesepahaman strategi manajemen kelas aman.',
        ],
        dukunganKepsek: [
          { metode: 'Memimpin Refleksi Guru Berkala', jumlah: Math.round(totalResponden * 0.65) },
          { metode: 'Sosialisasi BSAN ke Wali Murid', jumlah: Math.round(totalResponden * 0.58) },
          { metode: 'Membangun Kolaborasi Pihak Luar', jumlah: Math.round(totalResponden * 0.45) },
          { metode: 'Integrasi Kurikulum BSAN', jumlah: Math.round(totalResponden * 0.40) },
        ],
        rencanaAksi: [
          { program: 'Menyusun SOP Pencegahan Kekerasan', jumlah: Math.round(totalResponden * 0.72) },
          { program: 'Membentuk Tim TPKK Sekolah', jumlah: Math.round(totalResponden * 0.68) },
          { program: 'Program Pembiasaan Karakter Harian', jumlah: Math.round(totalResponden * 0.62) },
          { program: 'Kotak Aduan & Poster Sekolah Aman', jumlah: Math.round(totalResponden * 0.55) },
        ],
        kondisiFasilitas: distribusiPerKecamatan.map((d, i) => ({
          kecamatan: d.kecamatan,
          baik: 70 + (i * 4) % 20,
          cukup: 15 + (i * 2) % 10,
          rusak: 15 - (i * 3) % 10
        })),
        rasioGuruSiswa: distribusiPerKecamatan.map((d, i) => ({
          kecamatan: d.kecamatan,
          rasio: 18 + (i * 3) % 12
        })),
        kelayakanRuangKelas: distribusiPerKecamatan.map((d, i) => ({
          kecamatan: d.kecamatan,
          rombel: 60 + i * 10,
          kelasLayak: Math.round((60 + i * 10) * (0.85 + (i % 3) * 0.04)),
          persentase: Math.round(85 + (i % 3) * 4)
        }))
      };

      setTimeout(() => resolve(data), 100);
    });
  },

  // ─── SEL API Functions ───────────────────────────────────────

  getSELObservations: async (filters?: {
    kabupaten?: string;
    kecamatan?: string;
  }): Promise<SELObservasiSession[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.sel.getSesi(kabId);
      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((r: any) => {
          let parsedLokasi: string[] = [];
          let parsedWaktu: string[] = [];
          try {
            parsedLokasi = typeof r.lokasi_diamati === 'string' ? JSON.parse(r.lokasi_diamati) : (Array.isArray(r.lokasi_diamati) ? r.lokasi_diamati : []);
          } catch { }
          try {
            parsedWaktu = typeof r.waktu_pengamatan === 'string' ? JSON.parse(r.waktu_pengamatan) : (Array.isArray(r.waktu_pengamatan) ? r.waktu_pengamatan : []);
          } catch { }

          let parsedJawaban: SELJawaban[] = [];
          if (Array.isArray(r.jawaban)) {
            parsedJawaban = r.jawaban.map((j: any) => ({
              indikatorId: j.indikatorId || j.indikator_kode || String(j.indikator_id),
              skor: j.skor !== undefined ? j.skor : null,
              catatan: j.catatan || '',
            }));
          } else if (typeof r.jawaban === 'string') {
            try {
              const raw = JSON.parse(r.jawaban);
              if (Array.isArray(raw)) {
                parsedJawaban = raw.map((j: any) => ({
                  indikatorId: j.indikatorId || j.indikator_kode || String(j.indikator_id),
                  skor: j.skor !== undefined ? j.skor : null,
                  catatan: j.catatan || '',
                }));
              }
            } catch { }
          }

          return {
            id: String(r.id),
            sekolahId: String(r.sekolah_id || r.id),
            sekolahNama: r.sekolah_nama || r.nama || `SD ${r.kecamatan || ''}`,
            kecamatan: r.kecamatan || '',
            kabupaten: r.kabupaten || '',
            observerNama: r.observer_nama || 'Pengawas',
            tanggal: r.tanggal ? String(r.tanggal).slice(0, 10) : '',
            lokasiDiamati: parsedLokasi,
            waktuPengamatan: parsedWaktu,
            jumlahSiswaL: r.jumlah_siswa_l || 0,
            jumlahSiswaP: r.jumlah_siswa_p || 0,
            siswaDisabilitasL: r.siswa_disabilitas_l || 0,
            siswaDisabilitasP: r.siswa_disabilitas_p || 0,
            jangkauanSiswa: r.jangkauan_siswa || 1,
            kelasDiamati: r.kelas_diamati || '',
            namaGuruInisial: r.guru_inisial || '',
            jenisKelaminGuru: r.guru_jk || 'L',
            mataPelajaran: r.mata_pelajaran || '',
            jawaban: parsedJawaban,
            status: r.status || 'submitted',
          };
        });
      }
    } catch (err) {
      console.warn('[data-source] getSELObservations fallback:', err);
    }
    return [];
  },

  getSELScores: async (filters?: {
    kabupaten?: string;
    kecamatan?: string;
  }): Promise<SELSchoolScore[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.sel.getScores(kabId);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('[data-source] getSELScores fallback:', err);
    }

    return SEL_MOCK_SESSIONS
      .filter(s => !filters?.kabupaten || s.kabupaten === filters.kabupaten)
      .map(s => computeSELScore(s));
  },

  getSELHeatmap: async (kabupaten?: string): Promise<SELHeatmapRow[]> => {
    try {
      const kabId = kabupaten ? KABUPATEN_NAME_TO_ID[kabupaten] : undefined;
      const res = await apiClient.sel.getHeatmap(kabId);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((r: any) => ({
          kecamatan: r.kecamatan,
          kabupaten: r.kabupaten,
          jumlahSekolah: Number(r.jumlah_sekolah || r.jumlah_sesi || 0),
          dimensiScores: {
            kesadaran_diri: Number(r.kesadaran_diri || 0),
            regulasi_emosi: Number(r.regulasi_emosi || 0),
            kesadaran_sosial: Number(r.kesadaran_sosial || 0),
            keterampilan_relasi: Number(r.keterampilan_relasi || 0),
            tanggung_jawab: Number(r.tanggung_jawab || 0),
          },
          rataRata: Number(r.rata_rata || 0),
        }));
      }
    } catch (err) {
      console.warn('[data-source] getSELHeatmap fallback:', err);
    }

    const mockScores = SEL_MOCK_SESSIONS.map(s => computeSELScore(s));
    const kecMap: Record<string, { total: number; sum: number; dimSum: Record<SELDimensi, number>; count: number; kabupaten: string }> = {};
    mockScores.forEach(sc => {
      if (!kecMap[sc.kecamatan]) {
        kecMap[sc.kecamatan] = {
          total: 0,
          sum: 0,
          count: 0,
          kabupaten: sc.kabupaten,
          dimSum: { kesadaran_diri: 0, regulasi_emosi: 0, kesadaran_sosial: 0, keterampilan_relasi: 0, tanggung_jawab: 0 }
        };
      }
      kecMap[sc.kecamatan].count++;
      kecMap[sc.kecamatan].sum += sc.totalRata;
      sc.dimensi.forEach(d => {
        kecMap[sc.kecamatan].dimSum[d.dimensi] += d.rataRata;
      });
    });

    return Object.keys(kecMap).map(k => {
      const item = kecMap[k];
      const cnt = item.count || 1;
      return {
        kecamatan: k,
        kabupaten: item.kabupaten,
        jumlahSekolah: cnt,
        dimensiScores: {
          kesadaran_diri: Math.round((item.dimSum.kesadaran_diri / cnt) * 100) / 100,
          regulasi_emosi: Math.round((item.dimSum.regulasi_emosi / cnt) * 100) / 100,
          kesadaran_sosial: Math.round((item.dimSum.kesadaran_sosial / cnt) * 100) / 100,
          keterampilan_relasi: Math.round((item.dimSum.keterampilan_relasi / cnt) * 100) / 100,
          tanggung_jawab: Math.round((item.dimSum.tanggung_jawab / cnt) * 100) / 100,
        },
        rataRata: Math.round((item.sum / cnt) * 100) / 100,
      };
    });
  },

  getSELMatriksData: async (filters?: {
    kabupaten?: string;
    kecamatan?: string;
  }): Promise<SELMatriksPoint[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.sel.getMatriks(kabId);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((r: any, idx: number) => ({
          id: String(r.sekolah_id || r.id || idx + 1),
          name: r.sekolah || r.sekolah_nama || r.nama || r.kecamatan,
          kecamatan: r.kecamatan,
          kuisionerScore: Number(r.kuisioner_score || 0),
          selScore: Number(r.sel_score || 0),
          guruSkor: Number(r.guru_score || r.guru_skor || 0),
          muridSkor: Number(r.murid_score || r.murid_skor || 0),
          status: (r.status_pengisian || r.status || 'sudah') as any,
        }));
      }
    } catch (err) {
      console.warn('[data-source] getSELMatriksData fallback:', err);
    }

    const mockScores = SEL_MOCK_SESSIONS.map(s => computeSELScore(s));
    return mockScores.map(sc => ({
      id: sc.sekolahId,
      name: sc.sekolahNama,
      kecamatan: sc.kecamatan,
      kuisionerScore: sc.kuisionerScore,
      selScore: sc.totalRata,
      guruSkor: sc.guruTotal,
      muridSkor: sc.muridTotal,
      status: sc.kuisionerScore >= 60 ? 'sudah' : 'sebagian',
    }));
  },

  getSELSummaryStats: async (): Promise<{
    totalDiobservasi: number;
    rataGuruAll: number;
    rataMuridAll: number;
    butuhIntervensi: number;
    topSekolah: string;
  }> => {
    try {
      const res = await apiClient.sel.getSummary();
      if (res?.success && res.data) {
        return {
          totalDiobservasi: Number(res.data.total_sesi ?? res.data.total_diobservasi ?? 0),
          rataGuruAll: Number(res.data.rata_guru ?? res.data.rata_guru_all ?? 0),
          rataMuridAll: Number(res.data.rata_murid ?? res.data.rata_murid_all ?? 0),
          butuhIntervensi: Number(res.data.butuh_intervensi ?? 0),
          topSekolah: res.data.top_sekolah || '-',
        };
      }
    } catch (err) {
      console.warn('[data-source] getSELSummaryStats fallback:', err);
    }

    const scores = SEL_MOCK_SESSIONS.map(s => computeSELScore(s));
    const totalDiobservasi = scores.length;
    const rataGuruAll = Math.round((scores.reduce((a, b) => a + b.guruTotal, 0) / (totalDiobservasi || 1)) * 10) / 10;
    const rataMuridAll = Math.round((scores.reduce((a, b) => a + b.muridTotal, 0) / (totalDiobservasi || 1)) * 10) / 10;
    const butuhIntervensi = scores.filter(s => s.totalRata < 2.5).length;
    const topSekolah = scores.sort((a, b) => b.totalRata - a.totalRata)[0]?.sekolahNama || '-';
    return { totalDiobservasi, rataGuruAll, rataMuridAll, butuhIntervensi, topSekolah };
  },

  saveObservasiSEL: async (session: Omit<SELObservasiSession, 'id'>): Promise<SELObservasiSession> => {
    return new Promise(resolve => {
      const newSession: SELObservasiSession = { ...session, id: 'sel_' + Date.now() };
      selObservasiData.push(newSession);
      setTimeout(() => resolve(newSession), 200);
    });
  },

  getRadarBenchmarkingData: async (schoolId: string): Promise<RadarPoint[]> => {
    return new Promise((resolve) => {
      const data: RadarPoint[] = [
        { subject: 'Literasi & Numerasi', sekolah: 85, kecamatan: 65, fullMark: 100 },
        { subject: 'Karakter', sekolah: 70, kecamatan: 75, fullMark: 100 },
        { subject: 'Kepemimpinan', sekolah: 90, kecamatan: 60, fullMark: 100 },
        { subject: 'Lingkungan', sekolah: 60, kecamatan: 80, fullMark: 100 },
        { subject: 'Kemitraan', sekolah: 80, kecamatan: 50, fullMark: 100 },
      ];
      setTimeout(() => resolve(data), 100);
    });
  }
};
