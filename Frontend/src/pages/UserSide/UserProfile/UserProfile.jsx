import React, { useContext, useEffect, useState } from 'react';
import {
  User,
  Camera,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  SkipBack,
  FileText,
  Save,
  LogOut,
  UserCircle,
  Loader,
  ExternalLink,
  Download,
  Upload,
  Plus,
  X,
  GraduationCap,
  Award
} from 'lucide-react';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { AuthService } from '../../../services/auth.service';
import { ResumeService } from '../../../services/resume.service';
import { useNavigate } from 'react-router-dom';
import { formatJobDate } from '../../../utils/dateUtils';

export default function UserProfile() {
  const navigate = useNavigate();
  const { profileImage, setProfileImage } = useContext(ProfileContext);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeResume, setActiveResume] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    title: '',
    bio: '',
  });

  const [skills, setSkills] = useState([{ name: '', level: 'intermediate' }]);
  const [experience, setExperience] = useState([{
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  }]);
  const [education, setEducation] = useState([{
    degree: '',
    institution: '',
    startYear: '',
    endYear: '',
    score: ''
  }]);

  const [userEmail, setCurrentUserEmail] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Helper function to safely convert date
  const safeFormatDate = (dateValue) => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Invalid date value:', dateValue, error);
      return '';
    }
  };

  // Function to refresh profile data
  const refreshProfile = async (force = false) => {
    try {
      setLoading(true);      // Clear cache if force refresh
      if (force) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || user.id;
        if (userId) {
          const profileCacheKey = `user_profile_${userId}`;
          // Clear from cache service if available
          if (window.cacheService) {
            window.cacheService.delete(profileCacheKey);
          }
        }
      }

      const profileResponse = await AuthService.getProfile();
      console.log('Refreshed profile response:', profileResponse);
      const user = profileResponse.user || profileResponse.data || profileResponse;

      if (user) {
        console.log('Refreshed user data:', user);
        setCurrentUserEmail(user.email);
        setFormData({
          fullName: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          location: user.location || '',
          title: user.jobseekerProfile?.jobPreferences?.titles?.[0] || '',
          bio: user.jobseekerProfile?.bio || '',
        });

        // Set skills, education, and experience from jobseeker profile
        if (user.jobseekerProfile?.skills?.length > 0) {
          setSkills(user.jobseekerProfile.skills);
        }
        if (user.jobseekerProfile?.experience?.length > 0) {
          setExperience(user.jobseekerProfile.experience.map(exp => ({
            ...exp,
            startDate: safeFormatDate(exp.startDate),
            endDate: safeFormatDate(exp.endDate)
          })));
        }
        if (user.jobseekerProfile?.education?.length > 0) {
          setEducation(user.jobseekerProfile.education);
        }

        if (user.profilePic) {
          setProfileImage(user.profilePic);
        }

        setProfileCompleted(user.profileCompleted || false);

        // Set active resume if available
        if (user.activeResume) {
          console.log('✅ UserProfile: Setting active resume from user data:', user.activeResume);
          setActiveResume(user.activeResume);
        } else {
          // Try to fetch active resume separately
          try {
            console.log('🔍 UserProfile: Fetching active resume separately...');
            const resumeResponse = await ResumeService.getUserActiveResume();
            console.log('📄 UserProfile: Resume response:', resumeResponse);

            // Handle the new response format
            if (resumeResponse.hasActiveResume && resumeResponse.activeResume) {
              console.log('✅ UserProfile: Setting active resume from response.activeResume:', resumeResponse.activeResume);
              setActiveResume(resumeResponse.activeResume);
            } else if (resumeResponse._id) {
              // Handle backward compatibility if the response is the resume object directly
              console.log('✅ UserProfile: Setting active resume from direct response:', resumeResponse);
              setActiveResume(resumeResponse);
            } else {
              console.log('❌ UserProfile: No active resume found in response');
              setActiveResume(null);
            }
          } catch (resumeError) {
            console.error('❌ UserProfile: Error fetching active resume:', resumeError);
            setActiveResume(null);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized) return;

    const fetchUserProfile = async () => {
      try {
        // Check if we should force refresh (e.g., coming from resume upload)
        const shouldForceRefresh = sessionStorage.getItem('forceProfileRefresh') === 'true';
        if (shouldForceRefresh) {
          console.log('🔄 UserProfile: Force refreshing profile due to session flag');
          sessionStorage.removeItem('forceProfileRefresh');
        }

        await refreshProfile(shouldForceRefresh);
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        // Fallback to localStorage if backend is not available
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Fallback to localStorage user:', user);
        if (user?.email) {
          setCurrentUserEmail(user.email);
          const userProfile = JSON.parse(localStorage.getItem(`user_profile_${user.email}`) || '{}');
          console.log('Loaded profile from localStorage:', userProfile);
          if (userProfile.formData) {
            setFormData(userProfile.formData);
            setProfileImage(userProfile.profileImage || '');
            if (userProfile.skills) setSkills(userProfile.skills);
            if (userProfile.experience) setExperience(userProfile.experience);
            if (userProfile.education) setEducation(userProfile.education);
          } else {
            // Set basic user data from localStorage
            setFormData({
              fullName: user.name || '',
              phone: user.phone || '',
              email: user.email || '',
              location: user.location || '',
              title: '',
              bio: '',
            });
          }
        }
      } finally {
        setHasInitialized(true);
      }
    };

    fetchUserProfile();
  }, []); // Remove setProfileImage dependency to prevent infinite loop
  const handleImageChange = async (e) => {
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

      try {
        setLoading(true);
        // Upload to backend
        const formData = new FormData();
        formData.append('profilePic', file); const response = await AuthService.uploadProfilePicture(formData);
        setProfileImage(response.user.profilePic);
        setErrors(prev => ({ ...prev, image: '' }));

        // Update localStorage to sync with navbar
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.profilePic = response.user.profilePic;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));

        // Also set as preview
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(response.user.profilePic || imageUrl);
      } catch (error) {
        console.error(error);
        setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));

        // Fallback to local preview
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);
      } finally {
        setLoading(false);
      }
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

  // Skills handlers
  const addSkill = () => {
    setSkills([...skills, { name: '', level: 'intermediate' }]);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index, field, value) => {
    const updatedSkills = skills.map((skill, i) =>
      i === index ? { ...skill, [field]: value } : skill
    );
    setSkills(updatedSkills);
  };

  // Experience handlers
  const addExperience = () => {
    setExperience([...experience, {
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }]);
  };

  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const updatedExperience = experience.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    setExperience(updatedExperience);
  };

  // Education handlers
  const addEducation = () => {
    setEducation([...education, {
      degree: '',
      institution: '',
      startYear: '',
      endYear: '',
      score: ''
    }]);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    const updatedEducation = education.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    setEducation(updatedEducation);
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

    if (!userEmail) {
      setErrors(prev => ({ ...prev, general: 'No user found!' }));
      return;
    }

    setIsUpdating(true);
    setErrors({}); try {
      // Prepare update data
      const updateData = {
        name: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        // Add job seeker specific data
        skills: skills.filter(skill => skill.name.trim() !== ''),
        experience: experience.filter(exp => exp.title.trim() !== '' || exp.company.trim() !== '').map(exp => {
          // Helper function to safely convert date for submission
          const safeConvertDate = (dateValue) => {
            if (!dateValue) return null;
            try {
              const date = new Date(dateValue);
              if (isNaN(date.getTime())) return null;
              return date;
            } catch (error) {
              console.warn('Invalid date value for submission:', dateValue, error);
              return null;
            }
          };

          return {
            ...exp,
            startDate: safeConvertDate(exp.startDate),
            endDate: safeConvertDate(exp.endDate)
          };
        }),
        education: education.filter(edu => edu.degree.trim() !== '' || edu.institution.trim() !== ''),
        jobPreferences: {
          titles: formData.title ? [formData.title] : []
        },
        bio: formData.bio
      };

      const response = await AuthService.updateProfile(updateData);
      console.log('Profile update response:', response);

      setProfileCompleted(true);

      // Update localStorage with the updated user data
      if (response.user) {
        // Update the main user object in localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          ...response.user,
          // Ensure we preserve the jobseeker profile data
          jobseekerProfile: response.jobseekerProfile || currentUser.jobseekerProfile
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Updated user in localStorage:', updatedUser);
      }

      // Also save profile data as backup
      const profileData = {
        formData,
        profileImage,
        skills,
        experience,
        education
      };
      localStorage.setItem(`user_profile_${userEmail}`, JSON.stringify(profileData));
      console.log('Saved profile backup to localStorage');

      // Optionally refetch the profile to ensure we have the latest data
      try {
        const freshProfile = await AuthService.getProfile();
        console.log('Fresh profile after update:', freshProfile);
        const freshUser = freshProfile.user || freshProfile.data || freshProfile;
        if (freshUser) {
          // Update form data with fresh data from server
          setFormData({
            fullName: freshUser.name || '',
            phone: freshUser.phone || '',
            email: freshUser.email || '',
            location: freshUser.location || '',
            title: freshUser.jobseekerProfile?.jobPreferences?.titles?.[0] || '',
            bio: freshUser.jobseekerProfile?.bio || '',
          });

          if (freshUser.jobseekerProfile?.skills?.length > 0) {
            setSkills(freshUser.jobseekerProfile.skills);
          }
          if (freshUser.jobseekerProfile?.experience?.length > 0) {
            setExperience(freshUser.jobseekerProfile.experience.map(exp => ({
              ...exp,
              startDate: safeFormatDate(exp.startDate),
              endDate: safeFormatDate(exp.endDate)
            })));
          }
          if (freshUser.jobseekerProfile?.education?.length > 0) {
            setEducation(freshUser.jobseekerProfile.education);
          }

          // Also refresh resume data
          if (freshUser.activeResume) {
            console.log('Setting fresh active resume:', freshUser.activeResume);
            setActiveResume(freshUser.activeResume);
          } else {
            // Try to fetch active resume separately
            try {
              const resumeResponse = await ResumeService.getUserActiveResume();
              console.log('Fresh resume response:', resumeResponse);
              if (resumeResponse.hasActiveResume && resumeResponse.activeResume) {
                setActiveResume(resumeResponse.activeResume);
              } else if (resumeResponse._id) {
                setActiveResume(resumeResponse);
              } else {
                setActiveResume(null);
              }
            } catch (resumeError) {
              console.log('Could not fetch fresh resume:', resumeError);
            }
          }
        }
      } catch (refreshError) {
        console.log('Could not refresh profile after update:', refreshError);
      }

      alert("✅ Profile details saved successfully!");
    } catch (error) {
      console.error(error);
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.message || 'Failed to update profile. Please try again.'
      }));

      // Fallback to localStorage
      const profileData = {
        formData,
        profileImage,
      };
      localStorage.setItem(`user_profile_${userEmail}`, JSON.stringify(profileData));
      alert("✅ Profile details saved locally!");
    } finally {
      setIsUpdating(false);
    }
  };
  // Handle resume download with proper error handling
  const handleResumeDownload = async (resume) => {
    try {
      const filename = resume.filename || `resume-${resume._id || 'unknown'}.pdf`;

      // First try the downloadUrl which should have the attachment flag
      if (resume.downloadUrl) {
        const link = document.createElement('a');
        link.href = resume.downloadUrl;
        link.download = filename;
        link.target = '_blank';
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Fallback: Use cloudinarySecureUrl with download transformation
      if (resume.cloudinarySecureUrl) {
        // Extract publicid from the Cloudinary URL
        const url = resume.cloudinarySecureUrl;

        // Create a direct download link with Cloudinary transformations
        const downloadLink = url.replace('/upload/', '/upload/fl_attachment/');

        const link = document.createElement('a');
        link.href = downloadLink;
        link.download = filename;
        link.target = '_blank';
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Final fallback: Use fileUrl
      if (resume.fileUrl) {
        window.open(resume.fileUrl, '_blank');
        return;
      }

      throw new Error('No download URL available');
    } catch (error) {
      console.error(error);

      // Try alternative download method
      try {
        await handleResumeDownloadAlternative(resume);
      } catch (altError) {
        console.error(altError);

        // Last resort: Open any available URL in new tab
        const fallbackUrl = resume.cloudinarySecureUrl || resume.downloadUrl || resume.fileUrl;
        if (fallbackUrl) {
          window.open(fallbackUrl, '_blank');
          // Show user message about manual download
          setTimeout(() => {
            alert('The file has opened in a new tab. Please right-click and select "Save As..." to download it to your device.');
          }, 1000);
        } else {
          alert('Resume download is not available. Please try re-uploading your resume.');
        }
      }
    }
  };

  // Alternative download method using fetch for better browser compatibility
  const handleResumeDownloadAlternative = async (resume) => {
    try {
      const downloadUrl = resume.downloadUrl || resume.cloudinarySecureUrl;
      const filename = resume.filename || `resume-${resume._id || 'unknown'}.pdf`;

      if (!downloadUrl) {
        throw new Error('No download URL available');
      }

      // Fetch the file as blob
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth if needed
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      // Fall back to opening in new tab
      const fallbackUrl = resume.cloudinarySecureUrl || resume.downloadUrl;
      if (fallbackUrl) {
        window.open(fallbackUrl, '_blank');
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Use the proper auth service logout method
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser'); // Remove legacy key if exists
      navigate('/');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {loading ? (
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className=" mb-8 mt-20 grid grid-cols-2">
            <h1 className="text-3xl colspan-1 font-bold text-gray-900 mb-2">User Profile</h1>
            <h1 className="text-end text-3xl colspan-2 font-bold text-gray-600 mb-2">{formData.fullName}, {formData.title}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.fullName ? 'border-red-500' : 'border-gray-300'
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
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.email ? 'border-red-500' : 'border-gray-300'
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
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.phone ? 'border-red-500' : 'border-gray-300'
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
            </div>
          </div>

          {/* Resume Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
              <FileText className="w-5 h-5 mr-3 text-green-600" />
              Resume
            </h2>

            {/* Debug info */}
            {console.log('🔍 UserProfile: Rendering resume section. activeResume:', activeResume)}

            {activeResume ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-green-800 truncate">
                          {activeResume.filename}
                        </h3>                        <p className="text-xs text-green-600 mt-1">
                          Uploaded: {formatJobDate(activeResume.uploadedAt)}
                        </p>
                        <p className="text-xs text-green-600">
                          Size: {(activeResume.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">                      <button
                      onClick={() => window.open(activeResume.cloudinarySecureUrl, '_blank')}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors duration-200"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </button>
                      <button
                        onClick={() => handleResumeDownload(activeResume)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-200"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">No resume uploaded yet</p>
                <p className="text-sm text-gray-500 mb-4">Upload your resume to get better job matches</p>
                <button
                  onClick={() => refreshProfile(true)}
                  className="inline-flex items-center px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Resume Data'}
                </button>
              </div>
            )}
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
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

          {/* Skills Section */}
          <div className="bg-white rounded-xl mb-8 shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-3 text-purple-600" />
                Skills
              </h2>
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </button>
            </div>

            <div className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Skill name (e.g., JavaScript, Project Management)"
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="w-40">
                    <select
                      value={skill.level}
                      onChange={(e) => updateSkill(index, 'level', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  {skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-3 text-blue-600" />
                Work Experience
              </h2>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Experience
              </button>
            </div>

            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
                    {experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Software Engineer"
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        placeholder="e.g., Google Inc."
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        disabled={exp.current}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => {
                          updateExperience(index, 'current', e.target.checked);
                          if (e.target.checked) {
                            updateExperience(index, 'endDate', '');
                          }
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Currently working here</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-3 text-indigo-600" />
                Education
              </h2>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Education
              </button>
            </div>

            <div className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Education {index + 1}</h3>
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <input
                        type="text"
                        placeholder="e.g., Bachelor of Computer Science"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                      <input
                        type="text"
                        placeholder="e.g., Stanford University"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Year</label>
                      <input
                        type="number"
                        placeholder="2020"
                        value={edu.startYear}
                        onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Year</label>
                      <input
                        type="number"
                        placeholder="2024"
                        value={edu.endYear}
                        onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Score/GPA</label>
                      <input
                        type="text"
                        placeholder="3.8/4.0 or 85%"
                        value={edu.score}
                        onChange={(e) => updateEducation(index, 'score', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button
                onClick={() => navigate('/user/job-dashboard')}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50  transition-colors duration-200"
              >
                <SkipBack className="w-4 h-4 mr-2" />
                Back To Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-6 py-3 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>

              <button
                onClick={handleSave}
                disabled={isUpdating || loading}
                className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {isUpdating ? (
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
      )}
    </div>
  );
}
