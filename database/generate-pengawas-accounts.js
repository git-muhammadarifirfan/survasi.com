/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GENERATE AKUN PENGAWAS — BSAN JATIM MONITORING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Script Node.js untuk generate akun pengawas dari data sekolah di MySQL.
 *
 * Password formula:
 *   password = kata_pertama_nama_sekolah_lowercase + 4_digit_terakhir_NPSN
 *   Contoh  : "SDN Candi 1" / NPSN 20512345 → 'sdn2345'
 *
 * @usage
 *   1. Pastikan .env sudah diisi (copy dari server/.env.example)
 *   2. jalankan dari root project:
 *      node database/generate-pengawas-accounts.js
 *   3. Script akan INSERT semua sekolah yang belum punya akun pengawas
 *
 * @output
 *   - Baris INSERTED: akun baru dibuat
 *   - Baris SKIPPED : sekolah sudah punya akun (skip duplikasi)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';
require('dotenv').config({ path: './server/.env' });

const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

/**
 * Hitung password dari nama sekolah + NPSN
 * Contoh: "SDN Candi 1", "20512345" → "sdn2345"
 */
function buildPassword(namaSekolah, npsn) {
  const firstWord = namaSekolah.trim().split(/\s+/)[0].toLowerCase()
    .replace(/[^a-z0-9]/g, '');           // hanya huruf/angka
  const last4     = String(npsn).slice(-4);
  return `${firstWord}${last4}`;
}

async function main() {
  const pool = await mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASS     || '',
    database: process.env.DB_NAME     || 'bsan_jatim_monitoring',
  });

  console.log('🔗 Connected to MySQL:', process.env.DB_NAME);

  try {
    // Ambil semua sekolah
    const [schools] = await pool.execute(`
      SELECT sp.id, sp.npsn, sp.nama, sp.kecamatan_id, k.kabupaten_id, k.nama AS kecamatan_nama
      FROM satuan_pendidikan sp
      JOIN kecamatan k ON sp.kecamatan_id = k.id
      ORDER BY k.kabupaten_id, k.nama, sp.nama
    `);

    console.log(`📚 Total sekolah ditemukan: ${schools.length}`);

    let inserted = 0;
    let skipped  = 0;
    let errors   = 0;

    for (const school of schools) {
      try {
        const { id: sekolahId, npsn, nama, kecamatan_id, kabupaten_id } = school;
        const email    = `${npsn}@survasi.com`;
        const password = buildPassword(nama, npsn);
        const hash     = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // Cek apakah sudah ada akun
        const [existing] = await pool.execute(
          `SELECT id FROM users WHERE sekolah_id = ? AND role = 'pengawas' LIMIT 1`,
          [sekolahId]
        );

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Insert user
        const [result] = await pool.execute(`
          INSERT INTO users
            (nama, email, password_hash, role, sekolah_id, kecamatan_id, kabupaten_id, jabatan, instansi, is_active)
          VALUES (?, ?, ?, 'pengawas', ?, ?, ?, 'Kepala Sekolah / Pengawas', ?, TRUE)
        `, [
          `Kepala Sekolah ${nama}`,
          email,
          hash,
          sekolahId,
          kecamatan_id,
          kabupaten_id,
          nama,
        ]);

        // Buat preferensi default
        await pool.execute(
          `INSERT INTO user_preferences (user_id) VALUES (?)`,
          [result.insertId]
        );

        inserted++;
        if (inserted % 50 === 0) {
          console.log(`  ✅ ${inserted} akun dibuat...`);
        }
      } catch (err) {
        errors++;
        console.error(`  ❌ Error sekolah ${school.npsn} (${school.nama}):`, err.message);
      }
    }

    console.log('\n══════════════════════════════════════');
    console.log(`✅ Akun dibuat  : ${inserted}`);
    console.log(`⏭  Dilewati     : ${skipped} (sudah ada)`);
    console.log(`❌ Error        : ${errors}`);
    console.log('══════════════════════════════════════');
    console.log('\n📋 Password Formula: kata_pertama_nama_sekolah + 4_digit_terakhir_NPSN');
    console.log('   Contoh: SDN Waru 2 / NPSN 20510002 → password: sdn0002');
    console.log('   Contoh: MI Al-Hidayah / NPSN 60712100 → password: mi2100\n');

  } finally {
    await pool.end();
    console.log('🔌 MySQL connection closed.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
