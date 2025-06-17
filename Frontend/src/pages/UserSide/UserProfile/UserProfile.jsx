import React, { useContext, useEffect, useState } from 'react';
import { 
  User, 
  Camera, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  FileText,
  Save,
  LogOut,
  UserCircle,
  Loader
} from 'lucide-react';
import { ProfileContext } from '../../../contexts/ProfileContext';

export default function UserProfile() {
  const { profileImage, setProfileImage } = useContext(ProfileContext);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    title: '',
    bio: '',
  });

  const [currentUserEmail, setCurrentUserEmail] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user?.email) {
      setCurrentUserEmail(user.email);
      const userProfile = JSON.parse(localStorage.getItem(`user_profile_${user.email}`));
      if (userProfile) {
        setFormData(userProfile.formData || {});
        setProfileImage(userProfile.profileImage || '');
      }
    }
  }, [setProfileImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!currentUserEmail) {
      alert('No user found!');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const profileData = {
        formData,
        profileImage,
      };

      localStorage.setItem(`user_profile_${currentUserEmail}`, JSON.stringify(profileData));
      setLoading(false);
      alert("✅ Profile details saved successfully!");
    }, 1000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your personal and professional information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Profile Photo</h2>
              
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <UserCircle className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <label htmlFor="photo-upload" className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors duration-200 shadow-lg">
                    <Camera className="w-5 h-5 text-white" />
                  </label>
                  
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {errors.image && (
                  <p className="text-red-600 text-sm mb-4">{errors.image}</p>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Upload a professional photo</p>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF • Max 5MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-3 text-blue-600" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@example.com"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 00000 00000"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, State"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Briefcase className="w-5 h-5 mr-3 text-green-600" />
                Professional Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer, Marketing Manager"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about your professional background, skills, and career goals..."
                      rows="4"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center px-6 py-3 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
