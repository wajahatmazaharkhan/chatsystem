require('dotenv').config()

const app = require('./src/app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 3000

const startServer = async () => {
    try {
        await connectDB()

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })

    } catch (err) {
        console.log('Server startup failed:', err.message)
        process.exit(1)
    }
}

startServer()