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
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email;

  // Load user's jobs from localStorage
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
      const userJobs = allUserJobs[email] || [];
      setJobs(userJobs);
      setIsLoading(false);
    };
    
    loadJobs();
  }, [email]);

  // Save updated jobs back to localStorage for the specific user
  const updateUserJobs = (updatedJobs) => {
    const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
    allUserJobs[email] = updatedJobs;
    localStorage.setItem('userJobs', JSON.stringify(allUserJobs));
    setJobs(updatedJobs);
  };

  const handleRemoveJob = (jobId) => {
    // 1. Remove from current user's job list
    const filtered = jobs.filter(job => job.id !== jobId);
    updateUserJobs(filtered);

    // 2. Remove from global "jobs" list shown to jobseekers
    const allGlobalJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const updatedGlobalJobs = allGlobalJobs.filter(job => job.id !== jobId);
    localStorage.setItem('jobs', JSON.stringify(updatedGlobalJobs));
    
    setShowDeleteConfirm(null);
  };

  const handleNewApplication = (jobId) => {
    const updated = jobs.map(job =>
      job.id === jobId ? { ...job, applicants: job.applicants + 1 } : job
    );
    updateUserJobs(updated);
  };

  const activeJobs = jobs.filter(job => job.status === 'Active');
  const totalApplications = jobs.reduce((sum, job) => sum + job.applicants, 0);
  const newTodayCount = 0; // This could be calculated based on application dates

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
          Welcome back, {currentUser?.name || 'User'}! 👋
        </h2>
        <p className="text-gray-600 text-lg mb-5">
          Here's what's happening with your job listings today.
        </p>
      </div>

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
                <p className="text-4xl font-bold text-gray-900">{activeJobs.length}</p>
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
                  <div key={job.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg mb-1">{job.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.type)}`}>
                              {job.type}
                            </span>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Posted: {job.date}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700">{job.applicants} applicant{job.applicants !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => navigate(`/job/${job.id}/applicants`)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        View Applicants
                      </button>
                      <button 
                        onClick={() => navigate(`/job/${job.id}`)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(job.id)}
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
