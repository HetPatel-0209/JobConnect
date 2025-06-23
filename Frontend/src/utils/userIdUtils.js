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
    },    /**
     * Get organization ID from user object (handles multiple possible structures)
     * @param {Object} user - User object
     * @returns {string|null} Organization ID as string
     */
    getOrganizationId: (user) => {
        if (!user || user.role !== 'recruiter') {
            return null;
        }        // Try different possible structures:
        // 1. Direct organizationId on user (from login response)
        if (user.organizationId) {
            // If it's a populated object, get the _id or id
            if (typeof user.organizationId === 'object' && user.organizationId !== null) {
                // Check for MongoDB ObjectId with buffer property
                if (user.organizationId.buffer && typeof user.organizationId.buffer === 'object') {
                    // This is likely a MongoDB ObjectId - convert buffer to hex string
                    const buffer = user.organizationId.buffer;
                    let hexString = '';
                    
                    // Convert buffer to hex string
                    if (buffer.data && Array.isArray(buffer.data)) {
                        hexString = buffer.data.map(byte => byte.toString(16).padStart(2, '0')).join('');
                    } else if (buffer instanceof Uint8Array || buffer instanceof Array) {
                        hexString = Array.from(buffer).map(byte => byte.toString(16).padStart(2, '0')).join('');
                    } else if (typeof buffer === 'object' && buffer !== null) {
                        // Handle buffer as object with numeric keys (MongoDB ObjectId format)
                        const bytes = [];
                        for (let i = 0; i < 12; i++) {
                            if (buffer[i] !== undefined) {
                                bytes.push(buffer[i]);
                            }
                        }
                        if (bytes.length === 12) {
                            hexString = bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
                        }
                    } else {
                        // Try toString() as fallback
                        hexString = user.organizationId.toString();
                    }
                    
                    if (hexString !== '[object Object]' && hexString.length === 24) {
                        return hexString;
                    }
                }
                // Check for populated object with _id or id
                const id = user.organizationId._id || user.organizationId.id;
                return id ? id.toString() : null;
            }
            // If it's a string ID
            if (typeof user.organizationId === 'string') {
                return user.organizationId;
            }
            // If it's an ObjectId or other type, convert to string safely
            if (user.organizationId.toString && typeof user.organizationId.toString === 'function') {
                const stringId = user.organizationId.toString();
                // Avoid returning '[object Object]' and check for reasonable length
                if (stringId !== '[object Object]' && stringId.length >= 12) {
                    return stringId;
                }
            }
        }        // 2. Through recruiterProfile.organizationId
        if (user.recruiterProfile?.organizationId) {
            const orgId = user.recruiterProfile.organizationId;
            // If it's a populated object, get the _id or id
            if (typeof orgId === 'object' && orgId !== null) {
                // Check for MongoDB ObjectId with buffer property
                if (orgId.buffer && typeof orgId.buffer === 'object') {
                    // This is likely a MongoDB ObjectId - convert buffer to hex string
                    const buffer = orgId.buffer;
                    let hexString = '';
                    
                    // Convert buffer to hex string
                    if (buffer.data && Array.isArray(buffer.data)) {
                        hexString = buffer.data.map(byte => byte.toString(16).padStart(2, '0')).join('');
                    } else if (buffer instanceof Uint8Array || buffer instanceof Array) {
                        hexString = Array.from(buffer).map(byte => byte.toString(16).padStart(2, '0')).join('');
                    } else if (typeof buffer === 'object' && buffer !== null) {
                        // Handle buffer as object with numeric keys (MongoDB ObjectId format)
                        const bytes = [];
                        for (let i = 0; i < 12; i++) {
                            if (buffer[i] !== undefined) {
                                bytes.push(buffer[i]);
                            }
                        }
                        if (bytes.length === 12) {
                            hexString = bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
                        }
                    } else {
                        // Try toString() as fallback
                        hexString = orgId.toString();
                    }
                    
                    if (hexString !== '[object Object]' && hexString.length === 24) {
                        return hexString;
                    }
                }
                // Check for populated object with _id or id
                const id = orgId._id || orgId.id;
                return id ? id.toString() : null;
            }
            // If it's a string ID
            if (typeof orgId === 'string') {
                return orgId;
            }
            // If it's an ObjectId or other type, convert to string safely
            if (orgId.toString && typeof orgId.toString === 'function') {
                const stringId = orgId.toString();
                // Avoid returning '[object Object]' and check for reasonable length
                if (stringId !== '[object Object]' && stringId.length >= 12) {
                    return stringId;
                }
            }
        }

        return null;
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
    },
    
    /**
     * Debug organization ID extraction
     * @param {Object} user - User object
     * @returns {Object} Debug information about organization ID extraction
     */
    debugOrganizationId: (user) => {
        if (!user) {
            return { error: 'No user provided' };
        }

        const debug = {
            userRole: user.role,
            hasOrganizationId: !!user.organizationId,
            organizationIdType: typeof user.organizationId,
            organizationIdValue: user.organizationId,
            hasRecruiterProfile: !!user.recruiterProfile,
            recruiterProfileOrgId: user.recruiterProfile?.organizationId,
            recruiterProfileOrgIdType: typeof user.recruiterProfile?.organizationId,
            extractedId: null,
            extractionMethod: null
        };

        // Try the same extraction logic as getOrganizationId
        if (user.organizationId) {
            if (typeof user.organizationId === 'object' && user.organizationId !== null) {
                const id = user.organizationId._id || user.organizationId.id;
                if (id) {
                    debug.extractedId = id.toString();
                    debug.extractionMethod = 'user.organizationId object';
                }
            } else if (typeof user.organizationId === 'string') {
                debug.extractedId = user.organizationId;
                debug.extractionMethod = 'user.organizationId string';
            } else if (user.organizationId.toString && typeof user.organizationId.toString === 'function') {
                const stringId = user.organizationId.toString();
                if (stringId !== '[object Object]') {
                    debug.extractedId = stringId;
                    debug.extractionMethod = 'user.organizationId toString()';
                }
            }
        }

        if (!debug.extractedId && user.recruiterProfile?.organizationId) {
            const orgId = user.recruiterProfile.organizationId;
            if (typeof orgId === 'object' && orgId !== null) {
                const id = orgId._id || orgId.id;
                if (id) {
                    debug.extractedId = id.toString();
                    debug.extractionMethod = 'recruiterProfile.organizationId object';
                }
            } else if (typeof orgId === 'string') {
                debug.extractedId = orgId;
                debug.extractionMethod = 'recruiterProfile.organizationId string';
            } else if (orgId.toString && typeof orgId.toString === 'function') {
                const stringId = orgId.toString();
                if (stringId !== '[object Object]') {
                    debug.extractedId = stringId;
                    debug.extractionMethod = 'recruiterProfile.organizationId toString()';
                }
            }
        }

        return debug;
    },
};

export default UserIdUtils;
