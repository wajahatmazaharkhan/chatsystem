import { useMemo } from 'react';
import './GroupStatusPage.css';

export default function GroupStatusView({ users, onRefresh }) {
  const groups = useMemo(() => {
    const groupMap = {};
    users.forEach((u) => {
      const gid = u.group_id;
      if (!groupMap[gid]) {
        groupMap[gid] = {
          group_id: gid,
          group_name: u.group_name || gid,
          members: [],
        };
      }
      groupMap[gid].members.push(u);
    });
    return Object.values(groupMap);
  }, [users]);

  return (
    <div className="group-status-view">
      <div className="section-header">
        <div className="section-title">Group-Level Aggregation</div>
        <button className="btn-refresh" onClick={onRefresh}>↻ Refresh</button>
      </div>

      <div className="table-wrap group-table">
        <table>
          <thead>
            <tr>
              <th>Group ID</th>
              <th>Group Name</th>
              <th>Total</th>
              <th>Active</th>
              <th>Inactive</th>
              <th>Active Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">No group data available.</div>
                </td>
              </tr>
            ) : (
              groups.map((g) => {
                const active = g.members.filter((m) => m.status === 'ACTIVE').length;
                const inactive = g.members.filter((m) => m.status === 'INACTIVE').length;
                const total = g.members.length;
                const pct = total ? Math.round((active / total) * 100) : 0;

                let groupStatus, gsColor, gsBg;
                if (pct >= 70) {
                  groupStatus = 'HEALTHY';
                  gsColor = 'var(--active)';
                  gsBg = 'var(--active-bg)';
                } else if (pct >= 40) {
                  groupStatus = 'AT RISK';
                  gsColor = '#b45309';
                  gsBg = '#fff8e1';
                } else {
                  groupStatus = 'CRITICAL';
                  gsColor = 'var(--inactive)';
                  gsBg = 'var(--inactive-bg)';
                }

                return (
                  <tr key={g.group_id}>
                    <td><span className="uid">{g.group_id}</span></td>
                    <td>{g.group_name}</td>
                    <td><span className="uid">{total}</span></td>
                    <td style={{ color: 'var(--active)', fontFamily: 'var(--mono)' }}>{active}</td>
                    <td style={{ color: 'var(--inactive)', fontFamily: 'var(--mono)' }}>{inactive}</td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="pct-label">{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: gsBg, color: gsColor }}>
                        {groupStatus}
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
