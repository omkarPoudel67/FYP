// Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../auth";
import ForgotPassword from "./ForgotPassword";
import "./CSS/login.css";
import loginImage from "../public/login.jpg";
import { useAuth } from "../context/authcontext.jsx";
const BASE_URL = "http://localhost:8000/api";
import axios from 'axios';

export default function Login() {
  const { setAccessToken } = useAuth(); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const goToPublicDashboard = () =>{
    navigate("/public")
  }

  const goToFaceLogin = () => {
    navigate("/face-login");
  };
  
  const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const data = await loginUser(username, password);
    
    if (data.success) {
      setAccessToken(data.access);
      
      if (data.role === "student") {
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
        navigate("/student-dashboard", { state: { username: data.username } });
      } else if (data.role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        setError(data.message || "Login failed");
        setIsLoading(false);
      }
    } else {
      setError(data.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="logo">
        <span className="logo-text">Academiazz</span>
        <span className="logo-dot"></span>
      </div>

      {/* Public Dashboard Button - Top Right */}
      <button className="public-dashboard-btn" onClick={goToPublicDashboard}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 12V18L12 21L19 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Public Dashboard
      </button>

      <div className="login-left">
        <div className="login-left-content">
          <div className="welcome-section">
            <h2 color="red">Welcome Back! </h2>
            <p className="welcome-subtitle">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <span
                className="forgot-link"
                onClick={() => setShowForgot(true)}
              >
                Forgot Password?
              </span>
            </div>

            <button 
              type="submit" 
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <button className="webcam-btn" onClick={goToFaceLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Login via Webcam
          </button>

          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="login-right">
        <div className="image-overlay"></div>
        <div className="quote-container">
          <h2>
            “Education is the most powerful weapon which you can use to change
            the world.”
          </h2>
          <p>– Nelson Mandela</p>
          <div className="quote-decoration"></div>
        </div>
      </div>

      <ForgotPassword show={showForgot} onClose={() => setShowForgot(false)} />
    </div>
  );
}