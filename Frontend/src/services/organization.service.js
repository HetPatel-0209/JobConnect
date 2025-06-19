import api from './api';

/**
 * OrganizationService - Service to manage organizations
 */
export const OrganizationService = {
    /**
     * Fetch organization data by GST number
     * @param {string} gstNumber - GST number
     * @returns {Promise<Object>} Organization data
     */
    fetchByGST: async (gstNumber) => {
        return await api.get(`/organizations/gst/${gstNumber}`);
    },

    /**
     * Create a new organization
     * @param {Object} organizationData - Organization data
     * @returns {Promise<Object>} Created organization
     */
    createOrganization: async (organizationData) => {
        return await api.post('/organizations', organizationData);
    },

    /**
     * Get organization by ID
     * @param {string} orgId - Organization ID
     * @returns {Promise<Object>} Organization details
     */
    getOrganization: async (orgId) => {
        return await api.get(`/organizations/${orgId}`);
    },

    /**
     * Update organization
     * @param {string} orgId - Organization ID
     * @param {Object} organizationData - Organization data
     * @returns {Promise<Object>} Updated organization
     */
    updateOrganization: async (orgId, organizationData) => {
        return await api.put(`/organizations/${orgId}`, organizationData);
    },

    /**
     * Get all organizations with pagination and search
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Organizations list
     */
    getAllOrganizations: async (params = {}) => {
        return await api.get('/organizations', params);
    },

    /**
     * Upload organization images (logo and/or banner)
     * @param {string} orgId - Organization ID
     * @param {Object} files - Files to upload
     * @returns {Promise<Object>} Upload result
     */
    uploadImages: async (orgId, files) => {
        const formData = new FormData();
        
        // Add logo if provided
        if (files.logo) {
            formData.append('logo', files.logo);
        }
        
        // Add banner if provided
        if (files.banner) {
            formData.append('banner', files.banner);
        }

        return await api.post(`/organizations/${orgId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Validate GST number format (client-side validation)
     * @param {string} gstNumber - GST number to validate
     * @returns {boolean} Validation result
     */
    validateGSTFormat: (gstNumber) => {
        // GST number should be 15 characters long
        // Format: NNAAAANNNNNA (N=Number, A=Alphabet)
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
        return gstRegex.test(gstNumber);
    },

    /**
     * Search organizations by name or GST
     * @param {string} searchQuery - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Search results
     */
    searchOrganizations: async (searchQuery, options = {}) => {
        return await api.get('/organizations', {
            search: searchQuery,
            ...options
        });
    }
};
