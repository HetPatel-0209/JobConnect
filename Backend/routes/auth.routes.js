const express = require('express');
const router = express.Router();
const {
    register,
    login,
    adminLogin,
    getProfile,
    updateProfile,
    uploadProfilePicture,
    getUserProfile,
    changeOrganization,
    forgotPassword,
    validateResetToken,
    resetPassword
} = require('../controllers/auth.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { uploadProfilePic, handleUploadError } = require('../middlewares/upload.middleware');
const {
    registerValidation,
    loginValidation,
    jobseekerProfileValidation,
    recruiterProfileValidation
} = require('../middlewares/validation.middleware');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/admin-login', loginValidation, adminLogin);

// Password reset routes (public)
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token/validate', validateResetToken);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.get('/user/:userId', authenticate, authorizeRoles('recruiter'), getUserProfile);

router.put('/profile-jobseeker', authenticate, authorizeRoles('jobseeker'), jobseekerProfileValidation, updateProfile);
router.put('/profile-recruiter', authenticate, authorizeRoles('recruiter'), recruiterProfileValidation, updateProfile);
router.post('/profile-picture', authenticate, uploadProfilePic, handleUploadError, uploadProfilePicture);
router.put('/change-organization', authenticate, authorizeRoles('recruiter'), changeOrganization);

module.exports = router;