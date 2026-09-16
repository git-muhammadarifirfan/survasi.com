'use strict';
/**
 * Script untuk mengosongkan/membersihkan semua data pengisian kuesioner dan observasi
 * pengawas & sekolah di database MySQL db_survasi.
 */
const pool = require('../server/db/pool');

async function resetPengisianData() {
  let conn;
  try {
    console.log('🔄 Memulai proses reset data pengisian survei & observasi...');
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. Hapus tabel jawaban dan sesi SEL
    const [delSelJawaban] = await conn.query('DELETE FROM sel_jawaban_observasi');
    console.log(`✓ Terhapus ${delSelJawaban.affectedRows} baris sel_jawaban_observasi.`);

    const [delSelSesi] = await conn.query('DELETE FROM sel_sesi_observasi');
    console.log(`✓ Terhapus ${delSelSesi.affectedRows} baris sel_sesi_observasi.`);

    // 2. Hapus tabel jawaban & responden survey (Dapodik / Pengawas)
    const [delJawaban] = await conn.query('DELETE FROM jawaban_survey');
    console.log(`✓ Terhapus ${delJawaban.affectedRows} baris jawaban_survey.`);

    const [delResponden] = await conn.query('DELETE FROM responden_survey');
    console.log(`✓ Terhapus ${delResponden.affectedRows} baris responden_survey.`);

    // 3. Reset status pengisian semua sekolah di satuan_pendidikan menjadi 'belum'
    const [resetSekolah] = await conn.query(`
      UPDATE satuan_pendidikan
      SET status_pengisian = 'belum', last_updated = NULL
    `);
    console.log(`✓ Ter-reset status pengisian ${resetSekolah.affectedRows} sekolah menjadi 'belum'.`);

    await conn.commit();
    console.log('\n✅ Reset data pengisian BERHASIL. Database kini 0 clean.');
    process.exit(0);
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('❌ Gagal mereset data pengisian:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

resetPengisianData();
