import React, { useState, useContext, useEffect } from 'react';
import './JobDashboard.css';
import UploadResume from '../UserResume/UploadResume';
import { ProfileContext } from '../../../contexts/ProfileContext';
import Navbaruser from '../../../components/common/Navbaruser';
import { useNavigate } from 'react-router-dom';

export default function JobDashboard() {
  const [showUploadScreen, setShowUploadScreen] = useState(false);
  const { applications } = useContext(ProfileContext);
  const safeApplications = Array.isArray(applications) ? applications : [];

  const [user, setUser] = useState({ name: 'User' });
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) setUser(storedUser);

    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    setRecommendedJobs(jobs);
  }, []);

  return (
    <>
      <Navbaruser />
      <div className="dashboard">
        {showUploadScreen ? (
          <UploadResume onClose={() => setShowUploadScreen(false)} />
        ) : (
          <main className="main">
            <h1>
              Welcome back, <span className="user-name">{user?.name || 'User'}</span>
            </h1>

            <div className="profile-banner">
              <div>
                <h2>Complete Your Profile</h2>
                <p>Upload your resume to get better job matches and apply faster.</p>
              </div>
              <button className="upload-btn" onClick={() => setShowUploadScreen(true)}>
                Upload Resume
              </button>
            </div>

            <div className="search-bar">
              <input type="text" placeholder="Job title, keyword or company" />
              <button className="search-btn">Search Jobs</button>
            </div>

            <div className="cards">
              <div className="card">
                <div className="card-header">
                  <span>Applications</span>
                  <span>🧳</span>
                </div>
                <h3>{safeApplications.length}</h3>
                <p>Under Work</p>
              </div>
              <div className="card">
                <div className="card-header">
                  <span>Saved Jobs</span>
                  <span>⭐</span>
                </div>
                <h3>0</h3>
                <p>Under Work</p>
              </div>
              <div className="card">
                <div className="card-header">
                  <span>Interviews</span>
                  <span>✔️</span>
                </div>
                <h3>0</h3>
                <p>Under Work</p>
              </div>
              <div className="card">
                <div className="card-header">
                  <span>Messages</span>
                  <span>💬</span>
                </div>
                <h3>0</h3>
                <p>Under Work</p>
              </div>
            </div>

            <div className="recent-applications">
              <h2>Recent Applications</h2>
              {safeApplications.length === 0 ? (
                <p>No recent applications.</p>
              ) : (
                safeApplications.map((app, index) => (
                  <div className="application-card" key={index}>
                    <div className="application-info">
                      <h3>{app.title}</h3>
                      <p>{app.company} • {app.location}</p>
                      <div className="application-meta">
                        <span>{app.status}</span>
                        <span>{app.appliedDate}</span>
                      </div>
                    </div>
                    <button className="resume-btn">View Resume Score</button>
                  </div>
                ))
              )}
            </div>

            <div className="recommended-jobs">
              <h2>Recommended for You</h2>
              {recommendedJobs.length === 0 ? (
                <p>No job recommendations yet.</p>
              ) : (
                recommendedJobs.map(job => (
                  <div className="job-card" key={job.id}>
                    <div className="job-info">
                      <h3>{job.title}</h3>
                      <p>{job.company}</p>
                      <p>{job.location}</p>
                      <p>{job.salary}</p>
                    </div>
                    <div className="job-action">
                      <div className="button-group">
                        <button
                          className="details-btn"
                          onClick={() => navigate(`/user/job/${job.id}`)}
                        >
                          Job Details
                        </button>
                        <button
                          className="hr-btn"
                          onClick={() => navigate(`/user/job/${job.id}/hr`)}
                        >
                          HR Details
                        </button>
                        <button
                          className="company-btn"
                          onClick={() => navigate(`/user/job/${job.id}/company`)}
                        >
                          Company Details
                        </button>
                        <button
                          className="Apply-job"
                          onClick={() => navigate()}
                        >
                          Apply For This Job
                        </button>
                      </div>
                      <span className="posted-time">Posted: {job.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        )}
      </div>
    </>
  );
}
