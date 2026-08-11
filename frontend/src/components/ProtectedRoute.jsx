import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredPermission, allowedRoles }) {
  const { user, hasPermission, hasRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      return <Navigate to="/dashboard/analytics" replace />;
    }
  }

  if (allowedRoles) {
    const hasAnyRole = allowedRoles.some(r => hasRole(r));
    if (!hasAnyRole) {
      return <Navigate to="/dashboard/analytics" replace />;
    }
  }

  return children;
}
