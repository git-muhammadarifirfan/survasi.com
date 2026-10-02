'use strict';
/**
 * @file routes/dashboard.js
 * @description Dashboard API endpoints
 *
 * GET /api/dashboard/summary          → KPI cards (total sekolah, response rate, dll)
 * GET /api/dashboard/regional-stats   → Response rate per kecamatan (bar chart)
 * GET /api/dashboard/kabupaten-stats  → Response rate per kabupaten
 * GET /api/dashboard/activities       → Aktivitas terbaru
 * GET /api/dashboard/follow-up        → List sekolah belum isi (untuk tindak lanjut)
 * GET /api/dashboard/timeseries       → Trend pengisian 7 hari terakhir
 */

const router = require('express').Router();
const pool   = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// Semua endpoint dashboard butuh login
router.use(authMiddleware);

// ─── GET /api/dashboard/summary ─────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;
    const kecamatanId = req.query.kecamatan_id ? parseInt(req.query.kecamatan_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_sekolah,
        SUM(CASE WHEN sp.status_pengisian = 'sudah'    THEN 1 ELSE 0 END) AS sudah,
        SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian,
        SUM(CASE WHEN sp.status_pengisian = 'belum'    THEN 1 ELSE 0 END) AS belum,
        ROUND(
          (SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) +
           SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 0.5 ELSE 0 END))
          / NULLIF(COUNT(*), 0) * 100, 1
        ) AS response_rate,
        (SELECT COUNT(*) FROM responden_survey rs2
          JOIN kecamatan k2 ON rs2.kecamatan_id = k2.id
          JOIN kabupaten kb2 ON k2.kabupaten_id = kb2.id
          WHERE (? IS NULL OR kb2.id = ?)
        ) AS total_responden,
        (SELECT COUNT(DISTINCT sso.id) FROM sel_sesi_observasi sso
          JOIN satuan_pendidikan sp2 ON sso.sekolah_id = sp2.id
          JOIN kecamatan k3 ON sp2.kecamatan_id = k3.id
          JOIN kabupaten kb3 ON k3.kabupaten_id = kb3.id
          WHERE sso.status = 'submitted'
          AND (? IS NULL OR kb3.id = ?)
        ) AS total_sesi_sel
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE (? IS NULL OR kb.id = ?)
        AND (? IS NULL OR k.id = ?)
    `, [kabupatenId, kabupatenId, kabupatenId, kabupatenId, kabupatenId, kabupatenId, kecamatanId, kecamatanId]);

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[Dashboard] summary error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/dashboard/regional-stats ──────────────────────────────────────
router.get('/regional-stats', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        k.id AS kecamatan_id,
        k.nama AS kecamatan,
        kb.nama AS kabupaten,
        COUNT(sp.id) AS total,
        SUM(CASE WHEN sp.status_pengisian = 'sudah'    THEN 1 ELSE 0 END) AS sudah,
        SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian,
        SUM(CASE WHEN sp.status_pengisian = 'belum'    THEN 1 ELSE 0 END) AS belum,
        ROUND(
          (SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) +
           SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 0.5 ELSE 0 END))
          / NULLIF(COUNT(sp.id), 0) * 100, 1
        ) AS rate,
        ROUND(
          (SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) +
           SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 0.5 ELSE 0 END))
          / NULLIF(COUNT(sp.id), 0) * 100, 1
        ) AS response_rate
      FROM kecamatan k
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      LEFT JOIN satuan_pendidikan sp ON sp.kecamatan_id = k.id
      WHERE (? IS NULL OR kb.id = ?)
      GROUP BY k.id, k.nama, kb.nama
      ORDER BY rate DESC
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Dashboard] regional-stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/dashboard/kabupaten-stats ─────────────────────────────────────
router.get('/kabupaten-stats', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        kb.id, kb.nama AS kabupaten, kb.warna_chart AS color,
        COUNT(sp.id) AS total,
        SUM(CASE WHEN sp.status_pengisian = 'sudah'    THEN 1 ELSE 0 END) AS sudah,
        SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian,
        SUM(CASE WHEN sp.status_pengisian = 'belum'    THEN 1 ELSE 0 END) AS belum,
        ROUND(
          (SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) +
           SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 0.5 ELSE 0 END))
          / NULLIF(COUNT(sp.id), 0) * 100, 1
        ) AS rate,
        ROUND(
          (SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) +
           SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 0.5 ELSE 0 END))
          / NULLIF(COUNT(sp.id), 0) * 100, 1
        ) AS response_rate
      FROM kabupaten kb
      LEFT JOIN kecamatan k ON k.kabupaten_id = kb.id
      LEFT JOIN satuan_pendidikan sp ON sp.kecamatan_id = k.id
      GROUP BY kb.id, kb.nama, kb.warna_chart
      ORDER BY rate DESC
    `);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Dashboard] kabupaten-stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/dashboard/modul-progress ──────────────────────────────────────
router.get('/modul-progress', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    // Use modul_bsan table with pertanyaan_survey and jawaban_survey for real data
    const [rows] = await pool.execute(`
      SELECT
        mb.id,
        mb.kode,
        mb.nama,
        COUNT(DISTINCT ps.id) AS totalPertanyaan,
        COUNT(DISTINCT js.id) AS terisi,
        CASE
          WHEN COUNT(DISTINCT ps.id) = 0 THEN 0
          ELSE ROUND(
            COUNT(DISTINCT js.id) / (COUNT(DISTINCT ps.id) * GREATEST(1, (
              SELECT COUNT(DISTINCT rs2.id) FROM responden_survey rs2
              WHERE (? IS NULL OR rs2.kabupaten_id = ?)
                AND rs2.deleted_at IS NULL
            ))) * 100, 1
          )
        END AS progres
      FROM modul_bsan mb
      LEFT JOIN pertanyaan_survey ps ON ps.modul_id = mb.id AND ps.is_active = 1
      LEFT JOIN jawaban_survey js ON js.pertanyaan_id = ps.id
      WHERE mb.is_active = 1
      GROUP BY mb.id, mb.kode, mb.nama, mb.urutan
      ORDER BY mb.urutan ASC
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Dashboard] modul-progress error:', err);
    return res.json({ success: true, data: [] });
  }
});

// ─── GET /api/dashboard/activities ──────────────────────────────────────────
router.get('/activities', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;
    const limit = parseInt(req.query.limit || '10');

    const [rows] = await pool.execute(`
      SELECT
        sp.nama  AS schoolName,
        sp.status_pengisian AS status,
        DATE_FORMAT(sp.last_updated, '%d %b %Y %H:%i') AS time,
        k.nama   AS kecamatan
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.status_pengisian != 'belum'
        AND sp.last_updated IS NOT NULL
        AND (? IS NULL OR kb.id = ?)
      ORDER BY sp.last_updated DESC
      LIMIT ?
    `, [kabupatenId, kabupatenId, limit]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Dashboard] activities error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/dashboard/follow-up ───────────────────────────────────────────
router.get('/follow-up', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        sp.id, sp.npsn, sp.nama, sp.email, sp.telepon,
        k.nama  AS kecamatan,
        kb.nama AS kabupaten,
        sp.status_pengisian
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.status_pengisian = 'belum'
        AND (? IS NULL OR kb.id = ?)
      ORDER BY k.nama, sp.nama
      LIMIT 20
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Dashboard] follow-up error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/dashboard/timeseries ──────────────────────────────────────────
router.get('/timeseries', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        DATE_FORMAT(sp.last_updated, '%Y-%m-%d') AS tanggal,
        SUM(CASE WHEN sp.status_pengisian = 'sudah'    THEN 1 ELSE 0 END) AS sudah,
        SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      WHERE sp.last_updated IS NOT NULL
        AND sp.last_updated >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND (? IS NULL OR k.kabupaten_id = ?)
      GROUP BY DATE_FORMAT(sp.last_updated, '%Y-%m-%d')
      ORDER BY tanggal ASC
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Dashboard] timeseries error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
