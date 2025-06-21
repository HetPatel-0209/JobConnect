const express = require('express');
const router = express.Router();
const { 
    sendMessage,
    getChats,
    getChatMessages,
    markMessagesAsRead,
    deleteChat,
    getOnlineUsers,
    searchUsers,
    getChatStats
} = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { messageValidation } = require('../middlewares/validation.middleware');

// All chat routes require authentication
router.use(authenticate);

// Get all chats for the current user
router.get('/chats', getChats);
router.get('/stats', getChatStats);
router.get('/users/online', getOnlineUsers);
router.get('/users/search', searchUsers);
router.get('/chats/:chatId/messages', getChatMessages);
router.post('/messages', messageValidation, sendMessage);
router.put('/chats/:chatId/read', markMessagesAsRead);
router.delete('/chats/:chatId', deleteChat);

module.exports = router;