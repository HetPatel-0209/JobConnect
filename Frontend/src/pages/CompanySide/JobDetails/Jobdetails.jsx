import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Jobdetails.css';

const Jobdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobId = parseInt(id);

  const [job, setJob] = useState(null);
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email;

  useEffect(() => {
    const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
    const userJobs = allUserJobs[email] || [];
    const matchedJob = userJobs.find(j => j.id === jobId);
    setJob(matchedJob);
    setEditData(matchedJob || {});
  }, [jobId, email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
    const userJobs = allUserJobs[email] || [];
    const updatedJobs = userJobs.map(j => j.id === jobId ? { ...j, ...editData } : j);

    allUserJobs[email] = updatedJobs;
    localStorage.setItem('userJobs', JSON.stringify(allUserJobs));

    // Update global jobs list
    const globalJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const updatedGlobalJobs = globalJobs.map(j => j.id === jobId ? { ...j, ...editData } : j);
    localStorage.setItem('jobs', JSON.stringify(updatedGlobalJobs));

    setJob(editData);
    setIsEditing(false);
  };

  if (!job) return <p style={{ padding: "100px" }}>Job not found.</p>;

  return (
    <div className="job-details-page">
      <div className="job-details-box">
        <h2>{isEditing ? 'Edit Job Details' : job.title}</h2>

        {isEditing ? (
          <>
            <label>Job Title:
              <input name="title" value={editData.title} onChange={handleChange} />
            </label>
            <label>Company Name:
              <input name="company" value={editData.company} onChange={handleChange} />
            </label>
            <label>Location:
              <input name="location" value={editData.location} onChange={handleChange} />
            </label>
            <label>Job Type:
              <input name="type" value={editData.type} onChange={handleChange} />
            </label>
            <label>Salary Range:
              <input name="salary" value={editData.salary} onChange={handleChange} />
            </label>
            <label>Job Description:
              <textarea name="description" value={editData.description} onChange={handleChange} />
            </label>
            <label>Requirements:
              <textarea name="requirements" value={editData.requirements} onChange={handleChange} />
            </label>
            <label>Required Skills:
              <input name="skill" value={editData.skill} onChange={handleChange} />
            </label>
          </>
        ) : (
          <>
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Job Type:</strong> {job.type}</p>
            <p><strong>Salary:</strong> {job.salary}</p>
            <p><strong>Posted:</strong> {job.date}</p>
            <p><strong>Applicants:</strong> {job.applicants}</p>
            <p><strong>Required Skills:</strong> {job.skill}</p>
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Requirements:</strong> {job.requirements}</p>
          </>
        )}

        <div className="btn-group">
          <button onClick={() => navigate(-1)}>← Back</button>
          {isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobdetails;
