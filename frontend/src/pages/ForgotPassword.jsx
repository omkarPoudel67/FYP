import { useState } from "react";
import axios from "axios";
import "./CSS/ForgotPassword.css";

export default function ForgotPassword({ show, onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/api/forgot-password/", { email });
      setMessage(res.data.message);
    } catch (error) {
      console.error(error);
      if (error.response) {
        setMessage(error.response.data.message || "Error sending request.");
      } else {
        setMessage("Error sending request.");
      }
    }
  };

  if (!show) return null;

  const handleOverlayClick = (e) => {
    // Close only if user clicked the overlay, not the modal box itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a reset link</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
