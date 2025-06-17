import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterOrganization.css';
import Navbarauth from '../../../components/common/Navbarauth';
import Footer from '../../../components/common/Footer';

export default function RegisterOrganization() {
  const navigate = useNavigate();
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    logo: null,
    banner: null,
    mission: '',
    vision: '',
    linkedin: '',
    twitter: '',
    website: '',
    size: ''
  });
  const [urlErrors, setUrlErrors] = useState({
    linkedin: '',
    twitter: '',
    website: ''
  });

  const isValidGstin = (val) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val);

  const handleVerify = () => {
    if (!isValidGstin(gstin)) {
      setError('Invalid GSTIN format');
      setCompany(null);
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setCompany({
        gstin: gstin,
        name: 'Your Organization Pvt Ltd',
        pan: 'ABCDE1234F',
        address: 'Ahmedabad, Gujarat',
        type: 'Private Limited',
        nature: 'Software / IT Services'
      });
      setLoading(false);
    }, 1000);
  };

  const validateURLs = () => {
    let valid = true;
    let errors = { linkedin: '', twitter: '', website: '' };

    if (form.linkedin && !form.linkedin.startsWith('https://www.linkedin.com/')) {
      errors.linkedin = 'LinkedIn URL must start with https://www.linkedin.com/';
      valid = false;
    }

    if (form.twitter && !form.twitter.startsWith('https://twitter.com/')) {
      errors.twitter = 'Twitter URL must start with https://twitter.com/';
      valid = false;
    }

    if (
      form.website &&
      !(form.website.startsWith('https://') || form.website.startsWith('http://'))
    ) {
      errors.website = 'Website URL must start with http:// or https://';
      valid = false;
    }

    setUrlErrors(errors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const isFormValid = () => {
    return (
      company &&
      form.logo &&
      form.banner &&
      form.mission.trim() &&
      form.vision.trim() &&
      form.linkedin.trim() &&
      form.twitter.trim() &&
      form.website.trim() &&
      form.size.trim() &&
      validateURLs()
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert('Please fill out all fields with valid values before submitting.');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const email = currentUser?.email;

    const companyData = {
      gstin: company.gstin,
      company,
      form: {
        ...form,
        logo: form.logo ? URL.createObjectURL(form.logo) : '',
        banner: form.banner ? URL.createObjectURL(form.banner) : '',
      },
    };

    const existing = JSON.parse(localStorage.getItem('registeredCompanyDetails')) || {};
    existing[email] = companyData;
    localStorage.setItem('registeredCompanyDetails', JSON.stringify(existing));

    navigate('/registration-success');
  };

  return (
    <>
      <Navbarauth />

      <div className="org-wrap">
        <h1 className="org-head">Register Your Organization</h1>
        <p className="org-subtext">Start hiring top talent through JobConnect</p>

        <div className="org-input">
          <label>GSTIN Number</label>
          <input
            type="text"
            maxLength="15"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="Enter your 15-digit GSTIN"
          />
          {error && <span className="org-error">{error}</span>}
          <div className="btn-center">
            <button onClick={handleVerify} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify GSTIN & Fetch Data'}
            </button>
          </div>
        </div>

        {company && (
          <div className="org-box">
            <p className="org-info">
              <strong>Fetched data based on input GSTIN:</strong> {gstin}
            </p>
            <div className="org-grid">
              <div><strong>Business Name:</strong> {company.name}</div>
              <div><strong>PAN:</strong> {company.pan}</div>
              <div><strong>Address:</strong> {company.address}</div>
              <div><strong>Entity Type:</strong> {company.type}</div>
              <div><strong>Nature of Business:</strong> {company.nature}</div>
            </div>
          </div>
        )}

        {company && (
          <form onSubmit={handleSubmit} className="org-form">
            <h3 className="org-title">Additional Company Information</h3>

            <label>Company Logo</label>
            <input type="file" name="logo" onChange={handleChange} />

            <label>Company Banner</label>
            <input type="file" name="banner" onChange={handleChange} />

            <label>Mission</label>
            <textarea
              name="mission"
              value={form.mission}
              onChange={handleChange}
              placeholder="Describe your company's mission..."
            />

            <label>Vision</label>
            <textarea
              name="vision"
              value={form.vision}
              onChange={handleChange}
              placeholder="Describe your company's vision..."
            />

            <label>LinkedIn URL</label>
            <input
              type="url"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
            />
            {urlErrors.linkedin && <span className="org-error">{urlErrors.linkedin}</span>}

            <label>Twitter URL</label>
            <input
              type="url"
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
            />
            {urlErrors.twitter && <span className="org-error">{urlErrors.twitter}</span>}

            <label>Website URL</label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
            />
            {urlErrors.website && <span className="org-error">{urlErrors.website}</span>}

            <label>Company Size</label>
            <select
              name="size"
              value={form.size}
              onChange={handleChange}
            >
              <option value="">Select size</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </select>

            <div className="btn-center">
              <button type="submit" className="org-btn">
                Register Organization
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </>
  );
}

