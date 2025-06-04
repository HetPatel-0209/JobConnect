const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Authentication
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'recruiter', 'jobseeker']
    },

    // Common Profile
    name: {
        type: String,
        required: true
    },
    phone: String,
    profilePic: String,
    location: String,

    isActive: { type: Boolean, default: true },
    profileCompleted: { type: Boolean, default: false },
    lastLogin: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);