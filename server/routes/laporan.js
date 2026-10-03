'use strict';
/**
 * @file routes/laporan.js
 * @description Laporan & Export API endpoints
 *
 * GET  /api/laporan/history     → riwayat export milik user
 * POST /api/laporan/generate    → buat job export baru
 * GET  /api/laporan/rekap       → summary rekap per kabupaten (data untuk PDF/Excel)
 */

const router = require('express').Router();
const pool   = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ─── GET /api/laporan/rekap ───────────────────────────────────────────────────
router.get('/rekap', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        kb.nama AS kabupaten,
        COUNT(sp.id) AS total_sekolah,
        SUM(CASE WHEN sp.status_pengisian = 'sudah'    THEN 1 ELSE 0 END) AS sudah,
        SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian,
        SUM(CASE WHEN sp.status_pengisian = 'belum'    THEN 1 ELSE 0 END) AS belum,
        ROUND(SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 1) AS rate,
        (SELECT COUNT(*) FROM responden_survey rs
          JOIN satuan_pendidikan sp3 ON rs.sekolah_id = sp3.id
          JOIN kecamatan k3 ON sp3.kecamatan_id = k3.id
          WHERE k3.kabupaten_id = kb.id AND rs.deleted_at IS NULL
        ) AS total_responden,
        (SELECT COUNT(*) FROM sel_sesi_observasi sso
          JOIN satuan_pendidikan sp2 ON sso.sekolah_id = sp2.id
          JOIN kecamatan k2 ON sp2.kecamatan_id = k2.id
          WHERE k2.kabupaten_id = kb.id AND sso.deleted_at IS NULL AND sso.status IN ('submitted','reviewed')
        ) AS sesi_observasi
      FROM kabupaten kb
      LEFT JOIN kecamatan k ON k.kabupaten_id = kb.id
      LEFT JOIN satuan_pendidikan sp ON sp.kecamatan_id = k.id AND sp.deleted_at IS NULL
      GROUP BY kb.id, kb.nama
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Laporan] rekap error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/laporan/history ─────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        le.id, le.tipe_export, le.nama_file, le.status,
        le.created_at, le.completed_at, le.filter_params,
        u.nama AS created_by
      FROM laporan_export le
      JOIN users u ON le.user_id = u.id
      WHERE le.user_id = ?
      ORDER BY le.created_at DESC
      LIMIT 20
    `, [req.user.id]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/laporan/generate ──────────────────────────────────────────────
router.post('/generate', async (req, res) => {
  try {
    const { filter, nama_file } = req.body;
    // Kolom tipe_export hanya menerima pdf/excel/docx — CSV dicatat sebagai 'excel' (format asli disimpan di filter_params)
    const tipe = req.body.tipe === 'csv' ? 'excel' : req.body.tipe;
    if (!['pdf', 'excel', 'docx'].includes(tipe)) {
      return res.status(400).json({ success: false, message: 'Tipe export tidak valid.' });
    }

    const namaFile = nama_file
      ? String(nama_file).replace(/[^\w.\-() ]+/g, '_').slice(0, 250)
      : `laporan_bsan_${tipe}_${Date.now()}.${tipe === 'excel' ? 'xlsx' : tipe}`;
    const [result] = await pool.execute(
      `INSERT INTO laporan_export (user_id, tipe_export, nama_file, filter_params, status) VALUES (?, ?, ?, ?, 'generating')`,
      [req.user.id, tipe, namaFile, JSON.stringify(filter || {})]
    );

    // Di production: trigger background job (queue) untuk generate file sesungguhnya
    // Sementara: langsung mark as completed (download di frontend dari data API)
    await pool.execute(
      `UPDATE laporan_export SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [result.insertId]
    );

    return res.json({
      success: true,
      reportId:    result.insertId,
      downloadUrl: `/api/laporan/download/${result.insertId}`,
    });
  } catch (err) {
    console.error('[Laporan] generate error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
