import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate hook

export default function FaceLogin() {
  const videoRef = useRef(null);
  const [error, setError] = useState(""); // State to show any errors
  const navigate = useNavigate(); 

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        
      })
      .catch((err) => console.error(err));
  };

  const captureAndLogin = async () => {
    if (!videoRef.current) return;

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
        // Save JWT tokens in localStorage
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        // Redirect based on user role
        if (data.role === "student") {
          navigate("/student-dashboard");
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
    }
  };

  return (
    <div>
      <h1>Face Login</h1>
      <video ref={videoRef} autoPlay playsInline width="320" height="240" />
      <div>
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={captureAndLogin}>Login with Face</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display errors if any */}
    </div>
  );
}
