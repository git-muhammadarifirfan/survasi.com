'use strict';
/**
 * @file routes/analisis.js
 * @description Analisis API endpoints (semua halaman chart/analitik)
 *
 * GET /api/analisis/modul-progress   → Modul BSAN ring chart (base_rate + impl_rate + SEL score)
 * GET /api/analisis/modul-detail     → Detail dimensi SEL per modul
 * GET /api/analisis/proporsi         → Proporsi penerima modul (pie, stacked bar, dll)
 * GET /api/analisis/funnel           → Gap Funnel 5 tahap
 * GET /api/analisis/matriks          → Matriks 4 kuadran per kecamatan
 * GET /api/analisis/tantangan        → Top tantangan implementasi
 * GET /api/analisis/timeseries       → Trend pengisian (time series)
 */

const router = require('express').Router();
const pool   = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ─── GET /api/analisis/modul-progress ────────────────────────────────────────
router.get('/modul-progress', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    // Base rate & impl rate
    const [rateRows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_responden,
        ROUND(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS base_rate,
        ROUND(
          (SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) +
           SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 0.5 ELSE 0 END))
          / COUNT(*) * 100, 1
        ) AS impl_rate,
        SUM(CASE WHEN rs.status_implementasi IN ('sudah','sebagian') THEN 1 ELSE 0 END) AS sudah_mengisi
      FROM responden_survey rs
      JOIN kabupaten kb ON rs.kabupaten_id = kb.id
      WHERE (? IS NULL OR kb.id = ?)
    `, [kabupatenId, kabupatenId]);

    // SEL score per modul
    const [selRows] = await pool.execute(`
      SELECT
        sd.modul_bsan_kode AS modul_kode,
        mb.nama AS modul_nama,
        mb.urutan,
        ROUND(AVG(sjo.skor) / 4 * 100, 1) AS sel_score_persen
      FROM sel_jawaban_observasi sjo
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      JOIN sel_dimensi sd ON si.dimensi_id = sd.id
      JOIN modul_bsan mb ON mb.kode = sd.modul_bsan_kode
      JOIN sel_sesi_observasi sso ON sjo.sesi_id = sso.id
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      WHERE sjo.skor IS NOT NULL
        AND (? IS NULL OR k.kabupaten_id = ?)
      GROUP BY sd.modul_bsan_kode, mb.nama, mb.urutan
      ORDER BY mb.urutan
    `, [kabupatenId, kabupatenId]);

    const { total_responden, base_rate, impl_rate, sudah_mengisi } = rateRows[0];

    // Ambil semua modul BSAN sebagai fallback jika belum ada data SEL
    const [modulRows] = await pool.execute(`SELECT kode, nama, urutan FROM modul_bsan WHERE is_active = 1 ORDER BY urutan`);

    const selMap = {};
    selRows.forEach(r => { selMap[r.modul_kode] = r.sel_score_persen || 0; });

    const progress = modulRows.map(m => {
      const selScore = selMap[m.kode] || 0;
      // Formula: 40% base_rate + 30% impl_rate + 30% SEL score
      const weight   = m.urutan === 1 ? { b: 0.40, i: 0.30, s: 0.30 }
                     : m.urutan === 2 ? { b: 0.38, i: 0.32, s: 0.30 }
                     : { b: 0.35, i: 0.35, s: 0.30 };
      const progres  = Math.min(100, Math.round(
        (base_rate || 0) * weight.b +
        (impl_rate || 0) * weight.i +
        selScore * weight.s
      ));
      return {
        id:              m.kode,
        nama:            m.nama,
        progres,
        totalPertanyaan: total_responden || 0,
        terisi:          sudah_mengisi || 0,
        selScore,
        base_rate:       base_rate || 0,
        impl_rate:       impl_rate || 0,
      };
    });

    return res.json({ success: true, data: progress });
  } catch (err) {
    console.error('[Analisis] modul-progress error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/analisis/modul-detail ──────────────────────────────────────────
router.get('/modul-detail', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        sd.kode AS dimensi_kode, sd.nama AS dimensi_nama, sd.modul_bsan_kode,
        ROUND(AVG(CASE WHEN si.subjek = 'guru'  THEN sjo.skor END), 2) AS guru_avg,
        ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS murid_avg,
        ROUND(AVG(sjo.skor), 2) AS total_avg,
        COUNT(DISTINCT sso.id) AS jumlah_sesi
      FROM sel_jawaban_observasi sjo
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      JOIN sel_dimensi sd ON si.dimensi_id = sd.id
      JOIN sel_sesi_observasi sso ON sjo.sesi_id = sso.id
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      WHERE sjo.skor IS NOT NULL
        AND (? IS NULL OR k.kabupaten_id = ?)
      GROUP BY sd.id, sd.kode, sd.nama, sd.modul_bsan_kode
      ORDER BY sd.urutan
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/analisis/proporsi ──────────────────────────────────────────────
router.get('/proporsi', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [pieRows] = await pool.execute(`
      SELECT penerima_modul, COUNT(*) AS jumlah,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
      FROM responden_survey rs
      WHERE (? IS NULL OR rs.kabupaten_id = ?)
      GROUP BY penerima_modul
    `, [kabupatenId, kabupatenId]);

    const [distribusiRows] = await pool.execute(`
      SELECT k.nama AS kecamatan, COUNT(*) AS total,
        ROUND(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS ya_persen,
        ROUND(SUM(CASE WHEN rs.penerima_modul = 'Tidak' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS tidak_persen
      FROM responden_survey rs
      JOIN kecamatan k ON rs.kecamatan_id = k.id
      WHERE (? IS NULL OR rs.kabupaten_id = ?)
      GROUP BY k.id, k.nama ORDER BY ya_persen DESC
    `, [kabupatenId, kabupatenId]);

    const [posisiRows] = await pool.execute(`
      SELECT rs.posisi, COUNT(*) AS total,
        ROUND(SUM(CASE WHEN rs.penerima_modul = 'Tidak' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS belum_menerima,
        ROUND(SUM(CASE WHEN rs.status_implementasi IS NULL AND rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS tidak_menerapkan,
        ROUND(SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS sebagian,
        ROUND(SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS sudah
      FROM responden_survey rs
      WHERE (? IS NULL OR rs.kabupaten_id = ?)
      GROUP BY rs.posisi ORDER BY sudah DESC
    `, [kabupatenId, kabupatenId]);

    const [kecamatanRows] = await pool.execute(`
      SELECT k.nama AS kecamatan, COUNT(*) AS total,
        ROUND(SUM(CASE WHEN rs.penerima_modul = 'Tidak' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS belum_menerima,
        ROUND(SUM(CASE WHEN rs.status_implementasi IS NULL AND rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS tidak_menerapkan,
        ROUND(SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS sebagian,
        ROUND(SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS sudah
      FROM responden_survey rs
      JOIN kecamatan k ON rs.kecamatan_id = k.id
      WHERE (? IS NULL OR rs.kabupaten_id = ?)
      GROUP BY k.id, k.nama ORDER BY sudah DESC
    `, [kabupatenId, kabupatenId]);

    return res.json({
      success: true,
      data: {
        proporsiPenerima:           pieRows,
        distribusiPerKecamatan:     distribusiRows,
        statusImplementasiPosisi:   posisiRows,
        statusImplementasiKecamatan: kecamatanRows,
      }
    });
  } catch (err) {
    console.error('[Analisis] proporsi error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/analisis/funnel ─────────────────────────────────────────────────
router.get('/funnel', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_sasaran,
        SUM(CASE WHEN sp.status_pengisian IN ('sudah', 'sebagian') THEN 1 ELSE 0 END) AS mengisi,
        (SELECT COUNT(DISTINCT rs.sekolah_id) FROM responden_survey rs
          JOIN kecamatan k2 ON rs.kecamatan_id = k2.id
          WHERE rs.penerima_modul = 'Ya' AND (? IS NULL OR k2.kabupaten_id = ?)
        ) AS menerima_modul,
        (SELECT COUNT(DISTINCT rs.sekolah_id) FROM responden_survey rs
          JOIN kecamatan k3 ON rs.kecamatan_id = k3.id
          WHERE rs.status_implementasi IN ('sudah', 'sebagian') AND (? IS NULL OR k3.kabupaten_id = ?)
        ) AS implementasi,
        (SELECT COUNT(DISTINCT rs.sekolah_id) FROM responden_survey rs
          JOIN kecamatan k4 ON rs.kecamatan_id = k4.id
          WHERE rs.status_implementasi = 'sudah' AND (? IS NULL OR k4.kabupaten_id = ?)
        ) AS implementasi_penuh
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      WHERE (? IS NULL OR k.kabupaten_id = ?)
    `, [kabupatenId, kabupatenId, kabupatenId, kabupatenId, kabupatenId, kabupatenId, kabupatenId, kabupatenId]);

    const r = rows[0];
    const total = r.total_sasaran || 0;
    const pct   = (n) => total > 0 ? Math.round(n / total * 100) : 0;

    const funnel = [
      { name: 'Total Sasaran Sekolah',       schools: total,                 percentage: 100 },
      { name: 'Mengisi Survei (Aktif)',       schools: r.mengisi,             percentage: pct(r.mengisi) },
      { name: 'Menerima Modul BSAN',          schools: r.menerima_modul,      percentage: pct(r.menerima_modul) },
      { name: 'Mengimplementasikan (Sebagian/Penuh)', schools: r.implementasi,percentage: pct(r.implementasi) },
      { name: 'Implementasi Penuh',           schools: r.implementasi_penuh,  percentage: pct(r.implementasi_penuh) },
    ];

    return res.json({ success: true, data: funnel });
  } catch (err) {
    console.error('[Analisis] funnel error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/analisis/matriks ────────────────────────────────────────────────
router.get('/matriks', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        k.nama AS kecamatan, kb.nama AS kabupaten,
        COUNT(*) AS total_responden,
        ROUND(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS penerimaan_persen,
        ROUND(
          (SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) +
           SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 0.5 ELSE 0 END))
          / NULLIF(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END), 0) * 100, 1
        ) AS implementasi_persen,
        COUNT(DISTINCT rs.sekolah_id) AS jumlah_sekolah
      FROM responden_survey rs
      JOIN kecamatan k ON rs.kecamatan_id = k.id
      JOIN kabupaten kb ON rs.kabupaten_id = kb.id
      WHERE (? IS NULL OR kb.id = ?)
      GROUP BY k.id, k.nama, kb.nama
      HAVING total_responden > 0
      ORDER BY penerimaan_persen DESC
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Analisis] matriks error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/analisis/tantangan ─────────────────────────────────────────────
router.get('/tantangan', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;

    const [rows] = await pool.execute(`
      SELECT
        ti.kategori,
        COUNT(*) AS jumlah,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
      FROM tantangan_implementasi ti
      JOIN satuan_pendidikan sp ON ti.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      WHERE (? IS NULL OR k.kabupaten_id = ?)
      GROUP BY ti.kategori
      ORDER BY jumlah DESC
    `, [kabupatenId, kabupatenId]);

    // Fallback: jika tabel tantangan_implementasi kosong, gunakan data dari jawaban_survey Q34
    if (rows.length === 0) {
      const [narrativeRows] = await pool.execute(`
        SELECT
          rs.nama AS responden, sp.nama AS sekolah,
          k.nama AS kecamatan, js.jawaban_bebas AS narasi_tantangan
        FROM jawaban_survey js
        JOIN pertanyaan_survey ps ON js.pertanyaan_id = ps.id
        JOIN responden_survey rs ON js.responden_id = rs.id
        JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
        JOIN kecamatan k ON rs.kecamatan_id = k.id
        WHERE ps.kode_pertanyaan = 'Q34'
          AND js.jawaban_bebas IS NOT NULL
          AND TRIM(js.jawaban_bebas) != ''
          AND (? IS NULL OR k.kabupaten_id = ?)
        ORDER BY k.nama, sp.nama
        LIMIT 50
      `, [kabupatenId, kabupatenId]);
      return res.json({ success: true, data: rows, narratives: narrativeRows });
    }

    // Narasi Q34
    const [narrativeRows] = await pool.execute(`
      SELECT rs.nama AS responden, sp.nama AS sekolah, k.nama AS kecamatan, js.jawaban_bebas AS narasi_tantangan
      FROM jawaban_survey js JOIN pertanyaan_survey ps ON js.pertanyaan_id = ps.id
      JOIN responden_survey rs ON js.responden_id = rs.id
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON rs.kecamatan_id = k.id
      WHERE ps.kode_pertanyaan = 'Q34' AND js.jawaban_bebas IS NOT NULL AND TRIM(js.jawaban_bebas) != ''
        AND (? IS NULL OR k.kabupaten_id = ?)
      ORDER BY k.nama, sp.nama LIMIT 50
    `, [kabupatenId, kabupatenId]);

    return res.json({ success: true, data: rows, narratives: narrativeRows });
  } catch (err) {
    console.error('[Analisis] tantangan error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
