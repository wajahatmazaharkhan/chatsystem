import { ArrowRight } from "lucide-react";

export default function BatchOverviewTable({
  batches = [],
  loading = false,
  selectedBatch = null,
  onBatchSelect,
}) {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="h-6 w-52 bg-slate-800 rounded animate-pulse mb-6" />

        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-slate-800 rounded-lg animate-pulse mb-3"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}

      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Batch Overview</h2>

          {selectedBatch && (
            <p className="text-sm text-slate-400 mt-1">
              Viewing{" "}
              <span className="text-blue-400 font-medium">
                {selectedBatch.batch_name}
              </span>
            </p>
          )}
        </div>

        {selectedBatch && (
          <button
            onClick={() => onBatchSelect(null)}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/60">
            <tr className="text-left">
              <th className="px-6 py-4 text-xs uppercase tracking-wide text-slate-400">
                Batch
              </th>

              <th className="px-6 py-4 text-xs uppercase tracking-wide text-slate-400">
                Total Students
              </th>

              <th className="px-6 py-4 text-xs uppercase tracking-wide text-slate-400">
                Active Students
              </th>

              <th className="px-6 py-4 text-xs uppercase tracking-wide text-slate-400">
                Inactive Students
              </th>

              <th className="px-6 py-4 text-xs uppercase tracking-wide text-slate-400">
                Total Activities
              </th>

              <th className="px-6 py-4 text-xs uppercase tracking-wide text-slate-400">
                Activity Trend
              </th>
            </tr>
          </thead>

          <tbody>
            {batches.map((batch) => (
              <tr
                key={batch.batch_id}
                className={`
                  border-t border-slate-800
                  transition-all
                  cursor-pointer

                  ${
                    selectedBatch?.batch_id === batch.batch_id
                      ? "bg-blue-500/10"
                      : "hover:bg-slate-800/40"
                  }
                `}
              >
                {/* Batch */}

                <td className="px-6 py-4">
                  <button
                    onClick={() => onBatchSelect(batch)}
                    className={`
                      font-medium transition-colors

                      ${
                        selectedBatch?.batch_id === batch.batch_id
                          ? "text-blue-300"
                          : "text-blue-400 hover:text-blue-300"
                      }
                    `}
                  >
                    {batch.batch_name}
                  </button>
                </td>

                {/* Total */}

                <td className="px-6 py-4 text-slate-200">
                  {batch.total_students}
                </td>

                {/* Active */}

                <td className="px-6 py-4">
                  <span className="text-white">{batch.active_students}</span>

                  <span className="ml-1 text-green-400 font-medium">
                    ({batch.active_percentage}%)
                  </span>
                </td>

                {/* Inactive */}

                <td className="px-6 py-4">
                  <span className="text-white">{batch.inactive_students}</span>

                  <span className="ml-1 text-red-400 font-medium">
                    ({batch.inactive_percentage}%)
                  </span>
                </td>

                {/* Activities */}

                <td className="px-6 py-4 text-white">
                  {batch.total_activities}
                </td>

                {/* Trend */}

                <td className="px-6 py-4">
                  {/* Placeholder */}

                  <div className="w-24 h-8 flex items-center">
                    <svg viewBox="0 0 100 30" className="w-full h-full">
                      <polyline
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="2"
                        points="
                          0,22
                          15,20
                          30,12
                          45,18
                          60,10
                          75,16
                          90,13
                          100,8
                        "
                      />
                    </svg>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}

      <div className="border-t border-slate-800 p-4 flex justify-center">
        <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium">
          View all batches
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
