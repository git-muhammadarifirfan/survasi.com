# PRD — Sistem Survey Sekolah (BSAN Sidoarjo)

## 1. Latar Belakang

Survei modul BSAN dilakukan terhadap ±500 sekolah di 5 kabupaten/18 kecamatan wilayah Sidoarjo. Saat ini baru 114 sekolah (~22.8%) yang mengisi. Data hasil isian (terstruktur maupun narasi) belum punya alat bantu visualisasi untuk evaluasi — dashboard ini dibangun untuk mengagregasi, memvisualisasikan, dan mempermudah tindak lanjut proses survei.

## 2. Tujuan

- Memberi gambaran real-time progres pengisian survei per kabupaten/kecamatan/sekolah
- Memvisualisasikan hasil 5 Modul BSAN (gap funnel, matriks 4 kuadran, tantangan implementasi)
- Mempermudah tim menindaklanjuti sekolah yang belum/sebagian mengisi
- Menghasilkan laporan siap ekspor untuk keperluan evaluasi dinas

## 3. Ruang Lingkup Bertahap

**Fase 1 (sekarang) — Static Data**
Data bersumber dari file Excel yang sudah ada di workspace lokal (`F:\1.PROJECT\Sistem-Survey-Sekolah\Data`), dikonversi ke JSON statis yang dibundel ke aplikasi. Tidak ada backend/API — cukup untuk demo & validasi kebutuhan dashboard.

**Fase 2 — Migrasi Database**
Upgrade sumber data ke Supabase (Postgres) atau MySQL, dengan API layer, supaya data bisa diupdate tanpa rebuild aplikasi, dan mendukung multi-user/role.

**Di luar cakupan Fase 1** (sesuai keputusan terbaru):
- Klasifikasi narasi survei dengan AI
- Word cloud dari teks bebas
- Menu "Suara Responden" tampil di navigasi tapi non-fungsional (placeholder Fase 2)

> ⚠️ **Catatan data**: file Excel (`Data`) dan PDF daftar pertanyaan (`Pertanyaan Survey.pdf`) belum diupload ke chat ini, jadi skema data di bawah masih **asumsi sementara**. Upload kedua file itu ke chat supaya field & struktur kuisioner di PRD ini dikoreksi sesuai data asli sebelum dieksekusi di Antigravity.

## 4. Pengguna

Fase 1: single admin view (tanpa role differentiation) — cukup untuk internal tim.
Fase 2: role-based — Admin Pusat (akses semua wilayah), Admin Kecamatan (akses wilayah sendiri), Viewer (read-only, untuk laporan ke dinas).

## 5. Struktur Data (Asumsi Sementara — Fase 1)

```
Kabupaten { id, nama }
Kecamatan { id, nama, kabupaten_id, geojson_id }
SatuanPendidikan { id, npsn, nama_sekolah, kecamatan_id, jenjang, status_pengisian }
  // status_pengisian: "belum" | "sebagian" | "sudah"
ModulBSAN { id, nama_modul, urutan }  // 5 modul
JawabanKuisioner {
  id, sekolah_id, modul_id, pertanyaan_id,
  jawaban_terstruktur,   // pilihan ganda/skala — dasar angka funnel & kuadran
  catatan_bebas          // teks narasi — TIDAK diproses AI di Fase 1, hanya ditampilkan mentah
}
```

## 6. Rincian Fitur per Halaman

| Halaman | Prioritas | Deskripsi Fungsional |
|---|---|---|
| **Dashboard** | P0 | KPI: total sekolah, sudah/sebagian/belum isi, response rate %. Ring chart progres per Modul BSAN. Bar chart response rate per kecamatan. Panel kanan: daftar sekolah terbaru mengisi + daftar prioritas follow-up (belum isi). |
| **Peta Kecamatan** | P0 | Choropleth interaktif 18 kecamatan, warna = tingkat partisipasi. Klik kecamatan → filter global. |
| **Kuisioner** | P1 | Preview struktur pertanyaan per modul (read-only di Fase 1 — input data tetap lewat Excel). |
| **Data Responden** | P0 | Tabel sekolah + status isi, filter kabupaten/kecamatan/status, search nama/NPSN. |
| **Data Satuan Pendidikan** | P1 | Detail profil tiap sekolah (jenjang, alamat, kontak) — referensi master data. |
| **Modul BSAN** | P0 | Detail hasil per modul (5 modul), breakdown jawaban terstruktur. |
| **Analisis Gap Funnel** | P0 | Visualisasi funnel: dari total sekolah → mengisi → memenuhi kriteria tiap tahap modul. |
| **Matriks 4 Kuadran** | P0 | Scatter/grid 2 sumbu (mis. tingkat implementasi vs tingkat kesiapan) menempatkan tiap sekolah/kecamatan ke salah satu dari 4 kuadran. |
| **Tantangan Implementasi** | P1 | Ringkasan kendala yang dilaporkan (dari jawaban terstruktur "jenis kendala" — bukan dari AI tagging teks bebas). |
| **Suara Responden** | P2 (nonaktif) | Placeholder — nanti untuk narasi + word cloud, di luar Fase 1. |
| **Laporan & Ekspor** | P1 | Export tabel/chart ke PDF & Excel, dengan filter kabupaten/kecamatan/modul yang aktif. |
| **Setting** | P2 | Preferensi tampilan, manajemen data master (Fase 2: manajemen user/role). |

## 7. Kebutuhan Non-Fungsional

- Data Fase 1 dimuat sebagai JSON statis (hasil convert Excel) — tidak perlu backend, tapi struktur kode disiapkan supaya penggantian ke API (Fase 2) tidak perlu ubah komponen UI, cukup ganti data-fetching layer
- Responsif minimal sampai tablet (dashboard internal, prioritas desktop)
- Semua warna status konsisten sesuai `design.md`

## 8. Metrik Keberhasilan

- Tim bisa melihat response rate per wilayah dalam < 5 detik buka dashboard
- Daftar sekolah belum isi bisa di-export untuk follow-up tanpa buka Excel manual
- Struktur siap migrasi ke Supabase/MySQL tanpa desain ulang UI
