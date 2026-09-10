'use strict';
/**
 * @file routes/auth.js
 * @description Authentication routes — Login (Email / NPSN) + Get Profile
 *
 * POST   /api/auth/login   → login dengan email atau NPSN
 * POST   /api/auth/logout  → (stateless JWT — hanya log, client hapus token)
 * GET    /api/auth/me      → ambil profil + preferensi user yang sedang login
 * PUT    /api/auth/password → ganti password
 */

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier (email/NPSN) dan password wajib diisi.' });
    }

    // Cari user berdasarkan email ATAU NPSN sekolah yang terhubung
    const [rows] = await pool.execute(`
      SELECT
        u.id, u.nama, u.email, u.password_hash,
        u.role, u.sekolah_id, u.kabupaten_id, u.kecamatan_id,
        u.jabatan, u.instansi, u.is_active,
        sp.nama  AS sekolah_nama,
        sp.npsn  AS sekolah_npsn,
        kb.nama  AS kabupaten_nama,
        k.nama   AS kecamatan_nama
      FROM users u
      LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
      LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
      LEFT JOIN kecamatan k  ON u.kecamatan_id = k.id
      WHERE (u.email = ? OR sp.npsn = ?) AND u.is_active = TRUE
      LIMIT 1
    `, [identifier, identifier]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email/NPSN atau password salah.' });
    }

    const user = rows[0];

    // Verifikasi password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Email/NPSN atau password salah.' });
    }

    // Update last_login
    await pool.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Log activity
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    await pool.execute(
      `INSERT INTO activity_log (user_id, aksi, detail, ip_address) VALUES (?, 'login', ?, ?)`,
      [user.id, JSON.stringify({ email: user.email, user_agent: req.headers['user-agent'] || '' }), ip]
    ).catch(() => { }); // Non-blocking — jangan gagalkan login jika log error

    // Buat JWT
    const tokenPayload = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      sekolah_id: user.sekolah_id,
      kabupaten_id: user.kabupaten_id,
      kecamatan_id: user.kecamatan_id,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    // Hapus password dari response
    delete user.password_hash;

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        jabatan: user.jabatan,
        instansi: user.instansi,
        sekolah_id: user.sekolah_id,
        sekolah_nama: user.sekolah_nama,
        sekolah_npsn: user.sekolah_npsn,
        kabupaten_nama: user.kabupaten_nama,
        kecamatan_nama: user.kecamatan_nama,
      },
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Coba lagi nanti.' });
  }
});

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    await pool.execute(
      `INSERT INTO activity_log (user_id, aksi, ip_address) VALUES (?, 'logout', ?)`,
      [req.user.id, ip]
    ).catch(() => { });
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: true }); // Logout selalu sukses dari sisi client
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
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
      WHERE u.id = ?
    `, [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[AUTH] /me error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/auth/password ──────────────────────────────────────────────────
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    // Ambil hash saat ini
    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });

    const match = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Password lama tidak sesuai.' });
    }

    const newHash = await bcrypt.hash(new_password, 12);
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, req.user.id]
    );

    return res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) {
    console.error('[AUTH] Change password error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
