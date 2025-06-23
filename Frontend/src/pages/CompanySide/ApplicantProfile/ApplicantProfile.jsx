import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthService } from '../../../services/auth.service';
import { ResumeService } from '../../../services/resume.service';
import { formatJobDate } from '../../../utils/dateUtils';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  Download,
  MessageSquare,
  Loader2,
  AlertCircle,
  FileText,
  Award,
  Clock,
  Building,
  Eye
} from 'lucide-react';
import ChatButton from '../../../components/chat/ChatButton';

export default function ApplicantProfile() {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplicantProfile();
  }, [applicantId]);

  const loadApplicantProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get applicant profile data and resume in parallel
      const [profileResponse, resumeResponse] = await Promise.all([
        AuthService.getUserProfile(applicantId),
        ResumeService.getUserActiveResumeById(applicantId).catch(() => ({ hasResume: false }))
      ]);

      if (profileResponse.success || profileResponse.user) {
        setApplicant(profileResponse.user || profileResponse.data);
      } else {
        setError('Failed to load applicant profile');
      }

      if (resumeResponse.success && resumeResponse.hasResume) {
        setResume(resumeResponse.resume);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load applicant profile');
    } finally {
      setLoading(false);
    }
  };

  // Use the centralized date formatting utility
  const formatDate = (dateInput) => {
    return formatJobDate(dateInput);
  };

  const getInitials = (name) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleViewResume = () => {
    if (resume?.cloudinarySecureUrl) {
      window.open(resume.cloudinarySecureUrl, '_blank');
    } else {
      console.error('Resume view URL not available');
    }
  };

  const handleDownloadResume = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading applicant profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Applicant Not Found</h2>
          <p className="text-gray-600 mb-4">The applicant profile could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applicants
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {applicant.profilePic ? (
                <img 
                  src={applicant.profilePic} 
                  alt={applicant.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(applicant.name)
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{applicant.name}</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{applicant.email}</span>
                </div>
                
                {applicant.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{applicant.phone}</span>
                  </div>
                )}
                
                {applicant.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{applicant.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(applicant.createdAt)}</span>
                </div>
              </div>

              {/* Bio */}
              {applicant.jobseekerProfile?.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{applicant.jobseekerProfile.bio}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <ChatButton
                  recipientId={applicant.id}
                  recipientName={applicant.name}
                  recipientRole="jobseeker"
                  variant="primary"
                  initialMessage={`Hi ${applicant.name}! I reviewed your profile and would like to discuss potential opportunities with you.`}
                />
                {resume ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleViewResume}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Resume
                    </button>
                    <button
                      onClick={handleDownloadResume}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Resume
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                    <FileText className="w-4 h-4" />
                    No Resume Available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {applicant.jobseekerProfile?.skills && applicant.jobseekerProfile.skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {applicant.jobseekerProfile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill.name || skill}
                  {skill.level && (
                    <span className="ml-1 text-blue-600">({skill.level})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {applicant.jobseekerProfile?.experience && applicant.jobseekerProfile.experience.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Experience
            </h2>
            <div className="space-y-4">
              {applicant.jobseekerProfile.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4">
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Building className="w-4 h-4" />
                    <span>{exp.company}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 text-sm">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {applicant.jobseekerProfile?.education && applicant.jobseekerProfile.education.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Education
            </h2>
            <div className="space-y-4">
              {applicant.jobseekerProfile.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-green-200 pl-4">
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{edu.institution}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {edu.startYear} - {edu.endYear}
                    {edu.score && <span className="ml-2">• {edu.score}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
