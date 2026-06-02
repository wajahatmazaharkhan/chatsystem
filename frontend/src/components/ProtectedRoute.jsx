import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const roleUpper = user.role?.toUpperCase();
    const allowedUpper = allowedRoles.map(r => r.toUpperCase());
    if (!allowedUpper.includes(roleUpper)) {
      return <Navigate to="/dashboard/analytics" replace />;
    }
  }

  return children;
}
