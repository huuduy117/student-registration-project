import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClassRequestTicket from "./Chat/ClassRequestTicket";
import JoinClassForm from "./Chat/JoinClassForm";
import ParticipantsList from "./Chat/ParticipantsList";
import RequestDetails from "./Chat/RequestDetails";

const ClassRegistrationSection = ({ userId, userRole }) => {
  const [classRequests, setClassRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [pinnedRequests, setPinnedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load pinned requests from localStorage
    const savedPinnedRequests = localStorage.getItem("pinnedRequests");
    if (savedPinnedRequests) {
      setPinnedRequests(JSON.parse(savedPinnedRequests));
    }

    // Fetch class requests and available courses
    fetchClassRequests();
    fetchAvailableCourses();
  }, []);

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
      await axios.get("/api/class-requests/available-courses", {
        headers: {
          Authorization: `Bearer ${
            JSON.parse(
              sessionStorage.getItem(`auth_${sessionStorage.getItem("tabId")}`)
            ).token
          }`,
        },
      });
    } catch (error) {
      console.error("Error fetching available courses:", error);
    }
  };

  const handleJoinRequest = async (requestId) => {
    try {
      if (!userId) {
        setErrorMessage("Không tìm thấy thông tin sinh viên");
        console.error("Missing userId when attempting to join class");
        return;
      }

      const response = await axios.post(
        "/api/class-requests/join",
        {
          maSV: userId,
          maLopHP: requestId,
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
          id: request.maLopHP,
          courseName: request.tenMH,
          participantCount: request.soLuongThamGia,
          participants: response.data.map((p) => ({
            studentId: p.maSV,
            fullName: p.hoTen,
            class: p.lop,
            joinDate: p.ngayDangKy,
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
      const participantsResponse = await axios.get(
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
          id: request.maLopHP,
          courseName: request.tenMH,
          creatorName: request.tenSinhVien,
          creatorStudentId: request.maSV,
          creatorClass: request.tenLop,
          semester: request.hocKy ? request.hocKy.replace("HK", "") : "",
          batch: request.namHoc,
          participantCount: request.soLuongThamGia,
          description: request.description,
          createdAt: request.ngayGui,
          participants: participantsResponse.data,
        });
        setShowRequestDetails(true);
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      alert("Lỗi khi lấy thông tin chi tiết yêu cầu");
    }
  };

  const handleJoinClassRequest = async (joinData) => {
    try {
      if (!userId) {
        setErrorMessage("Không tìm thấy thông tin sinh viên");
        console.error("Missing userId when attempting to join class");
        return;
      }

      const response = await axios.post(
        "/api/class-requests/join",
        {
          maSV: userId,
          maLopHP: joinData.maLopHP,
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

  return (
    <div className="dashboard-section">
      {errorMessage && (
        <div
          className="error-message"
          style={{ color: "red", marginBottom: 8 }}
        >
          {errorMessage}
        </div>
      )}
      <div className="section-header-with-link">
        <h2>Yêu cầu mở lớp học phần</h2>
        {userRole === "SinhVien" && (
          <button className="view-all-link" onClick={handleCreateRequest}>
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
                      participantCount: request.soLuongThamGia,
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
                    participantCount: request.soLuongThamGia,
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
              <div className="empty-message">Không có yêu cầu mở lớp nào</div>
            )}
          </div>
        </>
      )}

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
    </div>
  );
};

export default ClassRegistrationSection;
