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
    body('email').isEmail().withMessage('Please provide a valid email'),
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
    body('requirements').isArray().withMessage('Requirements must be an array'),
    body('location').notEmpty().withMessage('Job location is required'),
    body('skills').isArray().withMessage('Skills must be an array'),
    body('company').notEmpty().withMessage('Company name is required')
]);

// Profile validations
exports.jobseekerProfileValidation = validate([
    body('location').notEmpty().withMessage('Location is required'),
    body('skills').isArray().withMessage('Skills must be an array'),
    body('experience').optional().isArray(),
    body('education').optional().isArray()
]);

exports.recruiterProfileValidation = validate([
    body('company.name').notEmpty().withMessage('Company name is required'),
    body('company.position').notEmpty().withMessage('Position is required'),
    body('company.description').notEmpty().withMessage('Company description is required')
]);

// Chat validation
exports.messageValidation = validate([
    body('content').notEmpty().withMessage('Message content cannot be empty'),
    body('recipientId').notEmpty().withMessage('Recipient ID is required')
]);
