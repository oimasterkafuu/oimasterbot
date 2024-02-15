import { sendTextMessage } from './teleutil.js';
import { runChat } from './gemini.js';
import { addHistory, getHistory, clearHistory } from './history.js';

const prompt = require('../config').prompt;

const handleRequest = async (request) => {
    try {
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
            await addHistory(chatId, '[多媒体消息]');
            await sendTextMessage(chatId, '抱歉，我这里看不到你消息的内容');
            return new Response();
        }

        if (messageText == '/start') {
            await clearHistory(chatId);
            await addHistory(
                chatId,
                `${prompt}用户「${user.first_name} ${user.last_name}(@${user.username})」开始了和你的对话。`
            );
            await sendTextMessage(chatId, '你好，我是悦兰。');
            return new Response();
        }

        const fullHistory = await getHistory(chatId);

        // if (messageText == '/history') {
        //     var humanReadableHistory = '';
        //     for (let i = 1; i < fullHistory.length; i++) {
        //         const message = fullHistory[i];
        //         humanReadableHistory += `${message.role}: ${message.parts[0].text}\n`;
        //     }
        //     await sendTextMessage(chatId, humanReadableHistory, false);
        //     return new Response();
        // }

        const response = await runChat(messageText, fullHistory);
        await addHistory(chatId, messageText);
        await sendTextMessage(chatId, response);
    } catch (e) {
        console.error(e);
        await sendTextMessage(chatId, `抱歉，我遇到了一些问题：${e.toString()}`, false);
    }

    return new Response();
};

addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});
