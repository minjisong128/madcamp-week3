const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const app = express();

dotenv.config(); // .env 파일에서 환경 변수 로드

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// MySQL 연결
connection.connect((err) => {
  if (err) {
    console.error("MySQL 연결 오류:", err);
  } else {
    console.log("MySQL에 연결되었습니다.");
  }
});

// 로그 데이터
const logs = [];

app.set("port", process.env.PORT || 80);

app.use(require("./app.js"));

// URL 정보와 카테고리를 로그로 저장
app.post("/log", express.json(), (req, res) => {
  const { url, category } = req.body;

  if (url !== "chrome://newtab/") {
    checkDuplicateURL(url)
      .then((isDuplicate) => {
        if (!isDuplicate) {
          saveLogToDatabase(url, category);
          console.log("로그 저장:", { url, category });
        } else {
          console.log("동일한 URL이 이미 존재합니다. 로그 데이터를 삽입하지 않습니다.");
        }
        res.sendStatus(200);
      })
      .catch((err) => {
        console.error("중복 URL 확인 오류:", err);
        res.sendStatus(500);
      });
  } else {
    console.log("chrome://newtab/ URL은 로그 데이터에 저장되지 않습니다.");
    res.sendStatus(200);
  }
});

// MySQL에 로그 데이터 삽입
function saveLogToDatabase(url, category) {
  const query = "INSERT INTO logs (url, category) VALUES (?, ?)";
  const values = [url, category];

  connection.query(query, values, (err) => {
    if (err) {
      console.error("로그 데이터 삽입 오류:", err);
    }
  });
}

// 중복 URL 확인
function checkDuplicateURL(url) {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) AS count FROM logs WHERE url = ?";
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

// 카테고리 업데이트 요청 처리
app.post("/update-log", express.json(), (req, res) => {
  const { url, category } = req.body;
  const log = logs.find((log) => log.url === url);
  if (log) {
    log.category = category;
    console.log("로그 카테고리 업데이트:", log);

    // MySQL에서 로그 데이터 업데이트
    updateLogInDatabase(url, category);

    res.sendStatus(200);
  } else {
    console.error("로그를 찾을 수 없음");
    res.sendStatus(404);
  }
});

// MySQL에서 로그 데이터 업데이트
function updateLogInDatabase(url, category) {
  const query = "UPDATE logs SET category = ? WHERE url = ?";
  const values = [category, url];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("로그 데이터 업데이트 오류:", err);
    } else {
      console.log("로그 데이터가 MySQL에서 업데이트되었습니다.");
    }
  });
}

// 로그 목록 요청 처리
app.get("/logs", (req, res) => {
  connection.query('SELECT * FROM logs', (err, results) => {
    if (err) {
      console.error("로그 목록 가져오기 오류:", err);
      res.sendStatus(500);
    } else {
      const logs = results.map((row) => ({ url: row.url, category: row.category }));
      res.json(logs);
    }
  });
});

app.listen(app.get("port"), () => {
  console.log("서버가 실행되었습니다. 포트: " + app.get("port"));
});
