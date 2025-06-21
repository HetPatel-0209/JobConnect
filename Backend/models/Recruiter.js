const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    // Reference to User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    
    // Organization association
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    
    // Professional Information
    title: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    yearsOfExperience: {
        type: Number,
        min: 0,
        max: 50
    },
    specializations: [{
        type: String,
        trim: true
    }],
    linkedinProfile: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(v);
            },
            message: 'Please enter a valid LinkedIn profile URL'
        }
    },
    skills: [{
        type: String,
        trim: true
    }],
    
    certifications: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        issuingOrganization: {
            type: String,
            trim: true
        },
        issueDate: Date,
        expirationDate: Date,
        credentialId: {
            type: String,
            trim: true
        },
        credentialUrl: {
            type: String,
            trim: true
        }
    }],
    
    education: [{
        institution: {
            type: String,
            required: true,
            trim: true
        },
        degree: {
            type: String,
            required: true,
            trim: true
        },
        fieldOfStudy: {
            type: String,
            trim: true
        },
        startYear: {
            type: Number,
            min: 1950,
            max: new Date().getFullYear()
        },
        endYear: {
            type: Number,
            min: 1950,
            max: new Date().getFullYear() + 10
        },
        grade: {
            type: String,
            trim: true
        }
    }],
    
    workExperience: [{
        company: {
            type: String,
            required: true,
            trim: true
        },
        position: {
            type: String,
            required: true,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: Date,
        isCurrent: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
            maxlength: 1000,
            trim: true
        },
        location: {
            type: String,
            trim: true
        }
    }],
    
    profileCompleted: {
        type: Boolean,
        default: false
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

recruiterSchema.index({ organizationId: 1 });
recruiterSchema.index({ 'specializations': 1 });
recruiterSchema.index({ 'skills': 1 });
recruiterSchema.index({ isActive: 1 });

recruiterSchema.virtual('professionalProfileCompleted').get(function() {
    const hasBasicInfo = this.title && this.bio && this.bio.trim().length > 0;
    const hasExperience = this.workExperience && this.workExperience.length > 0;
    const hasEducation = this.education && this.education.length > 0;
    const hasSpecializations = this.specializations && this.specializations.length > 0;
    
    return hasBasicInfo && hasExperience && hasEducation && hasSpecializations;
});

// Method to calculate total years of experience from work history
recruiterSchema.methods.calculateTotalExperience = function() {
    if (!this.workExperience || this.workExperience.length === 0) {
        return this.yearsOfExperience || 0;
    }
    
    let totalMonths = 0;
    this.workExperience.forEach(exp => {
        const startDate = new Date(exp.startDate);
        const endDate = exp.isCurrent ? new Date() : new Date(exp.endDate);
        
        if (endDate > startDate) {
            const diffTime = Math.abs(endDate - startDate);
            const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
            totalMonths += diffMonths;
        }
    });
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
};

// Method to get current position
recruiterSchema.methods.getCurrentPosition = function() {
    if (!this.workExperience || this.workExperience.length === 0) {
        return this.title || null;
    }
    
    const currentJob = this.workExperience.find(exp => exp.isCurrent);
    return currentJob ? `${currentJob.position} at ${currentJob.company}` : this.title;
};

// Pre-save middleware to update yearsOfExperience and profileCompleted
recruiterSchema.pre('save', function(next) {
    // Auto-calculate years of experience if work experience is provided
    if (this.workExperience && this.workExperience.length > 0) {
        this.yearsOfExperience = this.calculateTotalExperience();
    }
    
    // Update profile completion status
    this.profileCompleted = this.professionalProfileCompleted;
    
    // Update last activity
    this.lastActivity = new Date();
    
    next();
});

// Ensure virtual fields are serialized
recruiterSchema.set('toJSON', { virtuals: true });
recruiterSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Recruiter', recruiterSchema);
