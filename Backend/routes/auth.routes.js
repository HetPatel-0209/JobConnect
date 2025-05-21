const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    adminLogin, 
    getProfile,
    updateProfile
} = require('../controllers/auth.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const {
    registerValidation,
    loginValidation,
    jobseekerProfileValidation,
    recruiterProfileValidation
} = require('../middlewares/validation.middleware');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/admin/login', loginValidation, adminLogin);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile/jobseeker', authenticate, authorizeRoles('jobseeker'), jobseekerProfileValidation, updateProfile);
router.put('/profile/recruiter', authenticate, authorizeRoles('recruiter'), recruiterProfileValidation, updateProfile);

module.exports = router;