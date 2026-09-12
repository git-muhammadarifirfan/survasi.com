const pool = require('../server/db/pool');

async function runFix() {
  const conn = await pool.getConnection();
  try {
    console.log('Restoring modul_bsan to 3 CASEL/BSAN Framework modules...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await conn.query('TRUNCATE TABLE modul_bsan');

    await conn.query(`
      INSERT INTO modul_bsan (id, kode, nama, nama_en, subtitle, subtitle_en, warna, ikon, urutan, is_active) VALUES
      (1, 'with_myself', 'With Myself (Dengan Diriku)', 'With Myself', 'Memahami dan mengelola emosi, literasi & numerasi', 'Understanding and managing emotions', '#4A57C4', 'brain', 1, 1),
      (2, 'with_others', 'With Others (Dengan Orang Lain)', 'With Others', 'Membangun disiplin positif, anti perundungan & kemitraan', 'Forming and sustaining positive relationships', '#10B981', 'users', 2, 1),
      (3, 'with_challenges', 'With Our Challenges (Tantangan Kita)', 'With Our Challenges', 'Pengelolaan fasilitas, refleksi & mengatasi hambatan', 'Making the most out of life', '#F59E0B', 'target', 3, 1)
    `);

    console.log('Updating pertanyaan_survey modul_id mapping to modules 1, 2, 3...');
    // Clear modul_id first
    await conn.query('UPDATE pertanyaan_survey SET modul_id = NULL');

    // Map questions to With Myself (id 1)
    await conn.query(`
      UPDATE pertanyaan_survey 
      SET modul_id = 1 
      WHERE section IN ('pelatihan', 'implementasi_awal') 
         OR id BETWEEN 6 AND 15
    `);

    // Map questions to With Others (id 2)
    await conn.query(`
      UPDATE pertanyaan_survey 
      SET modul_id = 2 
      WHERE section IN ('implementasi_tinggi', 'kepsek') 
         OR id BETWEEN 16 AND 26
    `);

    // Map questions to With Our Challenges (id 3)
    await conn.query(`
      UPDATE pertanyaan_survey 
      SET modul_id = 3 
      WHERE section IN ('refleksi', 'kontak') 
         OR id >= 27
    `);

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Successfully restored modul_bsan and updated question mapping!');
  } catch (err) {
    console.error('Error running fix script:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

runFix();
