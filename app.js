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
  
  // MySQL에 데이터 삽입
  saveLogToDatabase(url, category, (err) => {
    if (err) {
      console.error('로그 데이터 삽입 오류:', err);
      res.sendStatus(500);
    } else {
      if (url !== "chrome://newtab/") {
        console.log('로그 데이터가 MySQL에 저장되었습니다.');
      }
      res.sendStatus(200);
    }
  });
});

// MySQL에 로그 데이터 삽입
function saveLogToDatabase(url, category, callback) {
  if (url !== "chrome://newtab/") {
    const query = 'INSERT INTO logs (url, category) VALUES (?, ?)';
    const values = [url, category];

    connection.query(query, values, (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  } else {
    console.log("chrome://newtab/ URL은 로그 데이터에 저장되지 않습니다.");
    callback(null); // URL이 "chrome://newtab/"인 경우에는 삽입하지 않고 콜백을 호출합니다.
  }
}

module.exports = app;
