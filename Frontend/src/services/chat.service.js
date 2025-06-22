import api from './api';
import cacheService, { CacheKeys, CacheInvalidation } from './cache.service';

export const ChatService = {
    /**
     * Get all chats for the current user
     * @returns {Promise<Object>} User's chats
     */
    getChats: async () => {
        // Get current user ID from localStorage for cache key
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        const cacheKey = CacheKeys.USER_CHATS(userId);

        // Use request deduplication
        return await cacheService.getOrFetch(cacheKey, async () => {
            return await api.get('/chat/chats');
        });
    },

    /**
     * Get messages for a specific chat
     * @param {string} chatId - Chat ID
     * @param {number} page - Page number for pagination
     * @param {number} limit - Number of messages per page
     * @returns {Promise<Object>} Chat messages
     */
    getChatMessages: async (chatId, page = 1, limit = 50) => {
        const cacheKey = CacheKeys.CHAT_MESSAGES(chatId, page);

        // Use request deduplication
        return await cacheService.getOrFetch(cacheKey, async () => {
            return await api.get(`/chat/chats/${chatId}/messages`, { page, limit });
        });
    },

    /**
     * Send a message to a recipient
     * @param {string} recipientId - Recipient ID
     * @param {string} content - Message content
     * @param {string} messageType - Type of message (text, file, etc.)
     * @returns {Promise<Object>} Sent message
     */
    sendMessage: async (recipientId, content, messageType = 'text') => {
        const result = await api.post('/chat/messages', { recipientId, content, messageType });

        // Invalidate chat cache since new message was sent
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        if (userId) {
            CacheInvalidation.invalidateChatCache(userId);
        }

        return result;
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
        const result = await api.post('/chat/messages', { recipientId, content });
        return result;
    }
};
