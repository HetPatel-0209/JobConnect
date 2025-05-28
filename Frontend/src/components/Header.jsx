import React from 'react';

const Header = () => {
  return (
    <header className="navbar">
      <div className="logo">
        <img src="JobConnect.png" alt="JobConnect" />
        <span className='span'>JobConnect</span>
      </div>
      <nav>
        <a href="#">Home</a>
        <a href="#">About Us</a>
        <a href="#">Contact Us</a>
      </nav>
    </header>
  );
};

export default Header;