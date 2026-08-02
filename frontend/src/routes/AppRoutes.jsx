import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/auth/Login";

import BatchCreate from "../pages/BatchCreate";
import BatchList from "../pages/BatchList";
import BatchDetails from "../pages/BatchDetails";
import StudentBatches from "../pages/Analytics/StudentBatches";

import GroupList from "../pages/GroupList";
import GroupDetails from "../pages/GroupDetails";
import Users from "../pages/Users/Users";
import StudentDashboard from "../pages/Analytics/StudentDashboard";
import ManagerDashboard from "../pages/Analytics/ManagerDashboard";
import AdminDashboard from "../pages/Analytics/AdminDashboard";
import ActivityUsers from "../pages/Activity/ActivityUsers";
import UserActivityLogs from "../pages/Activity/UserActivityLogs";

function DashboardResolver() {
  const { user } = useAuth();

  switch (user?.role?.toUpperCase()) {
    case "MANAGER":
      return <ManagerDashboard />;

    case "STUDENT":
      return <StudentDashboard />;

    default:
      return <AdminDashboard />;
  }
}

import GroupChatDashboard from "../pages/GroupChatDashboard";
import ActivityMonitoring from "../pages/Activity/ActivityMonitoring";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard/analytics" element={<DashboardResolver />} />

          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/batches/create"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <BatchCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/batches"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <BatchList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/batches/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <BatchDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/student-batches"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentBatches />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/groups"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <GroupList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/groups/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <GroupDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/activity"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ActivityUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/activity/:userId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserActivityLogs />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/dashboard/activity-monitoring"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ActivityMonitoring />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/chat"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "STUDENT"]}>
                <GroupChatDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
