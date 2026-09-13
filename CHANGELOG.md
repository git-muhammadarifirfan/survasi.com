# 📜 CHANGELOG — SURVASI

Semua perubahan penting pada proyek SURVASI dicatat dalam dokumen ini.

---

## [1.0.0] - 2026-09-13

### 🚀 Added
- **Core Fullstack SPA**: Integrasi React SPA langsung disajikan dari server Express pada port 3001.
- **Vite Proxy & CORS Config**: Pengaturan proxy `/api` pada lingkungan pengembangan & produksi.
- **Deployment Automation**: Script `deployment/deploy.sh` & `server/start_backend.sh` untuk otomatisasi restart backend dan pembaruan build.
- **Analytics & GIS Heatmap**: Modul analisis SEL (Social-Emotional Learning), radar chart 5 domain, dan peta GIS interaktif per kabupaten/kota di Jawa Timur.
- **Security & Hardening**: Implementasi Helmet headers, anti-DDoS rate limiting, sanitasi environment variable, dan soft-delete pada MySQL.
- **OTP Password Flow**: Fitur permintaan reset/ubah kata sandi pengguna berbasis kode OTP via email.

---

## [0.9.0] - 2026-09-12

### 🚀 Added
- **Dynamic Forms**: Kuisioner BSAN & Form Observasi dengan draf auto-save lokal (IndexedDB/LocalStorage).
- **Master Data Management**: Manajemen Sekolah dan Responden dengan fitur pencarian dan paginasi interaktif.
