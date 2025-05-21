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
    phone: {
        type: String
    },
    profilePic: String,
    location: {
        type: String,
        required: function() {
            return this.role === 'jobseeker';
        }
    },

    // Jobseeker Profile
    jobPreferences: [{
        title: String,
        type: String, // full-time, part-time, etc.
        locationType: String // remote, on-site, hybrid
    }],
    skills: [{
        type: String,
        required: function() {
            return this.role === 'jobseeker';
        }
    }],
    experience: [{
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String
    }],
    education: [{
        degree: String,
        institution: String,
        startYear: Number,
        endYear: Number,
        score: String
    }],
    resume: {
        url: String,  // URL to stored resume
        parsedData: Object // Extracted CV data
    },
    appliedJobs: [{
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'JobPost'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'viewed', 'shortlisted', 'rejected'],
            default: 'pending'
        }
    }],

    // Recruiter Profile
    company: {
        name: {
            type: String,
            required: function() {
                return this.role === 'recruiter';
            }
        },
        position: String,
        description: String
    },
    postedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost'
    }],
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },

    // Chat related
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);