'use strict';
/**
 * @file utils/surveyRoles.js
 * @description Memetakan pertanyaan survei BSAN ke "peran" semantiknya
 *   (nama, sekolah, penerima modul, media kelas awal, dst.) berdasarkan tipe,
 *   section, dan teks pertanyaan — BUKAN berdasarkan urutan/index.
 *
 *   Kode pertanyaan (Q1..Qn) bisa bergeser saat admin menambah/menghapus soal,
 *   sehingga semua olah data (submit, analisis, ekspor) memakai peta ini agar
 *   jawaban selalu dibaca dari pertanyaan yang benar.
 */

const pool = require('../db/pool');

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Aturan pencocokan. Urutan penting: aturan pertama yang cocok menang,
 * dan satu peran hanya diisi oleh satu pertanyaan (yang pertama).
 */
const RULES = [
  // ── Identitas (auto-fetch dari akun) ──
  { role: 'nama', test: (q, t) => q.section === 'identitas' && q.tipe === 'text' && /^nama\b/.test(t) },
  { role: 'jenis_kelamin', test: (q, t) => /jenis kelamin/.test(t) },
  { role: 'posisi', test: (q, t) => q.section === 'identitas' && /^posisi|jabatan/.test(t) },
  { role: 'sekolah', test: (q, t) => q.tipe === 'school_select' || /asal sekolah|nama sekolah/.test(t) },
  { role: 'kabupaten', test: (q, t) => q.tipe === 'kabupaten_select' || (q.section === 'identitas' && /^kabupaten/.test(t)) },
  { role: 'kecamatan', test: (q, t) => q.tipe === 'kecamatan_select' || (q.section === 'identitas' && /^kecamatan$/.test(t)) },

  // ── Pelatihan & implementasi ──
  { role: 'penerima_modul', test: (q, t) => /pernah mendapatkan materi/.test(t) },
  { role: 'penyelenggara', test: (q, t) => /mengadakan pelatihan|penyelenggara/.test(t) },
  { role: 'status_implementasi', test: (q, t) => /sudah mengimplementasikan/.test(t) },
  { role: 'kelas_mengajar', test: (q, t) => /mengajar di kelas/.test(t) },

  // ── Kelas awal ──
  { role: 'mudah_awal', test: (q, t) => q.section === 'implementasi_awal' && /mudah/.test(t) },
  { role: 'sulit_awal', test: (q, t) => q.section === 'implementasi_awal' && /sulit/.test(t) },
  { role: 'media_awal', test: (q, t) => q.section === 'implementasi_awal' && /media/.test(t) },
  { role: 'keaktifan_awal', test: (q, t) => q.section === 'implementasi_awal' && /keaktifan/.test(t) },
  { role: 'refleksi_murid_awal', test: (q, t) => q.section === 'implementasi_awal' && /refleksi dengan murid/.test(t) },
  { role: 'temuan_murid_awal', test: (q, t) => q.section === 'implementasi_awal' && /temuan/.test(t) && /murid/.test(t) },
  { role: 'refleksi_guru_awal', test: (q, t) => q.section === 'implementasi_awal' && /refleksi dengan guru/.test(t) },
  { role: 'temuan_guru_awal', test: (q, t) => q.section === 'implementasi_awal' && /temuan/.test(t) && /guru/.test(t) },
  { role: 'kesepakatan_awal', test: (q, t) => q.section === 'implementasi_awal' && /kesepakatan kelas/.test(t) },

  // ── Kelas tinggi ──
  { role: 'mudah_tinggi', test: (q, t) => q.section === 'implementasi_tinggi' && /mudah/.test(t) },
  { role: 'sulit_tinggi', test: (q, t) => q.section === 'implementasi_tinggi' && /sulit/.test(t) },
  { role: 'media_tinggi', test: (q, t) => q.section === 'implementasi_tinggi' && /media/.test(t) },
  { role: 'keaktifan_tinggi', test: (q, t) => q.section === 'implementasi_tinggi' && /keaktifan/.test(t) },
  { role: 'refleksi_murid_tinggi', test: (q, t) => q.section === 'implementasi_tinggi' && /refleksi dengan murid/.test(t) },
  { role: 'temuan_murid_tinggi', test: (q, t) => q.section === 'implementasi_tinggi' && /temuan/.test(t) && /murid/.test(t) },
  { role: 'refleksi_guru_tinggi', test: (q, t) => q.section === 'implementasi_tinggi' && /refleksi dengan guru/.test(t) },
  { role: 'temuan_guru_tinggi', test: (q, t) => q.section === 'implementasi_tinggi' && /temuan/.test(t) && /guru/.test(t) },
  { role: 'kesepakatan_tinggi', test: (q, t) => q.section === 'implementasi_tinggi' && /kesepakatan kelas/.test(t) },

  // ── Kepala sekolah & refleksi ──
  { role: 'dukungan_kepsek', test: (q, t) => /dukungan kepala sekolah/.test(t) },
  { role: 'program_sekolah', test: (q, t) => /program sekolah/.test(t) },
  { role: 'hal_baik', test: (q, t) => /hal baik|perubahan baik/.test(t) },
  { role: 'tantangan', test: (q, t) => /tantangan dan kendala|kendala/.test(t) },
  { role: 'relevansi', test: (q, t) => /relevan/.test(t) },
  { role: 'manfaat', test: (q, t) => /membantu pekerjaan/.test(t) },
  { role: 'no_wa', test: (q, t) => /\bno\.? ?wa\b|whatsapp|nomor wa/.test(t) },
];

/** Peran identitas yang nilainya diambil dari akun & disimpan sebagai kolom responden */
const IDENTITY_ROLES = ['nama', 'jenis_kelamin', 'posisi', 'sekolah', 'kabupaten', 'kecamatan'];

/**
 * Bangun peta role → pertanyaan dari daftar pertanyaan.
 * Pertanyaan aktif diprioritaskan di atas pertanyaan nonaktif (historis).
 * @param {Array} questions baris pertanyaan_survey
 * @returns {{ byRole: Record<string, object>, roleById: Record<number, string> }}
 */
function buildRoleMap(questions) {
  const sorted = [...questions].sort((a, b) =>
    (Number(b.is_active) - Number(a.is_active)) || (a.urutan - b.urutan) || (a.id - b.id)
  );
  const byRole = {};
  const roleById = {};
  for (const q of sorted) {
    const t = norm(q.teks_pertanyaan);
    for (const rule of RULES) {
      if (byRole[rule.role]) continue;
      if (rule.test(q, t)) {
        byRole[rule.role] = q;
        roleById[q.id] = rule.role;
        break;
      }
    }
  }
  return { byRole, roleById };
}

/** Ambil semua pertanyaan (termasuk nonaktif, untuk jawaban historis) lalu petakan. */
async function loadRoleMap(conn = pool) {
  const [questions] = await conn.execute(`
    SELECT id, modul_id, kode_pertanyaan, teks_pertanyaan, tipe, opsi_jawaban,
           urutan, section, target_kelas, is_active
    FROM pertanyaan_survey
    WHERE deleted_at IS NULL
  `);
  return { questions, ...buildRoleMap(questions) };
}

/** Parse jawaban_multi JSON secara aman → array string */
function parseMulti(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map(String);
  try {
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Parse opsi_jawaban JSON secara aman → array string */
function parseOptions(val) {
  return parseMulti(val);
}

/** Nilai jawaban yang tidak bermakna (placeholder seed lama) */
function isPlaceholder(v) {
  return v == null || String(v).trim() === '' || String(v).trim().toLowerCase() === 'jawaban esai';
}

/** Representasi teks satu baris jawaban_survey */
function answerToText(a) {
  const multi = parseMulti(a.jawaban_multi);
  if (multi.length) return multi.join('; ');
  if (!isPlaceholder(a.jawaban_terstruktur)) return String(a.jawaban_terstruktur).trim();
  if (!isPlaceholder(a.jawaban_bebas)) return String(a.jawaban_bebas).trim();
  return '';
}

// ── Normalisasi nilai ringkasan responden ──

function toPenerimaModul(v) {
  const s = norm(v);
  if (!s) return null;
  if (/^(sudah|ya)/.test(s)) return 'Ya';
  return 'Tidak'; // Belum / Dalam Proses / Tidak
}

function toStatusImplementasi(v) {
  const s = norm(v);
  if (!s) return null;
  if (/seluruh|penuh/.test(s)) return 'sudah';
  if (/sebagian/.test(s)) return 'sebagian';
  if (/^tidak|belum/.test(s)) return 'belum';
  if (/^(ya|sudah)/.test(s)) return 'sudah';
  return null;
}

function toJenisKelamin(v) {
  const s = norm(v);
  if (!s) return null;
  if (s === 'p' || s.startsWith('perempuan') || s.startsWith('wanita')) return 'P';
  if (s === 'l' || s.startsWith('laki')) return 'L';
  return null;
}

module.exports = {
  IDENTITY_ROLES,
  buildRoleMap,
  loadRoleMap,
  parseMulti,
  parseOptions,
  isPlaceholder,
  answerToText,
  toPenerimaModul,
  toStatusImplementasi,
  toJenisKelamin,
};
