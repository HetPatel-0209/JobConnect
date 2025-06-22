/**
 * Simple cache service for API responses
 * Helps prevent unnecessary API calls and improves performance
 */

class CacheService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.pendingRequests = new Map(); // Track pending requests to prevent duplicates
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
    }

    /**
     * Set cache entry with optional TTL
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + ttl);
    }

    /**
     * Get cache entry if not expired
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null if expired/not found
     */
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const expiry = this.cacheExpiry.get(key);
        if (Date.now() > expiry) {
            // Cache expired, remove it
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return null;
        }

        return this.cache.get(key);
    }

    /**
     * Check if cache has valid entry
     * @param {string} key - Cache key
     * @returns {boolean} True if cache has valid entry
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Remove specific cache entry
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.cacheExpiry.clear();
    }

    /**
     * Clear cache entries by pattern
     * @param {string} pattern - Pattern to match keys
     */
    clearByPattern(pattern) {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Execute a function with request deduplication
     * If the same request is already pending, return the existing promise
     * @param {string} key - Request key
     * @param {Function} requestFn - Function that returns a promise
     * @returns {Promise} The request promise
     */
    async getOrFetch(key, requestFn) {
        // Check cache first
        const cached = this.get(key);
        if (cached) {
            return cached;
        }

        // Check if request is already pending
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }

        // Create new request
        const requestPromise = requestFn().then(result => {
            // Cache the result
            this.set(key, result);
            // Remove from pending requests
            this.pendingRequests.delete(key);
            return result;
        }).catch(error => {
            // Remove from pending requests on error
            this.pendingRequests.delete(key);
            throw error;
        });

        // Store pending request
        this.pendingRequests.set(key, requestPromise);
        return requestPromise;
    }
}

// Create singleton instance
const cacheService = new CacheService();

// Cache key generators for different data types
export const CacheKeys = {
    // User dashboard data
    USER_PROFILE: (userId) => `user_profile_${userId}`,
    USER_STATS: (userId) => `user_stats_${userId}`,
    USER_APPLIED_JOBS: (userId, page = 1) => `user_applied_jobs_${userId}_${page}`,
    USER_RECOMMENDED_JOBS: (userId, page = 1) => `user_recommended_jobs_${userId}_${page}`,

    // Recruiter dashboard data
    RECRUITER_JOBS: (userId, page = 1) => `recruiter_jobs_${userId}_${page}`,
    RECRUITER_STATS: (userId) => `recruiter_stats_${userId}`,

    // Job data
    ALL_JOBS: (page = 1, filters = {}) => {
        const filterStr = Object.keys(filters).length > 0 ?
            '_' + Object.entries(filters).map(([k, v]) => `${k}:${v}`).join('_') : '';
        return `all_jobs_${page}${filterStr}`;
    },
    JOB_DETAILS: (jobId) => `job_details_${jobId}`,

    // Organization data
    ORGANIZATIONS: (page = 1) => `organizations_${page}`,
    ORGANIZATION_DETAILS: (orgId) => `organization_${orgId}`,

    // Chat data
    USER_CHATS: (userId) => `user_chats_${userId}`,
    CHAT_MESSAGES: (chatId, page = 1) => `chat_messages_${chatId}_${page}`,
    CHAT_STATS: (userId) => `chat_stats_${userId}`,
};

// Cache invalidation helpers
export const CacheInvalidation = {
    // Invalidate user-related cache when profile changes
    invalidateUserCache: (userId) => {
        cacheService.clearByPattern(`user_.*_${userId}`);
    },

    // Invalidate recruiter cache when jobs change
    invalidateRecruiterCache: (userId) => {
        cacheService.clearByPattern(`recruiter_.*_${userId}`);
    },

    // Invalidate job cache when jobs are updated
    invalidateJobCache: () => {
        cacheService.clearByPattern('all_jobs_.*');
        cacheService.clearByPattern('job_details_.*');
    },

    // Invalidate specific job
    invalidateJob: (jobId) => {
        cacheService.delete(CacheKeys.JOB_DETAILS(jobId));
    },

    // Invalidate chat cache when messages change
    invalidateChatCache: (userId) => {
        cacheService.clearByPattern(`user_chats_${userId}`);
        cacheService.clearByPattern(`chat_messages_.*`);
        cacheService.clearByPattern(`chat_stats_${userId}`);
    },

    // Invalidate specific chat messages
    invalidateChatMessages: (chatId) => {
        cacheService.clearByPattern(`chat_messages_${chatId}_.*`);
    }
};

export default cacheService;
