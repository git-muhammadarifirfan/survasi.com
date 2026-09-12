'use strict';
/**
 * @file middleware/rateLimiter.js
 * @description Anti-DDoS, Rate Limiting & Anti-Spam middleware
 */

const rateLimit = require('express-rate-limit');

// ── 1. Global Limiter (semua request API) ────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 300, // max 300 request per IP per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini. Silakan coba lagi setelah 15 menit.'
  }
});

// ── 2. Login Limiter (Cegah Brute-force Login) ──────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // max 10 percobaan login per IP per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login yang gagal. Akun dikunci sementara selama 15 menit demi keamanan.'
  }
});

// ── 3. Register Limiter (Pendaftaran Akun Baru) ─────────────────────────────
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 50, // max 50 percobaan pendaftaran per IP per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan pendaftaran dari IP ini. Mohon tunggu 15 menit sebelum mencoba lagi.'
  }
});

// ── 4. Submit Limiter (Cegah Spam Submission Survei & SEL) ─────────────────
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 15, // max 15 kali submit per 10 menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak pengiriman form dari koneksi ini. Mohon tunggu 10 menit sebelum mengirim kembali.'
  }
});

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  submitLimiter,
};

