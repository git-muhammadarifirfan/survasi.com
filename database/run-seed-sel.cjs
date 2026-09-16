'use strict';
/**
 * @file database/run-seed-sel.cjs
 * @description Helper script untuk meng-update 58 indikator observasi SEL di MySQL database secara langsung.
 */

const pool = require('../server/db/pool');

const INDIKATORS = [
  // GURU — Kesadaran Diri
  ['guru_kd_kls_1', 1, 'guru', 'kelas', 'Guru meminta murid menuliskan hal yang mereka kuasai dan hal yang perlu mereka tingkatkan', null, 1],
  ['guru_kd_kls_2', 1, 'guru', 'kelas', 'Guru memberi apresiasi atas jawaban murid di kelas', null, 2],
  ['guru_kd_kls_3', 1, 'guru', 'kelas', 'Guru memfasilitasi sesi refleksi di akhir pelajaran', null, 3],
  ['guru_kd_lngk_1', 1, 'guru', 'lingkungan', 'Guru memberi pujian saat murid berani mencoba hal baru. Misal Berani maju ke depan kelas, mengajukan diri menjadi ketua kelas, menjadi petugas upacara dll]', 'Jika selama observasi tidak ada kegiatan, bisa ditanyakan ke guru [secara umum murid, atau hanya murid tertentu]', 4],
  ['guru_kd_lngk_2', 1, 'guru', 'lingkungan', 'Guru mengajak diskusi ringan saat istirahat tentang pengalaman mereka hari itu', 'Wawancara guru jika tidak terjadi', 5],

  // GURU — Regulasi Emosi
  ['guru_re_kls_1', 2, 'guru', 'kelas', 'Ketika kelas gaduh, guru mencontohkan dan mengajak murid menggunakan regulasi emosi (teknik STOP, afirmasi positif, penggunaan tepuk, dll)', null, 6],
  ['guru_re_kls_2', 2, 'guru', 'kelas', 'Guru tetap tenang saat menghadapi situasi yang tak terkendali misalnya, saat kelas gaduh, ada murid tantrum, dll', null, 7],
  ['guru_re_lngk_1', 2, 'guru', 'lingkungan', 'Guru menunjukkan sikap tenang, tidak berteriak atau membentak saat ada kegaduhan di jam istirahat', null, 8],
  ['guru_re_lngk_2', 2, 'guru', 'lingkungan', 'Guru mengingatkan murid dengan kalimat postif saat murid melakukan kesalahan. Misal memecahkan pot, menyerobot antrian di kantin, bermain bola di Lorong kelas dll', null, 9],
  ['guru_re_lngk_3', 2, 'guru', 'lingkungan', 'Guru memberi arahan dengan tenang (tidak memarahi atau membentak) ketika ada murid yang datang terlambat', null, 10],

  // GURU — Kesadaran Sosial
  ['guru_ks_kls_1', 3, 'guru', 'kelas', 'Guru bersikap terbuka dengan jawaban yg berbeda dalam diskusi', null, 11],
  ['guru_ks_kls_2', 3, 'guru', 'kelas', 'Guru menggunakan Bahasa/istilah yang netral saat memberi contoh atau penyampaian materi (GEDSI)', 'Netral: tidak menggunakan bahasa yang mengasosiasikan kelompok tertentu dengan sifat tertentu, misalnya anak perempuan rajin, anak laki laki nakal', 12],
  ['guru_ks_kls_3', 3, 'guru', 'kelas', 'Guru mengatur kelompok secara heterogen (keseimbangan jumlah laki-laki dan perempuan dan atau kemampuan)', null, 13],
  ['guru_ks_kls_4', 3, 'guru', 'kelas', 'Guru berinteraksi secara merata dengan semua gender siswa, baik perempuan maupun laki-laki', null, 14],
  ['guru_ks_kls_5', 3, 'guru', 'kelas', 'Guru berinteraksi secara merata ke dengan semua posisi duduk siswa di semua posisi duduk, baik depan, tengah, belakang, kiri dan kanan', null, 15],
  ['guru_ks_lngk_1', 3, 'guru', 'lingkungan', 'Guru menyapa semua murid tanpa membeda-bedakan status sosial maupun gender jenis kelamin', null, 16],

  // GURU — Keterampilan Relasi
  ['guru_kr_kls_1', 4, 'guru', 'kelas', 'Guru memfasilitasi diskusi kelompok dengan aturan komunikasi positif [Menggunakan kata yang sopan, tidak menyela pembicaraan, memberi kesempatan bergiliran untuk berbicara, menghargai perbedaan pendapat]', null, 17],
  ['guru_kr_kls_2', 4, 'guru', 'kelas', 'Guru membimbing/memberikan contoh/memfasilitasi murid dalam menyelesaikan perbedaan pendapat', null, 18],

  // GURU — Tanggung Jawab
  ['guru_tj_kls_1', 5, 'guru', 'kelas', 'Guru datang tepat waktu dan menyiapkan kelas dengan rapi', null, 19],
  ['guru_tj_kls_2', 5, 'guru', 'kelas', 'Guru mengingatkan murid untuk menyelesaikan tugas tepat waktu', null, 20],
  ['guru_tj_kls_3', 5, 'guru', 'kelas', 'Guru mengajak murid bekerjasama dalam menyelesaikan tugas kelompok/diskusi', null, 21],
  ['guru_tj_kls_4', 5, 'guru', 'kelas', 'Guru memberikan kesempatan pada anak untuk mencoba peran dan tanggung jawab yang berbeda dalam kerja/tugas kelompok', null, 22],
  ['guru_tj_lngk_1', 5, 'guru', 'lingkungan', 'Guru memberikan contoh untuk ikut menjaga kebersihan lingkungan sekolah. Misalnya membuang sampah pada tempatnya', null, 23],
  ['guru_tj_lngk_2', 5, 'guru', 'lingkungan', 'Guru menekankan pentingnya menjaga fasilitas sekolah bersama-sama', null, 24],
  ['guru_tj_lngk_3', 5, 'guru', 'lingkungan', 'Guru mengajak murid ikut serta dalam kegiatan peduli lingkungan', null, 25],

  // MURID — Kesadaran Diri
  ['murid_kd_kls_1', 1, 'murid', 'kelas', 'Murid dapat menyebutkan/menjelaskan perasaannya saat diminta guru', null, 26],
  ['murid_kd_kls_2', 1, 'murid', 'kelas', 'Murid berani menjawab pertanyaan atau presentasi di depan kelas', null, 27],
  ['murid_kd_kls_3', 1, 'murid', 'kelas', 'Murid mau mendengarkan pendapat temannya saat diskusi', null, 28],
  ['murid_kd_lngk_1', 1, 'murid', 'lingkungan', 'Murid mengungkapkan perasaan kepada teman. Misalnya, sedih saat kalah bermain, sakit ketika tak sengaja terdorong teman hingga jatuh, dll', null, 29],
  ['murid_kd_lngk_2', 1, 'murid', 'lingkungan', 'Murid secara aktif menawarkan diri untuk berkontribusi sesuai kemampuannya saat kegiatan di luar jam pelajaran', 'Wawancara guru jika saat observasi tidak ditemukan peristiwa yang mendukung', 30],
  ['murid_kd_lngk_3', 1, 'murid', 'lingkungan', 'Murid menyapa guru dengan ramah, atau mengajak teman (termasuk anak disabilitas-jika ada) bermain bersama', null, 31],
  ['murid_kd_lngk_4', 1, 'murid', 'lingkungan', 'Murid tahu area pribadi yang boleh disentuh – mengingatkan temannya jika tersentuh/disentuh', 'Bisa ditanyakan guru jika tidak ada peristiwa mendukung', 32],

  // MURID — Regulasi Emosi
  ['murid_re_kls_1', 2, 'murid', 'kelas', 'Murid menggunakan teknik regulasi emosi saat merasa kesulitan', 'Jika saat observasi tidak ada peristiwa yg mendukung, bisa ditanyakan kepada murid dan atau guru', 33],
  ['murid_re_kls_2', 2, 'murid', 'kelas', 'Murid tidak langsung menangis atau marah saat gagal menjawab atau kelengkapan menulisnya tidak lengkap', 'Jika tidak ada peristiwa yg mendukung bisa ditanyakan ke guru', 34],
  ['murid_re_kls_3', 2, 'murid', 'kelas', 'Murid kembali mengikuti pembelajaran setelah menenangkan diri', 'Bisa ditanyakan guru jika tidak ada peristiwa yang mendukung selama observasi', 35],
  ['murid_re_lngk_1', 2, 'murid', 'lingkungan', 'Murid tidak membalas ejekan teman', null, 36],
  ['murid_re_lngk_2', 2, 'murid', 'lingkungan', 'Murid bersikap positif saat kalah dalam bermain', null, 37],

  // MURID — Kesadaran Sosial
  ['murid_ks_kls_1', 3, 'murid', 'kelas', 'Murid mendengarkan pendapat teman tanpa memotong', null, 38],
  ['murid_ks_kls_2', 3, 'murid', 'kelas', 'Murid menerima pendapat yang berbeda tanpa mengejek atau menertawakannya', null, 39],
  ['murid_ks_kls_3', 3, 'murid', 'kelas', 'Murid menghibur atau memberi semangat ketika temannya mengalami kesulitan atau sedih', null, 40],
  ['murid_ks_lngk_1', 3, 'murid', 'lingkungan', 'Murid menenangkan teman yang menangis saat bermain', null, 41],
  ['murid_ks_lngk_2', 3, 'murid', 'lingkungan', 'Murid mau bermain bersama teman yang berbeda (jenis kelamin, dan kelompok sosial (berbeda ras, suku, agama), termasuk anak dengan disabilitas', null, 42],

  // MURID — Keterampilan Relasi
  ['murid_kr_1', 4, 'murid', 'kelas', 'Murid tidak berteriak atau mengejek saat konflik muncul', null, 43],
  ['murid_kr_2', 4, 'murid', 'kelas', 'Murid meminta maaf saat berselisih dengan temannya', null, 44],
  ['murid_kr_3', 4, 'murid', 'kelas', 'Murid secara aktif menggunakan 3 kata Ajaib (maaf, terima kasih, dan tolong)', null, 45],
  ['murid_kr_4', 4, 'murid', 'kelas', 'Murid tidak membalas dorongan fisik/prilaku kekerasan fisik', null, 46],
  ['murid_kr_5', 4, 'murid', 'kelas', 'Murid bisa berdamai setelah berselisih', null, 47],

  // MURID — Tanggung Jawab
  ['murid_tj_kls_1', 5, 'murid', 'kelas', 'Murid membawa perlengkapan belajar dengan tertib', null, 48],
  ['murid_tj_kls_2', 5, 'murid', 'kelas', 'Murid mengumpulkan tugas tepat waktu', null, 49],
  ['murid_tj_kls_3', 5, 'murid', 'kelas', 'Murid membantu teman yang kesulitan', null, 50],
  ['murid_tj_kls_4', 5, 'murid', 'kelas', 'Murid merapikan meja dan kursi setelah pembelajaran', null, 51],
  ['murid_tj_kls_5', 5, 'murid', 'kelas', 'Murid menggunakan seragam sesuai dan rapi', null, 52],
  ['murid_tj_lngk_1', 5, 'murid', 'lingkungan', 'Murid bisa mengatur diri sendiri untuk menaati aturan waktu istirahat dan masuk ke kelas tanpa diingatkan guru', null, 53],
  ['murid_tj_lngk_2', 5, 'murid', 'lingkungan', 'Murid menghormati area tubuh teman yang boleh di sentuh dan tidak', null, 54],
  ['murid_tj_lngk_3', 5, 'murid', 'lingkungan', 'Murid menggunakan Bahasa positif ketika berbicara dan bermain bersama teman', null, 55],
  ['murid_tj_lngk_4', 5, 'murid', 'lingkungan', 'Murid mengingatkan ketika ada teman yang menggunakan bahasa yang negatif atau yang bisa membuat orang lain tidak nyaman', null, 56],
  ['murid_tj_lngk_5', 5, 'murid', 'lingkungan', 'Murid menaati kesepakatan kelas dan aturan sekolah', null, 57],
  ['murid_tj_lngk_6', 5, 'murid', 'lingkungan', 'Murid menjaga lingkungan sekolah seperti: membuang sampah pada tempatnya, memelihara tanaman kelas dll', null, 58],
];

async function runSeed() {
  try {
    console.log('🔄 Cleaning & updating sel_indikator table in MySQL...');

    // Foreign key check safe truncate / delete
    await pool.execute(`SET FOREIGN_KEY_CHECKS = 0;`);
    await pool.execute(`TRUNCATE TABLE sel_indikator;`);
    await pool.execute(`SET FOREIGN_KEY_CHECKS = 1;`);

    const sql = `INSERT INTO sel_indikator (kode, dimensi_id, subjek, konteks, teks, catatan, urutan) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    for (const row of INDIKATORS) {
      await pool.execute(sql, row);
    }

    const [rows] = await pool.execute(`
      SELECT 'Total Indikator' AS metric, COUNT(*) AS value FROM sel_indikator
      UNION ALL
      SELECT 'Guru', COUNT(*) FROM sel_indikator WHERE subjek = 'guru'
      UNION ALL
      SELECT 'Murid', COUNT(*) FROM sel_indikator WHERE subjek = 'murid'
    `);

    console.log('✅ Successfully updated MySQL sel_indikator database!');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update database:', err.message);
    process.exit(1);
  }
}

runSeed();
