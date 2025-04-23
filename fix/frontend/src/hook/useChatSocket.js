import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useChatSocket = (roomId) => {
  const socket = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChatHistory = async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:5000/api/chat/history/${roomId}`
      );
      if (Array.isArray(response.data)) {
        setMessages(response.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
      setError("Failed to load chat history");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    fetchChatHistory(roomId);

    socket.current = new WebSocket(`ws://localhost:5000/chat/${roomId}`);

    socket.current.onopen = () => {
      console.log(`Connected to chat room ${roomId}`);
    };

    socket.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.error) {
          console.error("Server message error:", message.message);
          return;
        }

        // Add message to state only if it's from another sender
        if (
          message &&
          typeof message === "object" &&
          message.text &&
          message.roomId
        ) {
          setMessages((prev) => [...prev, message]);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    };

    socket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.current.onclose = () => {
      console.log(`Disconnected from chat room ${roomId}`);
    };

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [roomId]);

  const sendMessage = (message) => {
    if (!message || !message.text || !message.roomId) {
      console.error("Invalid message format:", message);
      return;
    }

    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open");
      return;
    }

    try {
      const messageToSend = {
        roomId: String(message.roomId),
        text: String(message.text).trim(),
        sender: String(message.sender || "unknown"),
        timestamp: new Date().toISOString(),
      };

      // Add message to local state immediately
      setMessages((prev) => [...prev, messageToSend]);

      // Send message to server
      socket.current.send(JSON.stringify(messageToSend));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return {
    messages: Array.isArray(messages) ? messages : [],
    sendMessage,
    loading,
    error,
  };
};

export default useChatSocket;
