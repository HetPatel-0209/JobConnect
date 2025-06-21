// src/pages/Auth/AuthPage.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";
import ForgotPassword from "./ForgotPassword";

export default function AuthPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const mode = params.get('mode');

  const renderComponent = () => {
    switch (mode) {
      case 'register':
        return <RegistrationForm />;
      case 'forgot-password':
        return <ForgotPassword />;
      default:
        return <LoginForm />;
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#f9f9f9' }}>
      {renderComponent()}
    </div>
  );
}
