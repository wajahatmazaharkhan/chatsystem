import './Topbar.css';

export default function Topbar({ title }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
    </div>
  );
}
