import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Users
} from 'lucide-react';

const Postjob = () => {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    requirements: '',
  });

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email;

  // Load HR Profile & Company Info
  const currentHRProfile = JSON.parse(localStorage.getItem(`orgProfile_${email}`)) || {};
  const currentHRImage = localStorage.getItem(`orgProfileImage_${email}`) || '';
  const registeredCompanies = JSON.parse(localStorage.getItem('registeredCompanyDetails')) || {};
  const companyDetails = registeredCompanies[email] || null;

  const predefinedSkills = [
    'React', 'Node.js', 'JavaScript', 'Python', 'Java', 'C++', 'HTML/CSS',
    'Angular', 'Vue.js', 'PHP', 'Ruby', 'Go', 'Kotlin', 'Swift', 'TypeScript'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) newErrors.title = 'Job title is required';
    if (!formData.company?.trim()) newErrors.company = 'Company name is required';
    if (!formData.description?.trim()) newErrors.description = 'Job description is required';
    if (!formData.type) newErrors.type = 'Job type is required';
    if (!selectedSkill) newErrors.skill = 'Required skill is needed';
    if (selectedSkill === 'custom' && !customSkill?.trim()) newErrors.customSkill = 'Custom skill is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillChange = (e) => {
    const value = e.target.value;
    setSelectedSkill(value);
    if (value !== 'custom') setCustomSkill('');
    
    // Clear skill errors
    if (errors.skill) {
      setErrors(prev => ({ ...prev, skill: '', customSkill: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      const skillFinal = selectedSkill === 'custom' ? customSkill : selectedSkill;

      const newJob = {
        id: Date.now(),
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: formData.salary ? `₹${formData.salary}` : 'Negotiable',
        description: formData.description,
        requirements: formData.requirements,
        skill: skillFinal,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        }),
        applicants: 0,
        status: 'Active',
        hrDetails: {
          ...currentHRProfile,
          image: currentHRImage,
        },
        companyDetails: companyDetails || {
          gstin: 'N/A',
          name: formData.company,
          mission: '',
          vision: '',
          size: '',
          website: '',
        },
      };

      const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
      const userJobs = allUserJobs[email] || [];
      allUserJobs[email] = [newJob, ...userJobs];
      localStorage.setItem('userJobs', JSON.stringify(allUserJobs));

      const allJobs = JSON.parse(localStorage.getItem('jobs')) || [];
      localStorage.setItem('jobs', JSON.stringify([newJob, ...allJobs]));

      setSubmitSuccess(true);
      
      // Navigate after showing success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('❌ Error posting job:', err);
      setErrors({ submit: 'Something went wrong while posting the job. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white";
  const errorInputClasses = "w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-red-50";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mt-19">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600 mt-1">Create an opportunity for talented professionals to join your team</p>
            </div>
          </div>

          {/* Success Message */}          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Job posted successfully!</p>
                <p className="text-green-600 text-sm">Redirecting to dashboard...</p>
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

            {/* Company Name */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Company Name <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. TechCorp Solutions"
                className={errors.company ? errorInputClasses : inputClasses}
                required
              />
              {errors.company && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.company}
                </p>
              )}
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

            {/* Job Type and Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Job Type <span className="text-red-500">*</span>
                  </div>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={errors.type ? errorInputClasses : inputClasses}
                  required
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.type}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClasses}>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Salary Range (₹)
                  </div>
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. 5,00,000 - 8,00,000 LPA"
                  className={inputClasses}
                />
              </div>
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

            {/* Requirements */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  Requirements & Qualifications
                </div>
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                placeholder="List the skills, experience, and qualifications needed for this role..."
                className={inputClasses}
              />
            </div>

            {/* Required Skills */}
            <div>
              <label className={labelClasses}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Primary Required Skill <span className="text-red-500">*</span>
                </div>
              </label>
              <select
                value={selectedSkill}
                onChange={handleSkillChange}
                className={errors.skill ? errorInputClasses : inputClasses}
                required
              >
                <option value="">Select primary skill</option>
                {predefinedSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
                <option value="custom">Other (Custom)</option>
              </select>
              {errors.skill && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.skill}
                </p>
              )}
            </div>

            {/* Custom Skill Input */}
            {selectedSkill === 'custom' && (
              <div>
                <label className={labelClasses}>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" />
                    Enter Custom Skill <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="e.g. Machine Learning, DevOps, etc."
                  className={errors.customSkill ? errorInputClasses : inputClasses}
                  required
                />
                {errors.customSkill && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.customSkill}
                  </p>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
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
                    Posting Job...
                  </>                ) : submitSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Posted Successfully!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Job
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