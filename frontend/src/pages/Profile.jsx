import React, { useState, useRef } from "react";
import { useAuth } from "../context/authcontext";
import useStudentData from "../RetriveData";
import Sidebar from "./Sidebar";
import "./CSS/profile.css";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Users,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

const Profile = () => {
  const { accessToken, api } = useAuth();
  const { studentData: s, loading, error } = useStudentData();
  const videoRef = useRef(null);

  const [facialDataStatus, setFacialDataStatus] = useState(false);
  const [facialError, setFacialError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  // ── Facial logic untouched ────────────────────────────────────
  const startCamera = async () => {
    setFacialError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      await videoRef.current.play();
      setCameraActive(true);
    } catch (err) {
      setFacialError("Camera error: " + err.message);
    }
  };

  const captureAndEnroll = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg"),
    );
    const formData = new FormData();
    formData.append("image", blob, "face.jpg");
    try {
      const res = await api.post(
        "/api/facial-recognition/face-register/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        },
      );
      const data = res.data;
      if (data.success) {
        setFacialDataStatus(true);
        alert("Face enrolled successfully!");
      } else {
        setFacialError(data.message || "Enrollment failed");
      }
    } catch (err) {
      setFacialError("Upload error: " + err.message);
    }
  };
  // ─────────────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="pf-page">
        <Sidebar />
        <div className="pf-content">
          <div className="pf-loading">
            <div className="pf-spinner" />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="pf-page">
        <Sidebar />
        <div className="pf-content">
          <p className="pf-error">{error}</p>
        </div>
      </div>
    );

  const initials =
    `${s?.user?.first_name?.[0] || ""}${s?.user?.last_name?.[0] || ""}`.toUpperCase() ||
    "S";
  const enrolled = s?.has_facial_data || facialDataStatus;

  const infoItems = [
    { icon: <Mail size={15} />, label: "Email", value: s?.user?.email || "--" },
    {
      icon: <Phone size={15} />,
      label: "Phone",
      value: s?.user?.phone_number || "--",
    },
    {
      icon: <Users size={15} />,
      label: "Group",
      value: s?.group?.name || "--",
    },
    {
      icon: <BookOpen size={15} />,
      label: "Semester",
      value: `Semester ${s?.semester}`,
    },
    { icon: <Calendar size={15} />, label: "Year", value: `Year ${s?.year}` },
  ];

  return (
    <div className="pf-page">
      <Sidebar />
      <div className="pf-content">
        {/* ── Hero ── */}
        <div className="pf-hero">
          <div className="pf-hero-bg" />
          <div className="pf-hero-inner">
            <div className="pf-avatar">{initials}</div>
            <div className="pf-hero-text">
              <h1 className="pf-hero-name">
                {s?.user?.first_name} {s?.user?.last_name}
              </h1>
              <div className="pf-hero-meta">
                <code className="pf-username">@{s?.user?.username}</code>
                <span className="pf-role-badge">{s?.role}</span>
                <span
                  className={`pf-face-badge ${enrolled ? "pf-face-badge--on" : "pf-face-badge--off"}`}
                >
                  {enrolled ? (
                    <ShieldCheck size={12} />
                  ) : (
                    <ShieldOff size={12} />
                  )}
                  {enrolled ? "Face Enrolled" : "Face Not Enrolled"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Info cards ── */}
        <div className="pf-section">
          <h2 className="pf-section-title">
            <User size={15} />
            Account Details
          </h2>
          <div className="pf-info-grid">
            {infoItems.map((item, i) => (
              <div key={i} className="pf-info-card">
                <div className="pf-info-icon">{item.icon}</div>
                <div>
                  <div className="pf-info-label">{item.label}</div>
                  <div className="pf-info-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Facial Recognition ── */}
        <div className="pf-section">
          <h2 className="pf-section-title">
            <Camera size={15} />
            Facial Recognition
          </h2>

          {enrolled ? (
            <div className="pf-enrolled-banner">
              <CheckCircle2 size={20} />
              <div>
                <div className="pf-enrolled-title">Face Already Enrolled</div>
                <div className="pf-enrolled-sub">
                  Your face is registered for attendance and login verification.
                </div>
              </div>
            </div>
          ) : (
            <div className="pf-facial-wrap">
              <p className="pf-facial-hint">
                Enroll your face to enable facial recognition attendance and
                login.
              </p>

              {facialError && (
                <div className="pf-facial-error">{facialError}</div>
              )}

              <div className="pf-camera-box">
                <video
                  ref={videoRef}
                  width="400"
                  height="300"
                  autoPlay
                  playsInline
                  className={`pf-camera-video ${cameraActive ? "pf-camera-video--active" : ""}`}
                />
                {!cameraActive && (
                  <div className="pf-camera-placeholder">
                    <Camera size={32} />
                    <span>Camera inactive</span>
                  </div>
                )}
              </div>

              <div className="pf-camera-actions">
                <button
                  className="pf-btn pf-btn--secondary"
                  onClick={startCamera}
                >
                  <Camera size={14} />
                  Start Camera
                </button>
                <button
                  className="pf-btn pf-btn--primary"
                  onClick={captureAndEnroll}
                >
                  <CheckCircle2 size={14} />
                  Capture &amp; Enroll
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
