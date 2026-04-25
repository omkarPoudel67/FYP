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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayClasses, setTodayClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [nextClass, setNextClass] = useState(null);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (studentData?.user?.first_name && studentData?.user?.last_name) {
      return `${studentData.user.first_name[0]}${studentData.user.last_name[0]}`;
    }
    return "U";
  };

  const formatDate = () => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    if (schedules && schedules.length > 0) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = days[new Date().getDay()];
      
      const todaysClasses = schedules.filter(schedule => schedule.day === today);
      
      const sortedClasses = todaysClasses.sort((a, b) => {
        return a.start_time.localeCompare(b.start_time);
      });
      
      setTodayClasses(sortedClasses);
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`;
      
      let foundCurrent = null;
      let foundNext = null;
      
      for (let i = 0; i < sortedClasses.length; i++) {
        const cls = sortedClasses[i];
        if (cls.start_time <= currentTimeString && cls.end_time >= currentTimeString) {
          foundCurrent = cls;
          foundNext = sortedClasses[i + 1] || null;
          break;
        } else if (cls.start_time > currentTimeString && !foundNext) {
          foundNext = cls;
          break;
        }
      }
      
      setCurrentClass(foundCurrent);
      setNextClass(foundNext || sortedClasses[0]);
    }
  }, [schedules]);

  const getTimeRemaining = (endTime) => {
    if (!endTime) return null;
    
    const now = new Date();
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const end = new Date();
    end.setHours(endHour, endMinute, 0);
    
    const diffMs = end - now;
    if (diffMs <= 0) return null;
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `${diffMins} min left`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m left`;
    }
  };

  // Calculate time until next class
  const getTimeUntil = (startTime) => {
    if (!startTime) return null;
    
    const now = new Date();
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(startHour, startMinute, 0);
    
    const diffMs = start - now;
    if (diffMs <= 0) return null;
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `Starts in ${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `Starts in ${hours}h ${mins}m`;
    }
  };

  // Format time (e.g., "09:00:00" to "9:00 AM")
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Get class type icon
  const getClassTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'lecture':
        return <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
          <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM18 9L12 12L6 9L12 6L18 9ZM6 15L12 18L18 15V17L12 20L6 17V15Z"/>
        </svg>;
      case 'tutorial':
        return <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
          <path d="M4 6H20V8H4V6ZM4 10H20V12H4V10ZM4 14H14V16H4V14ZM18 14H20V20H18V14ZM18 10H20V12H18V10Z"/>
        </svg>;
      case 'workshop':
        return <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
          <path d="M16 6L20 10L16 14M8 6L4 10L8 14M12 4L8 16"/>
        </svg>;
      default:
        return <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>;
    }
  };

  if (loading) return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="student-dashboard loading-state">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    </div>
  );
  
  if (error) return (
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
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="welcome-text">
              Welcome back, {studentData?.user?.first_name || 'Student'}!
            </h1>
          </div>
          <div className="header-right">
            {/* <div className="notification-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#666"/>
              </svg>
              <span className="notification-badge">
                {announcements?.length || 0}
              </span>
            </div> */}
            <div 
              className="user-avatar" 
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
            >
              <div className="avatar-initials">{getUserInitials()}</div>
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
            {announcements && announcements.length > 0 ? (
              announcements.slice(0, 2).map((announcement, index) => (
                <div className="event-item" key={announcement.id || index}>
                  <div className="event-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#14b8a6">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm1-15v4h4v2h-4v4h-2v-4H7v-2h4V7h2z"/>
                    </svg>
                  </div>
                  <div className="event-details">
                    <h4 className="event-title">{announcement.title || 'Announcement'}</h4>
                    <p className="event-description">{announcement.content || announcement.description || 'No description'}</p>
                    <p className="event-meta">
                      Posted by: {announcement.created_by || 'Teacher'} • 
                      {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="event-item">
                <div className="event-details">
                  <p className="event-description">No announcements available</p>
                </div>
              </div>
            )}
          </div>
          <button className="view-all-button" onClick={() => navigate("/announcements")}>
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
                <span className="card-subtitle">{formatDate()}</span>
              </div>
              
              {/* Current Class - Compact */}
              {currentClass ? (
                <div className="class-row current-class-row">
                  <div className="class-status-indicator current"></div>
                  <div className="class-info-compact">
                    <div className="class-header-compact">
                      <h4 className="class-name-small">
                        {currentClass.subject_name || currentClass.module_name || '---'}
                      </h4>
                      <span className="class-time-small">
                        {formatTime(currentClass.start_time)} - {formatTime(currentClass.end_time)}
                      </span>
                    </div>
                    <div className="class-details-compact-horizontal">
                      <span className="class-detail-compact">
                        {getClassTypeIcon(currentClass.class_type)}
                        Room: {currentClass.room_number || '---'}
                      </span>
                      <span className="class-detail-compact">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        {currentClass.teacher_name || '---'}
                      </span>
                      <span className="class-detail-compact">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        {getTimeRemaining(currentClass.end_time) || 'Ongoing---'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="class-row">
                  <div className="class-info-compact">
                    <p>No ongoing class</p>
                  </div>
                </div>
              )}

              {/* Next Class - Compact */}
              {nextClass && nextClass !== currentClass ? (
                <div className="class-row next-class-row">
                  <div className="class-status-indicator next"></div>
                  <div className="class-info-compact">
                    <div className="class-header-compact">
                      <h4 className="class-name-small">
                        {nextClass.subject_name || nextClass.module_name || 'Next Class---'}
                      </h4>
                      <span className="class-time-small">
                        {formatTime(nextClass.start_time)} - {formatTime(nextClass.end_time)}
                      </span>
                    </div>
                    <div className="class-details-compact-horizontal">
                      <span className="class-detail-compact">
                        {getClassTypeIcon(nextClass.class_type)}
                        Room: {nextClass.room_number || '---'}
                      </span>
                      <span className="class-detail-compact">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        {nextClass.teacher_name || '---'}
                      </span>
                      <span className="class-detail-compact">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#14b8a6">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        {getTimeUntil(nextClass.start_time) || 'Next class---'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="class-row">
                  <div className="class-info-compact">
                    <p>No more classes today</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Small Attendance and Resources (Equal Height) */}
          <div className="right-column">
            {/* Small Attendance Card */}
            <div className="dashboard-card small-attendance-card">
              <div className="attendance-header">
                <h3 className="card-title">Attendance</h3>
                <span className="attendance-percentage-badge">--%</span>
              </div>
              <div className="small-attendance-content">
                <div className="small-attendance-circle">
                  <svg width="70" height="70" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="8" fill="none"/>
                    <circle cx="60" cy="60" r="50" stroke="#14b8a6" strokeWidth="8" 
                      strokeLinecap="round" fill="none" strokeDasharray="314.159" 
                      strokeDashoffset="314.159" transform="rotate(-90 60 60)"/>
                  </svg>
                </div>
                <div className="small-attendance-stats">
                  <div className="small-stat-row">
                    <span className="small-stat-label">Total:</span>
                    <span className="small-stat-value">--</span>
                  </div>
                  <div className="small-stat-row">
                    <span className="small-stat-label">Present:</span>
                    <span className="small-stat-value present-value">--</span>
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
                {resources && resources.length > 0 ? (
                  resources.slice(0, 2).map((resource, index) => (
                    <div className="small-resource-item" key={resource.id || index}>
                      <div className="small-resource-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#14b8a6">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                      </div>
                      <div className="small-resource-details">
                        <h4 className="small-resource-name">{resource.title || resource.name || 'Resource'}</h4>
                        <p className="small-resource-meta">
                          {resource.uploaded_at ? new Date(resource.uploaded_at).toLocaleDateString() : 'Recently'}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}