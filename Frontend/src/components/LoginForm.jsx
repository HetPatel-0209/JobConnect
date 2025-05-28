import React from 'react';

const LoginForm = ({ onSwitch }) => {
  return (
    <div className="form-box">
      <h2>Welcome Back</h2>
      <p>Or <a href="#" onClick={onSwitch}>Create new account</a></p>

      <div className="form-group">
        <label>Email address</label>
        <div className="input-box">
          <span className="icon">📧</span>
          <input type="email" placeholder="you@example.com" />
        </div>
      </div>

      <div className="form-group">
        <label>Password</label>
        <div className="input-box">
          <span className="icon">🔒</span>
          <input type="password" placeholder="••••••••" />
        </div>
      </div>

      <div className="form-options">
        <label><input type="checkbox" /> Remember me</label>
        <a href="#">Forgot your password?</a>
      </div>

      <button className="submit-btn">Sign in</button>
    </div>
  );
};

export default LoginForm;