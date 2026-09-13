-- ═══════════════════════════════════════════════════════════════════════════════
-- BSAN JAWA TIMUR — SQL RESTORE & DATA RECOVERY GUIDE (SOFT DELETE)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Dokumen ini berisi kumpulan query SQL untuk memeriksa dan memulihkan (restore)
-- data yang terhapus secara tidak sengaja dari database MySQL.
-- ═══════════════════════════════════════════════════════════════════════════════

USE db_survasi;

-- ───────────────────────────────────────────────────────────────────────────────
-- 1. INSPEKSI DATA YANG TERHAPUS (SOFT DELETED)
-- ───────────────────────────────────────────────────────────────────────────────

-- A. Cek User / Pengguna yang Terhapus
SELECT id, nama, email, role, deleted_at 
FROM users 
WHERE deleted_at IS NOT NULL;

-- B. Cek Sekolah / Satuan Pendidikan yang Terhapus
SELECT id, npsn, nama, deleted_at 
FROM satuan_pendidikan 
WHERE deleted_at IS NOT NULL;

-- C. Cek Responden Survey yang Terhapus
SELECT id, nama, npsn, posisi, deleted_at 
FROM responden_survey 
WHERE deleted_at IS NOT NULL;

-- D. Cek Sesi Observasi SEL yang Terhapus
SELECT id, sekolah_id, observer_nama, tanggal, deleted_at 
FROM sel_sesi_observasi 
WHERE deleted_at IS NOT NULL;

-- E. Cek Pertanyaan Survey yang Terhapus
SELECT id, kode_pertanyaan, teks_pertanyaan, deleted_at 
FROM pertanyaan_survey 
WHERE deleted_at IS NOT NULL;


-- ───────────────────────────────────────────────────────────────────────────────
-- 2. QUERY RESTORE (PEMULIHAN DATA TERHAPUS)
-- ───────────────────────────────────────────────────────────────────────────────

-- A. Restore User Spesifik berdasarkan ID
UPDATE users 
SET deleted_at = NULL 
WHERE id = 123; -- Ganti 123 dengan ID user yang ingin dipulihkan

-- B. Restore User Spesifik berdasarkan Email
UPDATE users 
SET deleted_at = NULL 
WHERE LOWER(email) = 'email@sekolah.sch.id';

-- C. Restore Semua User yang Terhapus
UPDATE users 
SET deleted_at = NULL 
WHERE deleted_at IS NOT NULL;

-- D. Restore Sekolah berdasarkan NPSN
UPDATE satuan_pendidikan 
SET deleted_at = NULL 
WHERE npsn = '20101234';

-- E. Restore Responden Survey berdasarkan ID
UPDATE responden_survey 
SET deleted_at = NULL 
WHERE id = 456;

-- F. Restore Sesi Observasi SEL berdasarkan ID
UPDATE sel_sesi_observasi 
SET deleted_at = NULL 
WHERE id = 789;

-- G. Restore Pertanyaan Survey berdasarkan ID
UPDATE pertanyaan_survey 
SET deleted_at = NULL 
WHERE id = 10;
