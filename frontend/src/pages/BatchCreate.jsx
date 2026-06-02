import React, { useState } from "react";
import { createBatch } from "../services/batchService";
import { calculateGroups } from "../utils/groupCalculator";
import { useEffect } from "react";
import { getUsers } from "../services/userService";

export default function BatchCreate() {
  const [name, setName] = useState("");
  const [studentIds, setStudentIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);


const fetchStudents = async () => {
  try {
    const data = await getUsers();

    const studentList = data.items
      .filter(
        (user) =>
          user.role === "STUDENT" &&
          user.is_active
      )
      .map((user) => ({
        id: user.user_id,
        name: user.name,
        email: user.email,
      }));

    setStudents(studentList);
  } catch (error) {
    console.error(
      "Failed to load students",
      error
    );
  }
};

useEffect(() => {
    fetchStudents();
  }, []);
  const groups = calculateGroups(studentIds.length);

  const toggleStudent = (id) => {
    setStudentIds((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    );
  };

  const submit = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await createBatch({
        name: name.trim(),
        student_ids: studentIds,
      });

      setSuccessMsg("Batch created successfully");
      setName("");
      setStudentIds([]);
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

      {/* Batch name */}
      <input
        placeholder="Batch Name"
        className="border w-full p-4 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Students */}
      <div className="mt-6">
        <h2 className="font-semibold mb-2">Select Students</h2>

        {students.map((student) => (
          <label key={student.id} className="block">
            <input
              type="checkbox"
              checked={studentIds.includes(student.id)}
              onChange={() => toggleStudent(student.id)}
            />
            <span className="ml-2">{student.name}</span>
          </label>
        ))}
      </div>

      {/* Groups */}
      <div className="mt-8 bg-slate-800 p-6 rounded">
        <h2>Expected Groups</h2>

        {groups.map((group) => (
          <div key={group.group}>
            {group.group} ({group.count} students)
          </div>
        ))}
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