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
    const secret = process.env.JWT_SECRET || 'survasi_jwt_secret_key_development_32chars_min';
    const payload = jwt.verify(token, secret);
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

/**
 * Middleware fleksibel: izinkan role yang berada dalam daftar allowedRoles.
 * Contoh: roleGuard('admin', 'pengawas')
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Halaman/API ini hanya untuk role: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}

module.exports = { authMiddleware, adminOnly, roleGuard };

