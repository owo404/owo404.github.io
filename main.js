// WebSocket 서버에 연결
const ws = new WebSocket('ws://127.0.0.1:8080');

// 사용자 이름을 입력받는 변수
let username = '';

// 연결이 성공적으로 열렸을 때 처리
ws.onopen = () => {
    console.log('WebSocket 서버에 연결되었습니다.');
    
    // 유저네임 입력 받기
    promptForUsername();
};

// 서버로부터 메시지를 받았을 때 처리
ws.onmessage = (event) => {
    const messagesDiv = document.getElementById('messages');
    const message = document.createElement('div');
    message.textContent = `서버 메시지: ${event.data}`;
    messagesDiv.appendChild(message);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // 새 메시지가 나타나면 자동으로 스크롤 바닥으로 이동
};

// WebSocket 오류 처리
ws.onerror = (error) => {
    console.error('WebSocket 오류:', error);
};

// WebSocket 연결 종료 시 처리
ws.onclose = () => {
    console.log('WebSocket 연결이 종료되었습니다.');
};

// 유저네임을 입력받는 함수
function promptForUsername() {
    username = prompt('Enter your username:');
    if (username) {
        sendMessage(`${username} has joined the chat.`);
    }

    // 메시지 입력을 위한 HTML 요소 추가
    const inputField = document.getElementById('input');

    // 엔터 키로 메시지 전송
    inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const message = inputField.value;
            if (message) {
                sendMessage(message);
                inputField.value = ''; // 입력 필드 초기화
            }
        }
    });
}

// 메시지를 전송하는 함수
function sendMessage(message) {
    console.log("Sending message:", message);
    const msg = JSON.stringify({
        type: 'message',
        content: message,
        sender: username
    });
    ws.send(msg); // WebSocket을 통해 서버로 메시지 전송
}

window.onbeforeunload = () => {
    ws.close(); // 페이지를 떠날 때 WebSocket 연결 종료
};
