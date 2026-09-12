'use strict';
/**
 * @file server/mailer.js
 * @description Brevo Transactional Email Sender — REST API v3 only (reliable delivery)
 */

function getBrevoConfig() {
  return {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'info@ovixydigital.my.id',
    senderName: process.env.BREVO_SENDER_NAME || 'Survasi Platform',
  };
}

/**
 * Verify Brevo API connection on startup & print clean terminal status log
 */
async function verifyBrevoConnection() {
  const config = getBrevoConfig();
  try {
    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': config.apiKey, 'accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ [BREVO MAIL SERVICE CONNECTED] Account: ${data.email} | Sender: ${config.senderEmail} | Credits: ${data.plan?.[0]?.credits ?? 'Active'}`);
      return true;
    } else {
      const errData = await res.json().catch(() => ({}));
      console.error(`❌ [BREVO SERVICE DISCONNECTED] Status ${res.status}: ${errData.message || 'Invalid API key.'}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ [BREVO NETWORK ERROR]: ${err.message}`);
    return false;
  }
}

// Run connection verification immediately
verifyBrevoConnection();

/**
 * Send OTP / Verification email via Brevo REST API v3
 * Returns { success, messageId } or throws on failure
 */
async function sendOtpEmail({ toEmail, recipientName, otpCode, type = 'verification' }) {
  const config = getBrevoConfig();
  const isVerification = type === 'verification';
  const subject = isVerification
    ? `Kode Verifikasi Akun Survasi: ${otpCode}`
    : `Reset Kata Sandi Survasi: ${otpCode}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #059669; color: #ffffff; padding: 24px; text-align: center; }
        .body { padding: 32px; color: #334155; }
        .otp-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #064e3b; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0; font-size: 20px;">Survasi Platform</h2>
          <p style="margin:4px 0 0; font-size:12px; opacity: 0.9;">${isVerification ? 'Verifikasi Pendaftaran Akun' : 'Reset Kata Sandi'}</p>
        </div>
        <div class="body">
          <p style="font-size:14px; margin-top: 0;">Halo, <strong>${recipientName || 'Pengguna'}</strong>,</p>
          <p style="font-size:13px; color: #475569;">${isVerification ? 'Terima kasih telah mendaftar. Gunakan kode 6-digit berikut untuk memverifikasi akun Anda:' : 'Gunakan kode 6-digit berikut untuk mereset kata sandi Anda:'}</p>
          
          <div class="otp-box">
            <div style="font-size:10px; color:#047857; font-weight:bold; margin-bottom:6px; letter-spacing: 1px;">KODE KEAMANAN OTP (BERLAKU 30 MENIT)</div>
            <div class="otp-code">${otpCode}</div>
          </div>
          
          <p style="font-size:11px; color:#64748b; margin-bottom: 0;">Kode ini berlaku selama 30 menit. Jangan bagikan kode ini kepada siapapun.</p>
        </div>
        <div class="footer">
          &copy; 2026 Survasi. Hak Cipta Dilindungi.
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`🔑 [OTP] Sending to: ${toEmail} | Code: ${otpCode} | Type: ${type}`);

  // Send via Brevo REST API v3
  const apiRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': config.apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: config.senderName, email: config.senderEmail },
      to: [{ email: toEmail, name: recipientName || 'Pengguna' }],
      subject: subject,
      htmlContent: htmlContent,
    }),
  });

  if (apiRes.ok) {
    const data = await apiRes.json();
    console.log(`✅ [BREVO] Email sent to ${toEmail}. MessageId: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } else {
    const errData = await apiRes.json().catch(() => ({}));
    const errMsg = errData.message || `HTTP ${apiRes.status}`;
    console.error(`❌ [BREVO] Failed to send to ${toEmail}: ${errMsg}`);
    throw new Error(`Email delivery failed: ${errMsg}`);
  }
}

module.exports = { sendOtpEmail, verifyBrevoConnection };
