'use strict';
/**
 * @file routes/users.js
 * @description User Management API Endpoints (Admin Only)
 *
 * GET    /api/users            → List all users with filtering, role search, and pagination
 * POST   /api/users            → Create new user (Admin, Pengawas, or Sekolah)
 * PUT    /api/users/:id/status → Activate / Deactivate user
 * DELETE /api/users/:id        → Delete user
 */

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware);
router.use(adminOnly);

// ─── GET /api/users ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = ['u.deleted_at IS NULL'];
    let params = [];

    if (role && ['admin', 'pengawas', 'sekolah'].includes(role)) {
      whereClauses.push('u.role = ?');
      params.push(role);
    }

    if (search && search.trim() !== '') {
      whereClauses.push('(u.nama LIKE ? OR u.email LIKE ? OR sp.nama LIKE ? OR u.instansi LIKE ?)');
      const searchPct = `%${search.trim()}%`;
      params.push(searchPct, searchPct, searchPct, searchPct);
    }

    const whereSql = whereClauses.join(' AND ');

    const [rows] = await pool.execute(`
      SELECT
        u.id, u.nama, u.email, u.phone, u.role,
        u.jabatan, u.instansi, u.is_active, u.last_login,
        u.created_at, u.sekolah_id, u.kabupaten_id, u.kecamatan_id,
        sp.nama AS sekolah_nama, sp.npsn AS sekolah_npsn,
        kb.nama AS kabupaten_nama, k.nama AS kecamatan_nama
      FROM users u
      LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
      LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
      LEFT JOIN kecamatan k  ON u.kecamatan_id = k.id
      WHERE ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countRows] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM users u
      LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
      WHERE ${whereSql}
    `, params);

    return res.json({
      success: true,
      data: rows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('[Users] List error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/users ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { nama, email, password, role, sekolah_id, kabupaten_id, kecamatan_id, jabatan, instansi } = req.body;

    if (!nama || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Nama, email, password, dan role wajib diisi.' });
    }

    if (!['admin', 'pengawas', 'sekolah'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role harus salah satu dari: admin, pengawas, sekolah.' });
    }

    // Check duplicate email
    const [existing] = await pool.execute('SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh user lain.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(`
      INSERT INTO users (nama, email, password_hash, role, sekolah_id, kabupaten_id, kecamatan_id, jabatan, instansi, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [
      nama.trim(),
      email.trim().toLowerCase(),
      passwordHash,
      role,
      sekolah_id || null,
      kabupaten_id || null,
      kecamatan_id || null,
      jabatan || null,
      instansi || null
    ]);

    const newUserId = result.insertId;

    // Create user_preferences
    await pool.execute('INSERT INTO user_preferences (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id', [newUserId]).catch(() => {});

    return res.json({ success: true, message: 'User baru berhasil ditambahkan.', id: newUserId });
  } catch (err) {
    console.error('[Users] Create error:', err);
    return res.status(500).json({ success: false, message: 'Server error saat membuat user.' });
  }
});

// ─── PUT /api/users/:id (Edit User & Change School Integration) ───────────────
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { nama, email, password, role, sekolah_id, instansi, jabatan } = req.body;

    if (!nama || !email || !role) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan role wajib diisi.' });
    }

    // Check duplicate email (excluding current user)
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE LOWER(email) = ? AND id != ? LIMIT 1',
      [email.trim().toLowerCase(), userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh user lain.' });
    }

    let sekolahId = null;
    let kabupatenId = null;
    let kecamatanId = null;

    if (role === 'sekolah' && sekolah_id) {
      sekolahId = parseInt(sekolah_id, 10);
      const [sekolahRows] = await pool.execute(
        `SELECT sp.id, sp.kecamatan_id, k.kabupaten_id
         FROM satuan_pendidikan sp
         JOIN kecamatan k ON sp.kecamatan_id = k.id
         WHERE sp.id = ? LIMIT 1`,
        [sekolahId]
      );
      if (sekolahRows.length > 0) {
        kabupatenId = sekolahRows[0].kabupaten_id;
        kecamatanId = sekolahRows[0].kecamatan_id;
      }
    }

    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      await pool.execute(`
        UPDATE users SET
          nama = ?, email = ?, password_hash = ?, role = ?,
          sekolah_id = ?, kabupaten_id = ?, kecamatan_id = ?,
          instansi = ?, jabatan = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [nama.trim(), email.trim().toLowerCase(), passwordHash, role, sekolahId, kabupatenId, kecamatanId, instansi || null, jabatan || null, userId]);
    } else {
      await pool.execute(`
        UPDATE users SET
          nama = ?, email = ?, role = ?,
          sekolah_id = ?, kabupaten_id = ?, kecamatan_id = ?,
          instansi = ?, jabatan = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [nama.trim(), email.trim().toLowerCase(), role, sekolahId, kabupatenId, kecamatanId, instansi || null, jabatan || null, userId]);
    }

    return res.json({ success: true, message: 'Data user berhasil diperbarui.' });
  } catch (err) {
    console.error('[Users] Update error:', err);
    return res.status(500).json({ success: false, message: 'Server error saat memperbarui user.' });
  }
});

// ─── PUT /api/users/:id/status ───────────────────────────────────────────────
router.put('/:id/status', async (req, res) => {
  try {
    const { is_active } = req.body;
    const userId = req.params.id;

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Anda tidak dapat mengaktifkan/nonaktifkan akun Anda sendiri.' });
    }

    await pool.execute('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [Boolean(is_active), userId]);
    return res.json({ success: true, message: `Status user berhasil diubah menjadi ${is_active ? 'Aktif' : 'Nonaktif'}.` });
  } catch (err) {
    console.error('[Users] Update status error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/users/:id (Soft Delete) ──────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri.' });
    }

    // Soft delete user
    await pool.execute('UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);

    return res.json({ success: true, message: 'User berhasil dihapus (soft delete). Data masih bisa dipulihkan jika diperlukan.' });
  } catch (err) {
    console.error('[Users] Delete error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus user.' });
  }
});

// ─── POST /api/users/:id/restore (Restore Soft-Deleted User) ─────────────────
router.post('/:id/restore', async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.execute('UPDATE users SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
    return res.json({ success: true, message: 'User berhasil dipulihkan (restore).' });
  } catch (err) {
    console.error('[Users] Restore error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memulihkan user.' });
  }
});

module.exports = router;

