"use client";

import { useState, useEffect, useRef } from "react";
import useChatSocket from "../hook/useChatSocket";
import "../assets/Chat.css";

const Chat = ({ isFloating = false }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("Anonymous User");
  const { messages, sendMessage, loading, error } = useChatSocket(
    selectedRoom?.id
  );

  const messagesEndRef = useRef(null);

  // Lấy username từ session storage khi component được mount
  useEffect(() => {
    const tabId = sessionStorage.getItem("tabId");
    const authData = JSON.parse(
      sessionStorage.getItem(`auth_${tabId}`) || "{}"
    );
    if (authData.username) {
      setUsername(authData.username);
    } else if (authData.fullName) {
      setUsername(authData.fullName);
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedRoom) {
      const message = {
        roomId: selectedRoom.id,
        text: newMessage.trim(),
        sender: username,
      };
      sendMessage(message);
      setNewMessage("");
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  if (!selectedRoom) {
    return (
      <div className={`chat-rooms ${isFloating ? "floating" : ""}`}>
        <div className="room-list">
          {[
            "12DHTH11",
            "12DHTH12",
            "12DHTH13",
            "12DHTH14",
            "12DHTH15",
            "12DHTH16",
          ].map((id) => (
            <div
              key={id}
              className="room-item"
              onClick={() => handleRoomSelect({ id, icon: "🎓", name: id })}
            >
              <span className="room-icon">🎓</span>
              <span className="room-name">{id}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-page ${isFloating ? "floating" : ""}`}>
      <div className="chat-room-header">
        <button className="back-button" onClick={() => setSelectedRoom(null)}>
          Back
        </button>
        <div className="room-title">
          <span className="room-icon">{selectedRoom.icon}</span>
          <span className="room-name">{selectedRoom.name}</span>
        </div>
      </div>

      <div className="messages-container">
        {loading && (
          <div className="loading-message">Loading chat history...</div>
        )}
        {error && <div className="error-message">{error}</div>}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === username ? "sent" : "received"
            }`}
          >
            {message.sender !== username && (
              <div className="message-sender">{message.sender}</div>
            )}
            <div className="message-content">{message.text}</div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button
          type="submit"
          className="send-button"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
