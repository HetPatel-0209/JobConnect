/**
 * Enhanced cache service for API responses with real-time updates
 * Helps prevent unnecessary API calls and improves performance
 */

class CacheService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.pendingRequests = new Map(); // Track pending requests to prevent duplicates
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
        this.subscribers = new Map(); // Track components subscribed to cache updates
        this.lastUpdated = new Map(); // Track when each cache entry was last updated
        this.dependencies = new Map(); // Track cache dependencies for smart invalidation
        this.hitCount = new Map(); // Track cache hit counts for analytics
        this.missCount = new Map(); // Track cache miss counts for analytics
        this.realtimeUpdates = new Map(); // Track real-time update handlers
    }

    /**
     * Set cache entry with optional TTL and dependencies
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds (optional)
     * @param {Array<string>} dependencies - Cache keys this entry depends on
     */
    set(key, data, ttl = this.defaultTTL, dependencies = []) {
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + ttl);
        this.lastUpdated.set(key, Date.now());

        // Set up dependencies
        if (dependencies.length > 0) {
            this.dependencies.set(key, dependencies);
        }

        // Notify subscribers of cache update
        this.notifySubscribers(key, data);

        // Track cache analytics
        this.hitCount.set(key, (this.hitCount.get(key) || 0));
        this.missCount.set(key, (this.missCount.get(key) || 0));
    }

    /**
     * Get cache entry if not expired
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null if expired/not found
     */
    get(key) {
        if (!this.cache.has(key)) {
            // Track cache miss
            this.missCount.set(key, (this.missCount.get(key) || 0) + 1);
            return null;
        }

        const expiry = this.cacheExpiry.get(key);
        if (Date.now() > expiry) {
            // Cache expired, remove it
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            this.lastUpdated.delete(key);
            this.dependencies.delete(key);
            // Track cache miss
            this.missCount.set(key, (this.missCount.get(key) || 0) + 1);
            return null;
        }

        // Track cache hit
        this.hitCount.set(key, (this.hitCount.get(key) || 0) + 1);
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
     * Remove specific cache entry and notify subscribers
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        this.lastUpdated.delete(key);
        this.dependencies.delete(key);
        this.hitCount.delete(key);
        this.missCount.delete(key);

        // Notify subscribers of cache deletion
        this.notifySubscribers(key, null, 'deleted');

        // Invalidate dependent cache entries
        this.invalidateDependents(key);
    }    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.cacheExpiry.clear();
        this.lastUpdated.clear();
        this.dependencies.clear();
        this.hitCount.clear();
        this.missCount.clear();
        this.subscribers.clear();
        this.realtimeUpdates.clear();
        this.pendingRequests.clear(); // Also clear pending requests
        console.log('Cache cleared completely');
    }

    /**
     * Clear cache entries by pattern
     * @param {string} pattern - Pattern to match keys
     */
    clearByPattern(pattern) {
        const regex = new RegExp(pattern);
        let clearedCount = 0;
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.delete(key);
                clearedCount++;
            }
        }
        if (clearedCount > 0) {
            console.log(`Cleared ${clearedCount} cache entries matching pattern: ${pattern}`);
        }
    }

    /**
     * Get comprehensive cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        const totalHits = Array.from(this.hitCount.values()).reduce((sum, hits) => sum + hits, 0);
        const totalMisses = Array.from(this.missCount.values()).reduce((sum, misses) => sum + misses, 0);
        const hitRate = totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0;

        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            totalHits,
            totalMisses,
            hitRate: hitRate.toFixed(2) + '%',
            subscribers: this.subscribers.size,
            dependencies: this.dependencies.size,
            realtimeHandlers: this.realtimeUpdates.size
        };
    }    /**
     * Execute a function with request deduplication
     * If the same request is already pending, return the existing promise
     * @param {string} key - Request key
     * @param {Function} requestFn - Function that returns a promise
     * @returns {Promise} The request promise
     */
    async getOrFetch(key, requestFn) {
        console.log('🎯 Cache getOrFetch called:', { key });

        // Check cache first
        const cached = this.get(key);
        if (cached) {
            console.log('✅ Cache hit for key:', key);
            return cached;
        }

        console.log('❌ Cache miss for key:', key);

        // Check if request is already pending
        if (this.pendingRequests.has(key)) {
            console.log('⏳ Request already pending for key:', key);
            return this.pendingRequests.get(key);
        }

        console.log('🚀 Starting new request for key:', key);

        // Create new request
        const requestPromise = requestFn().then(result => {
            console.log('✅ Request completed for key:', key, result);
            // Only cache the result if it's valid (not undefined or null)
            if (result !== undefined && result !== null) {
                this.set(key, result);
                console.log('💾 Result cached for key:', key);
            } else {
                console.log('⚠️ Result not cached (null/undefined) for key:', key);
            }
            // Remove from pending requests
            this.pendingRequests.delete(key);
            return result;
        }).catch(error => {
            console.error('❌ Request failed for key:', key, error);
            // Remove from pending requests on error
            this.pendingRequests.delete(key);
            throw error;
        });

        // Store pending request
        this.pendingRequests.set(key, requestPromise);
        return requestPromise;
    }

    /**
     * Subscribe to cache updates for specific keys
     * @param {string|Array<string>} keys - Cache key(s) to subscribe to
     * @param {Function} callback - Callback function to call on updates
     * @returns {Function} Unsubscribe function
     */
    subscribe(keys, callback) {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        const subscriptionId = Date.now() + Math.random();

        keyArray.forEach(key => {
            if (!this.subscribers.has(key)) {
                this.subscribers.set(key, new Map());
            }
            this.subscribers.get(key).set(subscriptionId, callback);
        });

        // Return unsubscribe function
        return () => {
            keyArray.forEach(key => {
                if (this.subscribers.has(key)) {
                    this.subscribers.get(key).delete(subscriptionId);
                    if (this.subscribers.get(key).size === 0) {
                        this.subscribers.delete(key);
                    }
                }
            });
        };
    }

    /**
     * Notify subscribers of cache updates
     * @param {string} key - Cache key that was updated
     * @param {any} data - New data
     * @param {string} action - Action type (updated, deleted)
     */
    notifySubscribers(key, data, action = 'updated') {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => {
                try {
                    callback({ key, data, action, timestamp: Date.now() });
                } catch (error) {
                    console.error('Error in cache subscriber callback:', error);
                }
            });
        }
    }

    /**
     * Invalidate cache entries that depend on the given key
     * @param {string} key - Cache key that changed
     */
    invalidateDependents(key) {
        for (const [cacheKey, dependencies] of this.dependencies.entries()) {
            if (dependencies.includes(key)) {
                this.delete(cacheKey);
            }
        }
    }

    /**
     * Update cache entry with real-time data
     * @param {string} key - Cache key
     * @param {any} newData - New data to merge/replace
     * @param {boolean} merge - Whether to merge with existing data
     */
    updateRealtime(key, newData, merge = true) {
        if (this.cache.has(key)) {
            const existingData = this.cache.get(key);
            const updatedData = merge && typeof existingData === 'object' && typeof newData === 'object'
                ? { ...existingData, ...newData }
                : newData;

            // Update cache without changing expiry
            this.cache.set(key, updatedData);
            this.lastUpdated.set(key, Date.now());

            // Notify subscribers
            this.notifySubscribers(key, updatedData, 'realtime_update');
        }
    }

    /**
     * Register a real-time update handler for specific cache patterns
     * @param {string} pattern - Cache key pattern (regex)
     * @param {Function} handler - Handler function for real-time updates
     */
    registerRealtimeHandler(pattern, handler) {
        this.realtimeUpdates.set(pattern, handler);
    }

    /**
     * Process real-time update for matching cache entries
     * @param {string} eventType - Type of real-time event
     * @param {any} eventData - Event data
     */
    processRealtimeUpdate(eventType, eventData) {
        for (const [pattern, handler] of this.realtimeUpdates.entries()) {
            try {
                handler(eventType, eventData, this);
            } catch (error) {
                console.error('Error in real-time update handler:', error);
            }
        }
    }

    /**
     * Warm cache with fresh data for specific keys
     * @param {Array<string>} keys - Cache keys to warm
     * @param {Function} fetchFunction - Function to fetch fresh data
     */
    async warmCache(keys, fetchFunction) {
        const promises = keys.map(async (key) => {
            try {
                const data = await fetchFunction(key);
                this.set(key, data);
                return { key, success: true };
            } catch (error) {
                console.error(`Failed to warm cache for key ${key}:`, error);
                return { key, success: false, error };
            }
        });

        return Promise.allSettled(promises);
    }

    /**
     * Get cache entry age in milliseconds
     * @param {string} key - Cache key
     * @returns {number|null} Age in milliseconds or null if not found
     */
    getAge(key) {
        const lastUpdated = this.lastUpdated.get(key);
        return lastUpdated ? Date.now() - lastUpdated : null;
    }

    /**
     * Check if cache entry is stale (older than specified age)
     * @param {string} key - Cache key
     * @param {number} maxAge - Maximum age in milliseconds
     * @returns {boolean} True if stale
     */
    isStale(key, maxAge) {
        const age = this.getAge(key);
        return age !== null && age > maxAge;
    }
}

// Create singleton instance
const cacheService = new CacheService();

// Enhanced cache key generators for different data types
export const CacheKeys = {
    // User dashboard data
    USER_PROFILE: (userId) => `user_profile_${userId}`,
    USER_STATS: (userId) => `user_stats_${userId}`,
    USER_APPLIED_JOBS: (userId, page = 1) => `user_applied_jobs_${userId}_${page}`,
    USER_RECOMMENDED_JOBS: (userId, page = 1) => `user_recommended_jobs_${userId}_${page}`,
    USER_SAVED_JOBS: (userId, page = 1) => `user_saved_jobs_${userId}_${page}`,
    USER_RESUMES: (userId) => `user_resumes_${userId}`,
    USER_ACTIVE_RESUME: (userId) => `user_active_resume_${userId}`,

    // Recruiter dashboard data
    RECRUITER_JOBS: (userId, page = 1) => `recruiter_jobs_${userId}_${page}`,
    RECRUITER_STATS: (userId) => `recruiter_stats_${userId}`,
    RECRUITER_ANALYTICS: (userId, filters = {}) => {
        const filterStr = Object.keys(filters).length > 0 ?
            '_' + Object.entries(filters).map(([k, v]) => `${k}:${v}`).join('_') : '';
        return `recruiter_analytics_${userId}${filterStr}`;
    },

    // Job data
    ALL_JOBS: (page = 1, filters = {}) => {
        // Create a stable filter string by sorting keys and handling null/undefined values
        const filterEntries = Object.entries(filters)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`);

        const filterStr = filterEntries.length > 0 ? '_' + filterEntries.join('_') : '';
        return `all_jobs_${page}${filterStr}`;
    },
    JOB_DETAILS: (jobId) => `job_details_${jobId}`,
    JOB_ANALYTICS: (jobId) => `job_analytics_${jobId}`,
    JOB_APPLICATIONS: (jobId) => `job_applications_${jobId}`,
    JOB_ATS_SCORE: (jobId, userId) => `job_ats_score_${jobId}_${userId}`,
    JOB_SAVED_STATUS: (jobId, userId) => `job_saved_status_${jobId}_${userId}`,

    // Organization data
    ORGANIZATIONS: (page = 1, filters = {}) => {
        const searchParam = filters.search ? `_search_${filters.search}` : '';
        return `organizations_${page}${searchParam}`;
    },
    ORGANIZATION_DETAILS: (orgId) => `organization_${orgId}`,
    ORGANIZATION_JOBS: (orgId, page = 1) => `organization_jobs_${orgId}_${page}`,

    // Chat data
    USER_CHATS: (userId) => `user_chats_${userId}`,
    CHAT_MESSAGES: (chatId, page = 1) => `chat_messages_${chatId}_${page}`,
    CHAT_STATS: (userId) => `chat_stats_${userId}`,
    CHAT_UNREAD_COUNT: (userId) => `chat_unread_count_${userId}`,

    // Application data
    APPLICATION_DETAILS: (applicationId) => `application_details_${applicationId}`,
    USER_APPLICATIONS: (userId, page = 1) => `user_applications_${userId}_${page}`,
};

// Enhanced cache invalidation helpers with smart dependencies
export const CacheInvalidation = {    // Invalidate user-related cache when profile changes
    invalidateUserCache: (userId) => {
        cacheService.clearByPattern(`user_.*_${userId}`);
        // Also invalidate job recommendations since they depend on user profile
        cacheService.clearByPattern(`user_recommended_jobs_${userId}_.*`);
    },

    // Invalidate only profile-specific cache (more targeted)
    invalidateUserProfile: (userId) => {
        cacheService.delete(CacheKeys.USER_PROFILE(userId));
        cacheService.delete(CacheKeys.USER_STATS(userId));
        // Only invalidate job recommendations since they depend on user profile/skills
        cacheService.clearByPattern(`user_recommended_jobs_${userId}_.*`);
    },

    // Invalidate recruiter cache when jobs change
    invalidateRecruiterCache: (userId) => {
        cacheService.clearByPattern(`recruiter_.*_${userId}`);
    },

    // Invalidate job cache when jobs are updated
    invalidateJobCache: () => {
        cacheService.clearByPattern('all_jobs_.*');
        cacheService.clearByPattern('job_details_.*');
        cacheService.clearByPattern('job_analytics_.*');
        cacheService.clearByPattern('job_applications_.*');
    },

    // Invalidate specific job and related data
    invalidateJob: (jobId) => {
        cacheService.delete(CacheKeys.JOB_DETAILS(jobId));
        cacheService.delete(CacheKeys.JOB_ANALYTICS(jobId));
        cacheService.delete(CacheKeys.JOB_APPLICATIONS(jobId));
        cacheService.clearByPattern(`job_ats_score_${jobId}_.*`);
        cacheService.clearByPattern(`job_saved_status_${jobId}_.*`);
    },

    // Invalidate chat cache when messages change
    invalidateChatCache: (userId) => {
        cacheService.clearByPattern(`user_chats_${userId}`);
        cacheService.clearByPattern(`chat_messages_.*`);
        cacheService.clearByPattern(`chat_stats_${userId}`);
        cacheService.delete(CacheKeys.CHAT_UNREAD_COUNT(userId));
    },

    // Invalidate specific chat messages
    invalidateChatMessages: (chatId) => {
        cacheService.clearByPattern(`chat_messages_${chatId}_.*`);
    },

    // Invalidate application-related cache
    invalidateApplicationCache: (userId, jobId = null) => {
        cacheService.clearByPattern(`user_applied_jobs_${userId}_.*`);
        cacheService.clearByPattern(`user_applications_${userId}_.*`);
        cacheService.delete(CacheKeys.USER_STATS(userId));

        if (jobId) {
            cacheService.delete(CacheKeys.JOB_APPLICATIONS(jobId));
            cacheService.clearByPattern(`job_ats_score_${jobId}_.*`);
        }
    },

    // Invalidate organization-related cache
    invalidateOrganizationCache: (orgId) => {
        cacheService.delete(CacheKeys.ORGANIZATION_DETAILS(orgId));
        cacheService.clearByPattern(`organization_jobs_${orgId}_.*`);
        cacheService.clearByPattern('organizations_.*');
    },

    // Smart invalidation based on event type
    invalidateByEvent: (eventType, data) => {
        switch (eventType) {
            case 'job_applied':
                CacheInvalidation.invalidateApplicationCache(data.userId, data.jobId);
                break;
            case 'job_posted':
                CacheInvalidation.invalidateJobCache();
                CacheInvalidation.invalidateRecruiterCache(data.recruiterId);
                break;
            case 'job_updated':
                CacheInvalidation.invalidateJob(data.jobId);
                break; case 'profile_updated':
                CacheInvalidation.invalidateUserProfile(data.userId);
                break;
            case 'message_sent':
                CacheInvalidation.invalidateChatCache(data.senderId);
                CacheInvalidation.invalidateChatCache(data.recipientId);
                break;
            case 'resume_uploaded':
                cacheService.delete(CacheKeys.USER_RESUMES(data.userId));
                cacheService.delete(CacheKeys.USER_ACTIVE_RESUME(data.userId));
                break;
            default:
                console.log('Unknown event type for cache invalidation:', eventType);
        }
    }
};

export default cacheService;
