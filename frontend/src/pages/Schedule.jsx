import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import useStudentData, { useSchedules } from "../RetriveData";
import { useAuth } from "../context/authcontext";
import "./CSS/schedule.css";

const Schedule = () => {
  const {
    studentData,
    loading: studentLoading,
    error: studentError,
  } = useStudentData();
  const {
    schedules,
    loading: scheduleLoading,
    error: scheduleError,
  } = useSchedules(studentData?.group);
  const { accessToken } = useAuth();
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`http://localhost:8000/teachers/teachers/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setTeachers(data))
      .catch(() => {});
  }, [accessToken]);

  const getTeacherName = (teacherId) => {
    if (!teacherId) return "Unassigned";
    const t = teachers.find((t) => t.id === Number(teacherId));
    return t ? t.username : "Unassigned";
  };

  if (studentLoading || scheduleLoading) {
    return (
      <p style={{ marginLeft: "260px", padding: "40px" }}>
        Loading schedule...
      </p>
    );
  }

  if (studentError || scheduleError) {
    return (
      <p style={{ marginLeft: "260px", padding: "40px", color: "red" }}>
        {studentError || scheduleError}
      </p>
    );
  }

  return (
    <div className="schedule-page">
      <Sidebar />

      <div className="schedule-content">
        <div className="schedule-header">
          <div>
            <h1 className="schedule-title">My Schedule</h1>
            {studentData && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div className="group-badge">
                  <span className="group-indicator"></span>
                  <strong>Group:</strong>{" "}
                  {studentData.group?.name || studentData.group}
                </div>
                <div className="class-count">
                  {schedules.length}{" "}
                  {schedules.length === 1 ? "class" : "classes"} scheduled
                </div>
              </div>
            )}
          </div>
          <div className="header-actions">
            <button className="btn-primary">Export Schedule</button>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3 className="empty-title">No schedules available</h3>
            <p className="empty-description">
              Your schedule will appear here once classes are scheduled for your
              group.
            </p>
          </div>
        ) : (
          <div className="schedule-container">
            <div className="table-wrapper">
              <table className="schedule-table">
                <thead>
                  <tr className="table-header">
                    <th>Module ID</th>
                    <th>Class Type</th>
                    <th>Day / Time</th>
                    <th>Location</th>
                    <th>Teacher</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((sch, index) => (
                    <tr
                      key={sch.id}
                      className={`table-row ${index % 2 === 0 ? "even" : "odd"}`}
                    >
                      <td className="table-cell module-cell">
                        <div className="module-content">
                          {sch.module?.name || sch.module}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div
                          className={`class-type-badge ${
                            sch.class_type === "Lecture"
                              ? "badge-lecture"
                              : sch.class_type === "Lab"
                                ? "badge-lab"
                                : sch.class_type === "Tutorial"
                                  ? "badge-tutorial"
                                  : "badge-default"
                          }`}
                        >
                          {sch.class_type}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="day-text">{sch.day}</div>
                        <div className="time-text">
                          {sch.start_time} - {sch.end_time}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="location-content">
                          <span className="location-icon"></span>
                          <span>{sch.location}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="teacher-content">
                          <span>{getTeacherName(sch.teacher)}</span>
                        </div>
                      </td>
                      <td className="table-cell description-cell">
                        {sch.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <div className="footer-info">
                Showing {schedules.length} of {schedules.length} classes
              </div>
            </div>
          </div>
        )}

        {schedules.length > 0 && (
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-label">Classes this week</div>
              <div className="stat-value">
                {
                  schedules.filter((s) =>
                    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].includes(s.day),
                  ).length
                }
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Different locations</div>
              <div className="stat-value">
                {new Set(schedules.map((s) => s.location)).size}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active teachers</div>
              <div className="stat-value">
                {new Set(schedules.map((s) => s.teacher).filter(Boolean)).size}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
