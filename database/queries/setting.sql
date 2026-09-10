-- ═══════════════════════════════════════════════════════════════════════════════
-- SETTING PAGE QUERIES
-- Digunakan oleh: halaman Setting (Profil, Notifikasi, Preferensi, Keamanan)
-- @tables_used: users, user_preferences, notifikasi, activity_log
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Update profil user ───

UPDATE users
SET nama = :nama, phone = :phone, jabatan = :jabatan, instansi = :instansi,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :user_id;


-- ─── Update preferensi ───

UPDATE user_preferences
SET bahasa = :bahasa, tema = :tema, auto_save_interval = :auto_save_interval,
    notif_weekly_report = :weekly, notif_instant_alert = :instant,
    notif_reminder_email = :reminder, notif_system_update = :system_update
WHERE user_id = :user_id;


-- ─── Get notifikasi (bell icon + halaman setting) ───

SELECT
  id, judul, pesan, tipe, is_read, created_at
FROM notifikasi
WHERE user_id = :user_id
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;


-- ─── Count unread notifications (badge count) ───

SELECT COUNT(*) AS unread FROM notifikasi
WHERE user_id = :user_id AND is_read = FALSE;


-- ─── Mark notification as read ───

UPDATE notifikasi SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
WHERE id = :notif_id AND user_id = :user_id;


-- ─── Mark all as read ───

UPDATE notifikasi SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
WHERE user_id = :user_id AND is_read = FALSE;


-- ─── Activity log (admin: lihat semua; user: lihat sendiri) ───

SELECT
  al.id, al.aksi, al.target_tabel, al.target_id,
  al.detail, al.ip_address, al.created_at,
  u.nama AS user_nama, u.role
FROM activity_log al
LEFT JOIN users u ON al.user_id = u.id
WHERE (:user_id IS NULL OR al.user_id = :user_id)
ORDER BY al.created_at DESC
LIMIT 50;


-- ─── Admin: daftar semua users ───

SELECT
  u.id, u.nama, u.email, u.role, u.is_active,
  u.jabatan, u.instansi, u.last_login, u.created_at,
  sp.nama AS sekolah_nama,
  kb.nama AS kabupaten_nama
FROM users u
LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
ORDER BY u.role, u.nama;


-- ─── Admin: toggle user active/inactive ───

UPDATE users SET is_active = :is_active, updated_at = CURRENT_TIMESTAMP
WHERE id = :user_id;
