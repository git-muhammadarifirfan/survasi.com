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
      WHERE is_active = 1 AND deleted_at IS NULL
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
    const role = req.user?.role || 'admin';
    if (role !== 'admin' && role !== 'pengawas') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengelola pertanyaan.' });
    }

    const {
      modul_id, kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban,
      is_required, section, urutan
    } = req.body;

    if (!teks_pertanyaan || !section) {
      return res.status(400).json({ success: false, message: 'Teks pertanyaan dan section wajib diisi.' });
    }

    const opsiJson = Array.isArray(opsi_jawaban) ? JSON.stringify(opsi_jawaban) : null;
    const mId = modul_id ? parseInt(modul_id) : null;

    const [result] = await pool.execute(`
      INSERT INTO pertanyaan_survey (
        modul_id, kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban,
        urutan, is_required, section, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      mId,
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

// ─── PUT /api/survey/questions/reorder (Reorder Questions - Admin Only) ───────
router.put('/questions/reorder', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const { items } = req.body; // array of { id: number, urutan: number }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Format data reorder tidak valid.' });
    }

    await conn.beginTransaction();
    for (const item of items) {
      await conn.execute(
        `UPDATE pertanyaan_survey SET urutan = ? WHERE id = ?`,
        [item.urutan, item.id]
      );
    }
    await conn.commit();
    return res.json({ success: true, message: 'Urutan pertanyaan berhasil disimpan.' });
  } catch (err) {
    await conn.rollback();
    console.error('[SURVEY] reorder error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengubah urutan pertanyaan.' });
  } finally {
    conn.release();
  }
});

// ─── PUT /api/survey/questions/:id (Update Question - Admin Only) ────────────
router.put('/questions/:id', async (req, res) => {
  try {
    const role = req.user?.role || 'admin';
    if (role !== 'admin' && role !== 'pengawas') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengelola pertanyaan.' });
    }

    const questionId = parseInt(req.params.id);
    const {
      modul_id, kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban,
      is_required, section
    } = req.body;

    const opsiJson = Array.isArray(opsi_jawaban) ? JSON.stringify(opsi_jawaban) : (opsi_jawaban ? JSON.stringify([opsi_jawaban]) : null);
    const reqVal = is_required ? 1 : 0;
    const mId = modul_id ? parseInt(modul_id) : null;

    await pool.execute(`
      UPDATE pertanyaan_survey
      SET 
        modul_id = ?,
        kode_pertanyaan = ?,
        teks_pertanyaan = ?,
        tipe = ?,
        opsi_jawaban = ?,
        is_required = ?,
        section = ?
      WHERE id = ?
    `, [
      mId,
      kode_pertanyaan || 'Q',
      teks_pertanyaan || '',
      tipe || 'radio',
      opsiJson,
      reqVal,
      section || 'identitas',
      questionId
    ]);

    return res.json({ success: true, message: 'Pertanyaan berhasil diperbarui.' });
  } catch (err) {
    console.error('[SURVEY] update question error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui pertanyaan.' });
  }
});

// ─── DELETE /api/survey/questions/:id (Soft Delete Question - Admin Only) ─────
router.delete('/questions/:id', async (req, res) => {
  try {
    const role = req.user?.role || 'admin';
    if (role !== 'admin' && role !== 'pengawas') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengelola pertanyaan.' });
    }

    const questionId = parseInt(req.params.id);
    await pool.execute(`UPDATE pertanyaan_survey SET is_active = 0, deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [questionId]);

    return res.json({ success: true, message: 'Pertanyaan berhasil dihapus (soft delete). Data masih dapat dipulihkan.' });
  } catch (err) {
    console.error('[SURVEY] delete question error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus pertanyaan.' });
  }
});

// ─── POST /api/survey/questions/:id/restore (Restore Question - Admin Only) ──
router.post('/questions/:id/restore', async (req, res) => {
  try {
    const role = req.user?.role || 'admin';
    if (role !== 'admin' && role !== 'pengawas') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengelola pertanyaan.' });
    }

    const questionId = parseInt(req.params.id);
    await pool.execute(`UPDATE pertanyaan_survey SET is_active = 1, deleted_at = NULL WHERE id = ?`, [questionId]);

    return res.json({ success: true, message: 'Pertanyaan berhasil dipulihkan (restore).' });
  } catch (err) {
    console.error('[SURVEY] restore question error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memulihkan pertanyaan.' });
  }
});

// ─── GET /api/survey/sections (Get All Active Sections) ──────────────────────
router.get('/sections', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, section_key, title, description, urutan FROM survey_sections WHERE is_active = 1 ORDER BY urutan ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[SURVEY] fetch sections error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat daftar section.' });
  }
});

// ─── POST /api/survey/sections (Create Section - Admin Only) ─────────────────
router.post('/sections', async (req, res) => {
  try {
    const role = req.user?.role || 'admin';
    if (role !== 'admin' && role !== 'pengawas') {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Judul section wajib diisi.' });
    }

    const cleanTitle = title.trim();
    let baseKey = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!baseKey) baseKey = 'sec_' + Date.now();

    let sectionKey = baseKey;
    let count = 1;
    while (true) {
      const [existing] = await pool.execute('SELECT id FROM survey_sections WHERE section_key = ? LIMIT 1', [sectionKey]);
      if (existing.length === 0) break;
      sectionKey = `${baseKey}_${count++}`;
    }

    const [maxUrutanRows] = await pool.execute('SELECT MAX(urutan) AS max_u FROM survey_sections');
    const nextUrutan = (maxUrutanRows[0]?.max_u || 0) + 1;

    const [result] = await pool.execute(
      `INSERT INTO survey_sections (section_key, title, description, urutan, is_active) VALUES (?, ?, ?, ?, 1)`,
      [sectionKey, cleanTitle, description || 'Bagian instrumen kuesioner', nextUrutan]
    );

    return res.status(201).json({
      success: true,
      message: 'Section baru berhasil disimpan ke database.',
      data: {
        id: result.insertId,
        section_key: sectionKey,
        title: cleanTitle,
        description: description || 'Bagian instrumen kuesioner',
        urutan: nextUrutan
      }
    });
  } catch (err) {
    console.error('[SURVEY] create section error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menambah section.' });
  }
});

// ─── PUT /api/survey/sections/:sectionKey (Edit Section Title/Desc) ────────────
router.put('/sections/:sectionKey', async (req, res) => {
  try {
    const role = req.user?.role || 'admin';
    if (role !== 'admin' && role !== 'pengawas') {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const { sectionKey } = req.params;
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Judul section wajib diisi.' });
    }

    await pool.execute(
      `UPDATE survey_sections SET title = ?, description = ? WHERE section_key = ?`,
      [title.trim(), description || '', sectionKey]
    );

    return res.json({ success: true, message: 'Informasi section berhasil diperbarui.' });
  } catch (err) {
    console.error('[SURVEY] update section error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengedit section.' });
  }
});

// ─── DELETE /api/survey/sections/:sectionKey (Delete Section & Questions) ───────
router.delete('/sections/:sectionKey', async (req, res) => {
  try {
    const role = req.user?.role || 'admin';
    if (role !== 'admin' && role !== 'pengawas') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengelola section.' });
    }

    const { sectionKey } = req.params;
    if (!sectionKey) {
      return res.status(400).json({ success: false, message: 'Nama section tidak valid.' });
    }

    await pool.execute(`UPDATE survey_sections SET is_active = 0 WHERE section_key = ?`, [sectionKey]);
    const [result] = await pool.execute(`UPDATE pertanyaan_survey SET is_active = 0 WHERE section = ?`, [sectionKey]);

    return res.json({
      success: true,
      message: `Section '${sectionKey}' beserta ${result.affectedRows || 0} pertanyaannya berhasil dihapus.`,
      affectedRows: result.affectedRows || 0,
    });
  } catch (err) {
    console.error('[SURVEY] delete section error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus section.' });
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

    let sekolahId = sekolah_id ? parseInt(sekolah_id) : (req.user?.sekolah_id || null);
    let npsnVal = (npsn && typeof npsn === 'string' && npsn.length <= 20) ? npsn : null;

    // If sekolahId not provided, search by school name or NPSN
    if (!sekolahId && npsn) {
      const [spMatch] = await conn.execute(
        `SELECT id, npsn, kecamatan_id FROM satuan_pendidikan WHERE nama = ? OR npsn = ? LIMIT 1`,
        [npsn, npsn]
      );
      if (spMatch.length > 0) {
        sekolahId = spMatch[0].id;
        npsnVal = spMatch[0].npsn;
      }
    }

    if (!sekolahId) sekolahId = 1;

    let kabId = kabupaten_id ? parseInt(kabupaten_id) : (req.user?.kabupaten_id || 1);
    let kecId = kecamatan_id ? parseInt(kecamatan_id) : (req.user?.kecamatan_id || 1);

    if (sekolahId) {
      const [spRows] = await conn.execute(
        `SELECT sp.npsn, sp.kecamatan_id, k.kabupaten_id 
         FROM satuan_pendidikan sp 
         JOIN kecamatan k ON sp.kecamatan_id = k.id 
         WHERE sp.id = ? LIMIT 1`,
        [sekolahId]
      );
      if (spRows.length > 0) {
        npsnVal = spRows[0].npsn || npsnVal;
        kecId = spRows[0].kecamatan_id || kecId;
        kabId = spRows[0].kabupaten_id || kabId;
      }
    }

    // Sanitize ENUMs and length-sensitive columns
    let jk = 'L';
    if (jenis_kelamin === 'P' || (typeof jenis_kelamin === 'string' && jenis_kelamin.toLowerCase().startsWith('p'))) {
      jk = 'P';
    }

    let penMod = 'Ya';
    if (penerima_modul === 'Tidak' || (typeof penerima_modul === 'string' && penerima_modul.toLowerCase().includes('tidak'))) {
      penMod = 'Tidak';
    }

    let stImpl = 'sudah';
    if (status_implementasi === 'sebagian') stImpl = 'sebagian';
    else if (status_implementasi === 'belum') stImpl = 'belum';
    else if (typeof status_implementasi === 'string') {
      const sLower = status_implementasi.toLowerCase();
      if (sLower.includes('belum')) stImpl = 'belum';
      else if (sLower.includes('sebagian')) stImpl = 'sebagian';
    }

    const cleanNama = (nama || req.user?.nama || 'Responden Survei').substring(0, 200);
    const cleanPosisi = (posisi || req.user?.jabatan || 'Guru').substring(0, 100);
    const cleanNpsn = npsnVal ? String(npsnVal).substring(0, 20) : null;
    const cleanKelas = kelas_mengajar ? String(kelas_mengajar).substring(0, 50) : 'Semua Kelas';
    const cleanNoWa = no_wa ? String(no_wa).substring(0, 30) : null;

    // Insert responden
    const [respResult] = await conn.execute(`
      INSERT INTO responden_survey (
        nama, jenis_kelamin, posisi, sekolah_id, npsn,
        kabupaten_id, kecamatan_id, penerima_modul,
        penyelenggara_pelatihan, status_implementasi,
        kelas_mengajar, no_wa, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      cleanNama,
      jk,
      cleanPosisi,
      sekolahId,
      cleanNpsn,
      kabId,
      kecId,
      penMod,
      Array.isArray(penyelenggara_pelatihan) ? penyelenggara_pelatihan.join(', ') : (penyelenggara_pelatihan || 'Dinas Pendidikan'),
      stImpl,
      cleanKelas,
      cleanNoWa
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

    // Update status_pengisian pada sekolah sasaran
    if (sekolahId) {
      await conn.execute(`
        UPDATE satuan_pendidikan
        SET status_pengisian = 'sudah', last_updated = NOW()
        WHERE id = ?
      `, [sekolahId]);
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

// ─── POST /api/survey/draft (Update status_pengisian to 'sebagian' on draft save) ──
router.post('/draft', async (req, res) => {
  try {
    const { sekolah_id } = req.body;
    const sekolahId = sekolah_id ? parseInt(sekolah_id) : (req.user?.sekolah_id || null);

    if (sekolahId) {
      await pool.execute(`
        UPDATE satuan_pendidikan
        SET status_pengisian = CASE WHEN status_pengisian = 'sudah' THEN 'sudah' ELSE 'sebagian' END,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [sekolahId]);
    }

    return res.json({ success: true, message: 'Draft tersimpan. Status pengisian sekolah menjadi sebagian mengisi.' });
  } catch (err) {
    console.error('[SURVEY] draft update error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status draft.' });
  }
});

module.exports = router;
