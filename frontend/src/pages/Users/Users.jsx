import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUserStatus,
  updateUser,
} from "../../services/userService";
import { getAllGroups } from "../../services/groupService";

import UserTable from "./UserTable";
import UserForm from "./UserForm";
import UserFilters from "./UserFilters";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });

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

  const fetchGroups = async () => {
    try {
      const res = await getAllGroups();
      const groupItems = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.groups || []);
      setGroups(groupItems);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSubmitForm = async (payload) => {
    try {
      if (userToEdit) {
        await updateUser(userToEdit.user_id, payload);
      } else {
        await createUser(payload);
      }
      setShowForm(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (err) {
      console.error("Submit user error:", err);
      alert(err.response?.data?.message || err.message || "Failed to submit user details.");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus =
      currentStatus === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    await updateUserStatus(id, nextStatus);
    fetchUsers();
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setUserToEdit(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>

        <button
          onClick={() => {
            setUserToEdit(null);
            setShowForm(true);
          }}
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
          onEdit={handleEditClick}
        />
      )}

      {showForm && (
        <UserForm
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          userToEdit={userToEdit}
          users={users}
          groups={groups}
        />
      )}
    </div>
  );
}