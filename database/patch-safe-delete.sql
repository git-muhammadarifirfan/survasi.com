-- ═══════════════════════════════════════════════════════════════════════════════
-- BSAN JAWA TIMUR — SAFE DELETE PATCH
-- ═══════════════════════════════════════════════════════════════════════════════
-- Patch ini menambahkan sistem "Safe Delete" ke database:
--   1. Tabel archive (_archive) untuk menyimpan backup data sebelum dihapus
--   2. BEFORE DELETE trigger yang otomatis copy data ke archive
--   3. Query helper untuk restore data dari archive
--
-- Dengan patch ini, BAHKAN JIKA seseorang menjalankan:
--   DELETE FROM responden_survey;
--   DELETE FROM users;
--   DELETE FROM jawaban_survey;
--   DELETE FROM satuan_pendidikan;
--   DELETE FROM sel_sesi_observasi;
--
-- Data tetap tersimpan di tabel _archive dan bisa di-restore!
--
-- @usage
--   mysql -u root -p db_survasi < database/patch-safe-delete.sql
--
-- @created  2026-09-16
-- ═══════════════════════════════════════════════════════════════════════════════

-- NOTE: Jalankan query ini di database db_survasi yang sudah dipilih di phpMyAdmin
-- (Tidak perlu USE db_survasi karena hosting tidak support)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ARCHIVE TABLE: responden_survey_archive
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS responden_survey_archive (
  archive_id          BIGINT AUTO_INCREMENT PRIMARY KEY
                      COMMENT 'ID unik di tabel archive',
  archived_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                      COMMENT 'Kapan data ini diarsipkan (dihapus dari tabel asli)',
  deleted_by_query    VARCHAR(200) DEFAULT 'MANUAL DELETE'
                      COMMENT 'Keterangan sumber penghapusan',

  -- Kolom asli dari responden_survey (salinan persis)
  original_id         INT NOT NULL COMMENT 'ID asli di responden_survey',
  nama                VARCHAR(200),
  jenis_kelamin       ENUM('L','P'),
  posisi              VARCHAR(100),
  sekolah_id          INT,
  npsn                VARCHAR(20),
  kabupaten_id        INT,
  kecamatan_id        INT,
  penerima_modul      ENUM('Ya','Tidak'),
  penyelenggara_pelatihan TEXT,
  status_implementasi ENUM('sudah','sebagian','belum'),
  kelas_mengajar      VARCHAR(50),
  no_wa               VARCHAR(20),
  submitted_at        TIMESTAMP NULL,
  created_at          TIMESTAMP NULL,
  deleted_at          TIMESTAMP NULL,

  INDEX idx_archive_resp_original (original_id),
  INDEX idx_archive_resp_npsn (npsn),
  INDEX idx_archive_resp_date (archived_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Archive/backup otomatis data responden yang dihapus — JANGAN hapus tabel ini!';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ARCHIVE TABLE: users_archive
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users_archive (
  archive_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
  archived_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_by_query VARCHAR(200) DEFAULT 'MANUAL DELETE',

  original_id     INT NOT NULL COMMENT 'ID asli di users',
  nama            VARCHAR(150),
  email           VARCHAR(150),
  password_hash   VARCHAR(255),
  phone           VARCHAR(20),
  role            VARCHAR(20),
  sekolah_id      INT,
  kabupaten_id    INT,
  kecamatan_id    INT,
  jabatan         VARCHAR(200),
  instansi        VARCHAR(300),
  is_active       TINYINT(1),
  last_login      TIMESTAMP NULL,
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL,
  deleted_at      TIMESTAMP NULL,

  INDEX idx_archive_user_original (original_id),
  INDEX idx_archive_user_email (email),
  INDEX idx_archive_user_date (archived_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Archive/backup otomatis data users yang dihapus';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ARCHIVE TABLE: jawaban_survey_archive
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jawaban_survey_archive (
  archive_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  archived_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_by_query    VARCHAR(200) DEFAULT 'MANUAL DELETE',

  original_id         BIGINT NOT NULL COMMENT 'ID asli di jawaban_survey',
  responden_id        INT,
  pertanyaan_id       INT,
  jawaban_terstruktur TEXT,
  jawaban_bebas       TEXT,
  jawaban_multi       JSON,
  created_at          TIMESTAMP NULL,

  INDEX idx_archive_jawaban_original (original_id),
  INDEX idx_archive_jawaban_responden (responden_id),
  INDEX idx_archive_jawaban_date (archived_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Archive/backup otomatis data jawaban survey yang dihapus';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ARCHIVE TABLE: satuan_pendidikan_archive
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS satuan_pendidikan_archive (
  archive_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  archived_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_by_query VARCHAR(200) DEFAULT 'MANUAL DELETE',

  original_id      INT NOT NULL COMMENT 'ID asli di satuan_pendidikan',
  npsn             VARCHAR(20),
  nama             VARCHAR(200),
  kecamatan_id     INT,
  jenjang          VARCHAR(10),
  status_sekolah   VARCHAR(10),
  akreditasi       VARCHAR(5),
  alamat           TEXT,
  email            VARCHAR(100),
  telepon          VARCHAR(20),
  total_guru       INT,
  total_siswa      INT,
  latitude         DECIMAL(10,7),
  longitude        DECIMAL(10,7),
  status_pengisian VARCHAR(10),
  last_updated     TIMESTAMP NULL,
  created_at       TIMESTAMP NULL,
  deleted_at       TIMESTAMP NULL,

  INDEX idx_archive_sp_original (original_id),
  INDEX idx_archive_sp_npsn (npsn),
  INDEX idx_archive_sp_date (archived_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Archive/backup otomatis data sekolah yang dihapus';


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ARCHIVE TABLE: sel_sesi_observasi_archive
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sel_sesi_observasi_archive (
  archive_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  archived_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_by_query    VARCHAR(200) DEFAULT 'MANUAL DELETE',

  original_id         INT NOT NULL COMMENT 'ID asli di sel_sesi_observasi',
  sekolah_id          INT,
  observer_user_id    INT,
  observer_nama       VARCHAR(150),
  tanggal             DATE,
  lokasi_diamati      JSON,
  waktu_pengamatan    JSON,
  jumlah_siswa_l      INT,
  jumlah_siswa_p      INT,
  siswa_disabilitas_l INT,
  siswa_disabilitas_p INT,
  jangkauan_siswa     TINYINT,
  kelas_diamati       VARCHAR(20),
  guru_inisial        VARCHAR(10),
  guru_jk             ENUM('L','P'),
  mata_pelajaran      VARCHAR(50),
  status              VARCHAR(20),
  reviewed_by         INT,
  submitted_at        TIMESTAMP NULL,
  created_at          TIMESTAMP NULL,
  updated_at          TIMESTAMP NULL,
  deleted_at          TIMESTAMP NULL,

  INDEX idx_archive_sel_original (original_id),
  INDEX idx_archive_sel_date (archived_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Archive/backup otomatis data sesi observasi SEL yang dihapus';


-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS: BEFORE DELETE → Auto-copy ke archive
-- ═══════════════════════════════════════════════════════════════════════════════

DELIMITER $$

-- ─── Trigger: responden_survey ───────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_before_delete_responden$$
CREATE TRIGGER trg_before_delete_responden
BEFORE DELETE ON responden_survey
FOR EACH ROW
BEGIN
  INSERT INTO responden_survey_archive (
    original_id, nama, jenis_kelamin, posisi, sekolah_id, npsn,
    kabupaten_id, kecamatan_id, penerima_modul, penyelenggara_pelatihan,
    status_implementasi, kelas_mengajar, no_wa, submitted_at,
    created_at, deleted_at
  ) VALUES (
    OLD.id, OLD.nama, OLD.jenis_kelamin, OLD.posisi, OLD.sekolah_id, OLD.npsn,
    OLD.kabupaten_id, OLD.kecamatan_id, OLD.penerima_modul, OLD.penyelenggara_pelatihan,
    OLD.status_implementasi, OLD.kelas_mengajar, OLD.no_wa, OLD.submitted_at,
    OLD.created_at, OLD.deleted_at
  );
END$$

-- ─── Trigger: users ─────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_before_delete_users$$
CREATE TRIGGER trg_before_delete_users
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
  INSERT INTO users_archive (
    original_id, nama, email, password_hash, phone, role,
    sekolah_id, kabupaten_id, kecamatan_id, jabatan, instansi,
    is_active, last_login, created_at, updated_at, deleted_at
  ) VALUES (
    OLD.id, OLD.nama, OLD.email, OLD.password_hash, OLD.phone, OLD.role,
    OLD.sekolah_id, OLD.kabupaten_id, OLD.kecamatan_id, OLD.jabatan, OLD.instansi,
    OLD.is_active, OLD.last_login, OLD.created_at, OLD.updated_at, OLD.deleted_at
  );
END$$

-- ─── Trigger: jawaban_survey ────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_before_delete_jawaban$$
CREATE TRIGGER trg_before_delete_jawaban
BEFORE DELETE ON jawaban_survey
FOR EACH ROW
BEGIN
  INSERT INTO jawaban_survey_archive (
    original_id, responden_id, pertanyaan_id,
    jawaban_terstruktur, jawaban_bebas, jawaban_multi, created_at
  ) VALUES (
    OLD.id, OLD.responden_id, OLD.pertanyaan_id,
    OLD.jawaban_terstruktur, OLD.jawaban_bebas, OLD.jawaban_multi, OLD.created_at
  );
END$$

-- ─── Trigger: satuan_pendidikan ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_before_delete_sekolah$$
CREATE TRIGGER trg_before_delete_sekolah
BEFORE DELETE ON satuan_pendidikan
FOR EACH ROW
BEGIN
  INSERT INTO satuan_pendidikan_archive (
    original_id, npsn, nama, kecamatan_id, jenjang, status_sekolah,
    akreditasi, alamat, email, telepon, total_guru, total_siswa,
    latitude, longitude, status_pengisian, last_updated, created_at, deleted_at
  ) VALUES (
    OLD.id, OLD.npsn, OLD.nama, OLD.kecamatan_id, OLD.jenjang, OLD.status_sekolah,
    OLD.akreditasi, OLD.alamat, OLD.email, OLD.telepon, OLD.total_guru, OLD.total_siswa,
    OLD.latitude, OLD.longitude, OLD.status_pengisian, OLD.last_updated, OLD.created_at, OLD.deleted_at
  );
END$$

-- ─── Trigger: sel_sesi_observasi ────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_before_delete_sel_sesi$$
CREATE TRIGGER trg_before_delete_sel_sesi
BEFORE DELETE ON sel_sesi_observasi
FOR EACH ROW
BEGIN
  INSERT INTO sel_sesi_observasi_archive (
    original_id, sekolah_id, observer_user_id, observer_nama, tanggal,
    lokasi_diamati, waktu_pengamatan, jumlah_siswa_l, jumlah_siswa_p,
    siswa_disabilitas_l, siswa_disabilitas_p, jangkauan_siswa,
    kelas_diamati, guru_inisial, guru_jk, mata_pelajaran,
    status, reviewed_by, submitted_at, created_at, updated_at, deleted_at
  ) VALUES (
    OLD.id, OLD.sekolah_id, OLD.observer_user_id, OLD.observer_nama, OLD.tanggal,
    OLD.lokasi_diamati, OLD.waktu_pengamatan, OLD.jumlah_siswa_l, OLD.jumlah_siswa_p,
    OLD.siswa_disabilitas_l, OLD.siswa_disabilitas_p, OLD.jangkauan_siswa,
    OLD.kelas_diamati, OLD.guru_inisial, OLD.guru_jk, OLD.mata_pelajaran,
    OLD.status, OLD.reviewed_by, OLD.submitted_at, OLD.created_at, OLD.updated_at, OLD.deleted_at
  );
END$$

DELIMITER ;


-- ═══════════════════════════════════════════════════════════════════════════════
-- QUERY HELPER: RESTORE DATA DARI ARCHIVE
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── A. Cek data yang ada di archive ────────────────────────────────────────
-- SELECT * FROM responden_survey_archive ORDER BY archived_at DESC;
-- SELECT * FROM users_archive ORDER BY archived_at DESC;
-- SELECT * FROM jawaban_survey_archive ORDER BY archived_at DESC;
-- SELECT * FROM satuan_pendidikan_archive ORDER BY archived_at DESC;
-- SELECT * FROM sel_sesi_observasi_archive ORDER BY archived_at DESC;

-- ─── B. Restore SEMUA responden dari archive ────────────────────────────────
-- INSERT INTO responden_survey (id, nama, jenis_kelamin, posisi, sekolah_id, npsn,
--   kabupaten_id, kecamatan_id, penerima_modul, penyelenggara_pelatihan,
--   status_implementasi, kelas_mengajar, no_wa, submitted_at, created_at, deleted_at)
-- SELECT original_id, nama, jenis_kelamin, posisi, sekolah_id, npsn,
--   kabupaten_id, kecamatan_id, penerima_modul, penyelenggara_pelatihan,
--   status_implementasi, kelas_mengajar, no_wa, submitted_at, created_at, deleted_at
-- FROM responden_survey_archive
-- WHERE archived_at >= '2026-09-16 00:00:00';  -- Ganti tanggal sesuai kebutuhan

-- ─── C. Restore SEMUA users dari archive ────────────────────────────────────
-- INSERT INTO users (id, nama, email, password_hash, phone, role,
--   sekolah_id, kabupaten_id, kecamatan_id, jabatan, instansi,
--   is_active, last_login, created_at, updated_at, deleted_at)
-- SELECT original_id, nama, email, password_hash, phone, role,
--   sekolah_id, kabupaten_id, kecamatan_id, jabatan, instansi,
--   is_active, last_login, created_at, updated_at, deleted_at
-- FROM users_archive
-- WHERE archived_at >= '2026-09-16 00:00:00';

-- ─── D. Restore jawaban survey dari archive ─────────────────────────────────
-- INSERT INTO jawaban_survey (id, responden_id, pertanyaan_id,
--   jawaban_terstruktur, jawaban_bebas, jawaban_multi, created_at)
-- SELECT original_id, responden_id, pertanyaan_id,
--   jawaban_terstruktur, jawaban_bebas, jawaban_multi, created_at
-- FROM jawaban_survey_archive
-- WHERE archived_at >= '2026-09-16 00:00:00';

-- ═══════════════════════════════════════════════════════════════════════════════
-- SELESAI! Sekarang setiap DELETE otomatis di-backup ke tabel _archive.
-- Data bisa di-restore kapan saja dari tabel archive.
-- ═══════════════════════════════════════════════════════════════════════════════
