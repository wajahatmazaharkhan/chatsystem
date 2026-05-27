import { useState, useMemo } from 'react';
import StatCards from '../components/StatCards';
import './UserStatusPage.css';

export default function UserStatusView({ users, thresholdDays, onRefresh, loading }) {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const inactiveCount = users.filter((u) => u.status === 'INACTIVE').length;
  const groups = [...new Set(users.map((u) => u.group_name).filter(Boolean))];

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.user_id || '').toLowerCase().includes(search.toLowerCase());
      const matchGroup = !groupFilter || u.group_name === groupFilter;
      const matchStatus = statusFilter === 'all' || u.status?.toLowerCase() === statusFilter;
      return matchSearch && matchGroup && matchStatus;
    });
  }, [users, search, groupFilter, statusFilter]);

  function getDayClass(d) {
    if (d === 0) return '';
    if (d <= 2) return 'warn';
    return 'danger';
  }

  return (
    <div className="user-status-view">
      <StatCards
        total={users.length}
        active={activeCount}
        inactive={inactiveCount}
        thresholdLabel={`${thresholdDays}d`}
      />

      {/* Section header with filter tabs */}
      <div className="section-header">
        <div className="section-title">User Classification</div>
        <div className="section-tabs">
          {['all', 'active', 'inactive'].map((f) => (
            <button
              key={f}
              className={`tab-btn ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search and filter row */}
      <div className="filter-row">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by name or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <button className="btn-refresh" onClick={onRefresh}>
          {loading ? <span className="loading-spinner" /> : '↻'} Refresh
        </button>
      </div>

      {/* User table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Group</th>
              <th>Last Active</th>
              <th>Days Inactive</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">No users match the current filter.</div>
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const d = u.days_inactive ?? 0;
                const dayClass = getDayClass(d);
                const dLabel = d === 0 ? 'Today' : `${d}d ago`;
                const ts = (u.last_active || '').replace('T', ' ').slice(0, 16);

                return (
                  <tr key={u.user_id}>
                    <td><span className="uid">{u.user_id}</span></td>
                    <td>{u.name}</td>
                    <td><span className="uid">{u.group_id}</span> {u.group_name}</td>
                    <td>
                      <span className="timestamp">{ts}</span>
                    </td>
                    <td>
                      <span className={`days-ago ${dayClass}`}>{dLabel}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        <span className={`status-dot ${u.status === 'ACTIVE' ? 'active' : 'inactive'}`} />
                        {u.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
