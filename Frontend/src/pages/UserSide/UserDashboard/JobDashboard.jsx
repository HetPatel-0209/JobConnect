import React, { useState, useContext, useEffect, useMemo } from 'react';
import UploadResume from '../UserResume/UploadResume';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { ResumeService } from '../../../services/resume.service';
import { JobService } from '../../../services/job.service';
import { useNavigate } from 'react-router-dom';
import { usePreventAltArrowNavigation } from '../../../hooks/usePreventAltArrowNavigation';
import { useSmartFetch, useSmartPaginatedFetch } from '../../../hooks/useSmartFetch';
import { CacheKeys } from '../../../services/cache.service';
import { useAuth } from '../../../contexts/AuthContext';
import { safeExtractId } from '../../../utils/debugUtils';
import { formatJobDate } from '../../../utils/dateUtils';
import {
  Upload,
  Search,
  Briefcase,
  Star,
  Calendar,
  MessageCircle,
  FileText,
  Building,
  MapPin,
  DollarSign,
  Clock,
  User,
  CheckCircle,
  ArrowRight,
  Eye,
  Users,
  TrendingUp,
  Award,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Loader
} from 'lucide-react';

// JobCard component
const JobCard = ({ job, onApply }) => {
  const navigate = useNavigate();
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const handleEvaluate = async () => {
    try {
      setIsEvaluating(true);
      const result = await JobService.calculateATSScore(job._id || job._id);
      setEvaluationResult(result);
      setShowEvaluation(true);
    } catch (error) {
      console.error(error);
      if (error.message?.includes('No active resume found')) {
        alert('You need to upload a resume before you can evaluate it. Please upload a resume first.');
        navigate('/user/upload-resume');
      } else {
        alert('Failed to evaluate your resume: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1">
          {/* Job Title and Organization Header */}
          <div className="flex items-start gap-4 mb-4">
            {job.organization?.logo ? (
              <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={job.organization.logo}
                  alt={`${job.organization.name} logo`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">{job.organization?.name || 'Company Name'}</span>
                {job.organization?.companySize && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm">{job.organization.companySize} employees</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>
                {job.salary?.min && job.salary?.max
                  ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                  : 'Salary not disclosed'
                }
              </span>
            </div>            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Posted: {formatJobDate(job.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-4 h-4" />
              <span>{job.jobType}</span>
            </div>
          </div>

          {job.requirements?.skills?.required?.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {job.requirements.skills.required.slice(0, 3).map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {skill}
                  </span>
                ))}
                {job.requirements.skills.required.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                    +{job.requirements.skills.required.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md">{job.jobType}</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md">{job.workMode}</span>
            {job.atsCriteria?.minimumScore && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md">
                ATS Score: {job.atsCriteria.minimumScore}+
              </span>
            )}
          </div>

          {/* Show evaluation results if available */}
          {showEvaluation && evaluationResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Resume ATS Evaluation</h4>
                <button
                  onClick={() => setShowEvaluation(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Your Score:</span>
                  <div className="flex items-center">
                    <span className={`font-semibold ${(() => {
                      const userScore = evaluationResult?.aiEvaluation?.score || 0;
                      const requiredScore = job.atsCriteria?.minimumScore;

                      // If no ATS criteria is set, show blue (neutral)
                      if (requiredScore === undefined || requiredScore === null) {
                        return 'text-blue-600';
                      }

                      // Compare with actual required score
                      return userScore >= requiredScore ? 'text-green-600' : 'text-red-600';
                    })()
                      }`}>
                      {evaluationResult?.aiEvaluation?.score || 0}/100
                    </span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-gray-600">
                      Required: {job.atsCriteria?.minimumScore !== undefined ? `${job.atsCriteria.minimumScore}/100` : 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${(() => {
                      const userScore = evaluationResult?.aiEvaluation?.score || 0;
                      const requiredScore = job.atsCriteria?.minimumScore;

                      // If no ATS criteria is set, show blue (neutral)
                      if (requiredScore === undefined || requiredScore === null) {
                        return 'bg-blue-600';
                      }

                      // Compare with actual required score
                      return userScore >= requiredScore ? 'bg-green-600' : 'bg-red-600';
                    })()
                      }`}
                    style={{ width: `${evaluationResult?.aiEvaluation?.score || 0}%` }}
                  ></div>
                </div>

                {/* Matched Skills */}
                {evaluationResult?.aiEvaluation?.matchedSkills?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Matched Skills:</h5>
                    <div className="flex flex-wrap gap-1">
                      {evaluationResult?.aiEvaluation?.matchedSkills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {evaluationResult?.aiEvaluation?.missingSkills?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Missing Skills:</h5>
                    <div className="flex flex-wrap gap-1">
                      {evaluationResult?.aiEvaluation?.missingSkills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {evaluationResult?.aiEvaluation?.suggestions?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Suggestions:</h5>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      {evaluationResult?.aiEvaluation?.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:min-w-0 lg:w-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">            <button
              onClick={() => navigate(`/jobs/${safeExtractId(job._id)}`)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-sm"
            >
              <Eye className="w-4 h-4" />
              Job Details
            </button>
            <button
              onClick={() => navigate(`/recruiter-details/${job.recruiter.id}`)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-sm"
            >
              <User className="w-4 h-4" />
              Recruiter Details
            </button>
            <button
              onClick={() => navigate(`/company-details/${job.organization.id}`)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-sm"
            >
              <Users className="w-4 h-4" />
              Company Details
            </button>
          </div>

          {/* Show AI Evaluation button if no evaluation yet */}
          {!showEvaluation && (
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              {isEvaluating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Evaluating Resume...
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  AI-ATS Evaluation
                </>
              )}
            </button>
          )}

          {/* Show Apply button based on evaluation criteria */}
          {showEvaluation && evaluationResult && (() => {
            const userScore = evaluationResult?.aiEvaluation?.score || 0;
            const requiredScore = job.atsCriteria?.minimumScore;

            // If no ATS criteria is set, allow application
            if (requiredScore === undefined || requiredScore === null) {
              return true;
            }

            // Check if user meets the required score
            return userScore >= requiredScore;
          })() && (
              <button
                onClick={() => onApply(job._id || job._id)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                Apply For This Job
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

          {/* Show warning if score doesn't meet criteria */}
          {showEvaluation && evaluationResult && (() => {
            const userScore = evaluationResult?.aiEvaluation?.score || 0;
            const requiredScore = job.atsCriteria?.minimumScore;

            // Only show warning if ATS criteria exists and user doesn't meet it
            if (requiredScore === undefined || requiredScore === null) {
              return false;
            }

            return userScore < requiredScore;
          })() && (
              <div className="text-center">
                <button
                  onClick={() => navigate('/user/upload-resume')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg w-full"
                >
                  <Upload className="w-5 h-5" />
                  Update Resume
                </button>
                <p className="text-xs text-red-600 mt-2">
                  Your resume score is below the required threshold. Consider updating your resume.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default function JobDashboard() {
  const [showUploadScreen, setShowUploadScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { profileData, fetchProfile } = useContext(ProfileContext);

  const [profileCompleted, setProfileCompleted] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    workMode: '',
    salaryMin: '',
    salaryMax: '',
    skills: ''  });

  const navigate = useNavigate();
  // Debug logging for development
  useEffect(() => {
    if (import.meta.env.DEV) {
      const userId = user?.id || user?.id;
      console.log('� JobDashboard mounted with user ID:', userId);
    }
  }, [user?.id, user?.id]);
  // Stable user ID to prevent cache key changes
  const userId = useMemo(() => {
    return user?.id || user?.id;
  }, [user?.id, user?.id]);

  // Memoize cache keys and fetch functions to prevent unnecessary re-renders
  const cacheKeys = useMemo(() => {
    if (!userId) {
      console.log('⚠️ No user ID found for cache keys', { user });
      return null;
    }
    return {
      userStats: CacheKeys.USER_STATS(userId),
      userActiveResume: CacheKeys.USER_ACTIVE_RESUME(userId),
      allJobs: (page, filters) => CacheKeys.ALL_JOBS(page, { ...filters, search: searchQuery }),
      recommendedJobs: (page) => CacheKeys.USER_RECOMMENDED_JOBS(userId, page),
      appliedJobs: (page) => CacheKeys.USER_APPLIED_JOBS(userId, page)
    };  }, [userId, searchQuery]);
  // Smart fetch for dashboard stats
  const {
    data: dashboardStats,
    loading: statsLoading
  } = useSmartFetch(
    cacheKeys?.userStats,
    () => {
      return JobService.getJobseekerStats(userId);
    },
    {
      enabled: !!userId && !!cacheKeys,
      ttl: 2 * 60 * 1000, // 2 minutes
      realtime: true
    }
  );

  // Smart fetch for user resume status
  const {
    loading: resumeLoading
  } = useSmartFetch(
    cacheKeys?.userActiveResume,    () => {
      return ResumeService.getUserActiveResume();
    },
    {
      enabled: !!userId && !!cacheKeys,
      ttl: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        setHasResume(data?.hasActiveResume && data?.activeResume);
      },
      onError: () => {
        setHasResume(false);
      }
    }
  );

  // Smart paginated fetch for all jobs
  const {
    data: allJobs,
    pagination: allJobsPagination,
    loading: allJobsLoading,
    setPage: setAllJobsPage
  } = useSmartPaginatedFetch(
    (page) => cacheKeys?.allJobs(page, filters),
    ({ page }) => JobService.getAllJobs({ page, ...filters, search: searchQuery }),
    {
      enabled: !!cacheKeys,
      dependencies: [filters, searchQuery],
      ttl: 3 * 60 * 1000, // 3 minutes
    }
  );

  // Smart paginated fetch for recommended jobs
  const {
    data: recommendedJobs,
    pagination: recommendedJobsPagination,
    loading: recommendedJobsLoading,
    setPage: setRecommendedJobsPage
  } = useSmartPaginatedFetch(
    (page) => cacheKeys?.recommendedJobs(page),
    ({ page }) => JobService.getRecommendedJobs({ page }, userId),
    {
      enabled: !!userId && !!cacheKeys,
      ttl: 5 * 60 * 1000, // 5 minutes
      realtime: true
    }
  );

  // Smart paginated fetch for applied jobs
  const {
    data: appliedJobs,
    pagination: appliedJobsPagination,
    loading: appliedJobsLoading,
    setPage: setAppliedJobsPage
  } = useSmartPaginatedFetch(
    (page) => cacheKeys?.appliedJobs(page),
    ({ page }) => JobService.getAppliedJobs({ page }, userId),
    {
      enabled: !!userId && !!cacheKeys,
      ttl: 3 * 60 * 1000, // 3 minutes
      realtime: true
    }
  );

  // Combined loading state
  const loading = statsLoading || resumeLoading || allJobsLoading || recommendedJobsLoading || appliedJobsLoading;

  // Update profile completion status when profile data changes
  useEffect(() => {
    if (profileData) {
      setProfileCompleted(profileData.profileCompleted || false);
    }
  }, [profileData]);

  // Legacy useEffect - to be removed after testing

  const dashboardStatsArray = [
    {
      title: 'Applications',
      value: dashboardStats?.appliedJobs || 0,
      subtitle: 'Active Applications',
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Saved Jobs',
      value: dashboardStats?.savedJobs || 0,
      subtitle: 'Bookmarked',
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      onClick: () => navigate('/user/saved-jobs')
    }, {
      title: 'Interviews',
      value: dashboardStats?.interviews || 0,
      subtitle: 'Scheduled',
      icon: <Calendar className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Messages',
      value: dashboardStats?.unreadMessages || 0,
      subtitle: 'Unread',
      icon: <MessageCircle className="w-6 h-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const handleSearch = () => {
    setAllJobsPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setAllJobsPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      jobType: '',
      workMode: '',
      salaryMin: '',
      salaryMax: '',
      skills: ''
    });
    setAllJobsPage(1);
  };

  const handleApply = async (jobId) => {
    try {
      // Apply for job logic - the service will handle cache updates automatically
      await JobService.applyForJob(jobId);
      alert('Application submitted successfully!');

      // The smart fetching hooks will automatically update due to real-time cache updates
      // No need to manually refetch data
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to apply for job. ' + (error.message));
    }
  };

  const handleResumeUploadSuccess = () => {
    setHasResume(true);
    setShowUploadScreen(false);
  };

  // Prevent Alt + Arrow key navigation within this component
  usePreventAltArrowNavigation();

  return (<div className="min-h-screen bg-gray-50">
    {showUploadScreen ? (
      <UploadResume
        onClose={() => setShowUploadScreen(false)}
        onSuccess={handleResumeUploadSuccess}
      />
    ) : (      <main className="pt-24 px-4 pb-8 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-blue-600">{user?.name || 'User'}</span>!
          </h1>
          <p className="text-gray-600 text-lg">Ready to find your next opportunity?</p>
        </div>
        {/* Profile Completion Banner - Show only if profile is not completed or no resume */}
        {(!profileCompleted || !hasResume) && !loading && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Upload className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
                  <p className="text-gray-600">
                    {!hasResume
                      ? "Upload your resume to get better job matches and apply faster to positions that interest you."
                      : "Complete your profile information to get personalized job recommendations."
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {!hasResume && (
                  <button
                    onClick={() => setShowUploadScreen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 font-semibold whitespace-nowrap shadow-md hover:shadow-lg"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Resume
                  </button>
                )}
                {!profileCompleted && (
                  <button
                    onClick={() => navigate('/user/profile')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold whitespace-nowrap shadow-md hover:shadow-lg"
                  >
                    <User className="w-5 h-5" />
                    Complete Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        )}        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStatsArray.map((stat, index) => (
            <div
              key={index}
              onClick={stat.onClick}
              className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border ${stat.borderColor} ${stat.bgColor} bg-opacity-50 ${stat.onClick ? 'cursor-pointer hover:scale-105' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {stat.icon}
                  <span className="text-gray-600 font-medium">{stat.title}</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-500 text-sm">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Recent Applications Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Recent Applications</h2>
            </div>
            {appliedJobsPagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAppliedJobsPage(prev => Math.max(1, prev - 1))}
                  disabled={!appliedJobsPagination.hasPrev}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {appliedJobsPagination.currentPage} of {appliedJobsPagination.totalPages}
                </span>
                <button
                  onClick={() => setAppliedJobsPage(prev => prev + 1)}
                  disabled={!appliedJobsPagination.hasNext}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {appliedJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No recent applications yet.</p>
              <p className="text-gray-400">Start applying to jobs to see them here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appliedJobs.map((application, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{application.job?.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        <span>{application.job?.organization?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{application.job?.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${application.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'shortlisted' ? 'bg-purple-100 text-purple-800' :
                          application.status === 'hired' ? 'bg-green-100 text-green-800' :
                            application.status === 'interview' ? 'bg-orange-100 text-orange-800' :
                              application.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                                application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                        }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>                      <span className="text-gray-500">
                        Applied: {formatJobDate(application.appliedAt)}
                      </span>
                      {application.atsScore > 0 && (
                        <span className="text-gray-500">
                          ATS Score: {application.atsScore}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">                    <button
                      onClick={() => navigate(`/jobs/${safeExtractId(application.job._id)}`)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>        {/* All Posted Jobs Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">All Posted Jobs</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="City, State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode</label>
                  <select
                    value={filters.workMode}
                    onChange={(e) => handleFilterChange('workMode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Modes</option>
                    <option value="remote">Remote</option>
                    <option value="on-site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
                  <input
                    type="number"
                    value={filters.salaryMin}
                    onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary</label>
                  <input
                    type="number"
                    value={filters.salaryMax}
                    onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  Search Jobs
                </button>
              </div>
            </div>
          </div>

          {/* Pagination for All Jobs */}
          {allJobsPagination.totalPages > 1 && (
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Showing {allJobs.length} of {allJobsPagination.totalJobs} jobs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAllJobsPage(prev => Math.max(1, prev - 1))}
                  disabled={!allJobsPagination.hasPrev}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                  {allJobsPagination.currentPage}
                </span>
                <span className="text-gray-500">of {allJobsPagination.totalPages}</span>
                <button
                  onClick={() => setAllJobsPage(prev => prev + 1)}
                  disabled={!allJobsPagination.hasNext}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {allJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No jobs found.</p>
              <p className="text-gray-400">Try adjusting your search or filters!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {allJobs.map(job => (
                <JobCard key={job._id || job._id} job={job} onApply={handleApply} />
              ))}
            </div>
          )}
        </div>        {/* Recommended Jobs Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            </div>
            {recommendedJobsPagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRecommendedJobsPage(prev => Math.max(1, prev - 1))}
                  disabled={!recommendedJobsPagination.hasPrev}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {recommendedJobsPagination.currentPage} of {recommendedJobsPagination.totalPages}
                </span>
                <button
                  onClick={() => setRecommendedJobsPage(prev => prev + 1)}
                  disabled={!recommendedJobsPagination.hasNext}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No job recommendations yet.</p>
              <p className="text-gray-400">Complete your profile to get personalized recommendations!</p>            </div>
          ) : (
            <div className="space-y-6">
              {recommendedJobs.map(job => (
                <JobCard key={job._id || job._id} job={job} onApply={handleApply} />
              ))}          </div>)}
        </div>
      </main>
    )}
  </div>
  );
}
