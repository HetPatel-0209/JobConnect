import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TfiEmail } from 'react-icons/tfi';
import { SlLock } from 'react-icons/sl';
import './LoginForm.css';
import Navbarauth from '../../components/common/Navbarauth';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(user => user.email === email && user.password === password);

    if (foundUser) {
      localStorage.setItem('currentUser', JSON.stringify(foundUser));

      // ✅ Redirect based on type
      if (foundUser.type === 'jobseeker') {
        navigate('/user/job-dashboard');
      } else if (foundUser.type === 'employer') {
        navigate('/dashboard');
      } else {
        alert('Unknown user type!');
      }
    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <>
      <Navbarauth />
      <div className="auth-container">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtext">
          Or <span className="auth-link" onClick={() => navigate('/auth?mode=register')}>Create new account</span>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email address</label>
          <div className="auth-input-wrapper">
            <TfiEmail className="auth-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <label>Password</label>
          <div className="auth-input-wrapper">
            <SlLock className="auth-icon" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-submit">Sign in</button>
        </form>
      </div>
    </>
  );
}
