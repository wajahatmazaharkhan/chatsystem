import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard() {
  const [adminStats, setAdminStats] = useState({
    total_students: 120,
    total_groups: 18,
    active_students: 95,
    inactive_students: 25,
    engagement_rate: 79,
    total_messages: 430
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/analytics/admin');
        if (res.data) {
          setAdminStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics, using fallback data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const lineData = [
    { name: 'Mon', uv: 25 },
    { name: 'Tue', uv: 50 },
    { name: 'Wed', uv: 90 },
    { name: 'Thu', uv: 75 },
    { name: 'Fri', uv: 60 },
    { name: 'Sat', uv: 85 },
    { name: 'Sun', uv: 100 },
  ];

  const pieData = [
    { name: 'Active', value: adminStats.active_students || 95 },
    { name: 'Inactive', value: adminStats.inactive_students || 25 },
  ];
  const COLORS = ['#9ca3af', '#ffffff'];

  const tableData = [
    { id: 1, group: 'Group A', active: 15, inactive: 3, messages: 120 },
    { id: 2, group: 'Group B', active: 20, inactive: 5, messages: 85 },
    { id: 3, group: 'Group C', active: 18, inactive: 2, messages: 150 },
    { id: 4, group: 'Group D', active: 10, inactive: 8, messages: 45 },
  ];

  return (
    <div className="analytics-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{adminStats.total_students}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{adminStats.total_groups}</div>
          <div className="stat-label">Total Groups</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{adminStats.total_messages}</div>
          <div className="stat-label">Total Messages</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{adminStats.inactive_students}</div>
          <div className="stat-label">Inactive Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{adminStats.engagement_rate}%</div>
          <div className="stat-label">Engagement Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{adminStats.active_students}</div>
          <div className="stat-label">Active Students</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" axisLine={{ stroke: '#999' }} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
              <YAxis axisLine={{ stroke: '#999' }} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
              <Line type="linear" dataKey="uv" stroke="#666" strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container" style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={50}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9ca3af' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff' }} />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="groups-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Active</th>
              <th>Inactive</th>
              <th>Messages</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.id}>
                <td>{row.group}</td>
                <td>{row.active}</td>
                <td>{row.inactive}</td>
                <td>{row.messages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
