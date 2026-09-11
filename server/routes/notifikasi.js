'use strict';
/**
 * @file routes/notifikasi.js
 * @description Notifikasi API Endpoints
 *
 * GET  /api/notifikasi            → Ambil notifikasi user terautentikasi
 * PUT  /api/notifikasi/:id/read   → Tandai notifikasi sebagai dibaca
 * POST /api/notifikasi/send       → (Admin only) Kirim/broadcast notifikasi baru
 */

const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware);

// ─── GET /api/notifikasi ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, judul, pesan, tipe, is_read, read_at, created_at
      FROM notifikasi
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    const [unreadCount] = await pool.execute(`
      SELECT COUNT(*) AS count FROM notifikasi WHERE user_id = ? AND is_read = FALSE
    `, [req.user.id]);

    return res.json({
      success: true,
      data: rows,
      unread_count: unreadCount[0].count
    });
  } catch (err) {
    console.error('[Notifikasi] Get error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/notifikasi/:id/read ────────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    await pool.execute(`
      UPDATE notifikasi SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/notifikasi/send (Admin Broadcast) ──────────────────────────────
router.post('/send', adminOnly, async (req, res) => {
  try {
    const { target_role, user_id, judul, pesan, tipe = 'system' } = req.body;

    if (!judul || !pesan) {
      return res.status(400).json({ success: false, message: 'Judul dan pesan notifikasi wajib diisi.' });
    }

    if (user_id) {
      // Kirim ke user spesifik
      await pool.execute(`
        INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, ?, ?, ?)
      `, [user_id, judul, pesan, tipe]);
      return res.json({ success: true, message: 'Notifikasi berhasil dikirim ke pengguna.' });
    }

    // Broadcast berdasarkan role atau ke semua user
    let userQuery = 'SELECT id FROM users WHERE is_active = TRUE';
    const queryParams = [];

    if (target_role && ['admin', 'pengawas', 'sekolah'].includes(target_role)) {
      userQuery += ' AND role = ?';
      queryParams.push(target_role);
    }

    const [users] = await pool.execute(userQuery, queryParams);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Tidak ada penerima yang cocok dengan kriteria.' });
    }

    // Bulk insert
    for (const u of users) {
      await pool.execute(`
        INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, ?, ?, ?)
      `, [u.id, judul, pesan, tipe]);
    }

    return res.json({
      success: true,
      message: `Notifikasi berhasil dikirim ke ${users.length} pengguna (${target_role || 'Semua Role'}).`
    });

  } catch (err) {
    console.error('[Notifikasi] Broadcast error:', err);
    return res.status(500).json({ success: false, message: 'Server error saat mengirim notifikasi.' });
  }
});

module.exports = router;
