require('dotenv').config()
const socketIO = require('socket.io')
const socket = require('./socket')
const { onlineUsers } = require('./socket')
const http = require('http')
const jwt = require('jsonwebtoken')
const Message = require('./models/Message')

const app = require("./app")
const server = http.createServer(app)
const mongoose = require("mongoose")

const io = socketIO(server, {
    cors: {
        origin: ["http://localhost:5173", "https://teamio-neon.vercel.app/"],
        methods: ["GET", "POST"]
    }
})

socket.setIO(io)

const PORT = process.env.PORT || 4000
const MONGOURL = process.env.MONGOURL


mongoose.connect(MONGOURL)
    .then(e => {
        console.log("Connected to Database Successfuly")

        io.on('connection', (socket) => {
            console.log("A user connected")

            socket.on("register-user", (userId) => {
                onlineUsers.set(userId, socket.id)
                console.log("User registered:", userId)
            })
            
            socket.on("send-notification", ({ toUserId, message }) => {
                const targetSocketId = onlineUsers.get(toUserId)
                if (targetSocketId) {
                    io.to(targetSocketId).emit("notification", message)
                }
            })

            socket.on('chat-msg', async (data) => {
                try {
                    const { username, token, msg } = data

                    if (!msg || !msg.trim()) return

                    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
                    const user = decoded.id

                    const newMessage = new Message({
                        user,
                        text: msg
                    })

                    await newMessage.save()

                    io.emit('new-msg', {
                        _id: newMessage._id,
                        username,
                        text: msg,
                    })

                    io.emit('notification', 'New Message')
                } catch (err) {
                    console.error('Socket message error:', err.message)
                }
            })

            socket.on('disconnect', () => {
                for (const [userId, socketId] of onlineUsers.entries()) {
                    if (socketId === socket.id) {
                        onlineUsers.delete(userId)
                        break
                    }
                }
                console.log(`${socket.id} disconnected`)
            })
        })

        server.listen(PORT, () => {
            console.log(`Server is running successfuly on port: ${PORT}`)
        })
    })
    .catch(error => {
        console.log(error.message)
    })
    