import api from './api';

export const ApplicationService = {
    /**
     * Apply for a job
     * @param {string} jobId - Job ID
     * @param {Object} applicationData - Application data
     * @returns {Promise<Object>} Application result
     */
    applyForJob: async (jobId, applicationData = {}) => {
        return await api.post(`/jobs/${jobId}/apply`, applicationData);
    },

    /**
     * Get user's applications (job seeker)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} User applications
     */
    getUserApplications: async (params = {}) => {
        return await api.get('/applications/user', params);
    },

    /**
     * Get applications for a specific job (recruiter)
     * @param {string} jobId - Job ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Job applications
     */
    getJobApplications: async (jobId, params = {}) => {
        return await api.get(`/jobs/${jobId}/applications`, params);
    },

    /**
     * Get a specific application by ID
     * @param {string} applicationId - Application ID
     * @returns {Promise<Object>} Application details
     */
    getApplication: async (applicationId) => {
        return await api.get(`/applications/${applicationId}`);
    },

    /**
     * Update application status (recruiter)
     * @param {string} applicationId - Application ID
     * @param {string} status - New status
     * @param {string} notes - Optional notes
     * @returns {Promise<Object>} Updated application
     */
    updateApplicationStatus: async (applicationId, status, notes = '') => {
        return await api.put(`/jobs/applications/${applicationId}/status`, {
            status,
            notes
        });
    },

    /**
     * Withdraw application (job seeker)
     * @param {string} applicationId - Application ID
     * @returns {Promise<Object>} Withdrawal result
     */
    withdrawApplication: async (applicationId) => {
        return await api.delete(`/applications/${applicationId}`);
    },

    /**
     * Get application statistics
     * @returns {Promise<Object>} Application stats
     */
    getApplicationStats: async () => {
        return await api.get('/applications/stats');
    },

    /**
     * Bulk update applications (recruiter)
     * @param {Array} applicationIds - Application IDs
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Update result
     */
    bulkUpdateApplications: async (applicationIds, updateData) => {
        return await api.put('/applications/bulk', {
            applicationIds,
            updateData
        });
    },

    /**
     * Get applications by organization (recruiter)
     * @param {string} organizationId - Organization ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Organization applications
     */
    getOrganizationApplications: async (organizationId, params = {}) => {
        return await api.get(`/organizations/${organizationId}/applications`, params);
    },

    /**
     * Check if user has already applied to a job
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} Application status
     */
    checkApplicationStatus: async (jobId) => {
        return await api.get(`/jobs/${jobId}/application-status`);
    },

    /**
     * Schedule interview
     * @param {string} applicationId - Application ID
     * @param {Object} interviewData - Interview data
     * @returns {Promise<Object>} Interview details
     */
    scheduleInterview: async (applicationId, interviewData) => {
        return await api.post(`/applications/${applicationId}/interview`, interviewData);
    },

    /**
     * Update interview details
     * @param {string} applicationId - Application ID
     * @param {string} interviewId - Interview ID
     * @param {Object} interviewData - Interview data
     * @returns {Promise<Object>} Updated interview
     */
    updateInterview: async (applicationId, interviewId, interviewData) => {
        return await api.put(`/applications/${applicationId}/interview/${interviewId}`, interviewData);
    },

    /**
     * Get interviews for an application
     * @param {string} applicationId - Application ID
     * @returns {Promise<Object>} Interviews
     */
    getApplicationInterviews: async (applicationId) => {
        return await api.get(`/applications/${applicationId}/interviews`);
    }
};
