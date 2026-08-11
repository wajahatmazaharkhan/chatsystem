import React from "react";
import { useAuth } from "../../context/AuthContext";

const UserTable = ({ users = [], onToggleStatus, onEdit }) => {
  const { hasPermission } = useAuth();

  if (!users.length) {
    return (
      <div className="bg-slate-800 rounded-xl p-6">
        <p className="text-gray-400">
          No users found. Create a user first.
        </p>
      </div>
    );
  }

  const formatRole = (role, roleType) => {
    const r = role?.toUpperCase();
    if (r === 'HEAD_HR') {
      const typeStr = roleType ? ` (${roleType === 'PUBLISHING' ? 'Publishing' : 'Non-Publishing'})` : '';
      return `Head HR${typeStr}`;
    }
    if (r === 'GROUP_MANAGER') return 'Group Manager';
    if (r === 'SUB_GROUP_MANAGER') return 'Sub Group Manager';
    return role;
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-700 text-gray-300 border-b border-slate-600">
          <tr>
            <th className="p-4 text-left font-semibold">Name</th>
            <th className="p-4 text-left font-semibold">Email</th>
            <th className="p-4 text-left font-semibold">Role / Level</th>
            <th className="p-4 text-left font-semibold">Contact Info</th>
            <th className="p-4 text-left font-semibold">Hierarchy (Parent / Creator)</th>
            <th className="p-4 text-left font-semibold">Managed Groups</th>
            <th className="p-4 text-center font-semibold">Status</th>
            <th className="p-4 text-center font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="text-gray-200">
          {users.map((user) => {
            const roleName = formatRole(user.role, user.roleType);
            const parentName = user.parentUser?.name || user.parentUser || "—";
            const creatorName = user.createdBy?.name || user.createdBy || "—";

            let groupList = "—";
            if (user.managedGroups && Array.isArray(user.managedGroups)) {
              if (user.managedGroups.length > 0) {
                groupList = user.managedGroups.map(g => g.name || g).join(", ");
              }
            }

            return (
              <tr
                key={user.user_id}
                className="border-b border-slate-700 hover:bg-slate-700/30 transition text-sm"
              >
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <div className="font-semibold">{roleName}</div>
                  <div className="text-xs text-indigo-400">Level {user.hierarchyLevel || "—"}</div>
                </td>
                <td className="p-4">
                  {user.phone ? (
                    <div className="space-y-0.5">
                      <div className="font-medium text-xs">📞 {user.phone}</div>
                      {user.contactDetails && <div className="text-[10px] text-gray-400 italic">📝 {user.contactDetails}</div>}
                    </div>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-xs space-y-0.5">
                    <div><span className="text-gray-400">Parent:</span> {parentName}</div>
                    <div><span className="text-gray-400">Creator:</span> {creatorName}</div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">{groupList}</td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === "ACTIVE"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3">
                    {hasPermission("EDIT_USERS") && (
                      <button
                        onClick={() => onEdit(user)}
                        className="text-blue-400 hover:text-blue-300 font-semibold text-xs"
                      >
                        Edit
                      </button>
                    )}
                    {hasPermission("EDIT_USERS") && (
                      <button
                        onClick={() =>
                          onToggleStatus(
                            user.user_id,
                            user.status === "ACTIVE"
                          )
                        }
                        className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs"
                      >
                        Toggle
                      </button>
                    )}
                    {!hasPermission("EDIT_USERS") && (
                      <span className="text-gray-500 text-xs">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;