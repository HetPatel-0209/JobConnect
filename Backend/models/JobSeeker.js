const mongoose = require('mongoose');

const jobseekerProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, maxlength: 500 },
    skills: [{
        name: { type: String, required: true },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: 'intermediate'
        }
    }],
    experience: [{
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String
    }],
    education: [{
        degree: String,
        institution: String,
        startYear: Number,
        endYear: Number,
        score: String
    }],
    jobPreferences: {
        titles: [String],
        jobTypes: [{
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'internship']
        }],
        workModes: [{
            type: String,
            enum: ['remote', 'on-site', 'hybrid']
        }], 
        locations: [String],
        salaryRange: { min: Number, max: Number }
    },

    activeResume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
    },
});

module.exports = mongoose.model('JobSeekerProfile', jobseekerProfileSchema);