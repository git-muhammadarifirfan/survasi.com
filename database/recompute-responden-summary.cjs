/**
 * Hitung ulang kolom ringkasan responden_survey (penerima_modul, penyelenggara_pelatihan,
 * status_implementasi, kelas_mengajar, posisi, jenis_kelamin, no_wa) dari jawaban_survey
 * memakai pemetaan peran pertanyaan (server/utils/surveyRoles.js).
 *
 * Memperbaiki data lama yang tersimpan saat form masih memetakan jawaban berdasarkan
 * index pertanyaan (bergeser). Hanya kolom yang jawabannya valid yang diperbarui.
 *
 * Pemakaian:  node database/recompute-responden-summary.cjs [--dry-run]
 */
const path = require('path');
process.chdir(path.join(__dirname, '../server'));
require(path.join(__dirname, '../server/node_modules/dotenv')).config({ path: path.join(__dirname, '../server/.env') });

const pool = require('../server/db/pool');
const {
  loadRoleMap, parseMulti, isPlaceholder,
  toPenerimaModul, toStatusImplementasi, toJenisKelamin,
} = require('../server/utils/surveyRoles');

const DRY = process.argv.includes('--dry-run');

function value(a) {
  if (!a) return null;
  const multi = parseMulti(a.jawaban_multi);
  if (multi.length) return multi;
  if (!isPlaceholder(a.jawaban_terstruktur)) return String(a.jawaban_terstruktur).trim();
  if (!isPlaceholder(a.jawaban_bebas)) return String(a.jawaban_bebas).trim();
  return null;
}

(async () => {
  const { byRole } = await loadRoleMap();
  const [resps] = await pool.execute('SELECT * FROM responden_survey WHERE deleted_at IS NULL');
  let changed = 0;

  for (const r of resps) {
    const [ans] = await pool.execute('SELECT * FROM jawaban_survey WHERE responden_id = ?', [r.id]);
    const byQ = new Map(ans.map(a => [a.pertanyaan_id, a]));
    const get = (role) => (byRole[role] ? value(byQ.get(byRole[role].id)) : null);

    const upd = {};
    const pen = toPenerimaModul(get('penerima_modul'));
    if (pen) upd.penerima_modul = pen;

    const peny = get('penyelenggara');
    if (peny) upd.penyelenggara_pelatihan = Array.isArray(peny) ? peny.join(', ') : peny;

    const st = toStatusImplementasi(get('status_implementasi'));
    if (st) upd.status_implementasi = (pen || r.penerima_modul) === 'Ya' ? st : null;

    const kelas = get('kelas_mengajar');
    if (kelas && !Array.isArray(kelas)) upd.kelas_mengajar = kelas.substring(0, 50);

    const posisi = get('posisi');
    if (posisi && !Array.isArray(posisi)) upd.posisi = posisi.substring(0, 100);

    const jk = toJenisKelamin(get('jenis_kelamin'));
    if (jk) upd.jenis_kelamin = jk;

    const wa = get('no_wa');
    if (wa && !Array.isArray(wa)) upd.no_wa = wa.replace(/[^\d+]/g, '').substring(0, 20) || null;

    const diff = Object.entries(upd).filter(([k, v]) => (r[k] ?? null) !== (v ?? null));
    if (!diff.length) continue;
    changed++;
    console.log(`#${r.id} ${r.nama}:`, Object.fromEntries(diff.map(([k, v]) => [k, `${r[k]} → ${v}`])));
    if (!DRY) {
      await pool.execute(
        `UPDATE responden_survey SET ${diff.map(([k]) => `${k} = ?`).join(', ')} WHERE id = ?`,
        [...diff.map(([, v]) => v), r.id]
      );
    }
  }

  console.log(`${DRY ? '[DRY RUN] ' : ''}${changed} responden diperbarui dari ${resps.length}.`);
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
