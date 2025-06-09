import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegistrationForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#f9f9f9' }}>
      {isLogin ? (
        <LoginForm onSwitch={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitch={() => setIsLogin(true)} />
      )}
    </div>
  );
}
