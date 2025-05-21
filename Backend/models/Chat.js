const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [messageSchema],
    lastMessage: {
        type: Date,
        default: Date.now
    }
});

// Ensure participants array always has exactly 2 users
chatSchema.pre('save', function(next) {
    if (this.participants.length !== 2) {
        next(new Error('Chat must have exactly 2 participants'));
    }
    next();
});

module.exports = mongoose.model('Chat', chatSchema);
