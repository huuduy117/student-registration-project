const express = require("express")
const cors = require("cors")
const http = require("http")
const socketIo = require("socket.io")
const { mysqlConnection } = require("./config/db")

// Import routes
const userRoutes = require("./routes/userRoutes")
const studentRoutes = require("./routes/studentRoutes")
const teacherRoutes = require("./routes/teacherRoutes")
const scheduleRoutes = require("./routes/scheduleRoutes")
const passwordResetRoutes = require("./routes/passwordResetRoutes")
const classRequestRoutes = require("./routes/classRequestRoutes")
const newsfeedRoutes = require("./routes/newsfeedRoutes")
const adminUserRoutes = require("./routes/adminUserRoutes")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/users", userRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/teachers", teacherRoutes)
app.use("/api/schedule", scheduleRoutes)
app.use("/api/password-reset", passwordResetRoutes)
app.use("/api/class-requests", classRequestRoutes)
app.use("/api/newsfeed", newsfeedRoutes)
app.use("/api/admin", adminUserRoutes)

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-room", (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.id} joined room ${roomId}`)
  })

  socket.on("send-message", (data) => {
    socket.to(data.roomId).emit("receive-message", data)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
