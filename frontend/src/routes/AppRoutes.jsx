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

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Route */}
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
          path="/"
          element={
            <DashboardLayout />
          }
        >
          <Route
            path="/analytics"
            element={<AdminDashboard />}
          />

          <Route
            path="/users"
            element={<Users />}
          />

          <Route
            path="batches/create"
            element={<BatchCreate />}
          />

          <Route
            path="batches"
            element={<BatchList />}
          />

          <Route
            path="batches/:id"
            element={<BatchDetails />}
          />

          <Route
            path="groups"
            element={<GroupList />}
          />

          <Route
            path="groups/:id"
            element={<GroupDetails />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}