import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobService } from '../../../services/job.service';
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
  Briefcase,
  BookOpen,
  Target
} from 'lucide-react';

export default function UserJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await JobService.getJobById(id);
        setJob(response.job);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const handleSaveJob = async () => {
    try {
      setSaving(true);
      // TODO: Implement save job functionality
      // await JobService.saveJob(job._id);
      setIsSaved(true);
      console.log('Job saved successfully');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Building2 className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">{job.organization?.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-green-600" />
                    <span>{job.location}</span>
                  </div>
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
                  className={`px-8 py-3 border font-medium rounded-lg transition-colors duration-200 ${
                    isSaved
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save Job'}
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
              <div className="space-y-3">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm text-gray-600">Company</span>
                </div>
                <p className="font-medium text-gray-900">{job.organization?.name || 'N/A'}</p>
                
                <div className="flex items-center mt-4">
                  <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm text-gray-600">Location</span>
                </div>
                <p className="font-medium text-gray-900">{job.location}</p>
                
                <div className="space-y-2 mt-4">
                  {job.organization?._id && (
                    <button 
                      onClick={() => navigate(`/company-details/${job.organization._id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Company Details
                    </button>
                  )}
                  {job.recruiter?._id && (
                    <button 
                      onClick={() => navigate(`/recruiter-details/${job.recruiter._id}`)}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Recruiter Details
                    </button>
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
