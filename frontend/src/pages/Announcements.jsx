import React from "react";
import Sidebar from "./Sidebar";
import { useAttendanceHistory } from "../RetriveData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend
} from "recharts";
import "./CSS/Attendance.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-date">{label}</div>
        <div className="tooltip-value">
          <span className="tooltip-dot"></span>
          <span>Attendance: <span className="tooltip-percentage">{payload[0].value}%</span></span>
        </div>
      </div>
    );
  }
  return null;
};

const Attendance = () => {
  const { attendance, loading, error } = useAttendanceHistory();
  const now = new Date();

  const isNow = (start, end) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(sh, sm, 0, 0);
    const endTime = new Date();
    endTime.setHours(eh, em, 0, 0);
    return now >= startTime && now <= endTime;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) return (
    <div className="attendance-page">
      <Sidebar />
      <div className="attendance-content">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading attendance data...</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="attendance-page">
      <Sidebar />
      <div className="attendance-content">
        <div className="error-container">
          <div className="empty-icon">⚠️</div>
          <p>{error}</p>
        </div>
      </div>
    </div>
  );

  // Prepare data for line chart: attendance percentage per day
  const allRecords = [...attendance.past, ...attendance.today];

  const percentageData = Object.values(
    allRecords.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = { date: record.date, total: 0, present: 0 };
      }
      acc[record.date].total += 1;
      if (record.status === "present") acc[record.date].present += 1;
      return acc;
    }, {})
  ).map((item) => ({
    date: formatDate(item.date),
    fullDate: item.date,
    percentage: Number(((item.present / item.total) * 100).toFixed(0)),
  })).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Calculate statistics
  const avgAttendance = percentageData.length > 0 
    ? (percentageData.reduce((sum, item) => sum + item.percentage, 0) / percentageData.length).toFixed(0)
    : 0;
  
  const highestAttendance = percentageData.length > 0
    ? Math.max(...percentageData.map(item => item.percentage))
    : 0;
  
  const lowestAttendance = percentageData.length > 0
    ? Math.min(...percentageData.map(item => item.percentage))
    : 0;

  const getStatusClass = (status) => {
    switch(status) {
      case 'present': return 'status-present';
      case 'absent': return 'status-absent';
      case 'late': return 'status-late';
      default: return '';
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="attendance-page">
      <Sidebar />
      <div className="attendance-content">
        <div className="attendance-header">
          <div className="header-left">
            <h1 className="attendance-title">Attendance Overview</h1>
            <div className="date-badge">
              <span className="date-indicator"></span>
              {today}
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-outline">
              <span>📊</span> Export Report
            </button>
            <button className="btn-primary">
              <span>➕</span> Mark Attendance
            </button>
          </div>
        </div>

        {/* Attendance Line Chart - Redesigned */}
        <section className="chart-section">
          <div className="chart-header">
            <h2>
              Attendance Trend
              <span className="chart-badge">Last {percentageData.length} days</span>
            </h2>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color attendance-line"></span>
                <span>Attendance Rate</span>
              </div>
              <div className="legend-item">
                <span className="legend-color target-line"></span>
                <span>Target (75%)</span>
              </div>
            </div>
          </div>
          
          {percentageData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>No attendance records to display</p>
            </div>
          ) : (
            <>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={percentageData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef5f4" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888"
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      unit="%" 
                      stroke="#888"
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="percentage"
                      stroke="none"
                      fill="url(#attendanceGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#14b8a6"
                      strokeWidth={3}
                      dot={{ fill: '#14b8a6', r: 6, strokeWidth: 2, stroke: 'white' }}
                      activeDot={{ r: 8, fill: '#14b8a6', stroke: 'white', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey={() => 75}
                      stroke="#ffb74d"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Statistics */}
              <div className="chart-stats-grid">
                <div className="chart-stat-card">
                  <div className="chart-stat-label">Average Attendance</div>
                  <div className="chart-stat-value">{avgAttendance}%</div>
                  <div className="chart-stat-trend">
                    {avgAttendance >= 75 ? (
                      <span className="trend-up">✓ Meeting target</span>
                    ) : (
                      <span className="trend-down">▼ Below target</span>
                    )}
                  </div>
                </div>
                <div className="chart-stat-card">
                  <div className="chart-stat-label">Highest</div>
                  <div className="chart-stat-value">{highestAttendance}%</div>
                </div>
                <div className="chart-stat-card">
                  <div className="chart-stat-label">Lowest</div>
                  <div className="chart-stat-value">{lowestAttendance}%</div>
                </div>
                <div className="chart-stat-card">
                  <div className="chart-stat-label">Total Records</div>
                  <div className="chart-stat-value">{allRecords.length}</div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Today's Schedule - Redesigned */}
        <section className="today-schedule-section">
          <div className="section-header">
            <h2>
              Today's Schedule
              <span className="class-count-badge">
                {attendance.todays_schedule.length} classes
              </span>
            </h2>
          </div>
          
          {attendance.todays_schedule.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>No classes scheduled for today</p>
            </div>
          ) : (
            <div className="schedule-grid">
              {attendance.todays_schedule.map((s) => {
                const record = attendance.today.find(
                  (a) => a.module_name === s.module_name
                );
                const classNow = isNow(s.start_time, s.end_time);

                return (
                  <div key={s.id} className="schedule-card">
                    <div className="card-header">
                      <span className="module-badge">{s.module_name.substring(0, 3)}</span>
                      <span className="time-badge">{s.start_time}</span>
                    </div>
                    <h3 className="card-title">{s.module_name}</h3>
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span>{s.location}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">⏰</span>
                        <span>{s.start_time} - {s.end_time}</span>
                      </div>
                    </div>
                    
                    {record ? (
                      <span className={`status-badge ${getStatusClass(record.status)}`}>
                        <span>●</span> {record.status}
                      </span>
                    ) : classNow ? (
                      <button className="take-attendance-btn">
                        <span>📸</span> Take Attendance
                      </button>
                    ) : (
                      <div className="future-class">
                        <span>⏳</span> Starts at {s.start_time}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Past Attendance - Redesigned */}
        <section className="past-attendance-section">
          <div className="past-header">
            <h2>
              Past Attendance Records
              <span className="record-count">{attendance.past.length} records</span>
            </h2>
          </div>
          
          {attendance.past.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No past attendance records found</p>
            </div>
          ) : (
            <div className="past-table-wrapper">
              <table className="past-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.past.map((p, index) => (
                    <tr key={index}>
                      <td>
                        <div className="module-info">
                          <span className="module-avatar">
                            {p.module_name.substring(0, 2)}
                          </span>
                          <span>{p.module_name}</span>
                        </div>
                      </td>
                      <td>{p.date}</td>
                      <td>{p.location}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Attendance;