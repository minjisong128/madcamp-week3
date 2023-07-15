const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
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
  const log = { url, category };
  logs.push(log);

  // MySQL에 데이터 삽입
  saveLogToDatabase(url, category);

  console.log("로그 저장:", log);
  res.sendStatus(200);
});

// MySQL에 로그 데이터 삽입
function saveLogToDatabase(url, category) {
  if (url !== "chrome://newtab/") {
    const query = "INSERT INTO logs (url, category) VALUES (?, ?)";
    const values = [url, category];

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error("로그 데이터 삽입 오류:", err);
      } else {
        console.log("로그 데이터가 MySQL에 저장되었습니다.");
      }
    });
  } else {
    console.log("chrome://newtab/ URL은 로그 데이터에 저장되지 않습니다.");
  }
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
  res.json(logs);
});

app.listen(app.get("port"), () => {
  console.log("서버가 실행되었습니다. 포트: " + app.get("port"));
});
