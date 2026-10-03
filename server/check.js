const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'db_survasi'
  });

  const [r1] = await connection.query('SELECT COUNT(*) as c FROM responden_survey');
  const [r2] = await connection.query('SELECT COUNT(*) as c FROM jawaban_survey');
  
  console.log('Responden:', r1[0].c);
  console.log('Jawaban:', r2[0].c);
  
  await connection.end();
}

check().catch(console.error);
