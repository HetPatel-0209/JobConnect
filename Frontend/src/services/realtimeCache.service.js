import cacheService, { CacheKeys, CacheInvalidation } from './cache.service';
import socketService from './socket.service';

/**
 * Real-time cache update service that syncs cache with Socket.io events
 */
class RealtimeCacheService {
    constructor() {
        this.isInitialized = false;
        this.eventHandlers = new Map();
        this.socketHandlers = new Map(); // Store socket handler references for cleanup
        // Don't initialize automatically - wait for explicit initialization
    }

    /**
     * Initialize real-time cache updates
     */
    initialize() {
        if (this.isInitialized) return;

        // Register real-time update handlers with cache service
        this.registerCacheHandlers();
        
        // Set up socket event listeners
        this.setupSocketListeners();
        
        this.isInitialized = true;
        console.log('Real-time cache service initialized');
    }

    /**
     * Register cache update handlers for different data types
     */
    registerCacheHandlers() {
        // Job-related updates
        cacheService.registerRealtimeHandler('job_.*', (eventType, eventData, cache) => {
            this.handleJobUpdates(eventType, eventData, cache);
        });

        // User-related updates
        cacheService.registerRealtimeHandler('user_.*', (eventType, eventData, cache) => {
            this.handleUserUpdates(eventType, eventData, cache);
        });

        // Chat-related updates
        cacheService.registerRealtimeHandler('chat_.*', (eventType, eventData, cache) => {
            this.handleChatUpdates(eventType, eventData, cache);
        });

        // Application-related updates
        cacheService.registerRealtimeHandler('application_.*', (eventType, eventData, cache) => {
            this.handleApplicationUpdates(eventType, eventData, cache);
        });
    }

    /**
     * Set up Socket.io event listeners for real-time updates
     */
    setupSocketListeners() {
        // Create and store handler references for cleanup
        const jobPostedHandler = (data) => this.handleJobPosted(data);
        const jobUpdatedHandler = (data) => this.handleJobUpdated(data);
        const jobAppliedHandler = (data) => this.handleJobApplied(data);
        const applicationStatusChangedHandler = (data) => this.handleApplicationStatusChanged(data);
        const profileUpdatedHandler = (data) => this.handleProfileUpdated(data);
        const resumeUploadedHandler = (data) => this.handleResumeUploaded(data);
        const messageReceivedHandler = (data) => this.handleMessageReceived(data);
        const statsUpdatedHandler = (data) => this.handleStatsUpdated(data);

        // Store handlers for cleanup
        this.socketHandlers.set('job_posted', jobPostedHandler);
        this.socketHandlers.set('job_updated', jobUpdatedHandler);
        this.socketHandlers.set('job_applied', jobAppliedHandler);
        this.socketHandlers.set('application_status_changed', applicationStatusChangedHandler);
        this.socketHandlers.set('profile_updated', profileUpdatedHandler);
        this.socketHandlers.set('resume_uploaded', resumeUploadedHandler);
        this.socketHandlers.set('receive_message', messageReceivedHandler);
        this.socketHandlers.set('stats_updated', statsUpdatedHandler);

        // Register socket event listeners
        socketService.on('job_posted', jobPostedHandler);
        socketService.on('job_updated', jobUpdatedHandler);
        socketService.on('job_applied', jobAppliedHandler);
        socketService.on('application_status_changed', applicationStatusChangedHandler);
        socketService.on('profile_updated', profileUpdatedHandler);
        socketService.on('resume_uploaded', resumeUploadedHandler);
        socketService.on('receive_message', messageReceivedHandler);
        socketService.on('stats_updated', statsUpdatedHandler);
    }

    /**
     * Handle job-related cache updates
     */
    handleJobUpdates(eventType, eventData, cache) {
        switch (eventType) {
            case 'job_posted':
                // Invalidate job lists
                CacheInvalidation.invalidateJobCache();
                break;
            case 'job_updated':
                // Update specific job cache
                if (eventData.jobId && eventData.jobData) {
                    const jobKey = CacheKeys.JOB_DETAILS(eventData.jobId);
                    cache.updateRealtime(jobKey, eventData.jobData);
                }
                // Also invalidate recruiter cache when job is updated
                if (eventData.recruiterId) {
                    CacheInvalidation.invalidateRecruiterCache(eventData.recruiterId);
                }
                // Invalidate general job cache as well
                CacheInvalidation.invalidateJobCache();
                break;
            case 'job_applied':
                // Update application counts and user stats
                this.updateApplicationStats(eventData);
                break;
        }
    }

    /**
     * Handle user-related cache updates
     */
    handleUserUpdates(eventType, eventData, cache) {
        switch (eventType) {
            case 'profile_updated':
                if (eventData.userId && eventData.profileData) {
                    const profileKey = CacheKeys.USER_PROFILE(eventData.userId);
                    cache.updateRealtime(profileKey, eventData.profileData);
                }
                break;
            case 'resume_uploaded':
                if (eventData.userId) {
                    // Invalidate resume-related cache
                    cache.delete(CacheKeys.USER_RESUMES(eventData.userId));
                    cache.delete(CacheKeys.USER_ACTIVE_RESUME(eventData.userId));
                    // Invalidate ATS scores since resume changed
                    cache.clearByPattern(`job_ats_score_.*_${eventData.userId}`);
                }
                break;
        }
    }

    /**
     * Handle chat-related cache updates
     */
    handleChatUpdates(eventType, eventData, cache) {
        switch (eventType) {
            case 'message_received':
                if (eventData.userId) {
                    // Update unread count
                    const unreadKey = CacheKeys.CHAT_UNREAD_COUNT(eventData.userId);
                    const currentCount = cache.get(unreadKey) || { count: 0 };
                    cache.updateRealtime(unreadKey, { count: currentCount.count + 1 });
                }
                break;
        }
    }

    /**
     * Handle application-related cache updates
     */
    handleApplicationUpdates(eventType, eventData, cache) {
        switch (eventType) {
            case 'application_submitted':
                if (eventData.userId && eventData.jobId) {
                    // Invalidate user applications
                    cache.clearByPattern(`user_applied_jobs_${eventData.userId}_.*`);
                    cache.clearByPattern(`user_applications_${eventData.userId}_.*`);
                    
                    // Update user stats
                    const statsKey = CacheKeys.USER_STATS(eventData.userId);
                    const currentStats = cache.get(statsKey) || {};
                    cache.updateRealtime(statsKey, {
                        ...currentStats,
                        appliedJobs: (currentStats.appliedJobs || 0) + 1
                    });
                }
                break;
        }
    }

    /**
     * Handle job posted event
     */
    handleJobPosted(data) {
        console.log('Real-time: Job posted', data);
        
        // Invalidate job lists
        CacheInvalidation.invalidateJobCache();
        
        // Update recruiter stats if available
        if (data.recruiterId) {
            CacheInvalidation.invalidateRecruiterCache(data.recruiterId);
        }

        // Process through cache service
        cacheService.processRealtimeUpdate('job_posted', data);
    }

    /**
     * Handle job updated event
     */
    handleJobUpdated(data) {
        console.log('Real-time: Job updated', data);

        // Update specific job cache
        if (data.jobId) {
            CacheInvalidation.invalidateJob(data.jobId);

            // If we have the updated job data, update cache directly
            if (data.jobData) {
                const jobKey = CacheKeys.JOB_DETAILS(data.jobId);
                cacheService.updateRealtime(jobKey, data.jobData);
            }
        }

        // Also invalidate recruiter cache when job is updated
        if (data.recruiterId) {
            CacheInvalidation.invalidateRecruiterCache(data.recruiterId);
        }

        // Invalidate general job cache as well
        CacheInvalidation.invalidateJobCache();

        cacheService.processRealtimeUpdate('job_updated', data);
    }

    /**
     * Handle job application event
     */
    handleJobApplied(data) {
        console.log('Real-time: Job applied', data);
        
        if (data.userId && data.jobId) {
            // Invalidate user application cache
            CacheInvalidation.invalidateApplicationCache(data.userId, data.jobId);
        }

        cacheService.processRealtimeUpdate('job_applied', data);
    }

    /**
     * Handle application status change
     */
    handleApplicationStatusChanged(data) {
        console.log('Real-time: Application status changed', data);

        if (data.applicationId && data.userId) {
            // Update application cache
            const appKey = CacheKeys.APPLICATION_DETAILS(data.applicationId);
            if (data.applicationData) {
                cacheService.updateRealtime(appKey, data.applicationData);
            }

            // Invalidate user applications list
            cacheService.clearByPattern(`user_applications_${data.userId}_.*`);
            cacheService.clearByPattern(`user_applied_jobs_${data.userId}_.*`);

            // Invalidate user stats cache to refresh interview count
            const userStatsKey = CacheKeys.USER_STATS(data.userId);
            cacheService.delete(userStatsKey);
            console.log(`🗑️ Invalidated user stats cache for user ${data.userId} due to application status change`);
        }

        cacheService.processRealtimeUpdate('application_status_changed', data);
    }

    /**
     * Handle profile updated event
     */
    handleProfileUpdated(data) {
        console.log('Real-time: Profile updated', data);
        
        if (data.userId) {
            CacheInvalidation.invalidateUserCache(data.userId);
            
            // If we have the updated profile data, update cache directly
            if (data.profileData) {
                const profileKey = CacheKeys.USER_PROFILE(data.userId);
                cacheService.updateRealtime(profileKey, data.profileData);
            }
        }

        cacheService.processRealtimeUpdate('profile_updated', data);
    }

    /**
     * Handle resume uploaded event
     */
    handleResumeUploaded(data) {
        console.log('Real-time: Resume uploaded', data);
        
        if (data.userId) {
            // Invalidate resume-related cache
            cacheService.delete(CacheKeys.USER_RESUMES(data.userId));
            cacheService.delete(CacheKeys.USER_ACTIVE_RESUME(data.userId));
            
            // Invalidate ATS scores since resume changed
            cacheService.clearByPattern(`job_ats_score_.*_${data.userId}`);
        }

        cacheService.processRealtimeUpdate('resume_uploaded', data);
    }

    /**
     * Handle message received event
     */
    handleMessageReceived(data) {
        // Update chat stats
        if (data.recipientId) {
            const unreadKey = CacheKeys.CHAT_UNREAD_COUNT(data.recipientId);
            const currentCount = cacheService.get(unreadKey) || { count: 0 };
            cacheService.updateRealtime(unreadKey, { count: currentCount.count + 1 });
        }

        cacheService.processRealtimeUpdate('message_received', data);
    }

    /**
     * Handle stats updated event
     */
    handleStatsUpdated(data) {
        console.log('Real-time: Stats updated', data);
        
        if (data.userId && data.stats) {
            const statsKey = CacheKeys.USER_STATS(data.userId);
            cacheService.updateRealtime(statsKey, data.stats);
        }

        if (data.recruiterId && data.recruiterStats) {
            const recruiterStatsKey = CacheKeys.RECRUITER_STATS(data.recruiterId);
            cacheService.updateRealtime(recruiterStatsKey, data.recruiterStats);
        }

        cacheService.processRealtimeUpdate('stats_updated', data);
    }

    /**
     * Update application statistics in cache
     */
    updateApplicationStats(data) {
        if (data.userId) {
            const statsKey = CacheKeys.USER_STATS(data.userId);
            const currentStats = cacheService.get(statsKey) || {};
            
            cacheService.updateRealtime(statsKey, {
                ...currentStats,
                appliedJobs: (currentStats.appliedJobs || 0) + 1
            });
        }
    }

    /**
     * Cleanup event listeners
     */
    cleanup() {
        if (!this.isInitialized) return;

        // Remove socket listeners using stored handler references
        for (const [eventName, handler] of this.socketHandlers.entries()) {
            socketService.off(eventName, handler);
        }

        // Clear handler maps
        this.socketHandlers.clear();
        this.eventHandlers.clear();

        this.isInitialized = false;
        console.log('Real-time cache service cleaned up');
    }
}

// Create singleton instance
const realtimeCacheService = new RealtimeCacheService();

export default realtimeCacheService;
