const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
    gstin: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },    
    companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    logo: String,
    logoPublicId: String,
    banner: String,
    bannerPublicId: String,
    website: String,
    description: {
        about: String,
        vision: String,
        mission: String,
        benefits: [String]
    },
    contact: {
        email: { type: String, required: true },
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: { type: String, default: 'India' }
        }
    },
    socialMedia: {
        linkedin: String,
        twitter: String,
        instagram: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Organization', orgSchema);