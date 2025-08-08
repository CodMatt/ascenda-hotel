import logo from "../assets/logo.png";
import LoginForm from "../components/LoginForm";

import "../styles/LoginPage.css";

export default function LoginPage() {

    return (
      <div className="signin-page">
        <div className="signin-wrapper">
          <img src={logo} alt="Ascenda logo" className="signin-logo" />
          <h2 className="signin-title">Log in to your account</h2>
  
          <LoginForm />

        </div>
      </div>
    );
  }
