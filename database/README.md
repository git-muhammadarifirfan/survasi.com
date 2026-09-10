# 🗄️ Dokumentasi Database — BSAN Jawa Timur Monitoring System

Dokumentasi resmi arsitektur database, mekanisme autentikasi (Login Email / NPSN), hirarki stakeholder (RBAC), serta panduan manajemen data sekolah dan wilayah untuk sistem **Monitoring BSAN Jawa Timur**.

---

## 📌 1. Overview Arsitektur Database

- **DBMS**: MySQL 8.0+ / MariaDB 10.5+
- **Engine**: InnoDB (Transaction-safe, Foreign Keys enabled)
- **Character Set**: `utf8mb4_unicode_ci` (Mendukung Unicode, Emoji, & Nama Daerah)
- **Struktur**: **20 Tabel Master & Transaksi, 3 Views, 1 Trigger, 12 SQL Query Modules**

---

## 🔐 2. Mekanisme Autentikasi Dual Login (Email / NPSN)

Sistem mendukung **2 metode login fleksibel** dalam satu pintu masuk:

1. **Dinas Pendidikan / Pengawas / Admin**: Login menggunakan **Email Resmi** (`email`) dan `password`.
2. **Operator / Kepala Sekolah**: Login menggunakan **NPSN Sekolah** (`npsn`) atau **Email Sekolah** dan `password`.

### 📄 Query Autentikasi (`database/queries/auth.sql`):
```sql
SELECT
  u.id, u.nama, u.email, u.password_hash,
  u.role, u.sekolah_id, u.kabupaten_id, u.kecamatan_id,
  u.jabatan, u.instansi, u.is_active,
  sp.nama AS sekolah_nama,
  sp.npsn AS sekolah_npsn,
  kb.nama AS kabupaten_nama,
  k.nama AS kecamatan_nama
FROM users u
LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
LEFT JOIN kabupaten kb ON u.kabupaten_id = kb.id
LEFT JOIN kecamatan k ON u.kecamatan_id = k.id
WHERE (u.email = :identifier OR sp.npsn = :identifier) 
  AND u.is_active = TRUE;
```

---

## 👥 3. Hirarki Stakeholder & Peran (Role-Based Access Control)

Seluruh pengguna terikat pada hirarki wilayah dan instansi melalui tabel `users`:

| Peran (Role) | Kode Enum | FK Wilayah | Cakupan Akses Data (Data Scope) |
|---|---|---|---|
| **1. Admin** | `admin` | *Global (NULL)* | CRUD semua data (sekolah, kuisioner, indikator SEL, user) dan analisis penuh. |
| **2. Pengawas Sekolah** | `pengawas` | `kecamatan_id` / `kabupaten_id` | Mengisi & menyesuaikan database (survey BSAN, observasi lapangan SEL, data sekolah). |

---

## 🛠️ 4. Panduan Manajemen Data (Users, Sekolah, & Wilayah)

### A. Menambah Pengguna Baru (Admin / Operator)
```sql
-- Tambah Operator Sekolah Baru (NPSN: 20512345)
INSERT INTO users (nama, email, password_hash, phone, role, sekolah_id, jabatan, instansi)
VALUES (
  'Retno Wahyuni, S.Pd.',
  'sdn.candi1@sch.id',
  '$2b$10$e8w...HASH_BCRYPT...',
  '085712345678',
  'operator_sekolah',
  42, -- FK ke satuan_pendidikan.id
  'Operator Utama',
  'SDN Candi 1 Sidoarjo'
);

-- Buatkan preferensi default user
INSERT INTO user_preferences (user_id) VALUES (LAST_INSERT_ID());
```

### B. Menambah Master Data Sekolah Baru (CRUD Sekolah)
```sql
INSERT INTO satuan_pendidikan (
  npsn, nama, kecamatan_id, jenjang, status_sekolah, akreditasi, alamat, email, telepon, total_guru, total_siswa, latitude, longitude
) VALUES (
  '20599999',
  'SD Negeri Porong 3',
  12, -- FK ke kecamatan.id
  'SD',
  'Negeri',
  'A',
  'Jl. Raya Porong No. 45',
  'sdnporong3@sch.id',
  '031-8931234',
  18,
  340,
  -7.5451200,
  112.7012000
);
```

### C. Menambah Wilayah Kecamatan Baru
```sql
INSERT INTO kecamatan (kabupaten_id, nama, kode_bps)
VALUES (1, 'Krembung', '351505');
```

---

## 📂 5. Struktur Folder Database

```
database/
├── schema.sql              ← Skema DDL lengkap (Tables, FKs, Views, Triggers)
├── seed.sql                ← Data awal: 38 Kabupaten Jatim, modul BSAN, user sampel
├── seed-sel-indikator.sql  ← Master 55+ indikator observasi SEL
├── seed-pertanyaan.sql     ← Master 37 pertanyaan kuisioner BSAN
├── import-sekolah.sql      ← Batch import data sekolah Jawa Timur
├── import-responden.sql    ← Batch import sampel jawaban survei
├── verify.sql              ← Script verifikasi integritas data
├── README.md               ← Dokumen teknis ini
└── queries/                ← Modul SQL Queries per Fitur UI
    ├── auth.sql            ← Autentikasi login Email/NPSN, registrasi, profil
    ├── dashboard.sql       ← KPI cards, bar chart kecamatan, aktivitas terbaru
    ├── modul_bsan.sql      ← Ring chart progres modul & formula agregat
    ├── proporsi_modul.sql  ← Pie chart, stacked bar, status penyelenggaraan
    ├── gap_funnel.sql      ← Funnel analisis 5 tahap pencapaian
    ├── matriks_kuadran.sql ← Scatter plot 4 kuadran intervensi
    ├── analisis_sel.sql    ← Heatmap SEL per kecamatan, radar chart, matriks
    ├── data_responden.sql  ← Tabel responden, filter wilayah, pagination, export
    ├── tantangan.sql       ← Bar chart kendala & analisis narasi Q34
    ├── suara_responden.sql ← Ulasan narasi Q33/Q35, analisis sentimen, word cloud
    ├── laporan_export.sql  ← Riwayat ekspor dokumen, custom filter laporan
    └── setting.sql         ← Manajemen profil, preferensi dashboard, password
```

---

## 🚀 6. Quick Start Setup Database

### 1. Inisialisasi Database & Skema
```bash
mysql -u root -p < database/schema.sql
```

### 2. Import Seed Data & Master File
```bash
mysql -u root -p bsan_jatim_monitoring < database/seed.sql
mysql -u root -p bsan_jatim_monitoring < database/seed-sel-indikator.sql
mysql -u root -p bsan_jatim_monitoring < database/seed-pertanyaan.sql
mysql -u root -p bsan_jatim_monitoring < database/import-sekolah.sql
mysql -u root -p bsan_jatim_monitoring < database/import-responden.sql
```

### 3. Jalankan Uji Verifikasi
```bash
mysql -u root -p bsan_jatim_monitoring < database/verify.sql
```
*Pastikan seluruh indikator uji mengembalikan respon `✓ PASS`.*

---

## 🔑 7. Akun Default

| Login Identifier (Email / NPSN) | Password | Peran (Role) | Akses |
|---|---|---|---|
| `admin@survasi.com` | `admin` | `admin` | CRUD semua data + Analisis penuh |
| `pengawas@survasi.com` | `pengawas` | `pengawas` | Input/adjust data sekolah (demo) |
| NPSN sekolah (mis. `20512345`) | `sdn2345` *(kata_pertama_lowercase + 4_digit_akhir_NPSN)* | `pengawas` | Dashboard sekolah terkait |

> **Formula Password Pengawas:**  
> `password = LOWER(kata_pertama_nama_sekolah) + 4_digit_terakhir_NPSN`  
> Contoh: SDN Candi 1 / NPSN 20512345 → password: `sdn2345`  
> Generate semua akun: `node database/generate-pengawas-accounts.js`

> ⚠️ *Peringatan: Selalu perbarui `password_hash` menggunakan Bcrypt sebelum merilis ke lingkungan produksi!*
