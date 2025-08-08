const express = require('express')
const app = express()
const morgan = require("morgan")
const helmet = require('helmet')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.route')
const projectRoutes = require('./routes/project.routes')
const taskRoutes = require('./routes/task.routes')
const activityLogRoutes = require('./routes/activityLog.routes')
const messageRoutes = require('./routes/message.route')
const noteRoutes = require('./routes/note.routes')
const reportRoutes = require('./routes/report.routes')

app.use(express.json())
app.use(morgan("dev"))
app.use(helmet())

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
})
app.use(limiter)

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4000",
    "https://teamio-neon.vercel.app/",
    "https://task-manager-apis-t2dp.onrender.com"
]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))

app.use('/src/reports', express.static(path.join(__dirname, 'reports')))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/activityLogs', activityLogRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/report', reportRoutes)

app.get('/healthz', (req, res) => { res.status(200).send('OK') })

module.exports = app