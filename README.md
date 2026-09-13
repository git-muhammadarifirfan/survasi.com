# 🏫 SURVASI — Sistem Survei & Evaluasi SEL/BSAN Jawa Timur

SURVASI adalah platform web berbasis **React + Express + MySQL** yang dirancang untuk pengumpulan data survei, evaluasi **Social-Emotional Learning (SEL)**, dan analisis modul **Budaya Sekolah Aman dan Nyaman (BSAN)** di wilayah Provinsi Jawa Timur.

---

## 🚀 Fitur Utama

- 🔐 **Autentikasi & RBAC**: Peran Pengguna (Admin Provinsi, Cabdin, Kepala Sekolah, Guru/Responden).
- 📊 **Dashboard Analytics & GIS**: Visualisasi indikator SEL, peta heatmap GIS per kabupaten/kota.
- 📝 **Kuisioner & Form Observasi**: Form survei interaktif dengan draf otomatis (auto-save offline).
- 📈 **Analisis SEL & Matriks Gap**: Matriks evaluasi, radar chart 5 domain SEL, dan eksport laporan PDF/Word.
- 🔒 **Security & Performance Hardening**: Anti-DDoS rate limiting, Helmet HTTP headers, CORS restriction, dan Express SPA routing.

---

## 🛠️ Stack Teknologi

- **Frontend**: React 18, TypeScript, Vite, React Router v7, Recharts, Leaflet GIS, Lucide Icons
- **Backend**: Node.js, Express.js, MySQL 2 (Connection Pool), JWT Auth, Bcrypt, Helmet, Compression
- **Deployment**: Nginx Reverse Proxy, PM2 / Docker Compose, Cloudflare Flexible SSL

---

## 📁 Struktur Direktori

```
survasi.com/
├── database/          # Dump database SQL & script migrasi/patch
├── deployment/        # Konfigurasi Nginx, Docker, PM2, dan deploy.sh
├── server/            # Backend Express API & REST controller
├── src/               # Frontend React Application
│   ├── app/           # App root & routing
│   ├── features/      # Feature modules (auth, dashboard, survey, analisis)
│   └── shared/        # Shared components, services, & utilities
└── vite.config.ts     # Konfigurasi Vite & API proxy
```

---

## 🔧 Panduan Instalasi Lokal

### 1. Prasyarat
- Node.js (v18+)
- MySQL (v8.0+)
- PNPM atau NPM

### 2. Instalasi & Running

```bash
# Clone repository
git clone https://github.com/git-muhammadarifirfan/survasi.com.git
cd survasi.com

# Install dependencies frontend & backend
npm install
cd server && npm install && cd ..

# Konfigurasi .env server
cp server/.env.example server/.env

# Import database SQL
mysql -u root -p db_survasi < database/production_dump.sql

# Jalankan backend & frontend secara lokal
cd server && node index.js # Running di http://localhost:3001
# Di terminal terpisah:
npm run dev                # Running di http://localhost:5173
```

---

## 📜 Lisensi & Hak Cipta
Hak Cipta © 2026 **SURVASI.com — Dinas Pendidikan Provinsi Jawa Timur**.
