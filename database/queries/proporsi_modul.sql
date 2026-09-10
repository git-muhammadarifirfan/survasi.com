-- ═══════════════════════════════════════════════════════════════════════════════
-- PROPORSI MODUL QUERIES
-- Digunakan oleh: halaman Proporsi Modul
-- @tables_used: responden_survey, kabupaten, kecamatan, jawaban_survey
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Proporsi penerima modul (pie chart) ───
SELECT
  rs.penerima_modul,
  COUNT(*) AS jumlah,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
FROM responden_survey rs
WHERE (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id)
GROUP BY rs.penerima_modul;

-- ─── Distribusi penerima per kecamatan ───
SELECT
  k.nama AS kecamatan,
  COUNT(*) AS total,
  ROUND(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS ya_persen,
  ROUND(SUM(CASE WHEN rs.penerima_modul = 'Tidak' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS tidak_persen
FROM responden_survey rs
JOIN kecamatan k ON rs.kecamatan_id = k.id
WHERE (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id)
GROUP BY k.id, k.nama
ORDER BY ya_persen DESC;

-- ─── Penyelenggara pelatihan (horizontal bar) ───
SELECT
  TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(rs.penyelenggara_pelatihan, ',', n.n), ',', -1)) AS penyelenggara,
  COUNT(*) AS jumlah
FROM responden_survey rs
CROSS JOIN (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) n
WHERE rs.penyelenggara_pelatihan IS NOT NULL
  AND rs.penyelenggara_pelatihan != ''
  AND n.n <= 1 + LENGTH(rs.penyelenggara_pelatihan) - LENGTH(REPLACE(rs.penyelenggara_pelatihan, ',', ''))
  AND (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id)
GROUP BY penyelenggara
HAVING penyelenggara != ''
ORDER BY jumlah DESC;

-- ─── Status implementasi per posisi (stacked bar) ───
SELECT
  rs.posisi,
  COUNT(*) AS total,
  ROUND(SUM(CASE WHEN rs.penerima_modul = 'Tidak' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS belum_menerima,
  ROUND(SUM(CASE WHEN rs.status_implementasi IS NULL AND rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS tidak_menerapkan,
  ROUND(SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS sebagian,
  ROUND(SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS sudah
FROM responden_survey rs
WHERE (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id)
GROUP BY rs.posisi
ORDER BY sudah DESC;

-- ─── Status implementasi per kecamatan (stacked bar) ───
SELECT
  k.nama AS kecamatan,
  COUNT(*) AS total,
  ROUND(SUM(CASE WHEN rs.penerima_modul = 'Tidak' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS belum_menerima,
  ROUND(SUM(CASE WHEN rs.status_implementasi IS NULL AND rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS tidak_menerapkan,
  ROUND(SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS sebagian,
  ROUND(SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) AS sudah
FROM responden_survey rs
JOIN kecamatan k ON rs.kecamatan_id = k.id
WHERE (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id)
GROUP BY k.id, k.nama
ORDER BY sudah DESC;

-- ─── Keterlibatan siswa saat implementasi ───
SELECT
  js.jawaban_terstruktur AS kategori,
  COUNT(*) AS jumlah,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
FROM jawaban_survey js
JOIN pertanyaan_survey ps ON js.pertanyaan_id = ps.id
JOIN responden_survey rs ON js.responden_id = rs.id
WHERE ps.kode_pertanyaan IN ('Q16', 'Q25')
  AND (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id)
GROUP BY js.jawaban_terstruktur;
