-- ══════════════════════════════════════════════════════════════════
-- PATCH DATABASE — SURVASI.COM
-- ══════════════════════════════════════════════════════════════════
-- Jalankan query ini di phpMyAdmin / MySQL CLI di database PRODUCTION
-- CATATAN: Semua query ini AMAN dijalankan berulang kali (idempotent)
--          Server juga otomatis jalankan saat startup via auto-patch
-- ══════════════════════════════════════════════════════════════════


-- ─── 1. Tambah kolom target_observasi di tabel satuan_pendidikan ────────
-- Fungsi: Admin bisa set berapa kali observasi SEL per sekolah
ALTER TABLE satuan_pendidikan
ADD COLUMN target_observasi INT NOT NULL DEFAULT 2
COMMENT 'Target jumlah sesi observasi SEL per sekolah';
-- Kalau error "Duplicate column name" = sudah ada, AMAN diabaikan


-- ─── 2. Buat tabel app_settings untuk global admin settings ────────────
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Global application settings (admin configurable)';

-- Seed default value
INSERT IGNORE INTO app_settings (setting_key, setting_value)
VALUES ('default_target_observasi', '2');


-- ─── 3. Tambah kolom deleted_at (soft delete) di tabel-tabel utama ─────
-- Fungsi: Data tidak benar-benar dihapus, hanya di-mark deleted
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE satuan_pendidikan ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE responden_survey ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE sel_sesi_observasi ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE sel_indikator ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE pertanyaan_survey ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE suara_responden ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE tantangan_implementasi ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
-- Kalau error "Duplicate column name" = sudah ada, AMAN diabaikan


-- ─── 4. Tambah kolom jumlah_siswa_sebagian_kecil di sel_sesi_observasi ──
ALTER TABLE sel_sesi_observasi
ADD COLUMN jumlah_siswa_sebagian_kecil INT DEFAULT NULL
COMMENT 'Jumlah siswa sebagian kecil (jika jangkauan=4)';
-- Kalau error "Duplicate column name" = sudah ada, AMAN diabaikan


-- ─── 5. Update tipe pertanyaan Q4 jadi school_select ────────────────────
ALTER TABLE pertanyaan_survey
MODIFY COLUMN tipe VARCHAR(50) NOT NULL DEFAULT 'text';

UPDATE pertanyaan_survey
SET tipe = 'school_select'
WHERE kode_pertanyaan = 'Q4' OR LOWER(teks_pertanyaan) LIKE '%asal sekolah%';


-- ══════════════════════════════════════════════════════════════════
-- SELESAI! Semua patch sudah diterapkan.
-- ══════════════════════════════════════════════════════════════════
