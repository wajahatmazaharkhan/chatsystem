


import React, { useEffect, useState } from 'react';
import './StudentDashboard.css';
import { fetchStudentStats } from '../../services/analyticsService';

export default function StudentDashboard() {
  const [stats, setStats] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentStats()
      .then((data) => {
        setStats(data.stats || []);
        setWeeklyActivity(data.weeklyActivity || []);
        setAchievements(data.achievements || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="student-dashboard">

      {/* HEADER */}
      <div className="student-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Track your participation and engagement</p>
        </div>
        <button className="student-badge">ACTIVE</button>
      </div>

      {/* STATS */}
      <div className="student-stats">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div className="student-stat-card" key={i}>
                <div className="student-stat-title">Loading</div>
                <div className="student-stat-value">...</div>
                <div className="student-stat-sub">...</div>
              </div>
            ))
          : stats.map((item, idx) => (
              <div className="student-stat-card" key={idx}>
                <div className="student-stat-title">{item.title}</div>
                <div className="student-stat-value">{item.value}</div>
                <div className="student-stat-sub">{item.sub}</div>
              </div>
            ))}
      </div>

      {/* MAIN GRID */}
      <div className="student-grid">

        {/* ACTIVITY */}
        <div className="student-panel">
          <div className="panel-title">Weekly Activity</div>

          <div className="activity-chart">
            {loading
              ? 'Loading chart...'
              : weeklyActivity.map((d, idx) => (
                  <div className="chart-item" key={idx}>
                    <div className="chart-bar-wrap">
                      <div
                        className="chart-bar"
                        style={{ height: `${d.value}%` }}
                      />
                    </div>
                    <span className="chart-day">{d.day}</span>
                  </div>
                ))}
          </div>
        </div>

        {/* ACHIEVEMENTS (FIXED) */}
        <div className="student-panel">
          <div className="panel-title">Achievements</div>

          <div className="achievement-list">
            {loading
              ? 'Loading...'
              : achievements.map((a, idx) => (
                  <div className="achievement-item" key={idx}>
                    <div className="achievement-dot" />
                    <div>{a}</div>
                  </div>
                ))}
          </div>
        </div>

      </div>

    </div>
  );
}