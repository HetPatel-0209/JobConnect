import api from './api';

export const ChatService = {
    /**
     * Get all chats for the current user
     * @returns {Promise<Object>} User's chats
     */
    getChats: async () => {
        return await api.get('/chat/chats');
    },

    /**
     * Get messages for a specific chat
     * @param {string} chatId - Chat ID
     * @returns {Promise<Object>} Chat messages
     */
    getChatMessages: async (chatId) => {
        return await api.get(`/chat/chats/${chatId}`);
    },

    /**
     * Send a message to a recipient
     * @param {string} recipientId - Recipient ID
     * @param {string} content - Message content
     * @returns {Promise<Object>} Sent message
     */
    sendMessage: async (recipientId, content) => {
        return await api.post('/chat/messages', { recipientId, content });
    },
    
    /**
     * Mark a message as read
     * @param {string} messageId - Message ID
     * @returns {Promise<Object>} Updated message
     */
    markAsRead: async (messageId) => {
        return await api.put(`/chat/messages/${messageId}/read`);
    },
    
    /**
     * Get unread message count
     * @returns {Promise<Object>} Unread count
     */
    getUnreadCount: async () => {
        return await api.get('/chat/messages/unread/count');
    },
    
    /**
     * Initiate a new chat with a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Created chat
     */
    initiateChat: async (userId) => {
        return await api.post('/chat/chats', { userId });
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
     * Delete a chat
     * @param {string} chatId - Chat ID
     * @returns {Promise<Object>} Delete result
     */
    deleteChat: async (chatId) => {
        return await api.delete(`/chat/chats/${chatId}`);
    },
    
    /**
     * Get chat statistics
     * @returns {Promise<Object>} Chat stats
     */
    getChatStats: async () => {
        return await api.get('/chat/stats');
    },
    
    /**
     * Get online users
     * @returns {Promise<Object>} Online users
     */
    getOnlineUsers: async () => {
        return await api.get('/chat/users/online');
    },
    
    /**
     * Search users
     * @param {string} query - Search query
     * @returns {Promise<Object>} Search results
     */
    searchUsers: async (query) => {
        return await api.get('/chat/users/search', { query });
    }
};
