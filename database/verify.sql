-- ═══════════════════════════════════════════════════════════════════════════════
-- BSAN JAWA TIMUR — VERIFICATION SCRIPT
-- Jalankan setelah semua seed data untuk memverifikasi integritas
--
-- @usage
--   mysql -u root -p bsan_jatim_monitoring < database/verify.sql
-- ═══════════════════════════════════════════════════════════════════════════════

USE bsan_jatim_monitoring;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABLE COUNT — Harus = 20
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'TABLE COUNT' AS test,
  COUNT(*) AS actual,
  20 AS expected,
  CASE WHEN COUNT(*) = 20 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM information_schema.tables
WHERE table_schema = 'bsan_jatim_monitoring'
  AND table_type = 'BASE TABLE';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. VIEW COUNT — Harus = 3
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'VIEW COUNT' AS test,
  COUNT(*) AS actual,
  3 AS expected,
  CASE WHEN COUNT(*) = 3 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM information_schema.views
WHERE table_schema = 'bsan_jatim_monitoring';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FOREIGN KEY COUNT — Memastikan semua FK terbentuk
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'FOREIGN KEY COUNT' AS test,
  COUNT(*) AS actual,
  '≥ 25' AS expected,
  CASE WHEN COUNT(*) >= 25 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM information_schema.table_constraints
WHERE table_schema = 'bsan_jatim_monitoring'
  AND constraint_type = 'FOREIGN KEY';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SEED DATA VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'Provinsi' AS tabel, COUNT(*) AS actual, 1 AS expected,
  CASE WHEN COUNT(*) = 1 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM provinsi
UNION ALL
SELECT 'Kabupaten', COUNT(*), 3,
  CASE WHEN COUNT(*) = 3 THEN '✓ PASS' ELSE '✗ FAIL' END
FROM kabupaten
UNION ALL
SELECT 'Kecamatan', COUNT(*), 42,
  CASE WHEN COUNT(*) >= 40 THEN '✓ PASS' ELSE '✗ FAIL' END
FROM kecamatan
UNION ALL
SELECT 'Modul BSAN', COUNT(*), 3,
  CASE WHEN COUNT(*) = 3 THEN '✓ PASS' ELSE '✗ FAIL' END
FROM modul_bsan
UNION ALL
SELECT 'SEL Dimensi', COUNT(*), 5,
  CASE WHEN COUNT(*) = 5 THEN '✓ PASS' ELSE '✗ FAIL' END
FROM sel_dimensi
UNION ALL
SELECT 'Users', COUNT(*), 2,
  CASE WHEN COUNT(*) >= 2 THEN '✓ PASS' ELSE '✗ FAIL' END
FROM users
UNION ALL
SELECT 'User Preferences', COUNT(*), 2,
  CASE WHEN COUNT(*) >= 2 THEN '✓ PASS' ELSE '✗ FAIL' END
FROM user_preferences
UNION ALL
SELECT 'Alur Tema', COUNT(*), 22,
  CASE WHEN COUNT(*) >= 20 THEN '✓ PASS' ELSE '✗ FAIL' END
FROM alur_tema;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SEL INDIKATOR VERIFICATION (setelah seed-sel-indikator.sql)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'SEL Indikator Total' AS test,
  COUNT(*) AS actual,
  '≥ 55' AS expected,
  CASE WHEN COUNT(*) >= 55 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM sel_indikator;

SELECT 'SEL Indikator Guru' AS test,
  COUNT(*) AS actual,
  '≥ 26' AS expected,
  CASE WHEN COUNT(*) >= 26 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM sel_indikator WHERE subjek = 'guru';

SELECT 'SEL Indikator Murid' AS test,
  COUNT(*) AS actual,
  '≥ 29' AS expected,
  CASE WHEN COUNT(*) >= 29 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM sel_indikator WHERE subjek = 'murid';


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. PERTANYAAN SURVEY VERIFICATION (setelah seed-pertanyaan.sql)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'Pertanyaan Survey' AS test,
  COUNT(*) AS actual,
  37 AS expected,
  CASE WHEN COUNT(*) = 37 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM pertanyaan_survey;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. RELATIONAL INTEGRITY — Cek orphan records
-- ─────────────────────────────────────────────────────────────────────────────

-- Kecamatan tanpa kabupaten
SELECT 'Orphan Kecamatan' AS test,
  COUNT(*) AS actual,
  0 AS expected,
  CASE WHEN COUNT(*) = 0 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM kecamatan k
LEFT JOIN kabupaten kb ON k.kabupaten_id = kb.id
WHERE kb.id IS NULL;

-- Users dengan sekolah_id yang tidak ada
SELECT 'Orphan Users (sekolah)' AS test,
  COUNT(*) AS actual,
  0 AS expected,
  CASE WHEN COUNT(*) = 0 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM users u
LEFT JOIN satuan_pendidikan sp ON u.sekolah_id = sp.id
WHERE u.sekolah_id IS NOT NULL AND sp.id IS NULL;

-- User preferences tanpa user
SELECT 'Orphan Preferences' AS test,
  COUNT(*) AS actual,
  0 AS expected,
  CASE WHEN COUNT(*) = 0 THEN '✓ PASS' ELSE '✗ FAIL' END AS result
FROM user_preferences up
LEFT JOIN users u ON up.user_id = u.id
WHERE u.id IS NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. KECAMATAN PER KABUPATEN
-- ─────────────────────────────────────────────────────────────────────────────

SELECT kb.nama AS kabupaten, COUNT(*) AS jumlah_kecamatan
FROM kecamatan k
JOIN kabupaten kb ON k.kabupaten_id = kb.id
GROUP BY kb.id, kb.nama;

-- Expected:
-- Kab. Sidoarjo: 18
-- Kota Batu: 3
-- Kab. Tuban: 21


-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF VERIFICATION
-- Semua test harus menunjukkan ✓ PASS
-- ═══════════════════════════════════════════════════════════════════════════════
