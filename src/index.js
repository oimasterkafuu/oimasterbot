import { addHistory, getHistory, clearHistory, sendTextMessage } from './teleutil.js';
import { runChat } from './gemini.js';

const prompt = require('../config').prompt;

const handleRequest = async (request) => {
    const content = await request.json();
    if (!content) {
        return new Response('Content is empty', {
            status: 400
        });
    }
    const user = content.message.from;
    if (!user) {
        return new Response('User is empty', {
            status: 400
        });
    }
    const chatId = content.message.chat.id;
    if (!chatId) {
        return new Response('Chat ID is empty', {
            status: 400
        });
    }

    const messageText = content.message.text;
    if (!messageText) {
        addHistory(chatId, '[多媒体消息]');
        await sendTextMessage(chatId, '抱歉，我这里看不到你消息的内容');
        return new Response();
    }

    if (messageText == '/start') {
        clearHistory(chatId);
        addHistory(
            chatId,
            `${prompt}用户「${user.first_name} ${user.last_name}(@${user.username})」开始了和你的对话。`
        );
        await sendTextMessage(chatId, '你好，我是悦兰。');
        return new Response();
    }

    const fullHistory = getHistory(chatId);

    try {
        const response = await runChat(messageText, fullHistory);
        addHistory(chatId, messageText);
        await sendTextMessage(chatId, response);
    } catch (e) {
        console.error(e);
        await sendTextMessage(
            chatId,
            `抱歉，我遇到了一些问题。
\`\`\`
${e.toString()}
\`\`\``
        );
    }

    return new Response();
};

addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});
