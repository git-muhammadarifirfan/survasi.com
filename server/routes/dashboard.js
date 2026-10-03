'use strict';
/**
 * @file routes/dashboard.js
 * @description Dashboard API endpoints — seluruh angka realtime dari database.
 *   Status pengisian sekolah:
 *     belum    = belum ada aktivitas pengisian
 *     sebagian = PROSES (sedang/pernah mulai mengisi, belum mengirim)
 *     sudah    = SELESAI (minimal satu survei terkirim)
 *   Semua endpoint admin mendukung filter ?kabupaten_id= & ?kecamatan= / ?kecamatan_id=.
 *
 * GET /api/dashboard/summary           → KPI cards
 * GET /api/dashboard/regional-stats    → Statistik per kecamatan
 * GET /api/dashboard/kabupaten-stats   → Statistik per kabupaten
 * GET /api/dashboard/modul-progress    → Progres capaian modul (dari jawaban)
 * GET /api/dashboard/activities        → Aktivitas pengisian terbaru (realtime)
 * GET /api/dashboard/follow-up         → Sekolah belum selesai (untuk tindak lanjut)
 * GET /api/dashboard/timeseries        → Tren pengiriman survei harian
 * GET /api/dashboard/insights          → Peringatan dini yang dihitung dari data
 * GET /api/dashboard/sekolah-overview  → Dashboard akun sekolah
 * GET /api/dashboard/pengawas-overview → Dashboard akun pengawas
 */

const router = require('express').Router();
const pool   = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const { parseFilter, wilayahWhere, computeModulBreakdown } = require('../utils/analytics');

router.use(authMiddleware);

/** Menit sejak aktivitas terakhir agar sekolah dianggap "sedang mengisi sekarang" */
const LIVE_WINDOW_MINUTES = 30;

const fail = (res, tag, err) => {
  console.error(`[Dashboard] ${tag} error:`, err);
  return res.status(500).json({ success: false, message: 'Gagal memuat data dashboard.' });
};

const STATUS_COLS = `
  COUNT(sp.id) AS total,
  SUM(sp.status_pengisian = 'sudah')    AS sudah,
  SUM(sp.status_pengisian = 'sebagian') AS sebagian,
  SUM(sp.status_pengisian = 'belum')    AS belum,
  ROUND(SUM(sp.status_pengisian = 'sudah') / NULLIF(COUNT(sp.id), 0) * 100, 1) AS rate,
  ROUND(SUM(sp.status_pengisian IN ('sudah','sebagian')) / NULLIF(COUNT(sp.id), 0) * 100, 1) AS partisipasi
`;

const num = (v) => Number(v || 0);

// ─── GET /api/dashboard/summary ─────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);

    const [[s]] = await pool.execute(`
      SELECT ${STATUS_COLS},
        SUM(sp.status_pengisian = 'sebagian' AND sp.last_updated >= NOW() - INTERVAL ${LIVE_WINDOW_MINUTES} MINUTE) AS sedang_mengisi,
        SUM(EXISTS (SELECT 1 FROM users u WHERE u.sekolah_id = sp.id AND u.deleted_at IS NULL)) AS akun_terdaftar
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.deleted_at IS NULL ${w.sql}
    `, w.params);

    const [[r]] = await pool.execute(`
      SELECT COUNT(*) AS total_responden,
        SUM(rs.penerima_modul = 'Ya') AS penerima_ya,
        SUM(rs.penerima_modul = 'Ya' AND rs.status_implementasi = 'sudah') AS impl_sudah,
        SUM(rs.penerima_modul = 'Ya' AND rs.status_implementasi = 'sebagian') AS impl_sebagian,
        SUM(rs.submitted_at >= CURDATE()) AS responden_hari_ini
      FROM responden_survey rs
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE rs.deleted_at IS NULL AND sp.deleted_at IS NULL ${w.sql}
    `, w.params);

    const [[o]] = await pool.execute(`
      SELECT COUNT(DISTINCT sso.id) AS total_sesi_sel, COUNT(DISTINCT sso.sekolah_id) AS sekolah_diobservasi
      FROM sel_sesi_observasi sso
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sso.deleted_at IS NULL AND sso.status IN ('submitted','reviewed') ${w.sql}
    `, w.params);

    const totalResp = num(r.total_responden);
    const penerima = num(r.penerima_ya);
    return res.json({
      success: true,
      data: {
        total_sekolah: num(s.total),
        sudah: num(s.sudah),
        sebagian: num(s.sebagian),
        proses: num(s.sebagian),
        belum: num(s.belum),
        response_rate: num(s.rate),
        partisipasi_rate: num(s.partisipasi),
        sedang_mengisi: num(s.sedang_mengisi),
        akun_terdaftar: num(s.akun_terdaftar),
        total_responden: totalResp,
        responden_hari_ini: num(r.responden_hari_ini),
        penerima_modul: penerima,
        penerima_persen: totalResp ? Math.round((penerima / totalResp) * 1000) / 10 : 0,
        impl_sudah: num(r.impl_sudah),
        impl_sebagian: num(r.impl_sebagian),
        impl_belum: penerima - num(r.impl_sudah) - num(r.impl_sebagian),
        total_sesi_sel: num(o.total_sesi_sel),
        sekolah_diobservasi: num(o.sekolah_diobservasi),
        live_window_minutes: LIVE_WINDOW_MINUTES,
      },
    });
  } catch (err) {
    return fail(res, 'summary', err);
  }
});

// ─── GET /api/dashboard/regional-stats ──────────────────────────────────────
router.get('/regional-stats', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);
    const [rows] = await pool.execute(`
      SELECT k.id AS kecamatan_id, k.nama AS kecamatan, kb.id AS kabupaten_id, kb.nama AS kabupaten,
        ${STATUS_COLS}
      FROM kecamatan k
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      LEFT JOIN satuan_pendidikan sp ON sp.kecamatan_id = k.id AND sp.deleted_at IS NULL
      WHERE 1 = 1 ${w.sql}
      GROUP BY k.id, k.nama, kb.id, kb.nama
      HAVING total > 0
      ORDER BY rate DESC, partisipasi DESC, k.nama
    `, w.params);
    return res.json({
      success: true,
      data: rows.map(r => ({ ...r, total: num(r.total), sudah: num(r.sudah), sebagian: num(r.sebagian), belum: num(r.belum), rate: num(r.rate), partisipasi: num(r.partisipasi), response_rate: num(r.rate) })),
    });
  } catch (err) {
    return fail(res, 'regional-stats', err);
  }
});

// ─── GET /api/dashboard/kabupaten-stats ─────────────────────────────────────
router.get('/kabupaten-stats', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT kb.id, kb.nama AS kabupaten, kb.warna_chart AS color, ${STATUS_COLS}
      FROM kabupaten kb
      LEFT JOIN kecamatan k ON k.kabupaten_id = kb.id
      LEFT JOIN satuan_pendidikan sp ON sp.kecamatan_id = k.id AND sp.deleted_at IS NULL
      GROUP BY kb.id, kb.nama, kb.warna_chart
      ORDER BY rate DESC, kb.nama
    `);
    return res.json({
      success: true,
      data: rows.map(r => ({ ...r, warna_chart: r.color, total: num(r.total), sudah: num(r.sudah), sebagian: num(r.sebagian), belum: num(r.belum), rate: num(r.rate), partisipasi: num(r.partisipasi), response_rate: num(r.rate) })),
    });
  } catch (err) {
    return fail(res, 'kabupaten-stats', err);
  }
});

// ─── GET /api/dashboard/modul-progress ──────────────────────────────────────
router.get('/modul-progress', async (req, res) => {
  try {
    const { modules, totalResponden } = await computeModulBreakdown(parseFilter(req.query));
    return res.json({
      success: true,
      data: modules.map(m => ({
        id: m.kode, modul_id: m.modul_id, nama: m.title, framework_key: m.framework_key,
        progres: m.progres, terisi: m.total_responden, totalResponden,
        totalPertanyaan: m.questions.length,
      })),
    });
  } catch (err) {
    return fail(res, 'modul-progress', err);
  }
});

// ─── GET /api/dashboard/activities ──────────────────────────────────────────
// Gabungan: survei terkirim (responden) + sekolah yang sedang proses mengisi.
router.get('/activities', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10) || 10, 1), 100);

    const [rows] = await pool.query(`
      SELECT * FROM (
        SELECT 'submit' AS tipe, sp.id AS sekolah_id, sp.nama AS schoolName, k.nama AS kecamatan,
               rs.nama AS pengisi, 'sudah' AS status, rs.submitted_at AS waktu
        FROM responden_survey rs
        JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
        JOIN kecamatan k ON sp.kecamatan_id = k.id
        JOIN kabupaten kb ON k.kabupaten_id = kb.id
        WHERE rs.deleted_at IS NULL AND rs.submitted_at IS NOT NULL ${w.sql}
        UNION ALL
        SELECT 'proses' AS tipe, sp.id, sp.nama, k.nama, NULL, 'sebagian', sp.last_updated
        FROM satuan_pendidikan sp
        JOIN kecamatan k ON sp.kecamatan_id = k.id
        JOIN kabupaten kb ON k.kabupaten_id = kb.id
        WHERE sp.deleted_at IS NULL AND sp.status_pengisian = 'sebagian' AND sp.last_updated IS NOT NULL ${w.sql}
      ) t
      ORDER BY waktu DESC
      LIMIT ?
    `, [...w.params, ...w.params, limit]);

    const [[nowRow]] = await pool.query('SELECT NOW() AS now');
    const now = new Date(nowRow.now).getTime();
    return res.json({
      success: true,
      data: rows.map(r => ({
        ...r,
        time: r.waktu,
        live: r.tipe === 'proses' && (now - new Date(r.waktu).getTime()) <= LIVE_WINDOW_MINUTES * 60000,
      })),
    });
  } catch (err) {
    return fail(res, 'activities', err);
  }
});

// ─── GET /api/dashboard/follow-up ───────────────────────────────────────────
router.get('/follow-up', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);
    const statusFilter = req.query.status === 'belum' || req.query.status === 'sebagian' ? req.query.status : null;
    const [rows] = await pool.execute(`
      SELECT sp.id, sp.npsn, sp.nama, sp.email, sp.telepon,
             k.nama AS kecamatan, kb.nama AS kabupaten,
             sp.status_pengisian AS status, sp.last_updated,
             EXISTS (SELECT 1 FROM users u WHERE u.sekolah_id = sp.id AND u.deleted_at IS NULL AND u.is_active = TRUE) AS is_registered
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.deleted_at IS NULL
        AND sp.status_pengisian IN ('belum','sebagian')
        AND (? IS NULL OR sp.status_pengisian = ?)
        ${w.sql}
      ORDER BY (sp.status_pengisian = 'sebagian') DESC, is_registered DESC, kb.nama, k.nama, sp.nama
      LIMIT 2000
    `, [statusFilter, statusFilter, ...w.params]);
    return res.json({ success: true, data: rows.map(r => ({ ...r, is_registered: Boolean(r.is_registered) })) });
  } catch (err) {
    return fail(res, 'follow-up', err);
  }
});

// ─── GET /api/dashboard/timeseries ──────────────────────────────────────────
// Per hari: jumlah survei terkirim, sekolah yang baru selesai, & kumulatif sekolah selesai.
router.get('/timeseries', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);
    const days = Math.min(Math.max(parseInt(req.query.days || '14', 10) || 14, 7), 90);

    const [daily] = await pool.execute(`
      SELECT DATE(rs.submitted_at) AS tgl, COUNT(*) AS responden
      FROM responden_survey rs
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE rs.deleted_at IS NULL AND rs.submitted_at IS NOT NULL ${w.sql}
      GROUP BY DATE(rs.submitted_at)
    `, w.params);

    const [firstDone] = await pool.execute(`
      SELECT DATE(MIN(rs.submitted_at)) AS tgl, rs.sekolah_id
      FROM responden_survey rs
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE rs.deleted_at IS NULL AND rs.submitted_at IS NOT NULL AND sp.deleted_at IS NULL ${w.sql}
      GROUP BY rs.sekolah_id
    `, w.params);

    const key = (d) => {
      const x = new Date(d);
      return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    };
    const respByDay = new Map(daily.map(d => [key(d.tgl), num(d.responden)]));
    const newSchoolsByDay = new Map();
    firstDone.forEach(r => { const k = key(r.tgl); newSchoolsByDay.set(k, (newSchoolsByDay.get(k) || 0) + 1); });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    let cumulative = firstDone.filter(r => new Date(r.tgl) < start).length;

    const out = [];
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const k = key(d);
      const baru = newSchoolsByDay.get(k) || 0;
      cumulative += baru;
      out.push({
        date: k,
        label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        responden: respByDay.get(k) || 0,
        sekolah_baru: baru,
        kumulatif: cumulative,
      });
    }
    return res.json({ success: true, data: out });
  } catch (err) {
    return fail(res, 'timeseries', err);
  }
});

// ─── GET /api/dashboard/insights ─────────────────────────────────────────────
router.get('/insights', async (req, res) => {
  try {
    const f = parseFilter(req.query);
    const w = wilayahWhere(f);
    const items = [];

    const [stuck] = await pool.execute(`
      SELECT sp.nama FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.deleted_at IS NULL AND sp.status_pengisian = 'sebagian'
        AND sp.last_updated < NOW() - INTERVAL 3 DAY ${w.sql}
      ORDER BY sp.last_updated ASC
    `, w.params);
    if (stuck.length) {
      items.push({
        id: 'stuck', severity: 'high',
        title: `${stuck.length} sekolah berhenti di status Proses`,
        description: `Mulai mengisi tetapi belum mengirim lebih dari 3 hari: ${stuck.slice(0, 3).map(s => s.nama).join(', ')}${stuck.length > 3 ? ', dll.' : '.'}`,
      });
    }

    const [kec] = await pool.execute(`
      SELECT k.nama, COUNT(sp.id) AS total, SUM(sp.status_pengisian <> 'belum') AS aktif
      FROM kecamatan k
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      JOIN satuan_pendidikan sp ON sp.kecamatan_id = k.id AND sp.deleted_at IS NULL
      WHERE 1 = 1 ${w.sql}
      GROUP BY k.id, k.nama
    `, w.params);
    const zeroKec = kec.filter(k => num(k.aktif) === 0);
    if (zeroKec.length && zeroKec.length < kec.length) {
      items.push({
        id: 'zero-kec', severity: 'medium',
        title: `${zeroKec.length} kecamatan belum ada aktivitas`,
        description: `Belum ada sekolah yang mulai mengisi di: ${zeroKec.slice(0, 4).map(k => k.nama).join(', ')}${zeroKec.length > 4 ? ', dll.' : '.'}`,
      });
    }

    const [[reg]] = await pool.execute(`
      SELECT COUNT(*) AS n FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.deleted_at IS NULL AND sp.status_pengisian = 'belum'
        AND EXISTS (SELECT 1 FROM users u WHERE u.sekolah_id = sp.id AND u.deleted_at IS NULL) ${w.sql}
    `, w.params);
    if (num(reg.n) > 0) {
      items.push({
        id: 'registered-idle', severity: 'low',
        title: `${num(reg.n)} sekolah sudah punya akun tapi belum mengisi`,
        description: 'Kirim pengingat melalui daftar Prioritas Follow-Up.',
      });
    }

    const [sel] = await pool.execute(`
      SELECT sp.nama, AVG(sjo.skor) AS avg_skor
      FROM sel_sesi_observasi sso
      JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sjo.skor IS NOT NULL AND sso.deleted_at IS NULL ${w.sql}
      GROUP BY sp.id, sp.nama
      HAVING avg_skor < 2.5
    `, w.params);
    if (sel.length) {
      items.push({
        id: 'sel-low', severity: 'high',
        title: `${sel.length} sekolah skor observasi SEL < 2.5`,
        description: `Perlu intervensi: ${sel.slice(0, 3).map(s => `${s.nama} (${Number(s.avg_skor).toFixed(1)})`).join(', ')}.`,
      });
    }

    const [[invalid]] = await pool.execute(`
      SELECT COUNT(DISTINCT rs.id) AS n
      FROM responden_survey rs
      JOIN jawaban_survey js ON js.responden_id = rs.id
      JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE rs.deleted_at IS NULL AND LOWER(TRIM(js.jawaban_terstruktur)) = 'jawaban esai' ${w.sql}
    `, w.params);
    if (num(invalid.n) > 0) {
      items.push({
        id: 'invalid-data', severity: 'medium',
        title: `${num(invalid.n)} responden berisi jawaban placeholder`,
        description: 'Ditemukan jawaban "Jawaban esai" (data uji/seed). Jawaban tersebut otomatis diabaikan dari analisis; periksa di menu Data Responden.',
      });
    }

    return res.json({ success: true, data: items });
  } catch (err) {
    return fail(res, 'insights', err);
  }
});

// ─── GET /api/dashboard/sekolah-overview ────────────────────────────────────
router.get('/sekolah-overview', async (req, res) => {
  try {
    const sekolahId = req.user?.sekolah_id;
    if (!sekolahId) return res.json({ success: true, data: null });

    const [[school]] = await pool.execute(`
      SELECT sp.id, sp.npsn, sp.nama, sp.jenjang, sp.status_sekolah, sp.akreditasi, sp.alamat,
             sp.total_guru, sp.total_siswa, sp.status_pengisian, sp.last_updated,
             k.id AS kecamatan_id, k.nama AS kecamatan, kb.id AS kabupaten_id, kb.nama AS kabupaten
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.id = ?
    `, [sekolahId]);
    if (!school) return res.json({ success: true, data: null });

    const [responden] = await pool.execute(`
      SELECT id, nama, posisi, jenis_kelamin, penerima_modul, status_implementasi, kelas_mengajar, submitted_at
      FROM responden_survey WHERE sekolah_id = ? AND deleted_at IS NULL
      ORDER BY submitted_at DESC, id DESC
    `, [sekolahId]);

    // Capaian modul: sekolah ini vs rata-rata kecamatan vs kabupaten (dari jawaban real)
    const [mine, kecAvg, kabAvg] = await Promise.all([
      computeModulBreakdownForSchool(sekolahId),
      computeModulBreakdown({ kecamatanId: school.kecamatan_id }),
      computeModulBreakdown({ kabupatenId: school.kabupaten_id }),
    ]);
    const modul = mine.map(m => ({
      modul_id: m.modul_id, nama: m.title,
      sekolah: m.jumlah_jawaban_evaluatif ? m.progres : null,
      kecamatan: (kecAvg.modules.find(x => x.modul_id === m.modul_id)?.jumlah_jawaban_evaluatif)
        ? kecAvg.modules.find(x => x.modul_id === m.modul_id).progres : null,
      kabupaten: (kabAvg.modules.find(x => x.modul_id === m.modul_id)?.jumlah_jawaban_evaluatif)
        ? kabAvg.modules.find(x => x.modul_id === m.modul_id).progres : null,
    }));

    const [[kecRank]] = await pool.execute(`
      SELECT COUNT(*) AS total, SUM(status_pengisian = 'sudah') AS sudah, SUM(status_pengisian = 'sebagian') AS proses
      FROM satuan_pendidikan WHERE kecamatan_id = ? AND deleted_at IS NULL
    `, [school.kecamatan_id]);

    const [notifikasi] = await pool.execute(`
      SELECT id, judul, pesan, tipe, is_read, created_at FROM notifikasi
      WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `, [req.user.id]);

    return res.json({
      success: true,
      data: {
        sekolah: school,
        responden,
        total_responden: responden.length,
        penerima_modul: responden.filter(r => r.penerima_modul === 'Ya').length,
        modul,
        kecamatan_stats: { total: num(kecRank.total), sudah: num(kecRank.sudah), proses: num(kecRank.proses) },
        notifikasi,
      },
    });
  } catch (err) {
    return fail(res, 'sekolah-overview', err);
  }
});

/** Breakdown modul untuk satu sekolah (pakai filter responden sekolah). */
async function computeModulBreakdownForSchool(sekolahId) {
  const { modules } = await computeModulBreakdown({ sekolahId });
  return modules;
}

// ─── GET /api/dashboard/pengawas-overview ───────────────────────────────────
router.get('/pengawas-overview', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[mine]] = await pool.execute(`
      SELECT COUNT(*) AS total_sesi, COUNT(DISTINCT sekolah_id) AS total_sekolah,
             SUM(tanggal >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) AS sesi_30_hari,
             MAX(tanggal) AS terakhir
      FROM sel_sesi_observasi
      WHERE observer_user_id = ? AND deleted_at IS NULL
    `, [userId]);

    const [[avg]] = await pool.execute(`
      SELECT ROUND(AVG(CASE WHEN si.subjek = 'guru' THEN sjo.skor END), 2) AS rata_guru,
             ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS rata_murid
      FROM sel_sesi_observasi sso
      JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
      JOIN sel_indikator si ON sjo.indikator_id = si.id
      WHERE sso.observer_user_id = ? AND sso.deleted_at IS NULL AND sjo.skor IS NOT NULL
    `, [userId]);

    const [recent] = await pool.execute(`
      SELECT sso.id, sso.tanggal, sso.kelas_diamati, sso.mata_pelajaran, sso.status,
             sp.nama AS sekolah, k.nama AS kecamatan, kb.nama AS kabupaten,
             (SELECT ROUND(AVG(skor), 2) FROM sel_jawaban_observasi WHERE sesi_id = sso.id AND skor IS NOT NULL) AS skor
      FROM sel_sesi_observasi sso
      JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sso.observer_user_id = ? AND sso.deleted_at IS NULL
      ORDER BY sso.tanggal DESC, sso.id DESC
      LIMIT 8
    `, [userId]);

    const [[global]] = await pool.execute(`
      SELECT COUNT(*) AS total_sekolah,
             SUM(status_pengisian = 'sudah') AS sudah,
             SUM(status_pengisian = 'sebagian') AS proses,
             (SELECT COUNT(DISTINCT sekolah_id) FROM sel_sesi_observasi WHERE deleted_at IS NULL) AS sekolah_diobservasi
      FROM satuan_pendidikan WHERE deleted_at IS NULL
    `);

    const [notifikasi] = await pool.execute(`
      SELECT id, judul, pesan, tipe, is_read, created_at FROM notifikasi
      WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `, [userId]);

    return res.json({
      success: true,
      data: {
        total_sesi: num(mine.total_sesi),
        total_sekolah: num(mine.total_sekolah),
        sesi_30_hari: num(mine.sesi_30_hari),
        terakhir: mine.terakhir,
        rata_guru: avg.rata_guru != null ? Number(avg.rata_guru) : null,
        rata_murid: avg.rata_murid != null ? Number(avg.rata_murid) : null,
        recent,
        wilayah: {
          total_sekolah: num(global.total_sekolah),
          sudah: num(global.sudah),
          proses: num(global.proses),
          sekolah_diobservasi: num(global.sekolah_diobservasi),
        },
        notifikasi,
      },
    });
  } catch (err) {
    return fail(res, 'pengawas-overview', err);
  }
});

module.exports = router;
