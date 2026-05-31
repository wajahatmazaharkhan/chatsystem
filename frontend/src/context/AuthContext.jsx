import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Mock user state. Change role to 'Manager' or 'Student' to test RBAC
  const [user, setUser] = useState({
    id: 1,
    name: 'Admin User',
    email: 'admin@cohort.io',
    role: 'Admin', // Roles: Admin, Manager, Student
  });

  const value = {
    user,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
