import { Routes, Route, Navigate } from 'react-router-dom';
import UserStatusPage from '../pages/UserStatusPage';
import GroupStatusPage from '../pages/GroupStatusPage';
import ApiTestPage from '../pages/ApiTestPage';

export default function AppRoutes({ users, thresholdDays, onRefresh, loading }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/user-status" replace />} />
      <Route 
        path="/user-status" 
        element={
          <UserStatusPage 
            users={users} 
            thresholdDays={thresholdDays} 
            onRefresh={onRefresh} 
            loading={loading} 
          />
        } 
      />
      <Route 
        path="/group-status" 
        element={<GroupStatusPage users={users} onRefresh={onRefresh} />} 
      />
      <Route 
        path="/api-test" 
        element={<ApiTestPage users={users} />} 
      />
    </Routes>
  );
}
