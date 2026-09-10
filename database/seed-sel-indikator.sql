-- ═══════════════════════════════════════════════════════════════════════════════
-- BSAN JAWA TIMUR — SEED: 55 Indikator Observasi SEL
-- Sesuai dokumen: [Final] Instrumen Observasi BSAN-SEL 03092026.docx
--
-- @description
--   Insert semua 55 indikator observasi SEL yang terbagi:
--   - Guru: 26 indikator (5 dimensi × kelas + lingkungan)
--   - Murid: 29 indikator (5 dimensi × kelas + lingkungan)
--
-- @prerequisites
--   Jalankan setelah seed.sql (membutuhkan data sel_dimensi)
--
-- @usage
--   mysql -u root -p bsan_jatim_monitoring < database/seed-sel-indikator.sql
-- ═══════════════════════════════════════════════════════════════════════════════

USE bsan_jatim_monitoring;

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Kesadaran Diri (dimensi_id = 1)
-- 4 kelas + 2 lingkungan = 6 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_kd_kls_1', 1, 'guru', 'kelas',
 'Guru mengajak murid mengenali kekuatan dan kelemahan diri',
 NULL, 1),
('guru_kd_kls_2', 1, 'guru', 'kelas',
 'Guru meminta murid menuliskan hal yang mereka kuasai dan hal yang perlu mereka tingkatkan',
 NULL, 2),
('guru_kd_kls_3', 1, 'guru', 'kelas',
 'Guru memberi apresiasi atas jawaban murid di kelas',
 NULL, 3),
('guru_kd_kls_4', 1, 'guru', 'kelas',
 'Guru memfasilitasi sesi refleksi di akhir pelajaran',
 NULL, 4),
('guru_kd_lngk_1', 1, 'guru', 'lingkungan',
 'Guru memberi pujian saat murid berani mencoba hal baru (misal: maju ke depan kelas, menjadi ketua kelas, menjadi petugas upacara)',
 'Jika selama observasi tidak ada kegiatan, bisa ditanyakan ke guru (secara umum murid, atau hanya murid tertentu)', 5),
('guru_kd_lngk_2', 1, 'guru', 'lingkungan',
 'Guru mengajak diskusi ringan saat istirahat tentang pengalaman mereka hari itu',
 'Wawancara guru jika tidak terjadi', 6);

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Regulasi Emosi (dimensi_id = 2)
-- 3 kelas + 3 lingkungan = 6 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_re_kls_1', 2, 'guru', 'kelas',
 'Guru mencontohkan teknik pengelolaan emosi (misal: tarik napas)',
 NULL, 7),
('guru_re_kls_2', 2, 'guru', 'kelas',
 'Ketika kelas gaduh, guru mencontohkan dan mengajak murid menggunakan regulasi emosi (teknik STOP, afirmasi positif, penggunaan tepuk, dll)',
 NULL, 8),
('guru_re_kls_3', 2, 'guru', 'kelas',
 'Guru tetap tenang saat menghadapi situasi yang tak terkendali (misal: kelas gaduh, murid tantrum)',
 NULL, 9),
('guru_re_lngk_1', 2, 'guru', 'lingkungan',
 'Guru menunjukkan sikap tenang, tidak berteriak atau membentak saat ada kegaduhan di jam istirahat',
 NULL, 10),
('guru_re_lngk_2', 2, 'guru', 'lingkungan',
 'Guru mengingatkan murid dengan kalimat positif saat murid melakukan kesalahan (misal: memecahkan pot, menyerobot antrian, bermain bola di lorong)',
 NULL, 11),
('guru_re_lngk_3', 2, 'guru', 'lingkungan',
 'Guru memberi arahan dengan tenang (tidak memarahi atau membentak) ketika ada murid yang datang terlambat',
 NULL, 12);

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Kesadaran Sosial (dimensi_id = 3)
-- 6 kelas + 1 lingkungan = 7 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_ks_kls_1', 3, 'guru', 'kelas',
 'Guru menekankan pentingnya menghargai perbedaan',
 NULL, 13),
('guru_ks_kls_2', 3, 'guru', 'kelas',
 'Guru bersikap terbuka dengan jawaban yang berbeda dalam diskusi',
 NULL, 14),
('guru_ks_kls_3', 3, 'guru', 'kelas',
 'Guru menggunakan bahasa/istilah yang netral saat memberi contoh atau penyampaian materi (GEDSI)',
 'Netral: tidak menggunakan bahasa yang mengasosiasikan kelompok tertentu dengan sifat tertentu, misal "anak perempuan rajin, anak laki-laki nakal"', 15),
('guru_ks_kls_4', 3, 'guru', 'kelas',
 'Guru mengatur kelompok secara heterogen (keseimbangan jumlah laki-laki dan perempuan dan/atau kemampuan)',
 NULL, 16),
('guru_ks_kls_5', 3, 'guru', 'kelas',
 'Guru berinteraksi secara merata dengan semua gender siswa, baik perempuan maupun laki-laki',
 NULL, 17),
('guru_ks_kls_6', 3, 'guru', 'kelas',
 'Guru berinteraksi secara merata ke semua posisi duduk siswa (depan, tengah, belakang, kiri, dan kanan)',
 NULL, 18),
('guru_ks_lngk_1', 3, 'guru', 'lingkungan',
 'Guru menyapa semua murid tanpa membeda-bedakan status sosial maupun jenis kelamin',
 NULL, 19);

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Keterampilan Relasi (dimensi_id = 4)
-- 2 kelas = 2 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_kr_kls_1', 4, 'guru', 'kelas',
 'Guru memfasilitasi diskusi kelompok dengan aturan komunikasi positif (menggunakan kata sopan, tidak menyela, memberi kesempatan bergiliran, menghargai perbedaan pendapat)',
 NULL, 20),
('guru_kr_kls_2', 4, 'guru', 'kelas',
 'Guru membimbing/memberikan contoh/memfasilitasi murid dalam menyelesaikan perbedaan pendapat',
 NULL, 21);

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Tanggung Jawab (dimensi_id = 5)
-- 4 kelas + 3 lingkungan = 7 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_tj_kls_1', 5, 'guru', 'kelas',
 'Guru datang tepat waktu dan menyiapkan kelas dengan rapi',
 NULL, 22),
('guru_tj_kls_2', 5, 'guru', 'kelas',
 'Guru mengingatkan murid untuk menyelesaikan tugas tepat waktu',
 NULL, 23),
('guru_tj_kls_3', 5, 'guru', 'kelas',
 'Guru mengajak murid bekerjasama dalam menyelesaikan tugas kelompok/diskusi',
 NULL, 24),
('guru_tj_kls_4', 5, 'guru', 'kelas',
 'Guru memberikan kesempatan pada anak untuk mencoba peran dan tanggung jawab yang berbeda dalam kerja/tugas kelompok',
 NULL, 25),
('guru_tj_lngk_1', 5, 'guru', 'lingkungan',
 'Guru memberikan contoh untuk ikut menjaga kebersihan lingkungan sekolah (misal: membuang sampah pada tempatnya)',
 NULL, 26),
('guru_tj_lngk_2', 5, 'guru', 'lingkungan',
 'Guru menekankan pentingnya menjaga fasilitas sekolah bersama-sama',
 NULL, 27),
('guru_tj_lngk_3', 5, 'guru', 'lingkungan',
 'Guru mengajak murid ikut serta dalam kegiatan peduli lingkungan',
 NULL, 28);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Kesadaran Diri (dimensi_id = 1)
-- 3 kelas + 4 lingkungan = 7 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_kd_kls_1', 1, 'murid', 'kelas',
 'Murid dapat menyebutkan/menjelaskan perasaannya saat diminta guru',
 NULL, 29),
('murid_kd_kls_2', 1, 'murid', 'kelas',
 'Murid berani menjawab pertanyaan atau presentasi di depan kelas',
 NULL, 30),
('murid_kd_kls_3', 1, 'murid', 'kelas',
 'Murid mau mendengarkan pendapat temannya saat diskusi',
 NULL, 31),
('murid_kd_lngk_1', 1, 'murid', 'lingkungan',
 'Murid mengungkapkan perasaan kepada teman (misal: sedih saat kalah bermain, sakit ketika tak sengaja terdorong)',
 NULL, 32),
('murid_kd_lngk_2', 1, 'murid', 'lingkungan',
 'Murid secara aktif menawarkan diri untuk berkontribusi sesuai kemampuannya saat kegiatan di luar jam pelajaran',
 'Wawancara guru jika saat observasi tidak ditemukan peristiwa yang mendukung', 33),
('murid_kd_lngk_3', 1, 'murid', 'lingkungan',
 'Murid menyapa guru dengan ramah, atau mengajak teman (termasuk anak disabilitas jika ada) bermain bersama',
 NULL, 34),
('murid_kd_lngk_4', 1, 'murid', 'lingkungan',
 'Murid tahu area pribadi yang boleh disentuh dan mengingatkan temannya jika tersentuh/disentuh',
 'Bisa ditanyakan guru jika tidak ada peristiwa mendukung', 35);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Regulasi Emosi (dimensi_id = 2)
-- 3 kelas + 2 lingkungan = 5 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_re_kls_1', 2, 'murid', 'kelas',
 'Murid menggunakan teknik regulasi emosi saat merasa kesulitan',
 'Jika saat observasi tidak ada peristiwa yang mendukung, bisa ditanyakan kepada murid dan/atau guru', 36),
('murid_re_kls_2', 2, 'murid', 'kelas',
 'Murid tidak langsung menangis atau marah saat gagal menjawab atau kelengkapan menulisnya tidak lengkap',
 'Jika tidak ada peristiwa yang mendukung bisa ditanyakan ke guru', 37),
('murid_re_kls_3', 2, 'murid', 'kelas',
 'Murid kembali mengikuti pembelajaran setelah menenangkan diri',
 'Bisa ditanyakan guru jika tidak ada peristiwa yang mendukung selama observasi', 38),
('murid_re_lngk_1', 2, 'murid', 'lingkungan',
 'Murid tidak membalas ejekan teman',
 NULL, 39),
('murid_re_lngk_2', 2, 'murid', 'lingkungan',
 'Murid bersikap positif saat kalah dalam bermain',
 NULL, 40);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Kesadaran Sosial (dimensi_id = 3)
-- 3 kelas + 2 lingkungan = 5 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_ks_kls_1', 3, 'murid', 'kelas',
 'Murid mendengarkan pendapat teman tanpa memotong',
 NULL, 41),
('murid_ks_kls_2', 3, 'murid', 'kelas',
 'Murid menerima pendapat yang berbeda tanpa mengejek atau menertawakannya',
 NULL, 42),
('murid_ks_kls_3', 3, 'murid', 'kelas',
 'Murid menghibur atau memberi semangat ketika temannya mengalami kesulitan atau sedih',
 NULL, 43),
('murid_ks_lngk_1', 3, 'murid', 'lingkungan',
 'Murid menenangkan teman yang menangis saat bermain',
 NULL, 44),
('murid_ks_lngk_2', 3, 'murid', 'lingkungan',
 'Murid mau bermain bersama teman yang berbeda (jenis kelamin, kelompok sosial, ras, suku, agama, termasuk anak dengan disabilitas)',
 NULL, 45);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Keterampilan Relasi (dimensi_id = 4)
-- 5 kelas = 5 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_kr_1', 4, 'murid', 'kelas',
 'Murid tidak berteriak atau mengejek saat konflik muncul',
 NULL, 46),
('murid_kr_2', 4, 'murid', 'kelas',
 'Murid meminta maaf saat berselisih dengan temannya',
 NULL, 47),
('murid_kr_3', 4, 'murid', 'kelas',
 'Murid secara aktif menggunakan 3 kata ajaib (maaf, terima kasih, dan tolong)',
 NULL, 48),
('murid_kr_4', 4, 'murid', 'kelas',
 'Murid tidak membalas dorongan fisik/perilaku kekerasan fisik',
 NULL, 49),
('murid_kr_5', 4, 'murid', 'kelas',
 'Murid bisa berdamai setelah berselisih',
 NULL, 50);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Tanggung Jawab (dimensi_id = 5)
-- 5 kelas + 6 lingkungan = 11 indikator
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_tj_kls_1', 5, 'murid', 'kelas',
 'Murid membawa perlengkapan belajar dengan tertib',
 NULL, 51),
('murid_tj_kls_2', 5, 'murid', 'kelas',
 'Murid mengumpulkan tugas tepat waktu',
 NULL, 52),
('murid_tj_kls_3', 5, 'murid', 'kelas',
 'Murid membantu teman yang kesulitan',
 NULL, 53),
('murid_tj_kls_4', 5, 'murid', 'kelas',
 'Murid merapikan meja dan kursi setelah pembelajaran',
 NULL, 54),
('murid_tj_kls_5', 5, 'murid', 'kelas',
 'Murid menggunakan seragam sesuai dan rapi',
 NULL, 55),
('murid_tj_lngk_1', 5, 'murid', 'lingkungan',
 'Murid bisa mengatur diri sendiri untuk menaati aturan waktu istirahat dan masuk ke kelas tanpa diingatkan guru',
 NULL, 56),
('murid_tj_lngk_2', 5, 'murid', 'lingkungan',
 'Murid menghormati area tubuh teman yang boleh disentuh dan tidak',
 NULL, 57),
('murid_tj_lngk_3', 5, 'murid', 'lingkungan',
 'Murid menggunakan bahasa positif ketika berbicara dan bermain bersama teman',
 NULL, 58),
('murid_tj_lngk_4', 5, 'murid', 'lingkungan',
 'Murid mengingatkan ketika ada teman yang menggunakan bahasa yang negatif atau yang bisa membuat orang lain tidak nyaman',
 NULL, 59),
('murid_tj_lngk_5', 5, 'murid', 'lingkungan',
 'Murid menaati kesepakatan kelas dan aturan sekolah',
 NULL, 60),
('murid_tj_lngk_6', 5, 'murid', 'lingkungan',
 'Murid menjaga lingkungan sekolah (misal: membuang sampah pada tempatnya, memelihara tanaman kelas)',
 NULL, 61);


-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  'Total Indikator' AS metric, COUNT(*) AS value FROM sel_indikator
UNION ALL
SELECT 'Guru', COUNT(*) FROM sel_indikator WHERE subjek = 'guru'
UNION ALL
SELECT 'Murid', COUNT(*) FROM sel_indikator WHERE subjek = 'murid'
UNION ALL
SELECT 'Konteks Kelas', COUNT(*) FROM sel_indikator WHERE konteks = 'kelas'
UNION ALL
SELECT 'Konteks Lingkungan', COUNT(*) FROM sel_indikator WHERE konteks = 'lingkungan';

-- Per dimensi
SELECT sd.nama AS dimensi,
       SUM(CASE WHEN si.subjek = 'guru' THEN 1 ELSE 0 END) AS guru,
       SUM(CASE WHEN si.subjek = 'murid' THEN 1 ELSE 0 END) AS murid,
       COUNT(*) AS total
FROM sel_indikator si
JOIN sel_dimensi sd ON si.dimensi_id = sd.id
GROUP BY sd.id, sd.nama
ORDER BY sd.urutan;

-- Expected:
-- Kesadaran Diri:      Guru 6, Murid 7 = 13
-- Regulasi Emosi:      Guru 6, Murid 5 = 11
-- Kesadaran Sosial:    Guru 7, Murid 5 = 12
-- Keterampilan Relasi: Guru 2, Murid 5 = 7
-- Tanggung Jawab:      Guru 7, Murid 11 = 18
-- TOTAL: 28 Guru + 33 Murid = 61
