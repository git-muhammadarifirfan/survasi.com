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

// ─── GET /api/sel/konteks (Fetch options per kategori or all) ─────────────────
router.get('/konteks', async (req, res) => {
  try {
    const { kategori, all } = req.query;
    let sql = `SELECT * FROM sel_konteks_options WHERE 1=1`;
    const params = [];

    if (all !== 'true') {
      sql += ` AND is_active = 1`;
    }
    if (kategori) {
      sql += ` AND kategori = ?`;
      params.push(kategori);
    }
    sql += ` ORDER BY kategori, urutan ASC`;

    const [rows] = await pool.execute(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[SEL] fetch konteks options error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/sel/konteks (Admin: Tambah Opsi Konteks) ──────────────────────
router.post('/konteks', adminOnly, async (req, res) => {
  try {
    const { kategori, label, value_code, urutan } = req.body;
    if (!kategori || !label) {
      return res.status(400).json({ success: false, message: 'Kategori dan label wajib diisi.' });
    }
    const valCode = value_code || label;
    const [result] = await pool.execute(
      `INSERT INTO sel_konteks_options (kategori, label, value_code, urutan, is_active) VALUES (?, ?, ?, ?, 1)`,
      [kategori, label, valCode, urutan || 99]
    );
    return res.status(201).json({ success: true, message: 'Opsi konteks berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    console.error('[SEL] add konteks error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/sel/konteks/:id (Admin: Edit Opsi Konteks) ──────────────────────
router.put('/konteks/:id', adminOnly, async (req, res) => {
  try {
    const { kategori, label, value_code, urutan, is_active } = req.body;
    await pool.execute(
      `UPDATE sel_konteks_options 
       SET kategori = COALESCE(?, kategori), 
           label = COALESCE(?, label), 
           value_code = COALESCE(?, value_code), 
           urutan = COALESCE(?, urutan), 
           is_active = COALESCE(?, is_active) 
       WHERE id = ?`,
      [
        kategori || null,
        label || null,
        value_code || null,
        urutan !== undefined ? urutan : null,
        is_active !== undefined ? is_active : null,
        req.params.id
      ]
    );
    return res.json({ success: true, message: 'Opsi konteks berhasil diperbarui.' });
  } catch (err) {
    console.error('[SEL] update konteks error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/sel/konteks/reorder (Admin: Reorder Opsi Konteks) ───────────────
router.put('/konteks/reorder', adminOnly, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { items } = req.body; // array of { id: number, urutan: number }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Format data reorder tidak valid.' });
    }

    await conn.beginTransaction();
    for (const item of items) {
      await conn.execute(
        `UPDATE sel_konteks_options SET urutan = ? WHERE id = ?`,
        [item.urutan, item.id]
      );
    }
    await conn.commit();
    return res.json({ success: true, message: 'Urutan opsi konteks berhasil disimpan.' });
  } catch (err) {
    await conn.rollback();
    console.error('[SEL] reorder konteks error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengubah urutan opsi konteks.' });
  } finally {
    conn.release();
  }
});

// ─── DELETE /api/sel/konteks/:id (Admin: Hapus Opsi Konteks) ──────────────────
router.delete('/konteks/:id', adminOnly, async (req, res) => {
  try {
    await pool.execute(`DELETE FROM sel_konteks_options WHERE id = ?`, [req.params.id]);
    return res.json({ success: true, message: 'Opsi konteks berhasil dihapus.' });
  } catch (err) {
    console.error('[SEL] delete konteks error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sel/dimensi (List all dimensions) ──────────────────────────────
router.get('/dimensi', async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM sel_dimensi ORDER BY urutan, id ASC`);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[SEL] fetch dimensi error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/sel/dimensi (Tambah Dimensi SEL Baru - Admin Only) ────────────
router.post('/dimensi', adminOnly, async (req, res) => {
  try {
    const { kode, nama, modul_bsan_kode, urutan } = req.body;
    if (!nama) {
      return res.status(400).json({ success: false, message: 'Nama dimensi wajib diisi.' });
    }
    const dimKode = kode || nama.toLowerCase().replace(/\s+/g, '_');
    const [result] = await pool.execute(
      `INSERT INTO sel_dimensi (kode, nama, modul_bsan_kode, urutan) VALUES (?, ?, ?, ?)`,
      [dimKode, nama, modul_bsan_kode || 'with_myself', urutan || 99]
    );
    return res.status(201).json({ success: true, message: 'Dimensi SEL berhasil disimpan.', id: result.insertId, kode: dimKode });
  } catch (err) {
    console.error('[SEL] add dimensi error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menambah dimensi SEL ke MySQL.' });
  }
});

// ─── POST /api/sel/indikator ─────────────────────────────────────────────────
router.post('/indikator', adminOnly, async (req, res) => {
  try {
    const { kode, deskripsi, teks, subjek, konteks, catatan, dimensi_id, urutan } = req.body;
    const teksVal = deskripsi || teks;
    const [result] = await pool.execute(
      `INSERT INTO sel_indikator (kode, teks, subjek, konteks, catatan, dimensi_id, urutan) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [kode, teksVal, subjek, konteks || 'kelas', catatan || null, dimensi_id || 1, urutan || 0]
    );
    return res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('[SEL] add indikator error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/sel/indikator/reorder ──────────────────────────────────────────
router.put('/indikator/reorder', adminOnly, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { items } = req.body; // array of { id: number | string, urutan: number }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Format data reorder tidak valid.' });
    }

    await conn.beginTransaction();
    for (const item of items) {
      await conn.execute(
        `UPDATE sel_indikator SET urutan = ? WHERE id = ?`,
        [item.urutan, item.id]
      );
    }
    await conn.commit();
    return res.json({ success: true, message: 'Urutan indikator SEL berhasil disimpan.' });
  } catch (err) {
    await conn.rollback();
    console.error('[SEL] reorder error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengubah urutan indikator.' });
  } finally {
    conn.release();
  }
});

// ─── PUT /api/sel/indikator/:id ──────────────────────────────────────────────
router.put('/indikator/:id', adminOnly, async (req, res) => {
  try {
    const { kode, deskripsi, teks, subjek, konteks, catatan, dimensi_id, urutan, is_active } = req.body;
    const teksVal = deskripsi || teks;
    await pool.execute(
      `UPDATE sel_indikator 
       SET kode = COALESCE(?, kode), 
           teks = COALESCE(?, teks), 
           subjek = COALESCE(?, subjek), 
           konteks = COALESCE(?, konteks), 
           catatan = ?, 
           dimensi_id = COALESCE(?, dimensi_id), 
           urutan = CASE WHEN ? IS NOT NULL AND ? > 0 THEN ? ELSE urutan END, 
           is_active = COALESCE(?, is_active) 
       WHERE id = ?`,
      [
        kode || null,
        teksVal || null,
        subjek || null,
        konteks || null,
        catatan || null,
        dimensi_id || null,
        urutan !== undefined ? urutan : null,
        urutan !== undefined ? urutan : null,
        urutan !== undefined ? urutan : null,
        is_active !== undefined ? is_active : null,
        req.params.id
      ]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('[SEL] update error:', err);
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
      sekolah_id, sekolah_nama, kecamatan, kabupaten, tanggal, tanggal_observasi, observer_nama,
      lokasi_diamati, waktu_pengamatan,
      jumlah_siswa_l, jumlah_siswa_p,
      siswa_disabilitas_l, siswa_disabilitas_p,
      jangkauan_siswa, kelas_diamati,
      guru_inisial, nama_guru_inisial,
      guru_jk, jenis_kelamin_guru,
      mata_pelajaran, jawaban,
    } = req.body;

    let sekolahId = sekolah_id ? parseInt(sekolah_id) : (req.user?.sekolah_id || null);

    if (!sekolahId && sekolah_nama) {
      const cleanSch = sekolah_nama.trim();
      const cleanKec = kecamatan ? kecamatan.replace(/^Kec\.\s*/i, '').trim() : '';
      const [schRows] = await conn.execute(`
        SELECT sp.id FROM satuan_pendidikan sp
        LEFT JOIN kecamatan k ON sp.kecamatan_id = k.id
        WHERE sp.nama LIKE ? OR (sp.nama LIKE ? AND k.nama LIKE ?)
        LIMIT 1
      `, [`%${cleanSch}%`, `%${cleanSch}%`, `%${cleanKec}%`]);

      if (schRows.length > 0) {
        sekolahId = schRows[0].id;
      } else {
        const [firstSch] = await conn.execute(`SELECT id FROM satuan_pendidikan ORDER BY id ASC LIMIT 1`);
        sekolahId = firstSch.length > 0 ? firstSch[0].id : 1;
      }
    }

    if (!sekolahId) sekolahId = 1;

    const tanggalVal = tanggal || tanggal_observasi || new Date().toISOString().slice(0, 10);
    const guruInisialVal = guru_inisial || nama_guru_inisial || 'GR';
    const guruJkVal = guru_jk || jenis_kelamin_guru || 'P';

    // Insert sesi
    const [sesiResult] = await conn.execute(`
      INSERT INTO sel_sesi_observasi (
        sekolah_id, observer_user_id, tanggal, observer_nama,
        lokasi_diamati, waktu_pengamatan,
        jumlah_siswa_l, jumlah_siswa_p,
        siswa_disabilitas_l, siswa_disabilitas_p,
        jangkauan_siswa, kelas_diamati,
        guru_inisial, guru_jk, mata_pelajaran,
        status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
    `, [
      sekolahId, req.user?.id || null, tanggalVal, observer_nama || req.user?.nama || 'Observer Pengawas',
      Array.isArray(lokasi_diamati) ? JSON.stringify(lokasi_diamati) : (lokasi_diamati ? JSON.stringify([lokasi_diamati]) : JSON.stringify(['Ruang Kelas'])),
      Array.isArray(waktu_pengamatan) ? JSON.stringify(waktu_pengamatan) : (waktu_pengamatan ? JSON.stringify([waktu_pengamatan]) : JSON.stringify(['Jam Pelajaran'])),
      jumlah_siswa_l || 0, jumlah_siswa_p || 0,
      siswa_disabilitas_l || 0, siswa_disabilitas_p || 0,
      jangkauan_siswa || 2, kelas_diamati || '4A',
      guruInisialVal, guruJkVal, mata_pelajaran || 'Tematik',
    ]);

    const sesiId = sesiResult.insertId;

    // Fetch active indikators to map kode/id
    let [indRows] = await conn.execute(`SELECT id, kode FROM sel_indikator`);
    if (indRows.length === 0) {
      const defaultInds = [
        ['ind_kd_1', 'Guru menunjukkan kesadaran emosi', 'guru', 'kelas', 1, 1],
        ['ind_re_1', 'Guru mengelola emosi', 'guru', 'kelas', 2, 1],
        ['ind_ks_1', 'Guru menunjukkan kepedulian', 'guru', 'kelas', 3, 1],
        ['ind_kr_1', 'Guru membangun komunikasi positif', 'guru', 'kelas', 4, 1],
        ['ind_tj_1', 'Guru mengambil keputusan bertanggung jawab', 'guru', 'kelas', 5, 1],
      ];
      for (const ind of defaultInds) {
        await conn.execute(`INSERT INTO sel_indikator (kode, teks, subjek, konteks, dimensi_id, urutan) VALUES (?, ?, ?, ?, ?, ?)`, ind);
      }
      const [reloaded] = await conn.execute(`SELECT id, kode FROM sel_indikator`);
      indRows = reloaded;
    }

    const kodeToIdMap = new Map();
    indRows.forEach(r => {
      if (r.kode) kodeToIdMap.set(String(r.kode).trim(), r.id);
      if (r.id) kodeToIdMap.set(String(r.id), r.id);
    });

    if (jawaban && Array.isArray(jawaban) && jawaban.length > 0) {
      const values = [];
      for (let idx = 0; idx < jawaban.length; idx++) {
        const j = jawaban[idx];
        const rawCode = j.indikator_kode || j.indikatorId || j.kode;
        const rawNumId = j.indikator_id;

        let resolvedId = null;
        if (rawCode && kodeToIdMap.has(String(rawCode).trim())) {
          resolvedId = kodeToIdMap.get(String(rawCode).trim());
        } else if (rawNumId && kodeToIdMap.has(String(rawNumId))) {
          resolvedId = kodeToIdMap.get(String(rawNumId));
        } else if (typeof rawNumId === 'number' && rawNumId > 0) {
          resolvedId = rawNumId;
        } else if (indRows[idx]) {
          resolvedId = indRows[idx].id;
        }

        if (resolvedId && j.skor !== null && j.skor !== undefined) {
          values.push([sesiId, resolvedId, j.skor, j.catatan || null]);
        }
      }
      if (values.length > 0) {
        await conn.query(
          `INSERT INTO sel_jawaban_observasi (sesi_id, indikator_id, skor, catatan) VALUES ?`,
          [values]
        );
      }
    }

    await conn.commit();
    return res.status(201).json({ success: true, sesi_id: sesiId, message: 'Sesi observasi SEL berhasil disimpan ke database MySQL!' });
  } catch (err) {
    await conn.rollback();
    console.error('[SEL] submit sesi error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan sesi observasi: ' + (err.message || 'Server Error') });
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
        sso.id, sso.sekolah_id, sso.tanggal, sso.observer_nama, sso.status,
        sso.lokasi_diamati, sso.waktu_pengamatan,
        sso.jumlah_siswa_l, sso.jumlah_siswa_p,
        sso.siswa_disabilitas_l, sso.siswa_disabilitas_p,
        sso.kelas_diamati, sso.guru_inisial, sso.guru_jk,
        sso.mata_pelajaran, sso.jangkauan_siswa,
        sp.nama AS sekolah_nama, sp.npsn,
        k.nama  AS kecamatan,
        kb.nama AS kabupaten
      FROM sel_sesi_observasi sso
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE (? IS NULL OR kb.id = ?)
        ${extraWhere}
      ORDER BY sso.tanggal DESC, sso.id DESC
      LIMIT 200
    `, [kabupatenId, kabupatenId, ...extraParams]);

    if (rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Fetch all answers for these sessions
    const sesiIds = rows.map(r => r.id);
    const [jawabanRows] = await pool.query(`
      SELECT sjo.sesi_id, sjo.indikator_id, si.kode AS indikator_kode, si.teks AS indikator_teks, sjo.skor, sjo.catatan
      FROM sel_jawaban_observasi sjo
      LEFT JOIN sel_indikator si ON sjo.indikator_id = si.id
      WHERE sjo.sesi_id IN (?)
    `, [sesiIds]);

    const jawabanBySesi = {};
    for (const j of jawabanRows) {
      if (!jawabanBySesi[j.sesi_id]) jawabanBySesi[j.sesi_id] = [];
      jawabanBySesi[j.sesi_id].push({
        indikatorId: j.indikator_kode || String(j.indikator_id),
        indikator_id: j.indikator_id,
        indikator_kode: j.indikator_kode,
        indikator_teks: j.indikator_teks,
        skor: j.skor,
        catatan: j.catatan,
      });
    }

    const data = rows.map(r => ({
      ...r,
      jawaban: jawabanBySesi[r.id] || [],
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('[SEL] fetch sesi list error:', err);
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
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        COUNT(DISTINCT sso.id) AS total_sesi,
        COUNT(DISTINCT sso.sekolah_id) AS total_sekolah,
        ROUND(AVG(CASE WHEN si.subjek = 'guru'  THEN sjo.skor END), 2) AS rata_guru,
        ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS rata_murid,
        COALESCE((
          SELECT COUNT(DISTINCT sub_sso.sekolah_id)
          FROM sel_sesi_observasi sub_sso
          JOIN sel_jawaban_observasi sub_sjo ON sub_sjo.sesi_id = sub_sso.id
          JOIN satuan_pendidikan sub_sp ON sub_sso.sekolah_id = sub_sp.id
          JOIN kecamatan sub_k ON sub_sp.kecamatan_id = sub_k.id
          WHERE sub_sjo.skor IS NOT NULL
            AND (? IS NULL OR sub_k.kabupaten_id = ?)
          GROUP BY sub_sso.sekolah_id
          HAVING AVG(sub_sjo.skor) < 2.5
        ), 0) AS butuh_intervensi
      FROM sel_sesi_observasi sso
      JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      WHERE sjo.skor IS NOT NULL
        AND (? IS NULL OR k.kabupaten_id = ?)
    `, [kabupatenId, kabupatenId, kabupatenId, kabupatenId]);

    const result = rows[0] || {};
    return res.json({
      success: true,
      data: {
        total_sesi: result.total_sesi || 0,
        total_sekolah: result.total_sekolah || 0,
        rata_guru: parseFloat(result.rata_guru || '0'),
        rata_murid: parseFloat(result.rata_murid || '0'),
        butuh_intervensi: result.butuh_intervensi || 0,
      }
    });
  } catch (err) {
    console.error('[SEL] summary error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sel/analisis/matriks ───────────────────────────────────────────
router.get('/analisis/matriks', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        sp.id AS sekolah_id,
        sp.nama AS sekolah,
        k.nama AS kecamatan,
        kb.nama AS kabupaten,
        sp.status_pengisian,
        ROUND(AVG(sjo.skor), 2) AS sel_score,
        ROUND(AVG(CASE WHEN si.subjek = 'guru'  THEN sjo.skor END), 2) AS guru_score,
        ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS murid_score,
        COALESCE(
          (SELECT ROUND(
            COUNT(CASE WHEN js.jawaban_terstruktur LIKE 'Ya%' OR js.jawaban_terstruktur LIKE 'Sudah%' OR js.jawaban_terstruktur LIKE 'Lebih%' OR js.jawaban_terstruktur LIKE 'Sangat%' OR js.jawaban_terstruktur LIKE 'Lengkap%' OR js.jawaban_terstruktur LIKE 'Rutin%' THEN 1 END) / COUNT(*) * 100
           , 0)
           FROM jawaban_survey js
           JOIN responden_survey rs ON js.responden_id = rs.id
           WHERE rs.sekolah_id = sp.id
          ),
          CASE WHEN sp.status_pengisian = 'sudah' THEN 85 WHEN sp.status_pengisian = 'sebagian' THEN 55 ELSE 25 END
        ) AS kuisioner_score
      FROM sel_sesi_observasi sso
      JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sjo.skor IS NOT NULL
        AND (? IS NULL OR kb.id = ?)
      GROUP BY sp.id, sp.nama, k.nama, kb.nama, sp.status_pengisian
      ORDER BY sel_score DESC
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[SEL] matriks error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sel/analisis/scores (Per school scores list for SEL) ───────────
router.get('/analisis/scores', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        sp.id AS sekolah_id,
        sp.nama AS sekolah_nama,
        k.nama AS kecamatan,
        kb.nama AS kabupaten,
        DATE_FORMAT(MAX(sso.tanggal), '%d %b %Y') AS tanggal,
        ROUND(AVG(CASE WHEN si.subjek = 'guru' THEN sjo.skor END), 2) AS guru_total,
        ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS murid_total,
        ROUND(AVG(sjo.skor), 2) AS total_rata,

        -- Kesadaran Diri
        ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_diri' AND si.subjek = 'guru' THEN sjo.skor END), 2) AS kd_guru,
        ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_diri' AND si.subjek = 'murid' THEN sjo.skor END), 2) AS kd_murid,
        ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_diri' THEN sjo.skor END), 2) AS kd_rata,

        -- Regulasi Emosi
        ROUND(AVG(CASE WHEN sd.kode = 'regulasi_emosi' AND si.subjek = 'guru' THEN sjo.skor END), 2) AS re_guru,
        ROUND(AVG(CASE WHEN sd.kode = 'regulasi_emosi' AND si.subjek = 'murid' THEN sjo.skor END), 2) AS re_murid,
        ROUND(AVG(CASE WHEN sd.kode = 'regulasi_emosi' THEN sjo.skor END), 2) AS re_rata,

        -- Kesadaran Sosial
        ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_sosial' AND si.subjek = 'guru' THEN sjo.skor END), 2) AS ks_guru,
        ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_sosial' AND si.subjek = 'murid' THEN sjo.skor END), 2) AS ks_murid,
        ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_sosial' THEN sjo.skor END), 2) AS ks_rata,

        -- Keterampilan Relasi
        ROUND(AVG(CASE WHEN sd.kode = 'keterampilan_relasi' AND si.subjek = 'guru' THEN sjo.skor END), 2) AS kr_guru,
        ROUND(AVG(CASE WHEN sd.kode = 'keterampilan_relasi' AND si.subjek = 'murid' THEN sjo.skor END), 2) AS kr_murid,
        ROUND(AVG(CASE WHEN sd.kode = 'keterampilan_relasi' THEN sjo.skor END), 2) AS kr_rata,

        -- Tanggung Jawab
        ROUND(AVG(CASE WHEN sd.kode = 'tanggung_jawab' AND si.subjek = 'guru' THEN sjo.skor END), 2) AS tj_guru,
        ROUND(AVG(CASE WHEN sd.kode = 'tanggung_jawab' AND si.subjek = 'murid' THEN sjo.skor END), 2) AS tj_murid,
        ROUND(AVG(CASE WHEN sd.kode = 'tanggung_jawab' THEN sjo.skor END), 2) AS tj_rata,

        -- Kuisioner Score calculation
        COALESCE(
          (SELECT ROUND(
            COUNT(CASE WHEN js.jawaban_terstruktur LIKE 'Ya%' OR js.jawaban_terstruktur LIKE 'Sudah%' OR js.jawaban_terstruktur LIKE 'Lebih%' OR js.jawaban_terstruktur LIKE 'Sangat%' OR js.jawaban_terstruktur LIKE 'Lengkap%' OR js.jawaban_terstruktur LIKE 'Rutin%' THEN 1 END) / COUNT(*) * 100
           , 0)
           FROM jawaban_survey js
           JOIN responden_survey rs ON js.responden_id = rs.id
           WHERE rs.sekolah_id = sp.id
          ),
          CASE WHEN sp.status_pengisian = 'sudah' THEN 85 WHEN sp.status_pengisian = 'sebagian' THEN 55 ELSE 25 END
        ) AS kuisioner_score

      FROM sel_sesi_observasi sso
      JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      JOIN sel_dimensi sd ON si.dimensi_id = sd.id
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sjo.skor IS NOT NULL
        AND (? IS NULL OR kb.id = ?)
      GROUP BY sp.id, sp.nama, k.nama, kb.nama, sp.status_pengisian
      ORDER BY total_rata DESC
    `, [kabupatenId, kabupatenId]);

    const formatted = rows.map(r => ({
      sekolahId: String(r.sekolah_id),
      sekolahNama: r.sekolah_nama,
      kecamatan: r.kecamatan,
      kabupaten: r.kabupaten,
      tanggal: r.tanggal || '12 Sep 2026',
      guruTotal: parseFloat(r.guru_total || '0'),
      muridTotal: parseFloat(r.murid_total || '0'),
      totalRata: parseFloat(r.total_rata || '0'),
      kuisionerScore: parseInt(r.kuisioner_score || '65'),
      dimensi: [
        {
          dimensi: 'kesadaran_diri',
          label: 'Kesadaran Diri',
          guruSkor: parseFloat(r.kd_guru || r.guru_total || '0'),
          muridSkor: parseFloat(r.kd_murid || r.murid_total || '0'),
          rataRata: parseFloat(r.kd_rata || r.total_rata || '0'),
        },
        {
          dimensi: 'regulasi_emosi',
          label: 'Regulasi Emosi',
          guruSkor: parseFloat(r.re_guru || r.guru_total || '0'),
          muridSkor: parseFloat(r.re_murid || r.murid_total || '0'),
          rataRata: parseFloat(r.re_rata || r.total_rata || '0'),
        },
        {
          dimensi: 'kesadaran_sosial',
          label: 'Kesadaran Sosial',
          guruSkor: parseFloat(r.ks_guru || r.guru_total || '0'),
          muridSkor: parseFloat(r.ks_murid || r.murid_total || '0'),
          rataRata: parseFloat(r.ks_rata || r.total_rata || '0'),
        },
        {
          dimensi: 'keterampilan_relasi',
          label: 'Keterampilan Relasi',
          guruSkor: parseFloat(r.kr_guru || r.guru_total || '0'),
          muridSkor: parseFloat(r.kr_murid || r.murid_total || '0'),
          rataRata: parseFloat(r.kr_rata || r.total_rata || '0'),
        },
        {
          dimensi: 'tanggung_jawab',
          label: 'Tanggung Jawab',
          guruSkor: parseFloat(r.tj_guru || r.guru_total || '0'),
          muridSkor: parseFloat(r.tj_murid || r.murid_total || '0'),
          rataRata: parseFloat(r.tj_rata || r.total_rata || '0'),
        },
      ]
    }));

    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[SEL] scores error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
