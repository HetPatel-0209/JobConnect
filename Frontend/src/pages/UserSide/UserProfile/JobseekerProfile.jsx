import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthService } from '../../../services/auth.service';
import { ResumeService } from '../../../services/resume.service';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
  FileText,

  Clock,
  Building,
  Eye,
  Edit,
  Settings
} from 'lucide-react';

export default function JobseekerProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user profile data and resume in parallel
      const [profileResponse, resumeResponse] = await Promise.all([
        AuthService.getProfile(),
        ResumeService.getUserActiveResume().catch(() => ({ hasActiveResume: false }))
      ]);

      if (profileResponse.success || profileResponse.user) {
        setProfile(profileResponse.user || profileResponse.data);
      } else {
        setError('Failed to load profile');
      }

      if (resumeResponse.hasActiveResume) {
        const resumeData = resumeResponse.activeResume || resumeResponse;
        setResume(resumeData);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const handleDownloadResume = async () => {
    if (!resume) {
      return;
    }

    try {
      // Use the ResumeService to download the resume
      const downloadData = await ResumeService.downloadResume(resume._id);

      // Create download link
      const link = document.createElement('a');
      link.href = downloadData.url;
      link.download = resume.filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(downloadData.url);
    } catch (error) {
      console.error(error);
      // Fallback to cloudinary URL if download service fails
      if (resume.cloudinarySecureUrl) {
        window.open(resume.cloudinarySecureUrl, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your profile...</p>
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
            onClick={loadProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Your profile could not be loaded.</p>
          <button
            onClick={() => navigate('/user/job-dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mt-20">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {profile.profilePic ? (
                <img 
                  src={profile.profilePic} 
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(profile.name)
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                  <p className="text-lg text-blue-600 font-semibold mb-2">Job Seeker</p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/user/profile')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => navigate('/user/upload-resume')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Resume
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                
                {profile.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                
                {profile.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>

              {/* Bio */}
              {profile.jobseekerProfile?.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{profile.jobseekerProfile.bio}</p>
                </div>
              )}

              {/* Resume Section */}
              <div className="flex gap-3">
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
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
                    <FileText className="w-4 h-4" />
                    No Resume Uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {profile.jobseekerProfile?.skills && profile.jobseekerProfile.skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.jobseekerProfile.skills.map((skill, index) => (
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
        {profile.jobseekerProfile?.experience && profile.jobseekerProfile.experience.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Experience
            </h2>
            <div className="space-y-4">
              {profile.jobseekerProfile.experience.map((exp, index) => (
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
        {profile.jobseekerProfile?.education && profile.jobseekerProfile.education.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Education
            </h2>
            <div className="space-y-4">
              {profile.jobseekerProfile.education.map((edu, index) => (
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
