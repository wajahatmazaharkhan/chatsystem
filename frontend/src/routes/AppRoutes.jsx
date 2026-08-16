import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";

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
  const role = user?.role?.toUpperCase();

  if (role === "STUDENT") {
    return <StudentDashboard />;
  } else if (role === "MANAGER" || role === "GROUP_MANAGER" || role === "SUB_GROUP_MANAGER") {
    return <ManagerDashboard />;
  } else {
    return <AdminDashboard />;
  }
}

import GroupChatDashboard from "../pages/GroupChatDashboard";
import ActivityMonitoring from "../pages/Activity/ActivityMonitoring";
import Leaderboard from "../pages/Ranking/Leaderboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

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
              <ProtectedRoute requiredPermission="VIEW_USERS" allowedRoles={["ADMIN"]}>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/batches/create"
            element={
              <ProtectedRoute requiredPermission="ASSIGN_GROUPS" allowedRoles={["ADMIN"]}>
                <BatchCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/batches"
            element={
              <ProtectedRoute requiredPermission="ASSIGN_GROUPS" allowedRoles={["ADMIN"]}>
                <BatchList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/batches/:id"
            element={
              <ProtectedRoute requiredPermission="ASSIGN_GROUPS" allowedRoles={["ADMIN"]}>
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
              <ProtectedRoute requiredPermission="MANAGE_GROUPS" allowedRoles={["ADMIN", "MANAGER", "GROUP_MANAGER"]}>
                <GroupList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/groups/:id"
            element={
              <ProtectedRoute requiredPermission="MANAGE_GROUPS" allowedRoles={["ADMIN", "MANAGER", "GROUP_MANAGER"]}>
                <GroupDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/activity"
            element={
              <ProtectedRoute requiredPermission="VIEW_USERS" allowedRoles={["ADMIN"]}>
                <ActivityUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/activity/:userId"
            element={
              <ProtectedRoute requiredPermission="VIEW_USERS" allowedRoles={["ADMIN"]}>
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
              <ProtectedRoute allowedRoles={["ADMIN", "SUB_ADMIN", "HEAD_HR", "MANAGER", "GROUP_MANAGER", "SUB_GROUP_MANAGER", "STUDENT"]}>
                <GroupChatDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/ranking"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "STUDENT"]}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
