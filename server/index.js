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

const express     = require('express');
const cors        = require('cors');
const morgan      = require('morgan');
const helmet      = require('helmet');
const compression = require('compression');
const hpp         = require('hpp');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust reverse proxy (Nginx / Cloudflare) to get real client IP for rate limiters
app.set('trust proxy', 1);

// ─── HTTP Response Compression (Gzip / Brotli) ──────────────────────────────
app.use(compression({
  level: 6,
  threshold: 1024, // Compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// ─── Security Headers (Helmet) & Anti-HPP ────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
}));
app.disable('x-powered-by'); // Sembunyikan header Express
app.use(hpp()); // HTTP Parameter Pollution protection
app.use('/api', globalLimiter); // Apply Rate Limiting ke semua endpoint /api

// ─── Middleware ───────────────────────────────────────────────────────────────

// CORS — izinkan semua origin di production/tunnel
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.options('*', cors());

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

// ─── Serve React Static SPA Frontend (dist folder) ───────────────────────────
const path = require('path');
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for React SPA Router routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});


// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, async () => {
  console.log(`\n🚀 BSAN Jatim API Server running on http://localhost:${PORT}`);
  console.log(`   ENV  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB   : ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
  console.log(`   CORS : ${process.env.CORS_ORIGINS || '*'}\n`);

  // Auto-patch MySQL DB schema on startup (deleted_at soft-delete & school_select type)
  try {
    const pool = require('./db/pool');
    
    // Auto-patch 'school_select' type
    await pool.execute(`
      ALTER TABLE pertanyaan_survey
      MODIFY COLUMN tipe VARCHAR(50) NOT NULL DEFAULT 'text'
    `).catch(() => {});
    await pool.execute(`
      UPDATE pertanyaan_survey
      SET tipe = 'school_select'
      WHERE kode_pertanyaan = 'Q4' OR LOWER(teks_pertanyaan) LIKE '%asal sekolah%'
    `).catch(() => {});

    // Auto-patch 'deleted_at' soft-delete column across key tables
    const tables = [
      'users',
      'satuan_pendidikan',
      'responden_survey',
      'sel_sesi_observasi',
      'sel_indikator',
      'pertanyaan_survey',
      'suara_responden',
      'tantangan_implementasi'
    ];

    for (const table of tables) {
      await pool.execute(`
        ALTER TABLE ${table}
        ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
      `).catch(() => {}); // Ignored if column already exists
    }

    console.log('✓ Auto-patch MySQL: Soft delete (deleted_at) columns & Q4 school_select active.');
  } catch (err) {
    console.warn('[Server] DB auto-patch skipped:', err.message);
  }
});

module.exports = app;
