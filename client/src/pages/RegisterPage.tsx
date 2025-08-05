import React from "react";
import logo from "../assets/logo.png";
import SignupForm from "../components/SignupForm";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css";

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
  return (
    <div className="signin-page">
      <div className="signin-wrapper">
        <img src={logo} alt="Logo" className="signin-logo" />
        <h2 className="signin-title">Create an Account</h2>
        <SignupForm />


        {/* ← Back button */}
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

      </div>
    </div>
  );
};

export default RegisterPage;

