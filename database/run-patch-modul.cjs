const pool = require('../server/db/pool');

async function runPatch() {
  console.log('[DB Patch] Updating modul_id in pertanyaan_survey...');
  
  try {
    await pool.execute('ALTER TABLE `pertanyaan_survey` ADD COLUMN `modul_id` INT NULL COMMENT "FK ke modul_bsan.id"');
  } catch (e) {
    // Column already exists
  }

  // Ensure 5 Modul BSAN exist in modul_bsan table
  await pool.execute(`
    INSERT INTO \`modul_bsan\` (\`id\`, \`kode\`, \`nama\`, \`nama_en\`, \`subtitle\`, \`subtitle_en\`, \`warna\`, \`ikon\`, \`urutan\`, \`is_active\`) VALUES
    (1, 'modul_1', 'Modul 1: Literasi & Numerasi Dasar', 'Module 1', 'Media ajar, sudut baca & keaktifan KBM', 'Teaching media & literacy', '#4A57C4', 'brain', 1, 1),
    (2, 'modul_2', 'Modul 2: Disiplin Positif & Antiperundungan', 'Module 2', 'Kesepakatan kelas & penanganan perundungan', 'Positive discipline', '#10B981', 'users', 2, 1),
    (3, 'modul_3', 'Modul 3: Kesehatan Emosi & Pengelolaan Stres', 'Module 3', 'Refleksi emosi & roda perasaan', 'Emotional wellbeing', '#8B5CF6', 'heart', 3, 1),
    (4, 'modul_4', 'Modul 4: Kebersihan & Kesehatan Lingkungan', 'Module 4', 'Fasilitas sanitasi & iklim sekolah aman', 'Environment & safety', '#F59E0B', 'target', 4, 1),
    (5, 'modul_5', 'Modul 5: Kemitraan Orang Tua & Komite', 'Module 5', 'Kolaborasi paguyuban & refleksi bersama', 'Parent partnership', '#EC4899', 'users', 5, 1)
    ON DUPLICATE KEY UPDATE
      \`kode\` = VALUES(\`kode\`),
      \`nama\` = VALUES(\`nama\`),
      \`subtitle\` = VALUES(\`subtitle\`),
      \`warna\` = VALUES(\`warna\`),
      \`ikon\` = VALUES(\`ikon\`),
      \`urutan\` = VALUES(\`urutan\`)
  `);

  await pool.execute(`
    UPDATE \`pertanyaan_survey\` 
    SET \`modul_id\` = 1 
    WHERE \`kode_pertanyaan\` IN ('Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16', 'Q22', 'Q23', 'Q24', 'Q25')
       OR (\`section\` IN ('pelatihan', 'implementasi_awal') AND \`modul_id\` IS NULL AND \`kode_pertanyaan\` NOT IN ('Q17','Q18','Q19','Q20','Q21'))
  `);

  await pool.execute(`
    UPDATE \`pertanyaan_survey\` 
    SET \`modul_id\` = 2 
    WHERE \`kode_pertanyaan\` IN ('Q17', 'Q18', 'Q19', 'Q20', 'Q21')
  `);

  await pool.execute(`
    UPDATE \`pertanyaan_survey\` 
    SET \`modul_id\` = 3 
    WHERE \`kode_pertanyaan\` IN ('Q26', 'Q27', 'Q28', 'Q29', 'Q30')
  `);

  await pool.execute(`
    UPDATE \`pertanyaan_survey\` 
    SET \`modul_id\` = 4 
    WHERE \`kode_pertanyaan\` IN ('Q31', 'Q32') OR \`section\` = 'kepsek'
  `);

  await pool.execute(`
    UPDATE \`pertanyaan_survey\` 
    SET \`modul_id\` = 5 
    WHERE \`kode_pertanyaan\` IN ('Q33', 'Q34', 'Q35', 'Q36') OR \`section\` = 'refleksi'
  `);

  const [summary] = await pool.execute(`
    SELECT 
      COALESCE(p.modul_id, 0) AS modul_id,
      CASE 
        WHEN p.modul_id = 1 THEN 'Modul 1: Literasi & Numerasi Dasar'
        WHEN p.modul_id = 2 THEN 'Modul 2: Disiplin Positif & Antiperundungan'
        WHEN p.modul_id = 3 THEN 'Modul 3: Kesehatan Emosi & Pengelolaan Stres'
        WHEN p.modul_id = 4 THEN 'Modul 4: Kebersihan & Kesehatan Lingkungan'
        WHEN p.modul_id = 5 THEN 'Modul 5: Kemitraan Orang Tua & Komite'
        ELSE 'Umum / Demografi'
      END AS nama_modul,
      COUNT(*) AS jumlah_pertanyaan
    FROM pertanyaan_survey p
    WHERE p.is_active = 1
    GROUP BY p.modul_id
    ORDER BY p.modul_id
  `);

  console.log('[DB Patch] ✅ Patch applied successfully! Breakdown:');
  console.table(summary);
  process.exit(0);
}

runPatch().catch(err => {
  console.error('[DB Patch] ❌ Error:', err);
  process.exit(1);
});
