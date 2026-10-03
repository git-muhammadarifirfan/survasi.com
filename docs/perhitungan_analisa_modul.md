# Logika Perhitungan Analisis - Modul BSAN
*(URL: http://localhost:5173/modul)*

Dokumen ini menjelaskan bagaimana setiap persentase dan angka analitik di halaman Modul BSAN dihitung murni menggunakan data riil dari database (tabel `jawaban_survey`, `responden_survey`, dan `sel_jawaban_observasi`).

## 1. Persentase Tab Framework (With Myself, With Others, With Our Challenges)
**Endpoint:** `/api/analisis/frameworks`
Persentase pada setiap framework adalah **nilai rata-rata (average)** dari progres seluruh modul yang masuk ke dalam kategori framework tersebut.

- **With Myself:** Rata-rata dari Modul 1 (Literasi & Numerasi Dasar).
- **With Others:** Rata-rata dari Modul 2 & 5 (Disiplin Positif & Kemitraan Orang Tua).
- **With Our Challenges:** Rata-rata dari Modul 3 & 4 (Kesehatan Emosi & Kebersihan Lingkungan).

## 2. Persentase Breakdown Per Modul (Modul 1 - Modul 5) & Progress Bar Pertanyaan
**Endpoint:** `/api/analisis/modul-breakdown`
Setiap bar warna-warni pada pertanyaan menampilkan persentase spesifik per opsi jawaban. 

**Rumus Utama Capaian Modul:**
`Persentase Modul = (Total Jawaban Positif / Total Seluruh Jawaban di Modul tsb) * 100`

**Definisi "Jawaban Positif":**
Sistem akan membaca jawaban yang dipilih responden dari tabel `jawaban_survey`. Sebuah jawaban dianggap "Positif" dan berkontribusi menaikkan skor jika teks jawabannya mengandung salah satu kata kunci berikut:
- `ya`
- `sudah`
- `rutin`
- `lengkap`
- `restoratif`

*Jika responden belum mengisi kuesioner pada database, maka persentase modul secara otomatis akan menampilkan `0%`.*

## 3. Progres Implementasi (Sidebar Kanan)
Skor angka besar (contoh: 62%) pada komponen "PROGRES IMPLEMENTASI" sifatnya responsif. Angka ini selalu terhubung dan mengikuti **Persentase Capaian Modul aktif** yang sedang Anda klik (merujuk pada Rumus Capaian Modul di Poin 2).

## 4. Dimensi Observasi SEL (Sidebar Kanan)
**Endpoint:** `/api/analisis/modul-detail`
Menampilkan skor riil hasil penilaian/observasi lapangan dari tabel `sel_jawaban_observasi` yang terhubung dengan `sel_indikator` dan `sel_dimensi`.

- **Skor Guru:** `Rata-rata (AVG) skor indikator bersubjek 'guru'` (Skala skor 1-4).
- **Skor Murid:** `Rata-rata (AVG) skor indikator bersubjek 'murid'` (Skala skor 1-4).
- **Rata-Rata Modul (Total):** `Rata-rata akumulasi seluruh skor pada dimensi tersebut`.

Semua skor diformat menggunakan satu angka desimal (contoh: `3.5`, `4.0`) agar mudah dipahami.
