-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED AKUN PENGAWAS BERBASIS NPSN
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- @description
--   Script untuk membuat akun pengawas berdasarkan data sekolah (satuan_pendidikan).
--   Setiap sekolah mendapatkan 1 akun pengawas dengan:
--     - Login    : NPSN sekolah (mis. 20512345)
--     - Email    : npsn@survasi.com (mis. 20512345@survasi.com)
--     - Password : kata_pertama_nama_sekolah_lowercase + 4_digit_terakhir_npsn
--                  Contoh: "SDN Candi 1" / NPSN 20512345 → password: sdn2345
--
-- @prerequisite
--   - schema.sql sudah dijalankan
--   - seed.sql sudah dijalankan (data wilayah & sekolah sudah ada)
--   - import-sekolah.sql sudah dijalankan (data sekolah sudah terisi)
--
-- @usage
--   mysql -u root -p db_survasi < database/seed-pengawas.sql
--
-- @password_formula
--   password = LOWER(SUBSTRING_INDEX(nama_sekolah, ' ', 1)) + RIGHT(npsn, 4)
--   Contoh  : "SDN Waru 2" / NPSN 20510002 → 'sdn0002'
--             "MI Al-Hidayah" / NPSN 60712100 → 'mi2100'
--             "SMP Negeri 1 Sidoarjo" / NPSN 20502100 → 'smp2100'
--
-- @note
--   Password diisi SEBAGAI PLAIN TEXT dalam comment — bcrypt hash digenerate
--   via stored procedure di bawah ATAU via Node.js generate script.
--   Gunakan generate-pengawas-accounts.js untuk generate hash sesungguhnya.
-- ═══════════════════════════════════════════════════════════════════════════════

USE db_survasi;

-- ─────────────────────────────────────────────────────────────────────────────
-- CATATAN PENTING:
-- File ini berisi template SQL — hash bcrypt harus digenerate via script Node.js.
-- Jalankan: node database/generate-pengawas-accounts.js
-- Script tersebut akan:
--   1. Baca semua sekolah dari tabel satuan_pendidikan
--   2. Hitung password per formula
--   3. Hash bcrypt (rounds=12)
--   4. INSERT ke tabel users + user_preferences
-- ─────────────────────────────────────────────────────────────────────────────

-- Contoh manual insert satu sekolah (jika tidak pakai script):
-- INSERT INTO users (nama, email, password_hash, role, sekolah_id, jabatan, instansi, is_active)
-- VALUES (
--   'Kepala Sekolah SDN Candi 1',        -- nama
--   '20512345@survasi.com',              -- email (NPSN@survasi.com)
--   '$2b$12$HASH_BCRYPT_DI_SINI',        -- bcrypt hash dari 'sdn2345'
--   'pengawas',
--   42,                                  -- sekolah_id (id di tabel satuan_pendidikan)
--   'Kepala Sekolah / Pengawas',
--   'SDN Candi 1 Sidoarjo',
--   TRUE
-- );
-- INSERT INTO user_preferences (user_id) VALUES (LAST_INSERT_ID());

-- Verifikasi setelah import:
SELECT 
  COUNT(*) AS total_akun_pengawas,
  SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admin_count,
  SUM(CASE WHEN role = 'pengawas' THEN 1 ELSE 0 END) AS pengawas_count
FROM users;
