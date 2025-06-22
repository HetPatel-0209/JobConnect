import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Loader,
  UserCircle,
  Building2,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import ChatButton from '../../../components/chat/ChatButton';
import { JobService } from '../../../services/job.service';

export default function HRDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hrProfile, setHrProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecruiterDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await JobService.getRecruiterById(id);
        setHrProfile(response.recruiter);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load recruiter details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecruiterDetails();
    }
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading recruiter details...</p>
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
              <UserCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Recruiter Details</h2>
            <p className="text-gray-600 mb-6">{error}</p>
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
  if (!hrProfile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recruiter Details Not Found</h2>
            <p className="text-gray-600 mb-6">The recruiter information could not be loaded.</p>
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
                  {hrProfile.profilePic ? (
                    <img 
                      src={hrProfile.profilePic} 
                      alt={`${hrProfile.name} profile`}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{hrProfile.name}</h1>
                    <p className="text-lg text-blue-600 font-semibold mb-2">Recruiter</p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                      {hrProfile.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{hrProfile.location}</span>
                        </div>
                      )}
                      {hrProfile.organization?.name && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{hrProfile.organization.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Job
                  </button>
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
                {hrProfile.email && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <a 
                        href={`mailto:${hrProfile.email}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {hrProfile.email}
                      </a>
                    </div>
                  </div>
                )}

                {hrProfile.phone && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Phone</p>
                      <a 
                        href={`tel:${hrProfile.phone}`}
                        className="text-green-600 hover:text-green-700 font-semibold"
                      >
                        {hrProfile.phone}
                      </a>
                    </div>
                  </div>
                )}

                {hrProfile.location && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Location</p>
                      <p className="text-purple-600 font-semibold">{hrProfile.location}</p>
                    </div>
                  </div>
                )}

                {hrProfile.role && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Role</p>
                      <p className="text-orange-600 font-semibold capitalize">{hrProfile.role}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Information */}
            {hrProfile.organization && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Organization Banner */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-blue-600">
                  {hrProfile.organization.banner && (
                    <img
                      src={hrProfile.organization.banner}
                      alt={`${hrProfile.organization.name} banner`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Company Details</h2>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                    {hrProfile.organization.logo && (
                      <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
                        <img
                          src={hrProfile.organization.logo}
                          alt={`${hrProfile.organization.name} logo`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{hrProfile.organization.name}</h3>
                      {hrProfile.organization.contact?.address && (
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{hrProfile.organization.contact.address.city}, {hrProfile.organization.contact.address.state}</span>
                        </div>
                      )}
                      {hrProfile.organization.contact?.email && (
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Mail className="w-4 h-4" />
                          <span>{hrProfile.organization.contact.email}</span>
                        </div>
                      )}
                      {hrProfile.organization.companySize && (
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Users className="w-4 h-4" />
                          <span>{hrProfile.organization.companySize} employees</span>
                        </div>
                      )}
                      {hrProfile.organization.description?.about && (
                        <p className="text-gray-700 mt-3 leading-relaxed">{hrProfile.organization.description.about}</p>
                      )}
                    </div>
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
                  <span className="font-semibold text-gray-900 text-sm">{hrProfile.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Role</span>
                  <span className="font-semibold text-gray-900 capitalize">{hrProfile.role}</span>
                </div>
                {hrProfile.lastSeen && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Seen</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(hrProfile.lastSeen).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {hrProfile.createdAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(hrProfile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Action */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Get in Touch</h3>
              <p className="text-gray-600 mb-6">Have questions about this position? Reach out to the recruiter directly.</p>
              
              <div className="space-y-3">
                <ChatButton
                  recipientId={hrProfile.id}
                  recipientName={hrProfile.name}
                  recipientRole="recruiter"
                  variant="primary"
                  className="w-full"
                  initialMessage={`Hi ${hrProfile.name}! I'm interested in opportunities at ${hrProfile.organization?.name || 'your company'}. I'd love to connect and discuss potential roles.`}
                />

                {hrProfile.email && (
                  <a
                    href={`mailto:${hrProfile.email}`}
                    className="flex items-center gap-3 w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <Mail className="w-5 h-5" />
                    Send Email
                  </a>
                )}

                {hrProfile.phone && (
                  <a
                    href={`tel:${hrProfile.phone}`}
                    className="flex items-center gap-3 w-full p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </a>                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
