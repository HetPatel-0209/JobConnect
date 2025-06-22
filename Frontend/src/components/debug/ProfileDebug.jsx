import React, { useState } from 'react';
import { AuthService } from '../../services/auth.service';

const ProfileDebug = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testProfileFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing profile fetch...');
      const response = await AuthService.getProfile();
      console.log('Profile fetch result:', response);
      setResult(response);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorage = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    console.log('LocalStorage user:', user);
    console.log('LocalStorage token:', token ? 'Present' : 'Missing');
    setResult({
      localStorage: {
        user: user ? JSON.parse(user) : null,
        hasToken: !!token
      }
    });
  };

  const testResumeAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing resume API...');
      const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || 'https://jobconnect-xwh3.onrender.com/api';
      const resumeResponse = await fetch(`${API_BASE_URL}/jobs/resumes/user`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const resumeData = await resumeResponse.json();
      console.log('Resume API response:', resumeData);
      setResult({
        resumeAPI: {
          status: resumeResponse.status,
          data: resumeData
        }
      });
    } catch (err) {
      console.error('Resume API error:', err);
      setError(err.message || 'Resume API test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Profile Debug Tool</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={testProfileFetch} disabled={loading}>
          {loading ? 'Testing...' : 'Test Profile Fetch'}
        </button>
        <button onClick={checkLocalStorage} style={{ marginLeft: '10px' }}>
          Check LocalStorage
        </button>
        <button onClick={testResumeAPI} style={{ marginLeft: '10px' }} disabled={loading}>
          Test Resume API
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '10px' }}>
          <h4>Result:</h4>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ProfileDebug;
