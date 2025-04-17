// backend/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files từ Vite build
app.use(express.static(path.resolve(__dirname, "../frontend/dist")));

// API route
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);

// Catch-all route cho React Router
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server đang chạy tại: http://localhost:${port}`);
});
