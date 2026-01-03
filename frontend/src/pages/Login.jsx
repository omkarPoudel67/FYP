import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../auth";
import ForgotPassword from "./ForgotPassword";
import "./CSS/Login.css";
import loginImage from "../public/login.jpg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  const goToFaceLogin = () => {
  navigate("/face-login");
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await loginUser(username, password);

    if (data.success) {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      if (data.role == "student"){
                navigate("/student-dashboard", { state: { username: data.username } });            }
            else if (data.role == "teacher"){
                navigate("/teacher-dashboard");
            }
            else{
                setError(data.message || "Login failed")
            }
    }
    else {
      setError(data.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="logo">academiazz</div>

      <div className="login-left">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        <div className="login-links">
          <span
            style={{ cursor: "pointer", color: "#8b5cf6", textDecoration: "underline" }}
            onClick={() => setShowForgot(true)}
          >
            Forgot Password?
          </span>
        </div>

        <div className="divider">OR</div>

        <button className="webcam-btn" onClick={goToFaceLogin}>Login via Webcam 📷</button>

        {error && <p className="error">{error}</p>}
      </div>

      <div className="login-right">
        <img src={loginImage} alt="Education" />
        <h2>
          “Education is the most powerful weapon which you can use to change
          the world.”
        </h2>
        <p>– Nelson Mandela</p>
      </div>

      <ForgotPassword show={showForgot} onClose={() => setShowForgot(false)} />
    </div>
  );
}
