import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { id: '/', icon: '◧', label: 'Dashboard' },
  { id: '/groups', icon: '◈', label: 'Groups' },
  { id: '/analytics', icon: '◠', label: 'Analytics' },
  { id: '/activity', icon: '◉', label: 'Activity' },
  { id: '/settings', icon: '⚙', label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="mod-label">Module 7</div>
        <div className="mod-name">Analytics</div>
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.id}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
