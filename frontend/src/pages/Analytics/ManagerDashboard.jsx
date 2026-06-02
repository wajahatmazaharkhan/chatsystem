
import React, { useEffect, useState } from 'react';
import './ManagerDashboard.css';
import { fetchManagerStats } from '../../services/analyticsService';

export default function ManagerDashboard() {
  const [stats, setStats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerStats()
      .then((data) => {
        setStats(data.stats || []);
        setGroups(data.groups || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="manager-dashboard">
      <div className="manager-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p>Monitor group engagement and activity</p>
        </div>
        <button className="manager-badge">MANAGER</button>
      </div>

      <div className="manager-stats">
        {loading ? 'Loading...' : stats.map((s, idx) => (
          <div className="manager-stat-card" key={idx}>
            <div className="manager-stat-label">{s.title}</div>
            <div className="manager-stat-value">{s.value}</div>
            <div className="manager-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="group-panel">
        <div className="panel-title">Group Performance</div>
        <table className="group-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Active</th>
              <th>Inactive</th>
              <th>Engagement</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">Loading...</td></tr>
            ) : groups.map((g, idx) => (
              <tr key={idx}>
                <td>{g.name}</td>
                <td className="active">{g.active}</td>
                <td className="inactive">{g.inactive}</td>
                <td>
                  <div className="progress-wrap">
                    <div
                      className="progress-fill"
                      style={{ width: `${g.rate}%` }}
                    />
                  </div>
                </td>

                <td>
                  <span className={`health-badge ${
                    g.rate >= 70
                      ? 'healthy'
                      : g.rate >= 40
                      ? 'risk'
                      : 'critical'
                  }`}>
                    {
                      g.rate >= 70
                        ? 'HEALTHY'
                        : g.rate >= 40
                        ? 'AT RISK'
                        : 'CRITICAL'
                    }
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

