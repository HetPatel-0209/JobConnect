import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegistrationForm';
import './index.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <div className="auth-container">
            {isLogin ? (
              <LoginForm onSwitch={toggleForm} />
            ) : (
              <RegisterForm onSwitch={toggleForm} />
            )}
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
