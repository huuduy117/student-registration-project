const express = require("express")
const path = require("path")
const cors = require("cors")
const app = express()

// Enable CORS
app.use(cors())

// Parse JSON bodies
app.use(express.json())

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/dist")))

// API routes (include your existing routes)
const userRoutes = require("./routes/userRoutes")
const studentRoutes = require("./routes/studentRoutes")
const teacherRoutes = require("./routes/teacherRoutes")
const adminUserRoutes = require("./routes/adminUserRoutes")

app.use("/api/users", userRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/teachers", teacherRoutes)
app.use("/api/admin", adminUserRoutes)

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
