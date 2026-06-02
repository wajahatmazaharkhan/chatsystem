import {
  MessageSquare,
  LogIn,
  Activity,
  Clock3,
} from "lucide-react";

const ActivityFeed = ({ activities, onViewHistory }) => {

  const visibleActivities =
    activities.slice(0, 4)

  const getActivityIcon = (title) => {

    const lowerTitle =
      title.toLowerCase()

    if (lowerTitle.includes("message")) {

      return {
        icon: (
          <MessageSquare
            size={18}
            className="text-cyan-300"
          />
        ),

        bg: "bg-cyan-500/15",
      }
    }

    if (lowerTitle.includes("login")) {

      return {
        icon: (
          <LogIn
            size={18}
            className="text-violet-300"
          />
        ),

        bg: "bg-violet-500/15",
      }
    }

    return {
      icon: (
        <Activity
          size={18}
          className="text-emerald-300"
        />
      ),

      bg: "bg-emerald-500/15",
    }
  }

  return (
    <div
      className="
        w-full
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-2xl
        p-6
        h-full
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Activity Feed
          </h2>

          <p className="text-gray-400 mt-1">
            Recent user activities
          </p>
        </div>

        <div
          className="
            w-10 h-10
            rounded-2xl
            bg-white/5
            border border-white/10
            flex items-center justify-center
          "
        >
          <Clock3
            size={18}
            className="text-cyan-400"
          />
        </div>

      </div>

      {/* FEED */}
      <div className="mt-8 space-y-5">

        {visibleActivities.map(
          (activity, index) => {

            const config =
              getActivityIcon(
                activity.title
              )

            return (
              <div
                key={index}
                className="
                  flex items-center justify-between
                  gap-4
                  pb-2
                  border-b border-white/5
                  last:border-none
                  last:pb-0
                "
              >

                {/* LEFT */}
                <div className="flex items-center gap-4">

                  {/* ICON */}
                  <div
                    className={`
                      w-12 h-12
                      rounded-2xl
                      flex items-center justify-center
                      border border-white/10
                      ${config.bg}
                    `}
                  >
                    {config.icon}
                  </div>

                  {/* TITLE */}
                  <div>
                    <h3 className="text-white font-medium">
                      {activity.title}
                    </h3>
                  </div>

                </div>

                {/* TIME */}
                <span
                  className="
                    text-sm
                    text-gray-500
                    whitespace-nowrap
                  "
                >
                  {activity.timestamp}
                </span>

              </div>
            )
          }
        )}

      </div>

      {/* BUTTON */}
      <button
      onClick={onViewHistory}
        className="mt-8 w-full h-12 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition text-sm  text-gray-300 font-medium"
      >
        View All History
      </button>

    </div>
  )
}

export default ActivityFeed