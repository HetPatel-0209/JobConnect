const path = require('path');

module.exports = {
    // Upload paths
    UPLOAD_PATHS: {
        RESUMES: path.join(__dirname, '../uploads/resumes'),
        PROFILE_PICS: path.join(__dirname, '../uploads/profiles'),
        ORGANIZATION_FILES: path.join(__dirname, '../uploads/organizations')
    },

    // File size limits
    FILE_LIMITS: {
        RESUME: 5 * 1024 * 1024, // 5MB
        IMAGE: 2 * 1024 * 1024   // 2MB
    },    // Allowed file types
    ALLOWED_FILE_TYPES: {
        RESUME: [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        IMAGE: ['image/jpeg', 'image/png', 'image/gif']
    },

    // ATS Score weights
    ATS_WEIGHTS: {
        SKILLS_MATCH: 40,
        EXPERIENCE: 30,
        EDUCATION: 30
    },

    // Pagination defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },

    // Chat settings
    CHAT: {
        MAX_MESSAGE_LENGTH: 1000,
        MESSAGE_HISTORY_LIMIT: 50
    },

    // Job post settings
    JOB_POST: {
        MIN_TITLE_LENGTH: 5,
        MAX_TITLE_LENGTH: 100,
        MIN_DESCRIPTION_LENGTH: 50,
        MAX_DESCRIPTION_LENGTH: 5000
    }
};
