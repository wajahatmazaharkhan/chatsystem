import { useState, useEffect } from "react";
import { getHierarchyLevel } from "../../utils/rbac";

export default function UserForm({ onClose, onSubmit, userToEdit = null, users = [], groups = [] }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    roleType: "NON_PUBLISHING",
    phone: "",
    contactDetails: "",
    parentUser: "",
    managedGroups: [],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (userToEdit) {
      setForm({
        name: userToEdit.name || "",
        email: userToEdit.email || "",
        password: "", // do not populate password on edit
        role: userToEdit.role || "STUDENT",
        roleType: userToEdit.roleType || "NON_PUBLISHING",
        phone: userToEdit.phone || "",
        contactDetails: userToEdit.contactDetails || "",
        parentUser: userToEdit.parentUser?.user_id || userToEdit.parentUser || "",
        managedGroups: userToEdit.managedGroups?.map(g => g.group_id || g) || [],
      });
    }
  }, [userToEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || (!userToEdit && !form.password) || !form.role) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.role === "HEAD_HR" && !form.roleType) {
      setError("Head HR subtype (Publishing or Non-Publishing) is required.");
      return;
    }

    if (form.role === "GROUP_MANAGER") {
      if (form.managedGroups.length < 1 || form.managedGroups.length > 3) {
        setError("Group Manager must manage between 1 and 3 groups.");
        return;
      }
    }

    // Filter parent user validation on client side
    if (form.parentUser) {
      const parentUserObj = users.find(u => (u.user_id === form.parentUser || u._id === form.parentUser));
      if (parentUserObj) {
        const parentLevel = getHierarchyLevel(parentUserObj.role);
        const targetLevel = getHierarchyLevel(form.role);
        if (parentLevel >= targetLevel) {
          setError(`Parent user must be higher in hierarchy than the selected role.`);
          return;
        }
      }
    }

    // Submit payload
    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      phone: form.phone || null,
      contactDetails: form.contactDetails || null,
      parentUser: form.parentUser || null,
      managedGroups: form.role === "GROUP_MANAGER" ? form.managedGroups : [],
    };

    if (form.role === "HEAD_HR") {
      payload.roleType = form.roleType;
    }

    if (form.password) {
      payload.password = form.password;
    }

    onSubmit(payload);
  };

  // Filter possible parents based on hierarchy level of the selected role
  const selectedRoleLevel = getHierarchyLevel(form.role);
  const parentOptions = users.filter(u => {
    // Exclude currently edited user from parent options to prevent self-reference loops
    const matchesCurrent = userToEdit && (u.user_id === userToEdit.user_id || u._id === userToEdit.user_id);
    if (matchesCurrent) return false;
    return getHierarchyLevel(u.role) < selectedRoleLevel;
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* MODAL BOX */}
      <div className="bg-white p-6 rounded-lg w-[420px] max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-black border-b pb-2">
          {userToEdit ? "Edit User" : "Create User"}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Name *</label>
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 text-black rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Email *</label>
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 text-black rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Password {userToEdit ? "(leave blank to keep current)" : "*"}
            </label>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-2 text-black rounded"
              required={!userToEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Role *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border p-2 text-black rounded"
            >
              <option value="STUDENT">STUDENT</option>
              <option value="SUB_GROUP_MANAGER">SUB_GROUP_MANAGER</option>
              <option value="GROUP_MANAGER">GROUP_MANAGER</option>
              <option value="HEAD_HR">HEAD_HR</option>
              <option value="SUB_ADMIN">SUB_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {form.role === "HEAD_HR" && (
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Head HR Subtype *</label>
              <select
                name="roleType"
                value={form.roleType}
                onChange={handleChange}
                className="w-full border p-2 text-black rounded"
              >
                <option value="PUBLISHING">Publishing</option>
                <option value="NON_PUBLISHING">Non-Publishing</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Phone</label>
            <input
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              className="w-full border p-2 text-black rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Contact Details</label>
            <textarea
              name="contactDetails"
              placeholder="Skype, Address, Notes etc."
              value={form.contactDetails}
              onChange={handleChange}
              className="w-full border p-2 text-black rounded h-16 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Parent User</label>
            <select
              name="parentUser"
              value={form.parentUser}
              onChange={handleChange}
              className="w-full border p-2 text-black rounded"
            >
              <option value="">No Parent User</option>
              {parentOptions.map(u => (
                <option key={u.user_id || u._id} value={u.user_id || u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {form.role === "GROUP_MANAGER" && (
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-black">
                Managed Groups * (Select 1 to 3)
              </label>
              <div className="max-h-32 overflow-y-auto border p-2 rounded text-black space-y-1">
                {groups.length === 0 ? (
                  <p className="text-gray-500 text-xs p-1">No groups available. Please create groups first.</p>
                ) : (
                  groups.map(group => {
                    const groupId = group._id || group.id;
                    const isChecked = form.managedGroups.includes(groupId);
                    return (
                      <label key={groupId} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let nextGroups = [...form.managedGroups];
                            if (e.target.checked) {
                              nextGroups.push(groupId);
                            } else {
                              nextGroups = nextGroups.filter(id => id !== groupId);
                            }
                            setForm({ ...form, managedGroups: nextGroups });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{group.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border text-black hover:bg-gray-100 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
            >
              {userToEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}