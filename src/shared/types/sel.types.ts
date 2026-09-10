export interface SELDimensi {
  id: number;
  kode: string;
  nama: string;
  modulBsanKode: string;
  generalSkillId?: string;
  urutan: number;
}

export interface SELIndikator {
  id: number;
  kode: string;
  dimensiId: number;
  subjek: 'guru' | 'murid';
  konteks: 'kelas' | 'lingkungan';
  teks: string;
  catatan?: string;
  urutan: number;
  isActive: boolean;
}

export interface SELSesiObservasi {
  id: number;
  sekolahId: number;
  observerUserId?: number;
  observerNama?: string;
  tanggal: string;
  lokasiDiamati?: string[];
  waktuPengamatan?: string[];
  jumlahSiswaL: number;
  jumlahSiswaP: number;
  siswaDisabilitasL: number;
  siswaDisabilitasP: number;
  jangkauanSiswa: number;
  kelasDiamati?: string;
  guruInisial?: string;
  guruJk?: 'L' | 'P';
  mataPelajaran?: string;
  status: 'draft' | 'submitted' | 'reviewed';
}
