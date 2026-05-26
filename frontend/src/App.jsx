import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AppRoutes from './routes/AppRoutes';
import Notification from './components/Notification';
import { statusService } from './services/statusService';
import './App.css';

const VIEW_TITLES = {
  '/user-status': 'User Status — Active/Inactive Classification',
  '/group-status': 'Group Status — Aggregated Classification',
  '/api-test': 'API Endpoints — Integration Reference',
};

function AppContent() {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [thresholdDays, setThresholdDays] = useState(3);
  const [thresholdVal, setThresholdVal] = useState('3');
  const [thresholdUnit, setThresholdUnit] = useState('days');
  const [lastFetched, setLastFetched] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  const showNotif = useCallback((msg) => setNotification(msg), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await statusService.fetchAllStatuses();
      const mapped = (data.users || []).map((u) => ({
        user_id: u.user_id,
        name: u.name || 'Unknown',
        group_id: u.group_id,
        group_name: u.group_id || 'Unknown Group',
        last_active: u.last_active || new Date().toISOString(),
        days_inactive: u.days_inactive ?? 0,
        status: u.status,
      }));
      setUsers(mapped);
      setThresholdDays(data.threshold_days || 3);
      setLastFetched('Fetched ' + new Date().toLocaleTimeString());
      showNotif('Data refreshed');
    } catch (err) {
      console.error('Failed to load data:', err);
      showNotif('Error loading data — check server connection');
    } finally {
      setLoading(false);
    }
  }, [showNotif]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApply = async () => {
    let days = parseFloat(thresholdVal) || 3;
    if (thresholdUnit === 'hours') days = days / 24;

    try {
      await statusService.classifyUsers(days);
      showNotif('Classification triggered');
      await loadData();
    } catch (err) {
      console.error(err);
      showNotif('Error triggering classification');
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar
          title={VIEW_TITLES[location.pathname] || 'Classification Engine'}
          lastFetched={lastFetched}
          thresholdVal={thresholdVal}
          thresholdUnit={thresholdUnit}
          onThresholdValChange={setThresholdVal}
          onThresholdUnitChange={setThresholdUnit}
          onApply={handleApply}
        />
        <div className="content">
          <AppRoutes 
            users={users} 
            thresholdDays={thresholdDays} 
            onRefresh={loadData} 
            loading={loading} 
          />
        </div>
      </div>

      <Notification message={notification} onDismiss={() => setNotification('')} />
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
