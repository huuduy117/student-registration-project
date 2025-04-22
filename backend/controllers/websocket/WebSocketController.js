const { WebSocketServer } = require("ws");

class WebSocketController {
  constructor(mongoDB) {
    this.wss = new WebSocketServer({ noServer: true });
    this.mongoDB = mongoDB;
    this.setupWebSocketEvents();
  }

  setupWebSocketEvents() {
    this.wss.on("connection", (ws, req) => {
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
          const messagesCollection = this.mongoDB.collection("messages");
          await messagesCollection.insertOne(messageObj);
          console.log("Message saved to MongoDB:", messageObj);
        } catch (err) {
          console.error("Error saving message to MongoDB:", err);
        }

        this.wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(messageText);
          }
        });
      });

      ws.on("close", () => {
        console.log("Client disconnected from:", req.url);
      });
    });
  }

  handleUpgrade(request, socket, head) {
    const pathname = request.url;

    if (pathname.startsWith("/chat/")) {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  }
}

module.exports = WebSocketController;
