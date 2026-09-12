-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL PATCH: MAPPING PERTANYAAN SURVEY KE MODUL BSAN (1–5)
-- ═══════════════════════════════════════════════════════════════════════════════

USE db_survasi;

-- 1. Pastikan kolom modul_id ada di pertanyaan_survey
ALTER TABLE `pertanyaan_survey` ADD COLUMN IF NOT EXISTS `modul_id` INT NULL COMMENT 'FK ke modul_bsan.id';

-- 2. Update mapping pertanyaan_survey ke modul_id
-- Modul 1: Literasi & Numerasi Dasar (Q9 - Q16, Q22 - Q25)
UPDATE `pertanyaan_survey` 
SET `modul_id` = 1 
WHERE `kode_pertanyaan` IN ('Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16', 'Q22', 'Q23', 'Q24', 'Q25')
   OR (`section` IN ('pelatihan', 'implementasi_awal') AND `modul_id` IS NULL AND `kode_pertanyaan` NOT IN ('Q17','Q18','Q19','Q20','Q21'));

-- Modul 2: Disiplin Positif & Antiperundungan (Q17 - Q21)
UPDATE `pertanyaan_survey` 
SET `modul_id` = 2 
WHERE `kode_pertanyaan` IN ('Q17', 'Q18', 'Q19', 'Q20', 'Q21');

-- Modul 3: Kesehatan Emosi & Pengelolaan Stres (Q26 - Q30)
UPDATE `pertanyaan_survey` 
SET `modul_id` = 3 
WHERE `kode_pertanyaan` IN ('Q26', 'Q27', 'Q28', 'Q29', 'Q30');

-- Modul 4: Kebersihan & Kesehatan Lingkungan (Q31, Q32)
UPDATE `pertanyaan_survey` 
SET `modul_id` = 4 
WHERE `kode_pertanyaan` IN ('Q31', 'Q32') OR `section` = 'kepsek';

-- Modul 5: Kemitraan Orang Tua & Komite (Q33 - Q36)
UPDATE `pertanyaan_survey` 
SET `modul_id` = 5 
WHERE `kode_pertanyaan` IN ('Q33', 'Q34', 'Q35', 'Q36') OR `section` = 'refleksi';

-- 3. Verifikasi Jumlah Pertanyaan Terklasifikasi Per Modul
SELECT 
  COALESCE(p.modul_id, 0) AS modul_id,
  CASE 
    WHEN p.modul_id = 1 THEN 'Modul 1: Literasi & Numerasi Dasar'
    WHEN p.modul_id = 2 THEN 'Modul 2: Disiplin Positif & Antiperundungan'
    WHEN p.modul_id = 3 THEN 'Modul 3: Kesehatan Emosi & Pengelolaan Stres'
    WHEN p.modul_id = 4 THEN 'Modul 4: Kebersihan & Kesehatan Lingkungan'
    WHEN p.modul_id = 5 THEN 'Modul 5: Kemitraan Orang Tua & Komite'
    ELSE 'Umum / Demografi'
  END AS nama_modul,
  COUNT(*) AS jumlah_pertanyaan
FROM pertanyaan_survey p
WHERE p.is_active = 1
GROUP BY p.modul_id
ORDER BY p.modul_id;
