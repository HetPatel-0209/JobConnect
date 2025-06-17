import './Navbarauth.css';
import logo from "../../assets/job.jpeg";
import { Link } from 'react-router-dom';
import React from 'react';

export default function Navbar() {
  return (
    <header className='header'>
      <div className='logo-container'>
        <img src={logo} alt="Logo" />
      </div>

      <nav className="navbar">
        <Link to="/home" className="link">Home</Link>
      </nav>
    </header>
  );
}
