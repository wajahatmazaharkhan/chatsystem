import './StatCards.css';

export default function StatCards({ total, active, inactive, thresholdLabel }) {
  const activePct = total ? Math.round((active / total) * 100) : 0;
  const inactivePct = total ? Math.round((inactive / total) * 100) : 0;

  return (
    <div className="stat-row">
      <div className="stat-card">
        <div className="stat-label">Total Users</div>
        <div className="stat-value">{total}</div>
        <div className="stat-sub">across all groups</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Active</div>
        <div className="stat-value active-val">{active}</div>
        <div className="stat-sub">{activePct}% of total</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Inactive</div>
        <div className="stat-value inactive-val">{inactive}</div>
        <div className="stat-sub">{inactivePct}% of total</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Threshold</div>
        <div className="stat-value" style={{ fontSize: 18, marginTop: 4 }}>{thresholdLabel}</div>
        <div className="stat-sub">configurable</div>
      </div>
    </div>
  );
}
