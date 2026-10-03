'use strict';
/**
 * @file routes/analisis.js
 * @description Analisis API endpoints (semua halaman chart/analitik).
 *   Seluruh angka dihitung realtime dari database (responden_survey, jawaban_survey,
 *   pertanyaan_survey, satuan_pendidikan, sel_*). Tidak ada nilai dummy/default.
 *   Semua endpoint mendukung filter ?kabupaten_id= & ?kecamatan= / ?kecamatan_id=.
 *
 * GET /api/analisis/modul-progress   → Progres capaian per modul (dari jawaban evaluatif)
 * GET /api/analisis/modul-detail     → Skor dimensi SEL (observasi) per dimensi
 * GET /api/analisis/proporsi         → Seluruh data halaman Proporsi Modul
 * GET /api/analisis/funnel           → Gap Funnel 6 tahap + rincian per kecamatan
 * GET /api/analisis/matriks          → Matriks 4 kuadran per kecamatan
 * GET /api/analisis/tantangan        → Tantangan implementasi + narasi
 * GET /api/analisis/frameworks       → 3 framework + progres modul di dalamnya
 * GET /api/analisis/modul-breakdown  → Distribusi jawaban per pertanyaan per modul
 */

const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const {
  parseFilter, wilayahWhere, loadResponses, computeModulBreakdown, computeProporsi,
  narrativesForRole,
} = require('../utils/analytics');

router.use(authMiddleware);

const fail = (res, tag, err) => {
  console.error(`[Analisis] ${tag} error:`, err);
  return res.status(500).json({ success: false, message: 'Gagal mengolah data analisis.' });
};

// ─── GET /api/analisis/modul-progress ────────────────────────────────────────
router.get('/modul-progress', async (req, res) => {
  try {
    const { modules, totalResponden } = await computeModulBreakdown(parseFilter(req.query));
    return res.json({
      success: true,
      data: modules.map(m => ({
        id: m.kode,
        modul_id: m.modul_id,
        framework_key: m.framework_key,
        nama: m.title,
        progres: m.progres,
        totalPertanyaan: m.questions.length,
        terisi: m.total_responden,
        totalResponden,
      })),
    });
  } catch (err) {
    return fail(res, 'modul-progress', err);
  }
});

// ─── GET /api/analisis/modul-detail (skor SEL per dimensi) ───────────────────
router.get('/modul-detail', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);
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
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sjo.skor IS NOT NULL AND sso.deleted_at IS NULL ${w.sql}
      GROUP BY sd.id, sd.kode, sd.nama, sd.modul_bsan_kode
      ORDER BY sd.urutan
    `, w.params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return fail(res, 'modul-detail', err);
  }
});

// ─── GET /api/analisis/proporsi ──────────────────────────────────────────────
router.get('/proporsi', async (req, res) => {
  try {
    const data = await computeProporsi(parseFilter(req.query));
    return res.json({ success: true, data });
  } catch (err) {
    return fail(res, 'proporsi', err);
  }
});

// ─── GET /api/analisis/funnel ─────────────────────────────────────────────────
router.get('/funnel', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);

    // Satu baris per sekolah sasaran dengan indikator tiap tahap funnel
    const [rows] = await pool.execute(`
      SELECT
        sp.id, k.nama AS kecamatan, kb.nama AS kabupaten,
        sp.status_pengisian IN ('sebagian','sudah') AS mulai,
        (sp.status_pengisian = 'sudah' OR COUNT(rs.id) > 0) AS selesai,
        MAX(rs.penerima_modul = 'Ya') AS menerima,
        MAX(rs.penerima_modul = 'Ya' AND rs.status_implementasi IN ('sudah','sebagian')) AS implementasi,
        MAX(rs.penerima_modul = 'Ya' AND rs.status_implementasi = 'sudah') AS penuh
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      LEFT JOIN responden_survey rs ON rs.sekolah_id = sp.id AND rs.deleted_at IS NULL
      WHERE sp.deleted_at IS NULL ${w.sql}
      GROUP BY sp.id, k.nama, kb.nama, sp.status_pengisian
    `, w.params);

    const STAGES = [
      { key: 'total', name: 'Total Sekolah Sasaran' },
      { key: 'mulai', name: 'Mulai Mengisi (Proses + Selesai)' },
      { key: 'selesai', name: 'Selesai Mengirim Survei' },
      { key: 'menerima', name: 'Menerima Modul BSAN' },
      { key: 'implementasi', name: 'Mengimplementasikan (Sebagian/Penuh)' },
      { key: 'penuh', name: 'Implementasi Penuh' },
    ];
    const count = (list, key) => key === 'total' ? list.length : list.filter(r => Number(r[key]) === 1).length;

    const total = rows.length;
    const funnel = STAGES.map((s, i) => {
      const n = count(rows, s.key);
      const prev = i > 0 ? count(rows, STAGES[i - 1].key) : n;
      return {
        key: s.key,
        name: s.name,
        schools: n,
        percentage: total ? Math.round((n / total) * 1000) / 10 : 0,
        dropOff: i > 0 && prev > 0 ? Math.round(((prev - n) / prev) * 1000) / 10 : 0,
      };
    });

    const byKec = new Map();
    for (const r of rows) {
      if (!byKec.has(r.kecamatan)) byKec.set(r.kecamatan, { kecamatan: r.kecamatan, kabupaten: r.kabupaten, rows: [] });
      byKec.get(r.kecamatan).rows.push(r);
    }
    const perKecamatan = [...byKec.values()].map(g => {
      const o = { kecamatan: g.kecamatan, kabupaten: g.kabupaten };
      STAGES.forEach(s => { o[s.key] = count(g.rows, s.key); });
      o.konversi = o.total ? Math.round((o.selesai / o.total) * 1000) / 10 : 0;
      return o;
    }).sort((a, b) => a.konversi - b.konversi || b.total - a.total);

    return res.json({ success: true, data: funnel, perKecamatan, totalSasaran: total });
  } catch (err) {
    return fail(res, 'funnel', err);
  }
});

// ─── GET /api/analisis/matriks ────────────────────────────────────────────────
router.get('/matriks', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);
    const [rows] = await pool.execute(`
      SELECT
        k.nama AS kecamatan, kb.nama AS kabupaten,
        COUNT(*) AS total_responden,
        ROUND(SUM(rs.penerima_modul = 'Ya') / COUNT(*) * 100, 1) AS penerimaan_persen,
        COALESCE(ROUND(
          (SUM(rs.penerima_modul = 'Ya' AND rs.status_implementasi = 'sudah') +
           SUM(rs.penerima_modul = 'Ya' AND rs.status_implementasi = 'sebagian') * 0.5)
          / NULLIF(SUM(rs.penerima_modul = 'Ya'), 0) * 100, 1
        ), 0) AS implementasi_persen,
        COUNT(DISTINCT rs.sekolah_id) AS jumlah_sekolah
      FROM responden_survey rs
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE rs.deleted_at IS NULL AND sp.deleted_at IS NULL ${w.sql}
      GROUP BY k.id, k.nama, kb.nama
      ORDER BY penerimaan_persen DESC
    `, w.params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return fail(res, 'matriks', err);
  }
});

// ─── GET /api/analisis/tantangan ─────────────────────────────────────────────
router.get('/tantangan', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);
    const [rows] = await pool.execute(`
      SELECT ti.kategori, COUNT(*) AS jumlah,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
      FROM tantangan_implementasi ti
      JOIN satuan_pendidikan sp ON ti.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE ti.deleted_at IS NULL AND sp.deleted_at IS NULL ${w.sql}
      GROUP BY ti.kategori
      ORDER BY jumlah DESC
    `, w.params);

    const data = await loadResponses(f);
    const narratives = narrativesForRole(data, 'tantangan', 100).map(n => ({
      responden: n.responden, sekolah: n.sekolah, kecamatan: n.kecamatan, narasi_tantangan: n.teks,
    }));
    return res.json({ success: true, data: rows, narratives });
  } catch (err) {
    return fail(res, 'tantangan', err);
  }
});

// ─── GET /api/analisis/frameworks ─────────────────────────────────────────────
router.get('/frameworks', async (req, res) => {
  try {
    const [frameworkRows] = await pool.execute(
      `SELECT id, framework_key, nama, nama_id, subtitle, subtitle_id, deskripsi, warna, ikon, urutan
       FROM bsan_frameworks WHERE is_active = 1 ORDER BY urutan ASC`
    );
    const [modulMeta] = await pool.execute(
      `SELECT id, nama_en, subtitle, subtitle_en, warna, ikon FROM modul_bsan WHERE is_active = 1`
    );
    const metaById = new Map(modulMeta.map(m => [m.id, m]));
    const { modules, totalResponden } = await computeModulBreakdown(parseFilter(req.query));

    const data = frameworkRows.map(fw => {
      const mods = modules.filter(m => m.framework_key === fw.framework_key);
      // Progres framework = rata-rata tertimbang jumlah jawaban evaluatif tiap modul
      const weight = mods.reduce((s, m) => s + m.jumlah_jawaban_evaluatif, 0);
      const progres = weight
        ? Math.round(mods.reduce((s, m) => s + m.progres * m.jumlah_jawaban_evaluatif, 0) / weight)
        : 0;
      return {
        ...fw,
        progres,
        total_responden: totalResponden,
        modules: mods.map(m => ({
          id: m.modul_id, kode: m.kode, nama: m.title, framework_key: m.framework_key,
          progres: m.progres, total_responden: m.total_responden,
          ...(metaById.get(m.modul_id) || {}),
        })),
      };
    });
    return res.json({ success: true, data });
  } catch (err) {
    return fail(res, 'frameworks', err);
  }
});

// ─── GET /api/analisis/modul-breakdown ───────────────────────────────────────
router.get('/modul-breakdown', async (req, res) => {
  try {
    const targetModulId = req.query.modul_id ? parseInt(req.query.modul_id, 10) : null;
    const { modules, totalResponden } = await computeModulBreakdown(parseFilter(req.query));

    const result = {};
    modules
      .filter(m => !targetModulId || m.modul_id === targetModulId)
      .forEach(m => {
        const obj = { ...m, progres: `${m.progres}%`, progres_num: m.progres };
        result[m.modul_id] = obj;
        result[m.kode] = obj;
      });

    return res.json({ success: true, data: result, totalResponden });
  } catch (err) {
    return fail(res, 'modul-breakdown', err);
  }
});

module.exports = router;
