export interface Provinsi {
  id: number;
  nama: string;
  kodeBps?: string;
}

export interface Kabupaten {
  id: number;
  provinsiId: number;
  nama: string;
  kodeBps?: string;
  tipe: 'kabupaten' | 'kota';
  warnaChart?: string;
}

export interface Kecamatan {
  id: number;
  kabupatenId: number;
  nama: string;
  kodeBps?: string;
  geojsonPath?: string;
}

export interface SatuanPendidikan {
  id: number;
  npsn: string;
  nama: string;
  kecamatanId: number;
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK';
  statusSekolah: 'Negeri' | 'Swasta';
  akreditasi?: string;
  alamat?: string;
  email?: string;
  telepon?: string;
  totalGuru: number;
  totalSiswa: number;
  latitude?: number;
  longitude?: number;
  statusPengisian: 'belum' | 'sebagian' | 'sudah';
  lastUpdated?: string;
}
