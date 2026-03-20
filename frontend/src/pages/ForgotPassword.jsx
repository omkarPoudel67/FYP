import { useState } from "react";
import axios from "axios";

export default function ForgotPassword({ show, onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:8000/api/forgot-password/", { email });
      setMessage({ type: "success", text: res.data.message });
      setEmail(""); // Clear email on success
    } catch (error) {
      console.error(error);
      if (error.response) {
        setMessage({ type: "error", text: error.response.data.message || "Error sending request." });
      } else {
        setMessage({ type: "error", text: "Network error. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="forgot-password-overlay" onClick={handleOverlayClick}>
        <div className="forgot-password-modal">
          <button className="forgot-password-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          <div className="forgot-password-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          
          <h2 className="forgot-password-title">Forgot Password?</h2>
          <p className="forgot-password-subtitle">
            No worries! Enter your email address and we'll send you a reset link.
          </p>
          
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="forgot-password-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="forgot-password-input-wrapper">
                <svg className="forgot-password-input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7L10 12L4 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 7L14 12L20 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`forgot-password-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="forgot-password-spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
          
          {message && (
            <div className={`forgot-password-message ${message.type}`}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {message.type === "success" ? (
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                )}
                {message.type === "error" && (
                  <>
                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  </>
                )}
              </svg>
              <p>{message.text}</p>
            </div>
          )}
          
          <button className="forgot-password-back" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Login
          </button>
        </div>
      </div>

      <style jsx>{`
        .forgot-password-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: overlayFadeIn 0.3s ease;
        }

        @keyframes overlayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .forgot-password-modal {
          background: white;
          border-radius: 24px;
          padding: 40px;
          width: 90%;
          max-width: 450px;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideUp 0.3s ease;
          border: 1px solid rgba(20, 184, 166, 0.1);
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .forgot-password-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #9ca3af;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .forgot-password-close:hover {
          background: #f3f4f6;
          color: #1f2937;
        }

        .forgot-password-close svg {
          width: 20px;
          height: 20px;
        }

        .forgot-password-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(139, 92, 246, 0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: #14b8a6;
        }

        .forgot-password-icon svg {
          width: 40px;
          height: 40px;
        }

        .forgot-password-title {
          font-size: 28px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #1f2937, #374151);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .forgot-password-subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .forgot-password-form {
          width: 100%;
        }

        .forgot-password-input-group {
          margin-bottom: 25px;
          text-align: left;
        }

        .forgot-password-input-group label {
          display: block;
          margin-bottom: 8px;
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
        }

        .forgot-password-input-wrapper {
          position: relative;
          width: 100%;
        }

        .forgot-password-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          transition: color 0.3s ease;
          width: 20px;
          height: 20px;
        }

        .forgot-password-input-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          background-color: #ffffff;
          color: #1f2937;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .forgot-password-input-wrapper input:hover {
          border-color: #14b8a6;
        }

        .forgot-password-input-wrapper input:focus {
          outline: none;
          border-color: #14b8a6;
          box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
        }

        .forgot-password-input-wrapper input:focus + .forgot-password-input-icon {
          color: #14b8a6;
        }

        .forgot-password-input-wrapper input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .forgot-password-button {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .forgot-password-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .forgot-password-button:hover:not(:disabled)::before {
          width: 300px;
          height: 300px;
        }

        .forgot-password-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px rgba(20, 184, 166, 0.3);
        }

        .forgot-password-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 10px rgba(20, 184, 166, 0.2);
        }

        .forgot-password-button.loading {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .forgot-password-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .forgot-password-message {
          margin-top: 20px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideIn 0.3s ease;
          text-align: left;
        }

        .forgot-password-message.success {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border-left: 4px solid #10b981;
        }

        .forgot-password-message.error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #dc2626;
          border-left: 4px solid #dc2626;
        }

        .forgot-password-message svg {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }

        .forgot-password-message.success svg {
          color: #10b981;
        }

        .forgot-password-message.error svg {
          color: #dc2626;
        }

        .forgot-password-message p {
          margin: 0;
          line-height: 1.4;
        }

        .forgot-password-back {
          margin-top: 20px;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          transition: all 0.3s ease;
          border-radius: 8px;
        }

        .forgot-password-back:hover {
          color: #14b8a6;
          background: #f3f4f6;
        }

        .forgot-password-back svg {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        .forgot-password-back:hover svg {
          transform: translateX(-3px);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .forgot-password-modal {
            padding: 30px 20px;
            width: 95%;
          }

          .forgot-password-title {
            font-size: 24px;
          }

          .forgot-password-icon {
            width: 60px;
            height: 60px;
          }

          .forgot-password-icon svg {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>
    </>
  );
}
