require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { mysqlConnection, connectMongoDB } = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const WebSocketController = require("./controllers/websocket/WebSocketController");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Serve static files từ Vite build
app.use(express.static(path.resolve(__dirname, "../frontend/dist")));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);

// React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
});

// Kết nối MongoDB và khởi động server
connectMongoDB()
  .then((mongoDB) => {
    const wsController = new WebSocketController(mongoDB);

    server.on("upgrade", (request, socket, head) => {
      wsController.handleUpgrade(request, socket, head);
    });
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Server đang chạy tại: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(
      "Không thể kết nối MongoDB, server không thể khởi động!",
      err
    );
  });
