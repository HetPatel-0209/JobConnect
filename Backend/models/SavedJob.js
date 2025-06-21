const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost',
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can't save the same job twice
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

// Index for efficient queries
savedJobSchema.index({ user: 1, savedAt: -1 });

module.exports = mongoose.model('SavedJob', savedJobSchema);
