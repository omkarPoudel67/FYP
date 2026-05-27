import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../context/authcontext";
import "./CSS/TeacherLogin.css";

export default function TeacherLogin() {
  const { setAccessToken, api } = useAuth();
  const navigate                = useNavigate();

  const [form,        setForm]        = useState({ username: "", password: "" });
  const [error,       setError]       = useState(null);
  const [submitting,  setSubmitting]  = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/api/login/", {
        username: form.username,
        password: form.password,
      });

      const data = res.data;

      if (!data.success) {
        setError("Invalid username or password.");
        return;
      }

      if (data.role !== "teacher") {
        setError("Access denied. Teacher credentials required.");
        return;
      }

      setAccessToken(data.access);
      navigate("/teacher/dashboard");

    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tl-page">
      <div className="tl-card">
        <div className="tl-header">
          <div className="tl-brand">A</div>
          <h1 className="tl-title">Teacher Portal</h1>
          <p className="tl-subtitle">Sign in to your account</p>
        </div>

        <form className="tl-form" onSubmit={handleSubmit}>
          <div className="tl-field">
            <label>Username</label>
            <input
              className={`tl-input ${error ? "tl-input--error" : ""}`}
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="tl-field">
            <label>Password</label>
            <input
              className={`tl-input ${error ? "tl-input--error" : ""}`}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="tl-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            className="tl-btn"
            type="submit"
            disabled={submitting || !form.username || !form.password}
          >
            {submitting ? <span className="tl-spinner" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}