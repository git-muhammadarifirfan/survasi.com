-- ═══════════════════════════════════════════════════════════════════════════════
-- ANALISIS SEL QUERIES
-- Digunakan oleh: Analisis SEL (heatmap, radar, matriks, score per sekolah)
-- @tables_used: sel_sesi_observasi, sel_jawaban_observasi, sel_indikator,
--               sel_dimensi, satuan_pendidikan, kecamatan, kabupaten
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Heatmap: rata-rata skor per kecamatan per dimensi ───

SELECT
  k.nama AS kecamatan,
  kb.nama AS kabupaten,
  COUNT(DISTINCT sso.id) AS jumlah_sesi,
  ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_diri' THEN sjo.skor END), 2) AS kesadaran_diri,
  ROUND(AVG(CASE WHEN sd.kode = 'regulasi_emosi' THEN sjo.skor END), 2) AS regulasi_emosi,
  ROUND(AVG(CASE WHEN sd.kode = 'kesadaran_sosial' THEN sjo.skor END), 2) AS kesadaran_sosial,
  ROUND(AVG(CASE WHEN sd.kode = 'keterampilan_relasi' THEN sjo.skor END), 2) AS keterampilan_relasi,
  ROUND(AVG(CASE WHEN sd.kode = 'tanggung_jawab' THEN sjo.skor END), 2) AS tanggung_jawab,
  ROUND(AVG(sjo.skor), 2) AS rata_rata
FROM sel_sesi_observasi sso
JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
JOIN sel_indikator si ON sjo.indikator_id = si.id
JOIN sel_dimensi sd ON si.dimensi_id = sd.id
JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
JOIN kecamatan k ON sp.kecamatan_id = k.id
JOIN kabupaten kb ON k.kabupaten_id = kb.id
WHERE sjo.skor IS NOT NULL
  AND (:kabupaten_id IS NULL OR kb.id = :kabupaten_id)
GROUP BY k.id, k.nama, kb.nama
ORDER BY rata_rata DESC;


-- ─── Score per sekolah (tabel + scatter chart) ───
-- Menggunakan view v_sel_sesi_scores

SELECT * FROM v_sel_sesi_scores
WHERE (:kabupaten_id IS NULL OR kabupaten = (SELECT nama FROM kabupaten WHERE id = :kabupaten_id))
ORDER BY skor_total DESC;


-- ─── Summary KPI: total diobservasi, rata-rata guru/murid, butuh intervensi ───

SELECT
  COUNT(DISTINCT sso.id) AS total_sesi,
  ROUND(AVG(CASE WHEN si.subjek = 'guru' THEN sjo.skor END), 2) AS rata_guru,
  ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS rata_murid,
  -- Sekolah dengan skor < 2.5 butuh intervensi
  (SELECT COUNT(DISTINCT sub_sso.sekolah_id)
   FROM sel_sesi_observasi sub_sso
   JOIN sel_jawaban_observasi sub_sjo ON sub_sjo.sesi_id = sub_sso.id
   WHERE sub_sjo.skor IS NOT NULL
   GROUP BY sub_sso.sekolah_id
   HAVING AVG(sub_sjo.skor) < 2.5
  ) AS butuh_intervensi
FROM sel_sesi_observasi sso
JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
JOIN sel_indikator si ON sjo.indikator_id = si.id
WHERE sjo.skor IS NOT NULL;


-- ─── Matriks SEL vs Kuisioner Score (scatter plot) ───

SELECT
  sp.id AS sekolah_id,
  sp.nama AS sekolah,
  k.nama AS kecamatan,
  sp.status_pengisian,
  ROUND(AVG(sjo.skor), 2) AS sel_score,
  ROUND(AVG(CASE WHEN si.subjek = 'guru' THEN sjo.skor END), 2) AS guru_score,
  ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS murid_score
FROM sel_sesi_observasi sso
JOIN sel_jawaban_observasi sjo ON sjo.sesi_id = sso.id
JOIN sel_indikator si ON sjo.indikator_id = si.id
JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE sjo.skor IS NOT NULL
  AND (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
GROUP BY sp.id, sp.nama, k.nama, sp.status_pengisian
ORDER BY sel_score DESC;


-- ─── Radar benchmarking: skor sekolah vs rata-rata kecamatan ───

SELECT
  sd.nama AS dimensi,
  ROUND(AVG(CASE WHEN sso.sekolah_id = :sekolah_id THEN sjo.skor END), 2) AS skor_sekolah,
  ROUND(AVG(sjo.skor), 2) AS skor_kecamatan_avg
FROM sel_jawaban_observasi sjo
JOIN sel_sesi_observasi sso ON sjo.sesi_id = sso.id
JOIN sel_indikator si ON sjo.indikator_id = si.id
JOIN sel_dimensi sd ON si.dimensi_id = sd.id
JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
WHERE sjo.skor IS NOT NULL
  AND sp.kecamatan_id = (SELECT kecamatan_id FROM satuan_pendidikan WHERE id = :sekolah_id)
GROUP BY sd.id, sd.nama
ORDER BY sd.urutan;
