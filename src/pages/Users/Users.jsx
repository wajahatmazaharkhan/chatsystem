import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUserStatus,
} from "../../services/userService";

import UserTable from "./UserTable";
import UserForm from "./UserForm";
import UserFilters from "./UserFilters";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ role: "", is_active: "" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(filters);
      setUsers(data.items || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

//   const handleCreate = async (payload) => {
//   try {
//     console.log("Submitting user:", payload);

//     const res = await createUser(payload);

//     console.log("SUCCESS:", res);

//     setShowForm(false);
//     fetchUsers();

//   } catch (err) {
//     console.error("CREATE ERROR:", err.response?.data || err.message);

//     alert(
//       err.response?.data?.message ||
//       "Failed to create user (check console)"
//     );
//   }
// };

const handleCreate = async (payload) => {
  console.log("STEP 1: clicked");

  try {
    console.log("STEP 2: API call");

    await createUser(payload);

    console.log("STEP 3: success");

    setShowForm(false);

    console.log("STEP 4: modal closed");

  } catch (err) {
    console.log("STEP ERROR:", err);
  }
};

  const handleToggleStatus = async (id, currentStatus) => {
    await updateUserStatus(id, !currentStatus);
    fetchUsers();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add User
        </button>
      </div>

      <UserFilters setFilters={setFilters} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <UserTable
          users={users}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {showForm && (
        <UserForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}