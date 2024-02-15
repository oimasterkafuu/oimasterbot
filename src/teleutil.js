import { addHistory } from './history.js';

const BOT_TOKEN = require('../config').token;
console.log('Loaded bot token:', BOT_TOKEN);

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
    const result = await response.json();
    return result;
};

const sendTextMessage = async (chatId, markdown, record = true) => {
    if (record) await addHistory(chatId, markdown, true);
    const body = {
        chat_id: chatId,
        text: markdown
    };
    const response = await sendTelegramRequest('sendMessage', body);
    return response;
};

module.exports = { sendTelegramRequest, sendTextMessage };
