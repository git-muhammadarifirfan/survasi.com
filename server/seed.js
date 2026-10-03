const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function run() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'db_survasi',
    multipleStatements: true
  });

  const sql = fs.readFileSync(path.join(__dirname, '../database/import-responden.sql'), 'utf8');
  console.log('Importing data...');
  await connection.query(sql);
  console.log('Done!');
  await connection.end();
}

run().catch(console.error);
