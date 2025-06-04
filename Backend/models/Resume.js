const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: {
        type: String,
        enum: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        required: true
    },
    parsedText: String,
    uploadedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

resumeSchema.index({ user: 1, isActive: 1 }, { unique: true }); // Ensure only one active resume per user
resumeSchema.index({ user: 1, uploadedAt: -1 }); // For sorting resumes by upload date

module.exports = mongoose.model('Resume', resumeSchema);