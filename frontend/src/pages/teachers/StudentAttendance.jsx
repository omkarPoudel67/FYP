import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./CSS/StudentAttendance.css";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2, XCircle, AlertCircle,
  TrendingUp, BookOpen, MapPin,
  CheckCheck, X, ChevronLeft, Clock,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function StudentAttendance() {
  const { studentId } = useParams();
  const navigate      = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // filters for history list
  const [selectedModule, setSelectedModule] = useState("All");
  const [selectedDate,   setSelectedDate]   = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true); setError(null);
      try {
        const res  = await fetch(`${API_BASE}/attendance/info/${studentId}/`);
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load student attendance.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [studentId]);

  if (loading) return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">
        <div className="sa-empty"><div className="sa-spinner" />Loading…</div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">
        <div className="sa-empty sa-empty--error">{error || "No data."}</div>
      </div>
    </div>
  );

  const { student, stats, insights, module_breakdown, chart_records, history, module_names } = data;

  // ── Chart data ─────────────────────────────────────────────────
  const buildChartData = () => {
    const filtered = selectedModule === "All"
      ? chart_records
      : chart_records.filter(r => r.module_name === selectedModule);

    const byDate = filtered.reduce((acc, r) => {
      if (!acc[r.date]) acc[r.date] = { date: r.date, total: 0, present: 0 };
      acc[r.date].total += 1;
      if (r.record_status === "present") acc[r.date].present += 1;
      return acc;
    }, {});

    const sorted = Object.values(byDate).sort((a, b) => new Date(a.date) - new Date(b.date));
    let cumTotal = 0, cumPresent = 0;
    return sorted.map(item => {
      cumTotal   += item.total;
      cumPresent += item.present;
      return {
        date:       item.date,
        percentage: Number(((cumPresent / cumTotal) * 100).toFixed(1)),
      };
    });
  };

  // ── Filtered history list ───────────────────────────────────────
  const filteredHistory = history.filter(r => {
    const moduleMatch = selectedModule === "All" || r.module_name === selectedModule;
    const dateMatch   = !selectedDate || r.date === selectedDate;
    return moduleMatch && dateMatch;
  });

  const chartData = buildChartData();

  const insightIcon = (type) => {
    if (type === "positive") return <CheckCircle2 size={15} />;
    if (type === "warning")  return <AlertCircle  size={15} />;
    return <TrendingUp size={15} />;
  };

  return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">

        {/* Back button */}
        <button className="sa-back" onClick={() => navigate("/teacher/attendance")}>
          <ChevronLeft size={16} /> Back to Attendance
        </button>

        {/* Student header */}
        <div className="sa-student-header">
          <div className="sa-avatar-lg">
            {student.first_name?.[0]}{student.last_name?.[0]}
          </div>
          <div className="sa-student-info">
            <h1 className="sa-student-name">{student.first_name} {student.last_name}</h1>
            <div className="sa-student-meta">
              <span>@{student.username}</span>
              <span>·</span>
              <span>{student.group || "No Group"}</span>
              <span>·</span>
              <span>Semester {student.semester}</span>
              <span>·</span>
              <span>Year {student.year}</span>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="sa-stats-row">
          <div className="sa-stat-card">
            <div className="sa-stat-icon sa-stat-icon--blue">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="sa-stat-value">{stats.total_classes}</div>
              <div className="sa-stat-label">Total Classes</div>
            </div>
          </div>
          <div className="sa-stat-card">
            <div className="sa-stat-icon sa-stat-icon--green">
              <CheckCheck size={18} />
            </div>
            <div>
              <div className="sa-stat-value">{stats.present_count}</div>
              <div className="sa-stat-label">Present</div>
            </div>
          </div>
          <div className="sa-stat-card">
            <div className="sa-stat-icon sa-stat-icon--red">
              <X size={18} />
            </div>
            <div>
              <div className="sa-stat-value">{stats.absent_count}</div>
              <div className="sa-stat-label">Absent</div>
            </div>
          </div>
          {stats.late_count > 0 && (
            <div className="sa-stat-card">
              <div className="sa-stat-icon sa-stat-icon--yellow">
                <Clock size={18} />
              </div>
              <div>
                <div className="sa-stat-value">{stats.late_count}</div>
                <div className="sa-stat-label">Late</div>
              </div>
            </div>
          )}
          <div className="sa-stat-card sa-stat-card--pct">
            <div
              className="sa-pct-ring"
              style={{ "--pct": stats.overall_pct }}
            >
              <span>{stats.overall_pct}%</span>
            </div>
            <div className="sa-stat-label">Overall</div>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="sa-section">
            <h2 className="sa-section-title">Insights</h2>
            <div className="sa-insights">
              {insights.map((ins, i) => (
                <div key={i} className={`sa-insight sa-insight--${ins.type}`}>
                  {insightIcon(ins.type)}
                  <span>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module breakdown */}
        <div className="sa-section">
          <h2 className="sa-section-title">Module Breakdown</h2>
          <div className="sa-module-grid">
            {module_breakdown.map((m, i) => {
              const color = m.attendance_pct >= 90
                ? "var(--pct-high)"
                : m.attendance_pct >= 75
                ? "var(--pct-mid)"
                : "var(--pct-low)";
              return (
                <div key={i} className="sa-module-card">
                  <div className="sa-module-name">{m.module_name}</div>
                  <div className="sa-module-stats">
                    <span className="sa-module-stat sa-module-stat--present">
                      <CheckCheck size={12} /> {m.present_count}
                    </span>
                    <span className="sa-module-stat sa-module-stat--absent">
                      <X size={12} /> {m.absent_count}
                    </span>
                    <span className="sa-module-stat sa-module-stat--total">
                      / {m.total_classes}
                    </span>
                  </div>
                  <div className="sa-module-progress">
                    <div className="sa-module-fill" style={{ width: `${m.attendance_pct}%`, background: color }} />
                  </div>
                  <div className="sa-module-pct" style={{ color }}>{m.attendance_pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="sa-section">
          <div className="sa-section-header">
            <h2 className="sa-section-title">Attendance Over Time</h2>
            <select
              className="sa-input sa-select"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="All">All Modules</option>
              {module_names.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {chartData.length === 0 ? (
            <p className="sa-empty-text">No data for this module.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#5a6070" }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "#5a6070" }} />
                <Tooltip
                  formatter={(v) => [`${v}%`, "Attendance"]}
                  contentStyle={{
                    background: "#111520",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#c8cdd8",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#4f8ef7"
                  strokeWidth={2.5}
                  dot={{ fill: "#4f8ef7", r: 4 }}
                  activeDot={{ r: 6, fill: "#6ba3f9" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* History list */}
        <div className="sa-section">
          <div className="sa-section-header">
            <h2 className="sa-section-title">Attendance History</h2>
            <div className="sa-history-filters">
              <select
                className="sa-input sa-select"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
              >
                <option value="All">All Modules</option>
                {module_names.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                className="sa-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {selectedDate && (
                <button className="sa-clear-btn" onClick={() => setSelectedDate("")}>
                  Clear date
                </button>
              )}
            </div>
          </div>

          <div className="sa-history-list">
            {filteredHistory.length === 0 ? (
              <p className="sa-empty-text">No records match your filters.</p>
            ) : (
              filteredHistory.map((r, i) => (
                <div key={i} className={`sa-record ${r.status === "present" ? "sa-record--present" : r.status === "late" ? "sa-record--late" : "sa-record--absent"}`}>
                  <div className="sa-record-left">
                    <span className="sa-record-module">{r.module_name}</span>
                    <span className="sa-record-location">
                      <MapPin size={11} /> {r.location || "—"}
                    </span>
                  </div>
                  <div className="sa-record-right">
                    <span className="sa-record-date">{r.date}</span>
                    <span className={`sa-status-badge sa-status-badge--${r.status}`}>
                      {r.status === "present"
                        ? <CheckCheck size={12} />
                        : r.status === "late"
                        ? <Clock size={12} />
                        : <X size={12} />}
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}