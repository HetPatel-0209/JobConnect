const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
    GSTIN: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    logo: String,
    banner: String,
    description: {
        about: String,
        vision: String,
        mission: String
    },
    contact: {
        email: String,
        phone: String,
        address: String
    },
    jobRoles: [{
        title: String,
        department: String,
        description: String
    }],
    recruiters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Organization', orgSchema);