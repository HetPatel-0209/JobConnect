import api from './api';

export const AuthService = {
    /**
     * Register a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} User data and token
     */
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Login a user
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} User data and token
     */
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Logout the current user
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * Get the current user from localStorage
     * @returns {Object|null} User object or null
     */
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Get the auth token from localStorage
     * @returns {string|null} Token or null
     */
    getToken: () => {
        return localStorage.getItem('token');
    },

    /**
     * Check if the user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
    
    /**
     * Get user profile
     * @returns {Promise<Object>} User profile
     */
    getProfile: async () => {
        try {
            return await api.get('/auth/profile');
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Updated profile
     */
    updateProfile: async (profileData) => {
        try {
            // Get current user to determine the correct endpoint
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('No user found. Please login again.');
            }

            // Determine the correct endpoint based on user role
            let endpoint;
            if (currentUser.role === 'jobseeker') {
                endpoint = '/auth/profile-jobseeker';
            } else if (currentUser.role === 'recruiter') {
                endpoint = '/auth/profile-recruiter';
            } else {
                throw new Error(`Unsupported user role: ${currentUser.role}`);
            }

            const response = await api.put(endpoint, profileData);
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('currentUser', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    /**
     * Upload profile picture
     * @param {FormData} formData - Form data with picture
     * @returns {Promise<Object>} Updated profile
     */
    uploadProfilePicture: async (formData) => {
        try {
            const response = await api.post('/auth/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    }
};
