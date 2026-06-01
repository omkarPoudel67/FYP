import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CSS/Sidebar.css";
import { useAuth } from "../context/authcontext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import useStudentData from "../RetriveData.jsx";
import ChatBot from "./ChatBot";

const Sidebar = () => {
  const { studentData, error, loading } = useStudentData();
  console.log("Sidebar student data:", studentData);
  const { setAccessToken } = useAuth();
  const BASE_URL = "http://localhost:8000/api";
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (studentData) {
      console.log("Sidebar received student data:", studentData);
    }
  }, [studentData]);

  useEffect(() => {
    if (error) {
      console.error("Error in sidebar:", error);
    }
  }, [error]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      id: "resources",
      label: "Resources",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ];

  const bottomItems = [
    // {
    //   id: "settings",
    //   label: "Settings",
    //   icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    // },
    {
      id: "logout",
      label: "Logout",
      icon: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    },
  ];

  const activeItem = location.pathname.split("/")[1] || "dashboard";

  const handleItemClick = async (id) => {
    if (id === "logout") {
      try {
        await axios.post(`${BASE_URL}/logout/`, {}, { withCredentials: true });
        setAccessToken(null);
        navigate("/logout");
      } catch (error) {
        console.error("Logout error:", error);
      }
      return;
    }

    switch (id) {
      case "resources":
        navigate("/resources");
        break;
      case "schedule":
        navigate("/schedule");
        break;
      case "announcements":
        navigate("/announcements");
        break;
      case "attendance":
        navigate("/attendance");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "dashboard":
        navigate("/");
        break;
      default:
        console.warn("No route defined for:", id);
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (studentData?.user?.first_name && studentData?.user?.last_name) {
      return `${studentData.user.first_name[0]}${studentData.user.last_name[0]}`;
    }
    return "U";
  };

  // Show loading state
  if (loading) {
    return (
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">
            <span className="logo-text">A</span>
          </div>
          <h2 className="logo-title">Academiaz</h2>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-initials">...</span>
            </div>
          </div>
          <div className="profile-info">
            <h4 className="profile-name">Loading...</h4>
            <p className="profile-role">Loading...</p>
            <p className="profile-id">ID: Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">
            <span className="logo-text">A</span>
          </div>
          <h2 className="logo-title">Academiaz</h2>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-initials">!</span>
            </div>
          </div>
          <div className="profile-info">
            <h4 className="profile-name">Error loading profile</h4>
            <p className="profile-role">Please try again</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div className="logo-circle">
          <span className="logo-text">A</span>
        </div>
        <h2 className="logo-title">Academiaz</h2>
      </div>

      {/* Profile Section - Using sidebar-profile class */}
      <div className="sidebar-profile">
        <div className="profile-avatar">
          <div className="avatar-circle">
            <span className="avatar-initials">{getInitials()}</span>
          </div>
        </div>
        <div className="profile-info">
          {studentData ? (
            <>
              <ChatBot />
              <h4 className="profile-name">
                {studentData.user?.first_name || ""}{" "}
                {studentData.user?.last_name || ""}
              </h4>
              <p className="profile-role">{studentData.role || "Student"}</p>
              <p className="profile-id">ID: {studentData.user?.id || "N/A"}</p>
            </>
          ) : (
            <h4 className="profile-name">No data available</h4>
          )}
        </div>
      </div>

      {/* Main Menu Section */}
      <div className="sidebar-menu">
        <h3 className="menu-title">MAIN MENU</h3>
        <ul className="menu-items">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`menu-item ${activeItem === item.id ? "active" : ""}`}
              onClick={() => handleItemClick(item.id)}
            >
              <div className="menu-icon">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={item.icon}
                  />
                </svg>
              </div>
              <span className="menu-label">{item.label}</span>
              {activeItem === item.id && (
                <div className="active-indicator"></div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Menu Section */}
      <div className="sidebar-bottom">
        <ul className="bottom-items">
          {bottomItems.map((item) => (
            <li
              key={item.id}
              className={`bottom-item ${activeItem === item.id ? "active" : ""}`}
              onClick={() => handleItemClick(item.id)}
            >
              <div className="bottom-icon">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={item.icon}
                  />
                </svg>
              </div>
              <span className="bottom-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
