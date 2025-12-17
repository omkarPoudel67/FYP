import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./CSS/ResetPassword.css"; // We'll style the box here

export default function ResetPassword() {
  const { userId, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/reset-password/",
        {
          user_id: userId,
          token: token,
          new_password: password,
          confirm_password: confirm,
        }
      );

      setMessage(res.data.success);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error resetting password");
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-box">
        <h2>Enter New Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
