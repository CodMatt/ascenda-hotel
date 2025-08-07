import { useLocation, useNavigate } from "react-router-dom";
import logo from '../assets/logo.png';

function NavBar() {
    const navigate = useNavigate();
    const no_account = true;
    return (
        <header className="page-header">
            <div className="dsp-logo">
                <img src={logo} alt="Ascenda logo" className="logo-img" />
            </div>

        {no_account ? (
            <div className="dsp-actions">
                <button className="btn-outline" onClick={() => navigate('/login')}>Sign In</button>
                <button className="btn-primary" onClick={() => navigate('/signup')}>Register</button>
            </div>
        ) : (
            <div className="dsp-actions">
                <button className="btn-outline" onClick={() => navigate('/login')}>Logout</button>
                <button className="btn-primary" onClick={() => navigate('/signup')}>View Booking</button>
            </div>
        )}



        </header>
    );
}

export default NavBar;