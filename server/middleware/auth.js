'use strict';
/**
 * @file middleware/auth.js
 * @description JWT authentication middleware — validasi Bearer token di setiap request.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware: verifikasi JWT token dari header Authorization.
 * Jika valid, set req.user = payload token.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan. Silakan login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Sesi login sudah berakhir. Silakan login kembali.'
      : 'Token tidak valid.';
    return res.status(401).json({ success: false, message: msg });
  }
}

/**
 * Middleware: hanya izinkan role admin.
 * Gunakan SETELAH authMiddleware.
 */
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang diizinkan.' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
