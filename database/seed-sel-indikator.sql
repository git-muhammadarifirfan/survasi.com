-- ═══════════════════════════════════════════════════════════════════════════════
-- BSAN JAWA TIMUR — SEED: 58 Indikator Observasi SEL
-- Sesuai dokumen resmi: [Final] Instrumen Observasi BSAN-SEL 03092026.docx
--
-- @description
--   Insert 58 indikator observasi SEL yang terbagi:
--   - Guru: 25 indikator (5 dimensi × kelas + lingkungan)
--   - Murid: 33 indikator (5 dimensi × kelas + lingkungan)
--
-- @usage
--   mysql -u root -p db_survasi < database/seed-sel-indikator.sql
-- ═══════════════════════════════════════════════════════════════════════════════

USE db_survasi;

-- Reset data indikator
TRUNCATE TABLE sel_indikator;

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Kesadaran Diri (dimensi_id = 1)
-- 3 kelas + 2 lingkungan = 5 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_kd_kls_1', 1, 'guru', 'kelas', 'Guru meminta murid menuliskan hal yang mereka kuasai dan hal yang perlu mereka tingkatkan', NULL, 1),
('guru_kd_kls_2', 1, 'guru', 'kelas', 'Guru memberi apresiasi atas jawaban murid di kelas', NULL, 2),
('guru_kd_kls_3', 1, 'guru', 'kelas', 'Guru memfasilitasi sesi refleksi di akhir pelajaran', NULL, 3),
('guru_kd_lngk_1', 1, 'guru', 'lingkungan', 'Guru memberi pujian saat murid berani mencoba hal baru. Misal Berani maju ke depan kelas, mengajukan diri menjadi ketua kelas, menjadi petugas upacara dll]', 'Jika selama observasi tidak ada kegiatan, bisa ditanyakan ke guru [secara umum murid, atau hanya murid tertentu]', 4),
('guru_kd_lngk_2', 1, 'guru', 'lingkungan', 'Guru mengajak diskusi ringan saat istirahat tentang pengalaman mereka hari itu', 'Wawancara guru jika tidak terjadi', 5);

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Regulasi Emosi (dimensi_id = 2)
-- 2 kelas + 3 lingkungan = 5 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_re_kls_1', 2, 'guru', 'kelas', 'Ketika kelas gaduh, guru mencontohkan dan mengajak murid menggunakan regulasi emosi (teknik STOP, afirmasi positif, penggunaan tepuk, dll)', NULL, 6),
('guru_re_kls_2', 2, 'guru', 'kelas', 'Guru tetap tenang saat menghadapi situasi yang tak terkendali misalnya, saat kelas gaduh, ada murid tantrum, dll', NULL, 7),
('guru_re_lngk_1', 2, 'guru', 'lingkungan', 'Guru menunjukkan sikap tenang, tidak berteriak atau membentak saat ada kegaduhan di jam istirahat', NULL, 8),
('guru_re_lngk_2', 2, 'guru', 'lingkungan', 'Guru mengingatkan murid dengan kalimat postif saat murid melakukan kesalahan. Misal memecahkan pot, menyerobot antrian di kantin, bermain bola di Lorong kelas dll', NULL, 9),
('guru_re_lngk_3', 2, 'guru', 'lingkungan', 'Guru memberi arahan dengan tenang (tidak memarahi atau membentak) ketika ada murid yang datang terlambat', NULL, 10);

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Kesadaran Sosial (dimensi_id = 3)
-- 5 kelas + 1 lingkungan = 6 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_ks_kls_1', 3, 'guru', 'kelas', 'Guru bersikap terbuka dengan jawaban yg berbeda dalam diskusi', NULL, 11),
('guru_ks_kls_2', 3, 'guru', 'kelas', 'Guru menggunakan Bahasa/istilah yang netral saat memberi contoh atau penyampaian materi (GEDSI)', 'Netral: tidak menggunakan bahasa yang mengasosiasikan kelompok tertentu dengan sifat tertentu, misalnya anak perempuan rajin, anak laki laki nakal', 12),
('guru_ks_kls_3', 3, 'guru', 'kelas', 'Guru mengatur kelompok secara heterogen (keseimbangan jumlah laki-laki dan perempuan dan atau kemampuan)', NULL, 13),
('guru_ks_kls_4', 3, 'guru', 'kelas', 'Guru berinteraksi secara merata dengan semua gender siswa, baik perempuan maupun laki-laki', NULL, 14),
('guru_ks_kls_5', 3, 'guru', 'kelas', 'Guru berinteraksi secara merata ke dengan semua posisi duduk siswa di semua posisi duduk, baik depan, tengah, belakang, kiri dan kanan', NULL, 15),
('guru_ks_lngk_1', 3, 'guru', 'lingkungan', 'Guru menyapa semua murid tanpa membeda-bedakan status sosial maupun gender jenis kelamin', NULL, 16);

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Keterampilan Relasi (dimensi_id = 4)
-- 2 kelas = 2 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_kr_kls_1', 4, 'guru', 'kelas', 'Guru memfasilitasi diskusi kelompok dengan aturan komunikasi positif [Menggunakan kata yang sopan, tidak menyela pembicaraan, memberi kesempatan bergiliran untuk berbicara, menghargai perbedaan pendapat]', NULL, 17),
('guru_kr_kls_2', 4, 'guru', 'kelas', 'Guru membimbing/memberikan contoh/memfasilitasi murid dalam menyelesaikan perbedaan pendapat', NULL, 18);

-- ─────────────────────────────────────────────────────────────────────────────
-- GURU — Tanggung Jawab (dimensi_id = 5)
-- 4 kelas + 3 lingkungan = 7 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('guru_tj_kls_1', 5, 'guru', 'kelas', 'Guru datang tepat waktu dan menyiapkan kelas dengan rapi', NULL, 19),
('guru_tj_kls_2', 5, 'guru', 'kelas', 'Guru mengingatkan murid untuk menyelesaikan tugas tepat waktu', NULL, 20),
('guru_tj_kls_3', 5, 'guru', 'kelas', 'Guru mengajak murid bekerjasama dalam menyelesaikan tugas kelompok/diskusi', NULL, 21),
('guru_tj_kls_4', 5, 'guru', 'kelas', 'Guru memberikan kesempatan pada anak untuk mencoba peran dan tanggung jawab yang berbeda dalam kerja/tugas kelompok', NULL, 22),
('guru_tj_lngk_1', 5, 'guru', 'lingkungan', 'Guru memberikan contoh untuk ikut menjaga kebersihan lingkungan sekolah. Misalnya membuang sampah pada tempatnya', NULL, 23),
('guru_tj_lngk_2', 5, 'guru', 'lingkungan', 'Guru menekankan pentingnya menjaga fasilitas sekolah bersama-sama', NULL, 24),
('guru_tj_lngk_3', 5, 'guru', 'lingkungan', 'Guru mengajak murid ikut serta dalam kegiatan peduli lingkungan', NULL, 25);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Kesadaran Diri (dimensi_id = 1)
-- 3 kelas + 4 lingkungan = 7 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_kd_kls_1', 1, 'murid', 'kelas', 'Murid dapat menyebutkan/menjelaskan perasaannya saat diminta guru', NULL, 26),
('murid_kd_kls_2', 1, 'murid', 'kelas', 'Murid berani menjawab pertanyaan atau presentasi di depan kelas', NULL, 27),
('murid_kd_kls_3', 1, 'murid', 'kelas', 'Murid mau mendengarkan pendapat temannya saat diskusi', NULL, 28),
('murid_kd_lngk_1', 1, 'murid', 'lingkungan', 'Murid mengungkapkan perasaan kepada teman. Misalnya, sedih saat kalah bermain, sakit ketika tak sengaja terdorong teman hingga jatuh, dll', NULL, 29),
('murid_kd_lngk_2', 1, 'murid', 'lingkungan', 'Murid secara aktif menawarkan diri untuk berkontribusi sesuai kemampuannya saat kegiatan di luar jam pelajaran', 'Wawancara guru jika saat observasi tidak ditemukan peristiwa yang mendukung', 30),
('murid_kd_lngk_3', 1, 'murid', 'lingkungan', 'Murid menyapa guru dengan ramah, atau mengajak teman (termasuk anak disabilitas-jika ada) bermain bersama', NULL, 31),
('murid_kd_lngk_4', 1, 'murid', 'lingkungan', 'Murid tahu area pribadi yang boleh disentuh – mengingatkan temannya jika tersentuh/disentuh', 'Bisa ditanyakan guru jika tidak ada peristiwa mendukung', 32);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Regulasi Emosi (dimensi_id = 2)
-- 3 kelas + 2 lingkungan = 5 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_re_kls_1', 2, 'murid', 'kelas', 'Murid menggunakan teknik regulasi emosi saat merasa kesulitan', 'Jika saat observasi tidak ada peristiwa yg mendukung, bisa ditanyakan kepada murid dan atau guru', 33),
('murid_re_kls_2', 2, 'murid', 'kelas', 'Murid tidak langsung menangis atau marah saat gagal menjawab atau kelengkapan menulisnya tidak lengkap', 'Jika tidak ada peristiwa yg mendukung bisa ditanyakan ke guru', 34),
('murid_re_kls_3', 2, 'murid', 'kelas', 'Murid kembali mengikuti pembelajaran setelah menenangkan diri', 'Bisa ditanyakan guru jika tidak ada peristiwa yang mendukung selama observasi', 35),
('murid_re_lngk_1', 2, 'murid', 'lingkungan', 'Murid tidak membalas ejekan teman', NULL, 36),
('murid_re_lngk_2', 2, 'murid', 'lingkungan', 'Murid bersikap positif saat kalah dalam bermain', NULL, 37);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Kesadaran Sosial (dimensi_id = 3)
-- 3 kelas + 2 lingkungan = 5 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_ks_kls_1', 3, 'murid', 'kelas', 'Murid mendengarkan pendapat teman tanpa memotong', NULL, 38),
('murid_ks_kls_2', 3, 'murid', 'kelas', 'Murid menerima pendapat yang berbeda tanpa mengejek atau menertawakannya', NULL, 39),
('murid_ks_kls_3', 3, 'murid', 'kelas', 'Murid menghibur atau memberi semangat ketika temannya mengalami kesulitan atau sedih', NULL, 40),
('murid_ks_lngk_1', 3, 'murid', 'lingkungan', 'Murid menenangkan teman yang menangis saat bermain', NULL, 41),
('murid_ks_lngk_2', 3, 'murid', 'lingkungan', 'Murid mau bermain bersama teman yang berbeda (jenis kelamin, dan kelompok sosial (berbeda ras, suku, agama), termasuk anak dengan disabilitas', NULL, 42);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Keterampilan Relasi (dimensi_id = 4)
-- 5 kelas = 5 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_kr_1', 4, 'murid', 'kelas', 'Murid tidak berteriak atau mengejek saat konflik muncul', NULL, 43),
('murid_kr_2', 4, 'murid', 'kelas', 'Murid meminta maaf saat berselisih dengan temannya', NULL, 44),
('murid_kr_3', 4, 'murid', 'kelas', 'Murid secara aktif menggunakan 3 kata Ajaib (maaf, terima kasih, dan tolong)', NULL, 45),
('murid_kr_4', 4, 'murid', 'kelas', 'Murid tidak membalas dorongan fisik/prilaku kekerasan fisik', NULL, 46),
('murid_kr_5', 4, 'murid', 'kelas', 'Murid bisa berdamai setelah berselisih', NULL, 47);

-- ─────────────────────────────────────────────────────────────────────────────
-- MURID — Tanggung Jawab (dimensi_id = 5)
-- 5 kelas + 6 lingkungan = 11 indikator
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES
('murid_tj_kls_1', 5, 'murid', 'kelas', 'Murid membawa perlengkapan belajar dengan tertib', NULL, 48),
('murid_tj_kls_2', 5, 'murid', 'kelas', 'Murid mengumpulkan tugas tepat waktu', NULL, 49),
('murid_tj_kls_3', 5, 'murid', 'kelas', 'Murid membantu teman yang kesulitan', NULL, 50),
('murid_tj_kls_4', 5, 'murid', 'kelas', 'Murid merapikan meja dan kursi setelah pembelajaran', NULL, 51),
('murid_tj_kls_5', 5, 'murid', 'kelas', 'Murid menggunakan seragam sesuai dan rapi', NULL, 52),
('murid_tj_lngk_1', 5, 'murid', 'lingkungan', 'Murid bisa mengatur diri sendiri untuk menaati aturan waktu istirahat dan masuk ke kelas tanpa diingatkan guru', NULL, 53),
('murid_tj_lngk_2', 5, 'murid', 'lingkungan', 'Murid menghormati area tubuh teman yang boleh di sentuh dan tidak', NULL, 54),
('murid_tj_lngk_3', 5, 'murid', 'lingkungan', 'Murid menggunakan Bahasa positif ketika berbicara dan bermain bersama teman', NULL, 55),
('murid_tj_lngk_4', 5, 'murid', 'lingkungan', 'Murid mengingatkan ketika ada teman yang menggunakan bahasa yang negatif atau yang bisa membuat orang lain tidak nyaman', NULL, 56),
('murid_tj_lngk_5', 5, 'murid', 'lingkungan', 'Murid menaati kesepakatan kelas dan aturan sekolah', NULL, 57),
('murid_tj_lngk_6', 5, 'murid', 'lingkungan', 'Murid menjaga lingkungan sekolah seperti: membuang sampah pada tempatnya, memelihara tanaman kelas dll', NULL, 58);

SELECT 'Total Indikator' AS metric, COUNT(*) AS value FROM sel_indikator
UNION ALL
SELECT 'Guru', COUNT(*) FROM sel_indikator WHERE subjek = 'guru'
UNION ALL
SELECT 'Murid', COUNT(*) FROM sel_indikator WHERE subjek = 'murid'
UNION ALL
SELECT 'Konteks Kelas', COUNT(*) FROM sel_indikator WHERE konteks = 'kelas'
UNION ALL
SELECT 'Konteks Lingkungan', COUNT(*) FROM sel_indikator WHERE konteks = 'lingkungan';
