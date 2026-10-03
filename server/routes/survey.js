'use strict';
/**
 * @file routes/survey.js
 * @description Kuesioner BSAN survey API endpoints
 *
 * GET  /api/survey/questions → Get all 37 survey questions from DB
 * GET  /api/survey/my-status → Status pengisian sekolah milik akun login
 * POST /api/survey/submit    → Submit survey answers
 * POST /api/survey/draft     → Tandai sekolah sedang PROSES mengisi
 */

const router = require('express').Router();
const pool   = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const { submitLimiter } = require('../middleware/rateLimiter');
const {
  loadRoleMap, buildRoleMap, parseOptions,
  toPenerimaModul, toStatusImplementasi, toJenisKelamin,
} = require('../utils/surveyRoles');

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

    // Parse JSON options + lampirkan peran semantik (nama/sekolah/kabupaten/kecamatan, dst.)
    const { roleById } = buildRoleMap(rows);
    const formatted = rows.map(q => ({
      ...q,
      opsi_jawaban: parseOptions(q.opsi_jawaban),
      role: roleById[q.id] || null,
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

// ─── Helpers: identitas sekolah dari akun ─────────────────────────────────────
async function loadSchoolIdentity(conn, sekolahId) {
  if (!sekolahId) return null;
  const [rows] = await conn.execute(`
    SELECT sp.id, sp.npsn, sp.nama, sp.kecamatan_id, k.nama AS kecamatan,
           k.kabupaten_id, kb.nama AS kabupaten
    FROM satuan_pendidikan sp
    JOIN kecamatan k ON sp.kecamatan_id = k.id
    JOIN kabupaten kb ON k.kabupaten_id = kb.id
    WHERE sp.id = ? AND sp.deleted_at IS NULL
    LIMIT 1
  `, [sekolahId]);
  return rows[0] || null;
}

// ─── GET /api/survey/my-status (status pengisian sekolah milik akun) ─────────
router.get('/my-status', async (req, res) => {
  try {
    const sekolahId = req.user?.sekolah_id || null;
    if (!sekolahId) return res.json({ success: true, data: null });

    const school = await loadSchoolIdentity(pool, sekolahId);
    const [[st]] = await pool.execute(
      `SELECT status_pengisian, last_updated FROM satuan_pendidikan WHERE id = ?`, [sekolahId]
    );
    const [respRows] = await pool.execute(`
      SELECT id, nama, posisi, jenis_kelamin, submitted_at
      FROM responden_survey
      WHERE sekolah_id = ? AND deleted_at IS NULL
      ORDER BY submitted_at DESC, id DESC
    `, [sekolahId]);

    return res.json({
      success: true,
      data: {
        sekolah: school,
        status_pengisian: st?.status_pengisian || 'belum',
        last_updated: st?.last_updated || null,
        total_responden: respRows.length,
        responden: respRows,
      },
    });
  } catch (err) {
    console.error('[SURVEY] my-status error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat status pengisian.' });
  }
});

// ─── POST /api/survey/submit ─────────────────────────────────────────────────
router.post('/submit', submitLimiter, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { jawaban } = req.body || {};
    if (!Array.isArray(jawaban) || jawaban.length === 0) {
      return res.status(400).json({ success: false, message: 'Jawaban survei kosong.' });
    }

    // 1. Sekolah: akun sekolah SELALU memakai sekolah yang terdaftar di akunnya.
    //    Admin (mode simulasi) boleh mengirim sekolah_id eksplisit.
    const sekolahId = req.user?.role === 'sekolah'
      ? (req.user.sekolah_id || null)
      : (req.body.sekolah_id ? parseInt(req.body.sekolah_id, 10) : (req.user?.sekolah_id || null));
    const school = await loadSchoolIdentity(conn, sekolahId);
    if (!school) {
      return res.status(400).json({
        success: false,
        message: 'Akun Anda belum terhubung dengan sekolah yang valid. Hubungi admin untuk menautkan sekolah.',
      });
    }

    // 2. Petakan jawaban ke peran semantik pertanyaan
    const { questions, roleById } = await loadRoleMap(conn);
    const qById = new Map(questions.map(q => [q.id, q]));

    const answerByRole = {};
    const cleanAnswers = [];
    for (const j of jawaban) {
      const pId = parseInt(j.pertanyaan_id, 10);
      const q = qById.get(pId);
      if (!q || cleanAnswers.some(a => a[0] === pId)) continue;

      const role = roleById[pId];
      let value = j.value;

      // Identitas sekolah/wilayah dipaksa dari data akun (tidak bisa dimanipulasi form)
      if (role === 'sekolah') value = school.nama;
      if (role === 'kabupaten') {
        const opts = parseOptions(q.opsi_jawaban);
        const bare = school.kabupaten.replace(/^(kab\.?|kabupaten|kota)\s+/i, '').trim();
        value = opts.find(o => o.toLowerCase() === bare.toLowerCase()) || school.kabupaten;
      }
      if (role === 'kecamatan') value = school.kecamatan;

      let multiVal = null;
      let terstrukturVal = null;
      let bebasVal = null;
      if (Array.isArray(value)) {
        const arr = value.map(v => String(v).trim()).filter(Boolean);
        if (arr.length === 0) continue;
        multiVal = JSON.stringify(arr);
      } else if (value !== undefined && value !== null && String(value).trim() !== '') {
        const str = String(value).trim();
        if (q.tipe === 'text') bebasVal = str;
        else terstrukturVal = str;
      } else {
        continue; // jawaban kosong tidak disimpan
      }

      cleanAnswers.push([pId, terstrukturVal, bebasVal, multiVal]);
      if (role) answerByRole[role] = Array.isArray(value) ? value : String(value).trim();
    }

    // Pastikan pertanyaan identitas sekolah & wilayah tetap tercatat walau tidak dikirim form
    const { byRole: activeByRole } = buildRoleMap(questions.filter(q => q.is_active));
    const forced = { sekolah: school.nama, kecamatan: school.kecamatan };
    for (const [role, val] of Object.entries(forced)) {
      const q = activeByRole[role];
      if (q && !cleanAnswers.some(a => a[0] === q.id)) {
        cleanAnswers.push([q.id, val, null, null]);
      }
    }

    // 3. Ringkasan responden diturunkan dari jawaban per-peran (bukan dari index form)
    const namaVal = String(answerByRole.nama || req.user?.nama || '').trim();
    if (!namaVal) {
      return res.status(400).json({ success: false, message: 'Nama responden wajib diisi.' });
    }
    const jk = toJenisKelamin(answerByRole.jenis_kelamin) || 'L';
    const posisi = String(answerByRole.posisi || req.user?.jabatan || 'Guru').substring(0, 100);
    const penerima = toPenerimaModul(answerByRole.penerima_modul) || 'Tidak';
    const penyelenggaraRaw = answerByRole.penyelenggara;
    const penyelenggara = Array.isArray(penyelenggaraRaw)
      ? penyelenggaraRaw.join(', ')
      : (penyelenggaraRaw ? String(penyelenggaraRaw) : null);
    // Status implementasi hanya bermakna jika sudah menerima modul
    const statusImpl = penerima === 'Ya' ? toStatusImplementasi(answerByRole.status_implementasi) : null;
    const kelas = answerByRole.kelas_mengajar ? String(answerByRole.kelas_mengajar).substring(0, 50) : null;
    const noWa = answerByRole.no_wa ? (String(answerByRole.no_wa).replace(/[^\d+]/g, '').substring(0, 20) || null) : null;

    await conn.beginTransaction();

    const [respResult] = await conn.execute(`
      INSERT INTO responden_survey (
        nama, jenis_kelamin, posisi, sekolah_id, npsn,
        kabupaten_id, kecamatan_id, penerima_modul,
        penyelenggara_pelatihan, status_implementasi,
        kelas_mengajar, no_wa, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      namaVal.substring(0, 200), jk, posisi, school.id, school.npsn,
      school.kabupaten_id, school.kecamatan_id, penerima,
      penyelenggara, statusImpl, kelas, noWa,
    ]);
    const respondenId = respResult.insertId;

    if (cleanAnswers.length > 0) {
      await conn.query(
        `INSERT INTO jawaban_survey (responden_id, pertanyaan_id, jawaban_terstruktur, jawaban_bebas, jawaban_multi) VALUES ?`,
        [cleanAnswers.map(a => [respondenId, ...a])]
      );
    }

    // Status pengisian sekolah → 'sudah' (selesai mengirim)
    await conn.execute(
      `UPDATE satuan_pendidikan SET status_pengisian = 'sudah', last_updated = NOW() WHERE id = ?`,
      [school.id]
    );

    await conn.execute(
      `INSERT INTO activity_log (user_id, aksi, target_tabel, target_id, detail) VALUES (?, 'submit_survey', 'responden_survey', ?, ?)`,
      [req.user?.id || null, respondenId, JSON.stringify({ sekolah_id: school.id, nama: namaVal })]
    ).catch(() => {});

    await conn.commit();
    return res.status(201).json({ success: true, responden_id: respondenId, message: 'Survei berhasil disimpan.' });
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error('[SURVEY] submit error:', err);
    return res.status(500).json({ success: false, message: `Gagal mengirim survei: ${err.message || 'Error internal server'}` });
  } finally {
    conn.release();
  }
});

// ─── POST /api/survey/draft ──────────────────────────────────────────────────
// Dipanggil saat pengguna mulai/sedang mengisi. Sekolah berstatus 'belum'
// berubah menjadi 'sebagian' (= PROSES mengisi). Status 'sudah' tidak diturunkan.
router.post('/draft', async (req, res) => {
  try {
    const sekolahId = req.user?.role === 'sekolah'
      ? (req.user.sekolah_id || null)
      : (req.body?.sekolah_id ? parseInt(req.body.sekolah_id, 10) : null);

    if (!sekolahId) return res.json({ success: true, updated: false });

    const [result] = await pool.execute(`
      UPDATE satuan_pendidikan
      SET status_pengisian = 'sebagian', last_updated = CURRENT_TIMESTAMP
      WHERE id = ? AND status_pengisian = 'belum'
    `, [sekolahId]);

    // Perbarui jejak waktu aktivitas agar status "proses" terlihat realtime
    if (result.affectedRows === 0) {
      await pool.execute(
        `UPDATE satuan_pendidikan SET last_updated = CURRENT_TIMESTAMP WHERE id = ? AND status_pengisian = 'sebagian'`,
        [sekolahId]
      );
    }

    return res.json({ success: true, updated: result.affectedRows > 0 });
  } catch (err) {
    console.error('[SURVEY] draft update error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status draft.' });
  }
});

module.exports = router;
