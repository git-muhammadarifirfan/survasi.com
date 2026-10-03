'use strict';
/**
 * @file routes/responden.js
 * @description Data Responden Survey API endpoints
 *
 * GET /api/responden           → list responden (filter, search, pagination)
 * GET /api/responden/summary   → KPI cards responden
 * GET /api/responden/distribusi → distribusi per posisi (donut chart)
 * GET /api/responden/export    → semua data tanpa pagination (untuk export)
 */

const router = require('express').Router();
const pool   = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const { loadRoleMap, answerToText } = require('../utils/surveyRoles');
const { parseFilter, wilayahWhere } = require('../utils/analytics');

router.use(authMiddleware);

// ─── GET /api/responden/summary ──────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_responden,
        SUM(CASE WHEN rs.jenis_kelamin = 'L' THEN 1 ELSE 0 END) AS laki_laki,
        SUM(CASE WHEN rs.jenis_kelamin = 'P' THEN 1 ELSE 0 END) AS perempuan,
        SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) AS penerima,
        SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) AS implementasi_penuh,
        COUNT(DISTINCT rs.sekolah_id) AS sekolah_terlibat
      FROM responden_survey rs
      WHERE (? IS NULL OR rs.kabupaten_id = ?) AND rs.deleted_at IS NULL
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[Responden] summary error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/responden/distribusi ───────────────────────────────────────────
router.get('/distribusi', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        rs.posisi,
        COUNT(*) AS jumlah,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
      FROM responden_survey rs
      WHERE (? IS NULL OR rs.kabupaten_id = ?) AND rs.deleted_at IS NULL
      GROUP BY rs.posisi
      ORDER BY jumlah DESC
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/responden/export-full ──────────────────────────────────────────
// Data mentah lengkap: identitas responden + sekolah + NPSN + akun pengisi +
// SELURUH jawaban per pertanyaan (pertanyaan aktif + pertanyaan lama yang punya jawaban).
router.get('/export-full', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);

    const [rows] = await pool.execute(`
      SELECT
        rs.id AS responden_id, rs.nama, rs.jenis_kelamin, rs.posisi,
        sp.id AS sekolah_id, sp.nama AS sekolah, COALESCE(sp.npsn, rs.npsn, '') AS npsn,
        sp.jenjang, sp.status_sekolah,
        kb.nama AS kabupaten, k.nama AS kecamatan,
        rs.penerima_modul, rs.penyelenggara_pelatihan,
        rs.status_implementasi, rs.kelas_mengajar,
        rs.no_wa, rs.submitted_at,
        (SELECT u.nama  FROM users u WHERE u.sekolah_id = sp.id AND u.deleted_at IS NULL ORDER BY u.id LIMIT 1) AS akun_nama,
        (SELECT u.email FROM users u WHERE u.sekolah_id = sp.id AND u.deleted_at IS NULL ORDER BY u.id LIMIT 1) AS akun_email
      FROM responden_survey rs
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE rs.deleted_at IS NULL ${w.sql}
      ORDER BY rs.submitted_at ASC, rs.id ASC
    `, w.params);

    const { questions: allQuestions, roleById } = await loadRoleMap();
    const [sections] = await pool.execute(`SELECT section_key, title, urutan FROM survey_sections`);
    const secMeta = new Map(sections.map(s => [s.section_key, s]));

    const ansMap = {};
    const answeredQ = new Set();
    if (rows.length > 0) {
      const ids = rows.map(r => r.responden_id);
      for (let i = 0; i < ids.length; i += 1000) {
        const [answers] = await pool.query(
          `SELECT responden_id, pertanyaan_id, jawaban_terstruktur, jawaban_bebas, jawaban_multi
           FROM jawaban_survey WHERE responden_id IN (?)`,
          [ids.slice(i, i + 1000)]
        );
        answers.forEach(a => {
          const text = answerToText(a);
          if (!text) return;
          if (!ansMap[a.responden_id]) ansMap[a.responden_id] = {};
          ansMap[a.responden_id][a.pertanyaan_id] = text;
          answeredQ.add(a.pertanyaan_id);
        });
      }
    }

    // Kolom pertanyaan: semua yang aktif + yang nonaktif tapi punya jawaban, urut section → urutan.
    const questions = allQuestions
      .filter(q => q.is_active || answeredQ.has(q.id))
      .sort((a, b) =>
        ((secMeta.get(a.section)?.urutan ?? 99) - (secMeta.get(b.section)?.urutan ?? 99)) ||
        (a.urutan - b.urutan) || (a.id - b.id))
      .map(q => ({
        id: q.id,
        kode_pertanyaan: q.kode_pertanyaan,
        teks_pertanyaan: String(q.teks_pertanyaan || '').replace(/\s+/g, ' ').trim(),
        tipe: q.tipe,
        opsi_jawaban: q.opsi_jawaban,
        modul_id: q.modul_id,
        section: q.section,
        section_title: secMeta.get(q.section)?.title || q.section,
        role: roleById[q.id] || null,
        is_active: Boolean(q.is_active),
      }));

    return res.json({ success: true, data: { respondents: rows, questions, answers: ansMap } });
  } catch (err) {
    console.error('[Responden] export-full error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/responden/export ───────────────────────────────────────────────
router.get('/export', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        rs.nama, rs.jenis_kelamin, rs.posisi,
        sp.nama AS sekolah, rs.npsn,
        kb.nama AS kabupaten, k.nama AS kecamatan,
        rs.penerima_modul, rs.penyelenggara_pelatihan,
        rs.status_implementasi, rs.kelas_mengajar,
        rs.no_wa, rs.submitted_at
      FROM responden_survey rs
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON rs.kecamatan_id = k.id
      JOIN kabupaten kb ON rs.kabupaten_id = kb.id
      WHERE (? IS NULL OR kb.id = ?) AND rs.deleted_at IS NULL
      ORDER BY kb.nama, k.nama, sp.nama, rs.nama
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/responden ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      kabupaten_id, kecamatan_id, penerima_modul,
      status_implementasi, search,
      page = 1, limit = 50
    } = req.query;

    const offset      = (parseInt(page) - 1) * parseInt(limit);
    const kab         = kabupaten_id ? parseInt(kabupaten_id) : null;
    const kec         = kecamatan_id ? parseInt(kecamatan_id) : null;
    const penerimaVal = penerima_modul || null;
    const statusVal   = status_implementasi || null;
    const searchPct   = search ? `%${search}%` : null;

    const params = [kab, kab, kec, kec, penerimaVal, penerimaVal, statusVal, statusVal,
                    searchPct, searchPct, searchPct, searchPct, parseInt(limit), offset];

    const [rows] = await pool.execute(`
      SELECT
        rs.id, rs.nama, rs.jenis_kelamin, rs.posisi,
        sp.nama AS sekolah, rs.npsn,
        kb.nama AS kabupaten, k.nama AS kecamatan,
        rs.penerima_modul, rs.penyelenggara_pelatihan,
        rs.status_implementasi, rs.kelas_mengajar,
        rs.no_wa, rs.submitted_at
      FROM responden_survey rs
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON rs.kecamatan_id = k.id
      JOIN kabupaten kb ON rs.kabupaten_id = kb.id
      WHERE rs.deleted_at IS NULL
        AND (? IS NULL OR kb.id = ?)
        AND (? IS NULL OR k.id  = ?)
        AND (? IS NULL OR rs.penerima_modul = ?)
        AND (? IS NULL OR rs.status_implementasi = ?)
        AND (? IS NULL OR (
          rs.nama LIKE ? OR sp.nama LIKE ? OR rs.npsn LIKE ?
        ))
      ORDER BY rs.submitted_at DESC
      LIMIT ? OFFSET ?
    `, params);

    const countParams = [kab, kab, kec, kec, penerimaVal, penerimaVal, statusVal, statusVal,
                         searchPct, searchPct, searchPct, searchPct];
    const [countRows] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM responden_survey rs
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON rs.kecamatan_id = k.id
      JOIN kabupaten kb ON rs.kabupaten_id = kb.id
      WHERE rs.deleted_at IS NULL
        AND (? IS NULL OR kb.id = ?)
        AND (? IS NULL OR k.id  = ?)
        AND (? IS NULL OR rs.penerima_modul = ?)
        AND (? IS NULL OR rs.status_implementasi = ?)
        AND (? IS NULL OR (
          rs.nama LIKE ? OR sp.nama LIKE ? OR rs.npsn LIKE ?
        ))
    `, countParams);

    return res.json({
      success: true,
      data:    rows,
      total:   countRows[0].total,
      page:    parseInt(page),
      limit:   parseInt(limit),
    });
  } catch (err) {
    console.error('[Responden] list error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/responden/:id (Soft Delete) ─────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const respId = req.params.id;
    await pool.execute('UPDATE responden_survey SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [respId]);
    return res.json({ success: true, message: 'Data responden berhasil dihapus (soft delete). Data dapat dipulihkan jika diperlukan.' });
  } catch (err) {
    console.error('[Responden] Delete error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus responden.' });
  }
});

// ─── POST /api/responden/:id/restore (Restore Soft-Deleted Responden) ────────
router.post('/:id/restore', async (req, res) => {
  try {
    const respId = req.params.id;
    await pool.execute('UPDATE responden_survey SET deleted_at = NULL WHERE id = ?', [respId]);
    return res.json({ success: true, message: 'Data responden berhasil dipulihkan (restore).' });
  } catch (err) {
    console.error('[Responden] Restore error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memulihkan responden.' });
  }
});

module.exports = router;
