import React from "react";

const UserTable = ({ users = [], onToggleStatus }) => {
  if (!users.length) {
    return (
      <div className="bg-slate-800 rounded-xl p-6">
        <p className="text-gray-400">
          No users found. Create a user first.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-700">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-center">Role</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr
              key={user.user_id}
              className="border-b border-slate-700 hover:bg-slate-700/30 transition"
            >
              <td className="p-4">
                {user.name}
              </td>

              <td className="p-4">
                {user.email}
              </td>

              <td className="text-center">
                {user.role}
              </td>

              <td className="text-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.status === "ACTIVE"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {user.status}
                </span>
              </td>

              <td className="text-center">
                <button
                  onClick={() =>
                    onToggleStatus(
                      user.user_id,
                      user.status === "ACTIVE"
                    )
                  }
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;