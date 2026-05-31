import { useState } from "react";

export default function UserForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      {/* MODAL BOX */}
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">

        <h2 className="text-lg font-bold mb-4 text-black">
          Create User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="w-full border p-2 text-black"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border p-2 text-black"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border p-2 text-black"
          />

          <select
            name="role"
            onChange={handleChange}
            className="w-full border p-2 text-black"
          >
            <option value="STUDENT">STUDENT</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <div className="flex justify-between pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border text-black"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Create
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}