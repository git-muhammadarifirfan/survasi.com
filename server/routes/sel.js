'use strict';
/**
 * @file routes/sel.js
 * @description Observasi SEL API endpoints
 *
 * GET  /api/sel/indikator          → master indikator SEL + dimensi
 * POST /api/sel/indikator          → tambah indikator (admin)
 * PUT  /api/sel/indikator/:id      → edit indikator (admin)
 * DEL  /api/sel/indikator/:id      → hapus indikator (admin)
 * POST /api/sel/sesi               → submit sesi observasi baru
 * GET  /api/sel/sesi               → list sesi observasi
 * GET  /api/sel/analisis/heatmap   → heatmap skor per kecamatan per dimensi
 * GET  /api/sel/analisis/radar/:sekolahId → radar benchmarking sekolah vs kecamatan
 * GET  /api/sel/analisis/summary   → KPI: total sesi, rata guru/murid, butuh intervensi
 * GET  /api/sel/analisis/matriks   → matriks SEL vs kuesioner score
 */

const router = require('express').Router();
const pool   = require('../db/pool');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { submitLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

// ─── GET /api/sel/indikator ───────────────────────────────────────────────────
router.get('/indikator', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        si.id, si.kode, si.teks, si.subjek, si.konteks, si.catatan,
        sd.id AS dimensi_id, sd.kode AS dimensi_kode,
        sd.nama AS dimensi_nama, sd.modul_bsan_kode,
        si.urutan, si.is_active
      FROM sel_indikator si
      JOIN sel_dimensi sd ON si.dimensi_id = sd.id
      WHERE si.is_active = 1
      ORDER BY sd.urutan, si.urutan
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/sel/indikator ─────────────────────────────────────────────────
router.post('/indikator', adminOnly, async (req, res) => {
  try {
    const { kode, deskripsi, teks, subjek, konteks, catatan, dimensi_id, urutan } = req.body;
    const teksVal = deskripsi || teks;
    const [result] = await pool.execute(
      `INSERT INTO sel_indikator (kode, teks, subjek, konteks, catatan, dimensi_id, urutan) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [kode, teksVal, subjek, konteks || 'kelas', catatan || null, dimensi_id, urutan || 0]
    );
    return res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('[SEL] add indikator error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/sel/indikator/:id ──────────────────────────────────────────────
router.put('/indikator/:id', adminOnly, async (req, res) => {
  try {
    const { kode, deskripsi, teks, subjek, konteks, catatan, dimensi_id, urutan, is_active } = req.body;
    const teksVal = deskripsi || teks;
    await pool.execute(
      `UPDATE sel_indikator SET kode=?, teks=?, subjek=?, konteks=?, catatan=?, dimensi_id=?, urutan=?, is_active=? WHERE id=?`,
      [kode, teksVal, subjek, konteks || 'kelas', catatan || null, dimensi_id, urutan || 0, is_active !== undefined ? is_active : 1, req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/sel/indikator/:id ───────────────────────────────────────────
router.delete('/indikator/:id', adminOnly, async (req, res) => {
  try {
    // Soft delete: set is_active = 0
    await pool.execute(`UPDATE sel_indikator SET is_active = 0 WHERE id = ?`, [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/sel/sesi ───────────────────────────────────────────────────────
router.post('/sesi', submitLimiter, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      sekolah_id, tanggal_observasi, observer_nama,
      lokasi_diamati, waktu_pengamatan,
      jumlah_siswa_l, jumlah_siswa_p,
      siswa_disabilitas_l, siswa_disabilitas_p,
      jangkauan_siswa, kelas_diamati,
      nama_guru_inisial, jenis_kelamin_guru,
      mata_pelajaran, jawaban,
    } = req.body;

    // Insert sesi
    const [sesiResult] = await conn.execute(`
      INSERT INTO sel_sesi_observasi (
        sekolah_id, observer_id, tanggal_observasi, observer_nama,
        lokasi_diamati, waktu_pengamatan,
        jumlah_siswa_l, jumlah_siswa_p,
        siswa_disabilitas_l, siswa_disabilitas_p,
        jangkauan_siswa, kelas_diamati,
        nama_guru_inisial, jenis_kelamin_guru, mata_pelajaran,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
    `, [
      sekolah_id, req.user.id, tanggal_observasi, observer_nama,
      JSON.stringify(lokasi_diamati), JSON.stringify(waktu_pengamatan),
      jumlah_siswa_l, jumlah_siswa_p,
      siswa_disabilitas_l || 0, siswa_disabilitas_p || 0,
      jangkauan_siswa, kelas_diamati,
      nama_guru_inisial, jenis_kelamin_guru, mata_pelajaran,
    ]);

    const sesiId = sesiResult.insertId;

    // Insert jawaban (batch)
    if (jawaban && jawaban.length > 0) {
      const values = jawaban.map(j => [sesiId, j.indikator_id, j.skor, j.catatan || null]);
      await conn.query(
        `INSERT INTO sel_jawaban_observasi (sesi_id, indikator_id, skor, catatan) VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return res.status(201).json({ success: true, sesi_id: sesiId });
  } catch (err) {
    await conn.rollback();
    console.error('[SEL] submit sesi error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan sesi observasi.' });
  } finally {
    conn.release();
  }
});

// ─── GET /api/sel/sesi ────────────────────────────────────────────────────────
router.get('/sesi', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    let extraWhere = '';
    const extraParams = [];
    if (req.user.role === 'pengawas' && req.user.sekolah_id) {
      extraWhere = ' AND sso.sekolah_id = ?';
      extraParams.push(req.user.sekolah_id);
    }

    const [rows] = await pool.execute(`
      SELECT
        sso.id, sso.tanggal_observasi, sso.observer_nama, sso.status,
        sso.kelas_diamati, sso.mata_pelajaran, sso.jangkauan_siswa,
        sp.nama AS sekolah_nama, sp.npsn,
        k.nama  AS kecamatan,
        kb.nama AS kabupaten
      FROM sel_sesi_observasi sso
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE (? IS NULL OR kb.id = ?)
        ${extraWhere}
      ORDER BY sso.tanggal_observasi DESC
      LIMIT 200
    `, [kabupatenId, kabupatenId, ...extraParams]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sel/analisis/heatmap ───────────────────────────────────────────
router.get('/analisis/heatmap', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        k.nama AS kecamatan, kb.nama AS kabupaten,
        COUNT(DISTINCT sso.id) AS jumlah_sesi,
        ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_diri'      THEN sjo.skor END), 2) AS kesadaran_diri,
        ROUND(AVG(CASE WHEN sd.kode = 'regulasi_emosi'      THEN sjo.skor END), 2) AS regulasi_emosi,
        ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_sosial'    THEN sjo.skor END), 2) AS kesadaran_sosial,
        ROUND(AVG(CASE WHEN sd.kode = 'keterampilan_relasi' THEN sjo.skor END), 2) AS keterampilan_relasi,
        ROUND(AVG(CASE WHEN sd.kode = 'tanggung_jawab'      THEN sjo.skor END), 2) AS tanggung_jawab,
        ROUND(AVG(sjo.skor), 2) AS rata_rata
      FROM sel_sesi_observasi sso
      JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      JOIN sel_dimensi sd ON si.dimensi_id = sd.id
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sjo.skor IS NOT NULL
        AND (? IS NULL OR kb.id = ?)
      GROUP BY k.id, k.nama, kb.nama
      ORDER BY rata_rata DESC
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[SEL] heatmap error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sel/analisis/radar/:sekolahId ──────────────────────────────────
router.get('/analisis/radar/:sekolahId', async (req, res) => {
  try {
    const sekolahId = parseInt(req.params.sekolahId);

    const [rows] = await pool.execute(`
      SELECT
        sd.nama AS dimensi,
        ROUND(AVG(CASE WHEN sso.sekolah_id = ? THEN sjo.skor END), 2) AS skor_sekolah,
        ROUND(AVG(sjo.skor), 2) AS skor_kecamatan_avg
      FROM sel_jawaban_observasi sjo
      JOIN sel_sesi_observasi sso ON sjo.sesi_id = sso.id
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      JOIN sel_dimensi sd ON si.dimensi_id = sd.id
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      WHERE sjo.skor IS NOT NULL
        AND sp.kecamatan_id = (SELECT kecamatan_id FROM satuan_pendidikan WHERE id = ?)
      GROUP BY sd.id, sd.nama
      ORDER BY sd.urutan
    `, [sekolahId, sekolahId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sel/analisis/summary ───────────────────────────────────────────
router.get('/analisis/summary', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(DISTINCT sso.id) AS total_sesi,
        ROUND(AVG(CASE WHEN si.subjek = 'guru'  THEN sjo.skor END), 2) AS rata_guru,
        ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS rata_murid,
        (SELECT COUNT(DISTINCT sub_sso.sekolah_id)
          FROM sel_sesi_observasi sub_sso
          JOIN sel_jawaban_observasi sub_sjo ON sub_sjo.sesi_id = sub_sso.id
          WHERE sub_sjo.skor IS NOT NULL
          GROUP BY sub_sso.sekolah_id
          HAVING AVG(sub_sjo.skor) < 2.5
        ) AS butuh_intervensi
      FROM sel_sesi_observasi sso
      JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      WHERE sjo.skor IS NOT NULL
    `);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sel/analisis/matriks ───────────────────────────────────────────
router.get('/analisis/matriks', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        sp.id AS sekolah_id, sp.nama AS sekolah,
        k.nama AS kecamatan, sp.status_pengisian,
        ROUND(AVG(sjo.skor), 2) AS sel_score,
        ROUND(AVG(CASE WHEN si.subjek = 'guru'  THEN sjo.skor END), 2) AS guru_score,
        ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS murid_score
      FROM sel_sesi_observasi sso
      JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      WHERE sjo.skor IS NOT NULL
        AND (? IS NULL OR k.kabupaten_id = ?)
      GROUP BY sp.id, sp.nama, k.nama, sp.status_pengisian
      ORDER BY sel_score DESC
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
