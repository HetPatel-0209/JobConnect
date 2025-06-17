import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Postjob.css';

const Postjob = () => {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    requirements: '',
  });

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email;

  // Load HR Profile & Company Info
  const currentHRProfile = JSON.parse(localStorage.getItem(`orgProfile_${email}`)) || {};
  const currentHRImage = localStorage.getItem(`orgProfileImage_${email}`) || '';
  const registeredCompanies = JSON.parse(localStorage.getItem('registeredCompanyDetails')) || {};
  const companyDetails = registeredCompanies[email] || null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    const value = e.target.value;
    setSelectedSkill(value);
    if (value !== 'custom') setCustomSkill('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (!formData.title || !formData.company || !formData.description || !selectedSkill) {
        alert("Please fill all required fields.");
        return;
      }

      const skillFinal = selectedSkill === 'custom' ? customSkill : selectedSkill;

      const newJob = {
        id: Date.now(),
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: `₹${formData.salary}`,
        description: formData.description,
        requirements: formData.requirements,
        skill: skillFinal,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        }),
        applicants: 0,
        status: 'Active',
        hrDetails: {
          ...currentHRProfile,
          image: currentHRImage,
        },
        companyDetails: companyDetails || {
          gstin: 'N/A',
          name: formData.company,
          mission: '',
          vision: '',
          size: '',
          website: '',
        },
      };

      const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
      const userJobs = allUserJobs[email] || [];
      allUserJobs[email] = [newJob, ...userJobs];
      localStorage.setItem('userJobs', JSON.stringify(allUserJobs));

      const allJobs = JSON.parse(localStorage.getItem('jobs')) || [];
      localStorage.setItem('jobs', JSON.stringify([newJob, ...allJobs]));

      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Error posting job:', err);
      alert('Something went wrong while posting the job.');
    }
  };

  return (
    <div className="postjob-container">
      <div className="form-box">
        <h2>Post a New Job</h2>
        <p className="form-subtitle">Fill in the details below to create a new job listing</p>

        <form className="job-form" onSubmit={handleSubmit}>
          <label>Job Title<span>*</span>
            <input name="title" required value={formData.title} onChange={handleChange} />
          </label>

          <label>Company Name<span>*</span>
            <input name="company" required value={formData.company} onChange={handleChange} />
          </label>

          <label>Location
            <input name="location" value={formData.location} onChange={handleChange} />
          </label>

          <div className="row">
            <label>Job Type
              <select name="type" required value={formData.type} onChange={handleChange}>
                <option value="">Select type</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>
            </label>

            <label>Salary Range
              <input name="salary" value={formData.salary} onChange={handleChange} />
            </label>
          </div>

          <label>Job Description<span>*</span>
            <textarea name="description" required value={formData.description} onChange={handleChange} />
          </label>

          <label>Requirements
            <textarea name="requirements" value={formData.requirements} onChange={handleChange} />
          </label>

          <label>Required Skills<span>*</span>
            <select value={selectedSkill} onChange={handleSkillChange} required>
              <option value="">Select skill</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="JavaScript">JavaScript</option>
              <option value="custom">Customize (Other)</option>
            </select>
          </label>

          {selectedSkill === 'custom' && (
            <label>Enter Custom Skill<span>*</span>
              <input type="text" value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} required />
            </label>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit">Post Job</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Postjob;