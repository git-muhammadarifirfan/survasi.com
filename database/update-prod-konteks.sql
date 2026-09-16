-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL UPDATE OPSI JANGKAUAN SISWA SEL UNTUK DATABASE PRODUCTION
-- ═══════════════════════════════════════════════════════════════════════════════

DELETE FROM sel_konteks_options WHERE kategori = 'jangkauan';

INSERT INTO sel_konteks_options (kategori, label, value_code, urutan, is_active) VALUES
('jangkauan', 'Menjangkau seluruh siswa', 'Menjangkau seluruh siswa', 1, 1),
('jangkauan', 'Menjangkau lebih dari separuh siswa', 'Menjangkau lebih dari separuh siswa', 2, 1),
('jangkauan', 'Menjangkau kurang separuh siswa', 'Menjangkau kurang separuh siswa', 3, 1),
('jangkauan', 'Hanya sebagian kecil siswa (jika memungkinkan sertakan jumlah, jika memilih ini)', 'Hanya sebagian kecil siswa (jika memungkinkan sertakan jumlah, jika memilih ini)', 4, 1);
