import React from "react";

const UserTable = ({ users = [], onToggleStatus }) => {
 if (!users.length) {
  return (
    <p className="text-gray-500">
      No users found. Create a user first.
    </p>
  );
}

  return (
    <table border="1" width="100%" cellPadding="10">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          <tr key={user.user_id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.status}</td>
            <td>
              <button
                onClick={() =>
                  onToggleStatus(
  user.user_id,
  user.status === "ACTIVE" ? false : true
)
                }
              >
                Toggle
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;