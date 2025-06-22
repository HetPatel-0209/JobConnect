import api from './api';
import cacheService, { CacheKeys, CacheInvalidation } from './cache.service';

export const JobService = {
    /**
     * Get all jobs with optional filters
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Jobs list with pagination
     */
    getAllJobs: async (filters = {}) => {
        const cacheKey = CacheKeys.ALL_JOBS(filters.page || 1, filters);
        const cached = cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await api.get('/jobs', filters);
        cacheService.set(cacheKey, result, 3 * 60 * 1000); // Cache for 3 minutes
        return result;
    },

    /**
     * Get recommended jobs based on user skills
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Recommended jobs
     */
    getRecommendedJobs: async (filters = {}) => {
        // Get current user ID from localStorage for cache key
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser._id || 'anonymous';

        const cacheKey = CacheKeys.USER_RECOMMENDED_JOBS(userId, filters.page || 1);

        // Use request deduplication
        return await cacheService.getOrFetch(cacheKey, async () => {
            return await api.get('/jobs/recommended', filters);
        });
    },

    /**
     * Get jobseeker dashboard stats
     * @returns {Promise<Object>} Dashboard stats
     */
    getJobseekerStats: async () => {
        // Get current user ID from localStorage for cache key
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser._id || 'anonymous';

        const cacheKey = CacheKeys.USER_STATS(userId);

        // Use request deduplication
        return await cacheService.getOrFetch(cacheKey, async () => {
            return await api.get('/jobs/stats');
        });
    },



    /**
     * Get jobs applied by the user
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Applied jobs
     */
    getAppliedJobs: async (filters = {}) => {
        // Get current user ID from localStorage for cache key
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser._id || 'anonymous';

        const cacheKey = CacheKeys.USER_APPLIED_JOBS(userId, filters.page || 1);

        // Use request deduplication
        return await cacheService.getOrFetch(cacheKey, async () => {
            return await api.get('/jobs/applied', filters);
        });
    },

    /**
     * Get a specific job by ID
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} Job details
     */
    getJobById: async (jobId) => {
        return await api.get(`/jobs/${jobId}`);
    },

    /**
     * Get recruiter details by ID
     * @param {string} recruiterId - Recruiter ID
     * @returns {Promise<Object>} Recruiter details
     */
    getRecruiterById: async (recruiterId) => {
        return await api.get(`/jobs/recruiter/${recruiterId}`);
    },

    /**
     * Get company details by ID
     * @param {string} companyId - Company ID
     * @returns {Promise<Object>} Company details
     */
    getCompanyById: async (companyId) => {
        return await api.get(`/jobs/company/${companyId}`);
    },

    // Recruiter endpoints

    /**
     * Post a new job
     * @param {Object} jobData - Job data
     * @returns {Promise<Object>} Created job
     */
    postJob: async (jobData) => {
        const result = await api.post('/jobs', jobData);

        // Invalidate relevant caches
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser._id;

        if (userId) {
            CacheInvalidation.invalidateRecruiterCache(userId);
        }
        CacheInvalidation.invalidateJobCache();

        return result;
    },

    /**
     * Get candidates who applied for a job
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} List of candidates
     */
    getAppliedCandidates: async (jobId) => {
        return await api.get(`/jobs/${jobId}/applications`);
    },

    /**
     * Update an existing job
     * @param {string} jobId - Job ID
     * @param {Object} jobData - Job data to update
     * @returns {Promise<Object>} Updated job
     */
    updateJob: async (jobId, jobData) => {
        const result = await api.put(`/jobs/${jobId}`, jobData);

        // Invalidate relevant caches
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser._id;

        if (userId) {
            CacheInvalidation.invalidateRecruiterCache(userId);
        }
        CacheInvalidation.invalidateJobCache();
        CacheInvalidation.invalidateJob(jobId);

        return result;
    },

    /**
     * Delete a job
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} Delete result
     */
    deleteJob: async (jobId) => {
        const result = await api.delete(`/jobs/${jobId}`);

        // Invalidate relevant caches
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser._id;

        if (userId) {
            CacheInvalidation.invalidateRecruiterCache(userId);
        }
        CacheInvalidation.invalidateJobCache();
        CacheInvalidation.invalidateJob(jobId);

        return result;
    },

    /**
     * Calculate ATS score for a job using user's active resume
     * @param {string} jobId - Job ID
     * @param {boolean} useAI - Whether to use AI for calculation (default: true)
     * @returns {Promise<Object>} ATS score and evaluation
     */
    calculateATSScore: async (jobId, useAI = true) => {
        return await api.get(`/jobs/${jobId}/ats-score`, { useAI });
    },

    /**
     * Apply for a job
     * @param {string} jobId - Job ID
     * @param {Object} applicationData - Application data (optional)
     * @returns {Promise<Object>} Application result
     */
    applyForJob: async (jobId, applicationData = {}) => {
        const result = await api.post(`/jobs/${jobId}/apply`, applicationData);

        // Invalidate user-related caches since application status changed
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser._id;

        if (userId) {
            CacheInvalidation.invalidateUserCache(userId);
        }

        return result;
    },

    // Recruiter-specific methods

    /**
     * Get all jobs posted by the current recruiter
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Recruiter's posted jobs
     */
    getRecruiterJobs: async (filters = {}) => {
        // Get current user ID from localStorage for cache key
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser._id || 'anonymous';

        const cacheKey = CacheKeys.RECRUITER_JOBS(userId, filters.page || 1);
        const cached = cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await api.get('/jobs/recruiter/posted', filters);
        cacheService.set(cacheKey, result, 3 * 60 * 1000); // Cache for 3 minutes
        return result;
    },

    /**
     * Get recruiter dashboard statistics
     * @returns {Promise<Object>} Dashboard stats
     */
    getRecruiterStats: async () => {
        // Get current user ID from localStorage for cache key
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser._id || 'anonymous';

        const cacheKey = CacheKeys.RECRUITER_STATS(userId);
        const cached = cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await api.get('/jobs/recruiter/stats');
        cacheService.set(cacheKey, result, 2 * 60 * 1000); // Cache for 2 minutes
        return result;
    },

    /**
     * Get analytics for a specific job
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} Job analytics
     */
    getJobAnalytics: async (jobId) => {
        return await api.get(`/jobs/${jobId}/analytics`);
    },

    /**
     * Get overall analytics for recruiter's jobs
     * @param {Object} filters - Filter parameters (date range, etc.)
     * @returns {Promise<Object>} Overall analytics
     */
    getRecruiterAnalytics: async (filters = {}) => {
        return await api.get('/jobs/recruiter/analytics', filters);
    },

    /**
     * Get jobs by organization
     * @param {string} organizationId - Organization ID
     * @param {Object} filters - Filter options
     * @returns {Promise<Object>} Jobs list
     */
    getJobsByOrganization: async (organizationId, filters = {}) => {
        return await api.get(`/jobs/organization/${organizationId}`, filters);
    },



    /**
     * Get candidates who applied for a job (recruiter only)
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} List of candidates who applied
     */
    getAppliedCandidates: async (jobId) => {
        return await api.get(`/jobs/${jobId}/applications`);
    },

    /**
     * Save a job for later
     * @param {string} jobId - Job ID to save
     * @returns {Promise<Object>} Save job response
     */
    saveJob: async (jobId) => {
        return await api.post(`/jobs/${jobId}/save`);
    },

    /**
     * Remove a saved job
     * @param {string} jobId - Job ID to unsave
     * @returns {Promise<Object>} Unsave job response
     */
    unsaveJob: async (jobId) => {
        return await api.delete(`/jobs/${jobId}/save`);
    },

    /**
     * Get all saved jobs
     * @param {Object} params - Query parameters (page, limit)
     * @returns {Promise<Object>} Saved jobs list
     */
    getSavedJobs: async (params = {}) => {
        return await api.get('/jobs/saved', { params });
    },

    /**
     * Check if a job is saved
     * @param {string} jobId - Job ID to check
     * @returns {Promise<Object>} Job saved status
     */
    checkJobSaved: async (jobId) => {
        return await api.get(`/jobs/${jobId}/saved`);
    }
};
