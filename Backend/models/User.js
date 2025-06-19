const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Authentication
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true // Ensure emails are saved in lowercase for consistency
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'recruiter', 'jobseeker']
    },    // Common Profile
    name: {
        type: String,
        required: true
    },
    phone: String,
    profilePic: String,
    profilePicPublicId: String, // Cloudinary public ID for profile picture
    location: String,
      // Organization association for recruiters
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    
    isActive: { type: Boolean, default: true },
    profileCompleted: { type: Boolean, default: false },
    lastLogin: Date,
    lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

// Add error handling for duplicate key errors
userSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        const err = new Error('Email address already exists');
        err.statusCode = 400;
        err.isDuplicateError = true;
        next(err);
    } else {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);