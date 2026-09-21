'use strict';
/**
 * @file routes/setting.js
 * @description Setting API endpoints (profil, preferensi, notifikasi, manajemen user)
 *
 * GET  /api/setting/profile          → profil user saat ini
 * PUT  /api/setting/profile          → update nama, phone, jabatan, instansi
 * GET  /api/setting/preferences      → preferensi dashboard
 * PUT  /api/setting/preferences      → update preferensi
 * GET  /api/setting/notifikasi       → list notifikasi
 * GET  /api/setting/notifikasi/unread-count → badge count
 * PUT  /api/setting/notifikasi/:id/read → mark as read
 * PUT  /api/setting/notifikasi/read-all → mark all as read
 * GET  /api/setting/users            → daftar semua user (admin only)
 * POST /api/setting/users            → buat user baru (admin only)
 * PUT  /api/setting/users/:id/toggle → toggle aktif/nonaktif (admin only)
 * GET  /api/setting/activity-log     → riwayat aktivitas
 */

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool   = require('../db/pool');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware);

// ─── GET /api/setting/profile ────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.id, u.nama, u.email, u.phone, u.role, u.jabatan, u.instansi,
        u.last_login, u.created_at,
        sp.nama AS sekolah_nama, sp.npsn, kb.nama AS kabupaten_nama
      FROM users u
      LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
      LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
      WHERE u.id = ?
    `, [req.user.id]);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/setting/profile ─────────────────────────────────────────────────
router.put('/profile', async (req, res) => {
  try {
    const { nama, phone, jabatan, instansi } = req.body;
    await pool.execute(
      `UPDATE users SET nama=?, phone=?, jabatan=?, instansi=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [nama, phone, jabatan, instansi, req.user.id]
    );
    return res.json({ success: true, message: 'Profil berhasil diperbarui.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/setting/preferences ────────────────────────────────────────────
router.get('/preferences', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM user_preferences WHERE user_id = ?`, [req.user.id]
    );
    return res.json({ success: true, data: rows[0] || {} });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/setting/preferences ────────────────────────────────────────────
router.put('/preferences', async (req, res) => {
  try {
    const { bahasa, tema, auto_save_interval, notif_weekly_report,
            notif_instant_alert, notif_reminder_email, notif_system_update } = req.body;
    await pool.execute(`
      INSERT INTO user_preferences
        (user_id, bahasa, tema, auto_save_interval, notif_weekly_report, notif_instant_alert, notif_reminder_email, notif_system_update)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        bahasa=VALUES(bahasa), tema=VALUES(tema),
        auto_save_interval=VALUES(auto_save_interval),
        notif_weekly_report=VALUES(notif_weekly_report),
        notif_instant_alert=VALUES(notif_instant_alert),
        notif_reminder_email=VALUES(notif_reminder_email),
        notif_system_update=VALUES(notif_system_update)
    `, [req.user.id, bahasa, tema, auto_save_interval,
        notif_weekly_report, notif_instant_alert, notif_reminder_email, notif_system_update]);
    return res.json({ success: true, message: 'Preferensi disimpan.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/setting/notifikasi ─────────────────────────────────────────────
router.get('/notifikasi', async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit || '20');
    const offset = parseInt(req.query.offset || '0');
    const [rows] = await pool.execute(
      `SELECT id, judul, pesan, tipe, is_read, created_at FROM notifikasi
       WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/setting/notifikasi/unread-count ────────────────────────────────
router.get('/notifikasi/unread-count', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS unread FROM notifikasi WHERE user_id = ? AND is_read = FALSE`,
      [req.user.id]
    );
    return res.json({ success: true, unread: rows[0].unread });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/setting/notifikasi/read-all ────────────────────────────────────
router.put('/notifikasi/read-all', async (req, res) => {
  try {
    await pool.execute(
      `UPDATE notifikasi SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = FALSE`,
      [req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/setting/notifikasi/:id/read ────────────────────────────────────
router.put('/notifikasi/:id/read', async (req, res) => {
  try {
    await pool.execute(
      `UPDATE notifikasi SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/setting/users ───────────────────────────────────────────────────
router.get('/users', adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.id, u.nama, u.email, u.role, u.is_active,
        u.jabatan, u.instansi, u.last_login, u.created_at,
        sp.nama AS sekolah_nama, kb.nama AS kabupaten_nama
      FROM users u
      LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
      LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
      ORDER BY u.role, u.nama
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/setting/users ──────────────────────────────────────────────────
router.post('/users', adminOnly, async (req, res) => {
  try {
    const { nama, email, password, phone, role, sekolah_id, kabupaten_id, kecamatan_id, jabatan, instansi } = req.body;
    if (!nama || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'nama, email, password, role wajib diisi.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(`
      INSERT INTO users (nama, email, password_hash, phone, role, sekolah_id, kabupaten_id, kecamatan_id, jabatan, instansi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [nama, email, hash, phone || null, role, sekolah_id || null, kabupaten_id || null, kecamatan_id || null, jabatan || null, instansi || null]);

    // Auto-create preferences
    await pool.execute(`INSERT INTO user_preferences (user_id) VALUES (?)`, [result.insertId]);

    return res.status(201).json({ success: true, id: result.insertId, message: 'User berhasil dibuat.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }
    console.error('[Setting] create user error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/setting/users/:id/toggle ───────────────────────────────────────
router.put('/users/:id/toggle', adminOnly, async (req, res) => {
  try {
    const { is_active } = req.body;
    await pool.execute(
      `UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [is_active ? 1 : 0, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/setting/activity-log ───────────────────────────────────────────
router.get('/activity-log', async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const [rows] = await pool.execute(`
      SELECT al.id, al.aksi, al.target_tabel, al.target_id,
        al.detail, al.ip_address, al.created_at,
        u.nama AS user_nama, u.role
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE (? IS NULL OR al.user_id = ?)
      ORDER BY al.created_at DESC
      LIMIT 50
    `, [userId, userId]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/setting/target-observasi ────────────────────────────────────────
router.get('/target-observasi', adminOnly, async (req, res) => {
  try {
    // Get global default
    const [settingRows] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'default_target_observasi'`
    );
    const defaultTarget = settingRows.length > 0 ? parseInt(settingRows[0].setting_value) : 2;

    // Get per-school targets with observation counts
    const [schoolRows] = await pool.execute(`
      SELECT 
        sp.id, sp.npsn, sp.nama, sp.target_observasi,
        k.nama AS kecamatan, kb.nama AS kabupaten,
        COUNT(DISTINCT sso.id) AS observasi_count
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      LEFT JOIN sel_sesi_observasi sso ON sso.sekolah_id = sp.id AND sso.deleted_at IS NULL
      WHERE sp.deleted_at IS NULL
      GROUP BY sp.id, sp.npsn, sp.nama, sp.target_observasi, k.nama, kb.nama
      ORDER BY kb.nama, k.nama, sp.nama
    `);

    return res.json({
      success: true,
      data: {
        default_target: defaultTarget,
        schools: schoolRows,
      }
    });
  } catch (err) {
    console.error('[Setting] target-observasi GET error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/setting/target-observasi ────────────────────────────────────────
router.put('/target-observasi', adminOnly, async (req, res) => {
  try {
    const { default_target, apply_to_all } = req.body;
    if (!default_target || default_target < 1 || default_target > 20) {
      return res.status(400).json({ success: false, message: 'Target harus antara 1-20.' });
    }

    // Update global default
    await pool.execute(
      `INSERT INTO app_settings (setting_key, setting_value, updated_by)
       VALUES ('default_target_observasi', ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
      [String(default_target), req.user.id]
    );

    // Optionally apply to all schools
    if (apply_to_all) {
      await pool.execute(
        `UPDATE satuan_pendidikan SET target_observasi = ? WHERE deleted_at IS NULL`,
        [default_target]
      );
    }

    return res.json({
      success: true,
      message: apply_to_all
        ? `Target observasi global diubah ke ${default_target}x dan diterapkan ke semua sekolah.`
        : `Target observasi default diubah ke ${default_target}x.`
    });
  } catch (err) {
    console.error('[Setting] target-observasi PUT error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/setting/target-observasi/batch ─────────────────────────────────
// NOTE: Must be defined BEFORE /:sekolahId to avoid Express matching 'batch' as param
router.put('/target-observasi/batch', adminOnly, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { items } = req.body; // array of { sekolah_id, target }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Data batch tidak valid.' });
    }

    await conn.beginTransaction();
    for (const item of items) {
      if (item.target >= 1 && item.target <= 20) {
        await conn.execute(
          `UPDATE satuan_pendidikan SET target_observasi = ? WHERE id = ?`,
          [item.target, item.sekolah_id]
        );
      }
    }
    await conn.commit();

    return res.json({ success: true, message: `Target observasi ${items.length} sekolah berhasil diperbarui.` });
  } catch (err) {
    await conn.rollback();
    console.error('[Setting] target-observasi batch error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
});

// ─── PUT /api/setting/target-observasi/:sekolahId ────────────────────────────
router.put('/target-observasi/:sekolahId', adminOnly, async (req, res) => {
  try {
    const { target } = req.body;
    const sekolahId = parseInt(req.params.sekolahId);
    if (!target || target < 1 || target > 20) {
      return res.status(400).json({ success: false, message: 'Target harus antara 1-20.' });
    }

    await pool.execute(
      `UPDATE satuan_pendidikan SET target_observasi = ? WHERE id = ?`,
      [target, sekolahId]
    );

    return res.json({ success: true, message: `Target observasi sekolah berhasil diubah ke ${target}x.` });
  } catch (err) {
    console.error('[Setting] target-observasi per-school PUT error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
