-- ═══════════════════════════════════════════════════════════════════════════════
-- BSAN JAWA TIMUR — SEED DATA
-- Data awal: Wilayah, Modul BSAN, Dimensi SEL, User Default, Alur Tema
--
-- @description
--   Seed data ini harus dijalankan SETELAH schema.sql.
--   Berisi data referensi yang diperlukan untuk sistem berjalan.
--
-- @usage
--   mysql -u root -p db_survasi < database/seed.sql
--
-- @version 1.0.0
-- @created 2026-09-09
-- ═══════════════════════════════════════════════════════════════════════════════

USE db_survasi;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. WILAYAH: Provinsi → Kabupaten → Kecamatan
-- ─────────────────────────────────────────────────────────────────────────────

-- Provinsi
INSERT INTO provinsi (nama, kode_bps) VALUES
('Jawa Timur', '35');

-- Kabupaten/Kota (provinsi_id = 1)
INSERT INTO kabupaten (provinsi_id, nama, kode_bps, tipe, warna_chart) VALUES
(1, 'Kab. Sidoarjo', '3515', 'kabupaten', '#4A57C4'),
(1, 'Kota Batu',     '3579', 'kota',      '#6C7AE0'),
(1, 'Kab. Tuban',    '3523', 'kabupaten', '#2FB344');

-- ── Kecamatan Kab. Sidoarjo (kabupaten_id = 1) ──
-- 18 kecamatan sesuai data existing di KECAMATAN_LIST
INSERT INTO kecamatan (kabupaten_id, nama) VALUES
(1, 'Waru'),
(1, 'Taman'),
(1, 'Gedangan'),
(1, 'Sedati'),
(1, 'Buduran'),
(1, 'Sukodono'),
(1, 'Sidoarjo'),
(1, 'Krian'),
(1, 'Balong Bendo'),
(1, 'Tarik'),
(1, 'Prambon'),
(1, 'Krembung'),
(1, 'Porong'),
(1, 'Jabon'),
(1, 'Tanggulangin'),
(1, 'Tulangan'),
(1, 'Wonoayu'),
(1, 'Candi');

-- ── Kecamatan Kota Batu (kabupaten_id = 2) ──
-- 3 kecamatan
INSERT INTO kecamatan (kabupaten_id, nama) VALUES
(2, 'Batu'),
(2, 'Bumiaji'),
(2, 'Junrejo');

-- ── Kecamatan Kab. Tuban (kabupaten_id = 3) ──
-- 21 kecamatan (termasuk Grabagan yang ada di soal.md)
INSERT INTO kecamatan (kabupaten_id, nama) VALUES
(3, 'Tuban'),
(3, 'Jenu'),
(3, 'Merakurak'),
(3, 'Semanding'),
(3, 'Palang'),
(3, 'Widang'),
(3, 'Babat'),
(3, 'Plumpang'),
(3, 'Rengel'),
(3, 'Soko'),
(3, 'Parengan'),
(3, 'Singgahan'),
(3, 'Senori'),
(3, 'Bangilan'),
(3, 'Jatirogo'),
(3, 'Kenduruan'),
(3, 'Montong'),
(3, 'Kerek'),
(3, 'Tambakboyo'),
(3, 'Bancar'),
(3, 'Grabagan');


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MODUL BSAN (3 modul sesuai CASEL Framework)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO modul_bsan (kode, nama, nama_en, subtitle, subtitle_en, warna, ikon, urutan) VALUES
(
  'with_myself',
  'With Myself: Dengan Diriku',
  'With Myself',
  'Memahami dan mengelola emosi',
  'Understanding and managing emotions',
  '#4A57C4', 'brain', 1
),
(
  'with_others',
  'With Others: Dengan Orang Lain',
  'With Others',
  'Membangun dan menjaga hubungan positif',
  'Forming and sustaining positive relationships',
  '#10B981', 'users', 2
),
(
  'with_challenges',
  'With Our Challenges: Dengan Tantangan Kita',
  'With Our Challenges',
  'Menjadikan hidup lebih bermakna',
  'Making the most out of life',
  '#F59E0B', 'target', 3
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. DIMENSI SEL (5 dimensi → mapping ke 3 modul BSAN)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sel_dimensi (kode, nama, modul_bsan_kode, general_skill_id, urutan) VALUES
('kesadaran_diri',      'Kesadaran Diri',       'with_myself',      'self_awareness',              1),
('regulasi_emosi',      'Regulasi Emosi',       'with_myself',      'self_regulation',             2),
('kesadaran_sosial',    'Kesadaran Sosial',     'with_others',      'social_awareness',            3),
('keterampilan_relasi', 'Keterampilan Relasi',  'with_others',      'positive_communication',      4),
('tanggung_jawab',      'Tanggung Jawab',       'with_challenges',  'responsible_decision_making',  5);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. DEFAULT USERS
-- ─────────────────────────────────────────────────────────────────────────────
-- Password Strategy:
--   Admin   : email = admin@survasi.com | password = admin
--   Pengawas: login = NPSN sekolah      | password = <kata_pertama_nama_sekolah_lowercase><4_digit_terakhir_NPSN>
--             Contoh: SDN Candi 1 / NPSN 20512345 → login: 20512345 | password: sdn2345
--
-- Hash bcrypt di bawah digenerate dengan rounds=12.
-- Generate hash baru: node -e "require('bcryptjs').hash('admin',12).then(console.log)"
-- ─────────────────────────────────────────────────────────────────────────────

-- Admin (role: admin — CRUD semua data & analisa)
-- Login: admin@survasi.com / admin
INSERT INTO users (nama, email, password_hash, role, jabatan, instansi, is_active) VALUES
(
  'Administrator BSAN',
  'admin@survasi.com',
  -- bcrypt hash of 'admin' (rounds=12)
  -- Generate ulang: node -e "require('bcryptjs').hash('admin',12).then(console.log)"
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6o8dE9V8fy',
  'admin',
  'Administrator Sistem Monitoring BSAN',
  'Survasi.com / Dinas Pendidikan Jawa Timur',
  TRUE
);

-- Pengawas Demo (role: pengawas)
-- Login: pengawas@survasi.com / pengawas
INSERT INTO users (nama, email, password_hash, role, jabatan, instansi, is_active) VALUES
(
  'Demo Pengawas',
  'pengawas@survasi.com',
  -- bcrypt hash of 'pengawas' (rounds=12)
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uADdmTxCi',
  'pengawas',
  'Pengawas Sekolah / Penilik',
  'Dinas Pendidikan Kab. Sidoarjo',
  TRUE
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. USER PREFERENCES (default untuk setiap user)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO user_preferences (user_id) VALUES
(1),  -- Admin
(2);  -- Pengawas Demo


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ALUR TEMA PEMBELAJARAN
-- Mapping tema ke modul BSAN per target kelas
-- Sesuai soal.md (Google Form pertanyaan 13-14 & 22-23)
-- ─────────────────────────────────────────────────────────────────────────────

-- ══ KELAS AWAL (Kelas 1-3) ══

-- Modul 1: With Myself — Alur 1 (5 tema)
INSERT INTO alur_tema (modul_id, nama_alur, nama_tema, target_kelas, urutan) VALUES
(1, 'Alur 1', 'Tema 1: Tubuhku Istimewa',              'kelas_awal', 1),
(1, 'Alur 1', 'Tema 2: Aku Jaga Diri',                 'kelas_awal', 2),
(1, 'Alur 1', 'Tema 3: Perasaanku, Tanggungjawabku',   'kelas_awal', 3),
(1, 'Alur 1', 'Tema 4: Aku Bisa, Aku Hebat',           'kelas_awal', 4),
(1, 'Alur 1', 'Tema 5: Aku Gemar Membaca',             'kelas_awal', 5);

-- Modul 2: With Others — Alur 2 (2 tema)
INSERT INTO alur_tema (modul_id, nama_alur, nama_tema, target_kelas, urutan) VALUES
(2, 'Alur 2', 'Tema 6: Aku, Kamu, Kita Unik',                 'kelas_awal', 6),
(2, 'Alur 2', 'Tema 7: Tubuhku Bicara, Emosi Bisa Berubah',   'kelas_awal', 7);

-- Modul 3: With Our Challenges — Alur 3 (3 tema)
INSERT INTO alur_tema (modul_id, nama_alur, nama_tema, target_kelas, urutan) VALUES
(3, 'Alur 3', 'Tema 8: Surat Untuk yang tersayang',   'kelas_awal', 8),
(3, 'Alur 3', 'Tema 9: Jaga Layar, Jaga Diri',       'kelas_awal', 9),
(3, 'Alur 3', 'Tema 10: Aku Mau Membantu',            'kelas_awal', 10);

-- ══ KELAS TINGGI (Kelas 4-6) ══

-- Modul 1: With Myself — Alur 1 (4 tema)
INSERT INTO alur_tema (modul_id, nama_alur, nama_tema, target_kelas, urutan) VALUES
(1, 'Alur 1', 'Tema 1: Mengenali Perasaan Diri',           'kelas_tinggi', 1),
(1, 'Alur 1', 'Tema 2: Mengelola Perasaan Diri',           'kelas_tinggi', 2),
(1, 'Alur 1', 'Tema 3: Peta Tubuh Saya',                   'kelas_tinggi', 3),
(1, 'Alur 1', 'Tema 4: Afirmasi Positif',                   'kelas_tinggi', 4);

-- Modul 2: With Others — Alur 2 (5 tema)
INSERT INTO alur_tema (modul_id, nama_alur, nama_tema, target_kelas, urutan) VALUES
(2, 'Alur 2', 'Tema 5: Lingkaran Persahabatan',            'kelas_tinggi', 5),
(2, 'Alur 2', 'Tema 6: Berbagi Persahabatan',              'kelas_tinggi', 6),
(2, 'Alur 2', 'Tema 7: Tanggung Jawab Diri',               'kelas_tinggi', 7),
(2, 'Alur 2', 'Tema 8: Ayo Bermain Bersama',               'kelas_tinggi', 8),
(2, 'Alur 2', 'Tema 9: Aku dan Kamu Istimewa',             'kelas_tinggi', 9);

-- Modul 3: With Our Challenges — Alur 3 (3 tema)
INSERT INTO alur_tema (modul_id, nama_alur, nama_tema, target_kelas, urutan) VALUES
(3, 'Alur 3', 'Tema 10: Gembira bersama Sahabat',          'kelas_tinggi', 10),
(3, 'Alur 3', 'Tema 11: Kampanye Anak Indonesia Hebat',    'kelas_tinggi', 11),
(3, 'Alur 3', 'Tema 12: Refleksi dan Tindak Lanjut',       'kelas_tinggi', 12);


-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION: Cek jumlah data yang di-insert
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'provinsi' AS tabel, COUNT(*) AS jumlah FROM provinsi
UNION ALL SELECT 'kabupaten', COUNT(*) FROM kabupaten
UNION ALL SELECT 'kecamatan', COUNT(*) FROM kecamatan
UNION ALL SELECT 'modul_bsan', COUNT(*) FROM modul_bsan
UNION ALL SELECT 'sel_dimensi', COUNT(*) FROM sel_dimensi
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'user_preferences', COUNT(*) FROM user_preferences
UNION ALL SELECT 'alur_tema', COUNT(*) FROM alur_tema;

-- Expected:
-- provinsi: 1
-- kabupaten: 3
-- kecamatan: 42 (18 + 3 + 21)
-- modul_bsan: 3
-- sel_dimensi: 5
-- users: 2
-- user_preferences: 2
-- alur_tema: 22 (10 kelas_awal + 12 kelas_tinggi)
