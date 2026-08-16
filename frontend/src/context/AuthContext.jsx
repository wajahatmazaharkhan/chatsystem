import { createContext, useContext, useState } from 'react';
import { getHierarchyLevel, getDefaultPermissions, canAccess as rbacCanAccess } from '../utils/rbac';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const roleUpper = user.role?.toUpperCase();
    if (roleUpper === 'ADMIN') return true;

    const userPermissions = user.permissions && user.permissions.length > 0
      ? user.permissions
      : getDefaultPermissions(user.role, user.roleType);

    return userPermissions.includes(permission);
  };

  const hasRole = (roleName) => {
    if (!user) return false;
    const rUpper = roleName?.toUpperCase();
    const userRoleUpper = user.role?.toUpperCase();

    if (rUpper === 'MANAGER' || rUpper === 'GROUP_MANAGER') {
      return ['MANAGER', 'GROUP_MANAGER'].includes(userRoleUpper);
    }
    if (rUpper === 'ADMIN' || rUpper === 'SUB_ADMIN') {
      return ['ADMIN', 'SUB_ADMIN'].includes(userRoleUpper);
    }
    return userRoleUpper === rUpper;
  };

  const checkAccess = (targetResource) => {
    return rbacCanAccess(user, targetResource);
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    hasPermission,
    hasRole,
    canAccess: checkAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
