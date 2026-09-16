'use strict';
/**
 * @file routes/sekolah.js
 * @description Satuan Pendidikan (Sekolah) API endpoints
 *
 * GET    /api/sekolah              → list sekolah (filter, search, pagination)
 * GET    /api/sekolah/:id          → detail sekolah by id
 * PUT    /api/sekolah/:id          → update sekolah (admin only)
 * GET    /api/sekolah/kabupaten    → list kabupaten (untuk dropdown filter)
 * GET    /api/sekolah/kecamatan    → list kecamatan (opsional filter by kabupaten)
 */

const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// ─── GET /api/sekolah/options (Public for Registration Dropdown) ───────────

router.get('/options', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        sp.id, sp.npsn, sp.nama, sp.jenjang,
        k.nama AS kecamatan, kb.nama AS kabupaten
      FROM satuan_pendidikan sp
      LEFT JOIN kecamatan k ON sp.kecamatan_id = k.id
      LEFT JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.deleted_at IS NULL
      ORDER BY sp.nama ASC
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Sekolah] options error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.use(authMiddleware);


// ─── GET /api/sekolah/kabupaten ──────────────────────────────────────────────
router.get('/kabupaten', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, nama, kode_bps, tipe, warna_chart FROM kabupaten ORDER BY nama
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sekolah/kecamatan ──────────────────────────────────────────────
router.get('/kecamatan', async (req, res) => {
  try {
    const kabupatenId = req.query.kabupaten_id ? parseInt(req.query.kabupaten_id) : null;
    const [rows] = await pool.execute(`
      SELECT k.id, k.nama, k.kabupaten_id, kb.nama AS kabupaten_nama
      FROM kecamatan k
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE (? IS NULL OR k.kabupaten_id = ?)
      ORDER BY kb.nama, k.nama
    `, [kabupatenId, kabupatenId]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sekolah ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      kabupaten_id, kecamatan_id, status, jenjang, search, kecamatan,
      page = 1, limit = 50
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClauses = ['sp.deleted_at IS NULL'];
    let params = [];

    if (kabupaten_id) {
      whereClauses.push('kb.id = ?');
      params.push(parseInt(kabupaten_id));
    }

    if (kecamatan_id) {
      whereClauses.push('k.id = ?');
      params.push(parseInt(kecamatan_id));
    }

    if (kecamatan && kecamatan.trim() !== '') {
      const cleanKec = kecamatan.replace(/^Kec\.\s*/i, '').trim();
      whereClauses.push('k.nama LIKE ?');
      params.push(`%${cleanKec}%`);
    }

    if (status && status.trim() !== '') {
      whereClauses.push('sp.status_sekolah LIKE ?');
      params.push(`%${status.trim()}%`);
    }

    if (jenjang && jenjang.trim() !== '') {
      whereClauses.push('sp.jenjang LIKE ?');
      params.push(`%${jenjang.trim()}%`);
    }

    if (search && search.trim() !== '') {
      whereClauses.push('(sp.nama LIKE ? OR sp.npsn LIKE ? OR sp.alamat LIKE ?)');
      const searchPct = `%${search.trim()}%`;
      params.push(searchPct, searchPct, searchPct);
    }

    // Untuk pengawas: batasi ke sekolah_id mereka sendiri jika ada, atau kabupaten/kecamatan_id
    if (req.user.role === 'pengawas') {
      if (req.user.sekolah_id) {
        whereClauses.push('sp.id = ?');
        params.push(req.user.sekolah_id);
      } else if (req.user.kecamatan_id) {
        whereClauses.push('sp.kecamatan_id = ?');
        params.push(req.user.kecamatan_id);
      } else if (req.user.kabupaten_id) {
        whereClauses.push('k.kabupaten_id = ?');
        params.push(req.user.kabupaten_id);
      }
    }

    const whereSql = whereClauses.join(' AND ');

    const [rows] = await pool.execute(`
      SELECT
        sp.id, sp.npsn, sp.nama, sp.jenjang, sp.status_sekolah,
        sp.akreditasi, sp.alamat, sp.email, sp.telepon,
        sp.total_guru, sp.total_siswa,
        sp.latitude, sp.longitude,
        sp.status_pengisian AS status,
        sp.last_updated,
        k.nama   AS kecamatan,
        kb.id    AS kabupaten_id,
        kb.nama  AS kabupaten,
        MAX(u.id)     AS user_id,
        MAX(CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END) AS is_registered
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      LEFT JOIN users u ON (u.sekolah_id = sp.id OR (sp.email IS NOT NULL AND u.email = sp.email) OR u.email = CONCAT(sp.npsn, '@survasi.com')) AND u.is_active = TRUE
      WHERE ${whereSql}
      GROUP BY sp.id, sp.npsn, sp.nama, sp.jenjang, sp.status_sekolah, sp.akreditasi, sp.alamat, sp.email, sp.telepon, sp.total_guru, sp.total_siswa, sp.latitude, sp.longitude, sp.status_pengisian, sp.last_updated, k.nama, kb.id, kb.nama
      ORDER BY 
        CASE 
          WHEN sp.status_pengisian = 'sudah' THEN 1
          WHEN sp.status_pengisian = 'sebagian' THEN 2
          ELSE 3
        END ASC,
        sp.last_updated DESC,
        sp.nama ASC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countRows] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE ${whereSql}
    `, params);

    return res.json({
      success: true,
      data: rows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('[Sekolah] list error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sekolah/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        sp.*, k.nama AS kecamatan, kb.nama AS kabupaten, kb.id AS kabupaten_id
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      JOIN kabupaten kb ON k.kabupaten_id = kb.id
      WHERE sp.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/sekolah/:id ────────────────────────────────────────────────────
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const {
      nama, jenjang, status_sekolah, akreditasi, alamat,
      email, telepon, total_guru, total_siswa, status_pengisian
    } = req.body;

    await pool.execute(`
      UPDATE satuan_pendidikan SET
        nama = ?, jenjang = ?, status_sekolah = ?, akreditasi = ?,
        alamat = ?, email = ?, telepon = ?, total_guru = ?, total_siswa = ?,
        status_pengisian = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [nama, jenjang, status_sekolah, akreditasi, alamat, email, telepon,
      total_guru, total_siswa, status_pengisian, req.params.id]);

    return res.json({ success: true, message: 'Data sekolah berhasil diperbarui.' });
  } catch (err) {
    console.error('[Sekolah] update error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/sekolah/:id (Soft Delete) ───────────────────────────────────
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const sekolahId = req.params.id;
    await pool.execute('UPDATE satuan_pendidikan SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [sekolahId]);
    return res.json({ success: true, message: 'Data sekolah berhasil dihapus (soft delete). Data masih bisa dipulihkan jika diperlukan.' });
  } catch (err) {
    console.error('[Sekolah] delete error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus data sekolah.' });
  }
});

// ─── POST /api/sekolah/:id/restore (Restore Soft-Deleted School) ────────────
router.post('/:id/restore', adminOnly, async (req, res) => {
  try {
    const sekolahId = req.params.id;
    await pool.execute('UPDATE satuan_pendidikan SET deleted_at = NULL WHERE id = ?', [sekolahId]);
    return res.json({ success: true, message: 'Data sekolah berhasil dipulihkan (restore).' });
  } catch (err) {
    console.error('[Sekolah] restore error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memulihkan data sekolah.' });
  }
});

// ─── POST /api/sekolah/:id/reminder (Send Real Reminder to School) ──────────
router.post('/:id/reminder', adminOnly, async (req, res) => {
  try {
    const sekolahId = parseInt(req.params.id);

    const [rows] = await pool.execute(`
      SELECT sp.id, sp.nama AS sekolah_nama, sp.email AS sekolah_email, u.id AS user_id, u.email AS user_email
      FROM satuan_pendidikan sp
      LEFT JOIN users u ON (u.sekolah_id = sp.id OR (sp.email IS NOT NULL AND u.email = sp.email) OR u.email = CONCAT(sp.npsn, '@survasi.com')) AND u.is_active = TRUE
      WHERE sp.id = ?
    `, [sekolahId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan.' });
    }

    const school = rows[0];
    if (!school.user_id) {
      return res.status(400).json({
        success: false,
        is_registered: false,
        message: `Sekolah ${school.sekolah_nama} belum memiliki akun terdaftar atau email terhubung. Admin tidak dapat mengirimkan reminder.`
      });
    }

    await pool.execute(`
      INSERT INTO notifikasi (user_id, judul, pesan, tipe)
      VALUES (?, ?, ?, 'survey_reminder')
    `, [
      school.user_id,
      'Pengingat Pengisian Kuesioner BSAN',
      `Yth. Tim Pengelola ${school.sekolah_nama}, mohon untuk segera melengkapi Formulir Kuesioner Monitoring BSAN.`
    ]);

    return res.json({
      success: true,
      is_registered: true,
      message: `Pengingat survei berhasil dikirimkan ke akun ${school.sekolah_nama}!`
    });

  } catch (err) {
    console.error('[Sekolah] Send reminder error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengirimkan pengingat.' });
  }
});

// ─── GET /api/sekolah/:id/answers (Get Real Survey Answers from MySQL) ──────
router.get('/:id/answers', async (req, res) => {
  try {
    const sekolahId = parseInt(req.params.id);

    // Fetch latest responden for this school
    const [respRows] = await pool.execute(`
      SELECT id, nama, jenis_kelamin, posisi, submitted_at
      FROM responden_survey
      WHERE sekolah_id = ?
      ORDER BY submitted_at DESC, id DESC
      LIMIT 1
    `, [sekolahId]);

    const responden = respRows.length > 0 ? respRows[0] : null;

    // Fetch all active questions along with actual answers (if any)
    const [rows] = await pool.execute(`
      SELECT 
        ps.id AS pertanyaan_id,
        ps.kode_pertanyaan,
        ps.teks_pertanyaan,
        ps.tipe,
        ps.section,
        js.jawaban_terstruktur,
        js.jawaban_bebas,
        js.jawaban_multi
      FROM pertanyaan_survey ps
      LEFT JOIN jawaban_survey js ON ps.id = js.pertanyaan_id AND js.responden_id = ?
      WHERE ps.is_active = 1
      ORDER BY ps.urutan ASC
    `, [responden ? responden.id : 0]);

    const data = rows.map(r => {
      let val = r.jawaban_terstruktur || r.jawaban_bebas || null;
      if (!val && r.jawaban_multi) {
        try {
          val = JSON.parse(r.jawaban_multi).join(', ');
        } catch {
          val = r.jawaban_multi;
        }
      }
      return {
        id: r.pertanyaan_id,
        kode: r.kode_pertanyaan,
        pertanyaan: r.teks_pertanyaan,
        section: r.section,
        tipe: r.tipe,
        jawaban: val || 'Belum diisi oleh responden'
      };
    });

    return res.json({
      success: true,
      responden,
      data
    });
  } catch (err) {
    console.error('[Sekolah] Get answers error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat jawaban responden.' });
  }
});

module.exports = router;
