import React, { useState, useRef } from "react";
import { useAttendanceHistory } from "../RetriveData";
import { useAuth } from "../context/authcontext";
import Sidebar from "./Sidebar";
import "./CSS/Attendance.css";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Camera,
  ClipboardList,
  History,
  BarChart2,
  BookOpen,
  AlertCircle,
  CheckCheck,
  X,
  ChevronRight,
} from "lucide-react";

const Attendance = () => {
  const { accessToken, api } = useAuth();
  const { attendance, loading, error } = useAttendanceHistory();
  const now = new Date();
  const sessionIdRef = useRef(null);

  const [message, setMessage]         = useState("");
  const [messageType, setMessageType] = useState("info");
  const [cameraOpen, setCameraOpen]   = useState(false);
  const [capturing, setCapturing]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab]     = useState("All");

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  if (loading)
    return (
      <div className="attendance-page">
        <Sidebar />
        <div className="attendance-content">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading attendance...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="attendance-page">
        <Sidebar />
        <div className="attendance-content">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );

  // ─── Chart Data ───────────────────────────────────────────────────────────
  const allRecords = [...attendance.past, ...attendance.today];
const percentageData = (() => {
  // group by date
  const byDate = allRecords.reduce((acc, record) => {
    if (!acc[record.date]) acc[record.date] = { date: record.date, total: 0, present: 0 };
    acc[record.date].total += 1;
    if (record.status === "present") acc[record.date].present += 1;
    return acc;
  }, {});

  // sort dates oldest → newest
  const sorted = Object.values(byDate).sort((a, b) => new Date(a.date) - new Date(b.date));

  // running cumulative totals
  let cumulativeTotal   = 0;
  let cumulativePresent = 0;

  return sorted.map((item) => {
    cumulativeTotal   += item.total;
    cumulativePresent += item.present;
    return {
      date: item.date,
      percentage: Number(((cumulativePresent / cumulativeTotal) * 100).toFixed(1)),
    };
  });
})();

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalClasses = attendance.past.length;
  const presentCount = attendance.past.filter((r) => r.status === "present").length;
  const overallPct   = totalClasses ? Math.round((presentCount / totalClasses) * 100) : 0;

  // ─── Subjects for History Modal ───────────────────────────────────────────
  const subjectNames    = ["All", ...new Set(attendance.past.map((r) => r.module_name))];
  const filteredHistory = activeTab === "All"
    ? attendance.past
    : attendance.past.filter((r) => r.module_name === activeTab);

  const tabPresent = filteredHistory.filter((r) => r.status === "present").length;
  const tabTotal   = filteredHistory.length;
  const tabPct     = tabTotal ? Math.round((tabPresent / tabTotal) * 100) : 0;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  // ─── Step 1: Check IP ─────────────────────────────────────────────────────
  const handleTakeAttendance = async (sessionId) => {
    showMessage("Verifying your network...", "info");
    try {
      const ipRes  = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();
      const res    = await api.post(
        "/attendance/check-ip/",
        { ip: ipData.ip },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data.status === "ok") {
        showMessage("IP verified. Opening camera...", "info");
        openCamera(sessionId);
      } else {
        showMessage(res.data.message || "IP verification failed.", "error");
      }
    } catch {
      showMessage("Failed to verify IP. Are you on the correct network?", "error");
    }
  };

  // ─── Step 2: Open Camera ──────────────────────────────────────────────────
  const openCamera = async (sessionId) => {
    sessionIdRef.current = sessionId;

    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 200);
    } catch {
      showMessage("Camera access denied. Please allow camera permissions.", "error");
      setCameraOpen(false);
    }
  };

  // ─── Step 3: Capture & Send ───────────────────────────────────────────────
  const captureAndSend = async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || video.videoWidth === 0) {
      showMessage("Camera not ready yet. Please wait a moment.", "error");
      return;
    }
    setCapturing(true);
    showMessage("Capturing image...", "info");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        showMessage("Failed to capture image. Please try again.", "error");
        setCapturing(false);
        return;
      }
      const formData = new FormData();
      formData.append("image", blob, "face.jpg");
      formData.append("session_id", sessionIdRef.current);
      try {
        const res = await api.post("/attendance/mark/", formData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.data.Success === true) {
          showMessage("Attendance marked successfully!", "success");
          stopCamera();
        } else {
          showMessage(res.data.message || "Could not mark attendance.", "error");
        }
      } catch (err) {
        showMessage(err.response?.data?.message || "Failed to send image. Please try again.", "error");
      } finally {
        setCapturing(false);
      }
    }, "image/jpeg");
  };

  return (
    <div className="attendance-page">
      <Sidebar />

      <div className="attendance-content">

        {/* ── Header ── */}
        <div className="attendance-header">
          <div className="header-left">
            <h1 className="attendance-title">Attendance</h1>
            <p className="attendance-subtitle">Track your class attendance and performance</p>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <div className="stat-icon"><CalendarDays size={18} /></div>
              <div className="stat-info">
                <h4>{totalClasses}</h4>
                <p>Total Classes</p>
              </div>
            </div>
            <div className="stat-badge">
              <div className="stat-icon"><TrendingUp size={18} /></div>
              <div className="stat-info">
                <h4>{overallPct}%</h4>
                <p>Overall Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Message Banner ── */}
        {message && (
          <div className={`attendance-banner ${messageType}`}>
            <span className="banner-icon">
              {messageType === "success" && <CheckCircle2 size={16} />}
              {messageType === "error"   && <XCircle size={16} />}
              {messageType === "info"    && <AlertCircle size={16} />}
            </span>
            {message}
          </div>
        )}

        {/* ── Chart ── */}
        <div className="attendance-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-title-icon"><BarChart2 size={16} /></span>
              Attendance Percentage Over Time
            </h2>
          </div>
          {percentageData.length === 0 ? (
            <p className="empty-text">No attendance records to show.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={percentageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8f7f5" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "#888" }} />
                <Tooltip
                  formatter={(v) => [`${v}%`, "Attendance"]}
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e8f7f5", fontSize: "13px" }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  dot={{ fill: "#14b8a6", r: 4 }}
                  activeDot={{ r: 6, fill: "#0d9488" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Today's Schedule ── */}
        <div className="attendance-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-title-icon"><CalendarDays size={16} /></span>
              Today's Schedule
            </h2>
          </div>

          {attendance.todays_schedule.length === 0 ? (
            <p className="empty-text">No classes scheduled for today.</p>
          ) : (
            <ul className="schedule-list">
              {attendance.todays_schedule.map((s) => {
                const record     = attendance.today.find((a) => a.module_name === s.module_name);
                const startParts = s.start_time.split(":").map(Number);
                const endParts   = s.end_time.split(":").map(Number);
                const startTime  = new Date(); startTime.setHours(startParts[0], startParts[1], 0, 0);
                const endTime    = new Date(); endTime.setHours(endParts[0], endParts[1], 0, 0);
                const showButton = !record && now >= startTime && now <= endTime;

                let displayStatus;
                if (now < startTime) {
                  displayStatus = (
                    <span className="status-badge soon">
                      <Clock size={12} />
                      Starting Soon · {s.start_time} – {s.end_time}
                    </span>
                  );
                } else if (showButton) {
                  displayStatus = (
                    <button className="btn-attendance" onClick={() => handleTakeAttendance(s.id)}>
                      <Camera size={14} />
                      Take Attendance
                    </button>
                  );
                } else {
                  const status = record ? record.status : "absent";
                  displayStatus = (
                    <span className={`status-badge ${status}`}>
                      {status === "present" ? <CheckCheck size={12} /> : <X size={12} />}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  );
                }

                return (
                  <li key={s.id} className="schedule-item">
                    <div className="schedule-item-left">
                      <span className="module-name">{s.module_name}</span>
                      <span className="module-location">
                        <MapPin size={12} /> {s.location}
                      </span>
                    </div>
                    <div>{displayStatus}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Camera Section ── */}
        {cameraOpen && (
          <div className="attendance-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-title-icon"><Camera size={16} /></span>
                Face Verification
              </h2>
            </div>
            <div className="camera-box">
              <video ref={videoRef} autoPlay playsInline className="camera-video" />
            </div>
            <div className="camera-actions">
              <button className="btn-attendance" onClick={captureAndSend} disabled={capturing}>
                <Camera size={14} />
                {capturing ? "Submitting..." : "Capture & Submit"}
              </button>
              <button className="btn-secondary" onClick={stopCamera} disabled={capturing}>
                Cancel
              </button>
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        )}

        {/* ── Past Attendance (last 10) ── */}
        <div className="attendance-section">
          <div className="past-attendance-header">
            <h2 className="section-title">
              <span className="section-title-icon"><ClipboardList size={16} /></span>
              Past Attendance
            </h2>
            <button className="view-all-btn" onClick={() => setShowHistory(true)}>
              <History size={14} />
              View All History
              <ChevronRight size={14} />
            </button>
          </div>

          {attendance.past.length === 0 ? (
            <p className="empty-text">No past records found.</p>
          ) : (
            <ul className="schedule-list">
              {attendance.past.slice(0, 10).map((p, i) => (
                <li key={i} className="past-item">
                  <div className="past-item-left">
                    <span className="module-name">{p.module_name}</span>
                    <span className="module-location">
                      <MapPin size={12} /> {p.location}
                    </span>
                  </div>
                  <div className="past-item-right">
                    <span className="date-text">{p.date}</span>
                    <span className={`status-badge ${p.status}`}>
                      {p.status === "present" ? <CheckCheck size={12} /> : <X size={12} />}
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {attendance.past.length > 10 && (
            <p className="show-more-hint">
              Showing 10 of {attendance.past.length} records.{" "}
              <button className="inline-link" onClick={() => setShowHistory(true)}>
                View all
              </button>
            </p>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════
          History Modal
      ══════════════════════════════════════════ */}
      {showHistory && (
        <div
          className="history-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowHistory(false)}
        >
          <div className="history-modal">

            <div className="history-modal-header">
              <h2 className="history-modal-title">
                <BookOpen size={20} />
                Full Attendance History
              </h2>
              <button className="history-modal-close" onClick={() => setShowHistory(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="subject-tabs">
              {subjectNames.map((name) => (
                <button
                  key={name}
                  className={`subject-tab ${activeTab === name ? "active" : ""}`}
                  onClick={() => setActiveTab(name)}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="subject-summary">
              <div className="summary-stat">
                Total: <span>{tabTotal}</span>
              </div>
              <div className="summary-stat present-stat">
                <CheckCircle2 size={14} /> Present: <span>{tabPresent}</span>
              </div>
              <div className="summary-stat absent-stat">
                <XCircle size={14} /> Absent: <span>{tabTotal - tabPresent}</span>
              </div>
              <div className="summary-percentage">{tabPct}%</div>
            </div>

            <div className="history-records">
              {filteredHistory.length === 0 ? (
                <p className="empty-text">No records for this subject.</p>
              ) : (
                filteredHistory.map((p, i) => (
                  <div
                    key={i}
                    className={`history-record-item ${p.status === "present" ? "present-row" : "absent-row"}`}
                  >
                    <div>
                      <div className="history-record-module">{p.module_name}</div>
                      <div className="history-record-location">
                        <MapPin size={11} /> {p.location}
                      </div>
                    </div>
                    <div className="history-record-right">
                      <span className="date-text">{p.date}</span>
                      <span className={`status-badge ${p.status}`}>
                        {p.status === "present" ? <CheckCheck size={12} /> : <X size={12} />}
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
