"use client";

import { useState, useEffect, useRef } from "react";
import SideBar from "../components/sideBar";
import useChatSocket from "../hook/useChatSocket";
import ClassRegistrationSection from "../components/ClassRegistrationSection";
import "../assets/ChatPage.css";
import { useSessionMonitor } from "../hook/useSession";

const ChatPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("Anonymous User");
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const {
    messages,
    sendMessage,
    loading: chatLoading,
    error: chatError,
  } = useChatSocket(selectedRoom?.id);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Use the session monitor
  useSessionMonitor();

  useEffect(() => {
    // Get user info from session storage
    const tabId = sessionStorage.getItem("tabId");
    const authData = JSON.parse(
      sessionStorage.getItem(`auth_${tabId}`) || "{}"
    );
    if (authData.username) {
      setUsername(authData.username);
    } else if (authData.fullName) {
      setUsername(authData.fullName);
    }
    if (authData.userId) {
      setUserId(authData.userId);
    }
    if (authData.userRole) {
      setUserRole(authData.userRole);
    }
  }, []);

  // Scroll to bottom when messages change or when room is selected
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedRoom]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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
      <div className="dashboard-container">
        <SideBar />
        <main className="dashboard-main">
          <h1>Chat & Yêu cầu mở lớp</h1>

          <div className="dashboard-content">
            <div className="dashboard-section">
              <div className="section-header-with-link">
                <h2>Phòng chat</h2>
              </div>
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
                    onClick={() =>
                      handleRoomSelect({ id, icon: "🎓", name: id })
                    }
                  >
                    <span className="room-icon">🎓</span>
                    <span className="room-name">{id}</span>
                  </div>
                ))}
              </div>
            </div>

            <ClassRegistrationSection userId={userId} userRole={userRole} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <div className="chat-page">
          <div className="chat-room-header">
            <button
              className="back-button"
              onClick={() => setSelectedRoom(null)}
            >
              Quay lại
            </button>
            <div className="room-title">
              <span className="room-icon">{selectedRoom.icon}</span>
              <span className="room-name">{selectedRoom.name}</span>
            </div>
          </div>

          <div className="messages-container" ref={messagesContainerRef}>
            {chatLoading && (
              <div className="loading-message">Đang tải tin nhắn...</div>
            )}
            {chatError && <div className="error-message">{chatError}</div>}

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
              placeholder="Nhập tin nhắn..."
              className="message-input"
            />
            <button
              type="submit"
              className="send-button"
              disabled={!newMessage.trim()}
            >
              Gửi
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
