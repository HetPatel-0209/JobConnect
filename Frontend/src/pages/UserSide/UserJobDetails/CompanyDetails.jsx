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
  Briefcase,
  Loader,
  Mail,
  Phone,
  Linkedin,
  Instagram
} from 'lucide-react';
import { JobService } from '../../../services/job.service';
import { FaXTwitter } from 'react-icons/fa6';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await JobService.getCompanyById(id);
        setCompanyData(response.company);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load company details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompanyDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Company Details</h2>
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

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Details Not Found</h2>
            <p className="text-gray-600 mb-6">The company information could not be loaded.</p>
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
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Company Banner */}
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
            {companyData.banner && (
              <img 
                src={companyData.banner} 
                alt={`${companyData.name} banner`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>

          {/* Company Info Header */}
          <div className="relative px-8 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Company Logo */}
              <div className="relative -mt-20 mb-4 md:mb-0">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                  {companyData.logo ? (
                    <img 
                      src={companyData.logo} 
                      alt={`${companyData.name} logo`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Building2 className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Company Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyData.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                      {companyData.contact?.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{companyData.contact.address.city}, {companyData.contact.address.state}</span>
                        </div>
                      )}
                      {companyData.companySize && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{companyData.companySize} employees</span>
                        </div>
                      )}
                      {companyData.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={companyData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            Website <ExternalLink className="w-3 h-3" />
                          </a>
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
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {companyData.description?.about && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">About {companyData.name}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{companyData.description.about}</p>
              </div>
            )}

            {/* Vision & Mission */}
            {(companyData.description?.vision || companyData.description?.mission) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {companyData.description.vision && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-4 h-4 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Vision</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{companyData.description.vision}</p>
                    </div>
                  )}

                  {companyData.description.mission && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Mission</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{companyData.description.mission}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            {companyData.description?.benefits && companyData.description.benefits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Employee Benefits</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyData.description.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                {companyData.contact?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a 
                      href={`mailto:${companyData.contact.email}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {companyData.contact.email}
                    </a>
                  </div>
                )}

                {companyData.contact?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a 
                      href={`tel:${companyData.contact.phone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {companyData.contact.phone}
                    </a>
                  </div>
                )}

                {companyData.contact?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="text-gray-700">
                      {companyData.contact.address.street && (
                        <div>{companyData.contact.address.street}</div>
                      )}
                      <div>
                        {companyData.contact.address.city}, {companyData.contact.address.state}
                      </div>
                      {companyData.contact.address.pincode && (
                        <div>{companyData.contact.address.pincode}</div>
                      )}
                      <div>{companyData.contact.address.country || 'India'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            {(companyData.socialMedia?.linkedin || companyData.socialMedia?.twitter || companyData.socialMedia?.instagram) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Social Media</h3>
                <div className="space-y-3">
                  {companyData.socialMedia.linkedin && (
                    <a 
                      href={companyData.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-700 font-medium">LinkedIn</span>
                      <ExternalLink className="w-4 h-4 text-blue-600 ml-auto" />
                    </a>
                  )}

                  {companyData.socialMedia.twitter && (
                    <a 
                      href={companyData.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                    >
                      <FaXTwitter className="w-5 h-5 text-sky-600" />
                      <span className="text-sky-700 font-medium">X</span>
                      <ExternalLink className="w-4 h-4 text-sky-600 ml-auto" />
                    </a>
                  )}

                  {companyData.socialMedia.instagram && (
                    <a 
                      href={companyData.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                    >
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <span className="text-pink-700 font-medium">Instagram</span>
                      <ExternalLink className="w-4 h-4 text-pink-600 ml-auto" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Company Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Company Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Founded</span>
                  <span className="font-semibold text-gray-900">
                    {(() => {
                      if (!companyData.createdAt) return 'N/A';
                      const date = new Date(companyData.createdAt);
                      if (isNaN(date.getTime())) return 'N/A';
                      return date.getFullYear();
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Company Size</span>
                  <span className="font-semibold text-gray-900">{companyData.companySize || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GSTIN</span>
                  <span className="font-semibold text-gray-900 text-sm">{companyData.gstin}</span>
                </div>
                {companyData.recruiters && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Recruiters</span>
                    <span className="font-semibold text-gray-900">{companyData.recruiters.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}