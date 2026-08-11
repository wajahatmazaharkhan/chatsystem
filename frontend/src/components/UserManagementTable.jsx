import React, { useState } from 'react';

const getRoleColor = (role) => {
  switch (role) {
    case 'Admin': return 'bg-[#a78bfa]/20 text-[#c4b5fd]';
    case 'Manager': return 'bg-[#6ee7b7]/20 text-[#a7f3d0]';
    case 'Student': return 'bg-[#4fa4ff]/20 text-[#93c5fd]';
    default: return 'bg-gray-700 text-gray-300';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'border-green-500/30 text-green-400 bg-green-500/10';
    case 'Inactive': return 'border-red-500/30 text-red-400 bg-red-500/10';
    case 'Suspended': return 'border-orange-500/30 text-orange-400 bg-orange-500/10';
    default: return 'border-gray-500/30 text-gray-400 bg-gray-500/10';
  }
};

export default function UserManagementTable({ users = [], loading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [statusFilter, setStatusFilter] = useState('All status');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'All roles' || u.role === roleFilter || (roleFilter === 'Admin' && u.role === 'ADMIN') || (roleFilter === 'Manager' && u.role === 'MANAGER') || (roleFilter === 'Student' && u.role === 'STUDENT');
    
    const uStatusStr =
    //  u.status ? (u.status === 'ACTIVE' ? 'Active' : 'Inactive') : (u.is_active ? 'Active' : 'Inactive');
    u.status === "ACTIVE" ? "Active" : "Inactive";
    const matchesStatus = statusFilter === 'All status' || uStatusStr === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="bg-[#242528] rounded-xl border border-gray-700/50 p-6">
      <div className="flex justify-between items-center mb-6">
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="bg-[#1a1a1c] border border-gray-700 rounded-md px-4 py-2 text-sm text-gray-200 placeholder-gray-500 w-64 focus:outline-none focus:border-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex space-x-3">
          <select 
            className="bg-[#1a1a1c] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>All roles</option>
            <option>Admin</option>
            <option>Manager</option>
            <option>Student</option>
          </select>
          <select 
            className="bg-[#1a1a1c] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
          <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
            + Add user
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700/50 text-gray-400 text-sm font-medium">
              <th className="py-3 px-4 font-normal">Name</th>
              <th className="py-3 px-4 font-normal">Email</th>
              <th className="py-3 px-4 font-normal">Role</th>
              <th className="py-3 px-4 font-normal">Batch</th>
              <th className="py-3 px-4 font-normal">Last login</th>
              <th className="py-3 px-4 font-normal">Status</th>
              <th className="py-3 px-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td colSpan="7" className="py-4 text-center text-gray-500">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="7" className="py-4 text-center text-gray-500">No users found.</td></tr>
) : filteredUsers.map((u, index) => {
              const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
              const statusStr = u.status ? (u.status === 'ACTIVE' ? 'Active' : 'Inactive') : (u.is_active ? 'Active' : 'Inactive');
              return (
              <tr key={u.user_id || u._id || u.id || index} className="border-b border-gray-700/30 hover:bg-[#2a2b2f] transition-colors">
                <td className="py-3 px-4 flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getRoleColor(u.role)}`}>
                    {initials}
                  </div>
                  <span className="font-medium text-gray-200">{u.name}</span>
                </td>
                <td className="py-3 px-4 text-gray-400">{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">{u.batch || '—'}</td>
                <td className="py-3 px-4 text-gray-400">
                  {u.last_login ? new Date(u.last_login).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never'}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(statusStr)}`}>
                    {statusStr}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-[#4fa4ff] hover:text-[#93c5fd] font-medium transition-colors">Edit</button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-gray-500 text-sm flex justify-between items-center">
        <span>Showing 5 of 500</span>
        <button className="text-[#4fa4ff] hover:text-[#93c5fd] font-medium transition-colors">Next page</button>
      </div>
    </div>
  );
}
