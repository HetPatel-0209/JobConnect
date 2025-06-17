import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ⬅️ Import useNavigate
import './HRDetails.css';

export default function HRDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // ⬅️ Create navigate function
  const [hrProfile, setHrProfile] = useState(null);

  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find(j => j.id === Number(id));
    if (job && job.hrDetails) {
      setHrProfile(job.hrDetails);
    }
  }, [id]);

  if (!hrProfile) {
    return (
      <div className="hr-details-container">
        <h2>HR Details Not Found</h2>
        <p>The HR profile could not be loaded.</p>
        <button className="back-btn" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  return (
    <div className="hr-details-container">
      <h2>HR Contact Details</h2>
      <p><strong>Full Name:</strong> {hrProfile.fullname || 'N/A'}</p>
      <p><strong>Phone:</strong> {hrProfile.phone || 'N/A'}</p>
      <p><strong>Email:</strong> {hrProfile.email || 'N/A'}</p>
      <p><strong>Location:</strong> {hrProfile.location || 'N/A'}</p>
      <p><strong>Title:</strong> {hrProfile.title || 'N/A'}</p>
      <p><strong>Bio:</strong> {hrProfile.bio || 'N/A'}</p>

      <button className="back-btn" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );
}
