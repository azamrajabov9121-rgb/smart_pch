
// AI Assistant Logic (added at the end of script.js content)
document.addEventListener('DOMContentLoaded', function () {
    const aiAssistantBtn = document.getElementById('aiAssistantBtn');
    const aiChatWindow = document.getElementById('aiChatWindow');
    const closeAiChat = document.getElementById('closeAiChat');
    const sendAiMsg = document.getElementById('sendAiMsg');
    const aiInput = document.getElementById('aiInput');
    const aiMessages = document.getElementById('aiMessages');

    if (!aiAssistantBtn || !aiChatWindow) return; // Guard clause

    // Toggle Chat Window
    aiAssistantBtn.addEventListener('click', function () {
        aiChatWindow.classList.toggle('active');
        if (aiChatWindow.classList.contains('active')) {
            aiInput.focus();
        }
    });

    // Close Chat Window
    closeAiChat.addEventListener('click', function () {
        aiChatWindow.classList.remove('active');
    });

    // Send Message on Enter
    aiInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Send Message on Click
    sendAiMsg.addEventListener('click', sendMessage);

    async function sendMessage() {
        const text = aiInput.value.trim();
        if (text === '') return;

        // Add User Message
        addMessage(text, 'user');
        aiInput.value = '';

        // Typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.innerHTML = '<div class="message-content">...</div>';
        aiMessages.appendChild(typingDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        try {
            const data = await SmartUtils.fetchAPI('/ai/chat', {
                method: 'POST',
                body: JSON.stringify({ message: text })
            });

            typingDiv.remove();
            if (data && data.response) {
                addMessage(data.response, 'bot');
            } else {
                addMessage("Javob olishda xatolik yuz berdi.", 'bot');
            }
        } catch (e) {
            typingDiv.remove();
            addMessage("Server bilan aloqa uzildi.", 'bot');
        }
    }

    function addMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        timeDiv.textContent = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

        msgDiv.appendChild(contentDiv);
        msgDiv.appendChild(timeDiv);
        aiMessages.appendChild(msgDiv);

        // Auto scroll to bottom
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }
});
