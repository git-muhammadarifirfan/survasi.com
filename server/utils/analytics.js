'use strict';
/**
 * @file utils/analytics.js
 * @description Mesin olah data analisis BSAN — semua angka dihitung langsung dari
 *   tabel responden_survey + jawaban_survey + pertanyaan_survey (data real),
 *   tanpa nilai default/dummy. Dipakai oleh dashboard, modul, proporsi, funnel.
 */

const pool = require('../db/pool');
const {
  loadRoleMap, parseMulti, parseOptions, isPlaceholder, answerToText,
} = require('./surveyRoles');

// ─── Filter wilayah ──────────────────────────────────────────────────────────

/** Ambil filter wilayah dari query string (kabupaten_id, kecamatan_id / kecamatan nama). */
function parseFilter(query = {}) {
  const kabupatenId = query.kabupaten_id ? parseInt(query.kabupaten_id, 10) || null : null;
  const kecamatanId = query.kecamatan_id ? parseInt(query.kecamatan_id, 10) || null : null;
  const kecamatanNama = query.kecamatan
    ? String(query.kecamatan).replace(/^Kec(amatan)?\.?\s*/i, '').trim() || null
    : null;
  return { kabupatenId, kecamatanId, kecamatanNama };
}

/**
 * WHERE fragment untuk tabel yang punya alias kecamatan `k` & kabupaten `kb`.
 * @returns {{ sql: string, params: any[] }}
 */
function wilayahWhere(f, kAlias = 'k', kbAlias = 'kb', spAlias = 'sp') {
  const parts = [];
  const params = [];
  if (f.sekolahId) { parts.push(`${spAlias}.id = ?`); params.push(f.sekolahId); }
  if (f.kabupatenId) { parts.push(`${kbAlias}.id = ?`); params.push(f.kabupatenId); }
  if (f.kecamatanId) { parts.push(`${kAlias}.id = ?`); params.push(f.kecamatanId); }
  if (f.kecamatanNama) { parts.push(`${kAlias}.nama = ?`); params.push(f.kecamatanNama); }
  return { sql: parts.length ? ' AND ' + parts.join(' AND ') : '', params };
}

// ─── Pemuatan data responden + jawaban ──────────────────────────────────────

/**
 * Muat responden aktif (tidak dihapus) sesuai filter beserta seluruh jawabannya.
 * Responden hasil seed lama yang hanya berisi placeholder tetap dimuat, tetapi
 * jawaban placeholder ("Jawaban esai") diabaikan dalam perhitungan.
 */
async function loadResponses(f) {
  const w = wilayahWhere(f);
  const [respondents] = await pool.execute(`
    SELECT rs.id, rs.nama, rs.jenis_kelamin, rs.posisi, rs.sekolah_id,
           rs.penerima_modul, rs.status_implementasi, rs.kelas_mengajar,
           rs.penyelenggara_pelatihan, rs.submitted_at, rs.created_at,
           sp.nama AS sekolah, sp.npsn, k.id AS kecamatan_id, k.nama AS kecamatan,
           kb.id AS kabupaten_id, kb.nama AS kabupaten
    FROM responden_survey rs
    JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
    JOIN kecamatan k ON sp.kecamatan_id = k.id
    JOIN kabupaten kb ON k.kabupaten_id = kb.id
    WHERE rs.deleted_at IS NULL AND sp.deleted_at IS NULL ${w.sql}
  `, w.params);

  const answersByResp = new Map();
  if (respondents.length) {
    const ids = respondents.map(r => r.id);
    // Chunk agar IN (...) tetap wajar untuk ribuan responden
    for (let i = 0; i < ids.length; i += 1000) {
      const chunk = ids.slice(i, i + 1000);
      const [rows] = await pool.query(
        `SELECT responden_id, pertanyaan_id, jawaban_terstruktur, jawaban_bebas, jawaban_multi
         FROM jawaban_survey WHERE responden_id IN (?)`,
        [chunk]
      );
      for (const a of rows) {
        if (!answersByResp.has(a.responden_id)) answersByResp.set(a.responden_id, new Map());
        answersByResp.get(a.responden_id).set(a.pertanyaan_id, a);
      }
    }
  }

  const roleMap = await loadRoleMap();
  return { respondents, answersByResp, ...roleMap };
}

/** Nilai jawaban terstruktur (string) atau array checkbox dari baris jawaban */
function answerValue(a) {
  if (!a) return null;
  const multi = parseMulti(a.jawaban_multi);
  if (multi.length) return multi;
  if (!isPlaceholder(a.jawaban_terstruktur)) return String(a.jawaban_terstruktur).trim();
  if (!isPlaceholder(a.jawaban_bebas)) return String(a.jawaban_bebas).trim();
  return null;
}

// ─── Skor evaluatif ──────────────────────────────────────────────────────────

/** Peran yang bersifat deskriptif (bukan capaian) — tidak dihitung ke progres */
const NON_EVALUATIVE = new Set([
  'nama', 'jenis_kelamin', 'posisi', 'sekolah', 'kabupaten', 'kecamatan', 'no_wa',
  'kelas_mengajar', 'penyelenggara', 'mudah_awal', 'sulit_awal', 'mudah_tinggi', 'sulit_tinggi',
  'media_awal', 'media_tinggi',
]);

const NONE_OPTION = /^(belum ada|tidak ada|tidak)$/i;

/**
 * Skor 0..1 sebuah jawaban, atau null bila tidak evaluatif.
 *  - Pilihan tunggal: "Ya/Sudah/>70%/disusun bersama murid" = 1, "sebagian/50%/proses/disiapkan guru" = 0.5,
 *    "Tidak/Belum/Kurang" = 0.
 *  - Checkbox (dukungan kepsek, program sekolah): 1 bila memilih minimal satu bentuk nyata, 0 bila "Belum ada".
 */
function scoreAnswer(q, role, value) {
  if (value == null || NON_EVALUATIVE.has(role) || q.tipe === 'text') return null;
  if (Array.isArray(value)) {
    if (!value.length) return null;
    return value.some(v => !NONE_OPTION.test(String(v).trim())) ? 1 : 0;
  }
  const s = String(value).toLowerCase().trim();
  if (/^(tidak|belum)|kurang dari/.test(s)) return 0;
  if (/sebagian|50%|dalam proses|disiapkan guru/.test(s)) return 0.5;
  if (/^(ya|sudah)|lebih dari|seluruh|dengan murid|rutin|lengkap/.test(s)) return 1;
  return null; // opsi netral yang tidak bisa dinilai
}

/**
 * Skor kuesioner BSAN per sekolah (0-100) = rata-rata skor seluruh jawaban evaluatif
 * responden sekolah tersebut. Sekolah tanpa jawaban evaluatif → tidak ada di Map.
 * @returns {Promise<Map<number, number>>}
 */
async function computeSchoolScores(f) {
  const { respondents, answersByResp, questions, roleById } = await loadResponses(f);
  const qById = new Map(questions.map(q => [q.id, q]));
  const agg = new Map();
  for (const r of respondents) {
    const answers = answersByResp.get(r.id);
    if (!answers) continue;
    for (const [qid, a] of answers) {
      const q = qById.get(qid);
      if (!q) continue;
      const sc = scoreAnswer(q, roleById[qid], answerValue(a));
      if (sc == null) continue;
      const g = agg.get(r.sekolah_id) || { sum: 0, n: 0 };
      g.sum += sc;
      g.n++;
      agg.set(r.sekolah_id, g);
    }
  }
  const out = new Map();
  for (const [id, g] of agg) out.set(id, Math.round((g.sum / g.n) * 100));
  return out;
}

// ─── Breakdown modul ─────────────────────────────────────────────────────────

const PALETTE = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

/**
 * Hitung distribusi jawaban per pertanyaan per modul + progres capaian modul.
 * @returns {Promise<{ modules: object[], totalResponden: number }>}
 */
async function computeModulBreakdown(f) {
  const [modulRows] = await pool.execute(
    `SELECT id, framework_key, kode, nama, urutan FROM modul_bsan WHERE is_active = 1 ORDER BY urutan ASC`
  );
  const data = await loadResponses(f);
  const { respondents, answersByResp, questions, roleById } = data;

  const activeQs = questions
    .filter(q => q.is_active && q.modul_id)
    .sort((a, b) => a.urutan - b.urutan || a.id - b.id);

  const modules = modulRows.map(m => {
    let scoreSum = 0;
    let scoreCount = 0;
    const respondenSet = new Set();

    const qs = activeQs.filter(q => q.modul_id === m.id).map(q => {
      const role = roleById[q.id] || null;
      const opts = parseOptions(q.opsi_jawaban);
      const counts = {};
      let answered = 0;
      let qScoreSum = 0;
      let qScoreCount = 0;

      for (const r of respondents) {
        const val = answerValue(answersByResp.get(r.id)?.get(q.id));
        if (val == null || (Array.isArray(val) && !val.length)) continue;
        answered++;
        respondenSet.add(r.id);
        if (Array.isArray(val)) val.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
        else if (q.tipe !== 'text') counts[val] = (counts[val] || 0) + 1;

        const sc = scoreAnswer(q, role, val);
        if (sc != null) { qScoreSum += sc; qScoreCount++; }
      }
      scoreSum += qScoreSum;
      scoreCount += qScoreCount;

      const labels = opts.length
        ? [...opts, ...Object.keys(counts).filter(k => !opts.includes(k))]
        : Object.keys(counts);
      const options = q.tipe === 'text' ? [] : labels.map((label, idx) => {
        const count = counts[label] || 0;
        return {
          label,
          count,
          percent: answered ? Math.round((count / answered) * 1000) / 10 : 0,
          color: PALETTE[idx % PALETTE.length],
        };
      });

      return {
        id: q.id,
        kode: q.kode_pertanyaan,
        q: String(q.teks_pertanyaan || '').trim(),
        tipe: q.tipe,
        role,
        evaluatif: qScoreCount > 0,
        skor: qScoreCount ? Math.round((qScoreSum / qScoreCount) * 100) : null,
        total_responden: answered,
        options,
      };
    });

    const progres = scoreCount ? Math.round((scoreSum / scoreCount) * 100) : 0;
    return {
      modul_id: m.id,
      framework_key: m.framework_key,
      kode: m.kode,
      title: m.nama,
      progres,
      jumlah_jawaban_evaluatif: scoreCount,
      total_responden: respondenSet.size,
      questions: qs,
    };
  });

  return { modules, totalResponden: respondents.length };
}

// ─── Proporsi ────────────────────────────────────────────────────────────────

/** Hitung frekuensi opsi untuk satu peran pertanyaan (single/checkbox). */
function frequencyForRole(data, role, filterResp = () => true) {
  const q = data.byRole[role];
  if (!q) return { question: null, items: [], answered: 0 };
  const opts = parseOptions(q.opsi_jawaban);
  const counts = {};
  let answered = 0;
  for (const r of data.respondents) {
    if (!filterResp(r)) continue;
    const val = answerValue(data.answersByResp.get(r.id)?.get(q.id));
    if (val == null || (Array.isArray(val) && !val.length)) continue;
    answered++;
    (Array.isArray(val) ? val : [val]).forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  }
  const labels = opts.length ? [...opts, ...Object.keys(counts).filter(k => !opts.includes(k))] : Object.keys(counts);
  const items = labels
    .map(label => ({
      label,
      jumlah: counts[label] || 0,
      persen: answered ? Math.round(((counts[label] || 0) / answered) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.jumlah - a.jumlah);
  return { question: String(q.teks_pertanyaan || '').trim(), items, answered };
}

/** Kumpulkan jawaban teks bebas untuk satu peran (narasi). */
function narrativesForRole(data, role, limit = 50) {
  const q = data.byRole[role];
  if (!q) return [];
  const out = [];
  for (const r of data.respondents) {
    const a = data.answersByResp.get(r.id)?.get(q.id);
    const text = a ? answerToText(a) : '';
    if (!text) continue;
    out.push({ responden: r.nama, sekolah: r.sekolah, kecamatan: r.kecamatan, teks: text, tanggal: r.submitted_at });
  }
  out.sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
  return out.slice(0, limit);
}

const pct = (n, d) => (d ? Math.round((n / d) * 1000) / 10 : 0);

async function computeProporsi(f) {
  const data = await loadResponses(f);
  const R = data.respondents;
  const total = R.length;

  // 1. Penerima modul
  const ya = R.filter(r => r.penerima_modul === 'Ya').length;
  const proporsiPenerima = { ya: pct(ya, total), tidak: pct(total - ya, total), jumlahYa: ya, jumlahTidak: total - ya, totalResponden: total };

  // 2. Per kecamatan
  const byKec = new Map();
  for (const r of R) {
    const g = byKec.get(r.kecamatan) || { kecamatan: r.kecamatan, kabupaten: r.kabupaten, total: 0, ya: 0, sudah: 0, sebagian: 0, belumImpl: 0 };
    g.total++;
    if (r.penerima_modul === 'Ya') {
      g.ya++;
      if (r.status_implementasi === 'sudah') g.sudah++;
      else if (r.status_implementasi === 'sebagian') g.sebagian++;
      else g.belumImpl++;
    }
    byKec.set(r.kecamatan, g);
  }
  const distribusiPerKecamatan = [...byKec.values()]
    .map(g => ({ kecamatan: g.kecamatan, kabupaten: g.kabupaten, total: g.total, jumlahYa: g.ya, ya: pct(g.ya, g.total), tidak: pct(g.total - g.ya, g.total) }))
    .sort((a, b) => b.ya - a.ya || b.total - a.total);

  const implRow = (label, rows) => {
    const t = rows.length;
    const belumMenerima = rows.filter(r => r.penerima_modul !== 'Ya').length;
    const sudah = rows.filter(r => r.penerima_modul === 'Ya' && r.status_implementasi === 'sudah').length;
    const sebagian = rows.filter(r => r.penerima_modul === 'Ya' && r.status_implementasi === 'sebagian').length;
    const tidakMenerapkan = t - belumMenerima - sudah - sebagian;
    return {
      label, total: t,
      belumMenerima: pct(belumMenerima, t), tidakMenerapkan: pct(tidakMenerapkan, t),
      sebagian: pct(sebagian, t), sudah: pct(sudah, t),
    };
  };
  const groupBy = (key) => {
    const m = new Map();
    for (const r of R) {
      const k = r[key] || 'Tidak diisi';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(r);
    }
    return m;
  };
  const statusImplementasiPosisi = [...groupBy('posisi')].map(([k, rows]) => ({ posisi: k, ...implRow(k, rows) }))
    .sort((a, b) => b.total - a.total);
  const statusImplementasiKecamatan = [...groupBy('kecamatan')].map(([k, rows]) => ({ kecamatan: k, ...implRow(k, rows) }))
    .sort((a, b) => b.sudah - a.sudah || b.total - a.total);

  const implTotal = implRow('Semua', R);

  // 3. Penyelenggara pelatihan (checkbox) — hanya dari yang menerima modul
  const penyelenggara = frequencyForRole(data, 'penyelenggara');

  // 4. Kemudahan / kesulitan & media per kelas
  const awal = (r) => /awal/i.test(r.kelas_mengajar || '');
  const tinggi = (r) => /tinggi/i.test(r.kelas_mengajar || '');
  const toModul = (fr) => fr.items.map(i => ({ modul: i.label, persen: i.persen, jumlah: i.jumlah }));
  const mudahAwal = frequencyForRole(data, 'mudah_awal');
  const sulitAwal = frequencyForRole(data, 'sulit_awal');
  const mudahTinggi = frequencyForRole(data, 'mudah_tinggi');
  const sulitTinggi = frequencyForRole(data, 'sulit_tinggi');
  const mediaAwal = frequencyForRole(data, 'media_awal');
  const mediaTinggi = frequencyForRole(data, 'media_tinggi');

  // 5. Keaktifan siswa (gabungan kelas awal + tinggi)
  const keaktifanMap = new Map();
  for (const role of ['keaktifan_awal', 'keaktifan_tinggi']) {
    for (const it of frequencyForRole(data, role).items) {
      keaktifanMap.set(it.label, (keaktifanMap.get(it.label) || 0) + it.jumlah);
    }
  }
  const keaktifanTotal = [...keaktifanMap.values()].reduce((a, b) => a + b, 0);
  const keterlibatanSiswa = [...keaktifanMap].map(([kategori, jumlah]) => ({ kategori, jumlah, persen: pct(jumlah, keaktifanTotal) }));

  // 6. Refleksi & kesepakatan kelas
  const mergeRoles = (roles) => {
    const m = new Map();
    let answered = 0;
    for (const role of roles) {
      const fr = frequencyForRole(data, role);
      answered += fr.answered;
      for (const it of fr.items) m.set(it.label, (m.get(it.label) || 0) + it.jumlah);
    }
    return [...m].map(([label, jumlah]) => ({ label, jumlah, persen: pct(jumlah, answered) })).sort((a, b) => b.jumlah - a.jumlah);
  };
  const refleksiMurid = mergeRoles(['refleksi_murid_awal', 'refleksi_murid_tinggi']);
  const refleksiGuruFreq = mergeRoles(['refleksi_guru_awal', 'refleksi_guru_tinggi']);
  const kesepakatanKelas = mergeRoles(['kesepakatan_awal', 'kesepakatan_tinggi']);

  // 7. Dukungan kepsek & program sekolah (checkbox)
  const dukungan = frequencyForRole(data, 'dukungan_kepsek');
  const program = frequencyForRole(data, 'program_sekolah');

  // 8. Narasi
  const refleksiGuru = [
    ...narrativesForRole(data, 'temuan_guru_awal', 10),
    ...narrativesForRole(data, 'temuan_guru_tinggi', 10),
    ...narrativesForRole(data, 'temuan_murid_awal', 10),
    ...narrativesForRole(data, 'temuan_murid_tinggi', 10),
  ].map(n => n.teks);

  // 9. Profil sekolah (data master satuan_pendidikan — real, bukan survei)
  const w = wilayahWhere(f);
  const [profilRows] = await pool.execute(`
    SELECT k.nama AS kecamatan, COUNT(sp.id) AS jumlah_sekolah,
           SUM(sp.total_guru) AS total_guru, SUM(sp.total_siswa) AS total_siswa,
           SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) AS sudah,
           SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS proses
    FROM satuan_pendidikan sp
    JOIN kecamatan k ON sp.kecamatan_id = k.id
    JOIN kabupaten kb ON k.kabupaten_id = kb.id
    WHERE sp.deleted_at IS NULL ${w.sql}
    GROUP BY k.id, k.nama
    ORDER BY k.nama
  `, w.params);
  const profilSekolah = profilRows.map(r => ({
    kecamatan: r.kecamatan,
    jumlahSekolah: Number(r.jumlah_sekolah || 0),
    totalGuru: Number(r.total_guru || 0),
    totalSiswa: Number(r.total_siswa || 0),
    rasio: Number(r.total_guru) > 0 ? Math.round((Number(r.total_siswa) / Number(r.total_guru)) * 10) / 10 : 0,
    cakupan: pct(Number(r.sudah || 0), Number(r.jumlah_sekolah || 0)),
  }));

  return {
    totalResponden: total,
    totalSekolahResponden: new Set(R.map(r => r.sekolah_id)).size,
    proporsiPenerima,
    distribusiPerKecamatan,
    implementasiTotal: implTotal,
    statusImplementasiPosisi,
    statusImplementasiKecamatan,
    penyelenggaraPelatihan: penyelenggara.items.map(i => ({ nama: i.label, jumlah: i.jumlah, persen: i.persen })),
    penyelenggaraAnswered: penyelenggara.answered,
    kemudahanModul: {
      kelasAwal: { mudah: toModul(mudahAwal), sulit: toModul(sulitAwal), answered: mudahAwal.answered },
      kelasTinggi: { mudah: toModul(mudahTinggi), sulit: toModul(sulitTinggi), answered: mudahTinggi.answered },
    },
    mediaPembelajaran: {
      kelasAwal: mediaAwal.items.map(i => ({ media: i.label, persen: i.persen, jumlah: i.jumlah })),
      kelasTinggi: mediaTinggi.items.map(i => ({ media: i.label, persen: i.persen, jumlah: i.jumlah })),
      answeredAwal: mediaAwal.answered,
      answeredTinggi: mediaTinggi.answered,
    },
    keterlibatanSiswa,
    keterlibatanAnswered: keaktifanTotal,
    refleksiMurid,
    refleksiGuruFreq,
    kesepakatanKelas,
    refleksiGuru,
    dukunganKepsek: dukungan.items.map(i => ({ metode: i.label, jumlah: i.jumlah, persen: i.persen })),
    dukunganAnswered: dukungan.answered,
    rencanaAksi: program.items.map(i => ({ program: i.label, jumlah: i.jumlah, persen: i.persen })),
    programAnswered: program.answered,
    profilSekolah,
    kelasAwalResponden: R.filter(awal).length,
    kelasTinggiResponden: R.filter(tinggi).length,
  };
}

module.exports = {
  parseFilter,
  wilayahWhere,
  loadResponses,
  answerValue,
  scoreAnswer,
  computeSchoolScores,
  computeModulBreakdown,
  computeProporsi,
  frequencyForRole,
  narrativesForRole,
  pct,
};
