import React from 'react';

const RegisterForm = ({ onSwitch }) => {
  return (
    <div className="form-box">
      <h2>Create your account</h2>
      <p>Or <a href="#" onClick={onSwitch}>Sign in to your existing account</a></p>

      <div className="form-group">
        <label>I Want to…</label>
        <div className="toggle-buttons">
          <button className="role-btn">🧑‍💼 Find a Job</button>
          <button className="role-btn">💼 Hire Talent</button>
        </div>
      </div>

      <div className="form-group">
        <label>Full Name</label>
        <div className="input-box">
          <span className="icon">👤</span>
          <input type="text" placeholder="Enter Your Name" />
        </div>
      </div>

      <div className="form-group">
        <label>Email address</label>
        <div className="input-box">
          <span className="icon">📧</span>
          <input type="email" placeholder="Enter your Email ID" />
        </div>
      </div>

      <div className="form-group">
        <label>Password</label>
        <div className="input-box">
          <span className="icon">🔒</span>
          <input type="password" placeholder="...................." />
        </div>
      </div>

      <div className="form-group">
        <label>Confirm Password</label>
        <div className="input-box">
          <span className="icon">🔒</span>
          <input type="password" placeholder="...................." />
        </div>
      </div>

      <button className="submit-btn">Create Account</button>
    </div>
  );
};

export default RegisterForm;