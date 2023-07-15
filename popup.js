document.addEventListener("DOMContentLoaded", function() {
    const showLogsButton = document.getElementById("showLogsButton");
    const logsList = document.getElementById("logsList");
  
    // 로그 보기 버튼 클릭 이벤트 처리
    showLogsButton.addEventListener("click", function() {
      // 로그 목록 요청
      fetch("http://172.10.5.170/logs")
        .then(function(response) {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("로그 목록을 가져오는 중 오류가 발생했습니다.");
          }
        })
        .then(function(logs) {
          // 로그 목록을 화면에 표시
          logsList.innerHTML = "";
          logs.forEach(function(log) {
            const listItem = document.createElement("li");
            listItem.textContent = "URL: " + log.url + ", 카테고리: " + log.category;
            logsList.appendChild(listItem);
          });
        })
        .catch(function(error) {
          console.error("로그 목록 가져오기 오류:", error);
        });
    });
  });
  
    // 서버에서 로그를 가져오는 함수
    function fetchLogsFromServer(callback) {
      fetch("http://172.10.5.170/logs")
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          callback(data);
        })
        .catch(function(error) {
          console.error("로그를 가져오는 중 오류 발생:", error);
          callback([]);
        });
    }