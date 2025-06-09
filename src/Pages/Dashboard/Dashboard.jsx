// Dashboard.jsx
import React from 'react';
import './Dashboard.css';
import { FaBriefcase, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CiClock2 } from "react-icons/ci";
import { RiAddLargeFill } from "react-icons/ri";

const Dashboard = ({ jobs, setJobs }) => {
  const navigate = useNavigate();
  const activeJobs = jobs.filter(job => job.status === 'Active');
  const totalApplications = jobs.reduce((sum, job) => sum + job.applicants, 0);

  const handleNewApplication = (jobId) => {
    const updated = jobs.map(job =>
      job.id === jobId ? { ...job, applicants: job.applicants + 1 } : job
    );
    setJobs(updated);
  };

  const handleRemoveJob = (jobId) => {
    const filtered = jobs.filter(job => job.id !== jobId);
    setJobs(filtered);
  };

  return (
    <div className="dashboard">
      <h2>Welcome back, User</h2>
      <p>Here's what's happening with your job listings today.</p>

      <div className="stats">
        <div className="card">
          <h3><FaBriefcase /> Active Jobs</h3>
          <p className="count">{activeJobs.length}</p>
          <button className="post-job-btn" onClick={() => navigate('/postjob')}>
            <RiAddLargeFill className="plus-icon" />
            Post New Job
          </button>
        </div>
        <div className="card">
          <h3><FaUserCircle /> Total Applications</h3>
          <p className="count">{totalApplications}</p>
          <p className="new-today">
            <CiClock2 className="clock-icon" /> 0 New Today
          </p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Recent Job Postings</h3>
        </div>
        {jobs.length === 0 ? (
          <p style={{ padding: '10px', color: '#888' }}>No jobs posted yet.</p>
        ) : (
          jobs.map(job => (
            <div className="job-card" key={job.id}>
              <div className="job-details">
                <h4>{job.title}</h4>
                <p>{job.type} | {job.salary}</p>
                <p className="light">Posted: {job.date}</p>
              </div>
              <div className="job-actions">
                <button onClick={() => handleNewApplication(job.id)}>+ Application</button>
                <button onClick={() => navigate(`/job/${job.id}`)}>Details</button>
                <button className="remove-btn" onClick={() => handleRemoveJob(job.id)}>Remove</button>
                <span className={`applicants ${job.status.toLowerCase()}`}>{job.applicants} applicants</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
