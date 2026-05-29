import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard() {
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/analytics/admin');
        if (res.data) {
          setAdminStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = [
    { title: 'Total Students', value: adminStats?.total_students || 0, subtext: 'Not available' },
    { title: 'Active This Week', value: adminStats?.active_students || 0, subtext: `${adminStats?.engagement_rate || 0}% of total`, subtextClass: 'success' },
    { title: 'Inactive', value: adminStats?.inactive_students || 0, subtext: 'Not available', subtextClass: 'danger' },
    { title: 'Total Groups', value: adminStats?.total_groups || 0, subtext: 'Not available' }
  ];

  // The backend doesn't provide these currently, so they will be empty.
  const batchEngagement = [];
  const criticalAlerts = [];
  const users = [];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>System Administration <span className="separator">-</span> All Batches <span className="separator">-</span> All Groups</h1>
          <p className="user-info">
            <span className="user-name">Admin</span> <span className="pipe">|</span> <span className="user-access">Full system access</span>
          </p>
        </div>
        <div className="header-right">
          <button className="admin-btn">ADMIN</button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="stats-row">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <h3 className="stat-title">{stat.title}</h3>
            <div className="stat-value">{loading ? '...' : stat.value}</div>
            <div className={`stat-subtext ${stat.subtextClass || ''}`}>{stat.subtext}</div>
          </div>
        ))}
      </div>

      {/* Middle Section: Engagement & Alerts */}
      <div className="middle-section">
        {/* Engagement Overview */}
        <div className="engagement-card panel">
          <h2 className="panel-title">Batch Engagement Overview</h2>
          <div className="engagement-list">
            {batchEngagement.length > 0 ? batchEngagement.map((batch, idx) => (
              <div key={idx} className="engagement-item">
                <span className="batch-name">{batch.name}</span>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${batch.percentage}%`, backgroundColor: batch.color }}
                  ></div>
                </div>
                <span className="batch-percentage">{batch.percentage}%</span>
              </div>
            )) : (
              <div className="text-muted">Not available</div>
            )}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="alerts-card panel">
          <h2 className="panel-title">Critical Alerts</h2>
          <div className="alerts-list">
            {criticalAlerts.length > 0 ? criticalAlerts.map((alert, idx) => (
              <div key={idx} className={`alert-item alert-${alert.type}`}>
                <div className="alert-title">{alert.title}</div>
                <div className="alert-desc">{alert.description}</div>
              </div>
            )) : (
              <div className="text-muted">0 Alerts</div>
            )}
          </div>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="users-section panel">
        <div className="users-header">
          <h2 className="panel-title">All Users</h2>
          <div className="users-actions">
            <button className="btn-secondary">+ Add User</button>
            <button className="btn-secondary">Export CSV</button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Batch</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map((user, idx) => (
                <tr key={idx}>
                  <td className="fw-600">{user.name}</td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-muted">{user.batch}</td>
                  <td className={user.lastLoginClass || 'text-muted'}>{user.lastLogin}</td>
                  <td>
                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="table-actions">
                    <button className="action-link">Edit</button>
                    <span className="pipe">|</span>
                    <button className="action-link">Suspend</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-muted" style={{ textAlign: 'center' }}>Not available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
