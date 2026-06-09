


import React, { useEffect, useState } from 'react';
import './StudentDashboard.css';
import { fetchStudentStats } from '../../services/analyticsService';
import { getEnrolledBatches } from '../../services/batchService';
import BatchSelection from '../../components/batch/BatchSelection';

export default function StudentDashboard() {
  const [stats, setStats] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [enrolledBatches, setEnrolledBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const batchesRes = await getEnrolledBatches();
      setEnrolledBatches(batchesRes.data || []);
      
      const statsData = await fetchStudentStats();
      setStats(statsData.stats || []);
      setWeeklyActivity(statsData.weeklyActivity || []);
      setAchievements(statsData.achievements || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-300">Loading dashboard...</div>;
  }

  if (enrolledBatches.length === 0) {
    return (
      <div className="p-8">
        <BatchSelection onEnrolled={loadDashboardData} />
      </div>
    );
  }

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