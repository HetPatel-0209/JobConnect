import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { LuBriefcaseBusiness } from 'react-icons/lu';
import { TfiEmail } from 'react-icons/tfi';
import { SlLock } from 'react-icons/sl';
import './RegistrationForm.css';
import Navbarauth from '../../components/common/Navbarauth';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'jobseeker';  // ✅ Read from URL
  const [userType, setUserType] = useState(defaultType);         // ✅ Set as default

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });

  // ... (rest of your code stays the same)

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.email.includes('@')) errors.email = 'Email must include @';
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errors.confirm = 'Passwords do not match';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const users = JSON.parse(localStorage.getItem('users')) || [];

      const newUser = {
        name: form.name,
        email: form.email,
        password: form.password,
        type: userType
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      if (userType === 'jobseeker') {
        navigate('/user/job-dashboard');
      } else {
        navigate('/register-organization');
      }
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <Navbarauth />
      <div className="auth-container">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtext">
          Or <span className="auth-link" onClick={() => navigate('/auth?mode=login')}>Sign in to your existing account</span>
        </p>

        <div className="user-toggle">
          <button className={userType === 'jobseeker' ? 'selected' : ''} onClick={() => setUserType('jobseeker')}>
            <FaUser style={{ marginRight: '8px' }} />
            Find a Job
          </button>
          <button className={userType === 'employer' ? 'selected' : ''} onClick={() => setUserType('employer')}>
            <LuBriefcaseBusiness style={{ marginRight: '8px' }} />
            Hire Talent
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full Name</label>
          <div className="auth-input-wrapper">
            <FaUser className="auth-icon" />
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your Full Name" required />
          </div>

          <label>Email address</label>
          <div className="auth-input-wrapper">
            <TfiEmail className="auth-icon" />
            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="you@example.com" required />
          </div>
          {errors.email && <span className="auth-error">{errors.email}</span>}

          <label>Password</label>
          <div className="auth-input-wrapper">
            <SlLock className="auth-icon" />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="•••••••••" required />
          </div>
          {errors.password && <span className="auth-error">{errors.password}</span>}

          <label>Confirm Password</label>
          <div className="auth-input-wrapper">
            <SlLock className="auth-icon" />
            <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="•••••••••" required />
          </div>
          {errors.confirm && <span className="auth-error">{errors.confirm}</span>}

          <button type="submit" className="auth-submit">Create Account</button>
        </form>
      </div>
    </>
  );
}
