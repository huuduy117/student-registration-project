"use client";

//components/NewFeed.jsx
import "../assets/NewFeed.css";
import { useState, useEffect } from "react";
import { FaComments, FaTimes } from "react-icons/fa";
import Chat from "../pages/Chat";
import ClassRequestTicket from "./Chat/ClassRequestTicket";

export default function NewFeed() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [username, setUsername] = useState("Anonymous User");
  const [pinnedRequests, setPinnedRequests] = useState([]);

  useEffect(() => {
    // Get username from localStorage if available
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }

    // Load mock data for pinned class requests
    const mockPinnedRequests = [
      {
        id: "1",
        courseName: "Lập trình Web",
        creatorName: "Nguyễn Văn A",
        creatorStudentId: "12345678",
        creatorClass: "12DHTH11",
        semester: "1",
        batch: "2023-2024",
        participantCount: 15,
        createdAt: new Date().toISOString(),
        participants: [
          {
            studentId: "12345678",
            fullName: "Nguyễn Văn A",
            class: "12DHTH11",
          },
          { studentId: "87654321", fullName: "Trần Thị B", class: "12DHTH12" },
        ],
        isPinned: true,
      },
    ];

    setPinnedRequests(mockPinnedRequests);
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <div className="new-feed-wrapper">
        <div className="new-feed-header">
          <img
            alt="avatar"
            src="https://placehold.co/52x52/png"
            className="new-feed-avatar"
          />
          <div className="new-feed-user-name">{username}</div>
          <button className="new-feed-view-button">View</button>
        </div>
        <div className="new-feed-main">
          <div className="new-feed-content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            mollis sodales turpis, eget laoreet dui.
          </div>

          {/* Add Pinned Requests Section */}
          {pinnedRequests.length > 0 && (
            <div className="pinned-requests-section">
              <h3>Pinned Class Requests</h3>
              <div className="pinned-requests-list">
                {pinnedRequests.map((request) => (
                  <ClassRequestTicket
                    key={request.id}
                    request={request}
                    onJoin={() => {}}
                    onViewParticipants={() => {}}
                    onViewDetails={() => {}}
                    currentUser={username}
                    isPinned={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="chat-toggle-button" onClick={toggleChat} title="Chat">
        <FaComments />
      </button>

      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Chat Rooms</h3>
            <button className="chat-close-button" onClick={toggleChat}>
              <FaTimes />
            </button>
          </div>
          <div className="chat-content">
            <Chat isFloating={true} username={username} />
          </div>
        </div>
      )}
    </>
  );
}
