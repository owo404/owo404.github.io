// WebSocket 서버에 연결
let ws = new WebSocket('ws://127.0.0.1:8080');

// 사용자 이름을 입력받는 변수
let username = '';

// WebSocket 재연결 시도 간격 (밀리초)
const reconnectInterval = 3000;

// 연결이 성공적으로 열렸을 때 처리
ws.onopen = () => {
    console.log('WebSocket 서버에 연결되었습니다.');
    promptForUsername();
};

// 서버로부터 메시지를 받았을 때 처리
ws.onmessage = (event) => {
    const messagesDiv = document.getElementById('messages');
    try {
        const data = JSON.parse(event.data); // 서버 메시지 JSON 파싱
        const messageElement = createMessageElement(data.sender, data.content);
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // 새 메시지가 나타나면 자동 스크롤
    } catch (error) {
        console.error('Invalid message format:', event.data);
    }
};

// WebSocket 연결 종료 시 처리
ws.onclose = () => {
    console.log('WebSocket 연결이 종료되었습니다. 재연결 시도 중...');
    setTimeout(() => {
        ws = new WebSocket('ws://127.0.0.1:8080');
        setupWebSocketHandlers(); // 핸들러 재등록
    }, reconnectInterval);
};

// WebSocket 오류 처리
ws.onerror = (error) => {
    console.error('WebSocket 오류:', error);
};

// 유저네임을 입력받는 함수
function promptForUsername() {
    do {
        username = prompt('Enter your username:').trim();
    } while (!username); // 빈 입력 허용하지 않음

    sendMessage(`${username} has joined the chat.`);

    // 메시지 입력 이벤트 핸들러 추가
    const inputField = document.getElementById('input');
    inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const message = inputField.value.trim();
            if (message) {
                sendMessage(message);
                inputField.value = ''; // 입력 필드 초기화
                inputField.focus(); // 포커스 유지
            }
        }
    });
}

// 메시지를 전송하는 함수
function sendMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
        const msg = JSON.stringify({
            type: 'message',
            content: message,
            sender: username
        });
        ws.send(msg); // WebSocket을 통해 서버로 메시지 전송
    } else {
        console.error('WebSocket 연결이 열려있지 않습니다.');
    }
}

// 메시지 HTML 요소 생성 함수
function createMessageElement(sender, content) {
    const message = document.createElement('div');
    message.innerHTML = `<strong>${sender}:</strong> ${content}`;
    return message;
}

// WebSocket 핸들러를 재설정하는 함수
function setupWebSocketHandlers() {
    ws.onopen = () => {
        console.log('WebSocket 서버에 재연결되었습니다.');
        sendMessage(`${username} has rejoined the chat.`);
    };

    ws.onmessage = (event) => {
        const messagesDiv = document.getElementById('messages');
        try {
            const data = JSON.parse(event.data);
            const messageElement = createMessageElement(data.sender, data.content);
            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (error) {
            console.error('Invalid message format:', event.data);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket 연결이 종료되었습니다. 재연결 시도 중...');
        setTimeout(() => {
            ws = new WebSocket('ws://127.0.0.1:8080');
            setupWebSocketHandlers();
        }, reconnectInterval);
    };

    ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
    };
}

// 페이지를 떠날 때 WebSocket 연결 종료
window.onbeforeunload = () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.close();
    }
};
