"use client"

import "../assets/NewFeed.css"
import { useState, useEffect } from "react"
import { FaTimes } from "react-icons/fa"
import Chat from "../pages/Chat"
import ClassRequestTicket from "./Chat/ClassRequestTicket"
import axios from "axios"

export default function NewFeed() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [username, setUsername] = useState("Anonymous User")
  const [userId, setUserId] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [pinnedRequests, setPinnedRequests] = useState([])
  const [openRequests, setOpenRequests] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user info from session storage
    const tabId = sessionStorage.getItem("tabId")
    const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")
    if (authData.username) {
      setUsername(authData.username)
    } else if (authData.fullName) {
      setUsername(authData.fullName)
    }
    if (authData.userId) {
      setUserId(authData.userId)
    }
    if (authData.userRole) {
      setUserRole(authData.userRole)
    }

    // Load pinned requests from localStorage
    const savedPinnedRequests = localStorage.getItem("pinnedRequests")
    if (savedPinnedRequests) {
      setPinnedRequests(JSON.parse(savedPinnedRequests))
    }

    // Fetch open class requests
    fetchOpenRequests()

    // Fetch news
    fetchNews()
  }, [])

  const fetchOpenRequests = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/newsfeed/open-class-requests", {
        headers: {
          Authorization: `Bearer ${JSON.parse(sessionStorage.getItem(`auth_${sessionStorage.getItem("tabId")}`)).token}`,
        },
      })
      setOpenRequests(response.data)
    } catch (error) {
      console.error("Error fetching open requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/newsfeed", {
        params: { userType: userRole },
        headers: {
          Authorization: `Bearer ${JSON.parse(sessionStorage.getItem(`auth_${sessionStorage.getItem("tabId")}`)).token}`,
        },
      })
      setNews(response.data)
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const handleJoinRequest = async (requestId) => {
    try {
      await axios.post(
        "/api/class-requests/join",
        { maSV: userId, maLopHP: requestId },
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(sessionStorage.getItem(`auth_${sessionStorage.getItem("tabId")}`)).token}`,
          },
        },
      )
      // Refresh the open requests
      fetchOpenRequests()
    } catch (error) {
      console.error("Error joining request:", error)
      alert(error.response?.data?.message || "Lỗi khi tham gia lớp học")
    }
  }

  const handleTogglePin = (requestId) => {
    const isPinned = pinnedRequests.includes(requestId)
    let newPinnedRequests

    if (isPinned) {
      newPinnedRequests = pinnedRequests.filter((id) => id !== requestId)
    } else {
      newPinnedRequests = [...pinnedRequests, requestId]
    }

    setPinnedRequests(newPinnedRequests)
    localStorage.setItem("pinnedRequests", JSON.stringify(newPinnedRequests))
  }

  return (
    <>
      <div className="new-feed-wrapper">
        <div className="new-feed-header">
          <img alt="avatar" src="https://placehold.co/52x52/png" className="new-feed-avatar" />
          <div className="new-feed-user-name">{username}</div>
        </div>
        <div className="new-feed-main">
          {loading ? (
            <div className="loading-message">Đang tải dữ liệu...</div>
          ) : (
            <>
              {/* News Section */}
              <div className="news-section">
                <h3 className="section-title">Thông Báo Mới</h3>
                {news.length > 0 ? (
                  <div className="news-list">
                    {news.slice(0, 3).map((item) => (
                      <div key={item.maThongBao} className="news-item">
                        <div className="news-title">{item.tieuDe}</div>
                        <div className="news-content">{item.noiDung}</div>
                        <div className="news-meta">
                          <span className="news-author">{item.tenNguoiDang}</span>
                          <span className="news-date">{new Date(item.ngayDang).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {news.length > 3 && (
                      <div className="view-more">
                        <a href="/news">Xem thêm thông báo</a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-message">Không có thông báo mới</div>
                )}
              </div>

              {/* Open Class Requests Section */}
              <div className="open-requests-section">
                <h3 className="section-title">Yêu Cầu Mở Lớp</h3>
                {openRequests.length > 0 ? (
                  <div className="open-requests-list">
                    {openRequests.slice(0, 3).map((request) => (
                      <ClassRequestTicket
                        key={request.maYeuCau}
                        request={{
                          id: request.maLopHP,
                          courseName: request.tenMH,
                          creatorName: request.tenSinhVien,
                          creatorStudentId: request.maSV,
                          semester: request.hocKy.replace("HK", ""),
                          batch: request.namHoc,
                          participantCount: request.soLuongDangKy,
                          createdAt: request.ngayGui,
                        }}
                        onJoin={handleJoinRequest}
                        onViewParticipants={() => {}}
                        onViewDetails={() => {}}
                        currentUser={userId}
                        isPinned={pinnedRequests.includes(request.maLopHP)}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                    {openRequests.length > 3 && (
                      <div className="view-more">
                        <a href="/chat-page">Xem tất cả yêu cầu</a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-message">Không có yêu cầu mở lớp mới</div>
                )}
              </div>

              {/* Pinned Requests Section */}
              {pinnedRequests.length > 0 && (
                <div className="pinned-requests-section">
                  <h3 className="section-title">Yêu Cầu Đã Ghim</h3>
                  <div className="pinned-requests-list">
                    {openRequests
                      .filter((request) => pinnedRequests.includes(request.maLopHP))
                      .map((request) => (
                        <ClassRequestTicket
                          key={`pinned-${request.maYeuCau}`}
                          request={{
                            id: request.maLopHP,
                            courseName: request.tenMH,
                            creatorName: request.tenSinhVien,
                            creatorStudentId: request.maSV,
                            semester: request.hocKy.replace("HK", ""),
                            batch: request.namHoc,
                            participantCount: request.soLuongDangKy,
                            createdAt: request.ngayGui,
                          }}
                          onJoin={handleJoinRequest}
                          onViewParticipants={() => {}}
                          onViewDetails={() => {}}
                          currentUser={userId}
                          isPinned={true}
                          onTogglePin={handleTogglePin}
                        />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <button className="chat-toggle-button" onClick={toggleChat} title="Chat">
        💬
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
  )
}
