'use strict';
/**
 * @file db/pool.js
 * @description MySQL2 connection pool — Optimized for production performance & high concurrency.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'db_survasi',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '12'), // Max 12 active connections for 2GB RAM VM efficiency
  maxIdle: parseInt(process.env.DB_MAX_IDLE || '5'),                   // Keep up to 5 idle connections for instant reuse
  idleTimeout: 60000,               // Close idle connections after 60s
  queueLimit: 0,
  enableKeepAlive: true,            // Keep TCP connections alive
  keepAliveInitialDelay: 0,
  timezone: '+07:00',               // WIB
  charset: 'utf8mb4',
  decimalNumbers: true,             // Return DECIMAL as number, not string
});

// Test koneksi saat startup
pool.getConnection()
  .then(conn => {
    console.log('[DB] ✅ MySQL Connected & Optimized —', process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('[DB] ❌ MySQL Connection Failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
