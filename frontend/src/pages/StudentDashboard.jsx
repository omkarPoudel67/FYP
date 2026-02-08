import React, { useEffect, useState } from "react";
import "./CSS/StudentDashboard.css";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import axios from "axios";
import useStudentData from "../RetriveData";
import { useModules } from "../RetriveData";
import { useWeeks } from "../RetriveData";
import { useResources } from "../RetriveData";
import { useSchedules } from "../RetriveData";
import { useAnnouncements } from "../RetriveData";



export default function StudentDashboard() {
  
  const { studentData, loading, error } = useStudentData();
  const { modules, loading: modulesLoading, error: modulesError } = useModules(studentData?.group);
  const { weeks, loading: weeksLoading, error: weeksError } = useWeeks(modules?.modules?.[0]);
  const { resources, loading: resourcesLoading, error: resourcesError } = useResources(modules?.modules?.[0], weeks?.[0]);
  const { schedules, scheduleLoading, scheduleError } = useSchedules(studentData?.group);
  const { announcements, AnnounceLoading, AnnounceError } = useAnnouncements();

  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Unauthorized</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="student-dashboard">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="welcome-text">Welcome back, Omkar!</h1>
          </div>
          <div className="header-right">
            <div className="notification-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#666"/>
              </svg>
              <span className="notification-badge">3</span>
            </div>
            <div 
  className="user-avatar" 
  onClick={() => navigate("/profile")}
  style={{ cursor: "pointer" }} // shows pointer on hover
>
  <div className="avatar-initials">OP</div>
</div>

          </div>
        </div>

        {/* Events & Announcements Card (Full Width) */}
        <div className="dashboard-card events-card">
          <div className="card-header">
            <h3 className="card-title">Events & Announcements</h3>
            <span className="card-subtitle">Latest updates from teachers</span>
          </div>
          <div className="events-content">
            <div className="event-item">
              <div className="event-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#14b8a6">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm1-15v4h4v2h-4v4h-2v-4H7v-2h4V7h2z"/>
                </svg>
              </div>
              <div className="event-details">
                <h4 className="event-title">Project Submission Deadline Extended</h4>
                <p className="event-description">The deadline for Project Guidelines submission has been extended to September 30th.</p>
                <p className="event-meta">Posted by: Sujan Uprety • 2 hours ago</p>
              </div>
            </div>
            <div className="event-item">
              <div className="event-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#14b8a6">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div className="event-details">
                <h4 className="event-title">Web Development Workshop</h4>
                <p className="event-description">Join us for a hands-on workshop on React.js and Django integration this Friday.</p>
                <p className="event-meta">Posted by: Sarayu Gautam • 1 day ago</p>
              </div>
            </div>
          </div>
          <button className="view-all-button">
            View All Announcements →
          </button>
        </div>

        {/* Main Content Section */}
        <div className="main-content-section">
          {/* Left Column - Next Class Card */}
          <div className="left-column">
            <div className="dashboard-card next-class-card">
              <div className="card-header">
                <h3 className="card-title">Today's Classes</h3>
                <span className="card-subtitle">September 5, 2025</span>
              </div>
              
              {/* Current Class - Compact */}
              <div className="class-row current-class-row">
                <div className="class-status-indicator current"></div>
                <div className="class-info-compact">
                  <div className="class-header-compact">
                    <h4 className="class-name-small">Database Management</h4>
                    <span className="class-time-small">9:00 AM - 10:30 AM</span>
                  </div>
                  <div className="class-details-compact-horizontal">
                    <span className="class-detail-compact">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      L6-205
                    </span>
                    <span className="class-detail-compact">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Prof. Sharma
                    </span>
                    <span className="class-detail-compact">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                      45 min left
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Class - Compact */}
              <div className="class-row next-class-row">
                <div className="class-status-indicator next"></div>
                <div className="class-info-compact">
                  <div className="class-header-compact">
                    <h4 className="class-name-small">Web Development</h4>
                    <span className="class-time-small">10:45 AM - 12:15 PM</span>
                  </div>
                  <div className="class-details-compact-horizontal">
                    <span className="class-detail-compact">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      L6-204
                    </span>
                    <span className="class-detail-compact">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                       Uprety
                    </span>
                    <span className="class-detail-compact">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      Starts in 15 min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Small Attendance and Resources (Equal Height) */}
          <div className="right-column">
            {/* Small Attendance Card */}
            <div className="dashboard-card small-attendance-card">
              <div className="attendance-header">
                <h3 className="card-title">Attendance</h3>
                <span className="attendance-percentage-badge">90%</span>
              </div>
              <div className="small-attendance-content">
                <div className="small-attendance-circle">
                  <svg width="70" height="70" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="8" fill="none"/>
                    <circle cx="60" cy="60" r="50" stroke="#14b8a6" strokeWidth="8" 
                      strokeLinecap="round" fill="none" strokeDasharray="314.159" 
                      strokeDashoffset="31.4159" transform="rotate(-90 60 60)"/>
                  </svg>
                </div>
                <div className="small-attendance-stats">
                  <div className="small-stat-row">
                    <span className="small-stat-label">Total:</span>
                    <span className="small-stat-value">50</span>
                  </div>
                  <div className="small-stat-row">
                    <span className="small-stat-label">Present:</span>
                    <span className="small-stat-value present-value">45</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Resources Card */}
            <div className="dashboard-card small-resources-card">
              <div className="card-header">
                <h3 className="card-title">Resources</h3>
              </div>
              <div className="small-resources-list">
                <div className="small-resource-item">
                  <div className="small-resource-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#14b8a6">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                  </div>
                  <div className="small-resource-details">
                    <h4 className="small-resource-name">Guidelines.pdf</h4>
                    <p className="small-resource-meta">2 hours ago</p>
                  </div>
                </div>
                
                <div className="small-resource-item">
                  <div className="small-resource-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#14b8a6">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                  </div>
                  <div className="small-resource-details">
                    <h4 className="small-resource-name">Lecture 6.pptx</h4>
                    <p className="small-resource-meta">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}