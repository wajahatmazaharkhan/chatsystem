import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";

import Login from "../pages/auth/Login";

import BatchCreate from "../pages/BatchCreate";
import BatchList from "../pages/BatchList";
import BatchDetails from "../pages/BatchDetails";

import GroupList from "../pages/GroupList";
import GroupDetails from "../pages/GroupDetails";
import Users from "../pages/Users/Users";
import StudentDashboard from "../pages/Analytics/StudentDashboard";
import AdminDashboard from "../pages/Analytics/AdminDashboard";
import ActivityUsers from "../pages/Activity/ActivityUsers";
import UserActivityLogs from "../pages/Activity/UserActivityLogs";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Route */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout />
          }
        >
          <Route
            path="/dashboard/analytics"
            element={<AdminDashboard />}
          />

          <Route
            path="/dashboard/users"
            element={<Users />}
          />

          <Route
            path="/dashboard/batches/create"
            element={<BatchCreate />}
          />

          <Route
            path="/dashboard/batches"
            element={<BatchList />}
          />

          <Route
            path="/dashboard/batches/:id"
            element={<BatchDetails />}
          />

          <Route
            path="/dashboard/groups"
            element={<GroupList />}
          />

          <Route
            path="/dashboard/groups/:id"
            element={<GroupDetails />}
          />

          <Route
            path="/dashboard/activity"
            element={<ActivityUsers />}
          />

          <Route
            path="/dashboard/activity/:userId"
            element={<UserActivityLogs />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}