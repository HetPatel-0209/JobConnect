require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cloudinary = require('cloudinary');
const connectDB = require('./config/database');
const { errorMiddleware } = require('./middlewares/error.middleware');

mongoose.set('strictQuery', true);

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Connect to Database
connectDB();

// Import and use centralized routes
const routes = require('./routes/Route');
app.use(routes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: `Can't find ${req.originalUrl} on this server!` });
});

// Global error handler
app.use(errorMiddleware);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
    cors: corsOptions
});

// Socket.IO event handlers
const { Chat, Message } = require('./models/Chat');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authenticate socket connection
    socket.on('authenticate', async (token) => {        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (user) {
                socket.userId = user._id.toString();
                socket.join(`user_${user._id}`);
                console.log(`User ${user.name} authenticated with socket ${socket.id}`);
                
                // Update user's last seen
                await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });
                
                socket.emit('authenticated', { success: true, user: { id: user._id, name: user.name } });
            } else {
                socket.emit('auth_error', { message: 'User not found' });
            }
        } catch (error) {
            socket.emit('auth_error', { message: 'Invalid token' });
        }
    });

    // Join a chat room
    socket.on('join_chat', async (chatId) => {
        try {
            if (!socket.userId) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            // Verify user is participant in this chat
            const chat = await Chat.findOne({
                _id: chatId,
                'participants.user': socket.userId,
                isActive: true
            });

            if (chat) {
                socket.join(chatId);
                console.log(`User ${socket.userId} joined chat ${chatId}`);
                socket.emit('joined_chat', { chatId });
            } else {
                socket.emit('error', { message: 'Chat not found or access denied' });
            }
        } catch (error) {
            console.error('Error joining chat:', error);
            socket.emit('error', { message: 'Failed to join chat' });
        }
    });

    // Handle new message
    socket.on('send_message', async (data) => {
        try {
            if (!socket.userId) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            const { chatId, content, messageType = 'text' } = data;

            // Verify user is participant in this chat
            const chat = await Chat.findOne({
                _id: chatId,
                'participants.user': socket.userId,
                isActive: true
            });

            if (!chat) {
                socket.emit('error', { message: 'Chat not found or access denied' });
                return;
            }

            // Create and save message
            const message = new Message({
                chat: chatId,
                sender: socket.userId,
                content,
                messageType,
                readBy: [{ user: socket.userId }]
            });

            await message.save();
            await message.populate('sender', 'name role email');

            // Update chat with last message
            chat.lastMessage = message._id;
            await chat.save();

            // Emit to all users in the chat
            io.to(chatId).emit('receive_message', {
                _id: message._id,
                chat: chatId,
                sender: message.sender,
                content: message.content,
                messageType: message.messageType,
                timestamp: message.timestamp,
                readBy: message.readBy
            });

            // Emit to specific users (for notifications)
            chat.participants.forEach(participant => {
                if (participant.user.toString() !== socket.userId) {
                    io.to(`user_${participant.user}`).emit('new_message_notification', {
                        chatId,
                        message: {
                            _id: message._id,
                            content: message.content,
                            sender: message.sender
                        }
                    });
                }
            });

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Handle typing status
    socket.on('typing', (data) => {
        if (!socket.userId) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
        }

        const { chatId, isTyping } = data;
        socket.to(chatId).emit('typing_status', { userId: socket.userId, isTyping });
    });

    // Handle message read status
    socket.on('mark_read', async (data) => {
        try {
            if (!socket.userId) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            const { chatId, messageIds } = data;

            // Update read status for specific messages or all unread messages in chat
            if (messageIds && Array.isArray(messageIds)) {
                await Message.updateMany(
                    { 
                        _id: { $in: messageIds },
                        chat: chatId,
                        'readBy.user': { $ne: socket.userId }
                    },
                    { 
                        $push: { 
                            readBy: { 
                                user: socket.userId, 
                                readAt: new Date() 
                            } 
                        } 
                    }
                );
            } else {
                await Message.updateMany(
                    { 
                        chat: chatId,
                        sender: { $ne: socket.userId },
                        'readBy.user': { $ne: socket.userId }
                    },
                    { 
                        $push: { 
                            readBy: { 
                                user: socket.userId, 
                                readAt: new Date() 
                            } 
                        } 
                    }
                );
            }

            // Notify other participants
            socket.to(chatId).emit('messages_read', { 
                userId: socket.userId, 
                chatId, 
                messageIds 
            });

        } catch (error) {
            console.error('Error marking messages as read:', error);
            socket.emit('error', { message: 'Failed to mark messages as read' });
        }
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
        socket.leave(chatId);
        console.log(`User ${socket.userId} left chat ${chatId}`);
    });    // Handle disconnection
    socket.on('disconnect', async () => {
        if (socket.userId) {
            // Update user's last seen
            await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() });
        }
        console.log('User disconnected:', socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});