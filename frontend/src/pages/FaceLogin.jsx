import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import "./CSS/FaceLogin.css";

export default function FaceLogin() {
  const { setAccessToken } = useAuth(); 
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const captureAndLogin = async () => {
    if (!videoRef.current || !isCameraActive) {
      setError("Please start the camera first");
      return;
    }

    setIsLoading(true);
    setError("");

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg"));
    const formData = new FormData();
    formData.append("image", blob, "face.jpg");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/facial-recognition/login-face/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Face login response:", data);

      if (data.success) {
        stopCamera();
        setAccessToken(data.access);

        if (data.role === "student") {
          navigate("/");
        } else if (data.role === "teacher") {
          navigate("/teacher-dashboard");
        } else {
          setError(data.message || "Login failed");
        }
      } else {
        setError(data.message || "Face not recognized");
      }
    } catch (err) {
      console.error("Error logging in with face:", err);
      setError("Network error or server not responding");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    stopCamera();
    navigate("/");
  };

  return (
    <div className="face-login-page">
      <div className="logo" onClick={goBack}>
        <span className="logo-text">Academiazz</span>
        <span className="logo-dot"></span>
      </div>

      <div className="face-login-container">
        <div className="face-login-content">
          <div className="welcome-section">
            <h2>Face Login</h2>
            <p className="welcome-subtitle">Look into the camera to sign in securely</p>
          </div>

          <div className="camera-container">
            <div className="camera-frame">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
              />
              {isCameraActive && (
                <>
                  <div className="camera-overlay"></div>
                  <div className="camera-status">
                    <span className="dot"></span>
                    Camera Active
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="button-group">
            {!isCameraActive ? (
              <button 
                className="camera-btn start" 
                onClick={startCamera}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Start Camera
              </button>
            ) : (
              <button 
                className="camera-btn capture" 
                onClick={captureAndLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Login with Face
                  </>
                )}
              </button>
            )}
          </div>

          <button className="back-btn" onClick={goBack}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Login
          </button>

          {error && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}