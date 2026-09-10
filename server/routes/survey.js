'use strict';
/**
 * @file routes/survey.js
 * @description Kuesioner BSAN survey API endpoints
 *
 * GET  /api/survey/questions → Get all 37 survey questions from DB
 * POST /api/survey/submit    → Submit survey answers
 */

const router = require('express').Router();
const pool   = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const { submitLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

// ─── GET /api/survey/questions ───────────────────────────────────────────────
router.get('/questions', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, modul_id, kode_pertanyaan, teks_pertanyaan, 
        tipe, opsi_jawaban, urutan, is_required, 
        skip_to_question, section, target_kelas, is_active
      FROM pertanyaan_survey
      WHERE is_active = 1
      ORDER BY urutan ASC
    `);

    // Parse JSON options
    const formatted = rows.map(q => ({
      ...q,
      opsi_jawaban: typeof q.opsi_jawaban === 'string' 
        ? JSON.parse(q.opsi_jawaban) 
        : (q.opsi_jawaban || [])
    }));

    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[SURVEY] fetch questions error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat pertanyaan survei.' });
  }
});

// ─── POST /api/survey/questions (Add Question - Admin Only) ─────────────────
router.post('/questions', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengelola pertanyaan.' });
    }

    const {
      kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban,
      is_required, section, urutan
    } = req.body;

    if (!teks_pertanyaan || !section) {
      return res.status(400).json({ success: false, message: 'Teks pertanyaan dan section wajib diisi.' });
    }

    const opsiJson = Array.isArray(opsi_jawaban) ? JSON.stringify(opsi_jawaban) : null;

    const [result] = await pool.execute(`
      INSERT INTO pertanyaan_survey (
        kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban,
        urutan, is_required, section, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      kode_pertanyaan || 'Q_NEW',
      teks_pertanyaan,
      tipe || 'text',
      opsiJson,
      urutan || 99,
      is_required ? 1 : 0,
      section || 'identitas'
    ]);

    return res.status(201).json({
      success: true,
      message: 'Pertanyaan berhasil ditambahkan.',
      id: result.insertId
    });
  } catch (err) {
    console.error('[SURVEY] create question error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menambah pertanyaan survei.' });
  }
});

// ─── PUT /api/survey/questions/:id (Update Question - Admin Only) ────────────
router.put('/questions/:id', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengelola pertanyaan.' });
    }

    const questionId = parseInt(req.params.id);
    const {
      kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban,
      is_required, section
    } = req.body;

    const opsiJson = Array.isArray(opsi_jawaban) ? JSON.stringify(opsi_jawaban) : null;

    await pool.execute(`
      UPDATE pertanyaan_survey
      SET 
        kode_pertanyaan = COALESCE(?, kode_pertanyaan),
        teks_pertanyaan = COALESCE(?, teks_pertanyaan),
        tipe = COALESCE(?, tipe),
        opsi_jawaban = COALESCE(?, opsi_jawaban),
        is_required = COALESCE(?, is_required),
        section = COALESCE(?, section)
      WHERE id = ?
    `, [
      kode_pertanyaan || null,
      teks_pertanyaan || null,
      tipe || null,
      opsiJson,
      is_required !== undefined ? (is_required ? 1 : 0) : null,
      section || null,
      questionId
    ]);

    return res.json({ success: true, message: 'Pertanyaan berhasil diperbarui.' });
  } catch (err) {
    console.error('[SURVEY] update question error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui pertanyaan.' });
  }
});

// ─── DELETE /api/survey/questions/:id (Delete Question - Admin Only) ──────────
router.delete('/questions/:id', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengelola pertanyaan.' });
    }

    const questionId = parseInt(req.params.id);
    await pool.execute(`UPDATE pertanyaan_survey SET is_active = 0 WHERE id = ?`, [questionId]);

    return res.json({ success: true, message: 'Pertanyaan berhasil dihapus.' });
  } catch (err) {
    console.error('[SURVEY] delete question error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus pertanyaan.' });
  }
});

// ─── POST /api/survey/submit ─────────────────────────────────────────────────
router.post('/submit', submitLimiter, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      nama, jenis_kelamin, posisi, sekolah_id, npsn,
      kabupaten_id, kecamatan_id, penerima_modul,
      penyelenggara_pelatihan, status_implementasi,
      kelas_mengajar, no_wa, jawaban
    } = req.body;

    // Insert responden
    const [respResult] = await conn.execute(`
      INSERT INTO responden_survey (
        nama, jenis_kelamin, posisi, sekolah_id, npsn,
        kabupaten_id, kecamatan_id, penerima_modul,
        penyelenggara_pelatihan, status_implementasi,
        kelas_mengajar, no_wa, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      nama, jenis_kelamin, posisi, sekolah_id, npsn || null,
      kabupaten_id, kecamatan_id, penerima_modul || 'Tidak',
      Array.isArray(penyelenggara_pelatihan) ? penyelenggara_pelatihan.join(', ') : (penyelenggara_pelatihan || null),
      status_implementasi || null, kelas_mengajar || null, no_wa || null
    ]);

    const respondenId = respResult.insertId;

    // Insert answers
    if (jawaban && Array.isArray(jawaban) && jawaban.length > 0) {
      for (const j of jawaban) {
        let multiVal = null;
        let terstrukturVal = null;
        let bebasVal = null;

        if (Array.isArray(j.value)) {
          multiVal = JSON.stringify(j.value);
        } else if (typeof j.value === 'string') {
          if (j.tipe === 'text') bebasVal = j.value;
          else terstrukturVal = j.value;
        }

        await conn.execute(`
          INSERT INTO jawaban_survey (
            responden_id, pertanyaan_id, jawaban_terstruktur, jawaban_bebas, jawaban_multi
          ) VALUES (?, ?, ?, ?, ?)
        `, [respondenId, j.pertanyaan_id, terstrukturVal, bebasVal, multiVal]);
      }
    }

    await conn.commit();
    return res.status(201).json({ success: true, responden_id: respondenId, message: 'Survei berhasil disimpan.' });
  } catch (err) {
    await conn.rollback();
    console.error('[SURVEY] submit error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengirim survei.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
