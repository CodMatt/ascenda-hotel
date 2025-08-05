import logo from "../assets/logo.png";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
    return (
      <div className="signin-page">
        <div className="signin-wrapper">
          <img src={logo} alt="Ascenda logo" className="signin-logo" />
          <h2 className="signin-title">Log in to your account</h2>
  
          <LoginForm />

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
  }
