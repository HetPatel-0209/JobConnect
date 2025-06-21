import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { JobService } from '../../../services/job.service';
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
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '', // No start date filter by default
    endDate: '' // No end date filter by default
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading analytics with date range:', dateRange);
      const response = await JobService.getRecruiterAnalytics(dateRange);
      console.log('Analytics response:', response);

      if (response.success) {
        setAnalytics(response.data);
        console.log('Analytics data set:', response.data);
      } else {
        console.error('Analytics response not successful:', response);
        setError(response.message || 'Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

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
                  {analytics?.jobsOverTime?.filter(job => job.status === 'active')?.length || 0}
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
                {analytics.jobsOverTime.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {item._id.month}/{item._id.year}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((item.count / Math.max(...analytics.jobsOverTime.map(j => j.count))) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
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
                {analytics.applicationsOverTime.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {item._id.month}/{item._id.year}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((item.count / Math.max(...analytics.applicationsOverTime.map(a => a.count))) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
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
                <div key={job.jobId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                    onClick={() => window.open(`/job/${job.jobId}/analytics`, '_blank')}
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
