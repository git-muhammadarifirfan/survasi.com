# Panduan Lengkap Integrasi Email Brevo (SMTP & Anti-Spam Guide)

Panduan ini berisi panduan langkah demi langkah (*step-by-step text guide*) untuk mengonfigurasi dan mengintegrasikan layanan **Brevo Transactional Email (SMTP / API)** pada aplikasi **Survasi**, serta konfigurasi DNS anti-spam agar email verifikasi & reset kata sandi tidak masuk ke folder SPAM.

---

## 1. Informasi Kredensial Brevo (Aktif)

Berikut adalah kredensial SMTP Brevo yang saat ini digunakan pada server:

- **SMTP Host**: `smtp-relay.brevo.com`
- **Port**: `587` (TLS / STARTTLS)
- **Login / Username**: `YOUR_BREVO_SMTP_USERNAME`
- **Master API Key / SMTP Password**: `YOUR_BREVO_API_KEY_HERE`

---

## 2. Cara Konfigurasi di Server (Node.js / Express)

### A. File `.env` (Server)
Tambahkan variabel berikut di file `server/.env`:

```env
# Server Port & Secret
PORT=3001
JWT_SECRET=survasi_jwt_secret_key_2026

# Brevo SMTP Configuration
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=YOUR_BREVO_SMTP_USERNAME
SMTP_PASS=YOUR_BREVO_API_KEY_HERE
SMTP_FROM_EMAIL=no-reply@survasi.com
SMTP_FROM_NAME="Survasi Platform"
```

---

### B. Kode Integrasi Nodemailer (`server/mailer.js`)

Instal dependensi:
```bash
npm install nodemailer
```

Buat modul pengirim email `server/mailer.js`:

```javascript
const nodemailer = require('nodemailer');

// 1. Inisialisasi Transporter Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verifikasi Koneksi SMTP saat Startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gagal terhubung ke Brevo SMTP:', error);
  } else {
    console.log('✅ Brevo SMTP Mailer siap mengirim email!');
  }
});

/**
 * Pengiriman Email OTP Verifikasi / Reset Sandi
 */
async function sendOtpEmail({ recipientEmail, recipientName, otpCode, type = 'verification' }) {
  const isVerification = type === 'verification';
  
  const subject = isVerification 
    ? `Kode Verifikasi Otentikasi Akun Survasi: ${otpCode}`
    : `Permintaan Reset Kata Sandi Akun Survasi: ${otpCode}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #059669, #047857); color: #ffffff; padding: 24px; text-align: center; }
        .body { padding: 32px; color: #334155; }
        .otp-box { background: #ecfdf5; border: 2px border #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #064e3b; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">Survasi Platform</h2>
          <p style="margin:5px 0 0; font-size:12px;">${isVerification ? 'Verifikasi Pendaftaran Akun' : 'Reset Kata Sandi'}</p>
        </div>
        <div class="body">
          <p>Halo, <strong>${recipientName || 'Pengguna'}</strong>,</p>
          <p>${isVerification ? 'Gunakan kode 6-digit berikut untuk memverifikasi akun Anda:' : 'Gunakan kode 6-digit berikut untuk mereset kata sandi Anda:'}</p>
          
          <div class="otp-box">
            <div style="font-size:10px; color:#047857; font-weight:bold; margin-bottom:6px;">KODE KEAMANAN OTP (10 MENIT)</div>
            <div class="otp-code">${otpCode}</div>
          </div>
          
          <p style="font-size:11px; color:#64748b;">Jangan berikan kode ini kepada siapa pun. Jika Anda tidak merasa melakukan tindakan ini, abaikan email ini.</p>
        </div>
        <div class="footer">
          Survasi Platform © 2026 — Layanan Otentikasi Otomatis
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Survasi System'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@survasi.com'}>`,
    to: recipientEmail,
    subject: subject,
    html: htmlContent,
  });
}

module.exports = { sendOtpEmail };
```

---

## 3. Panduan Anti-Spam (SPF, DKIM, DMARC) untuk Domain Production

Agar email yang dikirimkan via Brevo **pasti masuk ke Inbox (Inbox Delivery 100%)** dan **TIDAK masuk folder SPAM** pada domain resmi Anda (misal `survasi.com`), Anda wajib menambahkan 3 Record DNS berikut pada Dashboard Domain / Hosting Provider Anda (cPanel, Cloudflare, Niagahoster, Rumahweb, dll.):

### A. SPF Record (Sender Policy Framework)
- **Type**: `TXT`
- **Host / Name**: `@` (atau `survasi.com`)
- **Value**:
  ```text
  v=spf1 include:spf.brevo.com ~all
  ```

---

### B. DKIM Record (DomainKeys Identified Mail)
- **Type**: `TXT`
- **Host / Name**: `mail._domainkey`
- **Value** (Dapatkan di Dashboard Brevo -> Sender & IP -> Domains):
  ```text
  k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ... (Unique Key dari Brevo)
  ```

---

### C. DMARC Record (Domain-based Message Authentication)
- **Type**: `TXT`
- **Host / Name**: `_dmarc`
- **Value**:
  ```text
  v=DMARC1; p=none; rua=mailto:dmarc-reports@survasi.com
  ```

---

## 4. Checklist Verifikasi Domain di Dashboard Brevo

1. Log in ke Dashboard Brevo (https://app.brevo.com).
2. Buka menu **Senders & IPs** -> **Domains**.
3. Klik **Add a New Domain** dan masukkan domain Anda (contoh: `survasi.com`).
4. Masukkan record **SPF** dan **DKIM** yang ditampilkan ke pengaturan DNS domain Anda.
5. Klik **Verify & Authenticate Domain**.
6. Setelah status terverifikasi (Hijau Centang), semua email dari `no-reply@survasi.com` dijamin masuk langsung ke Inbox Gmail, Yahoo, Outlook, & Email Instansi.

---

## 5. Ringkasan Fitur Auth Frontend `LoginPage.tsx`

1. **Desain Split 2 Kolom Modern**:
   - Kolom kiri: Form Login, Register (pencarian 1.200+ sekolah sasaran), Lupa Kata Sandi, dan Verifikasi 6-Digit OTP.
   - Kolom kanan: Hero Banner berlatar **Solid Emerald Green** (`bg-emerald-600`) dengan ilustrasi SVG resmi `Mobile login-bro.svg`.
2. **Carousel Teks Otomatis**:
   - Fitur unggulan bergeser otomatis setiap 4 detik dengan transisi halus.
3. **Penyelaras Tampilan Clean**:
   - Tampilan bersih tanpa gradien AI berlebihan atau badge pill atas yang mengganggu.
   - Tata bahasa dan copywriting profesional tanpa istilah teknis internal/pengembang.
