import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  Users,
  MessageCircle,
  UserPlus,
  Building2,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Globe
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const goToRegister = (type) => {
    navigate(`/auth?mode=register&type=${type}`);
  };

  const features = [
    {
      icon: <Zap className="w-12 h-12 text-blue-600" />,
      title: "AI-Based Matching",
      description: "Our AI algorithm analyzes resumes and job descriptions to find the perfect matches."
    },
    {
      icon: <Briefcase className="w-12 h-12 text-blue-600" />,
      title: "Smart Job Listings",
      description: "Create detailed job postings that attract qualified candidates with the right skills."
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: "Applicant Tracking",
      description: "Manage candidates, track applications, and collaborate with your hiring team."
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-blue-600" />,
      title: "Real-Time Chat",
      description: "Connect directly with potential candidates or recruiters through our messaging system."
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Create Your Profile",
      description: "Sign up and create a detailed profile. For job seekers, upload your resume; for recruiters, set up your company profile."
    },
    {
      number: "2",
      title: "Connect with AI Matching",
      description: "Our AI system analyzes profiles and job listings to suggest the best matches based on skills, experience, and requirements."
    },
    {
      number: "3",
      title: "Apply or Hire with Confidence",
      description: "Job seekers can apply to recommended positions, while recruiters can review vetted candidates and make informed hiring decisions."
    }
  ];

  return (
    <div className="min-h-screen mt-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 pt-24 pb-16 px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-blue-600 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-y-12"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Connect with the Right Talent
            <span className="flex items-center justify-center gap-3 mt-2 text-yellow-300">
              <Sparkles className="w-12 h-12" />
              Using AI
              <Sparkles className="w-12 h-12" />
            </span>
          </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              JobConnect uses advanced AI matching to connect companies with qualified candidates based on skills, experience, and culture fit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => goToRegister('jobseeker')}
              className="group flex items-center gap-3 px-8 py-4 bg-white text-blue-700 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Search className="w-6 h-6" />
              Find a Job
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            <button
              onClick={() => goToRegister('recruiter')}
              className="group flex items-center gap-3 px-8 py-4 bg-blue-800 text-white border-2 border-white rounded-lg hover:bg-black hover:border-gray-300 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Briefcase className="w-6 h-6" />
              Post a Job
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose JobConnect</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform makes hiring and job searching more efficient and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
                <div className="text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 object-contain mb-42">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>      
      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-rose-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How JobConnect Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes the hiring process simple and efficient for both recruiters and job seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Connecting Line - only show between steps on desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 via-blue-200 to-blue-100 z-0"></div>
                )}

                <div className="relative z-10">
                  <div className="relative mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg relative">
                      <span className="text-3xl font-bold text-white">{step.number}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization CTA Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100">
            <div className="mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Enist Your Organization</h2>
              <p className="text-xl text-gray-600">
                Join thousands of companies hiring top talent through JobConnect
              </p>
            </div>

            <button
              onClick={() => navigate('/register-organization')}
              className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 mx-auto"
            >
              <Building2 className="w-6 h-6" />
              List Your Organization
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-orange-400 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform skew-y-12"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Join thousands of companies and job seekers who have already found success with JobConnect.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => goToRegister('jobseeker')}
              className="group flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full hover:bg-orange-600 hover:text-black focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-400 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Search className="w-6 h-6" />
              Sign Up as Job Seeker
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            <button
              onClick={() => goToRegister('recruiter')}
              className="group flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full hover:bg-orange-600 hover:text-black focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-400 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Briefcase className="w-6 h-6" />
              Sign Up as Job Employer
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          <div className="mt-12 flex justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free to Join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Trusted Platform</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
