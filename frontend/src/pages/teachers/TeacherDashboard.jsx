import React from "react";
import Sidebar from "./components/Sidebar";

export default function TeacherDashboard() {
  return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">
        <div style={{
          padding: "2rem",
          color: "#2dd4bf",
          fontFamily: "sans-serif"
        }}>
          <h1 style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            color: "#2dd4bf"
          }}>
            Teacher Dashboard
          </h1>
          <p style={{ color: "#99c4c0" }}>
            Welcome back. You're logged in as a Teacher / Admin.
          </p>

          <div style={{
            display: "flex",
            gap: "1.5rem",
            marginTop: "2rem",
            flexWrap: "wrap"
          }}>
            {[
              { label: "Students", value: "—" },
              { label: "Teachers", value: "—" },
              { label: "Announcements", value: "—" },
              { label: "Resources", value: "—" },
            ].map((card) => (
              <div key={card.label} style={{
                background: "#0d1f1e",
                border: "1px solid #0d9488",
                borderRadius: "12px",
                padding: "1.5rem 2rem",
                minWidth: "150px",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#2dd4bf"
                }}>
                  {card.value}
                </div>
                <div style={{
                  marginTop: "0.4rem",
                  color: "#99c4c0",
                  fontSize: "0.9rem"
                }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}