require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws");
const { mysqlConnection, connectMongoDB } = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");

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

// Kết nối MongoDB trước khi khởi động server
connectMongoDB()
  .then((mongoDB) => {
    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (request, socket, head) => {
      const pathname = request.url;

      if (pathname.startsWith("/chat/")) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    wss.on("connection", (ws, req) => {
      console.log("Client connected to:", req.url);

      ws.on("message", async (message) => {
        console.log(`[${req.url}] Received: ${message}`);

        let messageText = message;
        if (Buffer.isBuffer(message)) {
          messageText = message.toString();
        }

        const sender = req.user ? req.user.username : "unknown";

        if (sender === "unknown") {
          console.error("Không thể lấy username từ request");
        }

        const messageObj = {
          roomId: req.url.split("/")[2],
          text: messageText,
          sender: sender,
          timestamp: new Date(),
        };

        console.log("Message object:", messageObj);

        try {
          const messagesCollection = mongoDB.collection("messages");
          await messagesCollection.insertOne(messageObj);
          console.log("Message saved to MongoDB:", messageObj);
        } catch (err) {
          console.error("Error saving message to MongoDB:", err);
        }

        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(messageText);
          }
        });
      });

      ws.on("close", () => {
        console.log("Client disconnected from:", req.url);
      });
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
