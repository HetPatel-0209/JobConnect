import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import successImg from "../../../assets/Success.svg";
import {
  ArrowRight,
  CheckCircle,
  LayoutDashboard,
  UserPlus,
  Building2,
  Users,
  Globe,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';



const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!(user && token));

    // Get organization data from navigation state
    if (location.state?.organization) {
      setOrganization(location.state.organization);
    }
  }, [location.state]);

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const goToAuth = () => {
    navigate("/auth?mode=login&type=recruiter");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center max-w-lg w-full">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <img 
              src={successImg} 
              alt="Registration Successful" 
              className="w-48 h-48 mx-auto drop-shadow-lg"
            />
            <div className="absolute -top-2 -right-2 p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Registration Successful!
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Welcome to JobConnect! Your organization has been successfully registered.
            {isAuthenticated
              ? " You can now manage everything from your dashboard and start posting jobs to attract top talent."
              : " Please complete your account registration to access your dashboard and start posting jobs."
            }
          </p>
        </div>

        {/* Organization Summary */}
        {organization && (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{organization.name}</h3>
                  <p className="text-sm text-gray-600">GSTIN: {organization.gstin}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {organization.contact?.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>{organization.contact.email}</span>
                  </div>
                )}
                {organization.contact?.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>{organization.contact.phone}</span>
                  </div>
                )}
                {organization.companySize && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{organization.companySize} employees</span>
                  </div>
                )}
                {organization.website && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="truncate">{organization.website}</span>
                  </div>
                )}
                {organization.contact?.address && (
                  <div className="flex items-start gap-2 text-gray-700 md:col-span-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>
                      {[
                        organization.contact.address.street,
                        organization.contact.address.city,
                        organization.contact.address.state,
                        organization.contact.address.pincode
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h3>
            <ul className="space-y-3 text-left">
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Post job opportunities</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Review applications</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Manage your organization profile</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Connect with talented professionals</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        {isAuthenticated ? (
          <button
            onClick={goToDashboard}
            className="group flex items-center justify-center gap-3 w-full px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LayoutDashboard className="w-6 h-6" />
            Go to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        ) : (
          <button
            onClick={goToAuth}
            className="group flex items-center justify-center gap-3 w-full px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-6 h-6" />
            Complete Registration
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        )}

        {/* Additional Info */}
        <p className="mt-6 text-sm text-gray-500">
          Need help? Contact our support team anytime for assistance.
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
