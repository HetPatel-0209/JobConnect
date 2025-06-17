import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Calendar
} from 'lucide-react';

export default function ApplicantsList() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
      const job = jobs.find(j => j.id === jobId);
      
      if (job) {
        setJobDetails(job);
        setApplicants(job.applicantsList || []);
      } else {
        setApplicants([]);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [jobId]);

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'with-location') return matchesSearch && applicant.location;
    if (filterBy === 'with-mobile') return matchesSearch && applicant.mobile;
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
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <button 
                  onClick={() => navigate(-1)} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-fit"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
                
                {applicants.length > 0 && (
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Export List
                    </button>
                  </div>
                )}
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
                      <option value="with-location">With Location</option>
                      <option value="with-mobile">With Mobile</option>
                    </select>
                  </div>
                </div>
                
                {searchTerm && (
                  <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredApplicants.length} of {applicants.length} applicants
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
                  {filteredApplicants.map((applicant, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {getInitials(applicant.name)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {applicant.name || 'Anonymous Applicant'}
                            </h4>
                            <div className="flex gap-2">
                              <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                <Eye className="w-4 h-4" />
                                View Profile
                              </button>
                            </div>
                          </div>
                          
                          {/* Contact Information */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {applicant.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <a 
                                  href={`mailto:${applicant.email}`}
                                  className="text-blue-600 hover:text-blue-800 truncate"
                                >
                                  {applicant.email}
                                </a>
                              </div>
                            )}
                            
                            {applicant.mobile && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <a 
                                  href={`tel:${applicant.mobile}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {applicant.mobile}
                                </a>
                              </div>
                            )}
                            
                            {applicant.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{applicant.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Additional Info */}
                          {applicant.appliedDate && (
                            <div className="mt-3 text-xs text-gray-500">
                              Applied on {formatDate(applicant.appliedDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      Download PDF
                    </button>
                    <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                      Export CSV
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
