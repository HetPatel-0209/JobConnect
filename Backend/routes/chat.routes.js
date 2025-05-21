const express = require('express');
const router = express.Router();
const { 
    sendMessage,
    getChats,
    getChatMessages,
    markMessagesAsRead,
    deleteChat
} = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { messageValidation } = require('../middlewares/validation.middleware');

// All chat routes require authentication
router.use(authenticate);

// Get all chats for the current user
router.get('/chats', getChats);

// Get messages for a specific chat
router.get('/chats/:chatId', getChatMessages);

// Send a message
router.post('/messages', messageValidation, sendMessage);

// Mark messages as read
router.put('/chats/:chatId/read', markMessagesAsRead);

// Delete chat
router.delete('/chats/:chatId', deleteChat);

module.exports = router;
