import { useState, useEffect } from "react";
import { getRanking } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { Star, Award } from "lucide-react";
import UpdateMarksModal from "./UpdateMarksModal";

export default function Leaderboard() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const isStudent = user?.role === "STUDENT";

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const data = await getRanking();
      setRanking(data.ranking || []);
    } catch (err) {
      console.error("Failed to fetch ranking", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  const renderStars = (count) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={18}
        className={i < count ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Award className="text-yellow-400" size={32} />
            Leaderboard
          </h1>
          <p className="text-slate-400 mt-2">
            Top performing students based on their star ranking.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading ranking...</div>
        ) : ranking.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No ranking data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm uppercase bg-slate-900/50">
                  <th className="px-6 py-4 font-semibold">Rank</th>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Stars</th>
                  {!isStudent && <th className="px-6 py-4 font-semibold">Marks</th>}
                  {!isStudent && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ranking.map((student) => (
                  <tr key={student.user_id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold
                        ${student.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                          student.rank === 2 ? 'bg-slate-300/20 text-slate-300' : 
                          student.rank === 3 ? 'bg-amber-600/20 text-amber-500' : 'bg-slate-800 text-slate-400'}
                      `}>
                        {student.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {renderStars(student.stars)}
                      </div>
                    </td>
                    {!isStudent && (
                      <td className="px-6 py-4 text-slate-300">
                        {student.marks != null ? student.marks : "—"}
                      </td>
                    )}
                    {!isStudent && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 text-sm transition-colors"
                        >
                          Edit Marks
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStudent && (
        <UpdateMarksModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSuccess={() => {
            setSelectedStudent(null);
            fetchRanking();
          }}
        />
      )}
    </div>
  );
}
