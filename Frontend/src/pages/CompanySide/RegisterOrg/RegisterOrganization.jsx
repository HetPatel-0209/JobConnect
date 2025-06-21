import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/common/Footer';
import { OrganizationService } from '../../../services/organization.service';
import { useAuth } from '../../../contexts/AuthContext';
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
  ExternalLink,
  Loader,
  FileText,
  MapPin
} from 'lucide-react';

export default function RegisterOrganization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState({
    logo: null,
    banner: null,
    email: user?.email || '',
    phone: '',
    about: '',
    vision: '',
    mission: '',
    benefits: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    website: '',
    companySize: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  const [urlErrors, setUrlErrors] = useState({
    linkedin: '',
    twitter: '',
    instagram: '',
    website: ''
  });

  const isValidGstin = (val) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val);

  const handleVerify = async () => {
    if (!isValidGstin(gstin)) {
      setError('Invalid GSTIN format. Please enter a valid 15-digit GSTIN.');
      setCompany(null);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await OrganizationService.fetchByGST(gstin);

      if (response.success) {
        const gstData = response.data;

        // Map processed GST API response to our company state
        const companyData = {
          gstin: gstData.gstin || gstin,
          name: gstData.name || gstData.tradeName || gstData.legalName || 'Unknown',
          legalName: gstData.legalName || '',
          tradeName: gstData.tradeName || '',
          businessType: gstData.businessType || '',
          businessNature: gstData.businessActivities || [],
          registrationDate: gstData.registrationDate || '',
          status: gstData.status || '',
          address: {
            street: gstData.address?.street || '',
            city: gstData.address?.city || '',
            state: gstData.address?.state || '',
            pincode: gstData.address?.pincode || '',
            fullAddress: gstData.address?.fullAddress || '',
            building: gstData.address?.building || '',
            locality: gstData.address?.locality || ''
          }
        };

        setCompany(companyData);

        // Pre-fill form with processed GST data
        setForm(prev => ({
          ...prev,
          about: '', // No description in GST API, user will fill this
          address: {
            street: gstData.address?.street || '',
            city: gstData.address?.city || '',
            state: gstData.address?.state || '',
            pincode: gstData.address?.pincode || '',
            country: gstData.address?.country || 'India'
          }
        }));
      } else {
        setError('Organization not found in GST records. Please check your GSTIN.');
        setCompany(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to verify GSTIN. Please try again.');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const validateURLs = () => {
    let valid = true;
    let errors = { linkedin: '', twitter: '', instagram: '', website: '' };

    if (form.linkedin && !form.linkedin.startsWith('https://www.linkedin.com/')) {
      errors.linkedin = 'LinkedIn URL must start with https://www.linkedin.com/';
      valid = false;
    }

    if (form.twitter && !form.twitter.startsWith('https://twitter.com/')) {
      errors.twitter = 'Twitter URL must start with https://twitter.com/';
      valid = false;
    }

    if (form.instagram && !form.instagram.startsWith('https://www.instagram.com/')) {
      errors.instagram = 'Instagram URL must start with https://www.instagram.com/';
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

  // Separate function for validation without side effects
  const checkURLsValid = () => {
    if (form.linkedin && !form.linkedin.startsWith('https://www.linkedin.com/')) {
      return false;
    }

    if (form.twitter && !form.twitter.startsWith('https://twitter.com/')) {
      return false;
    }

    if (form.instagram && !form.instagram.startsWith('https://www.instagram.com/')) {
      return false;
    }

    if (
      form.website &&
      !(form.website.startsWith('https://') || form.website.startsWith('http://'))
    ) {
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: files ? files[0] : value
      }));
    }

    // Clear URL errors when user starts typing
    if (urlErrors[name]) {
      setUrlErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Memoized form validation to prevent infinite re-renders
  const isFormValid = useMemo(() => {
    return (
      company &&
      form.email.trim() &&
      form.phone.trim() &&
      form.about.trim() &&
      form.companySize.trim() &&
      checkURLsValid()
    );
  }, [company, form.email, form.phone, form.about, form.companySize, form.linkedin, form.twitter, form.instagram, form.website]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Please fill out all required fields with valid values before submitting.');
      return;
    }

    // Validate URLs and set errors for display
    if (!validateURLs()) {
      setError('Please fix the URL validation errors before submitting.');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      // Prepare organization data according to our backend model
      const organizationData = {
        gstin: company.gstin,
        name: company.name,
        website: form.website,
        description: {
          about: form.about,
          vision: form.vision,
          mission: form.mission,
          benefits: form.benefits ? form.benefits.split(',').map(b => b.trim()).filter(b => b) : []
        },
        contact: {
          email: form.email,
          phone: form.phone,
          address: form.address
        },
        socialMedia: {
          linkedin: form.linkedin,
          twitter: form.twitter,
          instagram: form.instagram
        },
        companySize: form.companySize,
        autoFetch: true // This tells backend we already have GST data
      };

      // Create organization
      const response = await OrganizationService.createOrganization(organizationData);

      if (response.success) {
        // If we have logo or banner files, upload them
        if (form.logo || form.banner) {
          const formData = new FormData();
          if (form.logo) formData.append('logo', form.logo);
          if (form.banner) formData.append('banner', form.banner);

          try {
            await OrganizationService.uploadImages(response.data._id, formData);
          } catch (uploadError) {
            console.warn(uploadError);
            // Continue anyway, organization is created
          }
        }

        // Update user's organization reference
        // The backend should handle creating the recruiter profile, but we can update locally for now
        const userData = {
          ...user,
          organizationId: response.data._id,
          recruiterProfile: {
            ...user.recruiterProfile,
            organizationId: response.data
          }
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));

        navigate('/registration-success', {
          state: {
            organization: response.data,
            message: 'Organization registered successfully!'
          }
        });
      } else {
        setError(response.message || 'Failed to register organization');
      }
    } catch (error) {
      console.error(error);
      setError(error.message || 'Registration failed. Please try again.');
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
                        <span className="text-gray-700">{company.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">GSTIN:</span>
                        <span className="text-gray-700 font-mono">{company.gstin}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Legal Name:</span>
                        <span className="text-gray-700">{company.legalName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Trade Name:</span>
                        <span className="text-gray-700">{company.tradeName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Business Type:</span>
                        <span className="text-gray-700">{company.businessType || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Registration Date:</span>
                        <span className="text-gray-700">{company.registrationDate || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Status:</span>
                        <span className={`font-semibold ${company.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                          {company.status || 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-full flex items-start gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                        <span className="font-medium">Full Address:</span>
                        <span className="text-gray-700">
                          {company.address?.fullAddress || 'N/A'}
                        </span>
                      </div>
                      {company.address?.building && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Building:</span>
                          <span className="text-gray-700">{company.address.building}</span>
                        </div>
                      )}
                      {company.address?.locality && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Locality:</span>
                          <span className="text-gray-700">{company.address.locality}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">City:</span>
                        <span className="text-gray-700">{company.address?.city || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">State:</span>
                        <span className="text-gray-700">{company.address?.state || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Pincode:</span>
                        <span className="text-gray-700">{company.address?.pincode || 'N/A'}</span>
                      </div>
                      {company.businessNature && company.businessNature.length > 0 && (
                        <div className="col-span-full flex items-start gap-2">
                          <Target className="w-4 h-4 text-blue-600 mt-1" />
                          <span className="font-medium">Business Activities:</span>
                          <span className="text-gray-700">{company.businessNature.join(', ')}</span>
                        </div>
                      )}
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

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="contact@yourcompany.com"
                          className={inputClasses}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          className={inputClasses}
                          required
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Company Address
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="address.street"
                            value={form.address.street}
                            onChange={handleChange}
                            placeholder="Enter street address"
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={form.address.city}
                            onChange={handleChange}
                            placeholder="Enter city"
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            name="address.state"
                            value={form.address.state}
                            onChange={handleChange}
                            placeholder="Enter state"
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Pincode
                          </label>
                          <input
                            type="text"
                            name="address.pincode"
                            value={form.address.pincode}
                            onChange={handleChange}
                            placeholder="Enter pincode"
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            name="address.country"
                            value={form.address.country}
                            onChange={handleChange}
                            placeholder="Enter country"
                            className={inputClasses}
                          />
                        </div>
                      </div>
                    </div>

                    {/* File Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-blue-600" />
                            Company Logo
                          </div>
                        </label>
                        <input
                          type="file"
                          name="logo"
                          onChange={handleChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-blue-600" />
                            Company Banner
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

                    {/* Company Description */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          About Company <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <textarea
                        name="about"
                        value={form.about}
                        onChange={handleChange}
                        placeholder="Describe your company, what you do, your culture, and what makes you unique..."
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-none"
                        required
                      />
                    </div>

                    {/* Mission, Vision, and Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            Mission
                          </div>
                        </label>
                        <textarea
                          name="mission"
                          value={form.mission}
                          onChange={handleChange}
                          placeholder="Company mission statement..."
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-600" />
                            Vision
                          </div>
                        </label>
                        <textarea
                          name="vision"
                          value={form.vision}
                          onChange={handleChange}
                          placeholder="Company vision statement..."
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            Employee Benefits
                          </div>
                        </label>
                        <textarea
                          name="benefits"
                          value={form.benefits}
                          onChange={handleChange}
                          placeholder="Health insurance, flexible hours, remote work... (comma separated)"
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          Company Website
                        </div>
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="https://www.yourcompany.com"
                        className={urlErrors.website ? errorInputClasses : inputClasses}
                      />
                      {urlErrors.website && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {urlErrors.website}
                        </p>
                      )}
                    </div>

                    {/* Social Media Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                            LinkedIn URL
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
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                            Twitter URL
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
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                            Instagram URL
                          </div>
                        </label>
                        <input
                          type="url"
                          name="instagram"
                          value={form.instagram}
                          onChange={handleChange}
                          placeholder="https://www.instagram.com/your-company"
                          className={urlErrors.instagram ? errorInputClasses : inputClasses}
                        />
                        {urlErrors.instagram && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {urlErrors.instagram}
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
                        name="companySize"
                        value={form.companySize}
                        onChange={handleChange}
                        className={inputClasses}
                        required
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

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={submitLoading || !isFormValid}
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

