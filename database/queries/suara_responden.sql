-- ═══════════════════════════════════════════════════════════════════════════════
-- SUARA RESPONDEN QUERIES
-- Digunakan oleh: halaman Suara Responden
-- @tables_used: suara_responden, jawaban_survey, pertanyaan_survey,
--               responden_survey, satuan_pendidikan, modul_bsan, kecamatan
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Daftar suara/komentar (tabel + filter) ───

SELECT
  sr.id, sr.komentar, sr.sentimen, sr.tanggal,
  sp.nama AS sekolah,
  k.nama AS kecamatan,
  mb.nama AS modul,
  rs.nama AS responden_nama
FROM suara_responden sr
JOIN satuan_pendidikan sp ON sr.sekolah_id = sp.id
JOIN kecamatan k ON sp.kecamatan_id = k.id
LEFT JOIN modul_bsan mb ON sr.modul_id = mb.id
LEFT JOIN responden_survey rs ON sr.responden_id = rs.id
WHERE (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
  AND (:sentimen IS NULL OR sr.sentimen = :sentimen)
  AND (:modul_id IS NULL OR sr.modul_id = :modul_id)
ORDER BY sr.tanggal DESC, sr.created_at DESC
LIMIT :limit OFFSET :offset;


-- ─── Sentimen distribution (pie chart) ───

SELECT
  sr.sentimen,
  COUNT(*) AS jumlah,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS persen
FROM suara_responden sr
JOIN satuan_pendidikan sp ON sr.sekolah_id = sp.id
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
GROUP BY sr.sentimen;


-- ─── Narasi dari survey refleksi Q33 (hal baik) ───

SELECT
  rs.nama AS responden,
  sp.nama AS sekolah,
  k.nama AS kecamatan,
  js.jawaban_bebas AS narasi,
  'positif' AS sentimen
FROM jawaban_survey js
JOIN pertanyaan_survey ps ON js.pertanyaan_id = ps.id
JOIN responden_survey rs ON js.responden_id = rs.id
JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
JOIN kecamatan k ON rs.kecamatan_id = k.id
WHERE ps.kode_pertanyaan = 'Q33'
  AND js.jawaban_bebas IS NOT NULL
  AND TRIM(js.jawaban_bebas) != ''
  AND (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
ORDER BY rs.submitted_at DESC;


-- ─── Narasi relevansi BSAN Q35 ───

SELECT
  rs.nama AS responden,
  sp.nama AS sekolah,
  k.nama AS kecamatan,
  js.jawaban_bebas AS narasi
FROM jawaban_survey js
JOIN pertanyaan_survey ps ON js.pertanyaan_id = ps.id
JOIN responden_survey rs ON js.responden_id = rs.id
JOIN satuan_pendidikan sp ON rs.sekolah_id = sp.id
JOIN kecamatan k ON rs.kecamatan_id = k.id
WHERE ps.kode_pertanyaan IN ('Q35', 'Q36')
  AND js.jawaban_bebas IS NOT NULL
  AND TRIM(js.jawaban_bebas) != ''
  AND (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
ORDER BY ps.kode_pertanyaan, rs.submitted_at DESC;
