import React from "react";

const Unauthorized401 = () => {
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      textAlign: "center",
      background: "#fff",
      padding: "50px 40px",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    },
    code: {
      fontSize: "100px",
      margin: 0,
      color: "#e74c3c",
    },
    title: {
      fontSize: "28px",
      margin: "10px 0",
      color: "#333",
    },
    message: {
      fontSize: "16px",
      color: "#666",
      marginBottom: "20px",
    },
    button: {
      display: "inline-block",
      padding: "12px 25px",
      backgroundColor: "#e74c3c",
      color: "white",
      borderRadius: "6px",
      textDecoration: "none",
      fontWeight: "bold",
      transition: "background 0.3s ease",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.code}>401</h1>
        <h2 style={styles.title}>Unauthorized</h2>
        <p style={styles.message}>You do not have permission to access this page.</p>
        <a
          href="/"
          style={{ ...styles.button }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#c0392b")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#e74c3c")}
        >
          Go to Login Page
        </a>
      </div>
    </div>
  );
};

export default Unauthorized401;
