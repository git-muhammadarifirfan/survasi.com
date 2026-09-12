# Panduan Deployment Server VM (2GB RAM / 2 CPU Core / 50GB Storage)

Dokumen ini berisi panduan teknis langkah demi langkah untuk mendeploy aplikasi **Sistem Survey Sekolah BSAN Jawa Timur** pada Server Virtual Machine (Ubuntu 22.04 LTS / Debian 12) dengan spesifikasi:
- **RAM**: 2 GB
- **CPU**: 2 vCPU Core
- **Storage**: 50 GB SSD

---

## 1. Persiapan Server & Keamanan Awal (UFW Firewall)

### A. Update System & Firewall
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip ufw htop

# Set Firewall UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### B. Buat Swap Memory (SANGAT DIREKOMENDASIKAN untuk VM 2GB RAM)
Membuat Swap Space 2GB mencegah server dari masalah Out-of-Memory (OOM):
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Jadikan swap permanen saat reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 2. Install Node.js, PM2, Nginx & MySQL

### A. Node.js 20 LTS & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2 pnpm
```

### B. Nginx & Certbot SSL
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### C. MySQL Server 8.0 & Tuning Memori
```bash
sudo apt install -y mysql-server
```

Edit file konfig MySQL `/etc/mysql/mysql.conf.d/mysqld.cnf` untuk menghemat RAM pada VM 2GB:
```ini
[mysqld]
max_connections = 30
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
key_buffer_size = 16M
```
Restart MySQL:
```bash
sudo systemctl restart mysql
```

Eksekusi skrip database `database/schema.sql` dan `database/seed_data.sql`:
```bash
sudo mysql -u root -p < database/schema.sql
sudo mysql -u root -p < database/seed_data.sql
```

---

## 3. Deployment Aplikasi

### A. Clone & Install Dependencies
```bash
mkdir -p /var/www/survasi
cd /var/www/survasi

# Clone repository atau Upload source code ke folder ini
pnpm install --frozen-lockfile
cd server && pnpm install && cd ..
```

### B. Build Production Frontend
```bash
pnpm build
```
File hasil build berada di `/var/www/survasi/dist`.

### C. Environment Variables (.env)
Buat file `/var/www/survasi/server/.env`:
```env
PORT=3001
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=survasi_user
DB_PASS=password_db_aman_anda
DB_NAME=db_survasi
DB_CONNECTION_LIMIT=12
JWT_SECRET=rahasia_jwt_super_aman_32_karakter_minimal
JWT_EXPIRES_IN=8h
CORS_ORIGINS=https://domain-anda.com
```

### D. Jalankan Backend dengan PM2
```bash
pm2 start deployment/ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 4. Konfigurasi Nginx & SSL HTTPS

### A. Pasang Nginx Config
```bash
sudo cp deployment/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx
```

### B. Pasang Sertifikat SSL Gratis (Let's Encrypt Certbot)
```bash
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
```

---

## 5. Ringkasan Fitur Performa & Keamanan yang Aktif

| Kategori | Fitur | Hasil / Manfaat |
|---|---|---|
| **Core Web Vitals** | Manual Chunking (Vite) | Memisahkan Recharts, Leaflet, Docx/jsPDF ke vendor chunks (Cache 1 tahun). |
| **Core Web Vitals** | Gzip/Brotli Compression | Mengompres payload API Express & file static hingga 80%. |
| **Core Web Vitals** | Font Preconnect & Swap | Mencegah Layout Shift (CLS) dan memperbaiki First Contentful Paint. |
| **Security** | Helmet CSP & HSTS | Melindungi dari XSS, Clickjacking, dan enforce HTTPS 1 tahun. |
| **Security** | Rate Limiting & Anti-HPP | Melindungi endpoint API & Login dari Brute-Force & DDoS attacks. |
| **VM 2GB Optimization**| Node Memory Cap 512M | Batas penggunaan memori Node.js & PM2 auto-restart jika melebihi 400MB. |
| **VM 2GB Optimization**| MySQL Pool Limit 12 | Membatasi koneksi aktif MySQL agar penggunaan RAM efisien. |
