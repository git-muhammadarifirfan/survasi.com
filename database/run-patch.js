'use strict';
const pool = require('../server/db/pool');

async function runPatch() {
  try {
    console.log('🔄 Executing MySQL database patch...');
    await pool.execute(`
      ALTER TABLE pertanyaan_survey
      MODIFY COLUMN tipe VARCHAR(50) NOT NULL DEFAULT 'text'
    `);
    console.log('✓ ALTER TABLE pertanyaan_survey succeeded.');

    const [res] = await pool.execute(`
      UPDATE pertanyaan_survey
      SET tipe = 'school_select'
      WHERE kode_pertanyaan = 'Q4' OR LOWER(teks_pertanyaan) LIKE '%asal sekolah%'
    `);
    console.log(`✓ UPDATE Q4 (Asal Sekolah) succeeded. Affected rows: ${res.affectedRows}`);

    const [rows] = await pool.execute(`
      SELECT id, kode_pertanyaan, teks_pertanyaan, tipe, section 
      FROM pertanyaan_survey 
      WHERE kode_pertanyaan = 'Q4' OR tipe = 'school_select'
    `);
    console.log('\n📊 Verifikasi Data di MySQL:');
    console.table(rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing database patch:', err.message);
    process.exit(1);
  }
}

runPatch();
