import logo from "../../assets/Job.jpeg";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { ProfileContext } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { AuthService } from '../../services/auth.service';

export default function Navbar() {
  const { user: authUser } = useAuth();
  const { profileData, profileImage, setProfileImage, clearProfile, fetchProfile } = useContext(ProfileContext);

  // Safely get unread count with fallback
  let unreadCount = 0;
  try {
    const chatContext = useChat();
    unreadCount = chatContext?.unreadCount || 0;
  } catch (error) {
    console.log(error);
  }

  const [localOrgImage, setLocalOrgImage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user from ProfileContext or fallback sources
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        let user = null;

        // First try to get user from ProfileContext
        if (profileData) {
          user = profileData;
        } else if (authUser) {
          // Try to fetch profile if we have authUser but no profileData
          try {
            user = await fetchProfile();
          } catch (error) {
            console.error('Failed to fetch profile:', error);
          }
        }

        // Fallback to localStorage if no user from contexts
        if (!user) {
          const storedCurrentUser = localStorage.getItem('user');
          const storedUser = localStorage.getItem('user');

          if (storedCurrentUser) {
            try {
              user = JSON.parse(storedCurrentUser);
            } catch (e) {
              localStorage.removeItem('user');
            }
          } else if (storedUser) {
            try {
              user = JSON.parse(storedUser);
            } catch (e) {
              localStorage.removeItem('user');
            }
          }
        }

        // Final fallback to authUser
        if (!user && authUser) {
          user = authUser;
        }

        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [authUser, profileData, fetchProfile, setProfileImage]);

  // Load profile images from localStorage with error handling
  useEffect(() => {
    if (!user) return;

    try {
      const userRole = user.role;

      if (userRole === 'recruiter' || userRole === 'organization' || userRole === 'company') {
        const savedOrgImage = localStorage.getItem('orgProfileImage');
        if (savedOrgImage) setLocalOrgImage(savedOrgImage);
      } else if (userRole === 'jobseeker' || userRole === 'user') {
        const savedProfileData = localStorage.getItem(`user_profile_${user.email}`);
        if (savedProfileData) {
          try {
            const savedProfile = JSON.parse(savedProfileData);
            if (savedProfile?.profileImage) {
              setProfileImage(savedProfile.profileImage);
            }
          } catch (e) {
            localStorage.removeItem(`user_profile_${user.email}`);
          }
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }, [user?.email, user?.role, setProfileImage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Memoized logout handler to prevent unnecessary re-renders
  const handleLogout = useCallback(async () => {
    try {
      // Clear profile context
      if (clearProfile) {
        clearProfile();
      }

      // Clear only auth-related localStorage data (not all data)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser'); // Remove legacy key if exists

      // Reset state
      setCurrentUser(null);
      setProfileImage(null);
      setLocalOrgImage(null);
      setIsDropdownOpen(false);

      // Navigate to home immediately
      navigate('/', { replace: true });

    } catch (error) {
      // Force navigation even if cleanup fails
      navigate('/', { replace: true });
    }
  }, [clearProfile, setProfileImage, navigate]);

  // Memoize navbar type calculation to prevent unnecessary re-renders
  const navbarType = useMemo(() => {
    // Auth pages (login/signup)
    if (location.pathname === '/auth' ||
      location.pathname.includes('/login') ||
      location.pathname.includes('/register')) {
      return 'auth';
    }

    if (user) {
      const userRole = user.role;

      // Check if user is on user/jobseeker routes first (more specific)
      if (location.pathname.includes('/user/')) {
        return 'user';
      }

      // Check if user is on company/organization routes
      if (location.pathname.includes('/dashboard') ||
        location.pathname.includes('/company-details') ||
        location.pathname.includes('/profile') ||
        location.pathname.includes('/postjob')) {
        // Only return recruiter if the user actually has a recruiter role
        if (userRole === 'organization' ||
          userRole === 'recruiter' ||
          userRole === 'company') {
          return 'recruiter';
        }
      }

      if (userRole === 'organization' ||
        userRole === 'recruiter' ||
        userRole === 'company') {
        return 'recruiter';
      } else if (userRole === 'jobseeker' ||
        userRole === 'user') {
        return 'user';
      }

      return 'user'; // Default for logged-in users
    }

    // Default to home navbar for visitors
    return 'home';
  }, [user, location.pathname]);// Show loading state briefly to prevent flash
  if (isLoading) {
    return (
      <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
        <div className='flex items-center gap-2.5'>
          <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
        </div>
        <div className="text-gray-600 text-sm px-4 py-2 flex items-center gap-2">
          Loading...
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      </header>
    );
  }
  // Home Navbar (for web visitors)
  if (navbarType === 'home') {
    return (
      <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
        <div className='flex items-center gap-2.5'>
          <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/organizations" className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white border-none rounded-md font-bold text-sm md:text-base cursor-pointer inline-block transition-colors duration-300 hover:bg-black hover:text-white">Listed Orgs</Link>
          <Link to="/" className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white border-none rounded-md font-bold text-sm md:text-base cursor-pointer inline-block transition-colors duration-300 hover:bg-black hover:text-white">Organization</Link>
          <Link to="/auth" className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white border-none rounded-md font-bold text-sm md:text-base cursor-pointer inline-block transition-colors duration-300 hover:bg-black hover:text-white">Login</Link>
        </div>
      </header>
    );
  }
  // Auth Navbar (for login/signup pages)
  if (navbarType === 'auth') {
    return (
      <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
        <div className='flex items-center gap-2.5'>
          <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
        </div>

        <nav className="flex items-center">
          <Link to="/" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Home</Link>
        </nav>
      </header>
    );
  }  // Company Navbar (for recruiters/organizations)
  if (navbarType === 'recruiter') {
    return (
      <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
        <div className='flex items-center gap-2.5'>
          <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
          <label className='text-sm md:text-lg text-black font-semibold'></label>
        </div>

        <nav className="flex items-center">
          <Link to="/dashboard" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Dashboard</Link>
          <Link to="/analytics" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Analytics</Link>
          <Link to="/chat" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/recruiter/profile" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Profile</Link>
          <Link to="/company-details" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Your Organization</Link>


          <div className="relative ml-4 md:ml-10" ref={dropdownRef}>
            <div className="flex items-center gap-1.5 bg-gray-400/50 px-2.5 py-1.5 rounded-xl border border-black cursor-pointer transition-colors duration-200 hover:bg-gray-400/60" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {profileImage || localOrgImage ? (
                <img
                  src={profileImage || localOrgImage}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-black"
                />
              ) : (
                <div className="w-9 h-9 bg-white rounded-full text-black flex items-center justify-center text-lg border-2 border-black">👤</div>
              )}
              <span className="text-xs font-bold mt-0.5 text-white">{isDropdownOpen ? "˄" : "˅"}</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-black rounded-lg min-w-[140px] md:min-w-[160px] z-[1000] overflow-hidden shadow-md">
                <Link to="/company-details" className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-black no-underline cursor-pointer transition-colors duration-200 text-left border-b border-gray-200 bg-none w-full hover:bg-gray-100">Company Details</Link>
                <Link to="/recruiter/profile" className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-black no-underline cursor-pointer transition-colors duration-200 text-left border-b border-gray-200 bg-none w-full hover:bg-gray-100">Profile Detail</Link>
                <Link to="/postjob" className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-black no-underline cursor-pointer transition-colors duration-200 text-left border-b border-gray-200 bg-none w-full hover:bg-gray-100">Post a Job</Link>
                <button onClick={handleLogout} className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-red-500 font-medium cursor-pointer transition-colors duration-200 text-left bg-none w-full border-none hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </nav>
      </header>
    );
  }
  // User Navbar (for job seekers)
  if (navbarType === 'user') {
    return (
      <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
        <div className='flex items-center gap-2.5'>
          <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
        </div>

        <nav className="flex items-center">
          <Link to="/user/job-dashboard" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Dashboard</Link>
          <Link to="/organizations" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Listed Orgs</Link>
          <Link to="/user/profile-view" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Profile</Link>
          <Link to="/user/chat" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative ml-4 md:ml-10" ref={dropdownRef}>
            <div className="flex items-center gap-1.5 bg-gray-400/50 px-2.5 py-1.5 rounded-xl border border-black cursor-pointer transition-colors duration-200 hover:bg-gray-400/60" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-black" />
              ) : (
                <div className="w-9 h-9 bg-white rounded-full text-black flex items-center justify-center text-lg border-2 border-black">👤</div>
              )}
              <span className="text-xs font-bold mt-0.5 text-white">{isDropdownOpen ? "˄" : "˅"}</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-black rounded-lg min-w-[140px] md:min-w-[160px] z-[1000] overflow-hidden shadow-md">
                <Link to="/user/profile-view" className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-black no-underline cursor-pointer transition-colors duration-200 text-left border-b border-gray-200 bg-none w-full hover:bg-gray-100">Profile Detail</Link>
                <Link to="/user/upload-resume" className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-black no-underline cursor-pointer transition-colors duration-200 text-left border-b border-gray-200 bg-none w-full hover:bg-gray-100">Update Resume</Link>
                <button onClick={handleLogout} className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-red-500 font-medium cursor-pointer transition-colors duration-200 text-left bg-none w-full border-none hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </nav>
      </header>
    );
  }
  // Fallback - this should rarely be reached  
  return (
    <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
      </div>
      <div className="text-red-500 text-xs">
        Navbar Error: Type={navbarType} Role={user?.role || 'none'}
      </div>
    </header>
  );
}
