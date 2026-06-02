import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ActivityFeed from "../../components/activity/ActivityFeed";
import EngagementChart from "../../components/activity/EngagementChart";
import StatsCards from "../../components/activity/StatsCard";
import ActivityHistoryModal from "../../components/activity/ActivityHistoryModal";

import {
  calculateEngagementScore,
  calculateLoginFrequency,
  calculateMessageVolume,
  calculateStreak,
  formatActivityFeed,
  generateChartData,
} from "../../utils/userStatsCalculator";

import { getUserActivity } from "../../services/activityService";

const UserActivityLogs = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await getUserActivity(userId);

        setActivities(data.data || data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, [userId]);

  const loginData = calculateLoginFrequency(activities);

  const messageData = calculateMessageVolume(activities);

  const engagementScore = calculateEngagementScore(
    loginData.loginDays,
    messageData.messageCount
  );

  const streakData = calculateStreak(activities);

  const chartData = generateChartData(activities);

  const feedActivities = formatActivityFeed(activities);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-slate-400">
          Loading activity logs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/dashboard/activity")}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition"
          >
            <ArrowLeft size={18} />
            Back to Users
          </button>

          <h1 className="text-2xl font-bold text-white">
            User Activity Dashboard
          </h1>
        </div>
      </div>

      {/* Stats */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <StatsCards
          loginData={loginData}
          messageData={messageData}
          engagementScore={engagementScore}
          streakData={streakData}
        />
      </div>

      {/* Chart + Feed */}

      <div className="grid  xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <EngagementChart data={chartData} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <ActivityFeed
            activities={feedActivities}
            onViewHistory={() =>
              setIsHistoryOpen(true)
            }
          />
        </div>
      </div>

      <ActivityHistoryModal
        isOpen={isHistoryOpen}
        onClose={() =>
          setIsHistoryOpen(false)
        }
        activities={feedActivities}
      />
    </div>
  );
};

export default UserActivityLogs;