import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../../../contexts/ProfileContext';
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
  Upload
} from 'lucide-react';

export default function OrgProfile() {
  const { profileImage, setProfileImage } = useContext(ProfileContext);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email || 'unknown@email.com';

  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    location: '',
    title: '',
    bio: ''
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem(`orgProfile_${email}`)) || {};
    setFormData({
      fullname: savedData.fullname || '',
      phone: savedData.phone || '',
      email: savedData.email || email,
      location: savedData.location || '',
      title: savedData.title || '',
      bio: savedData.bio || ''
    });

    const savedImage = localStorage.getItem(`orgProfileImage_${email}`);
    if (savedImage) setProfileImage(savedImage);
  }, [email, setProfileImage]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname?.trim()) newErrors.fullname = 'Full name is required';
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem(`orgProfileImage_${email}`, reader.result);
      };
      reader.readAsDataURL(file);
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

    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem(`orgProfile_${email}`, JSON.stringify(formData));
      setSaveSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-gray-800 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-400";
  const errorInputClasses = "w-full px-4 py-3 border-b-2 border-red-300 bg-transparent text-gray-800 focus:border-red-500 focus:outline-none transition-all duration-300 placeholder-gray-400";
  const labelClasses = "block text-gray-700 font-semibold mb-2 text-sm";

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

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-center">
              <div className="px-8 py-3 bg-white rounded-full border-2 border-gray-800 shadow-lg">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Profile Details
                </h1>
              </div>
            </div>
          </div>

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
                    className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200 shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                  </label>
                  <input
                    type="file"
                    id="upload-input"
                    accept="image/*"
                    onChange={handleImageChange}
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
                  <label htmlFor="fullname" className={labelClasses}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.fullname ? errorInputClasses : inputClasses}
                  />
                  {errors.fullname && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullname}
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

