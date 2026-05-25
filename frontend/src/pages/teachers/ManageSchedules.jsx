import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./CSS/ManageSchedules.css";

const API_BASE  = "http://localhost:8000";
const SEMESTERS = [1, 2, 3, 4, 5, 6];
const YEARS     = [1, 2, 3];

export default function ManageSchedules() {
  const navigate = useNavigate();

  const [groups,  setGroups]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filters, setFilters] = useState({ year: "", semester: "", search: "" });

  const fetchGroups = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API_BASE}/schedule/groups/`);
      const data = await res.json();
      setGroups(data);
    } catch { setError("Failed to load groups."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  // derive year/semester from first student in group
  const getGroupMeta = g => {
    if (!g.students?.length) return { year: null, semester: null };
    return { year: g.students[0].year, semester: g.students[0].semester };
  };

  const filtered = groups.filter(g => {
    const meta = getGroupMeta(g);
    if (filters.year     && String(meta.year)     !== filters.year)     return false;
    if (filters.semester && String(meta.semester) !== filters.semester) return false;
    if (filters.search   && !g.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const clearFilters = () => setFilters({ year: "", semester: "", search: "" });
  const hasFilters   = filters.year || filters.semester || filters.search;

  return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">

        <div className="ms-header">
          <div>
            <h1 className="ms-title">Schedules</h1>
            <p className="ms-subtitle">
              {loading ? "Loading..." : `${filtered.length} group${filtered.length !== 1 ? "s" : ""} — click a group to manage its schedule`}
            </p>
          </div>
        </div>

        <div className="ms-filters">
          <div className="ms-search-wrap">
            <svg className="ms-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="ms-input ms-search" placeholder="Search groups…"
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} />
          </div>

          <select className="ms-input ms-select" value={filters.year}
            onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>

          <select className="ms-input ms-select" value={filters.semester}
            onChange={e => setFilters(p => ({ ...p, semester: e.target.value }))}>
            <option value="">All Semesters</option>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>

          {hasFilters && (
            <button className="ms-btn ms-btn--ghost" onClick={clearFilters}>Clear</button>
          )}
        </div>

        <div className="ms-table-wrap">
          {error ? (
            <div className="ms-empty ms-empty--error">{error}</div>
          ) : loading ? (
            <div className="ms-empty"><div className="ms-spinner"/>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="ms-empty">No groups found.</div>
          ) : (
            <table className="ms-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Group</th>
                  <th>Year / Semester</th>
                  <th>Modules</th>
                  <th>Students</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, idx) => {
                  const meta = getGroupMeta(g);
                  return (
                    <tr key={g.id} className="ms-row"
                      onClick={() => navigate(`/teacher/groups/${g.id}/schedule`)}>
                      <td className="ms-muted">{idx + 1}</td>
                      <td><div className="ms-name">{g.name}</div></td>
                      <td className="ms-muted">
                        {meta.year
                          ? `Year ${meta.year} · Sem ${meta.semester}`
                          : <span className="ms-na">—</span>}
                      </td>
                      <td>
                        <div className="ms-chips">
                          {g.modules?.length > 0
                            ? g.modules.slice(0, 3).map(m => (
                                <span key={m.id} className="ms-badge ms-badge--module">{m.code}</span>
                              ))
                            : <span className="ms-na">—</span>}
                          {g.modules?.length > 3 && (
                            <span className="ms-badge ms-badge--more">+{g.modules.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="ms-badge ms-badge--count">{g.students?.length ?? 0}</span>
                      </td>
                      <td>
                        <svg className="ms-chevron" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}