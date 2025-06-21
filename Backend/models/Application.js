const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['applied', 'reviewed', 'shortlisted', 'interview','rejected', 'hired'],
        default: 'applied'
    },
    atsScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    aiEvaluation: {
        score: { type: Number, min: 0, max: 100 },
        matchedSkills: [String],
        missingSkills: [String],
        suggestions: [String],
        evaluatedAt: { type: Date, default: Date.now }
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: Date
});

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1, appliedAt: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ atsScore: -1 });

module.exports = mongoose.model('Application', applicationSchema);