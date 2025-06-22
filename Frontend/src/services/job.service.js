import api from './api';
import cacheService, { CacheKeys, CacheInvalidation } from './cache.service';
import { UserIdUtils } from '../utils/userIdUtils';

export const JobService = {
    /**
     * Get all jobs with optional filters - Enhanced with smart caching
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Jobs list with pagination
     */
    getAllJobs: async (filters = {}) => {
        // Extract page from filters to ensure consistent cache key generation
        const { page, ...filterParams } = filters;
        const pageNum = page || 1;
        const cacheKey = CacheKeys.ALL_JOBS(pageNum, filterParams);

        // Use smart caching with request deduplication
        return await cacheService.getOrFetch(cacheKey, async () => {
            const result = await api.get('/jobs', filters);
            return result;
        });
    },

    /**
     * Get recommended jobs based on user skills
     * @param {Object} filters - Filter parameters
     * @param {string} userId - User ID (required for proper caching)
     * @returns {Promise<Object>} Recommended jobs
     */    getRecommendedJobs: async (filters = {}, userId = null) => {
        // Use provided userId or fall back to localStorage
        if (!userId) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            userId = user.id;
        }

        if (!userId) {
            throw new Error('User ID is required for recommended jobs');
        }

        const cacheKey = CacheKeys.USER_RECOMMENDED_JOBS(userId, filters.page || 1);

        // Use request deduplication
        return await cacheService.getOrFetch(cacheKey, async () => {
            return await api.get('/jobs/recommended', filters);
        });
    },

    /**
     * Get jobseeker dashboard stats
     * @param {string} userId - User ID (required for proper caching)
     * @returns {Promise<Object>} Dashboard stats
     */    getJobseekerStats: async (userId = null) => {
        // Use UserIdUtils for consistent ID extraction
        userId = UserIdUtils.extractUserId({ userId });

        if (!userId) {
            throw new Error('User ID is required for stats');
        }

        const cacheKey = CacheKeys.USER_STATS(userId);

        // Use request deduplication
        return await cacheService.getOrFetch(cacheKey, async () => {
            return await api.get('/jobs/stats');
        });
    },



    /**
     * Get jobs applied by the user
     * @param {Object} filters - Filter parameters
     * @param {string} userId - User ID (required for proper caching)
     * @returns {Promise<Object>} Applied jobs
     */    getAppliedJobs: async (filters = {}, userId = null) => {
        // Use UserIdUtils for consistent ID extraction
        userId = UserIdUtils.extractUserId({ userId });

        if (!userId) {
            throw new Error('User ID is required for applied jobs');
        }

        const cacheKey = CacheKeys.USER_APPLIED_JOBS(userId, filters.page || 1);

        // Use request deduplication
        return await cacheService.getOrFetch(cacheKey, async () => {
            return await api.get('/jobs/applied', filters);
        });
    },

    /**
     * Get a specific job by ID - Enhanced with caching
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} Job details
     */
    getJobById: async (jobId) => {
        const cacheKey = CacheKeys.JOB_DETAILS(jobId);

        return await cacheService.getOrFetch(cacheKey, async () => {
            const result = await api.get(`/jobs/${jobId}`);
            return result;
        });
    },

    /**
     * Get recruiter details by ID - Enhanced with caching
     * @param {string} recruiterId - Recruiter ID
     * @returns {Promise<Object>} Recruiter details
     */
    getRecruiterById: async (recruiterId) => {
        const cacheKey = `recruiter_details_${recruiterId}`;

        return await cacheService.getOrFetch(cacheKey, async () => {
            const result = await api.get(`/jobs/recruiter/${recruiterId}`);
            return result;
        });
    },

    /**
     * Get company details by ID - Enhanced with caching
     * @param {string} companyId - Company ID
     * @returns {Promise<Object>} Company details
     */
    getCompanyById: async (companyId) => {
        const cacheKey = `company_details_${companyId}`;

        return await cacheService.getOrFetch(cacheKey, async () => {
            const result = await api.get(`/jobs/company/${companyId}`);
            return result;
        });
    },

    // Recruiter endpoints

    /**
     * Post a new job
     * @param {Object} jobData - Job data
     * @returns {Promise<Object>} Created job
     */    postJob: async (jobData) => {
        const result = await api.post('/jobs', jobData);

        // Invalidate relevant caches using UserIdUtils
        const userId = UserIdUtils.getCurrentUserId();

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
     */    updateJob: async (jobId, jobData) => {
        const result = await api.put(`/jobs/${jobId}`, jobData);

        // Invalidate relevant caches
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

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
     */    deleteJob: async (jobId) => {
        const result = await api.delete(`/jobs/${jobId}`);

        // Invalidate relevant caches
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        if (userId) {
            CacheInvalidation.invalidateRecruiterCache(userId);
        }
        CacheInvalidation.invalidateJobCache();
        CacheInvalidation.invalidateJob(jobId);

        return result;
    },

    /**
     * Calculate ATS score for a job using user's active resume - Enhanced with caching
     * @param {string} jobId - Job ID
     * @param {boolean} useAI - Whether to use AI for calculation (default: true)
     * @param {string} userId - User ID (required for proper caching)
     * @returns {Promise<Object>} ATS score and evaluation
     */    calculateATSScore: async (jobId, useAI = true, userId = null) => {
        // Use UserIdUtils for consistent ID extraction
        userId = UserIdUtils.extractUserId({ userId });

        if (!userId) {
            throw new Error('User ID is required for ATS score calculation');
        }

        const cacheKey = CacheKeys.JOB_ATS_SCORE(jobId, userId);

        // ATS scores should be cached for a shorter time since they depend on resume
        return await cacheService.getOrFetch(cacheKey, async () => {
            const result = await api.get(`/jobs/${jobId}/ats-score`, { useAI });
            return result;
        });
    },

    /**
     * Apply for a job - Enhanced with smart cache invalidation
     * @param {string} jobId - Job ID
     * @param {Object} applicationData - Application data (optional)
     * @returns {Promise<Object>} Application result
     */    applyForJob: async (jobId, applicationData = {}) => {
        const result = await api.post(`/jobs/${jobId}/apply`, applicationData);

        // Smart cache invalidation for application-related data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        if (userId) {
            // Use event-based invalidation
            CacheInvalidation.invalidateByEvent('job_applied', { userId, jobId });

            // Update cache with real-time data if available
            if (result.application) {
                const userStatsKey = CacheKeys.USER_STATS(userId);
                cacheService.updateRealtime(userStatsKey, {
                    appliedJobs: (cacheService.get(userStatsKey)?.appliedJobs || 0) + 1
                });
            }
        }

        return result;
    },

    // Recruiter-specific methods

    /**
     * Get all jobs posted by the current recruiter - Enhanced with smart caching
     * @param {Object} filters - Filter parameters
     * @param {string} userId - User ID (required for proper caching)
     * @returns {Promise<Object>} Recruiter's posted jobs
     */    getRecruiterJobs: async (filters = {}, userId = null) => {
        // Use UserIdUtils for consistent ID extraction
        userId = UserIdUtils.extractUserId({ userId });

        if (!userId) {
            throw new Error('User ID is required for recruiter jobs');
        }

        const cacheKey = CacheKeys.RECRUITER_JOBS(userId, filters.page || 1);

        return await cacheService.getOrFetch(cacheKey, async () => {
            const result = await api.get('/jobs/recruiter/posted', filters);
            return result;
        });
    },

    /**
     * Get recruiter dashboard statistics - Enhanced with smart caching
     * @param {string} userId - User ID (required for proper caching)
     * @returns {Promise<Object>} Dashboard stats
     */    getRecruiterStats: async (userId = null) => {
        // Use UserIdUtils for consistent ID extraction
        userId = UserIdUtils.extractUserId({ userId });

        if (!userId) {
            throw new Error('User ID is required for recruiter stats');
        }

        const cacheKey = CacheKeys.RECRUITER_STATS(userId);

        return await cacheService.getOrFetch(cacheKey, async () => {
            const result = await api.get('/jobs/recruiter/stats');
            return result;
        });
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
     * Save a job for later - Enhanced with cache updates
     * @param {string} jobId - Job ID to save
     * @returns {Promise<Object>} Save job response
     */    saveJob: async (jobId) => {
        const result = await api.post(`/jobs/${jobId}/save`);

        // Update cache to reflect saved status
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        if (userId) {
            // Update saved status cache
            const savedStatusKey = CacheKeys.JOB_SAVED_STATUS(jobId, userId);
            cacheService.set(savedStatusKey, { isSaved: true }, 10 * 60 * 1000);

            // Invalidate saved jobs list
            cacheService.clearByPattern(`user_saved_jobs_${userId}_.*`);

            // Update user stats if available
            const userStatsKey = CacheKeys.USER_STATS(userId);
            cacheService.updateRealtime(userStatsKey, {
                savedJobs: (cacheService.get(userStatsKey)?.savedJobs || 0) + 1
            });
        }

        return result;
    },

    /**
     * Remove a saved job - Enhanced with cache updates
     * @param {string} jobId - Job ID to unsave
     * @returns {Promise<Object>} Unsave job response
     */
    unsaveJob: async (jobId) => {
        const result = await api.delete(`/jobs/${jobId}/save`);        // Update cache to reflect unsaved status
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        if (userId) {
            // Update saved status cache
            const savedStatusKey = CacheKeys.JOB_SAVED_STATUS(jobId, userId);
            cacheService.set(savedStatusKey, { isSaved: false }, 10 * 60 * 1000);

            // Invalidate saved jobs list
            cacheService.clearByPattern(`user_saved_jobs_${userId}_.*`);

            // Update user stats if available
            const userStatsKey = CacheKeys.USER_STATS(userId);
            const currentStats = cacheService.get(userStatsKey);
            if (currentStats) {
                cacheService.updateRealtime(userStatsKey, {
                    savedJobs: Math.max(0, (currentStats.savedJobs || 1) - 1)
                });
            }
        }

        return result;
    },

    /**
     * Get all saved jobs - Enhanced with caching
     * @param {Object} params - Query parameters (page, limit)
     * @returns {Promise<Object>} Saved jobs list
     */    getSavedJobs: async (params = {}) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;
        const cacheKey = CacheKeys.USER_SAVED_JOBS(userId, params.page || 1);

        return await cacheService.getOrFetch(cacheKey, async () => {
            const result = await api.get('/jobs/saved', { params });
            return result;
        });
    },

    /**
     * Check if a job is saved - Enhanced with caching
     * @param {string} jobId - Job ID to check
     * @returns {Promise<Object>} Job saved status
     */    checkJobSaved: async (jobId) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;
        const cacheKey = CacheKeys.JOB_SAVED_STATUS(jobId, userId);

        return await cacheService.getOrFetch(cacheKey, async () => {
            const result = await api.get(`/jobs/${jobId}/saved`);
            return result;
        });
    }
};
