/**
 * Utility service for consistent user ID handling across the application
 * Handles the inconsistency between MongoDB _id and frontend id fields
 */
export const UserIdUtils = {
    /**
     * Get user ID from any user object (handles both _id and id)
     * @param {Object} user - User object
     * @returns {string|null} User ID as string
     */
    getUserId: (user) => {
        if (!user) return null;
        
        // Prefer 'id' field, fallback to '_id', convert to string
        const id = user.id || user._id;
        return id ? id.toString() : null;
    },
    
    /**
     * Get current user ID from localStorage
     * @returns {string|null} Current user ID
     */
    getCurrentUserId: () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return UserIdUtils.getUserId(user);
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            return null;
        }
    },
    
    /**
     * Get current user object from localStorage
     * @returns {Object|null} Current user object
     */
    getCurrentUser: () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            return UserIdUtils.normalizeUser(user);
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            return null;
        }
    },
    
    /**
     * Normalize user object to always have 'id' field
     * @param {Object} user - User object
     * @returns {Object|null} Normalized user object
     */
    normalizeUser: (user) => {
        if (!user) return null;
        
        const userId = UserIdUtils.getUserId(user);
        if (!userId) return user;
        
        return {
            ...user,
            id: userId
        };
    },
    
    /**
     * Check if user ID is valid
     * @param {string} userId - User ID to validate
     * @returns {boolean} Whether the user ID is valid
     */
    isValidUserId: (userId) => {
        return userId && typeof userId === 'string' && userId.length > 0;
    },
    
    /**
     * Extract user ID from various sources with fallback
     * @param {Object} options - Options object
     * @param {Object} options.user - User object
     * @param {string} options.userId - Direct user ID
     * @param {boolean} options.useLocalStorage - Whether to fallback to localStorage
     * @returns {string|null} User ID
     */
    extractUserId: ({ user, userId, useLocalStorage = true } = {}) => {
        // Direct userId parameter
        if (UserIdUtils.isValidUserId(userId)) {
            return userId;
        }
        
        // From user object
        if (user) {
            const extractedId = UserIdUtils.getUserId(user);
            if (UserIdUtils.isValidUserId(extractedId)) {
                return extractedId;
            }
        }
        
        // Fallback to localStorage
        if (useLocalStorage) {
            const currentUserId = UserIdUtils.getCurrentUserId();
            if (UserIdUtils.isValidUserId(currentUserId)) {
                return currentUserId;
            }
        }
        
        return null;
    },
    
    /**
     * Debug user ID information
     * @returns {Object} Debug information
     */
    debugUserInfo: () => {
        const user = UserIdUtils.getCurrentUser();
        const userId = UserIdUtils.getCurrentUserId();
        
        return {
            hasUser: !!user,
            userId: userId,
            userIdValid: UserIdUtils.isValidUserId(userId),
            userObject: user,
            rawUserString: localStorage.getItem('user'),
            hasToken: !!localStorage.getItem('token')
        };
    }
};

export default UserIdUtils;
