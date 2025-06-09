import './Navbar.css';
import logo from "../../assets/Job.jpeg";
import { Link, useNavigate } from 'react-router-dom';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { ProfileContext } from '../../contexts/ProfileContext';

export default function Navbar() {
  const { profileImage } = useContext(ProfileContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    // logout logic here
    console.log("Logout clicked");
    navigate('/');
  };

  return (
    <header className='header'>
      <div className='logo-container'>
        <img src={logo} alt="Logo" className="logo-img" />
        <label className='labl'></label>
      </div>

      <nav className="navbar">
        <Link to="/home" className="link">Home</Link>
        <Link to="/dashboard" className="link">Dashboard</Link>

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
