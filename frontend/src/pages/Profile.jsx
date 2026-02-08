import React, { useState, useRef } from "react";
import { useAuth } from "../context/authcontext";
import "./CSS/Profile.css";

const Profile = () => {
  const { accessToken, setAccessToken, api, refreshAccessToken } = useAuth();
  const videoRef = useRef(null);
  const [facialDataStatus, setFacialDataStatus] = useState(false);
  const [error, setError] = useState("");

  // START CAMERA (simple & reliable)
  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true; // required for autoplay
      await videoRef.current.play();
    } catch (err) {
      setError("Camera error: " + err.message);
    }
  };

  // CAPTURE & ENROLL FACE
  const captureAndEnroll = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    // Stop camera
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());

    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    const formData = new FormData();
    formData.append("image", blob, "face.jpg");

    try 
      {
      // Use Axios with headers
      const res = await api.post(
        "/api/facial-recognition/face-register/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        }
      );

      const data = await res.data;
      if (data.success) {
        setFacialDataStatus(true);
        alert("Face enrolled successfully!");
      } else {
        setError(data.message || "Enrollment failed");
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="profile-page">

        {/* Facial Recognition Card */}
        <div className="dashboard-card facial-data-card">
          <div className="card-header">
            <h3 className="card-title">Facial Recognition</h3>
            <span className="card-subtitle">Enroll for attendance & login</span>
          </div>

          <div className="facial-data-content">
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* LIVE CAMERA (always mounted) */}
            <div className="camera-preview">
              <video
                ref={videoRef}
                width="400"
                height="300"
                autoPlay
                playsInline
              />
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ marginTop: "10px" }}>
              <button className="facial-action-btn enroll" onClick={startCamera}>
                Start Camera
              </button>

              <button className="facial-action-btn enroll" onClick={captureAndEnroll}>
                Capture & Enroll
              </button>
            </div>

            {facialDataStatus && (
              <p style={{ color: "green", marginTop: "10px" }}>
                Facial data enrolled successfully ✔
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
