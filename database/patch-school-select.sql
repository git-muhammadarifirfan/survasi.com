-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL MIGRATION / PATCH: OPTIMASI TIPE ISIAN DROPDOWN DATABASE SEKOLAH (Q4)
-- DB: db_survasi
-- ═══════════════════════════════════════════════════════════════════════════════

USE db_survasi;

-- 1. Modifikasi kolom 'tipe' pada tabel 'pertanyaan_survey' agar mendukung 'school_select'
ALTER TABLE pertanyaan_survey 
MODIFY COLUMN tipe VARCHAR(50) NOT NULL DEFAULT 'text'
COMMENT 'Jenis input jawaban: text, radio, checkbox, dropdown, scale, school_select';

-- 2. Update Q4 (Asal Sekolah) agar tipe isiannya 'school_select' (Dropdown Database Sekolah)
UPDATE pertanyaan_survey 
SET tipe = 'school_select' 
WHERE kode_pertanyaan = 'Q4' OR LOWER(teks_pertanyaan) LIKE '%asal sekolah%';

-- 3. Verifikasi perubahan
SELECT id, kode_pertanyaan, teks_pertanyaan, tipe, section 
FROM pertanyaan_survey 
WHERE kode_pertanyaan = 'Q4' OR tipe = 'school_select';
