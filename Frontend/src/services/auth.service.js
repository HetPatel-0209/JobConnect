import api from './api';
import cacheService, { CacheKeys, CacheInvalidation } from './cache.service';

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
    },    /**
     * Login a user
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} User data and token
     */
    login: async (credentials) => {
        try {
            console.log('🔑 Attempting login with credentials:', { email: credentials.email });
            const response = await api.post('/auth/login', credentials);
            console.log('✅ Login response received:', response);

            if (response.token && response.user) {
                // Store token and user data synchronously
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                // Verify storage was successful
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    console.log('💾 Successfully stored in localStorage:', {
                        token: !!storedToken,
                        user: response.user,
                        tokenLength: storedToken.length
                    });
                } else {
                    console.error('❌ Failed to store auth data in localStorage');
                    throw new Error('Failed to store authentication data');
                }
            } else {
                console.warn('⚠️ Invalid login response - missing token or user data');
                throw new Error('Invalid login response from server');
            }
            return response;
        } catch (error) {
            console.error('❌ Login failed:', error);
            // Clear any partial data on login failure
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
    },

    /**
     * Get the current user from localStorage
     * @returns {Object|null} User object or null
     */
    getCurrentUser: () => {
        const userString = localStorage.getItem('user');
        console.log('🔍 getCurrentUser - Raw localStorage user:', userString);
        
        if (userString) {
            try {
                const user = JSON.parse(userString);
                console.log('✅ getCurrentUser - Parsed user:', user);
                return user;
            } catch (error) {
                console.error('❌ getCurrentUser - Parse error:', error);
                localStorage.removeItem('user');
                return null;
            }
        }
        
        console.log('⚠️ getCurrentUser - No user in localStorage');
        return null;
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
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const isAuth = !!(token && user);

        console.log('🔍 Authentication check:', {
            hasToken: !!token,
            hasUser: !!user,
            isAuthenticated: isAuth,
            tokenLength: token?.length || 0
        });

        return isAuth;
    },

    /**
     * Debug authentication state
     * @returns {Object} Debug information about auth state
     */
    debugAuthState: () => {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        let user = null;

        try {
            user = userString ? JSON.parse(userString) : null;
        } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
        }

        const debugInfo = {
            hasToken: !!token,
            tokenLength: token?.length || 0,
            tokenPreview: token ? `${token.substring(0, 20)}...` : null,
            hasUser: !!user,
            userId: user?.id || user?._id || null,
            userRole: user?.role || null,
            userName: user?.name || null,
            rawUserString: userString,
            localStorageKeys: Object.keys(localStorage)
        };

        console.log('🔍 Auth Debug State:', debugInfo);
        return debugInfo;
    },

    /**
     * Get user profile
     * @returns {Promise<Object>} User profile
     */    getProfile: async () => {
        try {
            // Get current user ID from localStorage for cache key
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            // Handle both _id (MongoDB) and id fields
            const userId = user.id || user.id;
            if (!userId) {
                console.warn('User ID not found, attempting to fetch profile without cache key');
                // Try to fetch profile directly without cache key
                const response = await api.get('/auth/profile');
                console.log('Raw API response in AuthService (no cache):', response);
                return response;
            }

            const cacheKey = CacheKeys.USER_PROFILE(userId);

            // Use request deduplication to prevent multiple simultaneous calls
            return await cacheService.getOrFetch(cacheKey, async () => {
                const response = await api.get('/auth/profile');
                console.log('Raw API response in AuthService:', response);
                return response;
            });
        } catch (error) {
            console.error('AuthService.getProfile error:', error);
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
            const user = AuthService.getCurrentUser();
            if (!user) {
                throw new Error('No user found. Please login again.');
            }

            // Determine the correct endpoint based on user role
            let endpoint;
            if (user.role === 'jobseeker') {
                endpoint = '/auth/profile-jobseeker';
            } else if (user.role === 'recruiter') {
                endpoint = '/auth/profile-recruiter';
            } else {
                throw new Error(`Unsupported user role: ${user.role}`);
            }

            const response = await api.put(endpoint, profileData);
            console.log('AuthService updateProfile response:', response);

            if (response.user) {                // Update localStorage with the new user data
                localStorage.setItem('user', JSON.stringify(response.user));

                // Use targeted profile cache invalidation instead of broad user cache clearing
                CacheInvalidation.invalidateUserProfile(response.user.id);

                console.log('Profile cache invalidated for user:', response.user.id);
            }
            return response;
        } catch (error) {
            console.error(error);
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
            });            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));

                // Use targeted profile cache invalidation for profile picture updates
                CacheInvalidation.invalidateUserProfile(response.user.id);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get user profile by ID (for recruiters to view applicant profiles)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile
     */
    getUserProfile: async (userId) => {
        try {
            const response = await api.get(`/auth/user/${userId}`);
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    /**
     * Change recruiter's organization
     * @param {string} newOrganizationId - New organization ID
     * @returns {Promise<Object>} Updated user data
     */
    changeOrganization: async (newOrganizationId) => {
        try {
            const response = await api.put('/auth/change-organization', {
                organizationId: newOrganizationId
            });
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    /**
     * Logout user
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser'); // Remove legacy key if exists

        // Clear all cache on logout
        cacheService.clear();
    },

    /**
     * Send forgot password email
     * @param {string} email - User email
     * @returns {Promise<Object>} Response data
     */
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Validate password reset token
     * @param {string} token - Reset token
     * @returns {Promise<Object>} Response data
     */
    validateResetToken: async (token) => {
        try {
            const response = await api.get(`/auth/reset-password/${token}/validate`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response data
     */
    resetPassword: async (token, newPassword) => {
        try {
            const response = await api.post(`/auth/reset-password/${token}`, {
                password: newPassword
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
};
