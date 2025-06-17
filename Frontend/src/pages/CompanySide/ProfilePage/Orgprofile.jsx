import React, { useContext, useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import './OrgProfile.css';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../../../contexts/ProfileContext';

export default function OrgProfile() {
  const { profileImage, setProfileImage } = useContext(ProfileContext);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email || 'unknown@email.com';

  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    location: '',
    title: '',
    bio: ''
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem(`orgProfile_${email}`)) || {};
    setFormData(savedData);

    const savedImage = localStorage.getItem(`orgProfileImage_${email}`);
    if (savedImage) setProfileImage(savedImage);
  }, [email, setProfileImage]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem(`orgProfileImage_${email}`, reader.result); // Store per email
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleSave = () => {
    localStorage.setItem(`orgProfile_${email}`, JSON.stringify(formData));
    alert("Information saved successfully!");
    navigate('/dashboard');
  };

  return (
    <div className="org-container">
      <div className="profile-rac">
        <label className='profile'>Profile Details</label>

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

        <div className="personal-info-box">
          <h3 className="personal-info-title">Personal Information</h3>

          <div className="info-field">
            <label htmlFor="fullname">Full Name:</label>
            <input
              type="text"
              id="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="info-field">
            <label htmlFor="phone">Phone:</label>
            <input
              type="text"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 00000 00000"
            />
          </div>

          <div className="info-field">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@example.com"
            />
          </div>

          <div className="info-field">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
            />
          </div>
        </div>

        <div className="professional-info-box">
          <h3 className="professional-info-title">Professional Information</h3>

          <div className="info-field">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              className="large-input"
            />
          </div>

          <div className="info-field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="4"
              className="large-textarea"
            />
          </div>
        </div>

        <div className="button-container">
          <button className="logout-btn" onClick={handleLogout}>LogOut</button>
          <button className="save-btn" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

