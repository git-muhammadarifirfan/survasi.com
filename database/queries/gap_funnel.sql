-- ═══════════════════════════════════════════════════════════════════════════════
-- GAP FUNNEL QUERIES
-- Digunakan oleh: halaman Analisis Gap Funnel
-- Menghitung drop-off di setiap tahap dari total sasaran sampai implementasi
-- @tables_used: satuan_pendidikan, responden_survey, kecamatan, kabupaten
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Funnel utama (5 tahap) ───

SELECT
  -- Tahap 1: Total sasaran
  COUNT(*) AS total_sasaran,
  -- Tahap 2: Mengisi survei
  SUM(CASE WHEN sp.status_pengisian IN ('sudah', 'sebagian') THEN 1 ELSE 0 END) AS mengisi,
  -- Tahap 3: Menerima modul BSAN
  (SELECT COUNT(DISTINCT rs.sekolah_id)
   FROM responden_survey rs
   JOIN kecamatan k2 ON rs.kecamatan_id = k2.id
   WHERE rs.penerima_modul = 'Ya'
     AND (:kabupaten_id IS NULL OR k2.kabupaten_id = :kabupaten_id)
  ) AS menerima_modul,
  -- Tahap 4: Sudah/sebagian implementasi
  (SELECT COUNT(DISTINCT rs.sekolah_id)
   FROM responden_survey rs
   JOIN kecamatan k3 ON rs.kecamatan_id = k3.id
   WHERE rs.status_implementasi IN ('sudah', 'sebagian')
     AND (:kabupaten_id IS NULL OR k3.kabupaten_id = :kabupaten_id)
  ) AS implementasi,
  -- Tahap 5: Implementasi penuh
  (SELECT COUNT(DISTINCT rs.sekolah_id)
   FROM responden_survey rs
   JOIN kecamatan k4 ON rs.kecamatan_id = k4.id
   WHERE rs.status_implementasi = 'sudah'
     AND (:kabupaten_id IS NULL OR k4.kabupaten_id = :kabupaten_id)
  ) AS implementasi_penuh
FROM satuan_pendidikan sp
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id);


-- ─── Gap per tahap (untuk annotation di funnel) ───

SELECT
  'Sasaran → Mengisi' AS tahap,
  COUNT(*) - SUM(CASE WHEN sp.status_pengisian IN ('sudah', 'sebagian') THEN 1 ELSE 0 END) AS gap,
  ROUND((COUNT(*) - SUM(CASE WHEN sp.status_pengisian IN ('sudah', 'sebagian') THEN 1 ELSE 0 END))
    / COUNT(*) * 100, 1) AS gap_persen
FROM satuan_pendidikan sp
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id);


-- ─── Funnel per kecamatan (breakdown) ───

SELECT
  k.nama AS kecamatan,
  COUNT(sp.id) AS total_sasaran,
  SUM(CASE WHEN sp.status_pengisian IN ('sudah', 'sebagian') THEN 1 ELSE 0 END) AS mengisi,
  (SELECT COUNT(DISTINCT rs.sekolah_id)
   FROM responden_survey rs WHERE rs.kecamatan_id = k.id AND rs.penerima_modul = 'Ya'
  ) AS menerima,
  (SELECT COUNT(DISTINCT rs.sekolah_id)
   FROM responden_survey rs WHERE rs.kecamatan_id = k.id AND rs.status_implementasi IN ('sudah', 'sebagian')
  ) AS implementasi
FROM satuan_pendidikan sp
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
GROUP BY k.id, k.nama
ORDER BY total_sasaran DESC;
