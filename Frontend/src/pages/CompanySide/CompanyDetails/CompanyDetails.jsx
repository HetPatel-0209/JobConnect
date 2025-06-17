// src/pages/CompanySide/CompanyDetails/CompanyDetails.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  Globe, 
  Linkedin, 
  Users, 
  Image, 
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CompanyDetails = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email;

  const [companyData, setCompanyData] = useState({
    gst: '',
    logo: '',
    banner: '',
    mission: '',
    vision: '',
    website: '',
    linkedin: '',
    size: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem(`companyDetails_${email}`)) || {};
    setCompanyData(savedData);
  }, [email]);

  const validateInputs = () => {
    const newErrors = {};
    
    if (companyData.website && !companyData.website.startsWith('http')) {
      newErrors.website = 'Website URL must start with http:// or https://';
    }
    
    if (companyData.linkedin && !companyData.linkedin.includes('linkedin.com')) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL';
    }
    
    if (companyData.logo && !isValidImageUrl(companyData.logo)) {
      newErrors.logo = 'Please enter a valid image URL';
    }
    
    if (companyData.banner && !isValidImageUrl(companyData.banner)) {
      newErrors.banner = 'Please enter a valid image URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes('unsplash') || url.includes('imgur');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem(`companyDetails_${email}`, JSON.stringify(companyData));
    
    setIsLoading(false);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };
  return (
    <div className="max-w-4xl mx-auto mt-20 mb-8 bg-white p-8 rounded-xl shadow-lg">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-800 font-medium">Company details updated successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Company Details</h2>
        </div>
        <p className="text-gray-600">Manage your company information and branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* GST Number */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              GST Number (Read-only)
            </label>
            <div className="relative">
              <input 
                name="gst" 
                value={companyData.gst} 
                readOnly 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="GST number will be auto-filled"
              />
            </div>
          </div>

          {/* Company Logo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Image className="w-4 h-4" />
              Company Logo URL
            </label>
            <div className="relative">
              <input 
                name="logo" 
                value={companyData.logo} 
                onChange={handleChange} 
                className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.logo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="https://example.com/logo.png"
              />
              {companyData.logo && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <img 
                    src={companyData.logo} 
                    alt="Logo preview" 
                    className="h-12 w-12 object-contain rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            {errors.logo && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.logo}
              </div>
            )}
          </div>

          {/* Company Banner */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Image className="w-4 h-4" />
              Company Banner URL
            </label>
            <div className="relative">
              <input 
                name="banner" 
                value={companyData.banner} 
                onChange={handleChange} 
                className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.banner ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="https://example.com/banner.jpg"
              />
              {companyData.banner && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <img 
                    src={companyData.banner} 
                    alt="Banner preview" 
                    className="h-20 w-full object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            {errors.banner && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.banner}
              </div>
            )}
          </div>

          {/* Website URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Globe className="w-4 h-4" />
              Website URL
            </label>
            <input 
              name="website" 
              value={companyData.website} 
              onChange={handleChange} 
              className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.website ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="https://www.company.com"
            />
            {errors.website && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.website}
              </div>
            )}
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn URL
            </label>
            <input 
              name="linkedin" 
              value={companyData.linkedin} 
              onChange={handleChange} 
              className={`w-full px-4 py-3 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.linkedin ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="https://www.linkedin.com/company/yourcompany"
            />
            {errors.linkedin && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.linkedin}
              </div>
            )}
          </div>

          {/* Company Size */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Company Size
            </label>
            <select 
              name="size" 
              value={companyData.size} 
              onChange={handleChange} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Mission */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Eye className="w-4 h-4" />
              Mission Statement
            </label>
            <textarea 
              name="mission" 
              value={companyData.mission} 
              onChange={handleChange} 
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-vertical min-h-[100px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your company's mission and what drives your organization..."
            />
          </div>

          {/* Vision */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Eye className="w-4 h-4" />
              Vision Statement
            </label>
            <textarea 
              name="vision" 
              value={companyData.vision} 
              onChange={handleChange} 
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-vertical min-h-[100px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your company's vision for the future..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8 pt-6 border-t border-gray-200">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold border-none rounded-lg text-base cursor-pointer transition-all duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold border-none rounded-lg text-base cursor-pointer transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CompanyDetails;
