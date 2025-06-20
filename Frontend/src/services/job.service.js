import api from './api';

export const JobService = {
    /**
     * Get all jobs with optional filters
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Jobs list with pagination
     */
    getAllJobs: async (filters = {}) => {
        return await api.get('/jobs', filters);
    },

    /**
     * Get recommended jobs based on user skills
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Recommended jobs
     */
    getRecommendedJobs: async (filters = {}) => {
        return await api.get('/jobs/recommended', filters);
    },

    /**
     * Get jobseeker dashboard stats
     * @returns {Promise<Object>} Dashboard stats
     */
    getJobseekerStats: async () => {
        return await api.get('/jobs/stats');
    },


    
    /**
     * Get jobs applied by the user
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Applied jobs
     */
    getAppliedJobs: async (filters = {}) => {
        return await api.get('/jobs/applied', filters);
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
        return await api.post('/jobs', jobData);
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
        return await api.put(`/jobs/${jobId}`, jobData);
    },

    /**
     * Delete a job
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} Delete result
     */
    deleteJob: async (jobId) => {
        return await api.delete(`/jobs/${jobId}`);
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
        return await api.post(`/jobs/${jobId}/apply`, applicationData);
    },

    // Recruiter-specific methods

    /**
     * Get all jobs posted by the current recruiter
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Recruiter's posted jobs
     */
    getRecruiterJobs: async (filters = {}) => {
        return await api.get('/jobs/recruiter/posted', filters);
    },

    /**
     * Get recruiter dashboard statistics
     * @returns {Promise<Object>} Dashboard stats
     */
    getRecruiterStats: async () => {
        return await api.get('/jobs/recruiter/stats');
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
    }
};
