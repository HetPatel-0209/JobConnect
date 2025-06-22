import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobService } from '../../../services/job.service';
import { useSmartFetch } from '../../../hooks/useSmartFetch';
import { CacheKeys } from '../../../services/cache.service';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  IndianRupee,
  Calendar,
  FileText,
  CheckCircle,
  Star,
  Loader,
  Users,
  Award,
  Globe,
  Phone,
  Mail,
  User,
  UserCircle,
  Briefcase,
  BookOpen,
  Target,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import ChatButton from '../../../components/chat/ChatButton';

export default function UserJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Smart fetch for job details
  const {
    data: jobResponse,
    loading: jobLoading,
    error: jobError
  } = useSmartFetch(
    id ? CacheKeys.JOB_DETAILS(id) : null,
    () => JobService.getJobById(id),
    {
      enabled: !!id,
      ttl: 5 * 60 * 1000, // 5 minutes cache
      onSuccess: (data) => {
        console.log('Job details loaded:', data);
      }
    }
  );

  // Smart fetch for saved status
  const {
    data: savedResponse,
    loading: savedLoading,
    refetch: refetchSavedStatus
  } = useSmartFetch(
    id && user ? CacheKeys.JOB_SAVED_STATUS(id, user.id || user.id) : null,
    () => JobService.checkJobSaved(id),
    {
      enabled: !!id && !!user,
      ttl: 2 * 60 * 1000, // 2 minutes cache
      onError: (err) => {
        console.error('Error checking saved status:', err);
      }
    }
  );

  // Extract data from responses
  const job = jobResponse?.job || jobResponse;
  const isSaved = savedResponse?.isSaved || false;
  const loading = jobLoading || savedLoading;
  const error = jobError;

  const handleSaveJob = async () => {
    try {
      setSaving(true);
      if (isSaved) {
        // Unsave the job
        await JobService.unsaveJob(job._id);
      } else {
        // Save the job
        await JobService.saveJob(job._id);
      }
      // The smart cache will automatically update the saved status
      // Refetch to get the updated status
      refetchSavedStatus();
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      alert(`Failed to ${isSaved ? 'remove' : 'save'} job. Please try again.`);
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Job</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatSkills = (skills) => {
    if (!skills) return [];
    
    // If it's already an array, return it
    if (Array.isArray(skills)) return skills;
    
    // If it's a string, split it by commas
    if (typeof skills === 'string') {
      return skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    }
    
    // If we have the structured data from requirements.skills.required
    if (typeof skills === 'object' && skills.required) {
      return skills.required;
    }
    
    return [];
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    
    // If it's already a string, return it
    if (typeof salary === 'string') return salary;
    
    // If it's an object with min/max
    if (typeof salary === 'object' && (salary.min || salary.max)) {
      const formatAmount = (amount) => {
        if (!amount) return '';
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(amount);
      };

      if (salary.min && salary.max) {
        return `${formatAmount(salary.min)} - ${formatAmount(salary.max)}`;
      } else if (salary.min) {
        return `From ${formatAmount(salary.min)}`;
      } else if (salary.max) {
        return `Up to ${formatAmount(salary.max)}`;
      }
    }
    
    return 'Not specified';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 mt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                
                {/* Organization Header */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  {job.organization?.logo ? (
                    <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
                      <img
                        src={job.organization.logo}
                        alt={`${job.organization.name} logo`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{job.organization?.name}</h3>
                    <div className="flex items-center gap-4 text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{job.location}</span>
                      </div>
                      {job.organization?.companySize && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{job.organization.companySize} employees</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-purple-600" />
                    <span>{job.jobType}</span>
                  </div>                  <div className="flex items-center text-gray-600">
                    <IndianRupee className="w-5 h-5 mr-3 text-emerald-600" />
                    <span className="font-medium">{formatSalary(job.salary)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-orange-600" />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSaveJob}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 px-8 py-3 border font-medium rounded-lg transition-colors duration-200 ${
                    isSaved
                      ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : isSaved ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-3 text-blue-600" />
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
                Requirements
              </h2>
              <div className="prose prose-gray max-w-none">
                {typeof job.requirements === 'string' ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
                ) : (
                  <div>
                    {job.requirements?.experience && (
                      <div className="mb-4">
                        <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                          <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                          Experience
                        </h3>
                        <p className="text-gray-700">
                          {job.requirements.experience.min && job.requirements.experience.max 
                            ? `${job.requirements.experience.min} - ${job.requirements.experience.max} years`
                            : job.requirements.experience.min 
                              ? `Minimum ${job.requirements.experience.min} years` 
                              : job.requirements.experience.max 
                                ? `Up to ${job.requirements.experience.max} years`
                                : 'Not specified'}
                        </p>
                      </div>
                    )}
                    
                    {job.requirements?.education && job.requirements.education.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-green-600" />
                          Education
                        </h3>
                        <ul className="list-disc list-inside text-gray-700">
                          {job.requirements.education.map((edu, index) => (
                            <li key={index}>{edu}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {job.requirements?.skills && (
                      <>
                        {job.requirements.skills.required && job.requirements.skills.required.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                              <Target className="w-4 h-4 mr-2 text-red-600" />
                              Required Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {job.requirements.skills.required.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {job.requirements.skills.preferred && job.requirements.skills.preferred.length > 0 && (
                          <div>
                            <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                              <Award className="w-4 h-4 mr-2 text-yellow-600" />
                              Preferred Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {job.requirements.skills.preferred.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-yellow-50 text-yellow-800 text-sm font-medium rounded-full border border-yellow-200"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {job.skill || (job.requirements && job.requirements.skills) ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-3 text-yellow-600" />
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {/* Handle legacy format where skills are in job.skill */}
                  {job.skill && formatSkills(job.skill).map((skill, index) => (
                    <span
                      key={`old-${index}`}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200 hover:bg-blue-200 transition-colors duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                  
                  {/* Handle new format where skills are in job.requirements.skills.required */}
                  {job.requirements && job.requirements.skills && job.requirements.skills.required && 
                   job.requirements.skills.required.map((skill, index) => (
                    <span
                      key={`new-${index}`}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200 hover:bg-blue-200 transition-colors duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Company Information</h3>

              {/* Organization Section */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  {job.organization?.logo ? (
                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
                      <img
                        src={job.organization.logo}
                        alt={`${job.organization.name} logo`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600">Company</span>
                    </div>
                    <p className="font-medium text-gray-900">{job.organization?.name || 'N/A'}</p>
                    {job.organization?.companySize && (
                      <p className="text-sm text-gray-600 mt-1">{job.organization.companySize} employees</p>
                    )}
                  </div>
                </div>

                {/* Recruiter Section */}
                {job.recruiter && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    {job.recruiter.profilePic ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={job.recruiter.profilePic}
                          alt={`${job.recruiter.name} profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-purple-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">Recruiter</span>
                      </div>
                      <p className="font-medium text-gray-900">{job.recruiter.name}</p>
                      {job.recruiter.title && (
                        <p className="text-sm text-gray-600 mt-1">{job.recruiter.title}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm text-gray-600">Location</span>
                </div>
                <p className="font-medium text-gray-900 ml-7">{job.location}</p>

                <div className="space-y-2 mt-6">
                  {job.organization?.id && (
                    <button
                      onClick={() => navigate(`/company-details/${job.organization.id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Company Details
                    </button>
                  )}
                  {job.recruiter?.id && (
                    <button
                      onClick={() => navigate(`/recruiter-details/${job.recruiter.id}`)}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Recruiter Details
                    </button>
                  )}
                  {job.recruiter?.id && (
                    <ChatButton
                      recipientId={job.recruiter.id}
                      recipientName={job.recruiter.name}
                      recipientRole="recruiter"
                      variant="secondary"
                      className="w-full"
                      initialMessage={`Hi! I'm interested in the ${job.title} position at ${job.organization?.name || 'your company'}. I'd like to learn more about this opportunity.`}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Job Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Job Type</span>
                  <span className="text-sm font-medium text-gray-900">{job.jobType}</span>
                </div>                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Salary</span>
                  <span className="text-sm font-medium text-gray-900">{formatSalary(job.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Posted</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Jobs</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">Frontend Developer</h4>
                  <p className="text-xs text-gray-600">Tech Corp • Remote</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">React Developer</h4>
                  <p className="text-xs text-gray-600">StartupXYZ • New York</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">UI/UX Developer</h4>
                  <p className="text-xs text-gray-600">Design Agency • San Francisco</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
