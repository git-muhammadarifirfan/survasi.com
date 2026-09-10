-- ═══════════════════════════════════════════════════════════════════════════════
-- DATA RESPONDEN QUERIES
-- Digunakan oleh: halaman Data Responden (tabel, filter, search, export)
-- @tables_used: responden_survey, satuan_pendidikan, kecamatan, kabupaten
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Tabel responden dengan filter dan search ───

SELECT
  rs.id, rs.nama, rs.jenis_kelamin, rs.posisi,
  sp.nama AS sekolah, rs.npsn,
  kb.nama AS kabupaten, k.nama AS kecamatan,
  rs.penerima_modul, rs.penyelenggara_pelatihan,
  rs.status_implementasi, rs.kelas_mengajar,
  rs.no_wa, rs.submitted_at
FROM responden_survey rs
JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
JOIN kecamatan k ON rs.kecamatan_id = k.id
JOIN kabupaten kb ON rs.kabupaten_id = kb.id
WHERE (:kabupaten_id IS NULL OR kb.id = :kabupaten_id)
  AND (:kecamatan_id IS NULL OR k.id = :kecamatan_id)
  AND (:penerima_modul IS NULL OR rs.penerima_modul = :penerima_modul)
  AND (:status_implementasi IS NULL OR rs.status_implementasi = :status_implementasi)
  AND (:search IS NULL OR (
    rs.nama LIKE CONCAT('%', :search, '%')
    OR sp.nama LIKE CONCAT('%', :search, '%')
    OR rs.npsn LIKE CONCAT('%', :search, '%')
  ))
ORDER BY rs.submitted_at DESC
LIMIT :limit OFFSET :offset;


-- ─── Count total (untuk pagination) ───

SELECT COUNT(*) AS total
FROM responden_survey rs
JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
JOIN kecamatan k ON rs.kecamatan_id = k.id
JOIN kabupaten kb ON rs.kabupaten_id = kb.id
WHERE (:kabupaten_id IS NULL OR kb.id = :kabupaten_id)
  AND (:kecamatan_id IS NULL OR k.id = :kecamatan_id)
  AND (:penerima_modul IS NULL OR rs.penerima_modul = :penerima_modul)
  AND (:status_implementasi IS NULL OR rs.status_implementasi = :status_implementasi)
  AND (:search IS NULL OR (
    rs.nama LIKE CONCAT('%', :search, '%')
    OR sp.nama LIKE CONCAT('%', :search, '%')
    OR rs.npsn LIKE CONCAT('%', :search, '%')
  ));


-- ─── Summary KPI cards ───

SELECT
  COUNT(*) AS total_responden,
  SUM(CASE WHEN rs.jenis_kelamin = 'L' THEN 1 ELSE 0 END) AS laki_laki,
  SUM(CASE WHEN rs.jenis_kelamin = 'P' THEN 1 ELSE 0 END) AS perempuan,
  SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) AS penerima,
  SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) AS implementasi_penuh,
  COUNT(DISTINCT rs.sekolah_id) AS sekolah_terlibat
FROM responden_survey rs
WHERE (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id);


-- ─── Distribusi per posisi (donut chart) ───

SELECT
  rs.posisi,
  COUNT(*) AS jumlah,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
FROM responden_survey rs
WHERE (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id)
GROUP BY rs.posisi
ORDER BY jumlah DESC;


-- ─── Export responden (semua data tanpa pagination) ───

SELECT
  rs.nama, rs.jenis_kelamin, rs.posisi,
  sp.nama AS sekolah, rs.npsn,
  kb.nama AS kabupaten, k.nama AS kecamatan,
  rs.penerima_modul, rs.penyelenggara_pelatihan,
  rs.status_implementasi, rs.kelas_mengajar,
  rs.no_wa, rs.submitted_at
FROM responden_survey rs
JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
JOIN kecamatan k ON rs.kecamatan_id = k.id
JOIN kabupaten kb ON rs.kabupaten_id = kb.id
WHERE (:kabupaten_id IS NULL OR kb.id = :kabupaten_id)
ORDER BY kb.nama, k.nama, sp.nama, rs.nama;
