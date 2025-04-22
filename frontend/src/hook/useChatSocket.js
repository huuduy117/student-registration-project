import { useState, useEffect, useRef } from "react";

const useChatSocket = (roomId) => {
  const socket = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    socket.current = new WebSocket(`ws://localhost:5000/chat/${roomId}`);

    socket.current.onopen = () => {
      console.log(`Connected to chat room ${roomId}`);
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
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
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not open.");
    }
  };

  return { messages, sendMessage };
};

export default useChatSocket;
