import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/DeleteAccount.css";
import {useState} from 'react';

const DeleteAccount = () => {
  const { token, user, logout } = useAuth(); // assuming you have user.id stored
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleDeleteClick = () => {
    const userId = user?.id || sessionStorage.getItem('userId');

    //console.log("Delete account clicked");
    //console.log("User:", user);
    //console.log("Token:", token);
    //console.log("User ID:", userId);
    
    if (!token) {
      console.error("No token found - user not authenticated");
      alert("You must be logged in to delete your account.");
      return;
    }
    if (!userId) {
      console.error("No user ID found");
      return;
    }

    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    const userId = user?.id || sessionStorage.getItem('userId');
    
    try {
      const res = await fetch(`api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Account deleted successfully.");
        logout();
        navigate("/");
      } else {
        const errorData = await res.json();
        console.error("Failed to delete account", errorData);
        alert("Failed to delete account.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error deleting account.");
    }
    
    setShowModal(false);
  };

  const handleCancelDelete = () => {
    setShowModal(false);
  };

  return (
    <>
      <button className="btn-danger" onClick={handleDeleteClick}>
        Delete Account
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button 
                className="btn-cancel" 
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={handleConfirmDelete}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccount;
