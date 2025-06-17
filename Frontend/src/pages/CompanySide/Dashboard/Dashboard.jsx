import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { FaBriefcase, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CiClock2 } from "react-icons/ci";
import { RiAddLargeFill } from "react-icons/ri";

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const email = currentUser?.email;

  // Load user's jobs from localStorage
  useEffect(() => {
    const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
    const userJobs = allUserJobs[email] || [];
    setJobs(userJobs);
  }, [email]);

  // Save updated jobs back to localStorage for the specific user
  const updateUserJobs = (updatedJobs) => {
    const allUserJobs = JSON.parse(localStorage.getItem('userJobs')) || {};
    allUserJobs[email] = updatedJobs;
    localStorage.setItem('userJobs', JSON.stringify(allUserJobs));
    setJobs(updatedJobs);
  };

  const handleRemoveJob = (jobId) => {
    // 1. Remove from current user's job list
    const filtered = jobs.filter(job => job.id !== jobId);
    updateUserJobs(filtered);

    // 2. Remove from global "jobs" list shown to jobseekers
    const allGlobalJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const updatedGlobalJobs = allGlobalJobs.filter(job => job.id !== jobId);
    localStorage.setItem('jobs', JSON.stringify(updatedGlobalJobs));
  };


  const handleNewApplication = (jobId) => {
    const updated = jobs.map(job =>
      job.id === jobId ? { ...job, applicants: job.applicants + 1 } : job
    );
    updateUserJobs(updated);
  };

  const activeJobs = jobs.filter(job => job.status === 'Active');
  const totalApplications = jobs.reduce((sum, job) => sum + job.applicants, 0);

  return (
    <div className="dashboard">
      <h2>Welcome back, {currentUser?.name || 'User'}</h2>
      <p>Here's what's happening with your job listings today.</p>

      <div className="stats-container">
        <div className="stats-card">
          <h3><FaBriefcase /> Active Jobs</h3>
          <p className="count">{activeJobs.length}</p>
          <button className="post-job-btn" onClick={() => navigate('/postjob')}>
            <RiAddLargeFill className="plus-icon" /> Post New Job
          </button>
        </div>
        <div className="stats-card">
          <h3><FaUserCircle /> Total Applications</h3>
          <p className="count">{totalApplications}</p>
          <p className="new-today"><CiClock2 className="clock-icon" /> 0 New Today</p>
        </div>
      </div>

      <div className="section">
        <div className="section-header"><h3>Recent Job Postings</h3></div>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          jobs.map(job => (
            <div className="job-card" key={job.id}>
              <div className="job-details">
                <h4>{job.title}</h4>
                <p>{job.type} | {job.salary}</p>
                <p>Posted: {job.date}</p>
              </div>
              <div className="job-actions">
                {/* <button onClick={() => handleNewApplication(job.id)}>+ Application</button> */}
                <button onClick={() => navigate(`/job/${job.id}/applicants`)}>Total Applicants List</button>
                <button onClick={() => navigate(`/job/${job.id}`)}>Details</button>
                <button className="remove-btn" onClick={() => handleRemoveJob(job.id)}>Remove</button>
                <span>{job.applicants} applicants</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
