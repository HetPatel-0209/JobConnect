import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  FileText,
  CheckCircle,
  Star,
  Loader
} from 'lucide-react';

export default function UserJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const allJobs = JSON.parse(localStorage.getItem('jobs')) || [];
      const found = allJobs.find(job => job.id === Number(id));
      setJob(found);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatSkills = (skills) => {
    if (!skills) return [];
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Building2 className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-green-600" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-purple-600" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-3 text-emerald-600" />
                    <span className="font-medium">{job.salary}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-orange-600" />
                    <span>Posted {job.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
                  Apply Now
                </button>
                <button className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  Save Job
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-3 text-blue-600" />
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
                Requirements
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </div>

            {/* Skills */}
            {job.skill && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-3 text-yellow-600" />
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {formatSkills(job.skill).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200 hover:bg-blue-200 transition-colors duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm text-gray-600">Company</span>
                </div>
                <p className="font-medium text-gray-900">{job.company}</p>
                
                <div className="flex items-center mt-4">
                  <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm text-gray-600">Location</span>
                </div>
                <p className="font-medium text-gray-900">{job.location}</p>
                
                <button className="w-full mt-4 px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  View Company Profile
                </button>
              </div>
            </div>

            {/* Job Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Job Type</span>
                  <span className="text-sm font-medium text-gray-900">{job.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Salary</span>
                  <span className="text-sm font-medium text-gray-900">{job.salary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Posted</span>
                  <span className="text-sm font-medium text-gray-900">{job.date}</span>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Jobs</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                  <h4 className="font-medium text-gray-900 text-sm">Frontend Developer</h4>
                  <p className="text-xs text-gray-600">Tech Corp • Remote</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                  <h4 className="font-medium text-gray-900 text-sm">React Developer</h4>
                  <p className="text-xs text-gray-600">StartupXYZ • New York</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                  <h4 className="font-medium text-gray-900 text-sm">UI/UX Developer</h4>
                  <p className="text-xs text-gray-600">Design Agency • San Francisco</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
