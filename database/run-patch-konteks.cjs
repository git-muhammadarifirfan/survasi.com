'use strict';
const pool = require('../server/db/pool');

async function runPatchKonteks() {
  try {
    console.log('🔄 Creating sel_konteks_options table in MySQL...');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sel_konteks_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kategori VARCHAR(50) NOT NULL COMMENT 'lokasi, waktu, jangkauan, mapel',
        label VARCHAR(255) NOT NULL,
        value_code VARCHAR(100) NOT NULL,
        urutan INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Table sel_konteks_options created or already exists.');

    const [mapelCount] = await pool.execute(`SELECT COUNT(*) as count FROM sel_konteks_options WHERE kategori = 'mapel'`);
    if (mapelCount[0].count === 0) {
      console.log('🌱 Seeding default SEL Mapel options...');
      const mapelSeed = [
        ['mapel', 'Tematik', 'Tematik', 1, 1],
        ['mapel', 'Bahasa Indonesia', 'Bahasa Indonesia', 2, 1],
        ['mapel', 'Matematika', 'Matematika', 3, 1],
        ['mapel', 'IPA (Ilmu Pengetahuan Alam)', 'IPA', 4, 1],
        ['mapel', 'IPS (Ilmu Pengetahuan Sosial)', 'IPS', 5, 1],
        ['mapel', 'PJOK / Olahraga', 'PJOK', 6, 1],
        ['mapel', 'Pendidikan Agama', 'PAI', 7, 1],
        ['mapel', 'Seni Budaya & Prakarya', 'SBdP', 8, 1],
      ];
      for (const row of mapelSeed) {
        await pool.execute(
          `INSERT INTO sel_konteks_options (kategori, label, value_code, urutan, is_active) VALUES (?, ?, ?, ?, ?)`,
          row
        );
      }
      console.log('✓ Mapel options seeded.');
    }

    const [rows] = await pool.execute(`SELECT * FROM sel_konteks_options ORDER BY kategori, urutan`);
    console.log('\n📊 Data Opsi Konteks di MySQL:');
    console.table(rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating/seeding sel_konteks_options:', err.message);
    process.exit(1);
  }
}

runPatchKonteks();
