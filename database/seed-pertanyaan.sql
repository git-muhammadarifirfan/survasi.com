-- ═══════════════════════════════════════════════════════════════════════════════
-- BSAN JAWA TIMUR — SEED: 37 Pertanyaan Survey
-- Sesuai Google Form: "Implementasi BSAN Kab Sidoarjo"
-- Referensi: Data/soal.md & Data/soal.pdf
--
-- @description
--   Insert semua 37 pertanyaan survei kuesioner BSAN.
--   Pertanyaan dikelompokkan per section:
--   - identitas (Q1-Q8): Data diri responden
--   - pelatihan (Q9-Q11): Identifikasi pelatihan
--   - implementasi_awal (Q12-Q21): Implementasi kelas awal
--   - implementasi_tinggi (Q22-Q30): Implementasi kelas tinggi
--   - kepsek (Q31-Q32): Dukungan kepala sekolah
--   - refleksi (Q33-Q36): Bagian refleksi
--   - kontak (Q37): Nomor WA
--
-- @prerequisites
--   Jalankan setelah seed.sql (membutuhkan data modul_bsan)
--
-- @usage
--   mysql -u root -p bsan_jatim_monitoring < database/seed-pertanyaan.sql
-- ═══════════════════════════════════════════════════════════════════════════════

USE bsan_jatim_monitoring;

-- Clear previous data to prevent duplicates on re-seed
DELETE FROM jawaban_survey;
DELETE FROM pertanyaan_survey;
ALTER TABLE pertanyaan_survey AUTO_INCREMENT = 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION: IDENTITAS RESPONDEN (Q1-Q8)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pertanyaan_survey
  (kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban, urutan, is_required, section, target_kelas)
VALUES
('Q1', 'Nama', 'text', NULL, 1, TRUE, 'identitas', 'semua'),

('Q2', 'Jenis Kelamin', 'dropdown',
 '["Laki-Laki", "Perempuan"]',
 2, TRUE, 'identitas', 'semua'),

('Q3', 'Posisi', 'dropdown',
 '["Kepala Sekolah", "Guru kelas 1", "Guru kelas 2", "Guru kelas 3", "Guru kelas 4", "Guru kelas 5", "Guru kelas 6", "Guru PJOK", "Guru PAI", "Guru seni dan budaya", "Lainnya"]',
 3, TRUE, 'identitas', 'semua'),

('Q4', 'Asal Sekolah', 'text', NULL, 4, TRUE, 'identitas', 'semua'),

('Q5', 'Kabupaten', 'dropdown',
 '["Tuban", "Batu", "Sidoarjo"]',
 5, TRUE, 'identitas', 'semua'),

('Q6', 'Kecamatan Kab Tuban', 'dropdown',
 '["Bancar", "Bangilan", "Grabagan", "Jatirogo", "Jenu", "Kenduruan", "Kerek", "Merakurak", "Montong", "Palang", "Parengan", "Plumpang", "Rengel", "Semanding", "Senori", "Singgahan", "Soko", "Tambakboyo", "Tuban", "Widang"]',
 6, TRUE, 'identitas', 'semua'),

('Q7', 'Kecamatan Kota Batu', 'dropdown',
 '["Batu", "Bumiaji", "Junrejo"]',
 7, TRUE, 'identitas', 'semua'),

('Q8', 'Kecamatan Kab Sidoarjo', 'dropdown',
 '["Banjarbendo", "Buduran", "Candi", "Gedangan", "Jabon", "Krembung", "Krian", "Prambon", "Porong", "Sedati", "Sidoarjo", "Sukodono", "Taman", "Tanggulangin", "Tarik", "Tulangan", "Waru", "Wonoayu"]',
 8, TRUE, 'identitas', 'semua');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION: IDENTIFIKASI PELATIHAN (Q9-Q11)
-- Skip logic: Q9 Tidak → skip ke Q37
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pertanyaan_survey
  (kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban, urutan, is_required, section, target_kelas)
VALUES
('Q9',
 'Apakah Bpk/Ibu sudah pernah mendapatkan materi modul BSAN - Budaya Sekolah Aman dan Nyaman [baik melalui pelatihan KKG/K3S/KKG Sekolah, maupun sosialisasi sesama guru]',
 'dropdown', '["Ya", "Tidak"]',
 9, TRUE, 'pelatihan', 'semua'),

('Q10', 'Jika ya siapa yang mengadakan pelatihan', 'checkbox',
 '["INOVASI-DINAS PENDIDIKAN", "Diseminasi KKG/KKKS"]',
 10, TRUE, 'pelatihan', 'semua'),

('Q11', 'Apakah Bpk/Ibu sudah mengimplementasikan modul BSAN', 'dropdown',
 '["Ya, sudah seluruhnya", "Ya, sebagian", "Tidak"]',
 11, TRUE, 'pelatihan', 'semua');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION: POSISI RESPONDEN & KELAS (Q12)
-- Skip logic: Kelas Awal → Q13, Kelas Tinggi → Q22, Kepala Sekolah → Q31
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pertanyaan_survey
  (kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban, urutan, is_required, section, target_kelas)
VALUES
('Q12', 'Saat implementasi modul BSAN, Bpk/Ibu mengajar di kelas berapa?', 'dropdown',
 '["Kelas Awal", "Kelas Tinggi", "Kepala Sekolah"]',
 12, TRUE, 'pelatihan', 'semua');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION: IMPLEMENTASI MODUL KELAS AWAL (Q13-Q21)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pertanyaan_survey
  (modul_id, kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban, urutan, is_required, section, target_kelas)
VALUES
(NULL, 'Q13',
 'Menurut Bpk/Ibu bagian mana dari modul yang cukup mudah penerapannya? (Kelas Awal)',
 'checkbox',
 '["Alur 1: Tema 1: Tubuhku Istimewa", "Alur 1: Tema 2: Aku Jaga Diri", "Alur 1: Tema 3: Perasaanku, Tanggungjawabku", "Alur 1: Tema 4: Aku Bisa, Aku Hebat", "Alur 1: Tema 5: Aku Gemar Membaca", "Alur 2: Tema 6: Aku, Kamu, Kita Unik", "Alur 2: Tema 7: Tubuhku Bicara, Emosi Bisa Berubah", "Alur 3: Tema 8: Surat Untuk yang tersayang", "Alur 3: Tema 9: Jaga Layar, Jaga Diri", "Alur 3: Tema 10: Aku Mau Membantu"]',
 13, TRUE, 'implementasi_awal', 'kelas_awal'),

(NULL, 'Q14',
 'Menurut Bpk/Ibu bagian mana dari modul yang cukup sulit penerapannya? (Kelas Awal)',
 'checkbox',
 '["Alur 1: Tema 1: Tubuhku Istimewa", "Alur 1: Tema 2: Aku Jaga Diri", "Alur 1: Tema 3: Perasaanku, Tanggungjawabku", "Alur 1: Tema 4: Aku Bisa, Aku Hebat", "Alur 1: Tema 5: Aku Gemar Membaca", "Alur 2: Tema 6: Aku, Kamu, Kita Unik", "Alur 2: Tema 7: Tubuhku Bicara, Emosi Bisa Berubah", "Alur 3: Tema 8: Surat Untuk yang tersayang", "Alur 3: Tema 9: Jaga Layar, Jaga Diri", "Alur 3: Tema 10: Aku Mau Membantu"]',
 14, TRUE, 'implementasi_awal', 'kelas_awal'),

(NULL, 'Q15',
 'Media apa saja yang telah Bpk/Ibu gunakan? (Kelas Awal)',
 'checkbox',
 '["Video", "LKPD", "Kartu Afirmasi Positif", "Puzzle tubuhku", "Media gambar", "Papan ular tangga", "Peta tubuh buatan murid", "Poster Area Pribadi", "Poster Menjaga Diri", "Poster 6 langkah mencuci tangan", "Poster isi piringku", "Papan Roda Emosi", "Kartu Ekspresi Wajah", "Kartu Berhenti", "Kartu Berfikir", "Kartu Bertindak", "Kartu Emosi", "Stiker Emoji", "Kartu STOP", "Kartu Cerita", "Peta Jejak", "Poster Hak Anak", "Poster Tubuh", "Kartu Peristiwa", "Buku Cerita", "Stiker Pembaca Rajin", "Kartu Peran", "Mainan Tradisional", "Kartu Jenis Pekerjaan", "Gambar lingkungan dan dampak"]',
 15, TRUE, 'implementasi_awal', 'kelas_awal'),

(NULL, 'Q16', 'Keaktifan murid saat implementasi modul BSAN (Kelas Awal)', 'radio',
 '["Lebih dari 70% siswa terlibat aktif", "50% siswa terlibat aktif", "Kurang dari 50% siswa terlibat aktif"]',
 16, TRUE, 'implementasi_awal', 'kelas_awal'),

(NULL, 'Q17', 'Apakah guru melakukan refleksi dengan murid? (Kelas Awal)', 'radio',
 '["Ya, tiap selesai alur", "Ya, tiap selesai tema", "Ya, tiap selesai aktivitas", "Ya, setelah seluruhnya selesai", "Tidak"]',
 17, TRUE, 'implementasi_awal', 'kelas_awal'),

(NULL, 'Q18', 'Jika ya, sebutkan temuan-temuan pokoknya (Refleksi Murid - Kelas Awal)', 'text',
 NULL, 18, TRUE, 'implementasi_awal', 'kelas_awal'),

(NULL, 'Q19', 'Apakah guru melakukan refleksi dengan guru lain? (Kelas Awal)', 'radio',
 '["Ya, tiap selesai alur", "Ya, tiap selesai tema", "Ya, tiap selesai aktivitas", "Ya, setelah seluruhnya selesai", "Tidak"]',
 19, TRUE, 'implementasi_awal', 'kelas_awal'),

(NULL, 'Q20', 'Jika ya, sebutkan temuan-temuan pokoknya (Refleksi Guru - Kelas Awal)', 'text',
 NULL, 20, TRUE, 'implementasi_awal', 'kelas_awal'),

(NULL, 'Q21', 'Apakah terdapat kesepakatan kelas (Kelas Awal)', 'radio',
 '["Ya, disusun guru dengan murid", "Ya, disiapkan guru", "Tidak"]',
 21, TRUE, 'implementasi_awal', 'kelas_awal');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION: IMPLEMENTASI MODUL KELAS TINGGI (Q22-Q30)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pertanyaan_survey
  (modul_id, kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban, urutan, is_required, section, target_kelas)
VALUES
(NULL, 'Q22',
 'Menurut Bpk/Ibu bagian mana dari modul yang cukup mudah penerapannya? (Kelas Tinggi)',
 'checkbox',
 '["Alur 1: Tema 1: Mengenali Perasaan Diri", "Alur 1: Tema 2: Mengelola Perasaan Diri (Kelas 4)", "Alur 1: Tema 2: Mengelola Perasaan Diri (Kelas 5-6)", "Alur 1: Tema 3: Peta Tubuh Saya (kelas 4)", "Alur 1: Peta Tubuh Saya (kelas 5-6)", "Alur 1: Tema 4: Afirmasi Positif", "Alur 2: Tema 5: Lingkaran Persahabatan", "Alur 2: Tema 6: Berbagi Persahabatan", "Alur 2: Tema 7: Tanggung Jawab Diri", "Alur 2: Tema 8: Ayo Bermain Bersama", "Alur 2: Tema 9: Aku dan Kamu Istimewa", "Alur 3: Tema 10: Gembira bersama Sahabat", "Alur 3: Tema 11: Kampanye Anak Indonesia Hebat", "Alur 3: Tema 12: Refleksi dan Tindak Lanjut"]',
 22, TRUE, 'implementasi_tinggi', 'kelas_tinggi'),

(NULL, 'Q23',
 'Menurut Bpk/Ibu bagian mana dari modul yang cukup sulit penerapannya? (Kelas Tinggi)',
 'checkbox',
 '["Alur 1: Tema 1: Mengenali Perasaan Diri", "Alur 1: Tema 2: Mengelola Perasaan Diri (Kelas 4)", "Alur 1: Tema 2: Mengelola Perasaan Diri (Kelas 5-6)", "Alur 1: Tema 3: Peta Tubuh Saya (kelas 4)", "Alur 1: Peta Tubuh Saya (kelas 5-6)", "Alur 1: Tema 4: Afirmasi Positif", "Alur 2: Tema 5: Lingkaran Persahabatan", "Alur 2: Tema 6: Berbagi Persahabatan", "Alur 2: Tema 7: Tanggung Jawab Diri", "Alur 2: Tema 8: Ayo Bermain Bersama", "Alur 2: Tema 9: Aku dan Kamu Istimewa", "Alur 3: Tema 10: Gembira bersama Sahabat", "Alur 3: Tema 11: Kampanye Anak Indonesia Hebat", "Alur 3: Tema 12: Refleksi dan Tindak Lanjut"]',
 23, TRUE, 'implementasi_tinggi', 'kelas_tinggi'),

(NULL, 'Q24',
 'Media apa saja yang telah Bpk/Ibu gunakan? (Kelas Tinggi)',
 'checkbox',
 '["Video", "LKPD", "Kartu Afirmasi Positif", "Puzzle tubuhku", "Media gambar", "Papan ular tangga", "Peta tubuh buatan murid", "Poster Area Pribadi", "Poster Menjaga Diri", "Poster 6 langkah mencuci tangan", "Poster isi piringku", "Papan Roda Emosi", "Kartu Ekspresi Wajah", "Kartu Berhenti", "Kartu Berfikir", "Kartu Bertindak", "Kartu Emosi", "Stiker Emoji", "Kartu STOP", "Kartu Cerita", "Peta Jejak", "Poster Hak Anak", "Poster Tubuh", "Kartu Peristiwa", "Buku Cerita", "Stiker Pembaca Rajin", "Kartu Peran", "Mainan Tradisional", "Kartu Jenis Pekerjaan", "Gambar lingkungan dan dampak"]',
 24, TRUE, 'implementasi_tinggi', 'kelas_tinggi'),

(NULL, 'Q25', 'Keaktifan murid saat implementasi modul BSAN (Kelas Tinggi)', 'radio',
 '["Lebih dari 70% siswa terlibat aktif", "50% siswa terlibat aktif", "Kurang dari 50% siswa terlibat aktif"]',
 25, TRUE, 'implementasi_tinggi', 'kelas_tinggi'),

(NULL, 'Q26', 'Apakah guru melakukan refleksi dengan guru lain? (Kelas Tinggi)', 'radio',
 '["Ya, tiap selesai alur", "Ya, tiap selesai tema", "Ya, tiap selesai aktivitas", "Ya, setelah seluruhnya selesai", "Tidak"]',
 26, TRUE, 'implementasi_tinggi', 'kelas_tinggi'),

(NULL, 'Q27', 'Jika ya, sebutkan temuan-temuan pokoknya (Refleksi Guru - Kelas Tinggi)', 'text',
 NULL, 27, TRUE, 'implementasi_tinggi', 'kelas_tinggi'),

(NULL, 'Q28', 'Apakah guru melakukan refleksi dengan murid? (Kelas Tinggi)', 'radio',
 '["Ya, tiap selesai alur", "Ya, tiap selesai tema", "Ya, tiap selesai aktivitas", "Ya, setelah seluruhnya selesai", "Tidak"]',
 28, TRUE, 'implementasi_tinggi', 'kelas_tinggi'),

(NULL, 'Q29', 'Jika ya, sebutkan temuan-temuan pokoknya (Refleksi Murid - Kelas Tinggi)', 'text',
 NULL, 29, TRUE, 'implementasi_tinggi', 'kelas_tinggi'),

(NULL, 'Q30', 'Apakah terdapat kesepakatan kelas (Kelas Tinggi)', 'radio',
 '["Ya, disusun guru dengan murid", "Ya, disiapkan guru", "Tidak"]',
 30, TRUE, 'implementasi_tinggi', 'kelas_tinggi');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION: DUKUNGAN KEPALA SEKOLAH (Q31-Q32)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pertanyaan_survey
  (kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban, urutan, is_required, section, target_kelas)
VALUES
('Q31',
 'Apa saja dukungan kepala sekolah yang telah dilakukan dalam mewujudkan BSAN',
 'checkbox',
 '["Belum ada", "Memimpin refleksi guru", "Melakukan sosialisasi", "Membangun kolaborasi antar pihak", "Memasukkan program BSAN ke dalam kurikulum"]',
 31, TRUE, 'kepsek', 'semua'),

('Q32',
 'Apa saja program sekolah yang sudah disusun dalam mendukung BSAN',
 'checkbox',
 '["Belum ada", "Membuat kotak aduan", "Menyusun SOP pencegahan dan penanganan kekerasan", "Membentuk tim penanggulangan kekerasan", "Menyusun dan menjalankan program pembiasaan karakter", "Memasang poster tentang sekolah aman di dalam dan di luar sekolah", "Memasukkan kegiatan Budaya Sekolah Aman dan Nyaman dalam RKS/RKAS"]',
 32, TRUE, 'kepsek', 'semua');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION: BAGIAN REFLEKSI (Q33-Q36)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pertanyaan_survey
  (kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban, urutan, is_required, section, target_kelas)
VALUES
('Q33',
 'Ceritakan hal baik/perubahan baik selama implementasi modul BSAN, terkait: 1. Manajemen kelas 2. Perubahan perilaku murid/guru',
 'text', NULL, 33, TRUE, 'refleksi', 'semua'),

('Q34',
 'Apa tantangan dan kendala dalam mewujudkan sekolah aman dan nyaman?',
 'text', NULL, 34, TRUE, 'refleksi', 'semua'),

('Q35',
 'Apakah menurut Bpk/Ibu BSAN sesuai/relevan? Mengapa?',
 'text', NULL, 35, TRUE, 'refleksi', 'semua'),

('Q36',
 'Apakah menurut Bpk/Ibu BSAN membantu pekerjaan Bpk/Ibu? Mengapa?',
 'text', NULL, 36, TRUE, 'refleksi', 'semua');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION: KONTAK (Q37)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO pertanyaan_survey
  (kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban, urutan, is_required, section, target_kelas)
VALUES
('Q37', 'No WA responden', 'text', NULL, 37, TRUE, 'kontak', 'semua');


-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────

SELECT section, COUNT(*) AS jumlah
FROM pertanyaan_survey
GROUP BY section
ORDER BY MIN(urutan);

-- Expected:
-- identitas: 8
-- pelatihan: 3 (Q9-Q11) + Q12 = 4
-- implementasi_awal: 9 (Q13-Q21)
-- implementasi_tinggi: 9 (Q22-Q30)
-- kepsek: 2 (Q31-Q32)
-- refleksi: 4 (Q33-Q36)
-- kontak: 1 (Q37)
-- TOTAL: 37
