const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        joinedAt: { type: Date, default: Date.now },
        lastSeen: { type: Date, default: Date.now }
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    messageType: {
        type: String,
        enum: ['text', 'file', 'interview_invite', 'status_update'],
        default: 'text'
    },
    status: {
        sent: { type: Boolean, default: true },
        sentAt: { type: Date, default: Date.now },
        delivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
        seen: { type: Boolean, default: false },
        seenAt: { type: Date }
    },
    deliveredTo: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        deliveredAt: { type: Date, default: Date.now }
    }],
    readBy: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
    }],
    timestamp: { type: Date, default: Date.now }
});

chatSchema.pre('save', function (next) {
    if (this.participants.length !== 2) {
        next(new Error('Chat must have exactly 2 participants'));
    }
    next();
});

chatSchema.index({ 'participants.user': 1, isActive: 1 });
chatSchema.index({ application: 1 });
messageSchema.index({ chat: 1, timestamp: -1 });

const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);
module.exports = { Chat, Message };