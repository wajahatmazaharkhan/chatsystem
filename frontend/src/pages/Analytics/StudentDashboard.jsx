
import React, { useEffect, useState } from "react";
import StatCards from "../../components/StatCards";
import UserManagementTable from "../../components/UserManagementTable";
import { fetchAdminStats, fetchUsers } from "../../services/analyticsService";

export default function StudentDashboard({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    managers: 0,
    admins: 0,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchUsers()])
      .then(([statsData, usersData]) => {
        setStats({
          total: statsData.total_users || 0,
          students: statsData.students_count || 0,
          managers: statsData.managers_count || 0,
          admins: statsData.admins_count || 0,
        });

        setUsers(usersData.items || []);
      })
      .catch((err) => console.error("Failed to load student dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen px-8 py-6 text-white bg-slate-950">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Student Analytics
          </h1>

          <p className="text-slate-400 mt-1 text-sm">
            Welcome back, {user?.name || "Student"} 👋
          </p>
        </div>

        <div className="px-4 py-2 rounded-full text-xs font-bold tracking-widest
          bg-blue-500/10 text-blue-300 border border-blue-500/20">
          ACTIVE LEARNER
        </div>
      </div>

      {/* STATS */}
      <div className="mb-6">
        <StatCards stats={stats} />
      </div>

      {/* TABLE SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <UserManagementTable users={users} loading={loading} />
      </div>

    </div>
  );
}