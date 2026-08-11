import { useState } from "react";

export default function UserFilters({ setFilters }) {
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const applyFilters = () => {
  setFilters({
  role,
  status,
});
};

  return (
    <div className="flex gap-4 items-center">
      
      {/* <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2"
      > */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 bg-white text-black rounded"
      >
        <option value="">All Roles</option>
        <option value="ADMIN">ADMIN</option>
        <option value="SUB_ADMIN">SUB_ADMIN</option>
        <option value="HEAD_HR">HEAD_HR</option>
        <option value="GROUP_MANAGER">GROUP_MANAGER</option>
        <option value="SUB_GROUP_MANAGER">SUB_GROUP_MANAGER</option>
        <option value="STUDENT">STUDENT</option>
      </select>

      {/* <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border p-2"
      > */}
      <select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="border p-2 bg-white text-black rounded"
>
       <option value="">All Status</option>
<option value="ACTIVE">ACTIVE</option>
<option value="INACTIVE">INACTIVE</option>
      </select>

      <button
        onClick={applyFilters}
        className="bg-black text-white px-3 py-2"
      >
        Apply
      </button>
    </div>
  );
}