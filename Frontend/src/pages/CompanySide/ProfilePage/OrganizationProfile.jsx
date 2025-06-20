import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { OrganizationService } from '../../../services/organization.service';
import {
  Building2,
  Edit3,
  Save,
  X,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Linkedin,
  Twitter,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Eye,
  Target
} from 'lucide-react';

export default function OrganizationProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
  }, [user]);

  const loadOrganization = async () => {
    const organizationId = user?.recruiterProfile?.organizationId?._id || user?.recruiterProfile?.organizationId || user?.organizationId;
    if (!organizationId) {
      setError('No organization found for this user');
      setLoading(false);
      return;
    }

    try {
      const response = await OrganizationService.getOrganization(organizationId);
      if (response.success) {
        setOrganization(response.data);
        setFormData({
          name: response.data.name || '',
          website: response.data.website || '',
          description: {
            about: response.data.description?.about || '',
            vision: response.data.description?.vision || '',
            mission: response.data.description?.mission || '',
            benefits: response.data.description?.benefits || []
          },
          contact: {
            email: response.data.contact?.email || '',
            phone: response.data.contact?.phone || '',
            address: {
              street: response.data.contact?.address?.street || '',
              city: response.data.contact?.address?.city || '',
              state: response.data.contact?.address?.state || '',
              pincode: response.data.contact?.address?.pincode || '',
              country: response.data.contact?.address?.country || 'India'
            }
          },
          socialMedia: {
            linkedin: response.data.socialMedia?.linkedin || '',
            twitter: response.data.socialMedia?.twitter || '',
            instagram: response.data.socialMedia?.instagram || ''
          },
          companySize: response.data.companySize || ''
        });
      } else {
        setError('Failed to load organization details');
      }
    } catch (err) {
      console.error('Error loading organization:', err);
      setError('Failed to load organization details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
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
  };

  const handleBenefitsChange = (e) => {
    const benefits = e.target.value.split(',').map(b => b.trim()).filter(b => b);
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        benefits
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await OrganizationService.updateOrganization(organization._id, formData);
      if (response.success) {
        setOrganization(response.data);
        setEditing(false);
        setSuccess('Organization profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to update organization');
      }
    } catch (err) {
      console.error('Error updating organization:', err);
      setError('Failed to update organization profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
    // Reset form data to original values
    loadOrganization();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading organization profile...</span>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Organization Found</h2>
          <p className="text-gray-600 mb-4">You need to register an organization first.</p>
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

  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const textareaClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto mt-20">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                {organization.logo ? (
                  <img src={organization.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
                <p className="text-gray-600">Organization Profile</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  ) : (
                    <p className="text-gray-900 py-3">{organization.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.yourcompany.com"
                      className={inputClasses}
                    />
                  ) : (
                    <div className="py-3">
                      {organization.website ? (
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {organization.website}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  {editing ? (
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className={inputClasses}
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-3">{organization.companySize || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <p className="text-gray-900 py-3 font-mono">{organization.gstin}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Company Description
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Company
                  </label>
                  {editing ? (
                    <textarea
                      name="description.about"
                      value={formData.description.about}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Describe your company, what you do, your culture..."
                      className={textareaClasses}
                    />
                  ) : (
                    <p className="text-gray-900 py-3 whitespace-pre-wrap">
                      {organization.description?.about || 'No description provided'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mission
                    </label>
                    {editing ? (
                      <textarea
                        name="description.mission"
                        value={formData.description.mission}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Company mission statement..."
                        className={textareaClasses}
                      />
                    ) : (
                      <p className="text-gray-900 py-3 whitespace-pre-wrap">
                        {organization.description?.mission || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vision
                    </label>
                    {editing ? (
                      <textarea
                        name="description.vision"
                        value={formData.description.vision}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Company vision statement..."
                        className={textareaClasses}
                      />
                    ) : (
                      <p className="text-gray-900 py-3 whitespace-pre-wrap">
                        {organization.description?.vision || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Benefits
                  </label>
                  {editing ? (
                    <textarea
                      value={formData.description.benefits.join(', ')}
                      onChange={handleBenefitsChange}
                      rows="2"
                      placeholder="Health insurance, flexible hours, remote work... (comma separated)"
                      className={textareaClasses}
                    />
                  ) : (
                    <div className="py-3">
                      {organization.description?.benefits?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {organization.description.benefits.map((benefit, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No benefits listed</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="contact.email"
                      value={formData.contact.email}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{organization.contact?.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="contact.phone"
                      value={formData.contact.phone}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{organization.contact?.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {editing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        name="contact.address.street"
                        value={formData.contact.address.street}
                        onChange={handleInputChange}
                        placeholder="Street address"
                        className={inputClasses}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          name="contact.address.city"
                          value={formData.contact.address.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className={inputClasses}
                        />
                        <input
                          type="text"
                          name="contact.address.state"
                          value={formData.contact.address.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          className={inputClasses}
                        />
                      </div>
                      <input
                        type="text"
                        name="contact.address.pincode"
                        value={formData.contact.address.pincode}
                        onChange={handleInputChange}
                        placeholder="Pincode"
                        className={inputClasses}
                      />
                    </div>
                  ) : (
                    <div className="py-2">
                      {organization.contact?.address ? (
                        <p className="text-gray-900">
                          {[
                            organization.contact.address.street,
                            organization.contact.address.city,
                            organization.contact.address.state,
                            organization.contact.address.pincode
                          ].filter(Boolean).join(', ')}
                        </p>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Social Media
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    LinkedIn
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="socialMedia.linkedin"
                      value={formData.socialMedia.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://www.linkedin.com/company/..."
                      className={inputClasses}
                    />
                  ) : (
                    <div className="py-2">
                      {organization.socialMedia?.linkedin ? (
                        <a
                          href={organization.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          View Profile
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Twitter className="w-4 h-4 text-blue-600" />
                    Twitter
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="socialMedia.twitter"
                      value={formData.socialMedia.twitter}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/..."
                      className={inputClasses}
                    />
                  ) : (
                    <div className="py-2">
                      {organization.socialMedia?.twitter ? (
                        <a
                          href={organization.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          View Profile
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    Instagram
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="socialMedia.instagram"
                      value={formData.socialMedia.instagram}
                      onChange={handleInputChange}
                      placeholder="https://www.instagram.com/..."
                      className={inputClasses}
                    />
                  ) : (
                    <div className="py-2">
                      {organization.socialMedia?.instagram ? (
                        <a
                          href={organization.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          View Profile
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Quick Actions
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700 font-medium">View Dashboard</span>
                </button>

                <button
                  onClick={() => navigate('/postjob')}
                  className="w-full flex items-center gap-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Building2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Post New Job</span>
                </button>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
