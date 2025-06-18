const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    };
};

// Auth validations
exports.registerValidation = validate([
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(), // Normalize email to prevent duplicates with different casing
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role')
        .isIn(['jobseeker', 'recruiter'])
        .withMessage('Invalid role specified')
]);

exports.loginValidation = validate([
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
]);

// Job Post validations
exports.jobPostValidation = validate([
    body('title').notEmpty().withMessage('Job title is required'),
    body('description').notEmpty().withMessage('Job description is required'),
    body('requirements.experience.min').isNumeric().withMessage('Minimum experience must be a number'),
    body('requirements.experience.max').isNumeric().withMessage('Maximum experience must be a number'),
    body('requirements.education').isArray().withMessage('Education must be an array'),
    body('requirements.skills.required').isArray().withMessage('Required skills must be an array'),
    body('requirements.skills.preferred').optional().isArray().withMessage('Preferred skills must be an array'),
    body('location').notEmpty().withMessage('Job location is required'),
    body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship']).withMessage('Invalid job type'),
    body('workMode').isIn(['remote', 'on-site', 'hybrid']).withMessage('Invalid work mode'),
    body('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
    body('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
    body('organization').notEmpty().withMessage('Organization ID is required')
]);

// Profile validations
exports.jobseekerProfileValidation = validate([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('experience').optional().isArray().withMessage('Experience must be an array'),
    body('education').optional().isArray().withMessage('Education must be an array'),
    body('jobPreferences').optional().isObject().withMessage('Job preferences must be an object')
]);

exports.recruiterProfileValidation = validate([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('organization.gstin').optional().notEmpty().withMessage('Organization GST number is required'),
    body('organization.name').optional().notEmpty().withMessage('Organization name is required'),
    body('organization.companySize').optional().isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).withMessage('Invalid company size'),
    body('organization.website').optional().isURL().withMessage('Please provide a valid website URL'),
    body('organization.contact.email').optional().isEmail().withMessage('Please provide a valid email address')
]);

// Chat validation
exports.messageValidation = validate([
    body('content').notEmpty().withMessage('Message content cannot be empty'),
    body('recipientId').notEmpty().withMessage('Recipient ID is required')
]);

// Resume upload validation
exports.resumeUploadValidation = validate([
    // File validation will be handled by multer middleware
]);

// ATS calculation validation
exports.atsCalculationValidation = validate([
    body('jobIds').optional().isArray().withMessage('Job IDs must be an array'),
    body('useAI').optional().isBoolean().withMessage('useAI must be a boolean')
]);

// Organization validation
exports.organizationValidation = validate([
    body('gstin')
        .notEmpty()
        .withMessage('GST number is required')
        .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
        .withMessage('Invalid GST number format'),
    body('name')
        .optional()
        .notEmpty()
        .withMessage('Organization name cannot be empty'),
    body('contact.email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address'),
    body('companySize')
        .optional()
        .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
        .withMessage('Invalid company size'),
    body('website')
        .optional()
        .isURL()
        .withMessage('Please provide a valid website URL')
]);

// Profile picture upload validation
exports.profilePictureValidation = validate([
    // File validation will be handled by multer middleware
    // Additional validation can be added here if needed
]);