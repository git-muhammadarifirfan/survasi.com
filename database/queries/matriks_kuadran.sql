-- ═══════════════════════════════════════════════════════════════════════════════
-- MATRIKS 4 KUADRAN QUERIES
-- Digunakan oleh: halaman Matriks 4 Kuadran
-- Scatter plot: Tingkat Penerimaan (X) vs Status Implementasi (Y) per kecamatan
-- @tables_used: responden_survey, kecamatan, kabupaten
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Data scatter plot per kecamatan ───

SELECT
  k.nama AS kecamatan,
  kb.nama AS kabupaten,
  COUNT(*) AS total_responden,
  -- X-axis: Tingkat Penerimaan (% responden yang menerima modul)
  ROUND(
    SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1
  ) AS penerimaan_persen,
  -- Y-axis: Status Implementasi (sudah + 0.5 × sebagian)
  ROUND(
    (SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) +
     SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 0.5 ELSE 0 END))
    / NULLIF(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END), 0) * 100, 1
  ) AS implementasi_persen,
  -- Ukuran bubble: jumlah sekolah yang mengisi
  COUNT(DISTINCT rs.sekolah_id) AS jumlah_sekolah
FROM responden_survey rs
JOIN kecamatan k ON rs.kecamatan_id = k.id
JOIN kabupaten kb ON rs.kabupaten_id = kb.id
WHERE (:kabupaten_id IS NULL OR kb.id = :kabupaten_id)
GROUP BY k.id, k.nama, kb.nama
HAVING total_responden > 0;


-- ─── Rata-rata total (untuk garis median di scatter) ───

SELECT
  ROUND(
    SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1
  ) AS avg_penerimaan,
  ROUND(
    (SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) +
     SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 0.5 ELSE 0 END))
    / NULLIF(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END), 0) * 100, 1
  ) AS avg_implementasi
FROM responden_survey rs
WHERE (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id);


-- ─── Kategori kuadran per kecamatan ───
-- Kuadran 1: Tinggi penerimaan + Tinggi implementasi (Best Practice)
-- Kuadran 2: Rendah penerimaan + Tinggi implementasi (Potensi Tinggi)
-- Kuadran 3: Rendah penerimaan + Rendah implementasi (Butuh Intervensi)
-- Kuadran 4: Tinggi penerimaan + Rendah implementasi (Butuh Pendampingan)

SELECT
  k.nama AS kecamatan,
  penerimaan_data.penerimaan_persen,
  penerimaan_data.implementasi_persen,
  CASE
    WHEN penerimaan_data.penerimaan_persen >= avg_data.avg_pen
     AND penerimaan_data.implementasi_persen >= avg_data.avg_impl
    THEN 'Best Practice'
    WHEN penerimaan_data.penerimaan_persen < avg_data.avg_pen
     AND penerimaan_data.implementasi_persen >= avg_data.avg_impl
    THEN 'Potensi Tinggi'
    WHEN penerimaan_data.penerimaan_persen < avg_data.avg_pen
     AND penerimaan_data.implementasi_persen < avg_data.avg_impl
    THEN 'Butuh Intervensi'
    ELSE 'Butuh Pendampingan'
  END AS kuadran
FROM (
  SELECT
    rs.kecamatan_id,
    ROUND(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS penerimaan_persen,
    ROUND(
      (SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) +
       SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 0.5 ELSE 0 END))
      / NULLIF(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END), 0) * 100, 1
    ) AS implementasi_persen
  FROM responden_survey rs
  WHERE (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id)
  GROUP BY rs.kecamatan_id
) penerimaan_data
JOIN kecamatan k ON penerimaan_data.kecamatan_id = k.id
CROSS JOIN (
  SELECT
    ROUND(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS avg_pen,
    ROUND(
      (SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) +
       SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 0.5 ELSE 0 END))
      / NULLIF(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END), 0) * 100, 1
    ) AS avg_impl
  FROM responden_survey rs
  WHERE (:kabupaten_id IS NULL OR rs.kabupaten_id = :kabupaten_id)
) avg_data
ORDER BY kuadran, penerimaan_data.penerimaan_persen DESC;
