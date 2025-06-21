import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrganizationService } from '../../../services/organization.service';
import { JobService } from '../../../services/job.service';
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  ArrowRight,
  Star,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

export default function PublicCompanyProfile() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load company details and active jobs in parallel
      const [companyResponse, jobsResponse] = await Promise.all([
        OrganizationService.getOrganization(companyId),
        JobService.getJobsByOrganization(companyId, { status: 'active' })
      ]);

      if (companyResponse.success) {
        setOrganization(companyResponse.data);
      } else {
        setError('Company not found');
      }

      if (jobsResponse.success) {
        setJobs(jobsResponse.data || []);
      }
    } catch (err) {
      console.error('Error loading company data:', err);
      setError('Failed to load company information');
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

    const currency = salary.currency === 'USD' ? '$' : '₹';
    
    if (salary.min && salary.max) {
      return `${currency}${formatAmount(salary.min)} - ${currency}${formatAmount(salary.max)}`;
    } else if (salary.min) {
      return `${currency}${formatAmount(salary.min)}+`;
    } else if (salary.max) {
      return `Up to ${currency}${formatAmount(salary.max)}`;
    }
    
    return 'Not disclosed';
  };

  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading company profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/user/job-dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Banner */}
      <div className="bg-white border-b border-gray-200 mt-20 overflow-hidden">
        {/* Organization Banner */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
          {organization?.banner && (
            <img
              src={organization.banner}
              alt={`${organization.name} banner`}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Company Logo */}
            <div className="relative -mt-20 mb-4 md:mb-0">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                {organization?.logo ? (
                  <img
                    src={organization.logo}
                    alt="Company Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                    {organization?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{organization?.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                {organization?.contact?.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{organization.contact.address.city}, {organization.contact.address.state}</span>
                  </div>
                )}
                
                {organization?.companySize && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{organization.companySize} employees</span>
                  </div>
                )}

                {organization?.website && (
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

              <p className="text-gray-700 text-lg leading-relaxed">
                {organization?.description?.about || 'No description available'}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4 mt-4">
                {organization?.socialMedia?.linkedin && (
                  <a 
                    href={organization.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                
                {organization?.socialMedia?.twitter && (
                  <a 
                    href={organization.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaXTwitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex md:flex-col gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
                <div className="text-sm text-gray-600">Open Positions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Open Positions ({jobs.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-8">
                {/* Mission & Vision */}
                {(organization?.description?.mission || organization?.description?.vision) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {organization?.description?.mission && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Mission</h3>
                        <p className="text-gray-700 leading-relaxed">{organization.description.mission}</p>
                      </div>
                    )}
                    
                    {organization?.description?.vision && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Vision</h3>
                        <p className="text-gray-700 leading-relaxed">{organization.description.vision}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Benefits */}
                {organization?.description?.benefits?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Benefits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {organization.description.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <Star className="w-4 h-4 text-green-600" />
                          <span className="text-green-800">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organization?.contact?.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <a href={`mailto:${organization.contact.email}`} className="text-blue-600 hover:text-blue-800">
                          {organization.contact.email}
                        </a>
                      </div>
                    )}
                    
                    {organization?.contact?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <a href={`tel:${organization.contact.phone}`} className="text-blue-600 hover:text-blue-800">
                          {organization.contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Positions</h3>
                    <p className="text-gray-600">This company doesn't have any open positions at the moment.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {jobs.map((job) => (
                      <div key={job._id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.jobType)}`}>
                                    {job.jobType}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {formatSalary(job.salary)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Posted {new Date(job.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                              {job.description}
                            </p>
                            
                            {job.skills && job.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {job.skills.slice(0, 5).map((skill, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                                {job.skills.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    +{job.skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navigate(`/jobs/${job._id}`)}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => navigate(`/jobs/${job._id}`)}
                              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Apply Now
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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
