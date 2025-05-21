const Chat = require('../models/Chat');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user._id;

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // Find or create chat between users
        let chat = await Chat.findOne({
            participants: { $all: [senderId, recipientId] }
        }).populate('participants', 'name role');

        if (!chat) {
            chat = new Chat({
                participants: [senderId, recipientId],
                messages: []
            });
        }

        // Add new message
        chat.messages.push({
            sender: senderId,
            content
        });
        chat.lastMessage = Date.now();
        await chat.save();

        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({ participants: userId })
            .populate('participants', 'name role')
            .populate('messages.sender', 'name')
            .sort({ lastMessage: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        })
        .populate('messages.sender', 'name')
        .populate('participants', 'name role');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Mark all messages as read
        await Chat.updateMany(
            { 
                _id: chatId,
                'messages.sender': { $ne: userId },
                'messages.read': false
            },
            { $set: { 'messages.$[elem].read': true } },
            { arrayFilters: [{ 'elem.read': false }] }
        );

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Mark all unread messages from other participants as read
        await Chat.updateOne(
            { _id: chatId },
            {
                $set: {
                    'messages.$[msg].read': true
                }
            },
            {
                arrayFilters: [
                    { 
                        'msg.sender': { $ne: userId },
                        'msg.read': false
                    }
                ]
            }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete chat
exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Remove chat reference from both participants
        await User.updateMany(
            { _id: { $in: chat.participants } },
            { $pull: { chats: chatId } }
        );

        await chat.remove();
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
