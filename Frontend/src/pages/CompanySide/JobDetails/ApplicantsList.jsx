import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function ApplicantsList() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exportingCSV, setExportingCSV] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load job details and applicants in parallel
      const [jobResponse, applicantsResponse] = await Promise.all([
        JobService.getJobById(jobId),
        JobService.getAppliedCandidates(jobId)
      ]);

      if (jobResponse.success || jobResponse.job) {
        setJobDetails(jobResponse.job || jobResponse.data);
      } else {
        setError('Failed to load job details');
      }

      if (applicantsResponse.success) {
        setApplicants(applicantsResponse.data.applications || []);
      } else {
        setError('Failed to load applicants');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load job and applicant data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    setError(null);

    try {
      const response = await ApplicationService.updateApplicationStatus(applicationId, newStatus);

      if (response.success) {
        // Update local state
        setApplicants(prev =>
          prev.map(app =>
            app._id === applicationId
              ? { ...app, status: newStatus }
              : app
          )
        );
        setSuccess(`Application status updated to ${newStatus}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to update application status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredApplicants = applicants.filter(applicant => {
    const applicantData = applicant.applicant || applicant; // Handle populated vs non-populated data
    const matchesSearch = applicantData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicantData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.status?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'applied') return matchesSearch && applicant.status === 'applied';
    if (filterBy === 'reviewed') return matchesSearch && applicant.status === 'reviewed';
    if (filterBy === 'shortlisted') return matchesSearch && applicant.status === 'shortlisted';
    if (filterBy === 'interview') return matchesSearch && applicant.status === 'interview';
    if (filterBy === 'hired') return matchesSearch && applicant.status === 'hired';
    if (filterBy === 'rejected') return matchesSearch && applicant.status === 'rejected';
    return matchesSearch;
  });

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NA';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewResume = (resume) => {
    if (resume?.cloudinarySecureUrl) {
      window.open(resume.cloudinarySecureUrl, '_blank');
    } else {
      console.error('Resume view URL not available');
    }
  };

  const handleDownloadResume = (resume) => {
    if (resume?.downloadUrl) {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = resume.downloadUrl;
      link.download = resume.filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Resume download URL not available');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interview': return 'bg-orange-100 text-orange-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'shortlisted': return <Star className="w-4 h-4" />;
      case 'interview': return <MessageSquare className="w-4 h-4" />;
      case 'hired': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'applied':
        return [
          { value: 'reviewed', label: 'Mark as Reviewed' },
          { value: 'shortlisted', label: 'Shortlist' },
          { value: 'rejected', label: 'Reject' }
        ];
      case 'reviewed':
        return [
          { value: 'shortlisted', label: 'Shortlist' },
          { value: 'interview', label: 'Schedule Interview' },
          { value: 'rejected', label: 'Reject' }
        ];
      case 'shortlisted':
        return [
          { value: 'interview', label: 'Schedule Interview' },
          { value: 'hired', label: 'Hire' },
          { value: 'rejected', label: 'Reject' }
        ];
      case 'interview':
        return [
          { value: 'hired', label: 'Hire' },
          { value: 'rejected', label: 'Reject' }
        ];
      default:
        return [];
    }
  };

  const exportToCSV = async () => {
    if (exportingCSV) return; // Prevent multiple simultaneous exports

    setExportingCSV(true);
    setError(null);

    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      // Define CSV headers
      const headers = [
        'Name',
        'Email',
        'Phone',
        'Location',
        'Status',
        'ATS Score (%)',
        'Applied Date',
        'Skills',
        'Resume Available',
        'Resume Filename',
        'Experience Level',
        'Education',
        'Current Company',
        'LinkedIn Profile',
        'Portfolio URL'
      ];

      // Convert applicants data to CSV format
      const csvData = filteredApplicants.map(application => {
        const applicantData = application.applicant || application;
        const profile = applicantData.profile || {};

        return [
          applicantData.name || 'N/A',
          applicantData.email || 'N/A',
          applicantData.phone || 'N/A',
          applicantData.location || 'N/A',
          application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'N/A',
          application.atsScore ? `${application.atsScore}%` : 'N/A',
          formatDate(application.appliedAt),
          applicantData.skills ? applicantData.skills.join('; ') : 'N/A',
          application.resume ? 'Yes' : 'No',
          application.resume?.filename || 'N/A',
          profile.experienceLevel || applicantData.experienceLevel || 'N/A',
          profile.education || applicantData.education || 'N/A',
          profile.currentCompany || applicantData.currentCompany || 'N/A',
          profile.linkedinProfile || applicantData.linkedinProfile || 'N/A',
          profile.portfolioUrl || applicantData.portfolioUrl || 'N/A'
        ];
      });

      // Combine headers and data
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => {
          // Escape quotes and wrap in quotes if field contains comma, quote, or newline
          const stringField = String(field);
          if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        }).join(','))
        .join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);

        // Generate filename with job title and current date
        const jobTitle = jobDetails?.title || 'Job';
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `${jobTitle.replace(/[^a-z0-9]/gi, '_')}_Applicants_${currentDate}.csv`;

        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        setSuccess(`CSV file downloaded successfully! (${filteredApplicants.length} applicants)`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export CSV file. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setExportingCSV(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mt-20">
        {isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading applicants...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800">{success}</p>
                </div>
              </div>
            )}

            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <button 
                  onClick={() => navigate(-1)} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-fit"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {jobDetails?.title || 'Job'} - Applicants
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{applicants.length}</span> total applicants
                    </div>
                    {jobDetails?.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted: {formatDate(jobDetails.date)}
                      </div>
                    )}
                    {jobDetails?.type && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {jobDetails.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            {applicants.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Filter */}
                  <div className="sm:w-48">
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Applicants</option>
                      <option value="applied">New Applications</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview Scheduled</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Export Button */}
                  <div className="sm:w-auto">
                    <button
                      onClick={exportToCSV}
                      disabled={exportingCSV || filteredApplicants.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exportingCSV ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {exportingCSV ? 'Exporting...' : 'Export CSV'}
                    </button>
                  </div>
                </div>
                
                {(searchTerm || filterBy !== 'all') && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-sm text-gray-600">
                      Showing {filteredApplicants.length} of {applicants.length} applicants
                      {searchTerm && ` matching "${searchTerm}"`}
                      {filterBy !== 'all' && ` with status "${filterBy}"`}
                    </div>
                    <div className="text-xs text-gray-500">
                      CSV export will include all visible applicants with their contact details, status, and resume information
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Applicants List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {filteredApplicants.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {applicants.length === 0 ? 'No applicants yet' : 'No matching applicants'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {applicants.length === 0 
                      ? 'Applications will appear here once candidates start applying to this job.'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterBy('all');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredApplicants.map((application, index) => {
                    const applicantData = application.applicant || application;
                    const nextStatusOptions = getNextStatusOptions(application.status);

                    return (
                      <div key={application._id || index} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {getInitials(applicantData.name)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 truncate">
                                  {applicantData.name || 'Anonymous Applicant'}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                    {getStatusIcon(application.status)}
                                    {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                                  </span>
                                  {application.atsScore && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                      <Star className="w-3 h-3" />
                                      ATS: {application.atsScore}%
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/applicant/${applicantData._id}`)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Profile
                                </button>

                                {/* Status Update Dropdown */}
                                {nextStatusOptions.length > 0 && (
                                  <select
                                    value=""
                                    onChange={(e) => e.target.value && handleStatusUpdate(application._id, e.target.value)}
                                    disabled={updatingStatus === application._id}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                  >
                                    <option value="">Update Status</option>
                                    {nextStatusOptions.map(option => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {updatingStatus === application._id && (
                                  <div className="flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {applicantData.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <a
                                    href={`mailto:${applicantData.email}`}
                                    className="text-blue-600 hover:text-blue-800 truncate"
                                  >
                                    {applicantData.email}
                                  </a>
                                </div>
                              )}

                              {applicantData.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <a
                                    href={`tel:${applicantData.phone}`}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    {applicantData.phone}
                                  </a>
                                </div>
                              )}

                              {applicantData.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{applicantData.location}</span>
                                </div>
                              )}
                            </div>

                            {/* Skills */}
                            {applicantData.skills && applicantData.skills.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-1">
                                  {applicantData.skills.slice(0, 5).map((skill, skillIndex) => (
                                    <span
                                      key={skillIndex}
                                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {applicantData.skills.length > 5 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      +{applicantData.skills.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Additional Info */}
                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                              <span>Applied on {formatDate(application.appliedAt)}</span>
                              {application.resume && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewResume(application.resume)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                  >
                                    <Eye className="w-3 h-3" />
                                    View Resume
                                  </button>
                                  <button
                                    onClick={() => handleDownloadResume(application.resume)}
                                    className="text-green-600 hover:text-green-800 flex items-center gap-1 transition-colors"
                                  >
                                    <Download className="w-3 h-3" />
                                    Download
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary Footer */}
            {filteredApplicants.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-medium text-gray-900">{filteredApplicants.length}</span> applicants
                    {searchTerm && ` matching "${searchTerm}"`}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={exportToCSV}
                      disabled={exportingCSV || filteredApplicants.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exportingCSV ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {exportingCSV ? 'Exporting...' : 'Export CSV'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
