import React from "react";
import Sidebar from "./Sidebar";
import { useAnnouncements } from "../RetriveData";
import './CSS/announcements.css';

const Events = () => {
  const {
    announcements,
    loading: AnnounceLoading,
    error: AnnounceError,
  } = useAnnouncements();

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get short date for badges
  const getShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="announcements-page">
      <Sidebar />

      {/* Main content */}
      <div className="announcements-content">
        {/* Header with Stats */}
        <div className="announcements-header">
          <div className="header-left">
            <h1 className="announcements-title">Announcements</h1>
            <p className="announcements-subtitle">
              Stay updated with the latest news and important notices
            </p>
          </div>

          {/* Stats in Top Right */}
          {!AnnounceLoading && !AnnounceError && announcements.length > 0 && (
            <div className="header-stats">
              <div className="stat-badge">
                <div className="stat-icon">📢</div>
                <div className="stat-info">
                  <h4>{announcements.length}</h4>
                  <p>Total Announcements</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {AnnounceLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading announcements...</p>
          </div>
        )}
        
        {AnnounceError && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">Failed to load announcements</p>
            <p className="error-details">{AnnounceError}</p>
          </div>
        )}

        {!AnnounceLoading && !AnnounceError && announcements.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📢</div>
            <h3 className="empty-title">No announcements available</h3>
            <p className="empty-description">
              Check back later for important updates and news.
            </p>
          </div>
        )}

        {!AnnounceLoading && !AnnounceError && announcements.length > 0 && (
          <div className="announcements-list">
            {/* All Announcements in Vertical List */}
            {announcements.map((announcement, index) => (
              <div 
                key={announcement.id} 
                className={`announcement-item ${index === 0 ? 'latest-item' : ''}`}
              >
                {index === 0 && (
                  <div className="latest-badge">Latest</div>
                )}
                
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <div className="announcement-date">
                      {getShortDate(announcement.upload_time)}
                    </div>
                  </div>
                  
                  <p className="announcement-description">{announcement.description}</p>
                  
                  <div className="announcement-footer">
                    <div className="time-posted">
                      <span className="time-icon">🕒</span>
                      <span>{formatDate(announcement.upload_time)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;