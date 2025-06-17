// src/Pages/Auth/AuthPage.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";

export default function AuthPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const mode = params.get('mode');

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#f9f9f9' }}>
      {mode === 'register' ? <RegistrationForm /> : <LoginForm />}
    </div>
  );
}
