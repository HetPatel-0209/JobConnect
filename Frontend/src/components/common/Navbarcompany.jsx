import './Navbarcompany.css';
import logo from "../../assets/Job.jpeg";
import { Link, useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ProfileContext } from '../../contexts/ProfileContext';

export default function Navbar() {
  const { profileImage } = useContext(ProfileContext);
  const [localImage, setLocalImage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Load image from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('orgProfileImage');
    if (saved) setLocalImage(saved);
  }, []);

  // ✅ Close dropdown on outside click
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
    navigate('/');
  };

  return (
    <header className='header'>
      <div className='logo-container'>
        <img src={logo} alt="Logo" className="logo-img" />
        <label className='labl'></label>
      </div>

      <nav className="navbar">
        <Link to="/dashboard" className="link">Dashboard</Link>

        <div className="profile-menu" ref={dropdownRef}>
          <div className="profile-toggle" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {profileImage || localImage ? (
              <img
                src={profileImage || localImage}
                alt="Profile"
                className="profile-img"
              />
            ) : (
              <div className="profile-placeholder">👤</div>
            )}
            <span className="caret">{isDropdownOpen ? "˄" : "˅"}</span>
          </div>

          {isDropdownOpen && (
            <div className="dropdown">
              <Link to="/company-details" className="dropdown-item">Company Details</Link>
              <Link to="/profile" className="dropdown-item">Profile Detail</Link>
              <Link to="/postjob" className="dropdown-item">Post a Job</Link>
              <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
            </div>
          )}

        </div>
      </nav>
    </header>
  );
}

