import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { JobService } from '../../../services/job.service';
import { OrganizationService } from '../../../services/organization.service';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Clock,
  Star,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
  Loader2,
  Target
} from 'lucide-react';

const Postjob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [organization, setOrganization] = useState(null);

  // Edit mode detection
  const editJobId = searchParams.get('edit');
  const isEditMode = !!editJobId;

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    jobType: '',
    workMode: '',
    experienceLevel: '',
    salary: {
      min: '',
      max: '',
      currency: 'INR'
    },
    description: '',
    requirements: [],
    skills: [],
    benefits: [],
    applicationDeadline: '',
    status: 'draft',
    atsCriteria: {
      minimumScore: 60,
      keywordWeights: {
        skills: 40,
        experience: 30,
        education: 20,
        keywords: 10
      },
      requiredKeywords: [],
      preferredKeywords: [],
      experienceWeight: 1,
      educationRequired: false
    }
  });

  useEffect(() => {
    loadOrganization();
  }, [user]);

  useEffect(() => {
    if (isEditMode && editJobId) {
      loadJobForEdit();
    }
  }, [isEditMode, editJobId]);

  const loadOrganization = async () => {
    const organizationId = user?.recruiterProfile?.organizationId?.id || user?.recruiterProfile?.organizationId || user?.organizationId;
    if (!organizationId) {
      setErrors({ organization: 'No organization found. Please register your organization first.' });
      setLoading(false);
      return;
    }

    try {
      const response = await OrganizationService.getOrganization(organizationId);
      if (response.success) {
        setOrganization(response.data);
      } else {
        setErrors({ organization: 'Failed to load organization details' });
      }
    } catch (err) {
      console.error('Error loading organization:', err);
      setErrors({ organization: 'Failed to load organization details' });
    } finally {
      if (!isEditMode) {
        setLoading(false);
      }
    }
  };

  const loadJobForEdit = async () => {
    try {
      setLoading(true);
      const response = await JobService.getJobById(editJobId);

      // Handle different response formats
      const job = response.job || response.data || response;

      if (job && job._id) {

        // Transform job data to match form structure
        const experienceLevelMapping = {
          0: 'entry',    // 0-2 years
          2: 'mid',      // 2-5 years
          5: 'senior',   // 5-10 years
          10: 'lead'     // 10+ years
        };

        // Find experience level based on min experience
        let experienceLevel = 'entry';
        if (job.requirements?.experience?.min >= 10) {
          experienceLevel = 'lead';
        } else if (job.requirements?.experience?.min >= 5) {
          experienceLevel = 'senior';
        } else if (job.requirements?.experience?.min >= 2) {
          experienceLevel = 'mid';
        }

        const jobSkills = job.requirements?.skills?.required || [];

        setFormData({
          title: job.title || '',
          location: job.location || '',
          jobType: job.jobType || '',
          workMode: job.workMode || '',
          experienceLevel: experienceLevel,
          salary: {
            min: job.salary?.min?.toString() || '',
            max: job.salary?.max?.toString() || '',
            currency: 'INR'
          },
          description: job.description || '',
          requirements: job.requirements?.education || [],
          skills: jobSkills,
          benefits: [],
          applicationDeadline: job.applicationDeadline ?
            new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
          status: job.status || 'draft',
          atsCriteria: job.atsCriteria || {
            minimumScore: 60,
            keywordWeights: {
              skills: 40,
              experience: 30,
              education: 20,
              keywords: 10
            },
            requiredKeywords: [],
            preferredKeywords: [],
            experienceWeight: 1,
            educationRequired: false
          }
        });

        // Set selected skills for the skills component
        setSelectedSkills(jobSkills);
      } else {
        setErrors({ submit: 'Job not found or invalid job ID' });
      }
    } catch (err) {
      console.error('Error loading job for edit:', err);
      setErrors({ submit: `Failed to load job details for editing: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const predefinedSkills = [
    'React', 'Node.js', 'JavaScript', 'Python', 'Java', 'C++', 'HTML/CSS',
    'Angular', 'Vue.js', 'PHP', 'Ruby', 'Go', 'Kotlin', 'Swift', 'TypeScript',
    'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes', 'Git'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) newErrors.title = 'Job title is required';
    if (!formData.description?.trim()) newErrors.description = 'Job description is required';
    if (!formData.jobType) newErrors.jobType = 'Job type is required';
    if (!formData.workMode) newErrors.workMode = 'Work mode is required';
    if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required';

    // Salary validation
    if (formData.salary.min && formData.salary.max) {
      if (parseInt(formData.salary.min) >= parseInt(formData.salary.max)) {
        newErrors.salary = 'Minimum salary should be less than maximum salary';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillAdd = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setCustomSkill('');

      // Clear skill errors
      if (errors.skills) {
        setErrors(prev => ({ ...prev, skills: '' }));
      }
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleRequirementAdd = (requirement) => {
    if (requirement && !formData.requirements.includes(requirement)) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirement]
      }));
    }
  };

  const handleBenefitAdd = (benefit) => {
    if (benefit && !formData.benefits.includes(benefit)) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setErrors({});

    try {
      // Map experience level to numeric values
      const experienceMapping = {
        'entry': { min: 0, max: 2 },
        'mid': { min: 2, max: 5 },
        'senior': { min: 5, max: 10 },
        'lead': { min: 10, max: 20 }
      };

      const experienceRange = experienceMapping[formData.experienceLevel] || { min: 0, max: 0 };

      // Prepare job data according to backend model
      const jobData = {
        title: formData.title,
        location: formData.location,
        jobType: formData.jobType,
        workMode: formData.workMode,
        requirements: {
          experience: {
            min: experienceRange.min,
            max: experienceRange.max
          },
          education: formData.requirements || [], // Use requirements array as education
          skills: {
            required: formData.skills || [], // Move skills to requirements.skills.required
            preferred: [] // Empty for now, can be added later
          }
        },
        ...(formData.salary.min || formData.salary.max ? {
          salary: {
            ...(formData.salary.min && { min: parseInt(formData.salary.min) }),
            ...(formData.salary.max && { max: parseInt(formData.salary.max) })
          }
        } : {}),
        description: formData.description,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : null,
        status: formData.status,
        organization: organization.id,
        atsCriteria: formData.atsCriteria
      };

      // Create or update job using API
      const response = isEditMode
        ? await JobService.updateJob(editJobId, jobData)
        : await JobService.postJob(jobData);

      // Handle different response formats
      const isSuccess = response.success !== undefined ? response.success : !!response.data || !!response.id;

      if (isSuccess) {
        setSubmitSuccess(true);

        // Navigate after showing success message
        setTimeout(() => {
          navigate(isEditMode ? `/job/${editJobId}` : '/dashboard');
        }, 2000);
      } else {
        setErrors({ submit: response.message || `Failed to ${isEditMode ? 'update' : 'post'} job` });
      }

    } catch (err) {
      setErrors({ submit: err.message || `Something went wrong while ${isEditMode ? 'updating' : 'posting'} the job. Please try again.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white";
  const errorInputClasses = "w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-red-50";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (errors.organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization Required</h2>
          <p className="text-gray-600 mb-4">{errors.organization}</p>
          <button
            onClick={() => navigate('/register-organization')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 mt-20">
      <div className="max-w-4xl mx-auto mt-19">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? 'Edit Job' : 'Post a New Job'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditMode
                  ? 'Update job details and requirements for your posting'
                  : 'Create an opportunity for talented professionals to join your team'
                }
              </p>
            </div>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">
                  {isEditMode ? 'Job updated successfully!' : 'Job posted successfully!'}
                </p>
                <p className="text-green-600 text-sm">
                  {isEditMode ? 'Redirecting to job details...' : 'Redirecting to dashboard...'}
                </p>
              </div>
            </div>
          )}

          {/* Global Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Job Title <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior React Developer"
                className={errors.title ? errorInputClasses : inputClasses}
                required
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Organization Display */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Organization
                </div>
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{organization?.name}</p>
                  <p className="text-sm text-gray-600">GST: {organization?.gstin}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location
                </div>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore, Karnataka or Remote"
                className={inputClasses}
              />
            </div>

            {/* Job Type, Work Mode, and Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClasses}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Job Type <span className="text-red-500">*</span>
                  </div>
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className={errors.jobType ? errorInputClasses : inputClasses}
                  required
                >
                  <option value="">Select job type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
                {errors.jobType && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.jobType}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClasses}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Work Mode <span className="text-red-500">*</span>
                  </div>
                </label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  className={errors.workMode ? errorInputClasses : inputClasses}
                  required
                >
                  <option value="">Select work mode</option>
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                {errors.workMode && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.workMode}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClasses}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Experience Level <span className="text-red-500">*</span>
                  </div>
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className={errors.experienceLevel ? errorInputClasses : inputClasses}
                  required
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (2-5 years)</option>
                  <option value="senior">Senior Level (5-10 years)</option>
                  <option value="lead">Lead/Principal (10+ years)</option>
                </select>
                {errors.experienceLevel && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.experienceLevel}
                  </p>
                )}
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Salary Range (₹ per annum)
                </div>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="number"
                    name="salary.min"
                    value={formData.salary.min}
                    onChange={handleChange}
                    placeholder="Minimum salary"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="salary.max"
                    value={formData.salary.max}
                    onChange={handleChange}
                    placeholder="Maximum salary"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <select
                    name="salary.currency"
                    value={formData.salary.currency}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
              {errors.salary && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.salary}
                </p>
              )}
            </div>

            {/* Job Description */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Job Description <span className="text-red-500">*</span>
                </div>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                className={errors.description ? errorInputClasses : inputClasses}
                required
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Required Skills */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  Required Skills <span className="text-red-500">*</span>
                </div>
              </label>

              {/* Selected Skills Display */}
              {formData.skills.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Skill Selection */}
              <div className="flex gap-2">
                <select
                  value=""
                  onChange={(e) => e.target.value && handleSkillAdd(e.target.value)}
                  className={inputClasses}
                >
                  <option value="">Select a skill to add</option>
                  {predefinedSkills.filter(skill => !formData.skills.includes(skill)).map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Custom skill"
                    className={inputClasses}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSkillAdd(customSkill);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSkillAdd(customSkill)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {errors.skills && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.skills}
                </p>
              )}
            </div>

            {/* ATS Criteria */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  ATS Screening Criteria
                </div>
              </label>
              <p className="text-sm text-gray-600 mb-4">Configure automatic screening criteria for applicant resumes</p>

              <div className="space-y-4">
                {/* Minimum Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum ATS Score (0-100)
                  </label>
                  <input
                    type="number"
                    name="atsCriteria.minimumScore"
                    value={formData.atsCriteria.minimumScore}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className={inputClasses}
                    placeholder="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Applicants below this score will be automatically filtered</p>
                </div>

                {/* Keyword Weights */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scoring Weights (%)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Skills</label>
                      <input
                        type="number"
                        name="atsCriteria.keywordWeights.skills"
                        value={formData.atsCriteria.keywordWeights.skills}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Experience</label>
                      <input
                        type="number"
                        name="atsCriteria.keywordWeights.experience"
                        value={formData.atsCriteria.keywordWeights.experience}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Education</label>
                      <input
                        type="number"
                        name="atsCriteria.keywordWeights.education"
                        value={formData.atsCriteria.keywordWeights.education}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Keywords</label>
                      <input
                        type="number"
                        name="atsCriteria.keywordWeights.keywords"
                        value={formData.atsCriteria.keywordWeights.keywords}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className={inputClasses}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total should equal 100%</p>
                </div>

                {/* Education Required */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="atsCriteria.educationRequired"
                    checked={formData.atsCriteria.educationRequired}
                    onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">
                    Education qualification is mandatory
                  </label>
                </div>
              </div>
            </div>

            {/* Application Deadline */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Application Deadline
                </div>
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={inputClasses}
              />
            </div>

            {/* Job Status */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Job Status
                </div>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="draft">Draft (Save for later)</option>
                <option value="active">Active (Publish immediately)</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(isEditMode ? `/job/${editJobId}` : '/dashboard')}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEditMode ? 'Updating Job...' : 'Posting Job...'}
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {isEditMode ? 'Updated Successfully!' : 'Posted Successfully!'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {isEditMode ? 'Update Job' : 'Post Job'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Postjob;