
import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './routes/AppRoutes';
import { useEffect, useState } from 'react';
import { fetchUserInfo } from './services/authService';

import Sidebar from './components/Sidebar';

import './App.css';


function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <Sidebar user={user} />
      <div className="main">
        <div className="content">
          <AppRoutes user={user} />
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

