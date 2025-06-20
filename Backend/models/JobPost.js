const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        experience: { min: Number, max: Number }, // years
        education: [String],
        skills: {
            required: [String],
            preferred: [String]
        }
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship'],
        required: true
    },
    workMode: {
        type: String,
        enum: ['remote', 'on-site', 'hybrid'],
        required: true
    },
    salary: {
        min: Number,
        max: Number
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    atsCriteria: {
        minimumScore: { type: Number, default: 60 }, // Minimum ATS score required (0-100)
        keywordWeights: {
            skills: { type: Number, default: 40 }, // Weight for skills matching (%)
            experience: { type: Number, default: 30 }, // Weight for experience matching (%)
            education: { type: Number, default: 20 }, // Weight for education matching (%)
            keywords: { type: Number, default: 10 } // Weight for other keywords (%)
        },
        requiredKeywords: [String], // Must-have keywords in resume
        preferredKeywords: [String], // Nice-to-have keywords
        experienceWeight: { type: Number, default: 1 }, // Multiplier for experience matching
        educationRequired: { type: Boolean, default: false } // Whether education is mandatory
    },
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
jobPostSchema.index({ status: 1, createdAt: -1 });
jobPostSchema.index({ 'requirements.skills.required': 1 });
jobPostSchema.index({ location: 1, jobType: 1, workMode: 1 });
jobPostSchema.index({ organization: 1, status: 1 });
module.exports = mongoose.model('JobPost', jobPostSchema);