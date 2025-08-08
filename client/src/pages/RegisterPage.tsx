import React from "react";
import logo from "../assets/logo.png";
import SignupForm from "../components/SignupForm";

import "../styles/RegisterPage.css";

const RegisterPage: React.FC = () => {

  return (
    <div className="signin-page">
      <div className="signin-wrapper">
        <img src={logo} alt="Logo" className="signin-logo" />
        <h2 className="signin-title">Create an Account</h2>
        <SignupForm />

      </div>
    </div>
  );
};

export default RegisterPage;

