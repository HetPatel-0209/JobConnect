import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { JobService } from '../../../services/job.service';
import { useSmartFetch } from '../../../hooks/useSmartFetch';
import { CacheKeys } from '../../../services/cache.service';
import { safeExtractId } from '../../../utils/debugUtils';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  Eye,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: '', // No start date filter by default
    endDate: '' // No end date filter by default
  });
  const navigate = useNavigate();
  // Memoize cache key to prevent unnecessary re-renders
  const cacheKey = useMemo(() => {
    const userId = user?.id || user?._id;
    if (!userId) return null;
    return CacheKeys.RECRUITER_ANALYTICS(userId, dateRange);
  }, [user?.id, user?._id, dateRange]);

  // Smart fetch for analytics data
  const {
    data: analyticsResponse,
    loading,
    error: fetchError,
    refetch: loadAnalytics
  } = useSmartFetch(
    cacheKey,
    () => JobService.getRecruiterAnalytics(dateRange),
    {
      enabled: !!user && !!cacheKey,
      ttl: 5 * 60 * 1000, // 5 minutes cache
      dependencies: [dateRange],
      onSuccess: (data) => {
        console.log('Analytics data loaded:', data);
      },
      onError: (err) => {
        console.error('Failed to load analytics:', err);
      }
    }
  );

  // Extract analytics data and handle response structure
  const analytics = analyticsResponse?.success ? analyticsResponse.data : analyticsResponse;
  const error = fetchError || (!analyticsResponse?.success ? analyticsResponse?.message : null);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto mt-20">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your recruitment performance and insights</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date Range Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadAnalytics}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs Posted</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.summary?.totalJobs || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.summary?.totalApplications || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Applications/Job</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.summary?.totalJobs > 0
                    ? Math.round((analytics?.summary?.totalApplications || 0) / analytics.summary.totalJobs)
                    : 0
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.summary?.activeJobs || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Jobs Over Time Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Jobs Posted Over Time
            </h3>

            {analytics?.jobsOverTime?.length > 0 ? (
              <div className="space-y-3">
                {analytics.jobsOverTime.map((item, index) => {
                  // Handle both possible data structures: item.id or item._id
                  const timeData = item._id || item.id || {};
                  const month = timeData.month || 'N/A';
                  const year = timeData.year || 'N/A';

                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {month}/{year}
                      </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(() => {
                              const maxCount = Math.max(...analytics.jobsOverTime.map(j => j.count || 0));
                              if (maxCount <= 0) return 0;
                              return Math.min((item.count / maxCount) * 100, 100);
                            })()}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available for the selected period
              </div>
            )}
          </div>

          {/* Applications Over Time Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Applications Over Time
            </h3>

            {analytics?.applicationsOverTime?.length > 0 ? (
              <div className="space-y-3">
                {analytics.applicationsOverTime.map((item, index) => {
                  // Handle both possible data structures: item.id or item._id
                  const timeData = item._id || item.id || {};
                  const month = timeData.month || 'N/A';
                  const year = timeData.year || 'N/A';

                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {month}/{year}
                      </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(() => {
                              const maxCount = Math.max(...analytics.applicationsOverTime.map(a => a.count || 0));
                              if (maxCount <= 0) return 0;
                              return Math.min((item.count / maxCount) * 100, 100);
                            })()}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top Performing Jobs
          </h3>

          {analytics?.topJobs?.length > 0 ? (
            <div className="space-y-4">
              {analytics.topJobs.map((job, index) => (
                <div key={safeExtractId(job.jobId) || `job-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.applicationCount} applications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/job/${safeExtractId(job.jobId) || job.jobId}/analytics`)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No job performance data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
