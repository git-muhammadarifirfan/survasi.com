/**
 * @file data-source.ts
 * @module shared/data
 * @description
 *   Central data access layer — FACADE PATTERN.
 *   Semua fungsi `database.*` membaca data REAL dari backend MySQL (realtime).
 *   Tidak ada fallback ke data statis/dummy: bila API gagal, error diteruskan
 *   ke pemanggil atau dikembalikan sebagai data kosong.
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
import type { SELDimensi, SELSkor } from './sel-indicators';
import { apiClient, withQuery } from '../services/api-client';




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
  label: string;
  /** Jumlah survei (responden) terkirim pada hari tsb */
  responden: number;
  /** Sekolah yang pertama kali selesai mengirim pada hari tsb */
  sekolah_baru: number;
  /** Akumulasi sekolah selesai sampai hari tsb */
  kumulatif: number;
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
  jumlahSiswaSebagianKecil?: number | null;
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
  kelasSkor?: number | null;
  lingkunganSkor?: number | null;
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
  /** Skor kuesioner BSAN sekolah (0-100); null = sekolah belum mengisi kuesioner */
  kuisionerScore: number | null;
  npsn?: string;
  jumlahSesi?: number;
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
  kuisionerScore: number | null; // sumbu X: skor kuesioner BSAN 0-100 (null = belum mengisi)
  selScore: number;       // sumbu Y: skor observasi SEL 1-4
  guruSkor: number;
  muridSkor: number;
  status: 'belum' | 'sebagian' | 'sudah';
}


export interface ImplRow {
  label: string;
  total: number;
  belumMenerima: number;
  tidakMenerapkan: number;
  sebagian: number;
  sudah: number;
}

export interface FreqItem { label: string; jumlah: number; persen: number }

/** Bentuk data dari GET /api/analisis/proporsi — seluruhnya dihitung dari jawaban survei real. */
export interface ProporsiModulData {
  totalResponden: number;
  totalSekolahResponden: number;
  proporsiPenerima: { ya: number; tidak: number; jumlahYa: number; jumlahTidak: number; totalResponden: number };
  distribusiPerKecamatan: { kecamatan: string; kabupaten: string; total: number; jumlahYa: number; ya: number; tidak: number }[];
  implementasiTotal: ImplRow;
  statusImplementasiPosisi: (ImplRow & { posisi: string })[];
  statusImplementasiKecamatan: (ImplRow & { kecamatan: string })[];
  penyelenggaraPelatihan: { nama: string; jumlah: number; persen: number }[];
  penyelenggaraAnswered: number;
  kemudahanModul: {
    kelasAwal: { mudah: { modul: string; persen: number; jumlah: number }[]; sulit: { modul: string; persen: number; jumlah: number }[]; answered: number };
    kelasTinggi: { mudah: { modul: string; persen: number; jumlah: number }[]; sulit: { modul: string; persen: number; jumlah: number }[]; answered: number };
  };
  mediaPembelajaran: {
    kelasAwal: { media: string; persen: number; jumlah: number }[];
    kelasTinggi: { media: string; persen: number; jumlah: number }[];
    answeredAwal: number;
    answeredTinggi: number;
  };
  keterlibatanSiswa: { kategori: string; persen: number; jumlah: number }[];
  keterlibatanAnswered: number;
  refleksiMurid: FreqItem[];
  refleksiGuruFreq: FreqItem[];
  kesepakatanKelas: FreqItem[];
  refleksiGuru: string[];
  dukunganKepsek: { metode: string; jumlah: number; persen: number }[];
  dukunganAnswered: number;
  rencanaAksi: { program: string; jumlah: number; persen: number }[];
  programAnswered: number;
  profilSekolah: { kecamatan: string; jumlahSekolah: number; totalGuru: number; totalSiswa: number; rasio: number; cakupan: number }[];
  kelasAwalResponden: number;
  kelasTinggiResponden: number;
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

/** Filter wilayah → query params backend */
function wilayahParams(filters?: { kabupaten?: string; kecamatan?: string }) {
  return {
    kabupaten_id: filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined,
    kecamatan: filters?.kecamatan ? filters.kecamatan.replace(/^Kec\.\s*/i, '') : undefined,
  };
}

export const database = {
  getSchools: async (filters?: {
    kabupaten?: string;
    kecamatan?: string;
    status?: string;
    search?: string;
  }): Promise<School[]> => {
    // 1. Try full authenticated getAll query from MySQL backend
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.sekolah.getAll({
        kabupaten_id: kabId,
        kecamatan: filters?.kecamatan,
        status: filters?.status,
        search: filters?.search,
        limit: 2000,
      });
      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((s: any) => ({
          id: String(s.id),
          npsn: s.npsn || '',
          nama: s.nama || '',
          kecamatan: s.kecamatan_nama || s.kecamatan || '',
          kabupaten: s.kabupaten_nama || s.kabupaten || '',
          status: s.status || s.status_pengisian || 'belum',
          jenjang: s.jenjang || 'SD',
          statusSekolah: s.status_sekolah || 'Negeri',
          totalGuru: s.total_guru || 0,
          totalSiswa: s.total_siswa || 0,
          akreditasi: s.akreditasi || '',
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
      console.warn('[data-source] getSchools API error:', err);
    }

    // 2. Public getOptions fallback if unauthenticated
    try {
      const optRes = await apiClient.sekolah.getOptions().catch(() => null);
      if (optRes?.success && Array.isArray(optRes.data) && optRes.data.length > 0 && !filters?.status && !filters?.search) {
        return optRes.data.map((s: any) => ({
          id: String(s.id),
          npsn: s.npsn || '',
          nama: s.nama,
          kecamatan: s.kecamatan_nama || s.kecamatan || '',
          kabupaten: s.kabupaten_nama || s.kabupaten || '',
          status: 'belum',
          jenjang: s.jenjang || 'SD',
          statusSekolah: '',
          totalGuru: 0,
          totalSiswa: 0,
          akreditasi: '',
          alamat: '',
          email: '',
          telepon: '',
          user_id: null,
          is_registered: Boolean(s.is_registered),
          x: 0,
          y: 0,
        }));
      }
    } catch (err) {
      console.warn('[data-source] getOptions fallback:', err);
    }

    return [];
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
    return uniqueKabs.map((kName, idx) => ({ id: KABUPATEN_NAME_TO_ID[kName] || (idx + 1), nama: kName }));
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
    return uniqueKec.map((kName, idx) => ({ id: idx + 1, nama: kName, kabupaten_nama: kabupaten }));
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
    try {
      const res = await apiClient.dashboard.getKabupatenStats();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((r: any) => ({
          kabupaten: r.kabupaten,
          total: Number(r.total_sekolah || r.total || 0),
          belum: Number(r.belum || 0),
          sebagian: Number(r.sebagian || 0),
          sudah: Number(r.sudah || 0),
          rate: Number(r.response_rate || r.rate || 0),
          color: r.warna_chart || r.color || '#4A57C4',
        }));
      }
    } catch (err) {
      console.warn('[data-source] getKabupatenStats API error:', err);
    }
    return [];
  },

  getKecamatanStats: async (kabupatenFilter?: string): Promise<KecamatanStat[]> => {
    try {
      const res = await apiClient.get<any[]>(withQuery('/dashboard/regional-stats', wilayahParams({ kabupaten: kabupatenFilter })));
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((r: any) => ({
          kecamatan: r.kecamatan,
          kabupaten: r.kabupaten,
          total: Number(r.total_sekolah || r.total || 0),
          belum: Number(r.belum || 0),
          sebagian: Number(r.sebagian || 0),
          sudah: Number(r.sudah || 0),
          rate: Number(r.response_rate || r.rate || 0),
        }));
      }
    } catch (err) {
      console.warn('[data-source] getKecamatanStats API error:', err);
    }
    return [];
  },

  getModulProgress: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<ModulProgress[]> => {
    const res = await apiClient.get<any[]>(withQuery('/dashboard/modul-progress', wilayahParams(filters)));
    return (res?.data || []).map((item: any) => ({
      id: item.id,
      nama: item.nama,
      progres: Number(item.progres ?? 0),
      totalPertanyaan: Number(item.totalPertanyaan ?? 0),
      terisi: Number(item.terisi ?? 0),
    }));
  },

  getTimeSeriesData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<TimeSeriesPoint[]> => {
    const res = await apiClient.get<TimeSeriesPoint[]>(withQuery('/dashboard/timeseries', wilayahParams(filters)));
    return Array.isArray(res?.data) ? res.data : [];
  },

  getSuaraRespondenData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<any[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.suara.getAll({
        kabupaten_id: kabId,
        limit: 50,
      });
      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((r: any) => ({
          id: String(r.id),
          schoolName: r.sekolah || r.school_name || '',
          kecamatan: r.kecamatan || '',
          modul: r.modul || '',
          comment: r.komentar || r.comment || '',
          sentiment: r.sentimen || r.sentiment || 'netral',
          date: r.tanggal ? String(r.tanggal).slice(0, 10) : '',
        }));
      }
    } catch (err) {
      console.warn('[data-source] getSuaraRespondenData API error:', err);
    }
    return [];
  },

  getGapFunnelData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<FunnelStep[]> => {
    try {
      const res = await apiClient.get<FunnelStep[]>(withQuery('/analisis/funnel', wilayahParams(filters)));
      if (res?.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('[data-source] getGapFunnelData API error:', err);
    }
    return [];
  },

  getMatriksKuadranData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<MatrixPoint[]> => {
    try {
      const res = await apiClient.get<any[]>(withQuery('/analisis/matriks', wilayahParams(filters)));
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
      console.warn('[data-source] getMatriksKuadranData API error:', err);
    }
    return [];
  },

  getTantanganData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<ChallengeStat[]> => {
    try {
      const res = await apiClient.get<any[]>(withQuery('/analisis/tantangan', wilayahParams(filters)));
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
      console.warn('[data-source] getTantanganData API error:', err);
    }
    return [];
  },

  getRecentActivities: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<{ schoolName: string; status: string; time: string }[]> => {
    try {
      const res = await apiClient.get<any[]>(withQuery('/dashboard/activities', { ...wilayahParams(filters), limit: 5 }));
      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((r: any) => ({
          schoolName: r.sekolah || r.schoolName || r.nama || '',
          status: r.status || r.status_pengisian || 'belum',
          time: r.time || r.waktu || r.last_updated || '',
        }));
      }
    } catch (err) {
      console.warn('[data-source] getRecentActivities API error:', err);
    }
    return [];
  },

  getFollowUpList: async (kabupatenFilter?: string): Promise<School[]> => {
    try {
      const res = await apiClient.get<any[]>(withQuery('/dashboard/follow-up', wilayahParams({ kabupaten: kabupatenFilter })));
      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((s: any) => ({
          id: String(s.id),
          npsn: s.npsn || '',
          nama: s.nama || '',
          kecamatan: s.kecamatan || '',
          kabupaten: s.kabupaten || '',
          status: s.status || 'belum',
          jenjang: s.jenjang || 'SD',
          statusSekolah: s.status_sekolah || 'Negeri',
          totalGuru: s.total_guru || 0,
          totalSiswa: s.total_siswa || 0,
          akreditasi: s.akreditasi || '',
          alamat: s.alamat || '',
          email: s.email || '',
          telepon: s.telepon || '',
          x: 0, y: 0,
        }));
      }
    } catch (err) {
      console.warn('[data-source] getFollowUpList API error:', err);
    }
    return [];
  },

  sendReminder: async (schoolId: string): Promise<{ success: boolean; message?: string }> => {
    const res: any = await apiClient.sekolah.sendReminder(schoolId);
    return { success: Boolean(res?.success), message: res?.message };
  },

  getProporsiModulData: async (filters?: { kabupaten?: string; kecamatan?: string }): Promise<ProporsiModulData> => {
    const res = await apiClient.get<ProporsiModulData>(withQuery('/analisis/proporsi', wilayahParams(filters)));
    if (!res?.success || !res.data) throw new Error(res?.message || 'Gagal memuat data proporsi.');
    return res.data;
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
            jumlahSiswaSebagianKecil: r.jumlah_siswa_sebagian_kecil || null,
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
        // Backend /analisis/scores already returns fully formatted SELSchoolScore[]
        return res.data as SELSchoolScore[];
      }
    } catch (err) {
      console.warn('[data-source] getSELScores API error:', err);
    }
    return [];
  },

  getSELHeatmap: async (kabupaten?: string): Promise<SELHeatmapRow[]> => {
    try {
      const kabId = kabupaten ? KABUPATEN_NAME_TO_ID[kabupaten] : undefined;
      const res = await apiClient.sel.getHeatmap(kabId);
      if (res?.success && Array.isArray(res.data)) {
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
      console.warn('[data-source] getSELHeatmap API error:', err);
    }
    return [];
  },

  getSELMatriksData: async (filters?: {
    kabupaten?: string;
    kecamatan?: string;
  }): Promise<SELMatriksPoint[]> => {
    try {
      const kabId = filters?.kabupaten ? KABUPATEN_NAME_TO_ID[filters.kabupaten] : undefined;
      const res = await apiClient.sel.getMatriks(kabId);
      if (res?.success && Array.isArray(res.data)) {
        return res.data.map((r: any, idx: number) => ({
          id: String(r.sekolah_id || r.id || idx + 1),
          name: r.sekolah || r.sekolah_nama || r.nama || r.kecamatan,
          kecamatan: r.kecamatan,
          kuisionerScore: r.kuisioner_score == null ? null : Number(r.kuisioner_score),
          selScore: Number(r.sel_score || 0),
          guruSkor: Number(r.guru_score || r.guru_skor || 0),
          muridSkor: Number(r.murid_score || r.murid_skor || 0),
          status: (r.status_pengisian || r.status || 'sudah') as any,
        }));
      }
    } catch (err) {
      console.warn('[data-source] getSELMatriksData API error:', err);
    }
    return [];
  },

  getSELSummaryStats: async (kabupaten?: string): Promise<{
    totalDiobservasi: number;
    rataGuruAll: number;
    rataMuridAll: number;
    butuhIntervensi: number;
    topSekolah: string;
  }> => {
    try {
      // Use /sel/summary-stats which has totalDiobservasi, rataGuruAll, rataMuridAll, butuhIntervensi, topSekolah
      const res = await apiClient.sel.getSummaryStats(kabupaten ? KABUPATEN_NAME_TO_ID[kabupaten] : undefined);
      if (res?.success && res.data) {
        return {
          totalDiobservasi: Number(res.data.totalDiobservasi ?? res.data.total_diobservasi ?? res.data.total_sesi ?? 0),
          rataGuruAll: parseFloat(String(res.data.rataGuruAll ?? res.data.rata_guru ?? 0)),
          rataMuridAll: parseFloat(String(res.data.rataMuridAll ?? res.data.rata_murid ?? 0)),
          butuhIntervensi: Number(res.data.butuhIntervensi ?? res.data.butuh_intervensi ?? 0),
          topSekolah: res.data.topSekolah || res.data.top_sekolah || '-',
        };
      }
    } catch (err) {
      console.warn('[data-source] getSELSummaryStats API error:', err);
    }
    return { totalDiobservasi: 0, rataGuruAll: 0, rataMuridAll: 0, butuhIntervensi: 0, topSekolah: '-' };
  }
};
