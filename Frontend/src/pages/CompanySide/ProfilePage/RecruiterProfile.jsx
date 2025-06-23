import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthService } from '../../../services/auth.service';
import { useSmartFetch } from '../../../hooks/useSmartFetch';
import { CacheKeys } from '../../../services/cache.service';
import { formatJobDate } from '../../../utils/dateUtils';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Loader2,
  UserCircle,
  Building2,
  Calendar,
  Users,
  Edit,
  Settings,
  AlertCircle
} from 'lucide-react';

export default function RecruiterProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Smart fetch for recruiter profile
  const {
    data: profileResponse,
    loading,
    error: fetchError,
    refetch: loadProfile
  } = useSmartFetch(
    user ? CacheKeys.USER_PROFILE(user.id || user.id) : null,
    () => AuthService.getProfile(),
    {
      enabled: !!user,
      ttl: 5 * 60 * 1000, // 5 minutes cache
      onSuccess: (data) => {
        console.log('Recruiter profile loaded:', data);
      },
      onError: (err) => {
        console.error('Failed to load recruiter profile:', err);
      }
    }
  );

  // Extract profile data and handle response structure
  const profile = profileResponse?.success ?
    (profileResponse.user || profileResponse.data) :
    (profileResponse?.user || profileResponse);
  const error = fetchError || (!profileResponse?.success && profileResponse?.message ? profileResponse.message : null);

  // Use the centralized date formatting utility
  const formatDate = (dateInput) => {
    return formatJobDate(dateInput);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Profile</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={loadProfile}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">Your profile information could not be loaded.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Background Pattern */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>

          {/* Profile Header */}
          <div className="relative px-8 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4 md:mb-0">
                <div className="w-32 h-32 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                  {profile.profilePic ? (
                    <img 
                      src={profile.profilePic} 
                      alt={`${profile.name} profile`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <UserCircle className="w-20 h-20 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                    <p className="text-lg text-blue-600 font-semibold mb-2">Recruiter</p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                      {profile.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile.recruiterProfile?.organizationId?.name && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{profile.recruiterProfile.organizationId.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => navigate('/company-details')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Organization
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.email && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <a 
                        href={`mailto:${profile.email}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {profile.phone && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Phone</p>
                      <a 
                        href={`tel:${profile.phone}`}
                        className="text-green-600 hover:text-green-700 font-semibold"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Location</p>
                      <p className="text-purple-600 font-semibold">{profile.location}</p>
                    </div>
                  </div>
                )}

                {profile.role && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Role</p>
                      <p className="text-orange-600 font-semibold capitalize">{profile.role}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Organization Information */}
            {profile.recruiterProfile?.organizationId && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Organization Details</h2>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                  {profile.recruiterProfile.organizationId.logo && (
                    <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
                      <img
                        src={profile.recruiterProfile.organizationId.logo}
                        alt={`${profile.recruiterProfile.organizationId.name} logo`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{profile.recruiterProfile.organizationId.name}</h3>
                    {profile.recruiterProfile.organizationId.contact?.address && (
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.recruiterProfile.organizationId.contact.address.city}, {profile.recruiterProfile.organizationId.contact.address.state}</span>
                      </div>
                    )}
                    {profile.recruiterProfile.organizationId.companySize && (
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Users className="w-4 h-4" />
                        <span>{profile.recruiterProfile.organizationId.companySize} employees</span>
                      </div>
                    )}
                    {profile.recruiterProfile.organizationId.description?.about && (
                      <p className="text-gray-700 mt-3 leading-relaxed">{profile.recruiterProfile.organizationId.description.about}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Position</span>
                  <span className="font-semibold text-gray-900 text-sm">{profile.recruiterProfile?.title || 'Recruiter'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Role</span>
                  <span className="font-semibold text-gray-900 capitalize">{profile.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Active</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(profile.lastActivity)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(profile.isActive ? profile.createdAt : profile.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/postjob')}
                  className="flex items-center gap-3 w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <Briefcase className="w-5 h-5" />
                  Post a Job
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-3 w-full p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                >
                  <Users className="w-5 h-5" />
                  View Dashboard
                </button>

                <button
                  onClick={() => navigate('/analytics')}
                  className="flex items-center gap-3 w-full p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                >
                  <Calendar className="w-5 h-5" />
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
