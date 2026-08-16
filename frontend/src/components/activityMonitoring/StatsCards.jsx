import {
  Activity,
  Users,
  UserX,
  Layers3,
} from "lucide-react";

export default function StatsCards({
  stats,
  loading,
  selectedBatch,
}) {

  const cards = [
    {
      title: "Total Activities",
      key: "total_activities",
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Students",
      key: "active_students",
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Inactive Students",
      key: "inactive_students",
      icon: UserX,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      title: selectedBatch
        ? "Total Students"
        : "Total Batches",

      key: selectedBatch
        ? "total_students"
        : "total_batches",

      icon: Layers3,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => {

        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all"
          >
            <div className="flex justify-between items-start">

              <div>

                <p className="text-sm text-slate-400">
                  {card.title}
                </p>

                {loading ? (
                  <div className="h-10 w-24 rounded bg-slate-800 animate-pulse mt-3" />
                ) : (
                  <h2 className="mt-3 text-4xl font-bold text-white">
                    {stats?.[card.key] ?? 0}
                  </h2>
                )}

              </div>

              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.bg}`}
              >
                <Icon
                  size={28}
                  className={card.color}
                />
              </div>

            </div>
          </div>
        );

      })}
    </div>
  );
}