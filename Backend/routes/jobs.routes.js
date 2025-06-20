const express = require('express');
const router = express.Router();
const {
    getAllJobs,
    getJobById,
    getRecruiterById,
    getCompanyById,
    getAppliedJobs,
    getRecommendedJobs,
    getJobseekerStats,
    calculateATSScore,
    postJob,
    getAppliedCandidates,
    applyForJob,
    updateJobStatus,
    updateApplicationStatus,
    deleteJob,
    uploadResume,
    getUserResumes,
    deleteResume,
    setActiveResume,
    viewResume,
    getUserActiveResume,
    getRecruiterJobs,
    getRecruiterStats,
    getJobAnalytics,
    getRecruiterAnalytics
} = require('../controllers/jobs.controller');
const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middlewares/auth.middleware');
const { jobPostValidation } = require('../middlewares/validation.middleware');
const { uploadResume: uploadResumeMiddleware, handleUploadError } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', getAllJobs);

// Specific routes with fixed paths - these must come BEFORE parameterized routes

// Protected routes - Jobseeker only
router.get('/applied', authenticate, authorizeRoles('jobseeker'), getAppliedJobs);
router.get('/recommended', authenticate, authorizeRoles('jobseeker'), getRecommendedJobs);
router.get('/stats', authenticate, authorizeRoles('jobseeker'), getJobseekerStats);

// Resume management routes - Jobseeker only
router.post('/resumes/upload', authenticate, authorizeRoles('jobseeker'), uploadResumeMiddleware, handleUploadError, uploadResume);
router.get('/resumes', authenticate, authorizeRoles('jobseeker'), getUserResumes);
router.get('/resumes/user', authenticate, authorizeRoles('jobseeker'), getUserActiveResume);
router.get('/resumes/:resumeId/view', authenticate, viewResume);
router.delete('/resumes/:resumeId', authenticate, authorizeRoles('jobseeker'), deleteResume);
router.put('/resumes/:resumeId/activate', authenticate, authorizeRoles('jobseeker'), setActiveResume);


// Application status update route
router.put('/applications/:applicationId/status', authenticate, updateApplicationStatus);

// Protected routes - Recruiter only
router.post('/', authenticate, authorizeRoles('recruiter'), jobPostValidation, postJob);
router.get('/recruiter/posted', authenticate, authorizeRoles('recruiter'), getRecruiterJobs);
router.get('/recruiter/stats', authenticate, authorizeRoles('recruiter'), getRecruiterStats);
router.get('/recruiter/analytics', authenticate, authorizeRoles('recruiter'), getRecruiterAnalytics);

// Company and recruiter routes - must come before /:jobId
router.get('/company/:companyId', getCompanyById);
router.get('/recruiter/:recruiterId', getRecruiterById);

// Routes with parameters (must come after static routes)
router.get('/:jobId', optionalAuthenticate, getJobById);
router.get('/:jobId/ats-score', authenticate, authorizeRoles('jobseeker'), calculateATSScore);
router.get('/:jobId/analytics', authenticate, authorizeRoles('recruiter'), getJobAnalytics);
router.post('/:jobId/apply', authenticate, authorizeRoles('jobseeker'), applyForJob);
router.put('/:jobId', authenticate, authorizeRoles('recruiter'), updateJobStatus);
router.delete('/:jobId', authenticate, authorizeRoles('recruiter'), deleteJob);
router.get('/:jobId/applications', authenticate, authorizeRoles('recruiter'), getAppliedCandidates);

module.exports = router;