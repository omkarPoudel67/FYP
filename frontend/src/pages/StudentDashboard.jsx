import React, { useEffect, useState } from "react";
import "./CSS/StudentDashboard.css";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import useStudentData from "../RetriveData";
import {
  useModules,
  useWeeks,
  useResources,
  useSchedules,
  useAnnouncements,
  useAttendanceHistory,
} from "../RetriveData";

export default function StudentDashboard() {
  const { studentData, loading, error } = useStudentData();
  console.log("Student Data:", studentData);
  const { modules } = useModules(studentData?.group?.id);
  const { weeks } = useWeeks(modules?.modules?.[0]);
  const { resources } = useResources(modules?.modules?.[0], weeks?.[0]);
  const { schedules } = useSchedules(studentData?.group);
  const { announcements } = useAnnouncements();
  const { attendance } = useAttendanceHistory();

  const navigate = useNavigate();
  const [todayClasses, setTodayClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [nextClass, setNextClass] = useState(null);

  // ── Attendance Stats ────────────────────────────────────────────
  const totalClasses = attendance?.past?.length || 0;
  const presentClasses =
    attendance?.past?.filter(
      (a) => a.status === "present" || a.status === "late",
    ).length || 0;
  const percentage =
    totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  const circumference = 314.159;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // ── Helpers ─────────────────────────────────────────────────────
  const getUserInitials = () => {
    if (studentData?.user?.first_name && studentData?.user?.last_name) {
      return `${studentData.user.first_name[0]}${studentData.user.last_name[0]}`;
    }
    return "U";
  };

  const formatDate = () => {
    const options = { month: "long", day: "numeric", year: "numeric" };
    return new Date().toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getTimeRemaining = (endTime) => {
    if (!endTime) return null;
    const now = new Date();
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const end = new Date();
    end.setHours(endHour, endMinute, 0);
    const diffMs = end - now;
    if (diffMs <= 0) return null;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min left`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m left`;
  };

  const getTimeUntil = (startTime) => {
    if (!startTime) return null;
    const now = new Date();
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const start = new Date();
    start.setHours(startHour, startMinute, 0);
    const diffMs = start - now;
    if (diffMs <= 0) return null;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `Starts in ${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `Starts in ${hours}h ${mins}m`;
  };

  const getClassTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "lecture":
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
            <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM18 9L12 12L6 9L12 6L18 9ZM6 15L12 18L18 15V17L12 20L6 17V15Z" />
          </svg>
        );
      case "tutorial":
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
            <path d="M4 6H20V8H4V6ZM4 10H20V12H4V10ZM4 14H14V16H4V14ZM18 14H20V20H18V14ZM18 10H20V12H18V10Z" />
          </svg>
        );
      case "workshop":
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
            <path d="M16 6L20 10L16 14M8 6L4 10L8 14M12 4L8 16" />
          </svg>
        );
      default:
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
        );
    }
  };

  // ── Today's Classes Logic ───────────────────────────────────────
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    if (schedules && schedules.length > 0) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const todayIndex = new Date().getDay();
      const today = days[todayIndex];

      // Today's classes
      const todaysClasses = schedules
        .filter((s) => s.day === today)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      setTodayClasses(todaysClasses);

      // Upcoming = next 6 days in order
      const upcoming = [];
      for (let i = 1; i <= 6; i++) {
        const nextDayIndex = (todayIndex + i) % 7;
        const nextDay = days[nextDayIndex];
        const dayClasses = schedules
          .filter((s) => s.day === nextDay)
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .map((c) => ({ ...c, dayLabel: nextDay }));
        upcoming.push(...dayClasses);
      }
      setUpcomingClasses(upcoming);

      // current/next logic stays same
      const now = new Date();
      const currentTimeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:00`;
      let foundCurrent = null;
      let foundNext = null;
      for (let i = 0; i < todaysClasses.length; i++) {
        const cls = todaysClasses[i];
        if (
          cls.start_time <= currentTimeString &&
          cls.end_time >= currentTimeString
        ) {
          foundCurrent = cls;
          foundNext = todaysClasses[i + 1] || null;
          break;
        } else if (cls.start_time > currentTimeString && !foundNext) {
          foundNext = cls;
          break;
        }
      }
      setCurrentClass(foundCurrent);
      setNextClass(foundNext || todaysClasses[0] || null);
    }
  }, [schedules]);

  // ── Loading / Error States ──────────────────────────────────────
  if (loading)
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="student-dashboard loading-state">
          <div className="loading-spinner">Loading dashboard...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="student-dashboard error-state">
          <div className="error-message">Unauthorized access</div>
        </div>
      </div>
    );

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="student-dashboard">
        {/* ── Header ── */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="welcome-text">
              Welcome back, {studentData?.user?.first_name || "Student"}!
            </h1>
          </div>
          <div className="header-right">
            <div
              className="user-avatar"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
            >
              <div className="avatar-initials">{getUserInitials()}</div>
            </div>
          </div>
        </div>

        {/* ── Announcements Card (Full Width) ── */}
        <div className="dashboard-card events-card">
          <div className="card-header">
            <h3 className="card-title">Events & Announcements</h3>
            <span className="card-subtitle">Latest updates from teachers</span>
          </div>
          <div className="events-content">
            {announcements && announcements.length > 0 ? (
              announcements.slice(0, 2).map((announcement, index) => (
                <div className="event-item" key={announcement.id || index}>
                  <div className="event-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="#14b8a6"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm1-15v4h4v2h-4v4h-2v-4H7v-2h4V7h2z" />
                    </svg>
                  </div>
                  <div className="event-details">
                    <h4 className="event-title">
                      {announcement.title || "Announcement"}
                    </h4>
                    <p className="event-description">
                      {announcement.content ||
                        announcement.description ||
                        "No description"}
                    </p>
                    <p className="event-meta">
                      Posted by: {announcement.created_by || "Teacher"} •{" "}
                      {announcement.created_at
                        ? new Date(announcement.created_at).toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="event-item">
                <div className="event-details">
                  <p className="event-description">
                    No announcements available
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            className="view-all-button"
            onClick={() => navigate("/announcements")}
          >
            View All Announcements →
          </button>
        </div>

        {/* ── Main Content ── */}
        <div className="main-content-section">
          {/* Left Column - Today's Classes */}
          <div className="left-column">
            <div className="dashboard-card next-class-card">
              {/* ── Section 1: Today ── */}
              <div className="classes-section-header">
                <h3 className="card-title">Today's Classes</h3>
                <span className="card-subtitle">{formatDate()}</span>
              </div>

              {todayClasses.length > 0 ? (
                <>
                  {todayClasses.map((cls, index) => {
                    const now = new Date();
                    const t = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:00`;
                    const isRunning = cls.start_time <= t && cls.end_time >= t;
                    const isFinished = cls.end_time < t;
                    const rowClass = isRunning
                      ? "current-class-row"
                      : isFinished
                        ? "finished-class-row"
                        : "next-class-row";
                    const indicatorClass = isRunning
                      ? "current"
                      : isFinished
                        ? "finished"
                        : "next";
                    const statusLabel = isRunning
                      ? "Live"
                      : isFinished
                        ? "Finished"
                        : getTimeUntil(cls.start_time) || "Upcoming";

                    return (
                      <div
                        className={`class-row ${rowClass}`}
                        key={cls.id || index}
                      >
                        <div
                          className={`class-status-indicator ${indicatorClass}`}
                        ></div>
                        <div className="class-info-compact">
                          <div className="class-header-compact">
                            <h4 className="class-name-small">
                              {cls.module_name ||
                                `Module ${cls.module}` ||
                                "---"}
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                alignItems: "center",
                              }}
                            >
                              <span className="class-time-small">
                                {formatTime(cls.start_time)} -{" "}
                                {formatTime(cls.end_time)}
                              </span>
                              <span
                                className={`class-status-badge ${indicatorClass}`}
                              >
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                          <div className="class-details-compact-horizontal">
                            <span className="class-detail-compact">
                              {getClassTypeIcon(cls.class_type)}
                              {cls.class_type || "---"}
                            </span>
                            <span className="class-detail-compact">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="#14b8a6"
                              >
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                              </svg>
                              {cls.location || "---"}
                            </span>
                            <span className="class-detail-compact">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="#14b8a6"
                              >
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                              {cls.teacher_name || "---"}
                            </span>
                            {isRunning && (
                              <span
                                className="class-detail-compact"
                                style={{
                                  color: "#14b8a6",
                                  borderColor: "#99f6e4",
                                }}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="#14b8a6"
                                >
                                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                </svg>
                                {getTimeRemaining(cls.end_time)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="no-classes-today">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="#d1d5db"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No classes scheduled today</p>
                </div>
              )}

              {/* ── Divider ── */}
              <div className="classes-section-divider"></div>

              {/* ── Section 2: Upcoming ── */}
              <div className="classes-section-header">
                <h3 className="card-title">Upcoming Classes</h3>
                <span className="card-subtitle">Next scheduled sessions</span>
              </div>

              {upcomingClasses.length > 0 ? (
                upcomingClasses.slice(0, 3).map((cls, index) => (
                  <div
                    className="class-row next-class-row"
                    key={cls.id || index}
                  >
                    <div className="class-status-indicator next"></div>
                    <div className="class-info-compact">
                      <div className="class-header-compact">
                        <h4 className="class-name-small">
                          {cls.module_name || `Module ${cls.module}` || "---"}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span className="class-time-small">
                            {formatTime(cls.start_time)} -{" "}
                            {formatTime(cls.end_time)}
                          </span>
                          <span className="class-status-badge next">
                            {cls.dayLabel}
                          </span>
                        </div>
                      </div>
                      <div className="class-details-compact-horizontal">
                        <span className="class-detail-compact">
                          {getClassTypeIcon(cls.class_type)}
                          {cls.class_type || "---"}
                        </span>
                        <span className="class-detail-compact">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="#14b8a6"
                          >
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          </svg>
                          {cls.location || "---"}
                        </span>
                        <span className="class-detail-compact">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="#14b8a6"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                          {cls.teacher_name || "---"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-classes-today">
                  <p>No upcoming classes this week</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Attendance + Resources */}
          <div className="right-column">
            {/* Attendance Card */}
            <div className="dashboard-card small-attendance-card">
              <div className="attendance-header">
                <h3 className="card-title">Attendance</h3>
                <span className="attendance-percentage-badge">
                  {percentage}%
                </span>
              </div>
              <div className="small-attendance-content">
                <div className="small-attendance-circle">
                  <svg width="130" height="130" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke={
                        percentage >= 75
                          ? "#14b8a6"
                          : percentage >= 60
                            ? "#f59e0b"
                            : "#ef4444"
                      }
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 60 60)"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <div className="circle-percentage-text">{percentage}%</div>
                </div>
                <div className="small-attendance-stats">
                  <div className="small-stat-row">
                    <span className="small-stat-label">Total:</span>
                    <span className="small-stat-value">{totalClasses}</span>
                  </div>
                  <div className="small-stat-row">
                    <span className="small-stat-label">Present:</span>
                    <span className="small-stat-value present-value">
                      {presentClasses}
                    </span>
                  </div>
                  <div className="small-stat-row">
                    <span className="small-stat-label">Absent:</span>
                    <span
                      className="small-stat-value"
                      style={{ color: "#ef4444" }}
                    >
                      {totalClasses - presentClasses}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="view-all-button"
                onClick={() => navigate("/attendance")}
                style={{ marginTop: "0.5rem" }}
              >
                View History →
              </button>
            </div>

            {/* Resources Card */}
            {/* <div className="dashboard-card small-resources-card">
              <div className="card-header">
                <h3 className="card-title">Resources</h3>
              </div>
              <div className="small-resources-list">
                {resources && resources.length > 0 ? (
                  resources.slice(0, 2).map((resource, index) => (
                    <div className="small-resource-item" key={resource.id || index}>
                      <div className="small-resource-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#14b8a6">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                      </div>
                      <div className="small-resource-details">
                        <h4 className="small-resource-name">
                          {resource.title || resource.name || "Resource"}
                        </h4>
                        <p className="small-resource-meta">
                          {resource.uploaded_at
                            ? new Date(resource.uploaded_at).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="small-resource-item">
                    <div className="small-resource-details">
                      <p className="small-resource-name">No resources available</p>
                    </div>
                  </div>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
