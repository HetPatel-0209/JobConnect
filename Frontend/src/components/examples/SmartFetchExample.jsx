import React from 'react';
import { useSmartFetch, useSmartPaginatedFetch } from '../../hooks/useSmartFetch';
import { JobService } from '../../services/job.service';
import { CacheKeys } from '../../services/cache.service';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Example component demonstrating smart fetching patterns
 * This shows how to replace traditional useEffect + API calls with smart caching
 */
const SmartFetchExample = () => {
  const { user } = useAuth();

  // ❌ OLD WAY - Multiple API calls, no caching, re-fetches on every navigation
  /*
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await JobService.getAllJobs();
        setJobs(response.jobs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // This runs every time component mounts
  */

  // ✅ NEW WAY - Smart caching, request deduplication, real-time updates
  const {
    data: jobs,
    loading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
    isStale
  } = useSmartFetch(
    CacheKeys.ALL_JOBS(1, {}), // Cache key
    () => JobService.getAllJobs({ page: 1 }), // Fetch function
    {
      ttl: 5 * 60 * 1000, // Cache for 5 minutes
      staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
      realtime: true, // Subscribe to real-time updates
      onSuccess: (data) => {
        console.log('Jobs loaded from cache or API:', data);
      },
      onError: (error) => {
        console.error('Failed to load jobs:', error);
      }
    }
  );

  // ✅ PAGINATED DATA - Smart pagination with caching
  const {
    data: appliedJobs,
    pagination,
    loading: appliedJobsLoading,
    loadMore,
    page,
    setPage
  } = useSmartPaginatedFetch(
    (page) => CacheKeys.USER_APPLIED_JOBS(user?.id, page),
    ({ page }) => JobService.getAppliedJobs({ page }),
    {
      enabled: !!user,
      ttl: 3 * 60 * 1000,
      realtime: true,
      accumulate: false // Set to true for infinite scroll
    }
  );

  // ✅ USER STATS - Cached with real-time updates
  const {
    data: userStats,
    loading: statsLoading
  } = useSmartFetch(
    user ? CacheKeys.USER_STATS(user.id || user.id) : null,
    () => JobService.getJobseekerStats(),
    {
      enabled: !!user,
      ttl: 2 * 60 * 1000,
      realtime: true // Stats update in real-time when user applies to jobs
    }
  );

  // Benefits of this approach:
  // 1. ✅ No duplicate API calls when navigating between pages
  // 2. ✅ Data persists in cache across component unmounts/mounts
  // 3. ✅ Real-time updates via Socket.io integration
  // 4. ✅ Request deduplication prevents multiple simultaneous calls
  // 5. ✅ Intelligent cache invalidation
  // 6. ✅ Stale data detection and background refresh
  // 7. ✅ Loading states handled automatically
  // 8. ✅ Error handling with retry logic

  const handleApplyJob = async (jobId) => {
    try {
      // The service automatically updates cache and triggers real-time updates
      await JobService.applyForJob(jobId);
      
      // No need to manually refetch data - cache updates automatically!
      // The userStats and appliedJobs will update via real-time cache updates
      
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };

  const handleRefreshJobs = () => {
    // Force refresh from API (bypasses cache)
    refetchJobs(true);
  };

  if (jobsLoading || appliedJobsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Smart Fetch Example</h2>
        
        {/* Cache Status Indicator */}
        {isStale && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Data is stale. Background refresh in progress...
            </p>
          </div>
        )}

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold">Applied Jobs</h3>
              <p className="text-2xl font-bold text-blue-600">{userStats.appliedJobs || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold">Saved Jobs</h3>
              <p className="text-2xl font-bold text-green-600">{userStats.savedJobs || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-semibold">Interviews</h3>
              <p className="text-2xl font-bold text-purple-600">{userStats.interviews || 0}</p>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Available Jobs</h3>
            <button
              onClick={handleRefreshJobs}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Jobs
            </button>
          </div>

          {jobsError && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-800">Error: {jobsError.message}</p>
            </div>
          )}

          <div className="space-y-2">
            {jobs?.jobs?.slice(0, 5).map((job) => (
              <div key={job._id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{job.title}</h4>
                  <p className="text-gray-600">{job.organization?.name}</p>
                </div>
                <button
                  onClick={() => handleApplyJob(job._id)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Applied Jobs with Pagination */}
        {appliedJobs && appliedJobs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Your Applications</h3>
            <div className="space-y-2">
              {appliedJobs.map((application) => (
                <div key={application.id} className="border rounded p-3">
                  <h4 className="font-medium">{application.job?.title}</h4>
                  <p className="text-sm text-gray-600">
                    Status: <span className="capitalize">{application.status}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Performance Benefits</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>✅ Data cached for 5 minutes - no repeated API calls</li>
          <li>✅ Real-time updates via Socket.io</li>
          <li>✅ Request deduplication prevents duplicate calls</li>
          <li>✅ Background refresh when data becomes stale</li>
          <li>✅ Automatic cache invalidation on data changes</li>
          <li>✅ Optimistic UI updates</li>
        </ul>
      </div>
    </div>
  );
};

export default SmartFetchExample;
