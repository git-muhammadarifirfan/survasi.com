-- ═══════════════════════════════════════════════════════════════════════════════
-- MODUL BSAN QUERIES
-- Digunakan oleh: halaman Modul BSAN (ring chart, detail per modul)
--
-- Formula: [Capaian %] = (40% × Base Rate) + (30% × Impl Rate) + (30% × SEL Score)
-- @tables_used: modul_bsan, responden_survey, sel_jawaban_observasi, sel_dimensi
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Base Rate & Impl Rate per kabupaten ───

SELECT
  kb.nama AS kabupaten,
  COUNT(*) AS total_responden,
  -- Base Rate: penerima modul Ya
  ROUND(SUM(CASE WHEN rs.penerima_modul = 'Ya' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS base_rate,
  -- Impl Rate: sudah + 0.5 × sebagian
  ROUND(
    (SUM(CASE WHEN rs.status_implementasi = 'sudah' THEN 1 ELSE 0 END) +
     SUM(CASE WHEN rs.status_implementasi = 'sebagian' THEN 0.5 ELSE 0 END))
    / COUNT(*) * 100, 1
  ) AS impl_rate
FROM responden_survey rs
JOIN kabupaten kb ON rs.kabupaten_id = kb.id
WHERE (:kabupaten_id IS NULL OR kb.id = :kabupaten_id)
GROUP BY kb.id, kb.nama;


-- ─── SEL Score per modul BSAN (supplement untuk ring chart) ───

SELECT
  sd.modul_bsan_kode AS modul_kode,
  mb.nama AS modul_nama,
  ROUND(AVG(sjo.skor), 2) AS avg_skor_raw,
  ROUND(AVG(sjo.skor) / 4 * 100, 1) AS sel_score_persen
FROM sel_jawaban_observasi sjo
JOIN sel_indikator si ON sjo.indikator_id = si.id
JOIN sel_dimensi sd ON si.dimensi_id = sd.id
JOIN modul_bsan mb ON mb.kode = sd.modul_bsan_kode
JOIN sel_sesi_observasi sso ON sjo.sesi_id = sso.id
JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE sjo.skor IS NOT NULL
  AND (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
GROUP BY sd.modul_bsan_kode, mb.nama
ORDER BY mb.urutan;


-- ─── Detail skor per dimensi per modul (breakdown) ───

SELECT
  sd.kode AS dimensi_kode,
  sd.nama AS dimensi_nama,
  sd.modul_bsan_kode,
  ROUND(AVG(CASE WHEN si.subjek = 'guru' THEN sjo.skor END), 2) AS guru_avg,
  ROUND(AVG(CASE WHEN si.subjek = 'murid' THEN sjo.skor END), 2) AS murid_avg,
  ROUND(AVG(sjo.skor), 2) AS total_avg,
  COUNT(DISTINCT sso.id) AS jumlah_sesi
FROM sel_jawaban_observasi sjo
JOIN sel_indikator si ON sjo.indikator_id = si.id
JOIN sel_dimensi sd ON si.dimensi_id = sd.id
JOIN sel_sesi_observasi sso ON sjo.sesi_id = sso.id
JOIN satuan_pendidikan sp ON sso.sekolah_id = sp.id
JOIN kecamatan k ON sp.kecamatan_id = k.id
WHERE sjo.skor IS NOT NULL
  AND (:kabupaten_id IS NULL OR k.kabupaten_id = :kabupaten_id)
GROUP BY sd.id, sd.kode, sd.nama, sd.modul_bsan_kode
ORDER BY sd.urutan;
