import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

function EmptyNavBar() {
  

  

  return (
    <header className="page-header">
      <div className="dsp-logo">
        <img src={logo} alt="Ascenda logo" className="logo-img" />
      </div>
    </header>
  );
}

export default EmptyNavBar;
