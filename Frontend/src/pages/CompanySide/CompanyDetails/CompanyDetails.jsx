import React, { useEffect, useState, useRef } from 'react';
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
  AlertCircle,
  Camera,
  Upload,
  Loader,
  X,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { OrganizationService } from '../../../services/organization.service';
import { UserIdUtils } from '../../../utils/userIdUtils';
import { safeGetOrganizationId } from '../../../utils/debugUtils';

const CompanyDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: {
      about: '',
      vision: '',
      mission: '',
      benefits: []
    },
    contact: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    },
    socialMedia: {
      linkedin: '',
      twitter: '',
      instagram: ''
    },
    companySize: ''
  });

  useEffect(() => {
    loadOrganization();
  }, [user]);  const loadOrganization = async () => {
    const organizationId = safeGetOrganizationId(user, 'CompanyDetails.loadOrganization');
    const debugInfo = UserIdUtils.debugOrganizationId(user);
    console.log('Organization ID debug info:', debugInfo); // Debug log
    
    if (!organizationId) {
      setErrors({ general: 'No organization found for this user. Please ensure you are logged in as a recruiter with an associated organization.' });
      setLoading(false);
      return;
    }

    // Additional validation for organization ID
    if (organizationId === '[object Object]') {
      setErrors({ general: 'Invalid organization ID format. Please log out and log back in.' });
      setLoading(false);
      return;
    }

    try {
      const response = await OrganizationService.getOrganization(organizationId);
      if (response.success) {
        const orgData = response.data;
        setOrganization(orgData);
        setFormData({
          name: orgData.name || '',
          website: orgData.website || '',
          description: {
            about: orgData.description?.about || '',
            vision: orgData.description?.vision || '',
            mission: orgData.description?.mission || '',
            benefits: orgData.description?.benefits || []
          },
          contact: {
            email: orgData.contact?.email || '',
            phone: orgData.contact?.phone || '',
            address: {
              street: orgData.contact?.address?.street || '',
              city: orgData.contact?.address?.city || '',
              state: orgData.contact?.address?.state || '',
              pincode: orgData.contact?.address?.pincode || '',
              country: orgData.contact?.address?.country || 'India'
            }
          },
          socialMedia: {
            linkedin: orgData.socialMedia?.linkedin || '',
            twitter: orgData.socialMedia?.twitter || '',
            instagram: orgData.socialMedia?.instagram || ''
          },
          companySize: orgData.companySize || ''
        });
      } else {
        setErrors({ general: 'Failed to load organization details' });
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: 'Failed to load organization details' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: grandchild ? {
            ...prev[parent][child],
            [grandchild]: value
          } : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    const organizationId = organization?.id;
    if (!organizationId) {
      setErrors({ [type]: 'Organization not found' });
      return;
    }

    try {
      if (type === 'logo') {
        setUploadingLogo(true);
      } else {
        setUploadingBanner(true);
      }

      const formData = new FormData();
      formData.append(type, file);

      const response = await OrganizationService.uploadImages(organizationId, formData);

      if (response.success) {
        // Update organization state with new image URL
        setOrganization(prev => ({
          ...prev,
          [type]: response.data[type]
        }));

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setErrors({ [type]: `Failed to upload ${type}. Please try again.` });
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

  const handleSave = async () => {
    if (!organization?.id) {
      setErrors({ general: 'Organization not found' });
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const response = await OrganizationService.updateOrganization(organization.id, formData);

      if (response.success) {
        setOrganization(response.data);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: 'Failed to update organization details' });
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (errors.general) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Organization</h2>
            <p className="text-gray-600 mb-6">{errors.general}</p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto mt-20">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800 font-medium">Organization details updated successfully!</span>
          </div>
        )}

        {/* Header with Organization Banner */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Banner Section */}
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
            {organization?.banner && (
              <img
                src={organization.banner}
                alt="Organization banner"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>

            {/* Banner Upload Button */}
            <div className="absolute top-4 right-4">
              <input
                type="file"
                ref={bannerInputRef}
                onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-90 text-gray-700 rounded-lg hover:bg-opacity-100 transition-all duration-200 font-medium"
              >
                {uploadingBanner ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Change Banner
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Organization Info Header */}
          <div className="relative px-8 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Organization Logo */}
              <div className="relative -mt-20 mb-4 md:mb-0">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                  {organization?.logo ? (
                    <img
                      src={organization.logo}
                      alt="Organization logo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Building2 className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                {/* Logo Upload Button */}
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 shadow-lg"
                  >
                    {uploadingLogo ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Organization Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{organization?.name}</h1>
                    <p className="text-gray-600 mb-4">Organization Profile Management</p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      {organization?.contact?.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{organization.contact.address.city}, {organization.contact.address.state}</span>
                        </div>
                      )}
                      {organization?.companySize && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{organization.companySize} employees</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
                    value={organization?.gstin || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 text-gray-500 cursor-not-allowed"
                    placeholder="GST number"
                  />
                </div>
              </div>

              {/* Organization Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  Organization Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter organization name"
                />
              </div>
              {/* Contact Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Contact Email
                </label>
                <input
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleInputChange}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@company.com"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Contact Phone
                </label>
                <input
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleInputChange}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <div className="space-y-3">
                  <input
                    name="contact.address.street"
                    value={formData.contact.address.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="contact.address.city"
                      value={formData.contact.address.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City"
                    />
                    <input
                      name="contact.address.state"
                      value={formData.contact.address.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="State"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="contact.address.pincode"
                      value={formData.contact.address.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Pincode"
                    />
                    <input
                      name="contact.address.country"
                      value={formData.contact.address.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Website URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Globe className="w-4 h-4" />
                  Website URL
                </label>
                <input
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.company.com"
                />
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn URL
                </label>
                <input
                  name="socialMedia.linkedin"
                  value={formData.socialMedia.linkedin}
                  onChange={handleInputChange}
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.linkedin.com/company/yourcompany"
                />
              </div>

              {/* Company Size */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4" />
                  Company Size
                </label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
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

              {/* About */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  About Organization
                </label>
                <textarea
                  name="description.about"
                  value={formData.description.about}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-vertical min-h-[100px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your organization, what you do, and your values..."
                />
              </div>

              {/* Mission */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Eye className="w-4 h-4" />
                  Mission Statement
                </label>
                <textarea
                  name="description.mission"
                  value={formData.description.mission}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-vertical min-h-[80px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your organization's mission and what drives you..."
                />
              </div>

              {/* Vision */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Eye className="w-4 h-4" />
                  Vision Statement
                </label>
                <textarea
                  name="description.vision"
                  value={formData.description.vision}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-vertical min-h-[80px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your organization's vision for the future..."
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
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold border-none rounded-lg text-base cursor-pointer transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
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
      </div>
    </div>
  );
};

export default CompanyDetails;
