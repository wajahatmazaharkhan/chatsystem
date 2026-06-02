import { useState } from "react";

export default function UserFilters({ setFilters }) {
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const applyFilters = () => {
  setFilters({
    role,
    is_active: status === "" ? "" : status === "true",
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
        <option value="MANAGER">MANAGER</option>
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
        <option value="true">ACTIVE</option>
        <option value="false">INACTIVE</option>
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