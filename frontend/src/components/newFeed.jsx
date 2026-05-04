"use client";

import "../assets/NewFeed.css";
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Chat from "../pages/Chat";
import ClassRequestTicket from "./Chat/ClassRequestTicket";
import ParticipantsList from "./Chat/ParticipantsList";
import RequestDetails from "./Chat/RequestDetails";
import api from "../api/client";
import { normalizeRole } from "../utils/roleUtils";

function parseListPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function getAuthToken() {
  const tabId = sessionStorage.getItem("tabId");
  const raw = sessionStorage.getItem(`auth_${tabId}`);
  if (!raw) return "";
  try {
    return JSON.parse(raw).token || "";
  } catch {
    return "";
  }
}

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

    const savedPinnedRequests = localStorage.getItem("pinnedRequests");
    if (savedPinnedRequests) {
      try {
        setPinnedRequests(JSON.parse(savedPinnedRequests));
      } catch {
        setPinnedRequests([]);
      }
    }
  }, []);

  const fetchOpenRequests = async (signal) => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return null;
    }
    try {
      setLoading(true);
      const response = await api.get("/api/class-requests", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const requestData = parseListPayload(response.data);
      console.log("[newFeed] openRequests count:", requestData.length);
      return requestData;
    } catch (error) {
      if (error?.code === "ERR_CANCELED") return null;
      console.error("Error fetching open requests:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async (role, signal) => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const response = await api.get("/api/newsfeed", {
        params: { userType: role },
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      return parseListPayload(response.data);
    } catch (error) {
      if (error?.code === "ERR_CANCELED") return null;
      console.error("Error fetching news:", error);
      return null;
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    let alive = true;
    (async () => {
      const data = await fetchOpenRequests(ac.signal);
      if (!alive || data == null) return;
      setOpenRequests(data);
      sessionStorage.setItem("openRequests", JSON.stringify(data));
    })();
    return () => {
      alive = false;
      ac.abort();
    };
  }, [userId]);

  useEffect(() => {
    if (!userRole) return undefined;
    const ac = new AbortController();
    let alive = true;
    (async () => {
      const items = await fetchNews(userRole, ac.signal);
      if (!alive || items == null) return;
      setNews(items);
    })();
    return () => {
      alive = false;
      ac.abort();
    };
  }, [userRole]);

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

      await api.post(
        "/api/class-requests/join",
        { studentId: userId, sectionId },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      setErrorMessage("");
      const refreshed = await fetchOpenRequests();
      if (refreshed != null) {
        setOpenRequests(refreshed);
        sessionStorage.setItem("openRequests", JSON.stringify(refreshed));
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Lỗi khi tham gia lớp học";
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

      const response = await api.get(
        `/api/class-requests/${sectionId}/participants`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );

      if (request) {
        setSelectedRequest({
          id: request.id,
          courseName: request.courses?.name || request.course_id,
          participantCount: request.participant_count,
          participants: parseListPayload(response.data).map((p) => ({
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

      const participantsResponse = await api.get(
        `/api/class-requests/${sectionId}/participants`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
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
          participants: parseListPayload(participantsResponse.data).map((p) => ({
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
