let chatHistory = [];

function toggleChat() {
    const chatBox = document.querySelector('.chat-box');
    const chatOverlay = document.querySelector('.chat-overlay');
    if (chatBox.style.display === 'none' || !chatBox.style.display) {
        chatOverlay.style.display = 'block';
        chatBox.style.display = 'flex';
        setTimeout(() => {
            chatBox.classList.add('open');
        }, 10);
        loadChatHistory();
        loadCurrentNode();
        if (currentNode.id !== 'end' && chatHistory.length === 0) {
            appendMessage('system', currentNode.message);
            if (currentNode.options) {
                displayOptions(currentNode.options);
            }
        }
    } else {
        chatBox.classList.remove('open');
        setTimeout(() => {
            chatBox.style.display = 'none';
            chatOverlay.style.display = 'none';
        }, 300);
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const chatInputField = document.getElementById('chat-input-field');
    const message = chatInputField.value.trim();

    if (message !== '') {
        chatInputField.value = '';
        handleChatFlow('client', message);
    }
}

function appendMessage(sender, message, saveToHistory = true) {
    const chatContent = document.getElementById('chat-content');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'system' ? 'chat-message system-message' : 'chat-message user-message';
    messageDiv.textContent = message;
    chatContent.appendChild(messageDiv);
    chatContent.scrollTop = chatContent.scrollHeight;

    if (saveToHistory) {
        chatHistory.push({ sender, message });
        saveChatHistory();
    }
}

function saveChatHistory() {
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
}

function loadChatHistory() {
    const chatContent = document.getElementById('chat-content');
    chatContent.innerHTML = ''; // Clear existing content before loading history
    const savedChatHistory = localStorage.getItem('chat_history');
    if (savedChatHistory) {
        chatHistory = JSON.parse(savedChatHistory);
        chatHistory.forEach(({ sender, message }) => {
            appendMessage(sender, message, false); // Append without saving again
        });
    }
}

function closeChatAndDisplayProperties() {
    const chatBox = document.querySelector('.chat-box');
    const chatOverlay = document.querySelector('.chat-overlay');
    chatBox.classList.remove('open');
    setTimeout(() => {
        chatBox.style.display = 'none';
        chatOverlay.style.display = 'none';
        displayPropertyList();
    }, 300);
}

// Function to ask if user wants to add parameters to their search
function askToAddParameters() {
    appendMessage('system', currentNode.message);
    if (currentNode.options) {
        displayOptions(currentNode.options);
    }
}

// Make the chat box draggable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.querySelector('.chat-header');
    if (header) {
        header.onmousedown = dragMouseDown;
    } else {
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    makeDraggable(document.querySelector('.chat-box'));
    loadChatHistory();

    document.querySelectorAll('.explore-now-btn').forEach(button => {
        button.addEventListener('click', () => {
            toggleChat();
            startChatFlow();
        });
    });
});
