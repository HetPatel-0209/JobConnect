import React, { useContext } from 'react';
import { CgProfile } from "react-icons/cg";
import './OrgProfile.css';
import { ProfileContext } from '../../contexts/ProfileContext'; // ✅

export default function OrgProfile() {
  const { profileImage, setProfileImage } = useContext(ProfileContext); // ✅

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl); // ✅ Real-time update
    }
  };

  return (
    <div className="org-container">
      <div className="profile-rac">
        <label className='profile'>Profile Details</label>

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

        {/* Personal Information */}
        <div className="personal-info-box">
          <h3 className="personal-info-title">Personal Information</h3>

          <div className="info-field">
            <label htmlFor="fullname">Full Name:</label>
            <input type="text" id="fullname" placeholder="Enter your full name" />
          </div>

          <div className="info-field">
            <label htmlFor="phone">Phone:</label>
            <input type="text" id="phone" placeholder="+91 00000 00000" />
          </div>

          <div className="info-field">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" placeholder="example@example.com" />
          </div>

          <div className="info-field">
            <label htmlFor="location">Location:</label>
            <input type="text" id="location" placeholder="City, State" />
          </div>
        </div>

        {/* Professional Information */}
        <div className="professional-info-box">
          <h3 className="professional-info-title">Professional Information</h3>

          <div className="info-field">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              placeholder="e.g. Software Engineer"
              className="large-input"
            />
          </div>

          <div className="info-field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself..."
              rows="4"
              className="large-textarea"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="button-container">
          <button className="logout-btn">LogOut</button>
          <button className="save-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
