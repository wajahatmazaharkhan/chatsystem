import {
  Activity,
  MessageSquare,
  TrendingUp,
  Flame,
} from "lucide-react";


const StatCard = ({
  title,
  value,
  status,
  icon,
  gradient,
  glow,
}) => {
  return (
    <div
      className={`
        relative overflow-hidden
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-2xl
        p-4
        transition-all duration-300
        hover:-translate-y-1
        hover:border-white/20
        hover:shadow-2xl ${glow}
      `}
    >
      {/* Glow */}
      <div
        className={`
          absolute -top-10 -right-10
          w-32 h-32 rounded-full
          bg-gradient-to-br ${gradient}
          opacity-10 blur-3xl
        `}
      />

      <div className="flex items-center justify-between">
        <div
            className={`
            w-10 h-10 rounded-2xl
            flex items-center justify-center
            bg-gradient-to-br ${gradient}
            shadow-lg ${glow}
            `}
        >
            {icon}
        </div>

        <div className="flex items-center justify-between">
            <span
                className={`
                px-4 py-1.5 rounded-full
                text-xs font-semibold
                bg-gradient-to-r ${gradient}
                text-white
                `}
            >
                {status}
            </span>

            </div>
      </div>
      {/* CONTENT */}
      <div className="mt-4">
        <p className="text-sm text-gray-400 font-medium">
          {title}
        </p>

        <h2 className="text-xl font-bold mt-2 text-white">
          {value}
        </h2>

        
      </div>
    </div>
  );
};


const StatsCards = ({
  loginData,
  messageData,
  engagementScore,
  streakData,
}) => {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">

      {/* LOGIN */}
      <StatCard
        title="Login Frequency"
        value={`${loginData.loginDays} / 7 Login Days`}
        status={loginData.status}
        icon={<Activity size={24} />}
        gradient="from-cyan-500 to-blue-500"
        glow="shadow-cyan-500/20"
      />

      {/* MESSAGE */}
      <StatCard
        title="Message Volume"
        value={`${messageData.messageCount} Messages`}
        status={messageData.status}
        icon={<MessageSquare size={24} />}
        gradient="from-violet-500 to-fuchsia-500"
        glow="shadow-violet-500/20"
      />

      {/* ENGAGEMENT */}
      <StatCard
        title="Engagement Score"
        value={`${engagementScore} / 10`}
        status="Composite Score"
        icon={<TrendingUp size={24} />}
        gradient="from-emerald-500 to-teal-500"
        glow="shadow-emerald-500/20"
      />

      {/* STREAK */}
      <StatCard
        title="Daily Streak"
        value={`${streakData.streak} Days Active`}
        status={`${streakData.badge} Streak`}
        icon={<Flame size={24} />}
        gradient="from-pink-500 to-rose-500"
        glow="shadow-pink-500/20"
      />
    </div>
  );
};

export default StatsCards;