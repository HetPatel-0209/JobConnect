import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Globe, 
  Users, 
  MapPin, 
  Target, 
  Eye, 
  ArrowLeft,
  ExternalLink,
  Calendar,
  Award,
  Briefcase
} from 'lucide-react';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find(j => j.id === Number(id));
    if (job && job.companyDetails) {
      setCompanyData(job.companyDetails);
    }
  }, [id]);

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Details Not Found</h2>
            <p className="text-gray-600 mb-6">The company information could not be loaded for this job posting.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 px-4 pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Company Banner */}
          {companyData.form?.banner && (
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600">
              <img 
                src={companyData.form.banner} 
                alt="Company Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          )}

          <div className="p-8">
            {/* Company Logo and Basic Info */}
            <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
              {companyData.form?.logo && (
                <div className="flex-shrink-0">
                  <img 
                    src={companyData.form.logo} 
                    alt="Company Logo"
                    className="w-24 h-24 rounded-xl object-contain border-2 border-gray-200 shadow-md bg-white p-2"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  {companyData.company?.name || 'Company Name'}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{companyData.company?.address || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{companyData.company?.type || 'Company Type'}</span>
                  </div>
                  {companyData.form?.size && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{companyData.form.size} employees</span>
                    </div>
                  )}
                </div>
                
                {/* Quick Links */}
                <div className="flex flex-wrap gap-3">
                  {companyData.form?.website && (
                    <a 
                      href={companyData.form.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {companyData.form?.linkedin && (
                    <a 
                      href={companyData.form.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                    >
                      LinkedIn
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {companyData.form?.twitter && (
                    <a 
                      href={companyData.form.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                    >
                      Twitter
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Mission */}
          {companyData.form?.mission && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mission</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{companyData.form.mission}</p>
            </div>
          )}

          {/* Vision */}
          {companyData.form?.vision && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{companyData.form.vision}</p>
            </div>
          )}
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Company Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                <p className="text-gray-900">{companyData.company?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">PAN Number</label>
                <p className="text-gray-900 font-mono">{companyData.company?.pan || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">GSTIN</label>
                <p className="text-gray-900 font-mono">{companyData.gstin || 'N/A'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Entity Type</label>
                <p className="text-gray-900">{companyData.company?.type || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nature of Business</label>
                <p className="text-gray-900">{companyData.company?.nature || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Size</label>
                <p className="text-gray-900">{companyData.form?.size ? `${companyData.form.size} employees` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Job Details
          </button>
        </div>      </div>
    </div>
  );
}