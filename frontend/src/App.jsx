import { BrowserRouter, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const VIEW_TITLES = {
  '/': 'Analytics Dashboard',
  '/groups': 'Groups',
  '/analytics': 'Analytics',
  '/activity': 'Activity',
  '/settings': 'Settings',
};

function AppContent() {
  const location = useLocation();

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar title={VIEW_TITLES[location.pathname] || 'Analytics Dashboard'} />
        <div className="content">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
