// popup.js
document.addEventListener('DOMContentLoaded', function () {
  const showLogsButton = document.getElementById('showLogsButton');
  const logsList = document.getElementById('logsList');
  const updateCategoryButton = document.getElementById('updateCategoryButton');
  const categoryIdInput = document.getElementById('categoryIdInput');
  const categoryInput = document.getElementById('categoryInput');

  // 로그 보기 버튼 클릭 이벤트 처리
  showLogsButton.addEventListener('click', function () {
    // 로그 목록 요청
    fetch('http://172.10.5.170/logs')
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('로그 목록을 가져오는 중 오류가 발생했습니다.');
        }
      })
      .then(function (logs) {
        // 로그 목록을 화면에 표시
        logsList.innerHTML = '';
        logs.forEach(function (log) {
          const listItem = document.createElement('li');
          listItem.textContent = `URL: ${log.url}, 카테고리: ${log.category}`;
          logsList.appendChild(listItem);
        });
      })
      .catch(function (error) {
        console.error('로그 목록 가져오기 오류:', error);
      });
  });

  // 카테고리 업데이트 버튼 클릭 이벤트 처리
  updateCategoryButton.addEventListener('click', function () {
    const id = categoryIdInput.value;
    const category = categoryInput.value;
    updateCategory(id, category);
  });

  // 팝업 스크립트인 popup.js 파일 내에서 사용자가 입력한 정보를 바탕으로 카테고리 업데이트를 호출하는 함수
  function updateCategory(id, category) {
    // 백그라운드 스크립트에 메시지를 보내어 카테고리 업데이트를 요청합니다.
    chrome.runtime.sendMessage({ type: 'updateCategory', id, category }, function (response) {
      console.log(response.message);
    });
  }
});
