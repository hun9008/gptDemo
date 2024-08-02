let previousMessages = [];

document.getElementById('message-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const textInput = document.getElementById('text');
    const fileInput = document.getElementById('file');
    const messagesDiv = document.getElementById('messages');

    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.innerHTML = `<p><strong>You:</strong> ${textInput.value}</p>`;
    messagesDiv.appendChild(userMessageDiv);

    let fullText = textInput.value;

    // 이전 메시지를 포함하여 fullText 구성
    if (previousMessages.length > 0) {
        fullText = previousMessages.join('\n') + '\n' + textInput.value;
    }

    const formData = new FormData();
    formData.append('text', fullText);

    if (fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
    }

    try {
        let response;
        if (fileInput.files[0]) {
            response = await fetch('http://127.0.0.1:8006/api/upload', {
                method: 'POST',
                body: formData
            });
        } else {
            response = await fetch('http://127.0.0.1:8006/api/text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ 'text': fullText })
            });
        }

        const result = await response.json();

        const serverMessageDiv = document.createElement('div');
        serverMessageDiv.classList.add('message', 'server-message');
        serverMessageDiv.innerHTML = `<p><strong>Server:</strong> ${result}</p>`;
        messagesDiv.appendChild(serverMessageDiv);

        // MathJax가 새로운 내용을 처리하도록 요청
        MathJax.typesetPromise();

        // 이전 메시지에 현재 메시지와 서버 응답 추가
        previousMessages.push(`You: ${textInput.value}`);
        previousMessages.push(`Server: ${result}`);

    } catch (error) {
        console.error('Error:', error);
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.classList.add('message', 'server-message');
        errorMessageDiv.innerHTML = `<p><strong>Error:</strong> ${error.message}</p>`;
        messagesDiv.appendChild(errorMessageDiv);
    }

    // Clear the inputs
    textInput.value = '';
    fileInput.value = '';

    // Scroll to the bottom of the messages
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});