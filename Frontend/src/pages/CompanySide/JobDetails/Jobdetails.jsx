import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X,
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle2,
  Building2,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react';

const Jobdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobId = parseInt(id);

  const [job, setJob] = useState(null);
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email;

  useEffect(() => {
    const loadJobData = async () => {
      setIsLoading(true);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
      const userJobs = allUserJobs[email] || [];
      const matchedJob = userJobs.find(j => j.id === jobId);
      
      setJob(matchedJob);
      setEditData(matchedJob || {});
      setIsLoading(false);
    };
    
    loadJobData();
  }, [jobId, email]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!editData.title?.trim()) newErrors.title = 'Job title is required';
    if (!editData.company?.trim()) newErrors.company = 'Company name is required';
    if (!editData.location?.trim()) newErrors.location = 'Location is required';
    if (!editData.type?.trim()) newErrors.type = 'Job type is required';
    if (!editData.salary?.trim()) newErrors.salary = 'Salary range is required';
    if (!editData.description?.trim()) newErrors.description = 'Description is required';
    if (!editData.requirements?.trim()) newErrors.requirements = 'Requirements are required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    // Simulate save delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
    const userJobs = allUserJobs[email] || [];
    const updatedJobs = userJobs.map(j => j.id === jobId ? { ...j, ...editData } : j);

    allUserJobs[email] = updatedJobs;
    localStorage.setItem('userJobs', JSON.stringify(allUserJobs));

    // Update global jobs list
    const globalJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const updatedGlobalJobs = globalJobs.map(j => j.id === jobId ? { ...j, ...editData } : j);
    localStorage.setItem('jobs', JSON.stringify(updatedGlobalJobs));

    setJob(editData);
    setIsEditing(false);
    setIsSaving(false);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setEditData(job || {});
    setIsEditing(false);
    setErrors({});
  };

  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return 'bg-green-100 text-green-800 border-green-200';
      case 'part-time': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contract': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'internship': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-10 px-5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-10 px-5">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-5 flex justify-center">
      <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-4xl w-full shadow-lg">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800 font-medium">Job details updated successfully!</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Job Details' : job.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{job.company}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {isEditing ? (
          /* Edit Mode */
          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4" />
                  Job Title *
                </label>
                <input 
                  name="title" 
                  value={editData.title || ''} 
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter job title"
                />
                {errors.title && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  Company Name *
                </label>
                <input 
                  name="company" 
                  value={editData.company || ''} 
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.company ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter company name"
                />
                {errors.company && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.company}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Location *
                </label>
                <input 
                  name="location" 
                  value={editData.location || ''} 
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter job location"
                />
                {errors.location && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.location}
                  </div>
                )}
              </div>

              {/* Job Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  Job Type *
                </label>
                <select 
                  name="type" 
                  value={editData.type || ''} 
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
                {errors.type && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.type}
                  </div>
                )}
              </div>

              {/* Salary Range */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4" />
                  Salary Range *
                </label>
                <input 
                  name="salary" 
                  value={editData.salary || ''} 
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.salary ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., $50,000 - $70,000"
                />
                {errors.salary && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.salary}
                  </div>
                )}
              </div>

              {/* Required Skills */}
              <div className="lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Star className="w-4 h-4" />
                  Required Skills
                </label>
                <input 
                  name="skill" 
                  value={editData.skill || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              </div>

              {/* Job Description */}
              <div className="lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Job Description *
                </label>
                <textarea 
                  name="description" 
                  value={editData.description || ''} 
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg text-base resize-vertical transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Describe the job role and responsibilities..."
                />
                {errors.description && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Requirements *
                </label>
                <textarea 
                  name="requirements" 
                  value={editData.requirements || ''} 
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg text-base resize-vertical transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.requirements ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="List the job requirements and qualifications..."
                />
                {errors.requirements && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.requirements}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
              <button 
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <>
            {/* Job Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Location</span>
                </div>
                <p className="text-blue-900 font-semibold">{job.location}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Salary</span>
                </div>
                <p className="text-green-900 font-semibold">{job.salary}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Posted</span>
                </div>
                <p className="text-purple-900 font-semibold">{job.date}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Applicants</span>
                </div>
                <p className="text-orange-900 font-semibold">{job.applicants || 0}</p>
              </div>
            </div>

            {/* Job Type Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getJobTypeColor(job.type)}`}>
                <Clock className="w-4 h-4 mr-2" />
                {job.type}
              </span>
            </div>

            {/* Job Details */}
            <div className="space-y-6">
              {/* Required Skills */}
              {job.skill && (
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <Star className="w-5 h-5 text-blue-600" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skill.split(',').map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Job Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Requirements
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
              <button 
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Job Details
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Jobdetails;
