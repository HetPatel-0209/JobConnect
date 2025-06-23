const express = require('express');
const router = express.Router();
const {
    fetchOrganizationByGST,
    createOrganization,
    getOrganization,
    updateOrganization,
    getAllOrganizations,
    uploadOrganizationImages
} = require('../controllers/organization.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { organizationValidation } = require('../middlewares/validation.middleware');
const { uploadOrganizationFiles, handleUploadError } = require('../middlewares/upload.middleware');

// Public routes
router.get('/gst/:gstNumber', fetchOrganizationByGST);
router.get('/', getAllOrganizations);
router.get('/:orgId', getOrganization);
router.post('/', organizationValidation, createOrganization); // Allow unauthenticated organization creation

// Protected routes - Recruiter only
router.post('/', authenticate, authorizeRoles('recruiter'), organizationValidation);
router.put('/:orgId', authenticate, authorizeRoles('recruiter'), updateOrganization);
router.post('/:orgId/images', authenticate, authorizeRoles('recruiter'), uploadOrganizationFiles, handleUploadError, uploadOrganizationImages);

module.exports = router;