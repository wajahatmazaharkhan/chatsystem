import React, { useEffect, useState } from "react";
import { getAvailableBatches, enrollBatch } from "../../services/batchService";

export default function BatchSelection({ onEnrolled }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await getAvailableBatches();
      setBatches(res.data || []);
    } catch (err) {
      setError("Failed to load available batches. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedBatch) return;
    try {
      setEnrolling(true);
      setError("");
      await enrollBatch(selectedBatch);
      if (onEnrolled) {
        onEnrolled();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to enroll. Please try another batch.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-300">
        Loading available batches...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#1e293b] rounded-2xl border border-white/10 shadow-2xl max-w-lg mx-auto mt-10 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full top-0 left-0 pointer-events-none" />
      <div className="absolute w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full bottom-0 right-0 pointer-events-none" />

      <h2 className="text-3xl font-bold text-white mb-4 z-10">Select Your Batch</h2>
      <p className="text-gray-400 text-center mb-8 z-10">
        You are not enrolled in any batch yet. Please select an available batch to continue.
      </p>

      {error && (
        <div className="w-full mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 z-10 text-center">
          {error}
        </div>
      )}

      {batches.length === 0 ? (
        <div className="w-full text-center p-6 bg-white/5 rounded-xl border border-white/10 text-gray-400 z-10">
          No batches are currently available for enrollment.
        </div>
      ) : (
        <div className="w-full flex flex-col gap-6 z-10">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Available Batches
            </label>
            <div className="relative">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={enrolling}
                className="w-full appearance-none bg-[#0f172a] text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50 cursor-pointer"
              >
                <option value="" disabled>
                  -- Select a Batch --
                </option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} (Slots Left: {batch.limit - batch.enrolled_count})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={handleEnroll}
            disabled={!selectedBatch || enrolling}
            className="w-full py-3 px-4 rounded-xl text-lg font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling ? "Enrolling..." : "Enroll Now"}
          </button>
        </div>
      )}
    </div>
  );
}
