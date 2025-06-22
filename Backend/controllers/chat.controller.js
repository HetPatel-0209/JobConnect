const { Chat, Message } = require('../models/Chat');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
    try {
        console.log('POST /chat/messages - User:', req.user, 'Body:', req.body);
        const { recipientId, content, messageType = 'text' } = req.body;
        const senderId = req.user._id;

        // if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // find or create chat
        let chat = await Chat.findOne({
            'participants.user': { $all: [senderId, recipientId] },
            isActive: true
        }).populate('participants.user', 'name role email');

        if (!chat) {
            chat = new Chat({
                participants: [
                    { user: senderId },
                    { user: recipientId }
                ]
            });
            await chat.save();
        }

        // new message
        const message = new Message({
            chat: chat._id,
            sender: senderId,
            content,
            messageType,
            readBy: [{ user: senderId }]
        });

        await message.save();

        // update chat with last message
        chat.lastMessage = message._id;
        await chat.save();
        // message for response
        await message.populate('sender', 'name role email');
        await message.populate('chat');

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChats = async (req, res) => {
    try {
        console.log('GET /chat/chats - User:', req.user);
        const userId = req.user._id;

        const chats = await Chat.find({
            'participants.user': userId,
            isActive: true
        })
            .populate('participants.user', 'name role email')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        // unread message count for each chat
        const chatsWithUnreadCount = await Promise.all(
            chats.map(async (chat) => {
                const unreadCount = await Message.countDocuments({
                    chat: chat._id,
                    sender: { $ne: userId },
                    'readBy.user': { $ne: userId }
                });

                return {
                    ...chat.toObject(),
                    unreadCount
                };
            })
        );

        res.json({
            success: true,
            data: chatsWithUnreadCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // if user is participant in the chat
        const chat = await Chat.findOne({
            _id: chatId,
            'participants.user': userId,
            isActive: true
        }).populate('participants.user', 'name role email');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // messages for this chat with pagination
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'name role email')
            .populate('readBy.user', 'name')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        // messages as read for current user
        await Message.updateMany(
            {
                chat: chatId,
                sender: { $ne: userId },
                'readBy.user': { $ne: userId }
            },
            {
                $push: {
                    readBy: {
                        user: userId,
                        readAt: new Date()
                    }
                }
            }
        );

        res.json({
            success: true,
            data: {
                chat,
                messages: messages.reverse(), // Reverse to show oldest first
                pagination: {
                    page,
                    limit,
                    hasMore: messages.length === limit
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// messages as read
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        // if user is participant in the chat
        const chat = await Chat.findOne({
            _id: chatId,
            'participants.user': userId,
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        // all unread messages from other participants as read
        const result = await Message.updateMany(
            {
                chat: chatId,
                sender: { $ne: userId },
                'readBy.user': { $ne: userId }
            },
            {
                $push: {
                    readBy: {
                        user: userId,
                        readAt: new Date()
                    }
                }
            });

        res.json({
            success: true,
            message: 'Messages marked as read',
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findOne({
            _id: chatId,
            'participants.user': userId,
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        chat.isActive = false;
        await chat.save();

        res.json({
            success: true,
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get online users (for chat)
exports.getOnlineUsers = async (req, res) => {
    try {
        // This would typically work with Socket.IO to track online users
        // For now, just return recent users
        const recentUsers = await User.find({
            lastSeen: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
        }).select('name role email lastSeen');

        res.json({
            success: true,
            data: recentUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search users to start new chat
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const users = await User.find({
            _id: { $ne: userId },
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('name email role').limit(10);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get chat statistics
exports.getChatStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalChats = await Chat.countDocuments({
            'participants.user': userId,
            isActive: true
        });

        const totalUnreadMessages = await Message.countDocuments({
            'chat': {
                $in: await Chat.find({
                    'participants.user': userId,
                    isActive: true
                }).distinct('_id')
            },
            sender: { $ne: userId },
            'readBy.user': { $ne: userId }
        });

        res.json({
            success: true,
            data: {
                totalChats,
                totalUnreadMessages
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};