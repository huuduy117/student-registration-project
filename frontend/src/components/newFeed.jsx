"use client";

import "../assets/NewFeed.css";
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Chat from "../pages/Chat";
import ClassRequestTicket from "./Chat/ClassRequestTicket";
import ParticipantsList from "./Chat/ParticipantsList";
import RequestDetails from "./Chat/RequestDetails";
import axios from "axios";
import { normalizeRole } from "../utils/roleUtils";

export default function NewFeed() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [username, setUsername] = useState("Anonymous User");
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [pinnedRequests, setPinnedRequests] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // Add new state variables for modals and participant details
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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
      setUserRole(normalizeRole(authData.userRole));
    }

    // Load pinned requests from localStorage
    const savedPinnedRequests = localStorage.getItem("pinnedRequests");
    if (savedPinnedRequests) {
      setPinnedRequests(JSON.parse(savedPinnedRequests));
    }

    // Load open requests from sessionStorage nếu có
    const savedOpenRequests = sessionStorage.getItem("openRequests");
    if (savedOpenRequests) {
      setOpenRequests(JSON.parse(savedOpenRequests));
    }

    // Fetch open requests
    fetchOpenRequests();

    // Fetch news
    fetchNews();
  }, []);

  useEffect(() => {
    fetchOpenRequests();
  }, [userId]);

  const fetchOpenRequests = async () => {
    try {
      setLoading(true);
      // Lấy danh sách yêu cầu mở lớp từ bảng YeuCauMoLop qua API backend
      const response = await axios.get("/api/class-requests", {
        headers: {
          Authorization: `Bearer ${
            JSON.parse(
              sessionStorage.getItem(`auth_${sessionStorage.getItem("tabId")}`)
            ).token
          }`,
        },
      });
      console.log("[newFeed] openRequests from API:", response.data);
      const requestData = response.data?.data || [];
      setOpenRequests(requestData);
      sessionStorage.setItem("openRequests", JSON.stringify(requestData));
    } catch (error) {
      console.error("Error fetching open requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Log dữ liệu sẽ render ra UI
  useEffect(() => {
    console.log("[newFeed] openRequests for render:", openRequests);
  }, [openRequests]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/newsfeed", {
        params: { userType: userRole },
        headers: {
          Authorization: `Bearer ${
            JSON.parse(
              sessionStorage.getItem(`auth_${sessionStorage.getItem("tabId")}`)
            ).token
          }`,
        },
      });
      setNews(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleJoinRequest = async (requestId) => {
    try {
      const request = openRequests.find((req) => req.id === requestId);
      const sectionId = request?.course_sections?.id;
      if (!sectionId) {
        return alert("Lớp học phần chưa được tạo hoặc không hợp lệ");
      }

      await axios.post(
        "/api/class-requests/join",
        { studentId: userId, sectionId: sectionId },
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
      setErrorMessage("");
      fetchOpenRequests();
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi tham gia lớp học";
      setErrorMessage(msg);
      console.error("Error joining request:", error);
      alert(msg);
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

  const handleViewParticipants = async (requestId) => {
    try {
      const request = openRequests.find((req) => req.id === requestId);
      const sectionId = request?.course_sections?.id;
      if (!sectionId) return alert("Lớp học phần chưa được khởi tạo");

      const response = await axios.get(
        `/api/class-requests/${sectionId}/participants`,
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

      if (request) {
        setSelectedRequest({
          id: request.id,
          courseName: request.courses?.name || request.course_id,
          participantCount: request.participant_count,
          participants: response.data.map((p) => ({
            studentId: p.studentId,
            fullName: p.fullName,
            class: p.className,
            joinDate: p.registeredAt,
          })),
        });
        setShowParticipantsList(true);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
      alert("Lỗi khi lấy danh sách sinh viên tham gia");
    }
  };

  const handleViewDetails = async (requestId) => {
    try {
      const request = openRequests.find((req) => req.id === requestId);
      const sectionId = request?.course_sections?.id;
      if (!sectionId) return alert("Lớp học phần chưa được khởi tạo");

      const participantsResponse = await axios.get(
        `/api/class-requests/${sectionId}/participants`,
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

      if (request) {
        setSelectedRequest({
          id: request.id,
          courseName: request.courses?.name || request.course_id,
          creatorName: request.students?.full_name || request.student_id,
          creatorStudentId: request.student_id,
          creatorClass: request.students?.classes?.name,
          semester: request.course_sections?.semester || "",
          batch: request.course_sections?.academic_year || "",
          participantCount: request.participant_count,
          description: request.description,
          createdAt: request.submitted_at,
          participants: participantsResponse.data.map((p) => ({
            studentId: p.studentId,
            fullName: p.fullName,
            class: p.className,
            joinDate: p.registeredAt,
          })),
        });
        setShowRequestDetails(true);
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      alert("Lỗi khi lấy thông tin chi tiết yêu cầu");
    }
  };

  const closeModal = () => {
    setShowParticipantsList(false);
    setShowRequestDetails(false);
    setSelectedRequest(null);
  };

  return (
    <>
      <div className="new-feed-wrapper">
        <div className="new-feed-header">
          <img
            alt="avatar"
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wWNP1GTEvZoUNtVnncA42SikCWs7AE.png"
            className="new-feed-avatar"
          />
          <div className="new-feed-user-name">{username}</div>
        </div>
        <div className="new-feed-main">
          {errorMessage && (
            <div
              className="error-message"
              style={{ color: "red", marginBottom: 8 }}
            >
              {errorMessage}
            </div>
          )}
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
                      <div key={item.id} className="news-item">
                        <div className="news-title">{item.title}</div>
                        <div className="news-content">{item.content}</div>
                        <div className="news-meta">
                          <span className="news-author">
                            {item.users?.username || "System"}
                          </span>
                          <span className="news-date">
                            {new Date(item.posted_at).toLocaleDateString()}
                          </span>
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
                    {openRequests.slice(0, 3).map((request, idx) => {
                      return (
                        <ClassRequestTicket
                          key={request.id}
                          request={{
                            id: request.id,
                            courseName: request.courses?.name || request.course_id,
                            creatorName: request.students?.full_name || request.student_id,
                            creatorStudentId: request.student_id,
                            semester: request.course_sections?.semester || "",
                            batch: request.course_sections?.academic_year || "",
                            participantCount: request.participant_count,
                            createdAt: request.submitted_at,
                          }}
                          onJoin={handleJoinRequest}
                          onViewParticipants={handleViewParticipants}
                          onViewDetails={handleViewDetails}
                          currentUser={userId}
                          isPinned={pinnedRequests.includes(request.id)}
                          onTogglePin={handleTogglePin}
                        />
                      );
                    })}
                    {openRequests.length > 3 && (
                      <div className="view-more">
                        <a href="/chat-page">Xem tất cả yêu cầu</a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-message">
                    Không có yêu cầu mở lớp mới
                  </div>
                )}
              </div>

              {/* Pinned Requests Section */}
              {pinnedRequests.length > 0 && (
                <div className="pinned-requests-section">
                  <h3 className="section-title">Yêu Cầu Đã Ghim</h3>
                  <div className="pinned-requests-list">
                    {openRequests
                      .filter((request) =>
                        pinnedRequests.includes(request.id)
                      )
                      .map((request) => (
                        <ClassRequestTicket
                          key={`pinned-${request.id}`}
                          request={{
                            id: request.id,
                            courseName: request.courses?.name || request.course_id,
                            creatorName: request.students?.full_name || request.student_id,
                            creatorStudentId: request.student_id,
                            semester: request.course_sections?.semester || "",
                            batch: request.course_sections?.academic_year || "",
                            participantCount: request.participant_count,
                            createdAt: request.submitted_at,
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

      {/* Add Modal Components */}
      {showParticipantsList && selectedRequest && (
        <div className="modal-overlay">
          <ParticipantsList
            request={selectedRequest}
            onClose={() => setShowParticipantsList(false)}
          />
        </div>
      )}

      {showRequestDetails && selectedRequest && (
        <div className="modal-overlay">
          <RequestDetails
            request={selectedRequest}
            onClose={() => setShowRequestDetails(false)}
            onJoin={handleJoinRequest}
            currentUser={userId}
          />
        </div>
      )}
    </>
  );
}
