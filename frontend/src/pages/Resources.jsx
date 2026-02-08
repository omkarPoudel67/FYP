import React, { useState } from "react";
import Sidebar from "./Sidebar";
import useStudentData from "../RetriveData";
import { useModules, useWeeks, useResources } from "../RetriveData";
import "./CSS/resources.css" ;

const Resources = () => {
  const { studentData } = useStudentData();

  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  const {
    modules,
    loading: modulesLoading,
    error: modulesError,
  } = useModules(studentData?.group);

  const {
    weeks,
    loading: weeksLoading,
    error: weeksError,
  } = useWeeks(selectedModule);

  const {
    resources,
    loading: resourcesLoading,
    error: resourcesError,
  } = useResources(selectedModule, selectedWeek);

  return (
    <div className="resources-page">
  <Sidebar />

  {/* Main Content */}
  <div className="resources-content">
    {/* Header */}
    <div className="resources-header">
      <h1 className="resources-title">Learning Resources</h1>
      <p className="resources-subtitle">Access module materials, lecture slides, and study resources</p>
    </div>

    {/* Selection Cards */}
    <div className="selection-cards">
      {/* MODULE SELECT CARD */}
      <div className="selection-card">
        <div className="card-title">
          <div className="card-icon">📚</div>
          <span>Select Module</span>
        </div>
        <select
          value={selectedModule || ""}
          onChange={(e) => {
            setSelectedModule(e.target.value);
            setSelectedWeek(null);
          }}
          className="resource-select"
        >
          <option value="" className="select-placeholder">-- Choose Module --</option>
          {modules?.modules?.map((mod, index) => (
            <option key={index} value={mod}>
              {mod}
            </option>
          ))}
        </select>
        {modulesLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading modules...</span>
          </div>
        )}
        {modulesError && (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <span>{modulesError}</span>
          </div>
        )}
      </div>

      {/* WEEK SELECT CARD */}
      {selectedModule && (
        <div className="selection-card">
          <div className="card-title">
            <div className="card-icon">📅</div>
            <span>Select Week</span>
          </div>
          <select
            value={selectedWeek || ""}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="resource-select"
          >
            <option value="" className="select-placeholder">-- Choose Week --</option>
            {weeks?.map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
          {weeksLoading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Loading weeks...</span>
            </div>
          )}
          {weeksError && (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <span>{weeksError}</span>
            </div>
          )}
        </div>
      )}
    </div>

    {/* RESOURCES CONTAINER */}
    {selectedModule && selectedWeek && (
      <div className="resources-container">
        <div className="resources-header-bar">
          <h2 className="resources-week-title">
            Resources for Week {selectedWeek}
            {resources?.length > 0 && (
              <span className="resources-count">{resources.length} files</span>
            )}
          </h2>
          <p className="resources-subheader">
            {selectedModule} • Week {selectedWeek}
          </p>
        </div>

        <div className="resources-list">
          {resourcesLoading && (
            <div className="loading-state" style={{ justifyContent: "center", padding: "40px" }}>
              <div className="loading-spinner"></div>
              <span>Loading resources...</span>
            </div>
          )}
          
          {resourcesError && (
            <div className="error-state" style={{ margin: "20px 0" }}>
              <span className="error-icon">⚠️</span>
              <span>{resourcesError}</span>
            </div>
          )}

          {resources?.length === 0 && !resourcesLoading && !resourcesError && (
            <div className="empty-resources">
              <div className="empty-icon">📄</div>
              <p className="empty-message">No resources available for this week</p>
              <p className="empty-hint">Check back later or contact your instructor</p>
            </div>
          )}

          {resources?.map((res) => (
            <div key={res.id} className="resource-card">
              <div className="resource-card-header">
                <h3 className="resource-title">{res.title}</h3>
                <span className="resource-type">
                  {res.file?.split('.').pop()?.toUpperCase() || 'FILE'}
                </span>
              </div>
              
              <p className="resource-description">{res.description}</p>
              
              <div className="resource-footer">
                <div className="resource-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📄</span>
                    <span>{res.file?.split('.').pop()?.toUpperCase() || 'Unknown'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span>Week {selectedWeek}</span>
                  </div>
                </div>
                
                <a
                  href={`http://localhost:8000${res.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-btn"
                >
                  <span className="download-icon">⬇️</span>
                  Download Resource
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Stats Section - Optional */}
    {selectedModule && selectedWeek && resources?.length > 0 && (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{resources.length}</div>
          <div className="stat-label">Total Resources</div>
        </div>
        
        {/* <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">
            {new Set(resources.map(r => r.file?.split('.').pop())).size}
          </div>
          <div className="stat-label">File Types</div>
        </div> */}
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{selectedModule}</div>
          <div className="stat-label">Current Module</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">Week {selectedWeek}</div>
          <div className="stat-label">Selected Week</div>
        </div>
      </div>
    )}
  </div>
</div>
  );
};

export default Resources;
