import api from './api';

export const ChatService = {
    getChats: async () => {
        const response = await api.get('/chat/chats');
        return response.data;
    },

    getChatMessages: async (chatId) => {
        const response = await api.get(`/chat/chats/${chatId}`);
        return response.data;
    },

    sendMessage: async (recipientId, content) => {
        const response = await api.post('/chat/messages', { recipientId, content });
        return response.data;
    }
};
