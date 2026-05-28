export function calculateLoginFrequency(
   activities
) {

   const today = new Date()

   // Start of current week
   const startOfWeek =
      new Date(today)

   startOfWeek.setDate(
      today.getDate() - today.getDay()
   )

   startOfWeek.setHours(
      0, 0, 0, 0
   )

   // End of current week
   const endOfWeek =
      new Date(startOfWeek)

   endOfWeek.setDate(
      startOfWeek.getDate() + 6
   )

   endOfWeek.setHours(
      23, 59, 59, 999
   )

   // Filter only current week's LOGIN activities
   const loginActivities =
      activities.filter((activity) => {

         if (
            activity.activity_type !== 'LOGIN'
         ) {
            return false
         }

         const activityDate =
            new Date(activity.timestamp)

         return (
            activityDate >= startOfWeek &&
            activityDate <= endOfWeek
         )
      })

   // Unique login days
   const uniqueLoginDays =
      new Set(

         loginActivities.map(
            (activity) => {

               return new Date(
                  activity.timestamp
               )
                  .toISOString()
                  .split('T')[0]
            }
         )
      )

   const loginDays =
      uniqueLoginDays.size

   let status = ''

   if (loginDays === 0) {

      status = 'Inactive'

   } else if (loginDays <= 2) {

      status = 'Low'

   } else if (loginDays <= 5) {

      status = 'Medium'

   } else {

      status = 'Highly Active'
   }

   return {
      loginDays,
      status
   }
}

export function calculateMessageVolume(activities) {
    const messageActivities = activities.filter(activity => activity.activity_type === 'MESSAGE')

    const messageCount = messageActivities.length

    let status = ''

    if (messageCount === 0) {
      status = 'No Engagement'
    } else if (messageCount <= 3) {
        status = 'Low'
    } else if (messageCount <= 10) {
        status = 'Medium'
    } else {
        status = 'High'
    }
    return {
        messageCount,
        status
    }
}

export function calculateEngagementScore(loginDays, messageCount){
    const score = (loginDays * 0.4) + (messageCount * 0.4)
    return Number(score.toFixed(1))
}

export function calculateStreak(activities) {

   // Extract unique active days
   const uniqueDays = [
      ...new Set(

         activities.map((activity) => {

            return new Date(activity.timestamp)
               .toISOString()
               .split('T')[0]
         })
      )
   ]

   // Sort dates ascending
   uniqueDays.sort(
      (a, b) =>
         new Date(a) - new Date(b)
   )

   let streak = 1
   let maxStreak = 1

   for (let i = 1; i < uniqueDays.length; i++) {

      const previousDay =
         new Date(uniqueDays[i - 1])

      const currentDay =
         new Date(uniqueDays[i])

      const diff =
         (currentDay - previousDay) /
         (1000 * 60 * 60 * 24)

      if (diff === 1) {

         streak++
         maxStreak = Math.max(
            maxStreak,
            streak
         )

      } else {

         streak = 1
      }
   }

   let badge = ''

   if (maxStreak <= 5) {
      badge = 'Bronze'
   } else if (maxStreak <= 10) {
      badge = 'Silver'
   } else {
      badge = 'Gold'
   }

   return {
      streak: maxStreak,
      badge
   }
}

export function generateChartData(
   activities
) {

   const activityMap = {}

   const today = new Date()

   // Get current week's start (Sunday)
   const startOfWeek = new Date(today)

   startOfWeek.setDate(
      today.getDate() - today.getDay()
   )

   startOfWeek.setHours(0, 0, 0, 0)

   // Get end of week
   const endOfWeek = new Date(startOfWeek)

   endOfWeek.setDate(
      startOfWeek.getDate() + 6
   )

   endOfWeek.setHours(
      23, 59, 59, 999
   )

   // Filter only current week
   const currentWeekActivities =
      activities.filter((activity) => {

         const activityDate =
            new Date(activity.timestamp)

         return (
            activityDate >= startOfWeek &&
            activityDate <= endOfWeek
         )
      })

   // Count activity per day
   currentWeekActivities.forEach(
      (activity) => {

         const date =
            new Date(activity.timestamp)

         const day =
            date.toLocaleDateString(
               'en-US',
               { weekday: 'short' }
            )

         if (!activityMap[day]) {

            activityMap[day] = 0
         }

         activityMap[day]++
      }
   )

   // Convert into chart array
   const chartData =
      Object.entries(activityMap)
         .map(([day, activity]) => {

            return {
               day,
               activity
            }
         })

   return chartData
}

function formatTimeAgo(timestamp) {

   const now = new Date()

   const activityTime =
      new Date(timestamp)

   const diffMs =
      now - activityTime

   const minutes =
      Math.floor(diffMs / 60000)

   const hours =
      Math.floor(minutes / 60)

   if (minutes < 60) {

      return `${minutes} mins ago`
   }

   if (hours < 24) {

      return `${hours} hrs ago`
   }

   return activityTime
      .toLocaleDateString()
}


export function formatActivityFeed(
   activities
) {

   return activities

      // Latest first
      .sort(
         (a, b) =>
            new Date(b.timestamp) -
            new Date(a.timestamp)
      )

      // Convert into UI format
      .map((activity) => {

         let title = ''

         if (
            activity.activity_type === 'LOGIN'
         ) {

            title = 'Logged in'

         } else if (
            activity.activity_type === 'MESSAGE'
         ) {

            title = 'Sent a message'
         }

         return {
            title,

            timestamp:
               formatTimeAgo(
                  activity.timestamp
               )
         }
      })
}