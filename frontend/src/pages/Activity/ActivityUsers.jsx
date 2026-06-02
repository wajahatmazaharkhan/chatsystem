import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Search } from "lucide-react";

import { getUsers } from "../../services/userService";

export default function ActivityUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();

      setUsers(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Activity Monitoring
        </h1>

        <p className="text-slate-400 mt-2">
          Select a user to view activity logs
        </p>
      </div>

      {/* Search */}

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-4 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 outline-none"
        />
      </div>

      {/* User Table */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="p-4">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.user_id}
                className="border-b border-slate-800"
              >
                <td className="p-4">
                  {user.name}
                </td>

                <td>
                  {user.email}
                </td>

                <td>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                    {user.role}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/activity/${user.user_id}`
                      )
                    }
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    View Logs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}