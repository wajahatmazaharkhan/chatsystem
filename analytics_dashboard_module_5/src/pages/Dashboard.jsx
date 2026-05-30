import { useState } from "react"
import ActivityFeed from "../components/dashboard/ActivityFeed"
import EngagementChart from "../components/dashboard/EngagementChart"
import StatsCards from "../components/dashboard/StatsCard"
import { calculateEngagementScore, calculateLoginFrequency, calculateMessageVolume, calculateStreak, formatActivityFeed, generateChartData } from "../utils/userStats"
import { useEffect } from "react"
import { fetchUserActivity } from "../services/api.service"

const Dashboard = () => {
    const [activities, setActivities] = useState([])

    useEffect(() => {
      async function loadActivities() {
        const data = await fetchUserActivity('6a072d015a49bfe1c088209b')
        
        setActivities(data)
      }

      loadActivities()
    }, [])

    const loginData = calculateLoginFrequency(activities)
    const messageData = calculateMessageVolume(activities)
    const engagementScore = calculateEngagementScore(
        loginData.loginDays,
        messageData.messageCount
    )
    const streekData = calculateStreak(activities)
    const chartData = generateChartData(activities)

    const feedActivities = formatActivityFeed(activities)



  return (
    <div>
      <h1 className="text-2xl font-bold">Supervison Dashboard</h1>

      <div className="mt-8">
        <StatsCards
            loginData={loginData}
            messageData={messageData}
            engagementScore={engagementScore}
            streakData={streekData}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
            <EngagementChart data={chartData} />
        </div>

        <div className="w-full">
            <ActivityFeed activities={feedActivities} />
        </div>
      </div>    
    </div>
  )
}

export default Dashboard
