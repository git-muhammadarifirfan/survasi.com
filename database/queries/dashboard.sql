-- ═══════════════════════════════════════════════════════════════════════════════
-- DASHBOARD QUERIES
-- Digunakan oleh: halaman Dashboard (KPI cards, charts, activity, follow-up)
--
-- @tables_used: satuan_pendidikan, kecamatan, kabupaten, responden_survey,
--               sel_sesi_observasi, sel_jawaban_observasi, sel_dimensi
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── KPI Cards: Total sekolah, sudah/sebagian/belum, response rate ───

SELECT
  COUNT(*) AS total_sekolah,
  SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) AS sudah,
  SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian,
  SUM(CASE WHEN sp.status_pengisian = 'belum' THEN 1 ELSE 0 END) AS belum,
  ROUND(
    (SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) +
     SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 0.5 ELSE 0 END))
    / NULLIF(COUNT(*), 0) * 100, 1
  ) AS response_rate
FROM satuan_pendidikan sp
JOIN kecamatan k ON sp.kecamatan_id = k.id
JOIN kabupaten kb ON k.kabupaten_id = kb.id
WHERE (:kabupaten_id IS NULL OR kb.id = :kabupaten_id)
  AND (:kecamatan_id IS NULL OR k.id = :kecamatan_id);


-- ─── Response rate per kecamatan (bar chart) ───
-- Menggunakan view v_kecamatan_stats untuk performa

SELECT * FROM v_kecamatan_stats
WHERE (:kabupaten_id IS NULL OR kabupaten_id = :kabupaten_id)
ORDER BY response_rate DESC;


-- ─── Response rate per kabupaten (KPI comparison) ───

SELECT * FROM v_kabupaten_stats
ORDER BY response_rate DESC;


-- ─── Aktivitas terbaru (panel kanan — 5 terbaru) ───

SELECT
  sp.nama AS school_name,
  sp.status_pengisian AS status,
  sp.last_updated AS time,
  k.nama AS kecamatan
FROM satuan_pendidikan sp
JOIN kecamatan k ON sp.kecamatan_id = k.id
JOIN kabupaten kb ON k.kabupaten_id = kb.id
WHERE sp.status_pengisian != 'belum'
  AND sp.last_updated IS NOT NULL
  AND (:kabupaten_id IS NULL OR kb.id = :kabupaten_id)
ORDER BY sp.last_updated DESC
LIMIT 5;


-- ─── Follow-up list (sekolah belum isi — prioritas) ───

SELECT
  sp.id, sp.npsn, sp.nama, sp.email, sp.telepon,
  k.nama AS kecamatan, kb.nama AS kabupaten,
  sp.status_pengisian
FROM satuan_pendidikan sp
JOIN kecamatan k ON sp.kecamatan_id = k.id
JOIN kabupaten kb ON k.kabupaten_id = kb.id
WHERE sp.status_pengisian = 'belum'
  AND (:kabupaten_id IS NULL OR kb.id = :kabupaten_id)
ORDER BY k.nama, sp.nama
LIMIT 20;


-- ─── Time series: trend pengisian per hari (7 hari terakhir) ───

SELECT
  DATE(sp.last_updated) AS tanggal,
  SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) AS sudah,
  SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian
FROM satuan_pendidikan sp
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE sp.last_updated IS NOT NULL
  AND sp.last_updated >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  AND (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
GROUP BY DATE(sp.last_updated)
ORDER BY tanggal;
