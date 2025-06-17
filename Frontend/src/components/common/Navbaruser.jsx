import './Navbaruser.css';
import logo from "../../assets/Job.jpeg";
import { Link, useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ProfileContext } from '../../contexts/ProfileContext';

export default function Navbaruser() {
  const { profileImage, setProfileImage } = useContext(ProfileContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load profile image from localStorage when user is logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user?.email) {
      const savedProfile = JSON.parse(localStorage.getItem(`user_profile_${user.email}`));
      if (savedProfile?.profileImage) {
        setProfileImage(savedProfile.profileImage);
      }
    }
  }, [setProfileImage]);

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
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <header className='header'>
      <div className='logo-container'>
        <img src={logo} alt="Logo" className="logo-img" />
      </div>

      <nav className="navbar">
        <Link to="/user/job-dashboard" className="link">Dashboard</Link>

        <div className="profile-menu" ref={dropdownRef}>
          <div className="profile-toggle" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="profile-img" />
            ) : (
              <div className="profile-placeholder">👤</div>
            )}
            <span className="caret">{isDropdownOpen ? "˄" : "˅"}</span>
          </div>

          {isDropdownOpen && (
            <div className="dropdown">
              <Link to="/user/profile" className="dropdown-item">Profile Detail</Link>
              <Link to="/user/upload-resume" className="dropdown-item">Upload Resume</Link>
              <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
