const express = require('express')
const app = express()
const errorHandler = require('./middleware/error.middleware')

const activityRoutes = require('./routes/activity.routes')

app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/v1/activity', activityRoutes)

app.use(errorHandler)

module.exports = app