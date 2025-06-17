import logo from "../../assets/Job.jpeg";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ProfileContext } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user: authUser } = useAuth();
  const { profileImage, setProfileImage } = useContext(ProfileContext);
  const [localOrgImage, setLocalOrgImage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user from multiple sources with proper error handling
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        let user = null;
        
        // Try to get user from localStorage first
        const storedCurrentUser = localStorage.getItem('currentUser');
        const storedUser = localStorage.getItem('user');
        
        if (storedCurrentUser) {
          try {
            user = JSON.parse(storedCurrentUser);
          } catch (e) {
            console.warn('Failed to parse currentUser from localStorage:', e);
            localStorage.removeItem('currentUser');
          }
        } else if (storedUser) {
          try {
            user = JSON.parse(storedUser);
          } catch (e) {
            console.warn('Failed to parse user from localStorage:', e);
            localStorage.removeItem('user');
          }
        }
        
        // Fallback to authUser if localStorage is empty or corrupted
        if (!user && authUser) {
          user = authUser;
        }
        
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [authUser, location.pathname]); // Added location.pathname to re-check on route changes  // Load profile images from localStorage with error handling
  useEffect(() => {
    if (!currentUser) return;
    
    try {
      const userRole = currentUser.type;
      
      if (userRole === 'recruiter' || userRole === 'organization' || userRole === 'company') {
        const savedOrgImage = localStorage.getItem('orgProfileImage');
        if (savedOrgImage) setLocalOrgImage(savedOrgImage);
      } else if (userRole === 'jobseeker' || userRole === 'user') {
        const savedProfileData = localStorage.getItem(`user_profile_${currentUser.email}`);
        if (savedProfileData) {
          try {
            const savedProfile = JSON.parse(savedProfileData);
            if (savedProfile?.profileImage) {
              setProfileImage(savedProfile.profileImage);
            }
          } catch (e) {
            console.warn('Failed to parse user profile from localStorage:', e);
            localStorage.removeItem(`user_profile_${currentUser.email}`);
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile images:', error);
    }
  }, [currentUser, setProfileImage]);

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
  const handleLogout = () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setProfileImage(null);
      setLocalOrgImage(null);
      navigate('/home');
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if cleanup fails
      navigate('/home');
    }
  };  // Determine navbar type based on user state and current route
  const getNavbarType = () => {
    // Auth pages (login/signup)
    if (location.pathname === '/auth' || 
        location.pathname.includes('/login') || 
        location.pathname.includes('/register')) {
      return 'auth';
    }
    
    if (currentUser) {
      console.log('Current user for navbar:', currentUser); // Debug log
      
      const userRole = currentUser.type;
      
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
      

      console.warn('User exists but type is unclear:', currentUser);
      return 'user';
    }
    
    // Default to home navbar for visitors
    return 'home';
  };

  const navbarType = getNavbarType();
  console.log('Navbar type determined:', navbarType, 'for user:', currentUser); // Debug log  // Show loading state briefly to prevent flash
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
  }  // Home Navbar (for web visitors)
  if (navbarType === 'home') {
    return (
      <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
        <div className='flex items-center gap-2.5'>
          <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/" className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white border-none rounded-md font-bold text-sm md:text-base cursor-pointer inline-block transition-colors duration-300 hover:bg-black hover:text-white">Organization</Link>
          <Link to="/auth" className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white border-none rounded-md font-bold text-sm md:text-base cursor-pointer inline-block transition-colors duration-300 hover:bg-black hover:text-white">Join Us</Link>
        </div>
      </header>
    );
  }  // Auth Navbar (for login/signup pages)
  if (navbarType === 'auth') {
    return (
      <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
        <div className='flex items-center gap-2.5'>
          <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
        </div>

        <nav className="flex items-center">
          <Link to="/home" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Home</Link>
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
                <Link to="/profile" className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-black no-underline cursor-pointer transition-colors duration-200 text-left border-b border-gray-200 bg-none w-full hover:bg-gray-100">Profile Detail</Link>
                <Link to="/postjob" className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-black no-underline cursor-pointer transition-colors duration-200 text-left border-b border-gray-200 bg-none w-full hover:bg-gray-100">Post a Job</Link>
                <button onClick={handleLogout} className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-red-500 font-medium cursor-pointer transition-colors duration-200 text-left bg-none w-full border-none hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </nav>
      </header>
    );
  }  // User Navbar (for job seekers)
  if (navbarType === 'user') {
    return (
      <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
        <div className='flex items-center gap-2.5'>
          <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
        </div>

        <nav className="flex items-center">
          <Link to="/user/job-dashboard" className="text-sm md:text-lg text-black font-medium ml-4 md:ml-10 no-underline relative transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-[width] after:duration-300 hover:after:w-full">Dashboard</Link>

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
                <Link to="/user/profile" className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-black no-underline cursor-pointer transition-colors duration-200 text-left border-b border-gray-200 bg-none w-full hover:bg-gray-100">Profile Detail</Link>
                <Link to="/user/upload-resume" className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-black no-underline cursor-pointer transition-colors duration-200 text-left border-b border-gray-200 bg-none w-full hover:bg-gray-100">Upload Resume</Link>
                <button onClick={handleLogout} className="block px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-red-500 font-medium cursor-pointer transition-colors duration-200 text-left bg-none w-full border-none hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </nav>
      </header>
    );
  }  // Fallback - this should rarely be reached
  console.warn('Navbar fallback reached. NavbarType:', navbarType, 'CurrentUser:', currentUser, 'Path:', location.pathname);
  
  return (
    <header className='fixed top-0 left-0 w-full px-5 md:px-10 py-2.5 md:py-5 bg-white flex justify-between items-center z-[100] shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <img src={logo} alt="Logo" className="w-1/2 h-auto max-h-10 md:max-h-[60px] object-contain" />
      </div>
      <div className="text-red-500 text-xs">
        Navbar Error: Type={navbarType} Role={currentUser?.type || 'none'}
      </div>
    </header>
  );
}
