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
    atsCriteria: Number,
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