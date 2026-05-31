import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/Analytics/AdminDashboard';
import ManagerDashboard from '../pages/Analytics/ManagerDashboard';
import StudentDashboard from '../pages/Analytics/StudentDashboard';

export default function AppRoutes({ user }) {
  // Decide which dashboard to show based on user.role
  let DashboardComponent = AdminDashboard; // Default to admin for now
  if (user?.role === 'MANAGER') DashboardComponent = ManagerDashboard;
  if (user?.role === 'STUDENT') DashboardComponent = StudentDashboard;

  return (
    <Routes>
      <Route path="/" element={<DashboardComponent user={user} />} />
      
      {/* Protected Routes */}
      <Route 
        path="/admin" 
        element={user?.role === 'ADMIN' ? <AdminDashboard user={user} /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/manager" 
        element={user?.role === 'MANAGER' ? <ManagerDashboard user={user} /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/student" 
        element={user?.role === 'STUDENT' ? <StudentDashboard user={user} /> : <Navigate to="/" replace />} 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
