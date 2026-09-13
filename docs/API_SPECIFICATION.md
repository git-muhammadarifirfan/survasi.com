# 📑 Dokumentasi API Endpoint — SURVASI

Dokumen ini berisi daftar endpoint REST API yang disediakan oleh Backend Server Express (`/api`).

---

## 🔐 Autentikasi (`/api/auth`)

### 1. `POST /api/auth/login`
- **Deskripsi**: Login pengguna menggunakan NIP / Email dan Password.
- **Request Body**:
  ```json
  {
    "identity": "admin@survasi.com",
    "password": "yourpassword"
  }
  ```
- **Response Success (200)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "nama": "Admin Provinsi",
      "email": "admin@survasi.com",
      "role": "admin_provinsi"
    }
  }
  ```

### 2. `GET /api/auth/me`
- **Deskripsi**: Mendapatkan informasi profil pengguna yang sedang login.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

---

## 📊 Analisis SEL & BSAN (`/api/sel`)

### 1. `GET /api/sel/scores`
- **Query Params**: `kabupaten` (optional)
- **Deskripsi**: Mengambil skor rerata 5 domain SEL per kabupaten/kota.

### 2. `GET /api/sel/heatmap`
- **Deskripsi**: Mengambil data skor spasial GIS untuk pemetaan heatmap Jawa Timur.

### 3. `GET /api/sel/matriks`
- **Deskripsi**: Mengambil data matriks evaluasi sekolah dan kesenjangan indikator.

---

## 🏫 Sekolah & Responden (`/api/sekolah`, `/api/responden`)

- `GET /api/sekolah`: List sekolah dengan pagination & pencarian.
- `GET /api/responden`: List responden kuisioner dengan filter peran.
