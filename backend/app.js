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

// Initialize WebSocket and start server
async function startServer() {
  try {
    const mongoDB = await connectMongoDB();

    // Initialize WebSocket controller
    const wsController = new WebSocketController(mongoDB);

    // Initialize controller and get router
    const chatRouter = await wsController.initialize();
    // Add chat routes
    app.use("/api/chat", chatRouter);

    // Handle WebSocket upgrade requests
    server.on("upgrade", (request, socket, head) => {
      wsController.handleUpgrade(request, socket, head);
    });

    // React Router fallback
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
    });

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Server đang chạy tại: http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Không thể khởi động server:", err);
    process.exit(1);
  }
}

startServer();
