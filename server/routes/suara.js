'use strict';
/**
 * @file routes/suara.js
 * @description Suara Responden API endpoints
 *
 * GET  /api/suara              → list komentar/suara (filter, pagination)
 * POST /api/suara              → tambah feedback
 * GET  /api/suara/sentimen     → distribusi sentimen (pie chart)
 * GET  /api/suara/narasi-q33   → narasi hal baik Q33
 * GET  /api/suara/narasi-q35   → narasi relevansi BSAN Q35/Q36
 */

const router = require('express').Router();
const pool   = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ─── GET /api/suara/sentimen ──────────────────────────────────────────────────
router.get('/sentimen', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;
    const [rows] = await pool.execute(`
      SELECT sr.sentimen, COUNT(*) AS jumlah,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
      FROM suara_responden sr
      JOIN satuan_pendidikan sp ON sr.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      WHERE (? IS NULL OR k.kabupaten_id = ?)
      GROUP BY sr.sentimen
    `, [kabupatenId, kabupatenId]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/suara/narasi-q33 ────────────────────────────────────────────────
router.get('/narasi-q33', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;
    const [rows] = await pool.execute(`
      SELECT rs.nama AS responden, sp.nama AS sekolah, k.nama AS kecamatan,
        js.jawaban_bebas AS narasi, 'positif' AS sentimen
      FROM jawaban_survey js
      JOIN pertanyaan_survey ps ON js.pertanyaan_id = ps.id
      JOIN responden_survey rs ON js.responden_id = rs.id
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON rs.kecamatan_id = k.id
      WHERE ps.kode_pertanyaan = 'Q33'
        AND js.jawaban_bebas IS NOT NULL
        AND TRIM(js.jawaban_bebas) != ''
        AND (? IS NULL OR k.kabupaten_id = ?)
      ORDER BY rs.submitted_at DESC
      LIMIT 100
    `, [kabupatenId, kabupatenId]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/suara/narasi-q35 ────────────────────────────────────────────────
router.get('/narasi-q35', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;
    const [rows] = await pool.execute(`
      SELECT rs.nama AS responden, sp.nama AS sekolah, k.nama AS kecamatan,
        js.jawaban_bebas AS narasi
      FROM jawaban_survey js
      JOIN pertanyaan_survey ps ON js.pertanyaan_id = ps.id
      JOIN responden_survey rs ON js.responden_id = rs.id
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON rs.kecamatan_id = k.id
      WHERE ps.kode_pertanyaan IN ('Q35', 'Q36')
        AND js.jawaban_bebas IS NOT NULL
        AND TRIM(js.jawaban_bebas) != ''
        AND (? IS NULL OR k.kabupaten_id = ?)
      ORDER BY ps.kode_pertanyaan, rs.submitted_at DESC
      LIMIT 100
    `, [kabupatenId, kabupatenId]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/suara ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { kabupaten_id, sentimen, modul_id, page = 1, limit = 20 } = req.query;
    const offset      = (parseInt(page) - 1) * parseInt(limit);
    const kabupatenId = kabupaten_id ? parseInt(kabupaten_id) : null;
    const sentimenVal = sentimen || null;
    const modulVal    = modul_id ? parseInt(modul_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        sr.id, sr.komentar, sr.sentimen, sr.tanggal,
        sp.nama AS sekolah, k.nama AS kecamatan,
        mb.nama AS modul, rs.nama AS responden_nama
      FROM suara_responden sr
      JOIN satuan_pendidikan sp ON sr.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      LEFT JOIN modul_bsan mb ON sr.modul_id = mb.id
      LEFT JOIN responden_survey rs ON sr.responden_id = rs.id
      WHERE (? IS NULL OR k.kabupaten_id = ?)
        AND (? IS NULL OR sr.sentimen = ?)
        AND (? IS NULL OR sr.modul_id = ?)
      ORDER BY sr.tanggal DESC, sr.created_at DESC
      LIMIT ? OFFSET ?
    `, [kabupatenId, kabupatenId, sentimenVal, sentimenVal, modulVal, modulVal, parseInt(limit), offset]);

    const [countRows] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM suara_responden sr
      JOIN satuan_pendidikan sp ON sr.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      WHERE (? IS NULL OR k.kabupaten_id = ?)
        AND (? IS NULL OR sr.sentimen = ?)
        AND (? IS NULL OR sr.modul_id = ?)
    `, [kabupatenId, kabupatenId, sentimenVal, sentimenVal, modulVal, modulVal]);

    return res.json({
      success: true, data: rows,
      total: countRows[0].total, page: parseInt(page), limit: parseInt(limit),
    });
  } catch (err) {
    console.error('[Suara] list error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/suara ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { sekolah_id, modul_id, komentar, sentimen, tanggal } = req.body;
    if (!sekolah_id || !komentar || !sentimen) {
      return res.status(400).json({ success: false, message: 'sekolah_id, komentar, sentimen wajib diisi.' });
    }
    const [result] = await pool.execute(
      `INSERT INTO suara_responden (sekolah_id, modul_id, komentar, sentimen, tanggal) VALUES (?, ?, ?, ?, ?)`,
      [sekolah_id, modul_id || null, komentar, sentimen, tanggal || new Date().toISOString().split('T')[0]]
    );
    return res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('[Suara] submit error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
