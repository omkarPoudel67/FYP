// PublicDashboard.jsx
import React, { useEffect, useRef } from "react";
import "./CSS/PublicDashboard.css";

export default function PublicDashboard() {
  // Smooth scroll helper for anchor links
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="public-dashboard">
      {/* ====================== TOP NAVIGATION BAR ====================== */}
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo Left */}
          <div className="logo-area">
            <span className="logo-text">Academiaz</span>
            <span className="logo-dot"></span>
          </div>

          {/* Desktop Center Nav */}
          <div className="nav-links">
            <button onClick={() => scrollToSection("home")} className="nav-link">Home</button>
            <button onClick={() => scrollToSection("about")} className="nav-link">About</button>
            <button onClick={() => scrollToSection("features")} className="nav-link">Features</button>
            <button onClick={() => scrollToSection("herald")} className="nav-link">Herald College</button>
            <button onClick={() => scrollToSection("contact")} className="nav-link">Contact</button>
          </div>

          {/* Right: Login Button (Static alert) */}
          <div className="nav-action">
            <button className="login-btn-static" onClick={() => alert("🔐 Login page will be integrated in the full version.")}>
              Login
            </button>
          </div>

          {/* Mobile menu toggle - simple interaction */}
          <div className="mobile-menu-toggle" id="mobileToggle">
            <i className="fas fa-bars"></i>
          </div>
        </div>
      </nav>

      {/* Mobile menu panel (hidden by default, toggled via js) */}
      <div className="mobile-menu-panel" id="mobileMenuPanel">
        <button onClick={() => scrollToSection("home")} className="mobile-nav-link">Home</button>
        <button onClick={() => scrollToSection("about")} className="mobile-nav-link">About</button>
        <button onClick={() => scrollToSection("features")} className="mobile-nav-link">Features</button>
        <button onClick={() => scrollToSection("herald")} className="mobile-nav-link">Herald College</button>
        <button onClick={() => scrollToSection("contact")} className="mobile-nav-link">Contact</button>
        <button className="mobile-login-btn" onClick={() => alert("🔐 Login page will be integrated in the full version.")}>Login</button>
      </div>

      {/* ====================== HERO SECTION ====================== */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">✨ Next-Gen Student Management</div>
          <h1 className="hero-title">
            Academiaz <span className="hero-highlight">Student Management System</span>
          </h1>
          <p className="hero-subtitle">
            Modern AI-powered platform for attendance, scheduling, resource sharing, and collaboration — 
            built for the future of education at Herald College Kathmandu.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Active Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">30+</span>
              <span className="stat-label">Expert Faculty</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">UK</span>
              <span className="stat-label">Affiliated Degrees</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== ABOUT SECTION ====================== */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">About Platform</span>
            <h2 className="section-title">Unified Ecosystem for <span className="accent-text">Modern Education</span></h2>
            <p className="section-subtitle">
              Academiaz transforms how Herald College manages attendance, schedules, and collaboration.
            </p>
          </div>
          <div className="about-grid">
            <div className="about-card">
              <div className="about-icon">🎓</div>
              <h3>All-in-One Solution</h3>
              <p>Attendance (facial recognition ready), intelligent scheduling, resource sharing, and student profiles in one dashboard.</p>
            </div>
            <div className="about-card">
              <div className="about-icon">🤖</div>
              <h3>AI & Computer Vision Ready</h3>
              <p>Built with modern AI concepts — future-ready facial recognition and smart analytics for Herald College.</p>
            </div>
            <div className="about-card">
              <div className="about-icon">🌍</div>
              <h3>UK Affiliated Curriculum</h3>
              <p>Designed to support University of Wolverhampton degree programs, focusing on global tech careers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== FEATURES SECTION (Cards UI) ====================== */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Powerful Features</span>
            <h2 className="section-title">Everything You Need to <span className="accent-text">Manage Academia</span></h2>
            <p className="section-subtitle">Smart tools designed for students, teachers, and administrators.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <i className="fas fa-face-smile feature-icon-svg"></i>
              </div>
              <h3>Facial Recognition Attendance</h3>
              <p>Mark attendance seamlessly with computer vision — secure, contactless, and future-ready.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <i className="fas fa-calendar-alt feature-icon-svg"></i>
              </div>
              <h3>Smart Scheduling System</h3>
              <p>Automated timetable, real-time updates, and personalized calendar for students & faculty.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <i className="fas fa-share-alt feature-icon-svg"></i>
              </div>
              <h3>Resource Sharing Platform</h3>
              <p>Upload, share, and discover lecture notes, projects, and references in one secure hub.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <i className="fas fa-user-graduate feature-icon-svg"></i>
              </div>
              <h3>Student Profile Management</h3>
              <p>Centralized records, academic progress tracking, and personalized dashboards.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <i className="fas fa-calendar-week feature-icon-svg"></i>
              </div>
              <h3>Event Management System</h3>
              <p>Manage workshops, hackathons, exams, and college events with ease and reminders.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <i className="fas fa-robot feature-icon-svg"></i>
              </div>
              <h3>AI Intelligent Assistant</h3>
              <p>Smart Q&A chatbot and insights (coming soon) to assist students 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== HERALD COLLEGE SECTION (VERY IMPORTANT) ====================== */}
      <section id="herald" className="herald-section">
        <div className="container">
          <div className="herald-card-modern">
            <div className="herald-content">
              <span className="herald-badge">🏛️ Partner Institution</span>
              <h2 className="herald-title">About Herald College Kathmandu</h2>
              <p className="herald-description">
                Herald College Kathmandu is a premier higher education institution in Nepal, offering UK-affiliated degree programs in collaboration with the <strong>University of Wolverhampton</strong>. 
                The college specializes in modern IT education, Computer Science, Business, and AI-related fields with a strong emphasis on practical learning and industry-based education.
              </p>
              <div className="herald-highlights">
                <div className="highlight-item">
                  <i className="fas fa-graduation-cap"></i> UK University Degrees
                </div>
                <div className="highlight-item">
                  <i className="fas fa-laptop-code"></i> Focus on IT, CS & Business
                </div>
                <div className="highlight-item">
                  <i className="fas fa-flask"></i> Project-Based Learning
                </div>
                <div className="highlight-item">
                  <i className="fas fa-globe"></i> Global Tech Career Prep
                </div>
              </div>
              <p className="herald-footer-text">
                Located in the heart of Kathmandu, Herald fosters innovation, research, and software development skills — 
                preparing students for top tech careers worldwide. Modern labs, industry collaborations, and a vibrant campus ecosystem.
              </p>
            </div>
            <div className="herald-visual">
              <div className="herald-quote">
                <i className="fas fa-quote-left"></i>
                <p>“Education is the most powerful weapon which you can use to change the world.”</p>
                <span>– Nelson Mandela</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== CONTACT / FOOTER SECTION ====================== */}
      <footer id="contact" className="footer-section">
        <div className="container footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-text">Academiaz</span>
              <span className="footer-dot"></span>
            </div>
            <p className="footer-description">Empowering Herald College with next-gen student management and AI tools.</p>
            <div className="social-icons">
              <i className="fab fa-facebook"></i>
              <i className="fab fa-twitter"></i>
              <i className="fab fa-linkedin"></i>
              <i className="fab fa-instagram"></i>
            </div>
          </div>
          <div className="footer-links-group">
            <div className="footer-links-col">
              <h4>Platform</h4>
              <a href="#home">Home</a>
              <a href="#features">Features</a>
              <a href="#about">About</a>
            </div>
            <div className="footer-links-col">
              <h4>College</h4>
              <a href="#herald">Herald College</a>
              <a href="#">University of Wolverhampton</a>
              <a href="#">Admissions</a>
            </div>
            <div className="footer-links-col">
              <h4>Support</h4>
              <a href="mailto:support@academiaz.edu.np">support@academiaz.edu.np</a>
              <a href="#">+977-1-5901234</a>
              <a href="#">Help Center</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Academiaz — Student Management System. All rights reserved. Designed for Herald College Kathmandu.</p>
        </div>
      </footer>
    </div>
  );
}

