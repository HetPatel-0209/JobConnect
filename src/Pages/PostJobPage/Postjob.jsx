// Postjob.jsx (only key changes shown)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Postjob.css';

const Postjob = ({ setJobs }) => {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: '', salary: '', description: '', requirements: '',
  });

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
  date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  applicants: 0,
  status: 'Active',
};
    setJobs(prev => [newJob, ...prev]);
    navigate('/dashboard');
  };

  return (
    <div className="postjob-container">
      <div className="form-box">
        <h2>Post a New Job</h2>
        <p className="form-subtitle">Fill in the details below to create a new job listing</p>
        
        <form className="job-form" onSubmit={handleSubmit}>
          
          <label>Job Title<span>*</span><input name="title" type="text" required placeholder="e.g. Senior Developer" value={formData.title} onChange={handleChange} />
          </label>
          
          <label>Company Name<span>*</span><input name="company" type="text" required placeholder="Company name" value={formData.company} onChange={handleChange} />
          </label>
          
          <label>Location<input name="location" type="text" placeholder="e.g. Remote" value={formData.location} onChange={handleChange} />
          </label>

          <div className="row">
            <label>Job Type<select name="type" required value={formData.type} onChange={handleChange}>
              <option value="">Select type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select></label>

            <label>Salary Range<input name="salary" type="text" placeholder="e.g. 20k - 60k" value={formData.salary} onChange={handleChange} />
            </label>
          </div>

          <label>Job Description<span>*</span><textarea name="description" required placeholder="Job responsibilities..." value={formData.description} onChange={handleChange} />
          </label>
          
          <label>Requirements<textarea name="requirements" placeholder="Education, experience..." value={formData.requirements} onChange={handleChange} />
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
              <input type="text" className="custom-skill-input" value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} required />
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
