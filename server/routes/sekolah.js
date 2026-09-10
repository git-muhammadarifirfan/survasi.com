'use strict';
/**
 * @file routes/sekolah.js
 * @description Satuan Pendidikan (Sekolah) API endpoints
 *
 * GET    /api/sekolah              → list sekolah (filter, search, pagination)
 * GET    /api/sekolah/:id          → detail sekolah by id
 * PUT    /api/sekolah/:id          → update sekolah (admin only)
 * GET    /api/sekolah/kabupaten    → list kabupaten (untuk dropdown filter)
 * GET    /api/sekolah/kecamatan    → list kecamatan (opsional filter by kabupaten)
 */

const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware);

// ─── GET /api/sekolah/kabupaten ──────────────────────────────────────────────
router.get('/kabupaten', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, nama, kode_bps, tipe, warna_chart FROM kabupaten ORDER BY nama
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sekolah/kecamatan ──────────────────────────────────────────────
router.get('/kecamatan', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;
    const [rows] = await pool.execute(`
      SELECT k.id, k.nama, k.kabupaten_id, kb.nama AS kabupaten_nama
      FROM kecamatan k
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE (? IS NULL OR k.kabupaten_id = ?)
      ORDER BY kb.nama, k.nama
    `, [kabupatenId, kabupatenId]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sekolah ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      kabupaten_id, kecamatan_id, status, jenjang, search,
      page = 1, limit = 50
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const kab = kabupaten_id ? parseInt(kabupaten_id) : null;
    const kec = kecamatan_id ? parseInt(kecamatan_id) : null;
    const searchPct = search ? `%${search}%` : null;

    // Untuk pengawas: batasi ke sekolah_id mereka sendiri jika ada, atau kabupaten/kecamatan_id
    let extraWhere = '';
    const extraParams = [];
    if (req.user.role === 'pengawas') {
      if (req.user.sekolah_id) {
        extraWhere = ' AND sp.id = ?';
        extraParams.push(req.user.sekolah_id);
      } else if (req.user.kecamatan_id) {
        extraWhere = ' AND sp.kecamatan_id = ?';
        extraParams.push(req.user.kecamatan_id);
      } else if (req.user.kabupaten_id) {
        extraWhere = ' AND k.kabupaten_id = ?';
        extraParams.push(req.user.kabupaten_id);
      }
    }

    const params = [kab, kab, kec, kec, searchPct, searchPct, searchPct, ...extraParams, parseInt(limit), offset];

    const [rows] = await pool.execute(`
      SELECT
        sp.id, sp.npsn, sp.nama, sp.jenjang, sp.status_sekolah,
        sp.akreditasi, sp.alamat, sp.email, sp.telepon,
        sp.total_guru, sp.total_siswa,
        sp.latitude, sp.longitude,
        sp.status_pengisian AS status,
        sp.last_updated,
        k.nama   AS kecamatan,
        kb.id    AS kabupaten_id,
        kb.nama  AS kabupaten
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE (? IS NULL OR kb.id = ?)
        AND (? IS NULL OR k.id  = ?)
        AND (? IS NULL OR (
          sp.nama LIKE ? OR sp.npsn LIKE ?
        ))
        ${extraWhere}
      ORDER BY k.nama, sp.nama
      LIMIT ? OFFSET ?
    `, params);

    // Count total
    const countParams = [kab, kab, kec, kec, searchPct, searchPct, searchPct, ...extraParams];
    const [countRows] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE (? IS NULL OR kb.id = ?)
        AND (? IS NULL OR k.id  = ?)
        AND (? IS NULL OR (
          sp.nama LIKE ? OR sp.npsn LIKE ?
        ))
        ${extraWhere}
    `, countParams);

    return res.json({
      success: true,
      data: rows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('[Sekolah] list error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sekolah/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        sp.*, k.nama AS kecamatan, kb.nama AS kabupaten, kb.id AS kabupaten_id
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/sekolah/:id ────────────────────────────────────────────────────
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const {
      nama, jenjang, status_sekolah, akreditasi, alamat,
      email, telepon, total_guru, total_siswa, status_pengisian
    } = req.body;

    await pool.execute(`
      UPDATE satuan_pendidikan SET
        nama = ?, jenjang = ?, status_sekolah = ?, akreditasi = ?,
        alamat = ?, email = ?, telepon = ?, total_guru = ?, total_siswa = ?,
        status_pengisian = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [nama, jenjang, status_sekolah, akreditasi, alamat, email, telepon,
      total_guru, total_siswa, status_pengisian, req.params.id]);

    return res.json({ success: true, message: 'Data sekolah berhasil diperbarui.' });
  } catch (err) {
    console.error('[Sekolah] update error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
