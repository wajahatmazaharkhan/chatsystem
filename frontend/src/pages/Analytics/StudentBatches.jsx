import React, { useEffect, useState } from 'react';
import './StudentDashboard.css';
import { getEnrolledBatches, getAvailableBatches, enrollBatch } from '../../services/batchService';

export default function StudentBatches() {
  const [enrolledBatches, setEnrolledBatches] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const loadBatchesData = async () => {
    try {
      setLoading(true);
      const batchesRes = await getEnrolledBatches();
      setEnrolledBatches(batchesRes.data || []);
      
      const availRes = await getAvailableBatches();
      setAvailableBatches(availRes.data || []);
    } catch (error) {
      console.error("Failed to load batches data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatchesData();
  }, []);

  const handleEnroll = async (batchId) => {
    try {
      setEnrolling(true);
      setEnrollError("");
      await enrollBatch(batchId);
      await loadBatchesData();
    } catch (err) {
      setEnrollError(err.response?.data?.error || "Failed to enroll. Please try another batch.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-300">Loading batches...</div>;
  }

  return (
    <div className="student-dashboard">
      <div className="student-header">
        <div>
          <h1>My Batches</h1>
          <p>View your enrolled batches and discover new ones</p>
        </div>
      </div>

      <div className="student-panel" style={{ marginTop: '20px' }}>
        
        {enrollError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
            {enrollError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ENROLLED BATCHES */}
          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Enrolled Batches</h3>
            {enrolledBatches.length === 0 ? (
              <div className="text-gray-500 text-sm p-4 bg-white/5 rounded-xl border border-white/10">No enrolled batches yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {enrolledBatches.map(b => (
                  <div key={b._id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div>
                      <div className="text-white font-medium">{b.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{b.description || 'Enrolled in this batch'}</div>
                    </div>
                    <div className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                      Enrolled
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AVAILABLE BATCHES */}
          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Available Batches</h3>
            {availableBatches.length === 0 ? (
              <div className="text-gray-500 text-sm p-4 bg-white/5 rounded-xl border border-white/10">No available batches right now.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {availableBatches.map(b => (
                  <div key={b._id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div>
                      <div className="text-white font-medium">{b.name}</div>
                      <div className="text-xs text-gray-400 mt-1">Slots left: {b.limit - b.enrolled_count}</div>
                    </div>
                    <button 
                      onClick={() => handleEnroll(b._id)}
                      disabled={enrolling}
                      className="text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                    >
                      {enrolling ? "..." : "Enroll"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
