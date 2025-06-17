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
  UserCircle
} from 'lucide-react';

export default function HRDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hrProfile, setHrProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
      const job = jobs.find(j => j.id === Number(id));
      if (job && job.hrDetails) {
        setHrProfile(job.hrDetails);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading HR details...</p>
        </div>
      </div>
    );
  }

  if (!hrProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">HR Details Not Found</h2>
            <p className="text-gray-600 mb-6">The HR profile could not be loaded or doesn't exist.</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {hrProfile.fullname || 'HR Representative'}
                    </h1>
                    <p className="text-blue-100">
                      {hrProfile.title || 'Human Resources'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Phone</h3>
                      <p className="text-gray-600 mt-1">
                        {hrProfile.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Email</h3>
                      <p className="text-gray-600 mt-1">
                        {hrProfile.email || 'Not provided'}
                      </p>
                      {hrProfile.email && (
                        <a
                          href={`mailto:${hrProfile.email}`}
                          className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-block"
                        >
                          Send email
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Location</h3>
                      <p className="text-gray-600 mt-1">
                        {hrProfile.location || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Position</h3>
                      <p className="text-gray-600 mt-1">
                        {hrProfile.title || 'HR Representative'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {hrProfile.bio && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-gray-600" />
                      About
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {hrProfile.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {hrProfile.email && (
                  <a
                    href={`mailto:${hrProfile.email}`}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                )}
                
                {hrProfile.phone && (
                  <a
                    href={`tel:${hrProfile.phone}`}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </a>
                )}
                
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </button>
              </div>
            </div>

            {/* HR Tips */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Interview Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Be prepared to discuss your experience and skills</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Research the company and role beforehand</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Prepare thoughtful questions about the role</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Dress professionally and arrive on time</p>
                </div>
              </div>
            </div>

            {/* Contact Info Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Summary</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-600">{hrProfile.fullname || 'N/A'}</p>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Best time to contact:</span>
                  <p className="text-gray-600">Business hours (9 AM - 5 PM)</p>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Response time:</span>
                  <p className="text-gray-600">Within 24-48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
