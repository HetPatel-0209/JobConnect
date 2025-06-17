import React, { useState, useContext, useEffect } from 'react';
import UploadResume from '../UserResume/UploadResume';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Search, 
  Briefcase, 
  Star, 
  Calendar, 
  MessageCircle, 
  FileText, 
  Building, 
  MapPin, 
  DollarSign, 
  Clock, 
  User, 
  CheckCircle, 
  ArrowRight,
  Eye,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';

export default function JobDashboard() {
  const [showUploadScreen, setShowUploadScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { applications } = useContext(ProfileContext);
  const safeApplications = Array.isArray(applications) ? applications : [];

  const [user, setUser] = useState({ name: 'User' });
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) setUser(storedUser);

    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    setRecommendedJobs(jobs);
  }, []);

  const dashboardStats = [
    {
      title: 'Applications',
      value: safeApplications.length,
      subtitle: 'Active Applications',
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Saved Jobs',
      value: 0,
      subtitle: 'Bookmarked',
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Interviews',
      value: 0,
      subtitle: 'Scheduled',
      icon: <Calendar className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Messages',
      value: 0,
      subtitle: 'Unread',
      icon: <MessageCircle className="w-6 h-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const handleSearch = () => {
    // Search functionality can be implemented here
    console.log('Searching for:', searchQuery);
  };

  const handleApply = (jobId) => {
    // Application logic can be implemented here
    console.log('Applying for job:', jobId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showUploadScreen ? (
        <UploadResume onClose={() => setShowUploadScreen(false)} />
      ) : (
        <main className="pt-24 px-4 pb-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-blue-600">{user?.name || 'User'}</span>!
            </h1>
            <p className="text-gray-600 text-lg">Ready to find your next opportunity?</p>
          </div>

          {/* Profile Completion Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Upload className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
                  <p className="text-gray-600">Upload your resume to get better job matches and apply faster to positions that interest you.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadScreen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 font-semibold whitespace-nowrap shadow-md hover:shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, keyword or company"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="px-8 py-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  Search Jobs
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => (
              <div key={index} className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border ${stat.borderColor} ${stat.bgColor} bg-opacity-50`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {stat.icon}
                    <span className="text-gray-600 font-medium">{stat.title}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-gray-500 text-sm">{stat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Applications Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Recent Applications</h2>
            </div>
            
            {safeApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No recent applications yet.</p>
                <p className="text-gray-400">Start applying to jobs to see them here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {safeApplications.map((app, index) => (
                  <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{app.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{app.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'Interview' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-gray-500">Applied: {app.appliedDate}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <button className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 font-medium">
                        <Award className="w-4 h-4" />
                        View Resume Score
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Jobs Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            </div>
            
            {recommendedJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No job recommendations yet.</p>
                <p className="text-gray-400">Complete your profile to get personalized recommendations!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recommendedJobs.map(job => (
                  <div key={job.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{job.title}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Posted: {job.date}</span>
                          </div>
                        </div>
                        
                        {job.skill && (
                          <div className="mb-4">
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {job.skill}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-3 lg:min-w-0 lg:w-auto w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                          <button
                            onClick={() => navigate(`/user/job/${job.id}`)}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Job Details
                          </button>
                          <button
                            onClick={() => navigate(`/user/job/${job.id}/hr`)}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-sm"
                          >
                            <User className="w-4 h-4" />
                            HR Details
                          </button>
                          <button
                            onClick={() => navigate(`/user/job/${job.id}/company`)}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-sm"
                          >
                            <Users className="w-4 h-4" />
                            Company Details
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleApply(job.id)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Apply For This Job
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
