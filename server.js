// server.js

const express = require("express");
const app = express();

// 로그 데이터
const logs = [];

app.set('port', 80);

// URL 정보를 로그로 저장
app.post("/log", express.json(), (req, res) => {
  const url = req.body.url;
  logs.push(url);
  console.log("로그 저장:", url);
  res.sendStatus(200);
});

// 로그 목록 요청 처리
app.get("/logs", (req, res) => {
  res.json(logs);
});

app.listen(app.get('port'), () => {
  console.log("서버가 실행되었습니다. 포트: " + app.get('port'));
});
