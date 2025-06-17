import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UserJobDetails.css';

export default function UserJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const allJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const found = allJobs.find(job => job.id === Number(id));
    setJob(found);
  }, [id]);

  if (!job) {
    return <div className="job-detail-container"><p>Job not found.</p></div>;
  }

  return (
    <div className="job-detail-container">
      <h1 className="job-title">{job.title}</h1>

      <div className="job-line"><strong>Company Name:</strong> {job.company}</div>
      <div className="job-line"><strong>Location:</strong> {job.location}</div>
      <div className="job-line"><strong>Job Type:</strong> {job.type}</div>
      <div className="job-line"><strong>Salary Range:</strong> {job.salary}</div>
      <div className="job-line"><strong>Posted On:</strong> {job.date}</div>

      <div className="job-line"><strong>Job Description:</strong></div>
      <p className="job-text">{job.description}</p>

      <div className="job-line"><strong>Requirements:</strong></div>
      <p className="job-text">{job.requirements}</p>

      <div className="job-line"><strong>Required Skills:</strong></div>
      <p className="job-text">{job.skill}</p>

      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Jobs</button>
    </div>
  );
}
