const leancloudConfig = require('../config').leancloud;
const AV_API = `${leancloudConfig.serverURL}/1.1/classes/ChatHistory`;

const queryId = async (chatId) => {
    const url = `${AV_API}?where={"chatId":${chatId}}`;
    const options = {
        method: 'GET',
        headers: {
            'X-LC-Id': leancloudConfig.appId,
            'X-LC-Key': leancloudConfig.appKey,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log('Getting id:', chatId, result);
        return result.results[0].objectId;
    } catch (error) {
        console.error('Error getting id:', error);
        return null;
    }
};

const newChat = async (chatId) => {
    const url = `${AV_API}`;
    const data = {
        chatId: chatId,
        history: []
    };
    const options = {
        method: 'POST',
        headers: {
            'X-LC-Id': leancloudConfig.appId,
            'X-LC-Key': leancloudConfig.appKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log('Creating chat:', chatId, result);
        return result.objectId;
    } catch (error) {
        console.error('Error creating chat:', error);
        return null;
    }
};

const addHistory = async (chatId, message, isModel = false) => {
    const role = isModel ? 'model' : 'user';
    let objectId = await queryId(chatId);
    if (!objectId) {
        objectId = await newChat(chatId);
    }
    const url = `${AV_API}/${objectId}`;
    const data = {
        history: {
            __op: 'Add',
            objects: [
                {
                    role,
                    parts: [
                        {
                            text: message
                        }
                    ]
                }
            ]
        }
    };

    const options = {
        method: 'PUT',
        headers: {
            'X-LC-Id': leancloudConfig.appId,
            'X-LC-Key': leancloudConfig.appKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    try {
        const response = await fetch(url, options);
        console.log('Adding history:', chatId, message);
    } catch (error) {
        console.error('Error adding history:', error);
    }
};

const clearHistory = async (chatId) => {
    const objectId = await queryId(chatId);
    if (!objectId) {
        return;
    }
    const url = `${AV_API}/${objectId}`;
    const options = {
        method: 'DELETE',
        headers: {
            'X-LC-Id': leancloudConfig.appId,
            'X-LC-Key': leancloudConfig.appKey,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        console.log('Clearing history:', chatId);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
};

const getHistory = async (chatId) => {
    const objectId = await queryId(chatId);
    if (!objectId) {
        return [];
    }
    const url = `${AV_API}/${objectId}`;
    const options = {
        method: 'GET',
        headers: {
            'X-LC-Id': leancloudConfig.appId,
            'X-LC-Key': leancloudConfig.appKey,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log('Getting history:', chatId, result);
        return result.history;
    } catch (error) {
        console.error('Error getting history:', error);
        return [];
    }
};

module.exports = {
    addHistory,
    clearHistory,
    getHistory
};
