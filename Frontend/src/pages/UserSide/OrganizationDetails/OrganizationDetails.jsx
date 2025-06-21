import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrganizationService } from '../../../services/organization.service';
import { JobService } from '../../../services/job.service';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Briefcase,
  Calendar,
  Star,
  Loader2,
  AlertCircle,
  Target,
  Award,
  Heart
} from 'lucide-react';

export default function OrganizationDetails() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (orgId) {
      loadOrganizationData();
    }
  }, [orgId]);

  const loadOrganizationData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load organization details and jobs in parallel
      const [orgResponse, jobsResponse] = await Promise.all([
        OrganizationService.getOrganization(orgId),
        JobService.getJobsByOrganization(orgId, { status: 'active' }).catch(() => ({ data: [] }))
      ]);

      if (orgResponse.success) {
        setOrganization(orgResponse.data);
      } else {
        setError('Organization not found');
      }

      if (jobsResponse.success) {
        setJobs(jobsResponse.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load organization information');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
    
    const formatAmount = (amount) => {
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
      return amount.toString();
    };

    if (salary.min && salary.max) {
      return `₹${formatAmount(salary.min)} - ₹${formatAmount(salary.max)}`;
    } else if (salary.min) {
      return `₹${formatAmount(salary.min)}+`;
    } else if (salary.max) {
      return `Up to ₹${formatAmount(salary.max)}`;
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
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'about', label: 'About', icon: Building2 },
                { id: 'jobs', label: `Jobs (${jobs.length})`, icon: Briefcase },
                { id: 'contact', label: 'Contact', icon: Mail }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-8">
                {/* Mission & Vision */}
                {(organization.description?.mission || organization.description?.vision) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {organization.description?.mission && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          Our Mission
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{organization.description.mission}</p>
                      </div>
                    )}
                    
                    {organization.description?.vision && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Star className="w-5 h-5 text-purple-600" />
                          Our Vision
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{organization.description.vision}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Benefits */}
                {organization.description?.benefits && organization.description.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      Employee Benefits
                    </h3>
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
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div>
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Jobs</h3>
                    <p className="text-gray-600">This organization doesn't have any active job postings at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job._id}
                        onClick={() => navigate(`/user/job/${job._id}`)}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                <span>{job.jobType}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">{formatSalary(job.salary)}</p>
                          </div>
                        </div>
                        
                        {job.description && (
                          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                            {job.description.substring(0, 150)}...
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-2">
                            {job.skills?.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills?.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{job.skills.length - 3} more
                              </span>
                            )}
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
