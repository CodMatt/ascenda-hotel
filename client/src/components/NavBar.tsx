import { useLocation, useNavigate } from "react-router-dom";
import logo from '../assets/logo.png';

function NavBar() {
    const navigate = useNavigate();
    return (
        <header className="page-header">
            <div className="dsp-logo">
                <img src={logo} alt="Ascenda logo" className="logo-img" />
            </div>
            <div className="dsp-actions">
                <button className="btn-outline" onClick={() => navigate('/login')}>Sign In</button>
                <button className="btn-primary" onClick={() => navigate('/signup')}>Register</button>
            </div>
        </header>
    );
}

export default NavBar;