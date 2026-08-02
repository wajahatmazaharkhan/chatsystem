import { Clock, Activity } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-green-500/15 text-green-400 border border-green-500/20",
    INACTIVE: "bg-red-500/15 text-red-400 border border-red-500/20",
    UNKNOWN: "bg-slate-700 text-slate-300 border border-slate-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || styles.UNKNOWN
      }`}
    >
      {status}
    </span>
  );
}

function ActivityBadge({ type }) {
  const styles = {
    LOGIN: "bg-blue-500/15 text-blue-400 border border-blue-500/20",

    MESSAGE: "bg-purple-500/15 text-purple-400 border border-purple-500/20",

    INTERACTION: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[type] || "bg-slate-700 text-slate-300 border border-slate-600"
      }`}
    >
      {type}
    </span>
  );
}

export default function ActivityTable({ activities, loading }) {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
        </div>

        <div className="space-y-4 p-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <Activity size={50} className="mx-auto text-slate-500" />

        <h3 className="mt-5 text-xl text-white font-semibold">
          No Activity Found
        </h3>

        <p className="mt-2 text-slate-400">
          There are no activity logs available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}

      <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Activity Logs</h2>

          <p className="text-sm text-slate-400 mt-1">
            Monitor user activity across the platform.
          </p>
        </div>

        <span className="text-sm text-slate-400">
          {activities.length} records
        </span>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400">
                User
              </th>

              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400">
                Role
              </th>

              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400">
                Batch
              </th>

              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400">
                Group
              </th>

              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400">
                Activity
              </th>

              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400">
                Status
              </th>

              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-400">
                Timestamp
              </th>
            </tr>
          </thead>

          <tbody>
            {activities.map((activity) => (
              <tr
                key={activity.id}
                className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
              >
                {/* User */}

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                      {activity.user_name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium text-white">
                        {activity.user_name}
                      </p>

                      <p className="text-sm text-slate-400">{activity.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role */}

                <td className="px-6 py-5">
                  <span className="text-slate-300">{activity.role}</span>
                </td>

                {/* Batch */}

                <td className="px-6 py-5">
                  <span className="text-slate-300">{activity.batch_name}</span>
                </td>

                {/* Group */}

                <td className="px-6 py-5">
                  <span className="text-slate-300">{activity.group_name}</span>
                </td>

                {/* Activity */}

                <td className="px-6 py-5">
                  <ActivityBadge type={activity.activity_type} />
                </td>

                {/* Status */}

                <td className="px-6 py-5">
                  <StatusBadge status={activity.status} />
                </td>

                {/* Timestamp */}

                <td className="px-6 py-5">
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="text-slate-500 mt-1" />

                    <div className="flex flex-col">
                      <span className="text-sm text-slate-200">
                        {format(
                          new Date(activity.timestamp),
                          "dd MMM yyyy, hh:mm a",
                        )}
                      </span>

                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                        })
                          .replace("about ", "")
                          .replace("minutes", "min")
                          .replace("minute", "min")
                          .replace("hours", "hr")
                          .replace("hour", "hr")}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
