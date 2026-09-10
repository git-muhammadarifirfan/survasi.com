/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PAGE DOCUMENTATION MAP — BSAN JAWA TIMUR MONITORING SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dokumentasi mapping setiap halaman ke tabel database yang digunakan,
 * API endpoints yang diperlukan, dan query SQL yang terkait.
 *
 * CARA PENGGUNAAN:
 * Copy JSDoc header yang sesuai ke awal setiap file page saat refactoring.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Login.tsx ───────────────────────────────────────────────────────────────
// @module features/auth/pages
// @description Login page dengan role-based auth (admin vs sekolah)
// @tables: users (login query), activity_log (audit login)
// @queries: database/queries/auth.sql → "Login: cari user by email"
// @api: POST /api/auth/login, POST /api/auth/logout

// ─── Dashboard.tsx ──────────────────────────────────────────────────────────
// ✅ SUDAH DIDOKUMENTASI (lihat file)

// ─── KecamatanMap.tsx ───────────────────────────────────────────────────────
// @module features/peta/pages
// @description Peta choropleth kecamatan dengan response rate sebagai intensitas warna
// @tables: satuan_pendidikan, kecamatan (geojson_path), kabupaten
// @queries: database/queries/dashboard.sql → "Response rate per kecamatan"
// @api: GET /api/peta/kecamatan-geojson?kabupaten_id=

// ─── Kuisioner.tsx ──────────────────────────────────────────────────────────
// @module features/kuisioner/pages
// @description Form wizard kuisioner BSAN — 37 pertanyaan dengan skip logic
// @tables: pertanyaan_survey, jawaban_survey, responden_survey, modul_bsan, alur_tema
// @queries: database/queries/auth.sql → "Get user profile" (untuk pre-fill identitas)
// @api: GET /api/kuisioner/pertanyaan, POST /api/kuisioner/jawaban, GET /api/kuisioner/draft/:user_id

// ─── DataResponden.tsx ──────────────────────────────────────────────────────
// @module features/responden/pages
// @description Tabel data responden dengan filter, search, pagination, dan export
// @tables: responden_survey, satuan_pendidikan, kecamatan, kabupaten
// @queries: database/queries/data_responden.sql → semua query
// @api: GET /api/responden?kabupaten_id=&kecamatan_id=&search=&page=&limit=

// ─── DataSatuanPendidikan.tsx ───────────────────────────────────────────────
// @module features/sekolah/pages
// @description Master data sekolah dengan CRUD, filter, map pin, dan profil detail
// @tables: satuan_pendidikan, kecamatan, kabupaten
// @api: GET /api/sekolah, GET /api/sekolah/:id, PUT /api/sekolah/:id

// ─── ModulBsan.tsx ──────────────────────────────────────────────────────────
// @module features/analisis/pages
// @description Ring chart progres per modul BSAN (formula: 40% base + 30% impl + 30% SEL)
// @tables: modul_bsan, responden_survey, sel_jawaban_observasi, sel_dimensi
// @queries: database/queries/modul_bsan.sql → semua query
// @api: GET /api/analisis/modul-progress?kabupaten_id=

// ─── ProporsiModul.tsx ──────────────────────────────────────────────────────
// @module features/analisis/pages
// @description Analisis proporsi penerima modul, penyelenggara, status implementasi
// @tables: responden_survey, jawaban_survey, pertanyaan_survey, kecamatan
// @queries: database/queries/proporsi_modul.sql → semua query
// @api: GET /api/analisis/proporsi?kabupaten_id=

// ─── GapFunnel.tsx ──────────────────────────────────────────────────────────
// @module features/analisis/pages
// @description Visualisasi funnel 5 tahap dari sasaran sampai implementasi penuh
// @tables: satuan_pendidikan, responden_survey, kecamatan
// @queries: database/queries/gap_funnel.sql → "Funnel utama (5 tahap)"
// @api: GET /api/analisis/funnel?kabupaten_id=

// ─── MatriksKuadran.tsx ─────────────────────────────────────────────────────
// @module features/analisis/pages
// @description Scatter plot 4 kuadran (penerimaan vs implementasi per kecamatan)
// @tables: responden_survey, kecamatan, kabupaten
// @queries: database/queries/matriks_kuadran.sql → semua query
// @api: GET /api/analisis/matriks?kabupaten_id=

// ─── TantanganImplementasi.tsx ──────────────────────────────────────────────
// @module features/analisis/pages
// @description Bar chart top tantangan, heatmap per kecamatan, narasi Q34
// @tables: tantangan_implementasi, jawaban_survey (Q34), responden_survey
// @queries: database/queries/tantangan.sql → semua query
// @api: GET /api/analisis/tantangan?kabupaten_id=

// ─── ObservasiSEL.tsx ───────────────────────────────────────────────────────
// @module features/sel/pages
// @description Form wizard observasi lapangan SEL — 55+ indikator per sesi
// @tables: sel_sesi_observasi, sel_jawaban_observasi, sel_indikator, sel_dimensi, satuan_pendidikan
// @api: POST /api/sel/sesi, PUT /api/sel/sesi/:id, POST /api/sel/jawaban

// ─── AnalisisSEL.tsx ────────────────────────────────────────────────────────
// @module features/sel/pages
// @description Heatmap per kecamatan, radar per sekolah, matriks SEL, tabel sesi
// @tables: sel_sesi_observasi, sel_jawaban_observasi, sel_indikator, sel_dimensi
// @queries: database/queries/analisis_sel.sql → semua query
// @api: GET /api/sel/analisis/heatmap, GET /api/sel/analisis/scores, GET /api/sel/analisis/radar/:sekolah_id

// ─── KelolaFormSEL.tsx ──────────────────────────────────────────────────────
// @module features/sel/pages
// @description CRUD admin: kelola indikator observasi SEL (tambah/edit/hapus/toggle)
// @tables: sel_indikator, sel_dimensi
// @api: GET /api/sel/indikator, POST /api/sel/indikator, PUT /api/sel/indikator/:id, DELETE /api/sel/indikator/:id

// ─── SuaraResponden.tsx ─────────────────────────────────────────────────────
// @module features/suara/pages
// @description Komentar narasi dari responden, filter sentimen, word cloud (Fase 2)
// @tables: suara_responden, jawaban_survey (Q33, Q35, Q36), modul_bsan
// @queries: database/queries/suara_responden.sql → semua query
// @api: GET /api/suara?sentimen=&modul_id=&page=&limit=

// ─── LaporanEkspor.tsx ──────────────────────────────────────────────────────
// @module features/laporan/pages
// @description Generate & download laporan PDF/Excel/DOCX dengan filter
// @tables: laporan_export, satuan_pendidikan, responden_survey, sel_sesi_observasi
// @queries: database/queries/laporan_export.sql → semua query
// @api: POST /api/laporan/generate, GET /api/laporan/download/:id, GET /api/laporan/history

// ─── Setting.tsx ────────────────────────────────────────────────────────────
// @module features/setting/pages
// @description Pengaturan profil, notifikasi, preferensi, keamanan, user management
// @tables: users, user_preferences, notifikasi, activity_log
// @queries: database/queries/setting.sql → semua query
// @api: PUT /api/users/profile, PUT /api/users/preferences, GET /api/notifikasi

export {};
