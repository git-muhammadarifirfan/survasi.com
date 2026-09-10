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

// ─── POST /api/survey/submit ─────────────────────────────────────────────────
router.post('/submit', async (req, res) => {
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
