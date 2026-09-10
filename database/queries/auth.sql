-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTHENTICATION & SESSION QUERIES
-- Digunakan oleh: Login page, middleware auth, session management
-- @tables_used: users, user_preferences, activity_log
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Login: cari user by Email atau NPSN Sekolah ───

SELECT
  u.id, u.nama, u.email, u.password_hash,
  u.role, u.sekolah_id, u.kabupaten_id, u.kecamatan_id,
  u.jabatan, u.instansi, u.is_active,
  sp.nama AS sekolah_nama,
  sp.npsn AS sekolah_npsn,
  kb.nama AS kabupaten_nama,
  k.nama AS kecamatan_nama
FROM users u
LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
LEFT JOIN kecamatan k ON u.kecamatan_id = k.id
WHERE (u.email = :identifier OR sp.npsn = :identifier) AND u.is_active = TRUE;


-- ─── Update last_login timestamp ───

UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = :user_id;


-- ─── Log login activity ───

INSERT INTO activity_log (user_id, aksi, detail, ip_address)
VALUES (:user_id, 'login', JSON_OBJECT('email', :email, 'user_agent', :user_agent), :ip_address);


-- ─── Log logout activity ───

INSERT INTO activity_log (user_id, aksi, ip_address)
VALUES (:user_id, 'logout', :ip_address);


-- ─── Get user profile with preferences ───

SELECT
  u.id, u.nama, u.email, u.phone, u.role,
  u.jabatan, u.instansi, u.last_login,
  u.created_at, u.updated_at,
  up.bahasa, up.tema, up.auto_save_interval,
  up.notif_weekly_report, up.notif_instant_alert,
  up.notif_reminder_email, up.notif_system_update,
  sp.nama AS sekolah_nama, sp.npsn,
  kb.nama AS kabupaten_nama
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
WHERE u.id = :user_id;


-- ─── Change password ───

UPDATE users SET password_hash = :new_hash, updated_at = CURRENT_TIMESTAMP
WHERE id = :user_id;


-- ─── Register new user (admin creates) ───

INSERT INTO users (nama, email, password_hash, phone, role, sekolah_id, kabupaten_id, kecamatan_id, jabatan, instansi)
VALUES (:nama, :email, :password_hash, :phone, :role, :sekolah_id, :kabupaten_id, :kecamatan_id, :jabatan, :instansi);

-- Auto-create preferences for new user
INSERT INTO user_preferences (user_id) VALUES (LAST_INSERT_ID());
