import { useState } from "react";

import { assignManager } from "../../services/batchService";

export default function AssignManagerModal({ groupId,closeModal }) {

  const [manager, setManager] = useState("");

  async function submit() {
    try {
      await assignManager(groupId, manager);

      closeModal();

      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-slate-800 w-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Assign Manager
        </h2>

        <input
          placeholder="manager_001"
          value={manager}
          onChange={(e) =>
            setManager(e.target.value)
          }
          className="w-full border p-3 rounded-lg"
        />

        <div className="flex gap-4 mt-6">
          <button
            onClick={submit}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Save
          </button>

          <button onClick={closeModal}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}