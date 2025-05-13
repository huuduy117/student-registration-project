"use client"

import { useState, useEffect } from "react"
import SideBar from "../components/sideBar"
import useChatSocket from "../hook/useChatSocket"
import ClassRequestForm from "../components/Chat/ClassRequestForm"
import ClassRequestTicket from "../components/Chat/ClassRequestTicket"
import JoinClassForm from "../components/Chat/JoinClassForm"
import ParticipantsList from "../components/Chat/ParticipantsList"
import RequestDetails from "../components/Chat/RequestDetails"
import "../assets/ChatPage.css"
import { useSessionMonitor } from "../hook/useSession"

const ChatPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [username, setUsername] = useState("Anonymous User")
  const [showClassRequestForm, setShowClassRequestForm] = useState(false)
  const [classRequests, setClassRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showParticipantsList, setShowParticipantsList] = useState(false)
  const [showRequestDetails, setShowRequestDetails] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [pinnedRequests, setPinnedRequests] = useState([])
  const { messages, sendMessage, loading, error } = useChatSocket(selectedRoom?.id)

  // Use the session monitor
  useSessionMonitor()

  useEffect(() => {
    // Get username from session storage
    const tabId = sessionStorage.getItem("tabId")
    const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")
    if (authData.username) {
      setUsername(authData.username)
    } else if (authData.fullName) {
      setUsername(authData.fullName)
    }

    // Load mock data for class requests
    const mockRequests = [
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
      },
      {
        id: "2",
        courseName: "Cơ sở dữ liệu",
        creatorName: "Trần Thị B",
        creatorStudentId: "87654321",
        creatorClass: "12DHTH12",
        semester: "1",
        batch: "2023-2024",
        participantCount: 12,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        participants: [
          {
            studentId: "87654321",
            fullName: "Trần Thị B",
            class: "12DHTH12",
          },
        ],
      },
      {
        id: "3",
        courseName: "Trí tuệ nhân tạo",
        creatorName: "Lê Văn C",
        creatorStudentId: "23456789",
        creatorClass: "12DHTH13",
        semester: "2",
        batch: "2023-2024",
        participantCount: 8,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        participants: [
          {
            studentId: "23456789",
            fullName: "Lê Văn C",
            class: "12DHTH13",
          },
        ],
      },
    ]

    setClassRequests(mockRequests)

    // Load pinned requests from localStorage
    const savedPinnedRequests = localStorage.getItem("pinnedRequests")
    if (savedPinnedRequests) {
      const pinnedIds = JSON.parse(savedPinnedRequests)
      const pinned = mockRequests.filter((req) => pinnedIds.includes(req.id))
      setPinnedRequests(pinned)
    }
  }, [])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() && selectedRoom) {
      const message = {
        roomId: selectedRoom.id,
        text: newMessage.trim(),
        sender: username,
      }
      sendMessage(message)
      setNewMessage("")
    }
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
  }

  const handleCreateClassRequest = (formData) => {
    const newRequest = {
      id: `${classRequests.length + 1}`,
      courseName: formData.courseName,
      creatorName: username,
      creatorStudentId: "", // In a real app, get from user profile
      creatorClass: "", // In a real app, get from user profile
      semester: formData.semester,
      batch: formData.batch,
      description: formData.description,
      participants: formData.participants,
      participantCount: formData.participants.length,
      createdAt: new Date().toISOString(),
    }

    setClassRequests([newRequest, ...classRequests])
    setShowClassRequestForm(false)
  }

  const handleJoinClassRequest = (joinData) => {
    const updatedRequests = classRequests.map((req) => {
      if (req.id === joinData.requestId) {
        const newParticipant = {
          studentId: joinData.studentId,
          fullName: joinData.fullName,
          class: joinData.class,
        }
        return {
          ...req,
          participants: [...(req.participants || []), newParticipant],
          participantCount: (req.participants?.length || 0) + 1,
        }
      }
      return req
    })

    setClassRequests(updatedRequests)
    setShowJoinForm(false)
  }

  const handleViewParticipants = (requestId) => {
    const request = classRequests.find((req) => req.id === requestId)
    setSelectedRequest(request)
    setShowParticipantsList(true)
  }

  const handleViewDetails = (requestId) => {
    const request = classRequests.find((req) => req.id === requestId)
    setSelectedRequest(request)
    setShowRequestDetails(true)
  }

  const handleJoinRequest = (requestId) => {
    const request = classRequests.find((req) => req.id === requestId)
    setSelectedRequest(request)
    setShowJoinForm(true)
  }

  const handleTogglePin = (requestId) => {
    const request = classRequests.find((req) => req.id === requestId)
    if (!request) return

    const isPinned = pinnedRequests.some((req) => req.id === requestId)
    let newPinnedRequests

    if (isPinned) {
      newPinnedRequests = pinnedRequests.filter((req) => req.id !== requestId)
    } else {
      newPinnedRequests = [...pinnedRequests, request]
    }

    setPinnedRequests(newPinnedRequests)
    localStorage.setItem("pinnedRequests", JSON.stringify(newPinnedRequests.map((req) => req.id)))
  }

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
                {["12DHTH11", "12DHTH12", "12DHTH13", "12DHTH14", "12DHTH15", "12DHTH16"].map((id) => (
                  <div key={id} className="room-item" onClick={() => handleRoomSelect({ id, icon: "🎓", name: id })}>
                    <span className="room-icon">🎓</span>
                    <span className="room-name">{id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header-with-link">
                <h2>Yêu cầu mở lớp học phần</h2>
                <button className="view-all-link" onClick={() => setShowClassRequestForm(true)}>
                  ➕ Tạo yêu cầu mới
                </button>
              </div>

              {pinnedRequests.length > 0 && (
                <div className="pinned-requests-list">
                  <h3>Yêu cầu đã ghim</h3>
                  {pinnedRequests.map((request) => (
                    <ClassRequestTicket
                      key={`pinned-${request.id}`}
                      request={request}
                      onJoin={handleJoinRequest}
                      onViewParticipants={handleViewParticipants}
                      onViewDetails={handleViewDetails}
                      currentUser={username}
                      isPinned={true}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              )}

              <div className="class-requests-list">
                {classRequests.map((request) => (
                  <ClassRequestTicket
                    key={request.id}
                    request={request}
                    onJoin={handleJoinRequest}
                    onViewParticipants={handleViewParticipants}
                    onViewDetails={handleViewDetails}
                    currentUser={username}
                    isPinned={pinnedRequests.some((req) => req.id === request.id)}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            </div>
          </div>

          {showClassRequestForm && (
            <div className="modal-overlay">
              <ClassRequestForm onSubmit={handleCreateClassRequest} onCancel={() => setShowClassRequestForm(false)} />
            </div>
          )}

          {showParticipantsList && (
            <div className="modal-overlay">
              <ParticipantsList request={selectedRequest} onClose={() => setShowParticipantsList(false)} />
            </div>
          )}

          {showRequestDetails && (
            <div className="modal-overlay">
              <RequestDetails
                request={selectedRequest}
                onClose={() => setShowRequestDetails(false)}
                onJoin={handleJoinRequest}
                currentUser={username}
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
    )
  }

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <div className="chat-page">
          <div className="chat-room-header">
            <button className="back-button" onClick={() => setSelectedRoom(null)}>
              Quay lại
            </button>
            <div className="room-title">
              <span className="room-icon">{selectedRoom.icon}</span>
              <span className="room-name">{selectedRoom.name}</span>
            </div>
          </div>

          <div className="messages-container">
            {loading && <div className="loading-message">Đang tải tin nhắn...</div>}
            {error && <div className="error-message">{error}</div>}

            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender === username ? "sent" : "received"}`}>
                {message.sender !== username && <div className="message-sender">{message.sender}</div>}
                <div className="message-content">{message.text}</div>
                <div className="message-timestamp">{new Date(message.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="message-input"
            />
            <button type="submit" className="send-button" disabled={!newMessage.trim()}>
              Gửi
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default ChatPage
