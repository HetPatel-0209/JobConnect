import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/common/Footer';
import { 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Globe, 
  Users, 
  Search,
  Eye,
  Target,
  Linkedin,
  Twitter,
  ExternalLink,
  Loader,
  FileText
} from 'lucide-react';

export default function RegisterOrganization() {
  const navigate = useNavigate();
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState({
    logo: null,
    banner: null,
    mission: '',
    vision: '',
    linkedin: '',
    twitter: '',
    website: '',
    size: ''
  });
  const [urlErrors, setUrlErrors] = useState({
    linkedin: '',
    twitter: '',
    website: ''
  });

  const isValidGstin = (val) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val);

  const handleVerify = () => {
    if (!isValidGstin(gstin)) {
      setError('Invalid GSTIN format. Please enter a valid 15-digit GSTIN.');
      setCompany(null);
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setCompany({
        gstin: gstin,
        name: 'Your Organization Pvt Ltd',
        pan: 'ABCDE1234F',
        address: 'Ahmedabad, Gujarat',
        type: 'Private Limited',
        nature: 'Software / IT Services'
      });
      setLoading(false);
    }, 1500);
  };

  const validateURLs = () => {
    let valid = true;
    let errors = { linkedin: '', twitter: '', website: '' };

    if (form.linkedin && !form.linkedin.startsWith('https://www.linkedin.com/')) {
      errors.linkedin = 'LinkedIn URL must start with https://www.linkedin.com/';
      valid = false;
    }

    if (form.twitter && !form.twitter.startsWith('https://twitter.com/')) {
      errors.twitter = 'Twitter URL must start with https://twitter.com/';
      valid = false;
    }

    if (
      form.website &&
      !(form.website.startsWith('https://') || form.website.startsWith('http://'))
    ) {
      errors.website = 'Website URL must start with http:// or https://';
      valid = false;
    }

    setUrlErrors(errors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));

    // Clear URL errors when user starts typing
    if (urlErrors[name]) {
      setUrlErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const isFormValid = () => {
    return (
      company &&
      form.logo &&
      form.banner &&
      form.mission.trim() &&
      form.vision.trim() &&
      form.linkedin.trim() &&
      form.twitter.trim() &&
      form.website.trim() &&
      form.size.trim() &&
      validateURLs()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert('Please fill out all fields with valid values before submitting.');
      return;
    }

    setSubmitLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const email = currentUser?.email || 'temp_registration';

      const companyData = {
        gstin: company.gstin,
        company,
        form: {
          ...form,
          logo: form.logo ? URL.createObjectURL(form.logo) : '',
          banner: form.banner ? URL.createObjectURL(form.banner) : '',
        },
        registeredAt: new Date().toISOString(),
        isTemporary: !currentUser // Flag to indicate this is a temporary registration
      };

      const existing = JSON.parse(localStorage.getItem('registeredCompanyDetails')) || {};
      existing[email] = companyData;
      localStorage.setItem('registeredCompanyDetails', JSON.stringify(existing));

      navigate('/registration-success');
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500";
  const errorInputClasses = "w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-red-50 text-gray-900 placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Register Your Organization</h1>
            </div>
            <p className="text-xl text-gray-600">Start hiring top talent through JobConnect</p>
          </div>

          {/* Main Registration Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              {/* GSTIN Verification Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  GSTIN Verification
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      GSTIN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength="15"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="Enter your 15-digit GSTIN (e.g., 22AAAAA0000A1Z5)"
                      className={error ? errorInputClasses : inputClasses}
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleVerify}
                      disabled={loading || !gstin.trim()}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Verifying GSTIN...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          Verify GSTIN & Fetch Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Information Display */}
              {company && (
                <div className="mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-800">
                        Verification Successful! Fetched data for GSTIN: {gstin}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Business Name:</span>
                        <span className="text-gray-700">{company.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">PAN:</span>
                        <span className="text-gray-700">{company.pan}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Address:</span>
                        <span className="text-gray-700">{company.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Entity Type:</span>
                        <span className="text-gray-700">{company.type}</span>
                      </div>
                      <div className="col-span-full flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Nature of Business:</span>
                        <span className="text-gray-700">{company.nature}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Company Information Form */}
              {company && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Additional Company Information
                    </h3>

                    {/* File Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-blue-600" />
                            Company Logo <span className="text-red-500">*</span>
                          </div>
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            name="logo"
                            onChange={handleChange}
                            accept="image/*"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-blue-600" />
                            Company Banner <span className="text-red-500">*</span>
                          </div>
                        </label>
                        <input
                          type="file"
                          name="banner"
                          onChange={handleChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>

                    {/* Mission and Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            Mission <span className="text-red-500">*</span>
                          </div>
                        </label>
                        <textarea
                          name="mission"
                          value={form.mission}
                          onChange={handleChange}
                          placeholder="Describe your company's mission and purpose..."
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-600" />
                            Vision <span className="text-red-500">*</span>
                          </div>
                        </label>
                        <textarea
                          name="vision"
                          value={form.vision}
                          onChange={handleChange}
                          placeholder="Describe your company's vision and future goals..."
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4 text-blue-600" />
                            LinkedIn URL <span className="text-red-500">*</span>
                          </div>
                        </label>
                        <input
                          type="url"
                          name="linkedin"
                          value={form.linkedin}
                          onChange={handleChange}
                          placeholder="https://www.linkedin.com/company/your-company"
                          className={urlErrors.linkedin ? errorInputClasses : inputClasses}
                        />
                        {urlErrors.linkedin && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {urlErrors.linkedin}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Twitter className="w-4 h-4 text-blue-600" />
                            Twitter URL <span className="text-red-500">*</span>
                          </div>
                        </label>
                        <input
                          type="url"
                          name="twitter"
                          value={form.twitter}
                          onChange={handleChange}
                          placeholder="https://twitter.com/your-company"
                          className={urlErrors.twitter ? errorInputClasses : inputClasses}
                        />
                        {urlErrors.twitter && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {urlErrors.twitter}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            Website URL <span className="text-red-500">*</span>
                          </div>
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={form.website}
                          onChange={handleChange}
                          placeholder="https://www.your-company.com"
                          className={urlErrors.website ? errorInputClasses : inputClasses}
                        />
                        {urlErrors.website && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {urlErrors.website}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Company Size */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Company Size <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <select
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        className={inputClasses}
                      >
                        <option value="">Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={submitLoading || !isFormValid()}
                        className="flex items-center gap-2 px-10 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                      >
                        {submitLoading ? (
                          <>
                            <Loader className="w-6 h-6 animate-spin" />
                            Registering Organization...
                          </>
                        ) : (
                          <>
                            <Building2 className="w-6 h-6" />
                            Register Organization
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

