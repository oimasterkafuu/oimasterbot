const BOT_TOKEN = require('../config').token;
console.log('Loaded bot token:', BOT_TOKEN);

const chatHistory = new Map();

const sendTelegramRequest = async (method, body) => {
    console.log('Sending Telegram request:', method, body);
    const request = new Request(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const response = await fetch(request);
    return response;
};

const addHistory = (chatId, message, isModel = false) => {
    console.log('Adding history:', chatId, message, isModel);
    if (!chatHistory.has(chatId)) {
        chatHistory.set(chatId, []);
    }
    const role = isModel ? 'model' : 'user';
    chatHistory.get(chatId).push({
        role,
        parts: [
            {
                text: message
            }
        ]
    });
};
const clearHistory = (chatId) => {
    chatHistory.delete(chatId);
};
const getHistory = (chatId) => {
    const result = chatHistory.get(chatId);
    console.log('Getting history:', chatId, JSON.stringify(result));
    return result;
};

const sendTextMessage = async (chatId, markdown) => {
    addHistory(chatId, markdown, true);
    const body = {
        chat_id: chatId,
        text: markdown,
        parse_mode: 'MarkdownV2'
    };
    const response = await sendTelegramRequest('sendMessage', body);
    return response;
};

module.exports = { sendTelegramRequest, addHistory, clearHistory, getHistory, sendTextMessage };
