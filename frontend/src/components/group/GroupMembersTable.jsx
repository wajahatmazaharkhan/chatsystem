import { useNavigate } from "react-router-dom";

export default function GroupMembersTable({ groups }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4">Group</th>
            <th className="p-4">Members</th>
            <th className="p-4">Manager</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {groups.map((group) => (
            <tr key={group._id} className="border-b">
              <td className="p-4">{group.name}</td>

              <td className="text-center">
                {group.members.length}
              </td>

              <td className="text-center">
                {group.manager_name
                  ? group.manager_name
                  : group.manager_id
                  ? group.manager_id
                  : "Not Assigned"}
              </td>

              <td className="text-center">
                <button
                  onClick={() =>
                    navigate(`/groups/${group._id}`)
                  }
                  className="text-blue-700 font-semibold"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}