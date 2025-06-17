// src/Pages/CompanySide/CompanyDetails/CompanyDetails.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyDetails.css';

const CompanyDetails = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email;

  const [companyData, setCompanyData] = useState({
    gst: '',
    logo: '',
    banner: '',
    mission: '',
    vision: '',
    website: '',
    linkedin: '',
    size: ''
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem(`companyDetails_${email}`)) || {};
    setCompanyData(savedData);
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem(`companyDetails_${email}`, JSON.stringify(companyData));
    alert("Company details updated!");
  };

  return (
    <div className="company-wrap">
      <h2 className="company-heading">Company Details</h2>

      <label className="company-label">GST Number (Read-only)</label>
      <input name="gst" value={companyData.gst} readOnly className="company-input" />

      <label className="company-label">Company Logo URL</label>
      <input name="logo" value={companyData.logo} onChange={handleChange} className="company-input" />

      <label className="company-label">Company Banner URL</label>
      <input name="banner" value={companyData.banner} onChange={handleChange} className="company-input" />

      <label className="company-label">Mission</label>
      <textarea name="mission" value={companyData.mission} onChange={handleChange} className="company-textarea" />

      <label className="company-label">Vision</label>
      <textarea name="vision" value={companyData.vision} onChange={handleChange} className="company-textarea" />

      <label className="company-label">Website URL</label>
      <input name="website" value={companyData.website} onChange={handleChange} className="company-input" />

      <label className="company-label">LinkedIn URL</label>
      <input name="linkedin" value={companyData.linkedin} onChange={handleChange} className="company-input" />

      <label className="company-label">Company Size</label>
      <input name="size" value={companyData.size} onChange={handleChange} className="company-input" />

      <div className="company-btn-group">
        <button onClick={() => navigate(-1)} className="company-btn back-btn">← Back</button>
        <button onClick={handleSave} className="company-btn save-btn">Save Changes</button>
      </div>
    </div>
  );
};

export default CompanyDetails;
