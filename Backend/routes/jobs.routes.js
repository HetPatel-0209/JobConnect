const express = require('express');
const router = express.Router();
const {
    getAllJobs,
    getJobById,
    getRecruiterById,
    getCompanyById,
    getJobsByOrganization,
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
    getUserActiveResumeById,
    getRecruiterJobs,
    getRecruiterStats,
    getJobAnalytics,
    getRecruiterAnalytics,
    saveJob,
    unsaveJob,
    getSavedJobs,
    checkJobSaved
} = require('../controllers/jobs.controller');
const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middlewares/auth.middleware');
const { jobPostValidation } = require('../middlewares/validation.middleware');
const { uploadResume: uploadResumeMiddleware, handleUploadError } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', getAllJobs);

// jobseeker only
router.get('/applied', authenticate, authorizeRoles('jobseeker'), getAppliedJobs);
router.get('/recommended', authenticate, authorizeRoles('jobseeker'), getRecommendedJobs);
router.get('/stats', authenticate, authorizeRoles('jobseeker'), getJobseekerStats);
router.get('/saved', authenticate, authorizeRoles('jobseeker'), getSavedJobs);

// jobseeker only
router.post('/resumes/upload', authenticate, authorizeRoles('jobseeker'), uploadResumeMiddleware, handleUploadError, uploadResume);
router.get('/resumes', authenticate, authorizeRoles('jobseeker'), getUserResumes);
router.get('/resumes/user', authenticate, authorizeRoles('jobseeker'), getUserActiveResume);
router.get('/resumes/user/:userId', authenticate, authorizeRoles('recruiter'), getUserActiveResumeById);
router.get('/resumes/:resumeId/view', authenticate, viewResume);
router.delete('/resumes/:resumeId', authenticate, authorizeRoles('jobseeker'), deleteResume);
router.put('/resumes/:resumeId/activate', authenticate, authorizeRoles('jobseeker'), setActiveResume);

router.put('/applications/:applicationId/status', authenticate, updateApplicationStatus);
router.post('/', authenticate, authorizeRoles('recruiter'), jobPostValidation, postJob);
router.get('/recruiter/posted', authenticate, authorizeRoles('recruiter'), getRecruiterJobs);
router.get('/recruiter/stats', authenticate, authorizeRoles('recruiter'), getRecruiterStats);
router.get('/recruiter/analytics', authenticate, authorizeRoles('recruiter'), getRecruiterAnalytics);

router.get('/company/:companyId', getCompanyById);
router.get('/recruiter/:recruiterId', getRecruiterById);
router.get('/organization/:organizationId', getJobsByOrganization);

router.get('/:jobId', optionalAuthenticate, getJobById);
router.get('/:jobId/ats-score', authenticate, authorizeRoles('jobseeker'), calculateATSScore);
router.get('/:jobId/analytics', authenticate, authorizeRoles('recruiter'), getJobAnalytics);
router.post('/:jobId/apply', authenticate, authorizeRoles('jobseeker'), applyForJob);
router.put('/:jobId', authenticate, authorizeRoles('recruiter'), updateJobStatus);
router.delete('/:jobId', authenticate, authorizeRoles('recruiter'), deleteJob);
router.get('/:jobId/applications', authenticate, authorizeRoles('recruiter'), getAppliedCandidates);

router.post('/:jobId/save', authenticate, authorizeRoles('jobseeker'), saveJob);
router.delete('/:jobId/save', authenticate, authorizeRoles('jobseeker'), unsaveJob);
router.get('/:jobId/saved', authenticate, authorizeRoles('jobseeker'), checkJobSaved);

module.exports = router;