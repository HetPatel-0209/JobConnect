import React from "react";
import { useNavigate } from "react-router-dom";
import successImg from "../../../assets/Success.svg";
import { ArrowRight, CheckCircle, LayoutDashboard } from 'lucide-react';



const RegistrationSuccess = () => {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate("/dashboard");
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
            You can now manage everything from your dashboard and start posting jobs to attract top talent.
          </p>
        </div>

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
        <button 
          onClick={goToDashboard}
          className="group flex items-center justify-center gap-3 w-full px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <LayoutDashboard className="w-6 h-6" />
          Go to Dashboard
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>

        {/* Additional Info */}
        <p className="mt-6 text-sm text-gray-500">
          Need help? Contact our support team anytime for assistance.
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
