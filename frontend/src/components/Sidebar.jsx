
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

/*
  Role is now derived from the user prop
*/

/* ---------------- ADMIN NAV ---------------- */

const adminNav = [
  { id: '/', icon: '◧', label: 'Dashboard' },
  { id: '/groups', icon: '◈', label: 'Groups' },
  { id: '/analytics', icon: '◠', label: 'Analytics' },
  { id: '/activity', icon: '◉', label: 'Activity' },
  { id: '/settings', icon: '⚙', label: 'Settings' },
];

/* ---------------- MANAGER NAV ---------------- */

const managerNav = [
  { id: '/manager', icon: '◧', label: 'Overview' },
  { id: '/groups', icon: '◈', label: 'Managed Groups' },
  { id: '/analytics', icon: '◠', label: 'Engagement' },
  { id: '/activity', icon: '◉', label: 'Activity' },
];

/* ---------------- STUDENT NAV ---------------- */

const studentNav = [
  { id: '/student', icon: '◧', label: 'Dashboard' },
  { id: '/activity', icon: '◉', label: 'My Activity' },
  { id: '/analytics', icon: '◠', label: 'Performance' },
];

/* ---------------- ROLE CONFIG ---------------- */

const roleConfig = {
  admin: {
    title: 'Analytics',
    subtitle: 'Administrator',
    nav: adminNav,
  },

  manager: {
    title: 'Manager Panel',
    subtitle: 'Group Manager',
    nav: managerNav,
  },

  student: {
    title: 'Student Panel',
    subtitle: 'Student Access',
    nav: studentNav,
  },
};

export default function Sidebar({ user }) {
  const role = user?.role?.toLowerCase() || 'student';
  const currentRole = roleConfig[role] || roleConfig['student'];
  const navItems = currentRole.nav;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="mod-label">
          Module 7
        </div>

        <div className="mod-name">
          {currentRole.title}
        </div>

        <div className="mod-subtitle">
          {currentRole.subtitle}
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.id}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span className="nav-label">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="status-indicator" />

        <span>
          System Online
        </span>
      </div>
    </aside>
  );
}

