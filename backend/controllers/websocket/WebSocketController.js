const { WebSocketServer } = require("ws");
const express = require("express");

class WebSocketController {
  constructor(mongoDB) {
    this.wss = new WebSocketServer({ noServer: true });
    this.mongoDB = mongoDB;
    this.router = express.Router();
    this.setupRoutes();
  }
  setupRoutes() {
    this.router.get("/history/:roomId", async (req, res) => {
      try {
        const { roomId } = req.params;
        const messagesCollection = this.mongoDB.collection("messages");

        const messages = await messagesCollection
          .find({ roomId: String(roomId) })
          .sort({ timestamp: -1 })
          .limit(50)
          .toArray();

        const formattedMessages = messages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        }));

        res.json(formattedMessages.reverse());
      } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Failed to fetch chat history" });
      }
    });
  }

  async initialize() {
    try {
      await this.initializeMessageCollection();
      this.setupWebSocketEvents();
      return this.router;
    } catch (error) {
      console.error("Failed to initialize WebSocket controller:", error);
      throw error;
    }
  }

  async initializeMessageCollection() {
    try {
      const collections = await this.mongoDB.listCollections().toArray();
      const messagesExists = collections.some((col) => col.name === "messages");

      if (!messagesExists) {
        await this.mongoDB.createCollection("messages", {
          validator: {
            $jsonSchema: {
              bsonType: "object",
              required: ["roomId", "text", "sender", "timestamp"],
              properties: {
                roomId: {
                  bsonType: "string",
                  description: "must be a string and is required",
                },
                text: {
                  bsonType: "string",
                  description: "must be a string and is required",
                },
                sender: {
                  bsonType: "string",
                  description: "must be a string and is required",
                },
                timestamp: {
                  bsonType: "date",
                  description: "must be a date and is required",
                },
              },
            },
          },
        });
        console.log("Messages collection created successfully");
      } else {
        console.log("Messages collection already exists");
      }
    } catch (error) {
      console.error("Error initializing messages collection:", error);
      throw error;
    }
  }

  setupWebSocketEvents() {
    this.wss.on("connection", (ws, req) => {
      console.log("Client connected to:", req.url);

      ws.on("message", async (message) => {
        try {
          let messageData = message;
          if (Buffer.isBuffer(message)) {
            messageData = message.toString();
          }

          const parsedMessage = JSON.parse(messageData);
          const messageObj = {
            roomId: String(parsedMessage.roomId || ""),
            text: String(parsedMessage.text || "").trim(),
            sender: String(parsedMessage.sender || "unknown"),
            timestamp: new Date(),
          };

          if (!messageObj.roomId || !messageObj.text) {
            throw new Error("Missing required fields");
          }

          const messagesCollection = this.mongoDB.collection("messages");
          await messagesCollection.insertOne(messageObj);
          const messageForClient = {
            ...messageObj,
            timestamp: messageObj.timestamp.toISOString(),
          };

          this.wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify(messageForClient));
            }
          });
        } catch (error) {
          console.error("Error processing message:", error);
          ws.send(
            JSON.stringify({
              error: true,
              message: "Failed to process message",
            })
          );
        }
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
