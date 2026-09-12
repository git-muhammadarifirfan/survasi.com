'use strict';
/**
 * @file routes/auth.js
 * @description Authentication routes — Login, Register, OTP Verification, Password Reset
 *
 * POST   /api/auth/login             → login dengan email atau NPSN
 * POST   /api/auth/register-sekolah  → register akun sekolah + kirim OTP
 * POST   /api/auth/register-pengawas → register akun pengawas + kirim OTP
 * POST   /api/auth/forgot-password   → kirim OTP reset password ke email terdaftar
 * POST   /api/auth/resend-otp        → kirim ulang kode OTP (kode lama hangus)
 * POST   /api/auth/verify-otp        → verifikasi kode OTP
 * POST   /api/auth/reset-password    → reset password setelah OTP terverifikasi
 * POST   /api/auth/logout            → logout (log activity)
 * GET    /api/auth/me                → profil + preferensi user
 * PUT    /api/auth/password           → ganti password (sudah login)
 */

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { sendOtpEmail } = require('../mailer');

// ─── In-memory OTP store (email → { code, expiresAt, type, nama }) ──────────
// For production: use Redis or DB table. For this app, in-memory is sufficient.
const otpStore = new Map();

function storeOtp(email, code, type = 'verification', nama = '') {
  otpStore.set(email.toLowerCase(), {
    code: String(code),
    type,
    nama,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
  });
}

function verifyOtp(email, code) {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return { valid: false, reason: 'Kode OTP tidak ditemukan. Silakan minta kode baru.' };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.' };
  }
  if (entry.code !== String(code)) {
    return { valid: false, reason: 'Kode OTP salah. Periksa kembali kode yang dikirim ke email Anda.' };
  }
  return { valid: true, type: entry.type };
}

function consumeOtp(email) {
  otpStore.delete(email.toLowerCase());
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    const cleanIdentifier = String(identifier || '').trim().toLowerCase();
    const cleanPassword   = String(password || '').trim();

    if (!cleanIdentifier || !cleanPassword) {
      return res.status(400).json({ success: false, message: 'Email/NPSN dan password wajib diisi.' });
    }

    // Cari user berdasarkan email ATAU NPSN sekolah
    const [rows] = await pool.execute(`
      SELECT
        u.id, u.nama, u.email, u.password_hash,
        u.role, u.sekolah_id, u.kabupaten_id, u.kecamatan_id,
        u.jabatan, u.instansi, u.is_active,
        sp.nama  AS sekolah_nama,
        sp.npsn  AS sekolah_npsn,
        kb.nama  AS kabupaten_nama,
        k.nama   AS kecamatan_nama
      FROM users u
      LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
      LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
      LEFT JOIN kecamatan k  ON u.kecamatan_id = k.id
      WHERE (LOWER(u.email) = ? OR sp.npsn = ?) AND u.is_active = TRUE
      LIMIT 1
    `, [cleanIdentifier, cleanIdentifier]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email/NPSN atau password salah.' });
    }

    const user = rows[0];

    // Verifikasi password
    const match = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Email/NPSN atau password salah.' });
    }

    // Update last_login
    await pool.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Log activity
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    await pool.execute(
      `INSERT INTO activity_log (user_id, aksi, detail, ip_address) VALUES (?, 'login', ?, ?)`,
      [user.id, JSON.stringify({ email: user.email, user_agent: req.headers['user-agent'] || '' }), ip]
    ).catch(() => { }); // Non-blocking

    // Buat JWT
    const tokenPayload = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      sekolah_id: user.sekolah_id,
      kabupaten_id: user.kabupaten_id,
      kecamatan_id: user.kecamatan_id,
    };

    const secret = process.env.JWT_SECRET || 'survasi_jwt_secret_key_development_32chars_min';
    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    delete user.password_hash;

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        jabatan: user.jabatan,
        instansi: user.instansi,
        sekolah_id: user.sekolah_id,
        sekolah_nama: user.sekolah_nama,
        sekolah_npsn: user.sekolah_npsn,
        kabupaten_nama: user.kabupaten_nama,
        kecamatan_nama: user.kecamatan_nama,
      },
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Coba lagi nanti.' });
  }
});

// ─── POST /api/auth/register-sekolah ─────────────────────────────────────────
router.post('/register-sekolah', registerLimiter, async (req, res) => {
  try {
    const { nama, email, password, sekolah_id } = req.body || {};

    const cleanNama = String(nama || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();
    const parsedSekolahId = parseInt(sekolah_id, 10);

    if (!cleanNama || !cleanEmail || !cleanPassword || !parsedSekolahId) {
      return res.status(400).json({
        success: false,
        message: 'Nama perwakilan, email, password, dan sekolah wajib diisi.'
      });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter.'
      });
    }

    // Get sekolah data
    const [sekolahRows] = await pool.execute(
      `SELECT sp.id, sp.nama, sp.npsn, sp.kecamatan_id, k.kabupaten_id, kb.nama AS kabupaten_nama, k.nama AS kecamatan_nama
       FROM satuan_pendidikan sp
       LEFT JOIN kecamatan k ON sp.kecamatan_id = k.id
       LEFT JOIN kabupaten kb ON k.kabupaten_id = kb.id
       WHERE sp.id = ? LIMIT 1`,
      [parsedSekolahId]
    );

    if (sekolahRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sekolah yang dipilih tidak ditemukan dalam sistem.'
      });
    }

    const sekolah = sekolahRows[0];
    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    // Check if email already registered
    const [existingUsers] = await pool.execute(
      'SELECT id, is_active FROM users WHERE LOWER(email) = ? LIMIT 1',
      [cleanEmail]
    );

    if (existingUsers.length > 0 && existingUsers[0].is_active) {
      return res.status(409).json({
        success: false,
        message: 'Alamat email ini sudah terdaftar di sistem. Silakan login atau gunakan menu Lupa Kata Sandi.'
      });
    }

    // Check if selected school is already registered by another active user
    const [existingSekolahUser] = await pool.execute(
      'SELECT id, nama, email FROM users WHERE sekolah_id = ? AND is_active = TRUE AND LOWER(email) != ? LIMIT 1',
      [sekolah.id, cleanEmail]
    );

    if (existingSekolahUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Sekolah "${sekolah.nama}" sudah terdaftar oleh perwakilan akun (${existingSekolahUser[0].email}). Silakan hubungi admin atau login ke akun terdaftar.`
      });
    }

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      await pool.execute(
        `UPDATE users 
         SET nama = ?, password_hash = ?, role = 'sekolah', sekolah_id = ?, kabupaten_id = ?, kecamatan_id = ?, instansi = ?, is_active = TRUE, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [cleanNama, passwordHash, sekolah.id, sekolah.kabupaten_id || null, sekolah.kecamatan_id || null, sekolah.nama, userId]
      );
    } else {
      const [result] = await pool.execute(
        `INSERT INTO users (nama, email, password_hash, role, sekolah_id, kabupaten_id, kecamatan_id, instansi, is_active)
         VALUES (?, ?, ?, 'sekolah', ?, ?, ?, ?, TRUE)`,
        [cleanNama, cleanEmail, passwordHash, sekolah.id, sekolah.kabupaten_id || null, sekolah.kecamatan_id || null, sekolah.nama]
      );
      userId = result.insertId;
    }

    // Create user_preferences record
    await pool.execute(
      `INSERT INTO user_preferences (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id`,
      [userId]
    ).catch(() => {});

    // Generate OTP & send email (AWAIT — don't fire-and-forget)
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    storeOtp(cleanEmail, otpCode, 'verification', cleanNama);

    try {
      await sendOtpEmail({ toEmail: cleanEmail, recipientName: cleanNama, otpCode, type: 'verification' });
    } catch (emailErr) {
      console.error('[AUTH] Email send failed:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `Registrasi berhasil tetapi gagal mengirim email OTP: ${emailErr.message}. Silakan coba kirim ulang.`
      });
    }

    // Generate JWT token
    const tokenPayload = {
      id: userId,
      nama: cleanNama,
      email: cleanEmail,
      role: 'sekolah',
      sekolah_id: sekolah.id,
      kabupaten_id: sekolah.kabupaten_id,
      kecamatan_id: sekolah.kecamatan_id,
    };

    const secret = process.env.JWT_SECRET || 'survasi_jwt_secret_key_development_32chars_min';
    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return res.json({
      success: true,
      message: 'Registrasi berhasil! Kode OTP telah dikirim ke email Anda.',
      token,
      user: {
        id: userId,
        nama: cleanNama,
        email: cleanEmail,
        role: 'sekolah',
        sekolah_id: sekolah.id,
        sekolah_nama: sekolah.nama,
        sekolah_npsn: sekolah.npsn,
        kabupaten_nama: sekolah.kabupaten_nama,
        kecamatan_nama: sekolah.kecamatan_nama,
      }
    });

  } catch (err) {
    console.error('[AUTH] Register sekolah error:', err);
    return res.status(500).json({ success: false, message: 'Server error saat mendaftarkan akun sekolah.' });
  }
});

// ─── POST /api/auth/register-pengawas ────────────────────────────────────────
router.post('/register-pengawas', registerLimiter, async (req, res) => {
  try {
    const { nama, email, password } = req.body || {};

    const cleanNama = String(nama || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanNama || !cleanEmail || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap, email, dan password wajib diisi.'
      });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter.'
      });
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    const [existingUsers] = await pool.execute(
      'SELECT id, is_active FROM users WHERE LOWER(email) = ? LIMIT 1',
      [cleanEmail]
    );

    if (existingUsers.length > 0 && existingUsers[0].is_active) {
      return res.status(409).json({
        success: false,
        message: 'Alamat email ini sudah terdaftar di sistem. Silakan login atau gunakan menu Lupa Kata Sandi.'
      });
    }

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      await pool.execute(
        `UPDATE users 
         SET nama = ?, password_hash = ?, role = 'pengawas', instansi = 'Pengawas Sekolah', is_active = TRUE, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [cleanNama, passwordHash, userId]
      );
    } else {
      const [result] = await pool.execute(
        `INSERT INTO users (nama, email, password_hash, role, instansi, is_active)
         VALUES (?, ?, ?, 'pengawas', 'Pengawas Sekolah', TRUE)`,
        [cleanNama, cleanEmail, passwordHash]
      );
      userId = result.insertId;
    }

    await pool.execute(
      `INSERT INTO user_preferences (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id`,
      [userId]
    ).catch(() => {});

    // Generate OTP & send email (AWAIT)
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    storeOtp(cleanEmail, otpCode, 'verification', cleanNama);

    try {
      await sendOtpEmail({ toEmail: cleanEmail, recipientName: cleanNama, otpCode, type: 'verification' });
    } catch (emailErr) {
      console.error('[AUTH] Email send failed:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `Registrasi berhasil tetapi gagal mengirim email OTP: ${emailErr.message}. Silakan coba kirim ulang.`
      });
    }

    const tokenPayload = {
      id: userId,
      nama: cleanNama,
      email: cleanEmail,
      role: 'pengawas',
      sekolah_id: null,
      kabupaten_id: null,
      kecamatan_id: null,
    };

    const secret = process.env.JWT_SECRET || 'survasi_jwt_secret_key_development_32chars_min';
    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return res.json({
      success: true,
      message: 'Registrasi pengawas berhasil! Kode OTP telah dikirim ke email Anda.',
      token,
      user: {
        id: userId,
        nama: cleanNama,
        email: cleanEmail,
        role: 'pengawas',
        instansi: 'Pengawas Sekolah',
      }
    });

  } catch (err) {
    console.error('[AUTH] Register pengawas error:', err);
    return res.status(500).json({ success: false, message: 'Server error saat mendaftarkan akun pengawas.' });
  }
});

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────
router.post('/forgot-password', loginLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Alamat email wajib diisi.' });
    }

    // Check if email exists
    const [existingUsers] = await pool.execute(
      'SELECT id, nama FROM users WHERE LOWER(email) = ? AND is_active = TRUE LIMIT 1',
      [cleanEmail]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alamat email tersebut tidak terdaftar dalam sistem.'
      });
    }

    const user = existingUsers[0];
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    storeOtp(cleanEmail, otpCode, 'reset_password', user.nama);

    try {
      await sendOtpEmail({ toEmail: cleanEmail, recipientName: user.nama || 'Pengguna', otpCode, type: 'reset_password' });
    } catch (emailErr) {
      console.error('[AUTH] Email send failed:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `Gagal mengirim email reset password: ${emailErr.message}`
      });
    }

    return res.json({
      success: true,
      message: 'Kode OTP reset password telah dikirim ke email Anda (berlaku 30 menit).'
    });
  } catch (err) {
    console.error('[AUTH] Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengirim email reset kata sandi.' });
  }
});

// ─── POST /api/auth/resend-otp ───────────────────────────────────────────────
router.post('/resend-otp', registerLimiter, async (req, res) => {
  try {
    const { email, nama, type } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanNama = String(nama || 'Pengguna Survasi').trim();
    const otpType = type || 'verification';

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Alamat email wajib diisi.' });
    }

    // Generate new OTP (old one is automatically overwritten)
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    storeOtp(cleanEmail, otpCode, otpType, cleanNama);

    try {
      await sendOtpEmail({ toEmail: cleanEmail, recipientName: cleanNama, otpCode, type: otpType });
    } catch (emailErr) {
      console.error('[AUTH] Resend email failed:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `Gagal mengirim ulang kode OTP: ${emailErr.message}`
      });
    }

    return res.json({
      success: true,
      message: 'Kode OTP baru telah dikirim. Kode sebelumnya otomatis hangus.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengirim ulang kode OTP.' });
  }
});

// ─── POST /api/auth/verify-otp ──────────────────────────────────────────────
router.post('/verify-otp', registerLimiter, async (req, res) => {
  try {
    const { email, otp_code } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanCode = String(otp_code || '').trim();

    if (!cleanEmail || !cleanCode) {
      return res.status(400).json({ success: false, message: 'Email dan kode OTP wajib diisi.' });
    }

    const result = verifyOtp(cleanEmail, cleanCode);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.reason });
    }

    // For verification type, just confirm (don't consume yet for reset_password — need new password)
    if (result.type === 'verification') {
      consumeOtp(cleanEmail);
      return res.json({
        success: true,
        verified: true,
        type: 'verification',
        message: 'Verifikasi akun berhasil!'
      });
    }

    // For reset_password, don't consume yet — frontend needs to submit new password next
    return res.json({
      success: true,
      verified: true,
      type: 'reset_password',
      message: 'Kode OTP valid. Silakan masukkan kata sandi baru Anda.'
    });
  } catch (err) {
    console.error('[AUTH] Verify OTP error:', err);
    return res.status(500).json({ success: false, message: 'Server error saat verifikasi OTP.' });
  }
});

// ─── POST /api/auth/reset-password ──────────────────────────────────────────
router.post('/reset-password', registerLimiter, async (req, res) => {
  try {
    const { email, otp_code, new_password } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanCode = String(otp_code || '').trim();
    const cleanPassword = String(new_password || '').trim();

    if (!cleanEmail || !cleanCode || !cleanPassword) {
      return res.status(400).json({ success: false, message: 'Email, kode OTP, dan password baru wajib diisi.' });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    // Verify OTP one more time
    const result = verifyOtp(cleanEmail, cleanCode);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.reason });
    }

    // Update password in DB
    const newHash = await bcrypt.hash(cleanPassword, 12);
    const [updateResult] = await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE LOWER(email) = ? AND is_active = TRUE',
      [newHash, cleanEmail]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    // Consume OTP after successful reset
    consumeOtp(cleanEmail);

    return res.json({
      success: true,
      message: 'Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru Anda.'
    });
  } catch (err) {
    console.error('[AUTH] Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Server error saat reset password.' });
  }
});

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    await pool.execute(
      `INSERT INTO activity_log (user_id, aksi, ip_address) VALUES (?, 'logout', ?)`,
      [req.user.id, ip]
    ).catch(() => { });
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: true });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        u.id, u.nama, u.email, u.phone, u.role,
        u.jabatan, u.instansi, u.last_login,
        u.created_at, u.updated_at,
        up.bahasa, up.tema, up.auto_save_interval,
        up.notif_weekly_report, up.notif_instant_alert,
        up.notif_reminder_email, up.notif_system_update,
        sp.nama AS sekolah_nama, sp.npsn,
        kb.nama AS kabupaten_nama
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
      LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
      WHERE u.id = ?
    `, [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[AUTH] /me error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/auth/password ──────────────────────────────────────────────────
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });

    const match = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Password lama tidak sesuai.' });
    }

    const newHash = await bcrypt.hash(new_password, 12);
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, req.user.id]
    );

    return res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) {
    console.error('[AUTH] Change password error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
