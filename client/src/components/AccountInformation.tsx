import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AccountInformation = () => {
    const navigate = useNavigate();
    const { token, logout } = useAuth();


    
    const handleLogout = () => {
        logout();
        navigate(0);
    };

    return (
        
        <div className="account-section">
            <h4>Account Information</h4>
                        
            {token ? (
                <div className="user-info-preview">
                    <div className="account-display">
                        <div className="account-field">
                            <label>Name:</label>
                            <span>{sessionStorage.getItem('firstName')} {sessionStorage.getItem('lastName')}</span>
                        </div>
                        <div className="account-field">
                            <label>Salutation:</label>
                            <span>{sessionStorage.getItem('salutation')}</span>
                        </div>
                        <div className="account-field">
                            <label>Phone Number:</label>
                            <span>{sessionStorage.getItem('phoneNumber')}</span>
                        </div>
                        <div className="account-field">
                            <label>Email Address:</label>
                            <span>{sessionStorage.getItem('emailAddress')}</span>
                        </div>
                    </div>
                    
                    <div className="account-actions">
                        <button className="btn-primary" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="no-account">
                    <p>No account logged in</p>
                    <div className="account-actions">
                        <button className="btn-outline" onClick={() => navigate("/login")}>
                            Sign In
                        </button>
                        <button className="btn-primary" onClick={() => navigate("/signup")}>
                            Register
                        </button>
                    </div>
                </div>
            )}
        </div>
    )

}

export default AccountInformation;