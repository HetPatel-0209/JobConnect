import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrganizationService } from '../../../services/organization.service';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
  AlertCircle,
  Target,
  Award,
  Heart,
  Star
} from 'lucide-react';

export default function PublicOrganizationDetails() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orgId) {
      loadOrganizationData();
    }
  }, [orgId]);

  const loadOrganizationData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await OrganizationService.getOrganization(orgId);

      if (response.success) {
        setOrganization(response.data);
      } else {
        setError('Organization not found');
      }
    } catch (err) {
      console.error('Error loading organization data:', err);
      setError('Failed to load organization information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Organization</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/organizations')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization Not Found</h2>
          <p className="text-gray-600 mb-4">The organization you're looking for could not be found.</p>
          <button
            onClick={() => navigate('/organizations')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mt-20">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
          {organization.banner && (
            <img
              src={organization.banner}
              alt={`${organization.name} banner`}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="mt-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Company Logo */}
            <div className="relative -mt-20 mb-4">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                {organization.logo ? (
                  <img
                    src={organization.logo}
                    alt="Company Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                    {organization.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="flex-1 mt-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{organization.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                {organization.contact?.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{organization.contact.address.city}, {organization.contact.address.state}</span>
                  </div>
                )}
                
                {organization.companySize && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{organization.companySize} employees</span>
                  </div>
                )}

                {organization.website && (
                  <a 
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {organization.description?.about && (
                <p className="text-gray-700 mb-4 max-w-3xl">{organization.description.about}</p>
              )}

              {/* Call to Action for Visitors */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-blue-800 mb-3">
                  <strong>Interested in opportunities at {organization.name}?</strong>
                </p>
                <p className="text-blue-700 text-sm mb-3">
                  Join JobConnect to explore job openings and connect with this organization.
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up / Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {organization.description?.about && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">About {organization.name}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{organization.description.about}</p>
              </div>
            )}

            {/* Vision & Mission */}
            {(organization.description?.vision || organization.description?.mission) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {organization.description.mission && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Mission</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{organization.description.mission}</p>
                    </div>
                  )}
                  
                  {organization.description.vision && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Vision</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{organization.description.vision}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            {organization.description?.benefits && organization.description.benefits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Employee Benefits</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {organization.description.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{benefit}</span>
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
                {organization.contact?.email && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <a 
                        href={`mailto:${organization.contact.email}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {organization.contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {organization.contact?.phone && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Phone</p>
                      <a 
                        href={`tel:${organization.contact.phone}`}
                        className="text-green-600 hover:text-green-700 font-semibold"
                      >
                        {organization.contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {organization.contact?.address && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Address</p>
                        <div className="text-gray-900">
                          {organization.contact.address.street && (
                            <p>{organization.contact.address.street}</p>
                          )}
                          <p>
                            {organization.contact.address.city}, {organization.contact.address.state} {organization.contact.address.pincode}
                          </p>
                          <p>{organization.contact.address.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Company Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Company Size</span>
                  <span className="font-semibold text-gray-900">{organization.companySize || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GSTIN</span>
                  <span className="font-semibold text-gray-900 text-sm">{organization.gstin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
