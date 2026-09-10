-- ═══════════════════════════════════════════════════════════════════════════════
-- LAPORAN & EKSPOR QUERIES
-- Digunakan oleh: halaman Laporan & Ekspor
-- @tables_used: laporan_export, users, satuan_pendidikan, responden_survey,
--               sel_sesi_observasi, kecamatan, kabupaten
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Riwayat export ───

SELECT
  le.id, le.tipe_export, le.nama_file, le.status,
  le.created_at, le.completed_at,
  le.filter_params,
  u.nama AS created_by
FROM laporan_export le
JOIN users u ON le.user_id = u.id
WHERE le.user_id = :user_id
ORDER BY le.created_at DESC
LIMIT 20;


-- ─── Summary data untuk laporan PDF/Excel ───

-- Rekap per kabupaten
SELECT
  kb.nama AS kabupaten,
  COUNT(sp.id) AS total_sekolah,
  SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) AS sudah,
  SUM(CASE WHEN sp.status_pengisian = 'sebagian' THEN 1 ELSE 0 END) AS sebagian,
  SUM(CASE WHEN sp.status_pengisian = 'belum' THEN 1 ELSE 0 END) AS belum,
  ROUND(
    SUM(CASE WHEN sp.status_pengisian = 'sudah' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1
  ) AS rate,
  (SELECT COUNT(*) FROM responden_survey rs
   WHERE rs.kabupaten_id = kb.id) AS total_responden,
  (SELECT COUNT(*) FROM sel_sesi_observasi sso
   JOIN satuan_pendidikan sp2 ON sso.sekolah_id = sp2.id
   JOIN kecamatan k2 ON sp2.kecamatan_id = k2.id
   WHERE k2.kabupaten_id = kb.id AND sso.status = 'submitted') AS sesi_observasi
FROM kabupaten kb
LEFT JOIN kecamatan k ON k.kabupaten_id = kb.id
LEFT JOIN satuan_pendidikan sp ON sp.kecamatan_id = k.id
GROUP BY kb.id, kb.nama;


-- ─── Insert new export job ───

INSERT INTO laporan_export (user_id, tipe_export, nama_file, filter_params, status)
VALUES (:user_id, :tipe, :nama_file, :filter_params, 'generating');

-- ─── Update export status ───

UPDATE laporan_export
SET status = :status, completed_at = CURRENT_TIMESTAMP, path_file = :path_file
WHERE id = :export_id;
