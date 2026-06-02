import { X, Search, MessageSquare, LogIn, Activity } from "lucide-react";
import { useState } from "react";

const ActivityHistoryModal = ({ isOpen, onClose, activities }) => {
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const getActivityIcon = (title) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes("message")) {
      return {
        icon: <MessageSquare size={18} className="text-cyan-300" />,
        bg: "bg-cyan-500/15",
        type: "MESSAGE",
      };
    }

    if (lowerTitle.includes("logged")) {
      return {
        icon: <LogIn size={18} className="text-violet-300" />,
        bg: "bg-violet-500/15",
        type: "LOGIN",
      };
    }

    return {
      icon: <Activity size={18} className="text-emerald-300" />,
      bg: "bg-emerald-500/15",
      type: "OTHER",
    };
  };

  const filteredActivities = activities.filter((activity) => {
    const title = activity.title.toLowerCase();

    const matchesSearch = title.includes(searchTerm.toLowerCase());

    if (filter === "LOGIN") {
      return matchesSearch && title.includes("logged");
    }

    if (filter === "MESSAGE") {
      return matchesSearch && title.includes("message");
    }

    return matchesSearch;
  });

  return (
    <div
      className="
        fixed inset-0
        bg-black/60
        backdrop-blur-md
        z-50
        flex items-center justify-center
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-4xl

          rounded-3xl
          border border-white/10

          bg-[#0B1220]
          shadow-2xl

          p-6
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Activity History</h2>

            <p className="text-gray-400 mt-2">
              {filteredActivities.length} Activities Found
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-10 h-10

              rounded-xl

              bg-white/5
              border border-white/10

              flex items-center justify-center

              hover:bg-white/10
              transition
            "
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* SEARCH */}
        <div className="mt-6 relative">
          <Search
            size={18}
            className="
              absolute
              left-4 top-1/2
              -translate-y-1/2
              text-gray-500
            "
          />

          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full
              h-12

              rounded-2xl

              bg-white/5
              border border-white/10

              pl-12 pr-4

              text-white
              placeholder:text-gray-500

              outline-none
            "
          />
        </div>

        {/* FILTERS */}
        <div className="flex gap-3 mt-5">
          {["ALL", "LOGIN", "MESSAGE"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`
                px-4 py-2
                rounded-xl
                text-sm
                font-medium
                transition

                ${
                  filter === item
                    ? "bg-cyan-500 text-white"
                    : "bg-white/5 text-gray-400 border border-white/10"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>

        {/* ACTIVITY LIST */}
        <div
          className=" mt-6 max-h-[60vh] overflow-y-auto space-y-4 pr-2"
        >
          {filteredActivities.length === 0 ? (
            <div
              className="text-center py-12 text-gray-500"
            >
              No activities found
            </div>
          ) : (
            filteredActivities.map((activity, index) => {
              const config = getActivityIcon(activity.title);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                          w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 ${config.bg}
                        `}
                    >
                      {config.icon}
                    </div>

                    <div>
                      <h3 className="text-white font-medium">
                        {activity.title}
                      </h3>

                      <p className="text-gray-500 text-sm mt-1">
                        Activity Event
                      </p>
                    </div>
                  </div>

                  <span
                    className=" text-sm text-gray-400 whitespace-nowrap"
                  >
                    {activity.timestamp}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityHistoryModal;