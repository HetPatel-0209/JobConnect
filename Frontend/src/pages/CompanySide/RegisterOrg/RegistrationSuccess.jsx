import React from "react";
import { useNavigate } from "react-router-dom";
import "./RegistrationSuccess.css";
import successImg from "../../../assets/Success.svg";
import Navbarauth from '../../../components/common/Navbarauth';



const RegistrationSuccess = () => {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <Navbarauth /> {/* ✅ Added Navbar Auth */}
      <div className="success-container">
        <div className="success-card">
          <img src={successImg} alt="Registration Successful" className="success-img" />
          <h2>Registration Successful!</h2>
          <p>You can now manage everything from your dashboard.</p>
          <button className="go-dashboard-btn" onClick={goToDashboard}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </>
  );
};

export default RegistrationSuccess;
