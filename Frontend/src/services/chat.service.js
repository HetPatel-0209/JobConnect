import api from './api';

export const ChatService = {
    /**
     * Get all chats for the current user
     * @returns {Promise<Object>} User's chats
     */
    getChats: async () => {
        console.log('ChatService: Getting chats...');
        const result = await api.get('/chat/chats');
        console.log('ChatService: Chats result:', result);
        return result;
    },

    /**
     * Get messages for a specific chat
     * @param {string} chatId - Chat ID
     * @param {number} page - Page number for pagination
     * @param {number} limit - Number of messages per page
     * @returns {Promise<Object>} Chat messages
     */
    getChatMessages: async (chatId, page = 1, limit = 50) => {
        return await api.get(`/chat/chats/${chatId}/messages`, { page, limit });
    },

    /**
     * Send a message to a recipient
     * @param {string} recipientId - Recipient ID
     * @param {string} content - Message content
     * @param {string} messageType - Type of message (text, file, etc.)
     * @returns {Promise<Object>} Sent message
     */
    sendMessage: async (recipientId, content, messageType = 'text') => {
        return await api.post('/chat/messages', { recipientId, content, messageType });
    },

    /**
     * Mark all messages in a chat as read
     * @param {string} chatId - Chat ID
     * @returns {Promise<Object>} Update result
     */
    markChatAsRead: async (chatId) => {
        return await api.put(`/chat/chats/${chatId}/read`);
    },

    /**
     * Get chat statistics
     * @returns {Promise<Object>} Chat stats
     */
    getChatStats: async () => {
        return await api.get('/chat/stats');
    },

    /**
     * Delete a chat
     * @param {string} chatId - Chat ID
     * @returns {Promise<Object>} Delete result
     */
    deleteChat: async (chatId) => {
        return await api.delete(`/chat/chats/${chatId}`);
    },

    /**
     * Get online users
     * @returns {Promise<Object>} Online users
     */
    getOnlineUsers: async () => {
        return await api.get('/chat/users/online');
    },

    /**
     * Search users to start new chat
     * @param {string} query - Search query
     * @returns {Promise<Object>} Search results
     */
    searchUsers: async (query) => {
        return await api.get(`/chat/users/search?query=${encodeURIComponent(query)}`);
    },

    /**
     * Initiate a new chat by sending first message
     * @param {string} recipientId - Recipient ID
     * @param {string} content - Initial message content
     * @returns {Promise<Object>} Created message and chat
     */
    initiateChat: async (recipientId, content = 'Hello!') => {
        console.log('ChatService: Initiating chat with:', { recipientId, content });
        const result = await api.post('/chat/messages', { recipientId, content });
        console.log('ChatService: Chat initiation result:', result);
        return result;
    }
};
