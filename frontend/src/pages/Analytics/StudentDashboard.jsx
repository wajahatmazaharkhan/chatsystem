
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
      {/* Header */}
      <div className="student-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Track your participation and engagement</p>
        </div>
        <button className="student-badge">ACTIVE</button>
      </div>

      {/* Stats */}
      <div className="student-stats">
        {loading ? 'Loading...' : stats.map((item, idx) => (
          <div className="student-stat-card" key={idx}>
            <div className="student-stat-title">{item.title}</div>
            <div className="student-stat-value">{item.value}</div>
            <div className="student-stat-sub">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="student-grid">
        {/* Weekly Activity */}
        <div className="student-panel">
          <div className="panel-title">Weekly Activity</div>
          <div className="activity-chart">
            {loading ? 'Loading...' : weeklyActivity.map((d, idx) => (
              <div className="chart-item" key={idx}>
                <div className="chart-bar-wrap">
                  <div className="chart-bar" style={{ height: `${d.value}%` }} />
                </div>
                <span className="chart-day">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Achievements */}
        <div className="student-panel">
          <div className="panel-title">Achievements</div>
          <ul className="achievements-list">
            {loading ? <li>Loading...</li> : achievements.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

