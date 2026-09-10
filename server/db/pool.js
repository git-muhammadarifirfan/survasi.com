'use strict';
/**
 * @file db/pool.js
 * @description MySQL2 connection pool — single instance reusable di seluruh server.
 * Gunakan pool.query() atau pool.execute() untuk semua query database.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'bsan_jatim_monitoring',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '+07:00',         // WIB
  charset: 'utf8mb4',
  decimalNumbers: true,             // Return DECIMAL as number, not string
});

// Test koneksi saat startup
pool.getConnection()
  .then(conn => {
    console.log('[DB] ✅ MySQL Connected —', process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('[DB] ❌ MySQL Connection Failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
