import React from 'react';
import { Link } from 'react-router-dom';
import { JobService } from '../../../services/job.service';
import { useSmartPaginatedFetch } from '../../../hooks/useSmartFetch';
import { CacheKeys } from '../../../services/cache.service';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Bookmark,
  BookmarkX,
  MapPin,
  Clock,
  DollarSign,
  Building,
  ExternalLink,
  Loader2,
  AlertCircle,
  Heart,
  Briefcase
} from 'lucide-react';

const SavedJobs = () => {
  const { user } = useAuth();

  // Smart paginated fetch for saved jobs
  const {
    data: savedJobs,
    pagination,
    loading,
    error: fetchError,
    page: currentPage,
    setPage: setCurrentPage,
    refetch: loadSavedJobs
  } = useSmartPaginatedFetch(
    (page) => user ? CacheKeys.USER_SAVED_JOBS(user.id || user.id, page) : null,
    ({ page }) => JobService.getSavedJobs({ page, limit: 10 }),
    {
      enabled: !!user,
      ttl: 3 * 60 * 1000, // 3 minutes cache
      realtime: true,
      onSuccess: (data) => {
        console.log('Saved jobs loaded:', data);
      },
      onError: (err) => {
        console.error('Failed to load saved jobs:', err);
      }
    }
  );

  // Handle response structure - extract savedJobs from response
  const actualSavedJobs = savedJobs?.data?.savedJobs || savedJobs?.savedJobs || savedJobs || [];
  const error = fetchError || (!savedJobs?.success && savedJobs?.message ? savedJobs.message : null);

  const handleUnsaveJob = async (jobId) => {
    try {
      await JobService.unsaveJob(jobId);
      // The smart cache will automatically update the saved jobs list
      // No need to manually update state - real-time cache updates handle this
      loadSavedJobs(); // Refresh the data
    } catch (err) {
      console.error(err);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salary not disclosed';
    
    const formatAmount = (amount) => {
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
      return amount.toString();
    };

    if (salary.min && salary.max) {
      return `₹${formatAmount(salary.min)} - ₹${formatAmount(salary.max)}`;
    } else if (salary.min) {
      return `₹${formatAmount(salary.min)}+`;
    } else if (salary.max) {
      return `Up to ₹${formatAmount(salary.max)}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Saved today';
    if (diffDays <= 7) return `Saved ${diffDays} days ago`;
    return `Saved on ${date.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your saved jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Saved Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadSavedJobs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
          </div>
          <p className="text-gray-600">
            {actualSavedJobs.length > 0
              ? `You have ${pagination?.total || actualSavedJobs.length} saved job${(pagination?.total || actualSavedJobs.length) !== 1 ? 's' : ''}`
              : 'No saved jobs yet'
            }
          </p>
        </div>

        {/* Jobs List */}
        {actualSavedJobs.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Jobs</h3>
            <p className="text-gray-600 mb-6">
              Start saving jobs you're interested in to view them here.
            </p>
            <Link 
              to="/user/job-dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {actualSavedJobs.map((savedJob) => {
              const job = savedJob.job;
              return (
                <div key={savedJob.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Job Title and Company */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="w-4 h-4" />
                            <span>{job.organization?.name || 'Company Name'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnsaveJob(job._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from saved jobs"
                        >
                          <BookmarkX className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Job Details */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatSalary(job.salary)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(savedJob.savedAt)}</span>
                        </div>
                      </div>

                      {/* Job Description Preview */}
                      {job.description && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                          {job.description.substring(0, 150)}...
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Link
                          to={`/job/${job._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Details
                        </Link>
                        <Link
                          to={`/job/${job._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {Array.from({ length: pagination?.pages || 1 }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
