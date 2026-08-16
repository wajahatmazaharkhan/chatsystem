import { useState } from "react";
import { updateUserMarks } from "../../services/userService";
import { X } from "lucide-react";

export default function UpdateMarksModal({ student, onClose, onSuccess }) {
  const [marks, setMarks] = useState(student.marks != null ? student.marks : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const parsedMarks = parseInt(marks, 10);
      if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
        throw new Error("Marks must be between 0 and 100.");
      }

      await updateUserMarks(student.user_id, parsedMarks);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update marks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">
          Update Marks
        </h2>
        
        <p className="text-slate-400 mb-6 text-sm">
          Editing marks for <span className="font-semibold text-white">{student.name}</span>. 
          Marks will automatically be converted to a star ranking.
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Marks (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 85"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Marks"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
