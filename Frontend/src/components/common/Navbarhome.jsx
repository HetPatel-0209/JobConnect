import './Navbarhome.css';
import logo from "../../assets/job.jpeg";
import { Link } from 'react-router-dom';
import React from 'react';

export default function Navbar() {
  return (
    <header className='header'>
      <div className='logo-container'>
        <img src={logo} alt="Logo" />
      </div>

<div className="nav-buttons">
  <Link to="/" className="joinus-btn">Organization</Link>
  <Link to="/auth" className="joinus-btn">JoinUs</Link>
</div>

    </header>
  );
}
