-- ═══════════════════════════════════════════════════════════════════════════════
-- TANTANGAN IMPLEMENTASI QUERIES
-- Digunakan oleh: halaman Tantangan Implementasi
-- @tables_used: tantangan_implementasi, jawaban_survey, pertanyaan_survey,
--               responden_survey, satuan_pendidikan, kecamatan, kabupaten
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Top tantangan (bar chart) ───

SELECT
  ti.kategori,
  COUNT(*) AS jumlah,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
FROM tantangan_implementasi ti
JOIN satuan_pendidikan sp ON ti.sekolah_id = sp.id
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
GROUP BY ti.kategori
ORDER BY jumlah DESC;


-- ─── Tantangan per kecamatan (heatmap) ───

SELECT
  k.nama AS kecamatan,
  ti.kategori,
  COUNT(*) AS jumlah
FROM tantangan_implementasi ti
JOIN satuan_pendidikan sp ON ti.sekolah_id = sp.id
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
GROUP BY k.id, k.nama, ti.kategori
ORDER BY k.nama, jumlah DESC;


-- ─── Narasi tantangan dari jawaban survey (Q34) ───

SELECT
  rs.nama AS responden,
  sp.nama AS sekolah,
  k.nama AS kecamatan,
  js.jawaban_bebas AS narasi_tantangan
FROM jawaban_survey js
JOIN pertanyaan_survey ps ON js.pertanyaan_id = ps.id
JOIN responden_survey rs ON js.responden_id = rs.id
JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
JOIN kecamatan k ON rs.kecamatan_id = k.id
WHERE ps.kode_pertanyaan = 'Q34'
  AND js.jawaban_bebas IS NOT NULL
  AND TRIM(js.jawaban_bebas) != ''
  AND (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
ORDER BY k.nama, sp.nama;
