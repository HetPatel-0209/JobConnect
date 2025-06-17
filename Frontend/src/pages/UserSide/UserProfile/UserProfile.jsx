import React, { useContext, useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import './UserProfile.css';
import { ProfileContext } from '../../../contexts/ProfileContext';
import Navbaruser from '../../../components/common/Navbaruser';

export default function UserProfile() {
  const { profileImage, setProfileImage } = useContext(ProfileContext);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    title: '',
    bio: '',
  });

  const [currentUserEmail, setCurrentUserEmail] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user?.email) {
      setCurrentUserEmail(user.email);
      const userProfile = JSON.parse(localStorage.getItem(`user_profile_${user.email}`));
      if (userProfile) {
        setFormData(userProfile.formData || {});
        setProfileImage(userProfile.profileImage || '');
      }
    }
  }, [setProfileImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSave = () => {
    if (!currentUserEmail) {
      alert('No user found!');
      return;
    }

    const profileData = {
      formData,
      profileImage,
    };

    localStorage.setItem(`user_profile_${currentUserEmail}`, JSON.stringify(profileData));
    alert("✅ Profile details saved successfully!");
  };

  return (
    <>
      <Navbaruser />
      <div className="org-container">
        <div className="profile-rac">
          <label className='profile'>User Profile Details</label>

          {/* Upload photo */}
          <div className="photo-upload-container">
            <div className="photo-preview">
              {profileImage ? (
                <img src={profileImage} alt="Uploaded" className="profile-image" />
              ) : (
                <CgProfile size={150} color="black" />
              )}
            </div>
            <div>
              <label htmlFor="upload-input" className="upload-button">Update Photo</label>
              <input
                type="file"
                id="upload-input"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Personal Info */}
          <div className="personal-info-box">
            <h3 className="personal-info-title">Personal Information</h3>

            <div className="info-field">
              <label htmlFor="fullName">Full Name:</label>
              <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" />
            </div>

            <div className="info-field">
              <label htmlFor="phone">Phone:</label>
              <input type="text" id="phone" value={formData.phone} onChange={handleChange} placeholder="+91 00000 00000" />
            </div>

            <div className="info-field">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="example@example.com" />
            </div>

            <div className="info-field">
              <label htmlFor="location">Location:</label>
              <input type="text" id="location" value={formData.location} onChange={handleChange} placeholder="City, State" />
            </div>
          </div>

          {/* Professional Info */}
          <div className="professional-info-box">
            <h3 className="professional-info-title">Professional Information</h3>

            <div className="info-field">
              <label htmlFor="title">Title</label>
              <input type="text" id="title" value={formData.title} onChange={handleChange} placeholder="e.g. Software Engineer" className="large-input" />
            </div>

            <div className="info-field">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows="4" className="large-textarea" />
            </div>
          </div>

          {/* Buttons */}
          <div className="button-container">
            <button className="logout-btn">LogOut</button>
            <button className="save-btn" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </>
  );
}
