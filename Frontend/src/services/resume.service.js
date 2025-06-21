import api from './api';

export const ResumeService = {
    /**
     * Upload resume
     * @param {File} resumeFile - Resume file to upload
     * @param {Object} additionalData - Additional data
     * @returns {Promise<Object>} Upload result
     */
    uploadResume: async (resumeFile, additionalData = {}) => {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        
        // Add any additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return await api.post('/jobs/resumes/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Get user's resumes
     * @returns {Promise<Object>} User's resumes
     */
    getUserResumes: async () => {
        return await api.get('/jobs/resumes');
    },

    /**
     * Get user's active resume
     * @returns {Promise<Object>} User's active resume
     */
    getUserActiveResume: async () => {
        return await api.get('/jobs/resumes/user');
    },

    /**
     * Get user's active resume by user ID (for recruiters)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User's active resume
     */
    getUserActiveResumeById: async (userId) => {
        return await api.get(`/jobs/resumes/user/${userId}`);
    },
    
    /**
     * Update resume
     * @param {string} resumeId - Resume ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated resume
     */
    updateResume: async (resumeId, updateData) => {
        return await api.put(`/jobs/resumes/${resumeId}`, updateData);
    },

    /**
     * Delete resume
     * @param {string} resumeId - Resume ID
     * @returns {Promise<Object>} Delete result
     */
    deleteResume: async (resumeId) => {
        return await api.delete(`/jobs/resumes/${resumeId}`);
    },

    /**
     * Parse resume (extract text and data)
     * @param {File} resumeFile - Resume file to parse
     * @returns {Promise<Object>} Parsed resume data
     */
    parseResume: async (resumeFile) => {
        const formData = new FormData();
        formData.append('resume', resumeFile);

        return await api.post('/jobs/resumes/parse', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    

    
    /**
     * Get resume by ID
     * @param {string} resumeId - Resume ID
     * @returns {Promise<Object>} Resume
     */
    getResume: async (resumeId) => {
        return await api.get(`/jobs/resumes/${resumeId}`);
    },

    /**
     * View/Download resume
     * @param {string} resumeId - Resume ID
     * @returns {Promise<Object>} Resume view data
     */
    viewResume: async (resumeId) => {
        return await api.get(`/jobs/resumes/${resumeId}/view`);
    },

    /**
     * Set active resume
     * @param {string} resumeId - Resume ID
     * @returns {Promise<Object>} Active resume
     */
    setActiveResume: async (resumeId) => {
        return await api.put(`/jobs/resumes/${resumeId}/activate`);
    },

    /**
     * Download resume file
     * @param {string} resumeId - Resume ID
     * @returns {Promise<Object>} Download info
     */
    downloadResume: async (resumeId) => {
        const response = await api.axios.get(`/jobs/resumes/${resumeId}/view`, {
            responseType: 'blob' // Important for file downloads
        });
        
        // Create blob URL for download
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        
        return {
            blob,
            url,
            filename: response.headers['content-disposition']?.split('filename=')[1] || 'resume.pdf'
        };
    },
    
    /**
     * Validate resume file
     * @param {File} file - File to validate
     * @returns {boolean} Validation result
     */
    validateResumeFile: (file) => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload a PDF or Word document.');
        }

        if (file.size > maxSize) {
            throw new Error('File size too large. Please upload a file smaller than 5MB.');
        }

        return true;
    }
};
