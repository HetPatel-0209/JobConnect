import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ApplicantsList.css';

export default function ApplicantsList() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find(j => j.id === jobId);
    if (job?.applicantsList?.length) {
      setApplicants(job.applicantsList);
    } else {
      setApplicants([]);
    }
  }, [jobId]);

  return (
    <div className="applicants-list-page">
      <h2>Applicants for Job ID: {jobId}</h2>
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>

      {applicants.length === 0 ? (
        <p>No applicants found.</p>
      ) : (
        <ul className="applicants-list">
          {applicants.map((applicant, index) => (
            <li key={index} className="applicant-card">
              <h4>{applicant.name}</h4>
              <p><strong>Email:</strong> {applicant.email}</p>
              <p><strong>Location:</strong> {applicant.location || 'N/A'}</p>
              <p><strong>Mobile:</strong> {applicant.mobile || 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
