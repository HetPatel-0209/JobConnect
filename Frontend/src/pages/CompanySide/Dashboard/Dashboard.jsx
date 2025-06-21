import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  Clock,
  Eye,
  Trash2,
  Calendar,
  TrendingUp,
  MapPin,
  DollarSign,
  Activity,
  AlertCircle,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    jobs: { total: 0, active: 0, draft: 0, closed: 0 },
    applications: { total: 0, pending: 0, reviewed: 0, shortlisted: 0, interview: 0, hired: 0, rejected: 0, newToday: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [updatingJobStatus, setUpdatingJobStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load recruiter's jobs and stats from API
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Load jobs and stats in parallel
        const [jobsResponse, statsResponse] = await Promise.all([
          JobService.getRecruiterJobs(),
          JobService.getRecruiterStats()
        ]);

        setJobs(jobsResponse.jobs || []);
        setStats(statsResponse);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleRemoveJob = async (jobId) => {
    try {
      await JobService.deleteJob(jobId);
      // Remove job from local state
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        jobs: {
          ...prevStats.jobs,
          total: prevStats.jobs.total - 1,
          active: prevStats.jobs.active - 1 // Assuming deleted job was active
        }
      }));
      setShowDeleteConfirm(null);
      setSuccessMessage('Job deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete job');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    setUpdatingJobStatus(jobId);
    try {
      await JobService.updateJob(jobId, { status: newStatus });

      // Update job in local state
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job._id === jobId ? { ...job, status: newStatus } : job
        )
      );

      // Refresh stats to reflect the change
      const statsResponse = await JobService.getRecruiterStats();
      setStats(statsResponse);

      setSuccessMessage(`Job status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update job status');
      setTimeout(() => setError(null), 5000);
    } finally {
      setUpdatingJobStatus(null);
    }
  };

  const activeJobs = stats.jobs.active;
  const totalApplications = stats.applications.total;
  const newTodayCount = stats.applications.newToday;

  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="px-8 py-8 font-['Segoe_UI',_sans-serif] bg-gray-50 mt-16 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, <span className="text-blue-600">{user?.name || 'User'}</span>! 👋
        </h2>
        <p className="text-gray-600 text-lg mb-5">
          Here's what's happening with your job listings today.
        </p>
      </div>

      {error && (
        /* Error State */
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        /* Success State */
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-green-800 font-medium">Success</h3>
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        /* Loading State */
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="flex gap-6 flex-wrap mb-10">
            {/* Active Jobs Card */}
            <div className="flex-1 min-w-[280px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Active Jobs</h3>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-gray-900">{activeJobs}</p>
                <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
              </div>
              <button 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
                onClick={() => navigate('/postjob')}
              >
                <Plus className="w-4 h-4" />
                Post New Job
              </button>
            </div>

            {/* Total Applications Card */}
            <div className="flex-1 min-w-[280px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Total Applications</h3>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-gray-900">{totalApplications}</p>
                <Activity className="w-5 h-5 text-blue-500 mb-2" />
              </div>
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <Clock className="w-4 h-4" />
                {newTodayCount} New Today
              </div>
            </div>
          </div>

          {/* Recent Job Postings Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Job Postings</h3>
              {jobs.length > 0 && (
                <div className="text-sm text-gray-500">
                  {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
                </div>
              )}
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h4>
                <p className="text-gray-600 mb-6">Start by posting your first job to attract talented candidates.</p>
                <button 
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => navigate('/postjob')}
                >
                  <Plus className="w-5 h-5" />
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job._id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg mb-1">{job.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.jobType)}`}>
                              {job.jobType}
                            </span>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary ? `$${job.salary.min?.toLocaleString()} - $${job.salary.max?.toLocaleString()}` : 'Not specified'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Posted: {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-700">{job.applicationCount || 0} applicant{job.applicationCount !== 1 ? 's' : ''}</span>
                            </div>
                            {job.newApplicationsToday > 0 && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-medium">{job.newApplicationsToday} new today</span>
                              </div>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              job.status === 'active' ? 'bg-green-100 text-green-800' :
                              job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => navigate(`/job/${job._id}/applicants`)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        View Applicants ({job.applicationCount || 0})
                      </button>
                      <button
                        onClick={() => navigate(`/job/${job._id}`)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>

                      {/* Status Toggle */}
                      {job.status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(job._id, 'closed')}
                          disabled={updatingJobStatus === job._id}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                        >
                          <Settings className="w-4 h-4" />
                          {updatingJobStatus === job._id ? 'Closing...' : 'Close Job'}
                        </button>
                      ) : job.status === 'closed' ? (
                        <button
                          onClick={() => handleStatusChange(job._id, 'active')}
                          disabled={updatingJobStatus === job._id}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <Settings className="w-4 h-4" />
                          {updatingJobStatus === job._id ? 'Activating...' : 'Reactivate'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(job._id, 'active')}
                          disabled={updatingJobStatus === job._id}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <Settings className="w-4 h-4" />
                          {updatingJobStatus === job._id ? 'Publishing...' : 'Publish'}
                        </button>
                      )}

                      <button
                        onClick={() => setShowDeleteConfirm(job._id)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Section */}
          {!error && stats.applications.total > 0 && (
            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Application Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Pending Review</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.applications.pending}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Reviewed</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.applications.reviewed}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Interviews</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.applications.interview}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Hired</p>
                      <p className="text-2xl font-bold text-green-900">{stats.applications.hired}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Job Status Overview</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Active Jobs</span>
                      </div>
                      <span className="font-semibold text-gray-900">{stats.jobs.active}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-gray-700">Draft Jobs</span>
                      </div>
                      <span className="font-semibold text-gray-900">{stats.jobs.draft}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-gray-700">Closed Jobs</span>
                      </div>
                      <span className="font-semibold text-gray-900">{stats.jobs.closed}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/postjob')}
                      className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-700 font-medium">Post New Job</span>
                    </button>
                    <button
                      onClick={() => navigate('/analytics')}
                      className="w-full flex items-center gap-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="text-purple-700 font-medium">View Detailed Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Job Posting</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job posting? This action cannot be undone and will remove all associated applications.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleRemoveJob(showDeleteConfirm)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
