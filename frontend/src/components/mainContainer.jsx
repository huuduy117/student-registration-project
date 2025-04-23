"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../assets/MainContainer.css"
import ClassRequestTicket from "./Chat/ClassRequestTicket"

export default function MainContainer() {
  const [username, setUsername] = useState("Anonymous User")
  const [pinnedRequests, setPinnedRequests] = useState([])

  useEffect(() => {
    // Get username from localStorage if available
    const storedUser = localStorage.getItem("username")
    if (storedUser) {
      setUsername(storedUser)
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
          { studentId: "12345678", fullName: "Nguyễn Văn A", class: "12DHTH11" },
          { studentId: "87654321", fullName: "Trần Thị B", class: "12DHTH12" },
        ],
        isPinned: true,
      },
    ]

    setPinnedRequests(mockPinnedRequests)
  }, [])

  return (
    <div className="main-container-wrapper">
      <div className="main-container-header">
        <h1>Dashboard</h1>
      </div>
      <div className="main-container-content">
        <div className="content-section">
          <h2>Recent Activities</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-title">New Student Registration</div>
              <div className="activity-time">2 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-title">Course Update</div>
              <div className="activity-time">5 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-title">Schedule Change</div>
              <div className="activity-time">Yesterday</div>
            </div>
          </div>
        </div>

        {pinnedRequests.length > 0 && (
          <div className="content-section">
            <div className="section-header-with-link">
              <h2>Pinned Class Requests</h2>
              <Link to="/chat" className="view-all-link">
                View All
              </Link>
            </div>
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
  )
}
