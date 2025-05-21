const express = require('express');
const router = express.Router();
const { 
    getAllJobs,
    getJobsByLocation,
    getJobsBySkills,
    getAppliedJobs,
    calculateATSScore,
    postJob,
    getAppliedCandidates,
    applyForJob,
    updateJobStatus,
    deleteJob,
    searchJobs
} = require('../controllers/jobs.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { jobPostValidation } = require('../middlewares/validation.middleware');

// Public routes
router.get('/jobs', getAllJobs);
router.get('/jobs/search', searchJobs);

// Protected routes - Jobseeker
router.get('/jobs/location', authenticate, authorizeRoles('jobseeker'), getJobsByLocation);
router.get('/jobs/skills', authenticate, authorizeRoles('jobseeker'), getJobsBySkills);
router.get('/jobs/applied', authenticate, authorizeRoles('jobseeker'), getAppliedJobs);
router.get('/jobs/:jobId/ats-score', authenticate, authorizeRoles('jobseeker'), calculateATSScore);
router.post('/jobs/:jobId/apply', authenticate, authorizeRoles('jobseeker'), applyForJob);

// Protected routes - Recruiter
router.post('/jobs', authenticate, authorizeRoles('recruiter'), jobPostValidation, postJob);
router.put('/jobs/:jobId', authenticate, authorizeRoles('recruiter'), jobPostValidation, updateJobStatus);
router.delete('/jobs/:jobId', authenticate, authorizeRoles('recruiter'), deleteJob);
router.get('/jobs/:jobId/candidates', authenticate, authorizeRoles('recruiter'), getAppliedCandidates);

module.exports = router;
