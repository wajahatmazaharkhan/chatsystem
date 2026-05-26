import './Topbar.css';

export default function Topbar({ title, lastFetched, thresholdVal, thresholdUnit, onThresholdValChange, onThresholdUnitChange, onApply }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <div className="threshold-control">
          <label>Inactivity threshold:</label>
          <input
            type="number"
            value={thresholdVal}
            min="1"
            max="30"
            onChange={(e) => onThresholdValChange(e.target.value)}
          />
          <select value={thresholdUnit} onChange={(e) => onThresholdUnitChange(e.target.value)}>
            <option value="days">days</option>
            <option value="hours">hours</option>
          </select>
          <button className="btn-apply" onClick={onApply}>Apply</button>
        </div>
        <div className="topbar-meta">{lastFetched || '—'}</div>
      </div>
    </div>
  );
}
