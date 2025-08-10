import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import DeleteAccount from "./DeleteAccount";

function NavBar() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="page-header">
      <div className="dsp-logo">
        <img src={logo} alt="Ascenda logo" className="logo-img" />
      </div>
      <div className="dsp-actions">
        {token ? (
          <>
            <button
              className="btn-outline"
              onClick={() => navigate("/bookings")}
            >
              View Booking
            </button>
            <DeleteAccount/>
            <button className="btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>

            <button
              className="btn-outline"
              onClick={() => navigate("/guest-bookings")}
              >
              View Booking
              </button>

            <button className="btn-outline" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="btn-primary" onClick={() => navigate("/signup")}>
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default NavBar;
