'use strict';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BSAN JAWA TIMUR MONITORING SYSTEM — Backend API Server
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * REST API Express.js server yang terhubung ke MySQL database.
 * Semua endpoint di-prefix dengan /api.
 *
 * @port    PORT env variable (default: 3001)
 * @base    /api
 *
 * Routes:
 *   /api/auth         → Login, Logout, Profil, Ganti Password
 *   /api/dashboard    → KPI, Chart, Aktivitas, Follow-up
 *   /api/sekolah      → Master data satuan pendidikan
 *   /api/responden    → Data responden survey
 *   /api/analisis     → Modul BSAN, Proporsi, Funnel, Matriks, Tantangan
 *   /api/sel          → Observasi SEL (indikator, sesi, analisis)
 *   /api/suara        → Suara responden & narasi
 *   /api/laporan      → Riwayat & generate export
 *   /api/setting      → Profil, Preferensi, Notifikasi, User Mgmt
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const helmet  = require('helmet');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();

// ─── Security Headers (Helmet) & Rate Limiting ────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.disable('x-powered-by'); // Sembunyikan header Express
app.use('/api', globalLimiter); // Apply Rate Limiting ke semua endpoint /api

// ─── Middleware ───────────────────────────────────────────────────────────────

// CORS — izinkan origin frontend
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (Postman, curl, dll) di development
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger (compact format di production)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BSAN Jatim API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/notifikasi', require('./routes/notifikasi'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/sekolah',    require('./routes/sekolah'));
app.use('/api/responden',  require('./routes/responden'));
app.use('/api/analisis',   require('./routes/analisis'));
app.use('/api/sel',        require('./routes/sel'));
app.use('/api/survey',     require('./routes/survey'));
app.use('/api/suara',      require('./routes/suara'));
app.use('/api/laporan',    require('./routes/laporan'));
app.use('/api/setting',    require('./routes/setting'));


// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.path} tidak ditemukan.` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, () => {
  console.log(`\n🚀 BSAN Jatim API Server running on http://localhost:${PORT}`);
  console.log(`   ENV  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB   : ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
  console.log(`   CORS : ${allowedOrigins.join(', ')}\n`);
});

module.exports = app;
