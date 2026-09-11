-- ═══════════════════════════════════════════════════════════════════════════════
-- BSAN JAWA TIMUR — MONITORING SYSTEM
-- Database Schema for MySQL 8.0+
--
-- @description
--   Schema lengkap untuk sistem Survey & Monitoring BSAN Jawa Timur.
--   Mencakup 20 tabel yang mendukung seluruh fitur:
--   Login, Dashboard, Peta, Kuisioner, Data Responden, Data Satuan Pendidikan,
--   Modul BSAN, Proporsi Modul, Gap Funnel, Matriks Kuadran,
--   Tantangan Implementasi, Suara Responden, Observasi SEL, Analisis SEL,
--   Kelola Form SEL, Laporan & Ekspor, dan Setting.
--
-- @version   1.0.0
-- @created   2026-09-09
-- @author    BSAN Jatim Development Team
--
-- @usage
--   mysql -u root -p < database/schema.sql
--
-- @notes
--   - Gunakan MySQL 8.0+ untuk mendukung JSON columns dan CHECK constraints
--   - Character set: utf8mb4 (mendukung emoji & aksara non-latin)
--   - Collation: utf8mb4_unicode_ci (case-insensitive unicode sorting)
--   - Engine: InnoDB (mendukung transactions & foreign keys)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- DATABASE CREATION
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS db_survasi
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_survasi;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: WILAYAH HIERARCHY
-- Tabel hierarki administratif: Provinsi → Kabupaten/Kota → Kecamatan
-- Digunakan oleh: Semua halaman (filter global), Peta Kecamatan
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS provinsi (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nama        VARCHAR(100) NOT NULL COMMENT 'Nama provinsi lengkap',
  kode_bps    VARCHAR(10) UNIQUE COMMENT 'Kode BPS provinsi (2 digit)',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_provinsi_nama (nama)
) ENGINE=InnoDB
  COMMENT='Master data provinsi — saat ini hanya Jawa Timur';


CREATE TABLE IF NOT EXISTS kabupaten (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  provinsi_id INT NOT NULL COMMENT 'FK ke provinsi.id',
  nama        VARCHAR(100) NOT NULL COMMENT 'Nama kabupaten/kota lengkap (e.g. Kab. Sidoarjo)',
  kode_bps    VARCHAR(10) UNIQUE COMMENT 'Kode BPS kabupaten (4 digit)',
  tipe        ENUM('kabupaten', 'kota') NOT NULL DEFAULT 'kabupaten'
              COMMENT 'Tipe wilayah: kabupaten atau kota',
  warna_chart VARCHAR(7) DEFAULT '#4A57C4'
              COMMENT 'Hex color untuk identitas di chart/diagram',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_kab_provinsi (provinsi_id),
  INDEX idx_kab_nama (nama),
  CONSTRAINT fk_kab_provinsi
    FOREIGN KEY (provinsi_id) REFERENCES provinsi(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Master data kabupaten/kota di bawah provinsi';


CREATE TABLE IF NOT EXISTS kecamatan (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  kabupaten_id INT NOT NULL COMMENT 'FK ke kabupaten.id',
  nama         VARCHAR(100) NOT NULL COMMENT 'Nama kecamatan (tanpa prefix Kec.)',
  kode_bps     VARCHAR(10) UNIQUE COMMENT 'Kode BPS kecamatan (6 digit)',
  geojson_path TEXT COMMENT 'Path ke file GeoJSON batas wilayah kecamatan',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_kec_kabupaten (kabupaten_id),
  INDEX idx_kec_nama (nama),
  CONSTRAINT fk_kec_kabupaten
    FOREIGN KEY (kabupaten_id) REFERENCES kabupaten(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Master data kecamatan — digunakan untuk Peta Kecamatan dan filter global';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: SATUAN PENDIDIKAN (MASTER DATA SEKOLAH)
-- Digunakan oleh: Data Satuan Pendidikan, Dashboard KPI, Peta Kecamatan,
--                 Data Responden, Gap Funnel, Matriks Kuadran
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS satuan_pendidikan (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  npsn             VARCHAR(20) UNIQUE NOT NULL
                   COMMENT 'Nomor Pokok Sekolah Nasional — identifier unik nasional',
  nama             VARCHAR(200) NOT NULL COMMENT 'Nama resmi satuan pendidikan',
  kecamatan_id     INT NOT NULL COMMENT 'FK ke kecamatan.id',
  jenjang          ENUM('SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA') NOT NULL DEFAULT 'SD'
                   COMMENT 'Jenjang pendidikan',
  status_sekolah   ENUM('Negeri', 'Swasta') NOT NULL DEFAULT 'Negeri'
                   COMMENT 'Status kepemilikan sekolah',
  akreditasi       VARCHAR(5) DEFAULT NULL
                   COMMENT 'Nilai akreditasi: A, B, C, atau Belum Terakreditasi',
  alamat           TEXT COMMENT 'Alamat lengkap sekolah',
  email            VARCHAR(100) COMMENT 'Email resmi sekolah',
  telepon          VARCHAR(20) COMMENT 'Nomor telepon sekolah',
  total_guru       INT DEFAULT 0 COMMENT 'Jumlah total guru aktif',
  total_siswa      INT DEFAULT 0 COMMENT 'Jumlah total siswa aktif',
  latitude         DECIMAL(10, 7) COMMENT 'Koordinat GPS latitude',
  longitude        DECIMAL(10, 7) COMMENT 'Koordinat GPS longitude',
  status_pengisian ENUM('belum', 'sebagian', 'sudah') NOT NULL DEFAULT 'belum'
                   COMMENT 'Status pengisian survei BSAN: belum/sebagian/sudah',
  last_updated     TIMESTAMP NULL DEFAULT NULL
                   COMMENT 'Terakhir kali status pengisian diperbarui',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_sp_kecamatan (kecamatan_id),
  INDEX idx_sp_status (status_pengisian),
  INDEX idx_sp_jenjang (jenjang),
  INDEX idx_sp_nama (nama),
  FULLTEXT idx_sp_search (nama, npsn)
    COMMENT 'Full-text search untuk pencarian cepat sekolah by nama/NPSN',
  CONSTRAINT fk_sp_kecamatan
    FOREIGN KEY (kecamatan_id) REFERENCES kecamatan(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Master data satuan pendidikan (sekolah) — inti dari seluruh sistem';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: USERS & AUTHENTICATION
-- Digunakan oleh: Login, Setting (Profil, Keamanan), Role-based access control
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nama          VARCHAR(150) NOT NULL COMMENT 'Nama lengkap pengguna',
  email         VARCHAR(150) UNIQUE NOT NULL COMMENT 'Email login — unik per user',
  password_hash VARCHAR(255) NOT NULL
                COMMENT 'Password di-hash dengan bcrypt (min 10 rounds)',
  phone         VARCHAR(20) COMMENT 'Nomor WhatsApp/telepon',
  role          ENUM(
                  'admin',     -- Akses CRUD seluruh data & analisis
                  'pengawas'   -- Pengawas Sekolah / penilik untuk input/adjust database
                ) NOT NULL DEFAULT 'pengawas'
                COMMENT 'Role menentukan akses menu & data (1: Admin CRUD & Analisa, 2: Pengawas Sekolah)',
  sekolah_id    INT DEFAULT NULL
                COMMENT 'FK ke satuan_pendidikan.id — hanya untuk role operator_sekolah',
  kabupaten_id  INT DEFAULT NULL
                COMMENT 'FK ke kabupaten.id — hanya untuk role admin_kabupaten',
  kecamatan_id  INT DEFAULT NULL
                COMMENT 'FK ke kecamatan.id — hanya untuk role admin_kecamatan',
  jabatan       VARCHAR(200) COMMENT 'Jabatan/posisi di instansi',
  instansi      VARCHAR(300) COMMENT 'Nama instansi/organisasi',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
                COMMENT 'FALSE = akun dinonaktifkan (soft delete)',
  last_login    TIMESTAMP NULL DEFAULT NULL
                COMMENT 'Timestamp login terakhir',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_role (role),
  INDEX idx_users_email (email),
  INDEX idx_users_sekolah (sekolah_id),
  INDEX idx_users_kabupaten (kabupaten_id),
  CONSTRAINT fk_users_sekolah
    FOREIGN KEY (sekolah_id) REFERENCES satuan_pendidikan(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_users_kabupaten
    FOREIGN KEY (kabupaten_id) REFERENCES kabupaten(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_users_kecamatan
    FOREIGN KEY (kecamatan_id) REFERENCES kecamatan(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Master data pengguna sistem dengan role-based access control (RBAC)';


CREATE TABLE IF NOT EXISTS user_preferences (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT UNIQUE NOT NULL COMMENT 'FK ke users.id — 1:1 relation',
  bahasa                ENUM('id', 'en') NOT NULL DEFAULT 'id'
                        COMMENT 'Bahasa pengantar dashboard',
  tema                  ENUM('light', 'dark') NOT NULL DEFAULT 'light'
                        COMMENT 'Tema tampilan dashboard',
  auto_save_interval    INT NOT NULL DEFAULT 30
                        COMMENT 'Interval auto-save draft dalam detik (10-120)',
  notif_weekly_report   BOOLEAN NOT NULL DEFAULT TRUE
                        COMMENT 'Kirim email rekapitulasi mingguan',
  notif_instant_alert   BOOLEAN NOT NULL DEFAULT TRUE
                        COMMENT 'Notifikasi instan saat sekolah selesai mengisi',
  notif_reminder_email  BOOLEAN NOT NULL DEFAULT FALSE
                        COMMENT 'Kirim reminder otomatis ke sekolah belum mengisi',
  notif_system_update   BOOLEAN NOT NULL DEFAULT TRUE
                        COMMENT 'Berita update fitur & aplikasi',
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_pref_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_auto_save
    CHECK (auto_save_interval >= 10 AND auto_save_interval <= 120)
) ENGINE=InnoDB
  COMMENT='Preferensi pengguna: bahasa, tema, notifikasi — halaman Setting';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: MODUL BSAN & ALUR TEMA
-- Digunakan oleh: Modul BSAN, Proporsi Modul, Kuisioner, Dashboard ring chart
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS modul_bsan (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  kode        VARCHAR(30) UNIQUE NOT NULL
              COMMENT 'Identifier: with_myself, with_others, with_challenges',
  nama        VARCHAR(100) NOT NULL
              COMMENT 'Nama modul Bahasa Indonesia',
  nama_en     VARCHAR(100)
              COMMENT 'Nama modul Bahasa Inggris',
  subtitle    VARCHAR(200)
              COMMENT 'Subtitle Bahasa Indonesia',
  subtitle_en VARCHAR(200)
              COMMENT 'Subtitle Bahasa Inggris',
  warna       VARCHAR(7) DEFAULT '#4A57C4'
              COMMENT 'Hex color untuk identitas modul di chart',
  ikon        VARCHAR(50) DEFAULT 'brain'
              COMMENT 'Nama ikon lucide-react',
  urutan      INT NOT NULL DEFAULT 0
              COMMENT 'Urutan tampil di UI (ascending)',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_modul_urutan (urutan)
) ENGINE=InnoDB
  COMMENT='Master data 3 modul BSAN (CASEL framework): With Myself, With Others, With Our Challenges';


CREATE TABLE IF NOT EXISTS alur_tema (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  modul_id      INT NOT NULL COMMENT 'FK ke modul_bsan.id',
  nama_alur     VARCHAR(100) NOT NULL
                COMMENT 'Nama alur: Alur 1, Alur 2, Alur 3',
  nama_tema     VARCHAR(200) NOT NULL
                COMMENT 'Nama tema: Tema 1: Tubuhku Istimewa, dst',
  target_kelas  ENUM('kelas_awal', 'kelas_tinggi', 'semua') NOT NULL DEFAULT 'semua'
                COMMENT 'Target kelas implementasi modul',
  urutan        INT NOT NULL DEFAULT 0
                COMMENT 'Urutan tema dalam alur',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_alur_modul (modul_id),
  INDEX idx_alur_target (target_kelas),
  CONSTRAINT fk_alur_modul
    FOREIGN KEY (modul_id) REFERENCES modul_bsan(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Alur dan tema pembelajaran per modul BSAN — digunakan di Kuisioner dan Proporsi Modul';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: SURVEY KUESIONER
-- Digunakan oleh: Kuisioner BSAN, Data Responden, Proporsi Modul,
--                 Gap Funnel, Matriks Kuadran, Suara Responden
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pertanyaan_survey (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  modul_id          INT DEFAULT NULL
                    COMMENT 'FK ke modul_bsan.id — NULL jika bukan pertanyaan modul spesifik',
  kode_pertanyaan   VARCHAR(20)
                    COMMENT 'Kode referensi: Q1, Q2, ... Q37 sesuai Google Form',
  teks_pertanyaan   TEXT NOT NULL
                    COMMENT 'Teks lengkap pertanyaan',
  tipe              ENUM('dropdown', 'checkbox', 'text', 'radio', 'scale') NOT NULL DEFAULT 'text'
                    COMMENT 'Jenis input jawaban',
  opsi_jawaban      JSON
                    COMMENT 'Array opsi jawaban untuk tipe pilihan, e.g. ["Ya","Tidak"]',
  urutan            INT NOT NULL DEFAULT 0
                    COMMENT 'Urutan tampil dalam form',
  is_required       BOOLEAN NOT NULL DEFAULT TRUE
                    COMMENT 'Apakah wajib diisi',
  skip_to_question  INT DEFAULT NULL
                    COMMENT 'ID pertanyaan tujuan skip logic (conditional branching)',
  section           VARCHAR(50) NOT NULL DEFAULT 'identitas'
                    COMMENT 'Kelompok: identitas, pelatihan, implementasi_awal, implementasi_tinggi, refleksi, kepsek, kontak',
  target_kelas      ENUM('semua', 'kelas_awal', 'kelas_tinggi', 'kepala_sekolah')
                    NOT NULL DEFAULT 'semua'
                    COMMENT 'Hanya ditampilkan untuk target kelas tertentu',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_pertanyaan_modul (modul_id),
  INDEX idx_pertanyaan_urutan (urutan),
  INDEX idx_pertanyaan_section (section),
  CONSTRAINT fk_pertanyaan_modul
    FOREIGN KEY (modul_id) REFERENCES modul_bsan(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Definisi pertanyaan survei BSAN — 37 pertanyaan sesuai Google Form Implementasi BSAN';


CREATE TABLE IF NOT EXISTS responden_survey (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  nama                    VARCHAR(200) NOT NULL
                          COMMENT 'Nama lengkap responden (huruf besar)',
  jenis_kelamin           ENUM('L', 'P') NOT NULL
                          COMMENT 'Laki-laki / Perempuan',
  posisi                  VARCHAR(100) NOT NULL
                          COMMENT 'Posisi: Kepala Sekolah, Guru kelas 1-6, Guru PJOK, dll',
  sekolah_id              INT NOT NULL
                          COMMENT 'FK ke satuan_pendidikan.id — asal sekolah',
  npsn                    VARCHAR(20)
                          COMMENT 'NPSN sekolah (redundan untuk quick-lookup)',
  kabupaten_id            INT NOT NULL
                          COMMENT 'FK ke kabupaten.id (denormalisasi untuk performa filter)',
  kecamatan_id            INT NOT NULL
                          COMMENT 'FK ke kecamatan.id (denormalisasi untuk performa filter)',
  penerima_modul          ENUM('Ya', 'Tidak') NOT NULL DEFAULT 'Tidak'
                          COMMENT 'Apakah sudah menerima materi modul BSAN',
  penyelenggara_pelatihan TEXT
                          COMMENT 'Siapa yang mengadakan pelatihan (multi, dipisah koma)',
  status_implementasi     ENUM('sudah', 'sebagian', 'belum') DEFAULT NULL
                          COMMENT 'Status implementasi modul BSAN — NULL jika belum menerima',
  kelas_mengajar          VARCHAR(50)
                          COMMENT 'Kelas Awal (1-3) / Kelas Tinggi (4-6) / Kepala Sekolah',
  no_wa                   VARCHAR(20)
                          COMMENT 'Nomor WhatsApp untuk kontak follow-up',
  submitted_at            TIMESTAMP NULL DEFAULT NULL
                          COMMENT 'Timestamp pengisian survei',
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_resp_sekolah (sekolah_id),
  INDEX idx_resp_kabupaten (kabupaten_id),
  INDEX idx_resp_kecamatan (kecamatan_id),
  INDEX idx_resp_penerima (penerima_modul),
  INDEX idx_resp_implementasi (status_implementasi),
  FULLTEXT idx_resp_search (nama, npsn)
    COMMENT 'Full-text search untuk pencarian responden',
  CONSTRAINT fk_resp_sekolah
    FOREIGN KEY (sekolah_id) REFERENCES satuan_pendidikan(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_resp_kabupaten
    FOREIGN KEY (kabupaten_id) REFERENCES kabupaten(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_resp_kecamatan
    FOREIGN KEY (kecamatan_id) REFERENCES kecamatan(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Data responden survei BSAN (guru & kepsek) — inti Data Responden dan analisis';


CREATE TABLE IF NOT EXISTS jawaban_survey (
  id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
  responden_id        INT NOT NULL
                      COMMENT 'FK ke responden_survey.id',
  pertanyaan_id       INT NOT NULL
                      COMMENT 'FK ke pertanyaan_survey.id',
  jawaban_terstruktur TEXT
                      COMMENT 'Jawaban pilihan tunggal (dropdown/radio)',
  jawaban_bebas       TEXT
                      COMMENT 'Jawaban teks bebas/narasi (refleksi, temuan, tantangan)',
  jawaban_multi       JSON
                      COMMENT 'Jawaban multi-select/checkbox, e.g. ["Video","LKPD","Poster"]',
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_jawaban_responden (responden_id),
  INDEX idx_jawaban_pertanyaan (pertanyaan_id),
  UNIQUE KEY uk_jawaban_resp_pert (responden_id, pertanyaan_id)
    COMMENT 'Satu responden hanya bisa menjawab satu pertanyaan sekali',
  CONSTRAINT fk_jawaban_responden
    FOREIGN KEY (responden_id) REFERENCES responden_survey(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_jawaban_pertanyaan
    FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survey(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Jawaban survei per responden per pertanyaan — data utama analisis';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: OBSERVASI SEL (Social Emotional Learning)
-- Digunakan oleh: Form Observasi SEL, Data Observasi SEL, Analisis SEL,
--                 Kelola Form SEL, Dashboard (supplement modul progress)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sel_dimensi (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  kode            VARCHAR(30) UNIQUE NOT NULL
                  COMMENT 'Identifier: kesadaran_diri, regulasi_emosi, kesadaran_sosial, keterampilan_relasi, tanggung_jawab',
  nama            VARCHAR(100) NOT NULL
                  COMMENT 'Nama dimensi SEL Bahasa Indonesia',
  modul_bsan_kode VARCHAR(30) NOT NULL
                  COMMENT 'Mapping ke modul_bsan.kode — menghubungkan dimensi SEL ke modul BSAN',
  general_skill_id VARCHAR(50)
                  COMMENT 'General skill CASEL: self_awareness, self_regulation, dll',
  urutan          INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_seldim_modul (modul_bsan_kode)
) ENGINE=InnoDB
  COMMENT='5 dimensi SEL yang diamati (CASEL framework) — mapping ke 3 modul BSAN';


CREATE TABLE IF NOT EXISTS sel_indikator (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  kode        VARCHAR(30) UNIQUE NOT NULL
              COMMENT 'Kode unik: guru_kd_kls_1, murid_re_lngk_2, dll',
  dimensi_id  INT NOT NULL
              COMMENT 'FK ke sel_dimensi.id',
  subjek      ENUM('guru', 'murid') NOT NULL
              COMMENT 'Subjek yang diamati: guru atau murid',
  konteks     ENUM('kelas', 'lingkungan') NOT NULL
              COMMENT 'Konteks pengamatan: di dalam kelas atau di lingkungan sekolah',
  teks        TEXT NOT NULL
              COMMENT 'Deskripsi lengkap indikator yang diamati',
  catatan     TEXT
              COMMENT 'Petunjuk tambahan untuk observer (opsional)',
  urutan      INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_selind_dimensi (dimensi_id),
  INDEX idx_selind_subjek (subjek),
  INDEX idx_selind_konteks (konteks),
  CONSTRAINT fk_selind_dimensi
    FOREIGN KEY (dimensi_id) REFERENCES sel_dimensi(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='55 indikator observasi SEL — Guru (26) + Murid (29) berdasarkan Instrumen BSAN-SEL';


CREATE TABLE IF NOT EXISTS sel_sesi_observasi (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  sekolah_id          INT NOT NULL
                      COMMENT 'FK ke satuan_pendidikan.id — sekolah yang diobservasi',
  observer_user_id    INT DEFAULT NULL
                      COMMENT 'FK ke users.id — observer yang melakukan pengamatan',
  observer_nama       VARCHAR(150)
                      COMMENT 'Nama/inisial observer (input manual jika bukan user terdaftar)',
  tanggal             DATE NOT NULL
                      COMMENT 'Tanggal pelaksanaan observasi',
  lokasi_diamati      JSON
                      COMMENT 'Array lokasi: ["Ruang kelas","Halaman","Kantin"]',
  waktu_pengamatan    JSON
                      COMMENT 'Array waktu: ["Istirahat","Sebelum masuk"]',
  jumlah_siswa_l      INT DEFAULT 0
                      COMMENT 'Jumlah siswa laki-laki di sekolah',
  jumlah_siswa_p      INT DEFAULT 0
                      COMMENT 'Jumlah siswa perempuan di sekolah',
  siswa_disabilitas_l INT DEFAULT 0
                      COMMENT 'Jumlah siswa disabilitas laki-laki',
  siswa_disabilitas_p INT DEFAULT 0
                      COMMENT 'Jumlah siswa disabilitas perempuan',
  jangkauan_siswa     TINYINT NOT NULL DEFAULT 2
                      COMMENT '1=seluruh siswa, 2=lebih separuh, 3=kurang separuh, 4=sebagian kecil',
  kelas_diamati       VARCHAR(20)
                      COMMENT 'Kelas yang diamati, e.g. 4A, 5B',
  guru_inisial        VARCHAR(10)
                      COMMENT 'Inisial guru yang mengajar saat observasi',
  guru_jk             ENUM('L', 'P')
                      COMMENT 'Jenis kelamin guru yang diamati',
  mata_pelajaran      VARCHAR(50)
                      COMMENT 'Mata pelajaran saat observasi (Tematik, Matematika, dll)',
  status              ENUM('draft', 'submitted', 'reviewed') NOT NULL DEFAULT 'draft'
                      COMMENT 'Status sesi: draft (belum selesai), submitted (sudah dikirim), reviewed (sudah direview admin)',
  reviewed_by         INT DEFAULT NULL
                      COMMENT 'FK ke users.id — admin yang mereview',
  submitted_at        TIMESTAMP NULL DEFAULT NULL
                      COMMENT 'Timestamp saat sesi dikirim (submit)',
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_selobs_sekolah (sekolah_id),
  INDEX idx_selobs_tanggal (tanggal),
  INDEX idx_selobs_status (status),
  INDEX idx_selobs_observer (observer_user_id),
  CONSTRAINT fk_selobs_sekolah
    FOREIGN KEY (sekolah_id) REFERENCES satuan_pendidikan(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_selobs_observer
    FOREIGN KEY (observer_user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_selobs_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_jangkauan
    CHECK (jangkauan_siswa >= 1 AND jangkauan_siswa <= 4)
) ENGINE=InnoDB
  COMMENT='Sesi observasi lapangan SEL per sekolah — Form Observasi SEL dan Kelola Form SEL';


CREATE TABLE IF NOT EXISTS sel_jawaban_observasi (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  sesi_id       INT NOT NULL
                COMMENT 'FK ke sel_sesi_observasi.id',
  indikator_id  INT NOT NULL
                COMMENT 'FK ke sel_indikator.id',
  skor          TINYINT DEFAULT NULL
                COMMENT 'Skor observasi: NULL=tidak bisa diamati, 1=Tidak Terlihat, 2=Kadang, 3=Sering, 4=Konsisten',
  catatan       TEXT
                COMMENT 'Catatan temuan observer untuk indikator ini',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_seljawab_sesi (sesi_id),
  INDEX idx_seljawab_indikator (indikator_id),
  UNIQUE KEY uk_seljawab (sesi_id, indikator_id)
    COMMENT 'Satu sesi hanya menilai satu indikator sekali',
  CONSTRAINT fk_seljawab_sesi
    FOREIGN KEY (sesi_id) REFERENCES sel_sesi_observasi(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_seljawab_indikator
    FOREIGN KEY (indikator_id) REFERENCES sel_indikator(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_skor
    CHECK (skor IS NULL OR (skor >= 1 AND skor <= 4))
) ENGINE=InnoDB
  COMMENT='Jawaban/skor per indikator per sesi observasi SEL — data utama Analisis SEL';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: TANTANGAN & SUARA RESPONDEN
-- Digunakan oleh: Tantangan Implementasi, Suara Responden
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tantangan_implementasi (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  sekolah_id    INT NOT NULL
                COMMENT 'FK ke satuan_pendidikan.id',
  responden_id  INT DEFAULT NULL
                COMMENT 'FK ke responden_survey.id — sumber data tantangan',
  kategori      VARCHAR(200) NOT NULL
                COMMENT 'Kategori kendala: Keterbatasan Perangkat Digital, Jaringan Internet, dll',
  deskripsi     TEXT
                COMMENT 'Deskripsi detail tantangan',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_tantangan_sekolah (sekolah_id),
  INDEX idx_tantangan_kategori (kategori),
  CONSTRAINT fk_tantangan_sekolah
    FOREIGN KEY (sekolah_id) REFERENCES satuan_pendidikan(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_tantangan_responden
    FOREIGN KEY (responden_id) REFERENCES responden_survey(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Data kendala/tantangan implementasi BSAN yang dilaporkan sekolah';


CREATE TABLE IF NOT EXISTS suara_responden (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  sekolah_id    INT NOT NULL
                COMMENT 'FK ke satuan_pendidikan.id',
  responden_id  INT DEFAULT NULL
                COMMENT 'FK ke responden_survey.id (opsional)',
  modul_id      INT DEFAULT NULL
                COMMENT 'FK ke modul_bsan.id — modul yang dikomentari',
  komentar      TEXT NOT NULL
                COMMENT 'Isi narasi/komentar/suara dari responden',
  sentimen      ENUM('positif', 'negatif', 'netral') NOT NULL DEFAULT 'netral'
                COMMENT 'Klasifikasi sentimen komentar',
  tanggal       DATE
                COMMENT 'Tanggal komentar ditulis',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_suara_sekolah (sekolah_id),
  INDEX idx_suara_sentimen (sentimen),
  INDEX idx_suara_modul (modul_id),
  CONSTRAINT fk_suara_sekolah
    FOREIGN KEY (sekolah_id) REFERENCES satuan_pendidikan(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_suara_responden
    FOREIGN KEY (responden_id) REFERENCES responden_survey(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_suara_modul
    FOREIGN KEY (modul_id) REFERENCES modul_bsan(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Komentar narasi dan suara responden — halaman Suara Responden (Fase 2: + word cloud)';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: SISTEM — NOTIFIKASI, AUDIT LOG, LAPORAN EXPORT
-- Digunakan oleh: Topbar (notifikasi), Setting, Laporan & Ekspor
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifikasi (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL
              COMMENT 'FK ke users.id — penerima notifikasi',
  judul       VARCHAR(200) NOT NULL
              COMMENT 'Judul singkat notifikasi',
  pesan       TEXT
              COMMENT 'Isi pesan detail notifikasi',
  tipe        ENUM('reminder', 'report', 'system', 'alert') NOT NULL DEFAULT 'system'
              COMMENT 'Jenis notifikasi untuk filtering & icon',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE
              COMMENT 'Status sudah dibaca atau belum',
  read_at     TIMESTAMP NULL DEFAULT NULL
              COMMENT 'Timestamp dibaca',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (user_id, is_read)
    COMMENT 'Composite index untuk query notif belum dibaca per user',
  INDEX idx_notif_tipe (tipe),
  CONSTRAINT fk_notif_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Notifikasi in-app untuk setiap user — ditampilkan di Topbar bell icon';


CREATE TABLE IF NOT EXISTS activity_log (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT DEFAULT NULL
                COMMENT 'FK ke users.id — NULL jika aksi sistem otomatis',
  aksi          VARCHAR(50) NOT NULL
                COMMENT 'Jenis aksi: login, logout, create, update, delete, export, import, reminder_sent',
  target_tabel  VARCHAR(50)
                COMMENT 'Nama tabel yang dimodifikasi (e.g. satuan_pendidikan, responden_survey)',
  target_id     INT DEFAULT NULL
                COMMENT 'ID record yang dimodifikasi',
  detail        JSON
                COMMENT 'Detail perubahan: { "field": "status", "old": "belum", "new": "sudah" }',
  ip_address    VARCHAR(45)
                COMMENT 'IPv4/IPv6 address sumber aksi',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_log_user (user_id),
  INDEX idx_log_aksi (aksi),
  INDEX idx_log_created (created_at),
  INDEX idx_log_target (target_tabel, target_id),
  CONSTRAINT fk_log_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Audit trail semua aktivitas pengguna — untuk keamanan dan traceability';


CREATE TABLE IF NOT EXISTS laporan_export (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL
                COMMENT 'FK ke users.id — siapa yang membuat export',
  tipe_export   ENUM('pdf', 'excel', 'docx') NOT NULL
                COMMENT 'Format file output',
  nama_file     VARCHAR(255)
                COMMENT 'Nama file yang di-generate',
  path_file     VARCHAR(500)
                COMMENT 'Path/URL ke file yang sudah di-generate',
  filter_params JSON
                COMMENT 'Parameter filter saat generate: {"kabupaten": "Sidoarjo", "modul": "with_myself"}',
  status        ENUM('generating', 'completed', 'failed') NOT NULL DEFAULT 'generating'
                COMMENT 'Status proses generate file',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at  TIMESTAMP NULL DEFAULT NULL
                COMMENT 'Timestamp selesai generate',

  INDEX idx_export_user (user_id),
  INDEX idx_export_status (status),
  CONSTRAINT fk_export_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Riwayat laporan yang di-export — halaman Laporan & Ekspor';


-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- Auto-update status_pengisian di satuan_pendidikan saat responden mengisi
-- ─────────────────────────────────────────────────────────────────────────────

DELIMITER //

CREATE TRIGGER trg_after_responden_insert
AFTER INSERT ON responden_survey
FOR EACH ROW
BEGIN
  -- Update status pengisian sekolah berdasarkan responden terbaru
  UPDATE satuan_pendidikan
  SET
    status_pengisian = CASE
      WHEN NEW.status_implementasi = 'sudah' THEN 'sudah'
      WHEN NEW.penerima_modul = 'Ya' THEN 'sebagian'
      ELSE status_pengisian
    END,
    last_updated = CURRENT_TIMESTAMP
  WHERE id = NEW.sekolah_id
    AND (
      -- Hanya upgrade status, tidak downgrade
      (status_pengisian = 'belum') OR
      (status_pengisian = 'sebagian' AND NEW.status_implementasi = 'sudah')
    );
END //

DELIMITER ;


-- ─────────────────────────────────────────────────────────────────────────────
-- VIEWS — Precomputed views untuk performa query dashboard
-- ─────────────────────────────────────────────────────────────────────────────

-- View: Statistik per kecamatan (untuk Dashboard & Peta)
CREATE OR REPLACE VIEW v_kecamatan_stats AS
SELECT
  k.id AS kecamatan_id,
  k.nama AS kecamatan,
  kb.id AS kabupaten_id,
  kb.nama AS kabupaten,
  COUNT(sp.id) AS total_sekolah,
  SUM(CASE WHEN sp.status_pengisian = 'belum' THEN 1 ELSE 0 END) AS belum,
  SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian,
  SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) AS sudah,
  ROUND(
    SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) / COUNT(sp.id) * 100, 1
  ) AS response_rate
FROM kecamatan k
JOIN kabupaten kb ON k.kabupaten_id = kb.id
LEFT JOIN satuan_pendidikan sp ON sp.kecamatan_id = k.id
GROUP BY k.id, k.nama, kb.id, kb.nama;

-- View: Statistik per kabupaten (untuk Dashboard KPI)
CREATE OR REPLACE VIEW v_kabupaten_stats AS
SELECT
  kb.id AS kabupaten_id,
  kb.nama AS kabupaten,
  kb.warna_chart,
  COUNT(sp.id) AS total_sekolah,
  SUM(CASE WHEN sp.status_pengisian = 'belum' THEN 1 ELSE 0 END) AS belum,
  SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian,
  SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) AS sudah,
  ROUND(
    (SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) +
     SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 0.5 ELSE 0 END))
    / COUNT(sp.id) * 100, 1
  ) AS response_rate
FROM kabupaten kb
LEFT JOIN kecamatan k ON k.kabupaten_id = kb.id
LEFT JOIN satuan_pendidikan sp ON sp.kecamatan_id = k.id
GROUP BY kb.id, kb.nama, kb.warna_chart;

-- View: SEL score summary per sesi observasi
CREATE OR REPLACE VIEW v_sel_sesi_scores AS
SELECT
  sso.id AS sesi_id,
  sp.nama AS sekolah,
  k.nama AS kecamatan,
  kb.nama AS kabupaten,
  sso.tanggal,
  sso.status,
  ROUND(AVG(CASE WHEN si.subjek = 'guru' THEN sjo.skor END), 2) AS skor_guru,
  ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS skor_murid,
  ROUND(AVG(sjo.skor), 2) AS skor_total
FROM sel_sesi_observasi sso
JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
JOIN sel_indikator si ON sjo.indikator_id = si.id
JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
JOIN kecamatan k ON sp.kecamatan_id = k.id
JOIN kabupaten kb ON k.kabupaten_id = kb.id
WHERE sjo.skor IS NOT NULL
GROUP BY sso.id, sp.nama, k.nama, kb.nama, sso.tanggal, sso.status;


-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- Total: 20 tables, 3 views, 1 trigger
-- ═══════════════════════════════════════════════════════════════════════════════
