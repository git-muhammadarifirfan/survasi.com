const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'db_survasi'
  });

  console.log('Clearing old data...');
  await connection.query('DELETE FROM jawaban_survey');
  await connection.query('DELETE FROM responden_survey');

  console.log('Inserting responden...');
  const [res] = await connection.query(`
    INSERT INTO responden_survey (nama, jenis_kelamin, posisi, sekolah_id, npsn, kabupaten_id, kecamatan_id, penerima_modul, penyelenggara_pelatihan, status_implementasi, kelas_mengajar)
    VALUES 
    ('Guru A', 'L', 'Guru kelas 1', 1, '20501539', 1, 2, 'Ya', 'INOVASI', 'sudah', 'Kelas Awal'),
    ('Guru B', 'P', 'Guru kelas 4', 1, '20501539', 1, 2, 'Ya', 'INOVASI', 'sebagian', 'Kelas Tinggi'),
    ('Guru C', 'P', 'Guru kelas 6', 1, '20501539', 1, 2, 'Tidak', '-', 'belum', '-'),
    ('Guru D', 'L', 'Guru kelas 2', 1, '20501539', 1, 2, 'Ya', 'INOVASI', 'sudah', 'Kelas Awal')
  `);
  
  const firstId = res.insertId;

  console.log('Fetching questions...');
  const [questions] = await connection.query('SELECT id, modul_id, opsi_jawaban FROM pertanyaan_survey WHERE modul_id IS NOT NULL');

  console.log('Inserting answers...');
  const answers = [];
  
  for (let r = 0; r < 4; r++) {
    const respId = firstId + r;
    for (const q of questions) {
      let opts = [];
      try {
        opts = JSON.parse(q.opsi_jawaban);
      } catch (e) {}
      
      let answerText = '';
      if (opts && opts.length > 0) {
        // give positive answers mostly to respondents 0 and 3
        if ((r === 0 || r === 3) && opts.some(o => o.toLowerCase().includes('ya') || o.toLowerCase().includes('sudah') || o.toLowerCase().includes('rutin'))) {
           answerText = opts.find(o => o.toLowerCase().includes('ya') || o.toLowerCase().includes('sudah') || o.toLowerCase().includes('rutin'));
        } else {
           answerText = opts[Math.floor(Math.random() * opts.length)];
        }
      } else {
        answerText = 'Jawaban esai';
      }

      answers.push([respId, q.id, answerText, '']);
    }
  }

  if (answers.length > 0) {
    await connection.query('INSERT INTO jawaban_survey (responden_id, pertanyaan_id, jawaban_terstruktur, jawaban_bebas) VALUES ?', [answers]);
  }

  console.log('Done seeding clean data!');
  await connection.end();
}

seed().catch(console.error);
