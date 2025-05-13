"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/sideBar";
import useChatSocket from "../hook/useChatSocket";
import ClassRequestTicket from "../components/Chat/ClassRequestTicket";
import JoinClassForm from "../components/Chat/JoinClassForm";
import ParticipantsList from "../components/Chat/ParticipantsList";
import RequestDetails from "../components/Chat/RequestDetails";
import "../assets/ChatPage.css";
import { useSessionMonitor } from "../hook/useSession";
import axios from "axios";

const ChatPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("Anonymous User");
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [classRequests, setClassRequests] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [pinnedRequests, setPinnedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    messages,
    sendMessage,
    loading: chatLoading,
    error: chatError,
  } = useChatSocket(selectedRoom?.id);
  const navigate = useNavigate();

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

    // Load pinned requests from localStorage
    const savedPinnedRequests = localStorage.getItem("pinnedRequests");
    if (savedPinnedRequests) {
      setPinnedRequests(JSON.parse(savedPinnedRequests));
    }

    // Fetch class requests and available courses
    fetchClassRequests();
    fetchAvailableCourses();
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

  const fetchClassRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/class-requests", {
        headers: {
          Authorization: `Bearer ${
            JSON.parse(
              sessionStorage.getItem(`auth_${sessionStorage.getItem("tabId")}`)
            ).token
          }`,
        },
      });
      setClassRequests(response.data);
    } catch (error) {
      console.error("Error fetching class requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await axios.get(
        "/api/class-requests/available-courses",
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(
                sessionStorage.getItem(
                  `auth_${sessionStorage.getItem("tabId")}`
                )
              ).token
            }`,
          },
        }
      );
      setAvailableCourses(response.data);
    } catch (error) {
      console.error("Error fetching available courses:", error);
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

  const handleJoinClassRequest = async (joinData) => {
    try {
      const response = await axios.post(
        "/api/class-requests/join",
        {
          maSV: userId,
          maLopHP: joinData.requestId,
        },
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(
                sessionStorage.getItem(
                  `auth_${sessionStorage.getItem("tabId")}`
                )
              ).token
            }`,
          },
        }
      );

      // Refresh the class requests
      fetchClassRequests();
      setShowJoinForm(false);
      setErrorMessage("");

      // Show success message
      if (response.data.approved) {
        alert("Tham gia lớp học thành công. Lớp học đã đủ điều kiện mở!");
      } else {
        alert("Tham gia lớp học thành công!");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi tham gia lớp học";
      setErrorMessage(msg);
      console.error("Error joining class request:", error);
      alert(msg);
    }
  };

  const handleViewParticipants = async (requestId) => {
    try {
      const response = await axios.get(
        `/api/class-requests/${requestId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(
                sessionStorage.getItem(
                  `auth_${sessionStorage.getItem("tabId")}`
                )
              ).token
            }`,
          },
        }
      );

      const request = classRequests.find((req) => req.maLopHP === requestId);
      if (request) {
        setSelectedRequest({
          ...request,
          participants: response.data,
        });
        setShowParticipantsList(true);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
      alert("Lỗi khi lấy danh sách sinh viên tham gia");
    }
  };

  const handleViewDetails = (requestId) => {
    const request = classRequests.find((req) => req.maLopHP === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowRequestDetails(true);
    }
  };

  const handleJoinRequest = (requestId) => {
    const request = classRequests.find((req) => req.maLopHP === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowJoinForm(true);
    }
  };

  const handleTogglePin = (requestId) => {
    const isPinned = pinnedRequests.includes(requestId);
    let newPinnedRequests;

    if (isPinned) {
      newPinnedRequests = pinnedRequests.filter((id) => id !== requestId);
    } else {
      newPinnedRequests = [...pinnedRequests, requestId];
    }

    setPinnedRequests(newPinnedRequests);
    localStorage.setItem("pinnedRequests", JSON.stringify(newPinnedRequests));
  };

  const handleCreateRequest = () => {
    navigate("/create-class-request");
  };

  if (!selectedRoom) {
    return (
      <div className="dashboard-container">
        <SideBar />
        <main className="dashboard-main">
          {errorMessage && (
            <div
              className="error-message"
              style={{ color: "red", marginBottom: 8 }}
            >
              {errorMessage}
            </div>
          )}
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

            <div className="dashboard-section">
              <div className="section-header-with-link">
                <h2>Yêu cầu mở lớp học phần</h2>
                {userRole === "SinhVien" && (
                  <button
                    className="view-all-link"
                    onClick={handleCreateRequest}
                  >
                    ➕ Tạo yêu cầu mới
                  </button>
                )}
              </div>

              {loading ? (
                <div className="loading-message">Đang tải dữ liệu...</div>
              ) : (
                <>
                  {pinnedRequests.length > 0 && (
                    <div className="pinned-requests-list">
                      <h3>Yêu cầu đã ghim</h3>
                      {classRequests
                        .filter((req) => pinnedRequests.includes(req.maLopHP))
                        .map((request) => (
                          <ClassRequestTicket
                            key={`pinned-${request.maYeuCau}`}
                            request={{
                              id: request.maLopHP,
                              courseName: request.tenMH,
                              creatorName: request.tenSinhVien,
                              creatorStudentId: request.maSV,
                              semester: request.hocKy
                                ? request.hocKy.replace("HK", "")
                                : "",
                              batch: request.namHoc,
                              participantCount: request.soLuongDangKy,
                              createdAt: request.ngayGui,
                            }}
                            onJoin={handleJoinRequest}
                            onViewParticipants={handleViewParticipants}
                            onViewDetails={handleViewDetails}
                            currentUser={userId}
                            isPinned={true}
                            onTogglePin={handleTogglePin}
                          />
                        ))}
                    </div>
                  )}

                  <div className="class-requests-list">
                    {classRequests.length > 0 ? (
                      classRequests.map((request) => (
                        <ClassRequestTicket
                          key={request.maYeuCau}
                          request={{
                            id: request.maLopHP,
                            courseName: request.tenMH,
                            creatorName: request.tenSinhVien,
                            creatorStudentId: request.maSV,
                            semester: request.hocKy
                              ? request.hocKy.replace("HK", "")
                              : "",
                            batch: request.namHoc,
                            participantCount: request.soLuongDangKy,
                            createdAt: request.ngayGui,
                          }}
                          onJoin={handleJoinRequest}
                          onViewParticipants={handleViewParticipants}
                          onViewDetails={handleViewDetails}
                          currentUser={userId}
                          isPinned={pinnedRequests.includes(request.maLopHP)}
                          onTogglePin={handleTogglePin}
                        />
                      ))
                    ) : (
                      <div className="empty-message">
                        Không có yêu cầu mở lớp nào
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {showParticipantsList && (
            <div className="modal-overlay">
              <ParticipantsList
                request={selectedRequest}
                onClose={() => setShowParticipantsList(false)}
              />
            </div>
          )}

          {showRequestDetails && (
            <div className="modal-overlay">
              <RequestDetails
                request={selectedRequest}
                onClose={() => setShowRequestDetails(false)}
                onJoin={handleJoinRequest}
                currentUser={userId}
              />
            </div>
          )}

          {showJoinForm && (
            <div className="modal-overlay">
              <JoinClassForm
                request={selectedRequest}
                onSubmit={handleJoinClassRequest}
                onCancel={() => setShowJoinForm(false)}
              />
            </div>
          )}
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
