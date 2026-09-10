export interface ModulBsan {
  id: number;
  kode: string;
  nama: string;
  namaEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  warna: string;
  ikon: string;
  urutan: number;
  isActive: boolean;
}

export interface PertanyaanSurvey {
  id: number;
  modulId?: number;
  kodePertanyaan: string;
  teksPertanyaan: string;
  tipe: 'dropdown' | 'checkbox' | 'text' | 'radio' | 'scale';
  opsiJawaban?: string[];
  urutan: number;
  isRequired: boolean;
  skipToQuestion?: number;
  section: string;
  targetKelas: 'semua' | 'kelas_awal' | 'kelas_tinggi' | 'kepala_sekolah';
  isActive: boolean;
}

export interface RespondenSurvey {
  id: number;
  nama: string;
  jenisKelamin: 'L' | 'P';
  posisi: string;
  sekolahId: number;
  npsn?: string;
  kabupatenId: number;
  kecamatanId: number;
  penerimaModul: 'Ya' | 'Tidak';
  penyelenggaraPelatihan?: string;
  statusImplementasi?: 'sudah' | 'sebagian' | 'belum';
  kelasMengajar?: string;
  noWa?: string;
  submittedAt?: string;
}
