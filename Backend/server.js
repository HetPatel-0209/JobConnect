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
        : ['https://jobconnect-xi-snowy.vercel.app/', 'http://localhost:3000'],
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

// Track online users with better structure
const onlineUsers = new Map(); // userId -> { socketId, lastSeen, userInfo, connectedAt }

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authenticate socket connection
    socket.on('authenticate', async (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId); if (user) {
                socket.userId = user._id.toString();
                socket.join(`user_${user._id}`);
                console.log(`User ${user.name} authenticated with socket ${socket.id}`);

                // Update user's last seen and add to online users
                await User.findByIdAndUpdate(user._id, {
                    lastSeen: new Date(),
                    isOnline: true
                });

                onlineUsers.set(user._id.toString(), {
                    socketId: socket.id,
                    lastSeen: new Date(),
                    connectedAt: new Date(),
                    userInfo: { id: user._id, name: user.name, role: user.role }
                });

                // Broadcast user online status to all users
                socket.broadcast.emit('user_online', {
                    userId: user._id.toString(),
                    name: user.name,
                    lastSeen: new Date()
                });

                // Send current online users to the newly connected user
                const onlineUsersList = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
                    userId,
                    lastSeen: data.lastSeen,
                    userInfo: data.userInfo
                }));

                socket.emit('authenticated', {
                    success: true,
                    user: { id: user._id, name: user.name },
                    onlineUsers: onlineUsersList
                });
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
            }            // Create and save message
            const message = new Message({
                chat: chatId,
                sender: socket.userId,
                content,
                messageType,
                readBy: [{ user: socket.userId }],
                status: {
                    sent: true,
                    sentAt: new Date(),
                    delivered: false,
                    seen: false
                }
            });

            await message.save();
            await message.populate('sender', 'name role email');

            // Update chat with last message and timestamp
            chat.lastMessage = message._id;
            chat.updatedAt = new Date();
            await chat.save();

            // Send confirmation back to sender first
            socket.emit('message_sent', {
                _id: message._id,
                tempId: data.tempId, // If provided for optimistic updates
                chat: chatId,
                sender: message.sender,
                content: message.content,
                messageType: message.messageType,
                timestamp: message.timestamp,
                status: {
                    sent: true,
                    delivered: false,
                    read: false
                }
            });

            // Emit to all users in the chat room
            io.to(chatId).emit('receive_message', {
                _id: message._id,
                chat: chatId,
                sender: message.sender,
                content: message.content,
                messageType: message.messageType,
                timestamp: message.timestamp,
                readBy: message.readBy,
                status: {
                    sent: true,
                    delivered: false,
                    read: false
                }
            });

            // Handle delivery status and notifications for each participant
            for (const participant of chat.participants) {
                const participantId = participant.user.toString();
                if (participantId !== socket.userId) {
                    // Send to user-specific room for notifications
                    io.to(`user_${participantId}`).emit('receive_message', {
                        _id: message._id,
                        chat: chatId,
                        content: message.content,
                        messageType: message.messageType,
                        sender: message.sender,
                        timestamp: message.timestamp,
                        readBy: message.readBy
                    });

                    // Calculate accurate unread count for this specific user
                    const unreadCount = await Message.countDocuments({
                        chat: chatId,
                        sender: { $ne: participantId },
                        'readBy.user': { $ne: participantId }
                    });

                    // Send notification with accurate unread count
                    io.to(`user_${participantId}`).emit('new_message_notification', {
                        chatId,
                        message: {
                            _id: message._id,
                            content: message.content,
                            sender: message.sender,
                            chat: chatId,
                            timestamp: message.timestamp
                        },
                        unreadCount: unreadCount,
                        totalUnreadCount: await Message.countDocuments({
                            chat: { $in: await Chat.find({ 'participants.user': participantId, isActive: true }).distinct('_id') },
                            sender: { $ne: participantId },
                            'readBy.user': { $ne: participantId }
                        })
                    });

                    // Mark as delivered if user is online
                    if (onlineUsers.has(participantId)) {
                        // Update message delivery status
                        await Message.findByIdAndUpdate(message._id, {
                            $push: {
                                deliveredTo: {
                                    user: participantId,
                                    deliveredAt: new Date()
                                }
                            },
                            'status.delivered': true,
                            'status.deliveredAt': new Date()
                        });

                        // Notify sender about delivery
                        setTimeout(() => {
                            io.to(chatId).emit('message_delivered', {
                                messageId: message._id,
                                chatId,
                                deliveredTo: participantId,
                                deliveredAt: new Date()
                            });
                        }, 100);
                    }
                }
            }

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
    });    // Handle message read status
    socket.on('mark_read', async (data) => {
        try {
            if (!socket.userId) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            const { chatId, messageIds } = data;

            // Update read status for specific messages or all unread messages in chat
            let updatedMessages;
            if (messageIds && Array.isArray(messageIds)) {
                updatedMessages = await Message.updateMany(
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
                        },
                        'status.seen': true,
                        'status.seenAt': new Date()
                    }
                );
            } else {
                updatedMessages = await Message.updateMany(
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
                        },
                        'status.seen': true,
                        'status.seenAt': new Date()
                    }
                );
            }

            // Get the messages that were marked as read
            const readMessages = await Message.find({
                chat: chatId,
                sender: { $ne: socket.userId },
                'readBy.user': socket.userId
            }).select('_id sender');

            // Notify other participants about read status
            socket.to(chatId).emit('messages_read', {
                userId: socket.userId,
                chatId,
                messageIds: readMessages.map(m => m._id),
                readAt: new Date()
            });

            // Send individual read confirmations for each message
            readMessages.forEach(message => {
                socket.to(chatId).emit('message_read', {
                    messageId: message._id,
                    chatId,
                    readBy: socket.userId,
                    readAt: new Date()
                });
            });

            // Send updated unread count to the user who marked messages as read
            const totalUnreadCount = await Message.countDocuments({
                chat: { $in: await Chat.find({ 'participants.user': socket.userId, isActive: true }).distinct('_id') },
                sender: { $ne: socket.userId },
                'readBy.user': { $ne: socket.userId }
            });

            socket.emit('unread_count_updated', {
                totalUnreadCount,
                chatId,
                readMessageCount: updatedMessages.modifiedCount
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
    });

    // Handle user online status
    socket.on('user_online', (data) => {
        if (socket.userId) {
            onlineUsers.set(socket.userId, {
                socketId: socket.id,
                lastSeen: new Date(),
                userInfo: data.userInfo || {}
            });

            // Broadcast to all users
            socket.broadcast.emit('user_online', {
                userId: socket.userId,
                lastSeen: new Date()
            });
        }
    });

    // Handle user offline status
    socket.on('user_offline', (data) => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);

            // Broadcast to all users
            socket.broadcast.emit('user_offline', {
                userId: socket.userId,
                lastSeen: new Date()
            });
        }
    });

    // Get online users
    socket.on('get_online_users', () => {
        const onlineUsersList = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
            userId,
            lastSeen: data.lastSeen,
            userInfo: data.userInfo
        }));

        socket.emit('online_users_list', onlineUsersList);
    });

    // Handle message delivery confirmation
    socket.on('message_delivered', (data) => {
        const { messageId, chatId } = data;

        // Broadcast delivery confirmation to chat participants
        socket.to(chatId).emit('message_delivered', {
            messageId,
            chatId,
            deliveredBy: socket.userId,
            deliveredAt: new Date()
        });
    });    // Handle disconnection
    socket.on('disconnect', async () => {
        if (socket.userId) {
            // Update user's last seen and online status
            await User.findByIdAndUpdate(socket.userId, {
                lastSeen: new Date(),
                isOnline: false
            });

            // Remove from online users and broadcast offline status
            onlineUsers.delete(socket.userId);
            socket.broadcast.emit('user_offline', {
                userId: socket.userId,
                lastSeen: new Date()
            });
        }
        console.log('User disconnected:', socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT);