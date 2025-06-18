const express = require('express');
const router = express.Router();
const { 
    getAllJobs,
    getJobById,
    getAppliedJobs,
    calculateATSScore,
    postJob,
    getAppliedCandidates,
    applyForJob,
    updateJobStatus,
    deleteJob,
    uploadResume,
    getUserResumes,
    deleteResume,
    setActiveResume,
    viewResume
} = require('../controllers/jobs.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { jobPostValidation, atsCalculationValidation } = require('../middlewares/validation.middleware');
const { uploadResume: uploadResumeMiddleware, handleUploadError } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', getAllJobs); // Consolidated route with filtering support

// Protected routes - Jobseeker only
router.get('/applied', authenticate, authorizeRoles('jobseeker'), getAppliedJobs);

// Resume management routes - Jobseeker only
router.post('/resumes/upload', authenticate, authorizeRoles('jobseeker'), uploadResumeMiddleware, handleUploadError, uploadResume);
router.get('/resumes', authenticate, authorizeRoles('jobseeker'), getUserResumes);
router.get('/resumes/:resumeId/view', authenticate, viewResume);
router.delete('/resumes/:resumeId', authenticate, authorizeRoles('jobseeker'), deleteResume);
router.put('/resumes/:resumeId/activate', authenticate, authorizeRoles('jobseeker'), setActiveResume);

// Protected routes - Recruiter only
router.post('/', authenticate, authorizeRoles('recruiter'), jobPostValidation, postJob);

// Routes with parameters (must come after static routes)
router.get('/:jobId', getJobById); // Get specific job
router.get('/:jobId/ats-score', authenticate, authorizeRoles('jobseeker'), calculateATSScore);
router.post('/:jobId/apply', authenticate, authorizeRoles('jobseeker'), applyForJob);
router.put('/:jobId', authenticate, authorizeRoles('recruiter'), updateJobStatus);
router.delete('/:jobId', authenticate, authorizeRoles('recruiter'), deleteJob);
router.get('/:jobId/applications', authenticate, authorizeRoles('recruiter'), getAppliedCandidates);

module.exports = router;