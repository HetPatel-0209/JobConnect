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
router.get('/gst/:gstNumber', fetchOrganizationByGST); // Fetch organization data by GST number
router.get('/', getAllOrganizations); // Get all organizations (with search/pagination)
router.get('/:orgId', getOrganization); // Get specific organization

// Protected routes - Recruiter only
router.post('/', authenticate, authorizeRoles('recruiter'), organizationValidation, createOrganization);
router.put('/:orgId', authenticate, authorizeRoles('recruiter'), updateOrganization);
router.post('/:orgId/images', authenticate, authorizeRoles('recruiter'), uploadOrganizationFiles, handleUploadError, uploadOrganizationImages);

module.exports = router;