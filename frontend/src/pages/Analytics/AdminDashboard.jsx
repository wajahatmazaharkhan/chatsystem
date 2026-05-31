import React, { useEffect, useState } from 'react';
import StatCards from '../../components/StatCards';
import UserManagementTable from '../../components/UserManagementTable';
import { fetchAdminStats, fetchUsers } from '../../services/analyticsService';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ total: 0, students: 0, managers: 0, admins: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchUsers()])
      .then(([statsData, usersData]) => {
        setStats({
          total: statsData.total_users || 0,
          students: statsData.students_count || 0,
          managers: statsData.managers_count || 0,
          admins: statsData.admins_count || 0
        });
        setUsers(usersData || []);
      })
      .catch(err => console.error("Failed to load admin data", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 bg-[#1a1a1c] min-h-screen text-gray-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back, {user?.name || 'Administrator'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <StatCards stats={stats} />
        <div className="w-full space-y-6">
          <UserManagementTable users={users} loading={loading} />
        </div>
      </div>
    </div>
  );
}
