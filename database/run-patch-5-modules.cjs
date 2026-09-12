const pool = require('../server/db/pool');

async function runPatch5Modules() {
  const conn = await pool.getConnection();
  try {
    console.log('Updating modul_bsan to 5 rows and mapping questions 1..5...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await conn.query('TRUNCATE TABLE modul_bsan');

    await conn.query(`
      INSERT INTO modul_bsan (id, kode, nama, nama_en, subtitle, subtitle_en, warna, ikon, urutan, is_active) VALUES
      (1, 'with_myself', 'Modul 1: Literasi & Numerasi Dasar', 'With Myself', 'Media ajar, sudut baca & keaktifan KBM', 'Understanding and managing emotions', '#4A57C4', 'brain', 1, 1),
      (2, 'with_others', 'Modul 2: Disiplin Positif & Antiperundungan', 'With Others', 'Kesepakatan kelas & penanganan perundungan', 'Forming and sustaining positive relationships', '#10B981', 'users', 2, 1),
      (3, 'with_challenges', 'Modul 3: Kesehatan Emosi & Pengelolaan Stres', 'With Our Challenges', 'Refleksi emosi & roda perasaan', 'Making the most out of life', '#8B5CF6', 'heart', 3, 1),
      (4, 'modul_4', 'Modul 4: Kebersihan & Kesehatan Lingkungan', 'Module 4', 'Fasilitas sanitasi & iklim sekolah aman', 'Environment & safety', '#F59E0B', 'target', 4, 1),
      (5, 'modul_5', 'Modul 5: Kemitraan Orang Tua & Komite', 'Module 5', 'Kolaborasi paguyuban & refleksi bersama', 'Parent partnership', '#EC4899', 'users', 5, 1)
    `);

    // Reset all modul_id
    await conn.query('UPDATE pertanyaan_survey SET modul_id = NULL');

    // Modul 1: Literasi & Numerasi Dasar (Q9 - Q15)
    await conn.query(`UPDATE pertanyaan_survey SET modul_id = 1 WHERE id BETWEEN 9 AND 15 OR section = 'implementasi_awal'`);

    // Modul 2: Disiplin Positif & Antiperundungan (Q16 - Q21)
    await conn.query(`UPDATE pertanyaan_survey SET modul_id = 2 WHERE id BETWEEN 16 AND 21 OR section = 'implementasi_tinggi'`);

    // Modul 3: Kesehatan Emosi & Pengelolaan Stres (Q22 - Q26)
    await conn.query(`UPDATE pertanyaan_survey SET modul_id = 3 WHERE id BETWEEN 22 AND 26 OR section = 'refleksi'`);

    // Modul 4: Kebersihan & Kesehatan Lingkungan (Q27 - Q31)
    await conn.query(`UPDATE pertanyaan_survey SET modul_id = 4 WHERE id BETWEEN 27 AND 31`);

    // Modul 5: Kemitraan Orang Tua & Komite (Q32 - Q37)
    await conn.query(`UPDATE pertanyaan_survey SET modul_id = 5 WHERE id BETWEEN 32 AND 37 OR section = 'kepsek'`);

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    const [rows] = await conn.query('SELECT modul_id, COUNT(*) as total FROM pertanyaan_survey WHERE modul_id IS NOT NULL GROUP BY modul_id ORDER BY modul_id');
    console.log('Mapped questions per module:', rows);

    console.log('Successfully updated 5 modules mapping!');
  } catch (err) {
    console.error('Error running 5 modules patch:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

runPatch5Modules();
