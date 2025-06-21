import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { AuthService } from '../../../services/auth.service';
import { OrganizationService } from '../../../services/organization.service';
import { useOrganizationSearch } from '../../../hooks/useOrganizationSearch';
import {
  User,
  Camera,
  Save,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  UserCircle,
  CheckCircle,
  AlertCircle,
  Upload,
  Building,
  ChevronDown,
  Loader2
} from 'lucide-react';

export default function OrgProfile() {
  const { profileImage, setProfileImage } = useContext(ProfileContext);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Organization search functionality
  const {
    organizations,
    loading: orgLoading,
    searchOrganizations,
    clearSearch
  } = useOrganizationSearch();

  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showEnlistButton, setShowEnlistButton] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    title: '',
    bio: '',
    department: '',
    yearsOfExperience: '',
    linkedinProfile: '',
    specializations: [],
    skills: [],
    workExperience: [],
    education: [],
    certifications: []
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    // Organization search with debouncing
    const searchTimeout = setTimeout(async () => {
      if (orgSearchQuery.trim()) {
        const orgsData = await searchOrganizations(orgSearchQuery, { limit: 10 });
        setShowEnlistButton(orgsData.length === 0);
      } else {
        clearSearch();
        setShowEnlistButton(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [orgSearchQuery, searchOrganizations, clearSearch]);

  useEffect(() => {
    // Handle clicks outside dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOrgDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await AuthService.getProfile();
      const user = response.user;

      if (user) {
        // Set basic user data
        const recruiterProfile = user.recruiterProfile || {};

        setFormData({
          // User fields
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          location: user.location || '',
          // Recruiter profile fields
          title: recruiterProfile.title || '',
          bio: recruiterProfile.bio || '',
          department: recruiterProfile.department || '',
          yearsOfExperience: recruiterProfile.yearsOfExperience || '',
          linkedinProfile: recruiterProfile.linkedinProfile || '',
          specializations: recruiterProfile.specializations || [],
          skills: recruiterProfile.skills || [],
          workExperience: recruiterProfile.workExperience || [],
          education: recruiterProfile.education || [],
          certifications: recruiterProfile.certifications || []
        });

        // Set profile image
        if (user.profilePic) {
          setProfileImage(user.profilePic);
        }

        // Set current organization from recruiter profile
        if (recruiterProfile.organizationId) {
          try {
            const orgResponse = await OrganizationService.getOrganization(recruiterProfile.organizationId._id || recruiterProfile.organizationId);
            const orgData = orgResponse.data;
            setCurrentOrganization(orgData);
            setSelectedOrganization(orgData);
            setOrgSearchQuery(orgData.name);
          } catch (error) {
            console.error('Error fetching organization:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrors({ general: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleOrgSearch = (e) => {
    setOrgSearchQuery(e.target.value);
    setShowOrgDropdown(true);
    if (!e.target.value.trim()) {
      setSelectedOrganization(currentOrganization);
      setShowEnlistButton(false);
    }
  };

  const handleOrgSelect = (org) => {
    setSelectedOrganization(org);
    setOrgSearchQuery(org.name);
    setShowOrgDropdown(false);
    setShowEnlistButton(false);
  };

  const handleEnlistOrganization = () => {
    navigate('/register-organization');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: 'File size should be less than 5MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ image: 'Please select a valid image file' });
        return;
      }

      try {
        setUploadingImage(true);
        setErrors({});

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('profilePic', file);

        // Upload to backend
        const response = await AuthService.uploadProfilePicture(formData);

        if (response.user && response.user.profilePic) {
          setProfileImage(response.user.profilePic);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrors({ image: 'Failed to upload image. Please try again.' });
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrors({});

    try {
      // Check if organization changed
      const organizationChanged = selectedOrganization &&
        selectedOrganization._id !== currentOrganization?._id;

      if (organizationChanged) {
        // Change organization first
        await AuthService.changeOrganization(selectedOrganization._id);
        setCurrentOrganization(selectedOrganization);
      }

      // Update profile data
      const profileData = {
        // User fields
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        // Recruiter profile fields
        title: formData.title,
        bio: formData.bio,
        department: formData.department,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
        linkedinProfile: formData.linkedinProfile,
        specializations: formData.specializations,
        skills: formData.skills,
        workExperience: formData.workExperience,
        education: formData.education,
        certifications: formData.certifications
      };

      const response = await AuthService.updateProfile(profileData);

      if (response.user) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        // Reload profile data to get updated info
        await loadProfileData();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({
        general: error.response?.data?.message || 'Failed to save profile. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-gray-800 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-400";
  const errorInputClasses = "w-full px-4 py-3 border-b-2 border-red-300 bg-transparent text-gray-800 focus:border-red-500 focus:outline-none transition-all duration-300 placeholder-gray-400";
  const labelClasses = "block text-gray-700 font-semibold mb-2 text-sm";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Profile saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{errors.general}</p>
          </div>
        )}

        {/* Image Upload Error */}
        {errors.image && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{errors.image}</p>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border mt-20 border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Profile Photo Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-800 shadow-lg bg-gray-100 flex items-center justify-center">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-32 h-32 text-gray-400" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <label
                    htmlFor="upload-input"
                    className={`flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200 shadow-lg ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </label>
                  <input
                    type="file"
                    id="upload-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Photo</h2>
                <p className="text-gray-600 mb-4">Upload a professional photo to represent your organization</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Upload className="w-4 h-4" />
                  <span>Maximum file size: 5MB • Formats: JPG, PNG, GIF</span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className={labelClasses}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.name ? errorInputClasses : inputClasses}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className={labelClasses}>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      Phone <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 00000 00000"
                    className={errors.phone ? errorInputClasses : inputClasses}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className={labelClasses}>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Email <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@example.com"
                    className={errors.email ? errorInputClasses : inputClasses}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className={labelClasses}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Location
                    </div>
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Organization Selection */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Organization
              </h3>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Select Organization
                </label>
                <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus-within:border-blue-500 focus-within:bg-white transition-all duration-200">
                  <Building className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={orgSearchQuery}
                    onChange={handleOrgSearch}
                    onFocus={() => setShowOrgDropdown(true)}
                    placeholder="Search for your organization..."
                    className="flex-1 bg-transparent outline-none placeholder-gray-500"
                  />
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
                </div>

                {/* Organization Dropdown */}
                {showOrgDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {orgLoading ? (
                      <div className="p-3 text-center">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Searching...</p>
                      </div>
                    ) : organizations.length > 0 ? (
                      <>
                        {organizations.map((org) => (
                          <button
                            key={org._id}
                            type="button"
                            onClick={() => handleOrgSelect(org)}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-gray-900">{org.name}</div>
                            <div className="text-sm text-gray-600">GST: {org.gstin}</div>
                            {org.contact?.city && (
                              <div className="text-sm text-gray-500">{org.contact.city}</div>
                            )}
                          </button>
                        ))}
                      </>
                    ) : orgSearchQuery.trim() && showEnlistButton ? (
                      <div className="p-3">
                        <p className="text-sm text-gray-600 mb-3">
                          No organizations found for "{orgSearchQuery}"
                        </p>
                        <button
                          type="button"
                          onClick={handleEnlistOrganization}
                          className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Enlist Organization
                        </button>
                      </div>
                    ) : orgSearchQuery.trim() ? (
                      <div className="p-3 text-center text-sm text-gray-600">
                        No organizations found
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Current Organization Display */}
                {currentOrganization && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Current Organization:</p>
                    <p className="text-blue-900 font-semibold">{currentOrganization.name}</p>
                    <p className="text-sm text-blue-700">GST: {currentOrganization.gstin}</p>
                  </div>
                )}

                {/* Organization Change Warning */}
                {selectedOrganization && selectedOrganization._id !== currentOrganization?._id && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-yellow-800 font-medium">Organization Change</p>
                        <p className="text-sm text-yellow-700">
                          You will be moved from <strong>{currentOrganization?.name}</strong> to <strong>{selectedOrganization.name}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Professional Information
              </h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className={labelClasses}>
                    Job Title / Position
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer, Project Manager"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className={labelClasses}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Professional Bio
                    </div>
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your professional background, experience, and what drives you..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder-gray-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="department" className={labelClasses}>
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Human Resources, Engineering"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="yearsOfExperience" className={labelClasses}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="linkedinProfile" className={labelClasses}>
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    </div>
  );
}

