import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { id: '/user-status', icon: '◉', label: 'User Status' },
  { id: '/group-status', icon: '◈', label: 'Group Status' },
  { id: '/api-test', icon: '⌥', label: 'API Test' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="mod-label">Module 6</div>
        <div className="mod-name">Classification Engine</div>
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
