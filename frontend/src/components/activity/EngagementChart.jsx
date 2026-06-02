import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";

const EngagementChart = ({ data }) => {

  // ALWAYS SHOW FULL WEEK
  const weekDays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]

  const normalizedData = weekDays.map((day) => {

    const existingDay =
      data.find((item) => item.day === day)

    return {
      day,
      activity: existingDay
        ? existingDay.activity
        : 0,
    }
  })

  const getBarColor = (value) => {

    if (value <= 1)
      return "#38bdf8"

    if (value <= 3)
      return "#8b5cf6"

    return "#14b8a6"
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
      "
    >
      {/* HEADER */}
      <div className="mb-18">
        <h2 className="text-2xl font-bold text-white">
          Weekly Activity
        </h2>

        <p className="text-gray-400 mt-1">
          User engagement over the last 7 days
        </p>
      </div>

      {/* CHART */}
      <div className="h-[320px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={normalizedData}>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 14,
              }}
            />

            <Tooltip
              cursor={{
                fill: "rgba(255,255,255,0.03)",
              }}
              contentStyle={{
                background: "#0f172a",
                border:
                  "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "white",
              }}
            />

            <Bar
              dataKey="activity"
              radius={[12, 12, 0, 0]}
            >
              {normalizedData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={getBarColor(entry.activity)}
                />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default EngagementChart