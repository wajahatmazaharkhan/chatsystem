import React, { useState } from "react";
import { createBatch } from "../services/batchService";
import { calculateGroups } from "../utils/groupCalculator";

export default function BatchCreate() {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const groups = limit ? calculateGroups(Number(limit)) : [];

  const submit = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (!name.trim() || !limit || Number(limit) <= 0) {
      setErrorMsg("Please provide a valid batch name and limit.");
      setLoading(false);
      return;
    }
    try {
      await createBatch({
        name: name.trim(),
        limit: Number(limit),
      });

      setSuccessMsg("Batch created successfully");
      setName("");
      setLimit("");
    } catch (err) {
      
        setErrorMsg("Failed to create batch. Please try another name.");
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Create Batch</h1>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

      <input
        placeholder="Batch Name"
        className="border w-full p-4 rounded bg-transparent"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />

      {/* Batch Limit */}
      <input
        type="number"
        min="1"
        max="300"
        placeholder="Max Students Limit"
        className="border w-full p-4 rounded mt-4 bg-transparent"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
      />

      {/* Groups */}
      <div className="mt-8 bg-slate-800 p-6 rounded">
        <h2>Expected Groups</h2>
        <div>{groups.length}</div>
      </div>

      <button
        className="mt-8 bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
        onClick={submit}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Batch"}
      </button>
    </div>
  );
}