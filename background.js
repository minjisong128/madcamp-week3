// background.js
// 탭 ID와 URL 매핑을 저장하는 객체
var tabUrls = {};
// 탭이 업데이트될 때마다 URL 저장
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    tabUrls[tabId] = tab.url;
  }
});
// 탭이 닫힐 때 URL 저장
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (tabUrls[tabId]) {
    var url = tabUrls[tabId];
    saveLog(url, "기본"); // 로그 저장 함수 호출
    delete tabUrls[tabId]; // URL 정보 삭제
  }
});

// 로그를 저장하는 함수
function saveLog(url, category) {
  fetch("http://172.10.5.170/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url: url, category: category })
  })
    .then(function(response) {
      if (response.ok) {
        console.log("로그가 서버에 저장되었습니다.");
      } else {
        console.error("로그 저장 중 오류 발생:", response.status);
      }
    })
    .catch(function(error) {
      console.error("로그 저장 중 오류 발생:", error);
    });
}

// 웹사이트에서 메시지 수신 및 처리
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "updateCategory") {
      const { id, category } = request;
      updateLogCategory(id, category);
      sendResponse({ message: "카테고리 변경 완료" });
    }
  });
  
  // 카테고리 업데이트 함수
  function updateLogCategory(id, category) {
    // 여기에 MySQL 업데이트 로직을 추가합니다.
    // MySQL 연결 및 쿼리 실행 코드
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
  
    connection.connect(function(err) {
      if (err) {
        console.error("MySQL 연결 오류:", err);
      } else {
        console.log("MySQL에 연결되었습니다.");
        
        // 카테고리 업데이트 쿼리 실행
        const query = "UPDATE logs SET category = ? WHERE id = ?";
        const values = [category, id];
  
        connection.query(query, values, function(err, result) {
          if (err) {
            console.error("카테고리 업데이트 오류:", err);
          } else {
            console.log("카테고리가 업데이트되었습니다.");
          }
  
          // MySQL 연결 종료
          connection.end();
        });
      }
    });
  }