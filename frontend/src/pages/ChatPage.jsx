"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaPlus, FaArrowLeft } from "react-icons/fa"
import SideBar from "../components/sideBar"
import Chat from "./Chat"
import ClassRequestForm from "../components/Chat/ClassRequestForm"
import ClassRequestTicket from "../components/Chat/ClassRequestTicket"
import ParticipantsList from "../components/Chat/ParticipantsList"
import RequestDetails from "../components/Chat/RequestDetails"
import JoinClassForm from "../components/Chat/JoinClassForm"
import "../assets/ChatPage.css"
import { useSessionMonitor } from "../hook/useSession"

const ChatPage = () => {
  const tabId = sessionStorage.getItem("tabId")
  const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")
  const [username, setUsername] = useState("Anonymous User")
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [classRequests, setClassRequests] = useState([])
  const [pinnedRequests, setPinnedRequests] = useState([])

  // Use the session monitor
  useSessionMonitor()

  useEffect(() => {
    const tabId = sessionStorage.getItem("tabId");
    const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}");

    if (!authData || !authData.username) {
      // Nếu không có dữ liệu xác thực, chuyển hướng đến trang đăng nhập
      window.location.href = "/unauthorized";
    } else {
      // Nếu có dữ liệu xác thực, thiết lập username
      if (authData.username) {
        setUsername(authData.username);
      } else if (authData.fullName) {
        setUsername(authData.fullName);
      }

      // Mock data cho class requests
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
          isPinned: true,
        },
        {
          id: "2",
          courseName: "Cơ sở dữ liệu",
          creatorName: "Lê Thị C",
          creatorStudentId: "23456789",
          creatorClass: "12DHTH12",
          semester: "2",
          batch: "2023-2024",
          participantCount: 8,
          createdAt: new Date().toISOString(),
          participants: [
            { studentId: "23456789", fullName: "Lê Thị C", class: "12DHTH12" },
            { studentId: "98765432", fullName: "Phạm Văn D", class: "12DHTH13" },
          ],
          isPinned: false,
        },
      ];

      setClassRequests(mockRequests);
      setPinnedRequests(mockRequests.filter((req) => req.isPinned));
    }
  }, []);

  useEffect(() => {
    if (!authData || !authData.username) {
      console.warn("No valid auth data, redirecting to unauthorized.");
      window.location.href = "/unauthorized";
    }
  }, [authData]);

  const handleCreateRequest = (formData) => {
    const newRequest = {
      id: Date.now().toString(),
      courseName: formData.courseName,
      creatorName: username,
      creatorStudentId: formData.creatorStudentId,
      creatorClass: formData.creatorClass,
      semester: formData.semester,
      batch: formData.batch,
      participantCount: 1,
      createdAt: new Date().toISOString(),
      participants: [
        {
          studentId: formData.creatorStudentId,
          fullName: username,
          class: formData.creatorClass,
        },
      ],
      isPinned: true,
    }

    setClassRequests([newRequest, ...classRequests])
    setPinnedRequests([newRequest, ...pinnedRequests])
    setShowRequestForm(false)
  }

  const handleJoinRequest = (formData) => {
    if (!selectedRequest) return

    const updatedRequests = classRequests.map((req) => {
      if (req.id === selectedRequest.id) {
        const newParticipant = {
          studentId: formData.studentId,
          fullName: formData.fullName,
          class: formData.class,
        }

        // Check if user already joined
        const alreadyJoined = req.participants.some((p) => p.studentId === formData.studentId)

        if (!alreadyJoined) {
          return {
            ...req,
            participantCount: req.participantCount + 1,
            participants: [...req.participants, newParticipant],
          }
        }
      }
      return req
    })

    setClassRequests(updatedRequests)
    setPinnedRequests(updatedRequests.filter((req) => req.isPinned))
    setShowJoinForm(false)
  }

  const handleViewParticipants = (request) => {
    setSelectedRequest(request)
    setShowParticipants(true)
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetails(true)
  }

  const handleJoin = (request) => {
    setSelectedRequest(request)
    setShowJoinForm(true)
  }

  const handleTogglePin = (requestId) => {
    const updatedRequests = classRequests.map((req) => {
      if (req.id === requestId) {
        return { ...req, isPinned: !req.isPinned }
      }
      return req
    })

    setClassRequests(updatedRequests)
    setPinnedRequests(updatedRequests.filter((req) => req.isPinned))
  }

  return (
    <div className="chat-page-container">
      <SideBar />
      <div className="chat-page-header">
        <Link to="/home" className="back-to-home">
          <FaArrowLeft /> Back to Home
        </Link>
        <h1>Chat Rooms</h1>
      </div>
      <div className="chat-page-content">
        <div className="chat-section">
          <div className="chat-section-content">
            <Chat />
          </div>
        </div>
      </div>
      <main className="chat-main">
        <div className="chat-header">
          <h1>Chat Room</h1>
          <span className="current-user">Logged in as: {authData.username}</span>
        </div>
      </main>

      <div className="requests-section">
        <div className="requests-section-header">
          <h2>Class Requests</h2>
          <button className="create-request-button" onClick={() => setShowRequestForm(true)}>
            <FaPlus /> New Request
          </button>
        </div>

        {pinnedRequests.length > 0 && (
          <div className="pinned-requests">
            <h3>Pinned Requests</h3>
            <div className="requests-list">
              {pinnedRequests.map((request) => (
                <ClassRequestTicket
                  key={request.id}
                  request={request}
                  onJoin={() => handleJoin(request)}
                  onViewParticipants={() => handleViewParticipants(request)}
                  onViewDetails={() => handleViewDetails(request)}
                  onTogglePin={() => handleTogglePin(request.id)}
                  currentUser={username}
                  isPinned={true}
                />
              ))}
            </div>
          </div>
        )}

        <div className="all-requests">
          <h3>All Requests</h3>
          <div className="requests-list">
            {classRequests.map((request) => (
              <ClassRequestTicket
                key={request.id}
                request={request}
                onJoin={() => handleJoin(request)}
                onViewParticipants={() => handleViewParticipants(request)}
                onViewDetails={() => handleViewDetails(request)}
                onTogglePin={() => handleTogglePin(request.id)}
                currentUser={username}
                isPinned={request.isPinned}
              />
            ))}
          </div>
        </div>
      </div>

      {showRequestForm && (
        <ClassRequestForm
          onSubmit={handleCreateRequest}
          onCancel={() => setShowRequestForm(false)}
          username={username}
        />
      )}

      {showJoinForm && selectedRequest && (
        <JoinClassForm onSubmit={handleJoinRequest} onCancel={() => setShowJoinForm(false)} username={username} />
      )}

      {showParticipants && selectedRequest && (
        <ParticipantsList request={selectedRequest} onClose={() => setShowParticipants(false)} />
      )}

      {showDetails && selectedRequest && (
        <RequestDetails request={selectedRequest} onClose={() => setShowDetails(false)} />
      )}
    </div>
  )
}

export default ChatPage
