const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// MySQL 연결
connection.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류:', err);
  } else {
    console.log('MySQL에 연결되었습니다.');
  }
});

// URL 정보와 카테고리를 로그로 저장
app.post('/log', (req, res) => {
  const { url, category } = req.body;

  if (url !== 'chrome://newtab/') {
    checkDuplicateURL(url)
      .then((isDuplicate) => {
        if (!isDuplicate) {
          saveLogToDatabase(url, category);
          console.log('로그 데이터가 MySQL에 저장되었습니다.');
        } else {
          console.log('동일한 URL이 이미 존재합니다. 로그 데이터를 삽입하지 않습니다.');
        }
        res.sendStatus(200);
      })
      .catch((err) => {
        console.error('중복 URL 확인 오류:', err);
        res.sendStatus(500);
      });
  } else {
    console.log('chrome://newtab/ URL은 로그 데이터에 저장되지 않습니다.');
    res.sendStatus(200);
  }
});

// MySQL에 로그 데이터 삽입
function saveLogToDatabase(url, category) {
  const query = 'INSERT INTO logs (url, category) VALUES (?, ?)';
  const values = [url, category];

  connection.query(query, values, (err) => {
    if (err) {
      console.error('로그 데이터 삽입 오류:', err);
    }
  });
}

// 중복 URL 확인
function checkDuplicateURL(url) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) AS count FROM logs WHERE url = ?';
    const values = [url];

    connection.query(query, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const count = result[0].count;
        resolve(count > 0);
      }
    });
  });
}

module.exports = app;
