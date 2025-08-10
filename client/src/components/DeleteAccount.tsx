import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DeleteAccount = () => {
  const { token, user, logout } = useAuth(); // assuming you have user.id stored
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!user?.id) {
      console.error("No user ID found");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const res = await fetch(`api/users/${user.id}`, {
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
  };

  return (
    <button className="btn-danger" onClick={handleDelete}>
      Delete Account
    </button>
  );
};

export default DeleteAccount;
