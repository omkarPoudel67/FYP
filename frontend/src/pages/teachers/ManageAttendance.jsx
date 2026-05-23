import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./ManageAttendance.css";

const API_BASE = "http://localhost:8000";
const SEMESTERS = [1,2,3,4,5,6];
const YEARS     = [1,2,3];

export default function ManageAttendance() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [groups,   setGroups]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const [filters, setFilters] = useState({
    semester: "", year: "", group: "", search: "",
  });

  const fetchStudents = async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.semester) params.append("semester", filters.semester);
      if (filters.year)     params.append("year",     filters.year);
      if (filters.group)    params.append("group",    filters.group);
      if (filters.search)   params.append("search",   filters.search);

      const res  = await fetch(`${API_BASE}/attendance/info/?${params}`);
      const data = await res.json();
      setStudents(data);
    } catch {
      setError("Failed to load attendance data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/groups/`);
      const data = await res.json();
      setGroups(data);
    } catch {}
  };

  useEffect(() => { fetchGroups(); }, []);
  useEffect(() => { fetchStudents(); }, [filters]);

  const getPctColor = (pct) => {
    if (pct >= 90) return "var(--pct-high)";
    if (pct >= 75) return "var(--pct-mid)";
    return "var(--pct-low)";
  };

  return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">

        {/* Header */}
        <div className="ma2-header">
          <div>
            <h1 className="ma2-title">Manage Attendance</h1>
            <p className="ma2-subtitle">
              {loading ? "Loading..." : `${students.length} student${students.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="ma2-filters">
          <div className="ma2-search-wrap">
            <svg className="ma2-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="ma2-input ma2-search"
              placeholder="Search by name or username…"
              value={filters.search}
              onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
            />
          </div>

          <select className="ma2-input ma2-select" value={filters.semester}
            onChange={(e) => setFilters(p => ({ ...p, semester: e.target.value }))}>
            <option value="">All Semesters</option>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>

          <select className="ma2-input ma2-select" value={filters.year}
            onChange={(e) => setFilters(p => ({ ...p, year: e.target.value }))}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>

          <select className="ma2-input ma2-select" value={filters.group}
            onChange={(e) => setFilters(p => ({ ...p, group: e.target.value }))}>
            <option value="">All Groups</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          {(filters.search || filters.semester || filters.year || filters.group) && (
            <button className="ma2-btn ma2-btn--ghost"
              onClick={() => setFilters({ semester: "", year: "", group: "", search: "" })}>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="ma2-table-wrap">
          {error ? (
            <div className="ma2-empty ma2-empty--error">{error}</div>
          ) : loading ? (
            <div className="ma2-empty"><div className="ma2-spinner" />Loading…</div>
          ) : students.length === 0 ? (
            <div className="ma2-empty">No students found.</div>
          ) : (
            <table className="ma2-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Group</th>
                  <th>Sem / Year</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Attendance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.id} className="ma2-row" onClick={() => navigate(`/teacher/attendance/${s.id}`)}>
                    <td className="ma2-muted">{idx + 1}</td>
                    <td>
                      <div className="ma2-student-cell">
                        <div className="ma2-avatar">
                          {s.first_name?.[0]}{s.last_name?.[0]}
                        </div>
                        <div>
                          <div className="ma2-name">{s.first_name} {s.last_name}</div>
                          <div className="ma2-username">{s.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="ma2-badge ma2-badge--group">{s.group_name || "—"}</span>
                    </td>
                    <td className="ma2-muted">Sem {s.semester} / Yr {s.year}</td>
                    <td>
                      <span className="ma2-badge ma2-badge--present">{s.present_count}</span>
                    </td>
                    <td>
                      <span className="ma2-badge ma2-badge--absent">{s.absent_count}</span>
                    </td>
                    <td>
                      <div className="ma2-pct-cell">
                        <div className="ma2-progress-bar">
                          <div
                            className="ma2-progress-fill"
                            style={{
                              width: `${s.attendance_pct}%`,
                              background: getPctColor(s.attendance_pct),
                            }}
                          />
                        </div>
                        <span className="ma2-pct-label" style={{ color: getPctColor(s.attendance_pct) }}>
                          {s.attendance_pct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <svg className="ma2-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}