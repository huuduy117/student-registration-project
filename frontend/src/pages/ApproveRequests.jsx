import SideBar from "../components/sideBar";
import "../assets/Dashboard.css";
import "../assets/ApproveRequests.css";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
} from "lucide-react";

const ApproveRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all, hasTeacher, noTeacher
  const tabId = sessionStorage.getItem("tabId");
  const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}");
  const userRole = authData.userRole;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      console.log("=== Debug ApproveRequests (TruongBoMon) ===");
      console.log("User info:", {
        userId: authData.userId,
        userRole: authData.userRole,
      });

      const res = await axios.get("/api/class-requests", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });

      console.log("Raw requests from API:", res.data);

      // Lọc các yêu cầu theo vai trò
      const filteredRequests = res.data.filter((r) => {
        // Chỉ hiển thị các yêu cầu chưa bị từ chối hoặc hủy
        if (r.tinhTrangTongQuat === "TuChoi" || r.tinhTrangTongQuat === "Huy") {
          return false;
        }

        // Lọc theo vai trò
        if (userRole === "GiaoVu" && r.trangThaiXuLy === "1_GiaoVuNhan") {
          return true;
        }
        if (userRole === "TruongBoMon" && r.trangThaiXuLy === "2_TBMNhan") {
          return true;
        }
        if (
          userRole === "TruongKhoa" &&
          r.trangThaiXuLy === "3_TruongKhoaNhan"
        ) {
          return true;
        }
        return false;
      });

      console.log("Requests filtered by role:", {
        userRole,
        filteredRequests,
      });

      // Sử dụng trạng thái hasTeacherRegistration trực tiếp từ backend
      const requestsWithTeacherStatus = filteredRequests.map((request) => ({
        ...request,
        hasTeacherRegistration: request.hasTeacherRegistration || false,
        newClassSectionId: `${request.maLopHP}_NEW`,
      }));

      // Log chi tiết trạng thái giảng viên cho từng yêu cầu
      console.log("\n=== Teacher Registration Status Details ===");
      requestsWithTeacherStatus.forEach((request) => {
        console.log(`\nRequest ${request.maYeuCau}:`, {
          maLopHP: request.maLopHP,
          newClassSectionId: request.newClassSectionId,
          maGV: request.maGV,
          tenGV: request.tenGV,
          hasTeacherRegistration: request.hasTeacherRegistration,
          trangThaiXuLy: request.trangThaiXuLy,
          tinhTrangTongQuat: request.tinhTrangTongQuat,
        });
      });

      // Log thống kê
      console.log("\n=== Teacher Registration Statistics ===");
      console.log("Total requests:", requestsWithTeacherStatus.length);
      const withTeacher = requestsWithTeacherStatus.filter(
        (r) => r.hasTeacherRegistration
      );
      const withoutTeacher = requestsWithTeacherStatus.filter(
        (r) => !r.hasTeacherRegistration
      );
      console.log("Requests with teacher:", withTeacher.length);
      console.log("Requests without teacher:", withoutTeacher.length);

      // Log chi tiết các lớp có giảng viên
      if (withTeacher.length > 0) {
        console.log("\nClasses with teachers:");
        withTeacher.forEach((r) => {
          console.log(`- ${r.newClassSectionId}: ${r.tenGV} (${r.maGV})`);
        });
      }

      // Log chi tiết các lớp chưa có giảng viên
      if (withoutTeacher.length > 0) {
        console.log("\nClasses without teachers:");
        withoutTeacher.forEach((r) => {
          console.log(`- ${r.newClassSectionId}`);
        });
      }

      setRequests(requestsWithTeacherStatus);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  }, [userRole, authData.token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id, currentRequest) => {
    // Kiểm tra điều kiện trưởng bộ môn phải có giảng viên đăng ký mới được duyệt
    if (
      userRole === "TruongBoMon" &&
      !currentRequest.hasTeacherRegistration
    ) {
      alert("Bạn không thể duyệt khi chưa có giảng viên đăng ký giảng dạy cho lớp này!");
      return;
    }
    try {
      setIsProcessing(true);
      console.log("\n=== Debug Approve Request ===");
      console.log("Approving request:", {
        id,
        currentState: currentRequest.trangThaiXuLy,
        tinhTrangTongQuat: currentRequest.tinhTrangTongQuat,
        hasTeacherRegistration: currentRequest.hasTeacherRegistration,
      });

      // Xác định trạng thái tiếp theo và tình trạng tổng quát dựa vào vai trò
      const roleTransitions = {
        GiaoVu: {
          nextState: "2_TBMNhan",
          tinhTrang: "DaGui",
          message:
            "Đã duyệt yêu cầu. Yêu cầu sẽ được chuyển đến Trưởng bộ môn.",
        },
        TruongBoMon: {
          nextState: "3_TruongKhoaNhan",
          tinhTrang: "DaGui",
          message: "Đã duyệt yêu cầu. Yêu cầu sẽ được chuyển đến Trưởng khoa.",
        },
        TruongKhoa: {
          nextState: "4_ChoMoLop",
          tinhTrang: "DaDuyet",
          message:
            "Đã duyệt yêu cầu. Yêu cầu sẽ được chuyển sang trạng thái chờ mở lớp.",
        },
      };

      const transition = roleTransitions[userRole];
      if (!transition) {
        throw new Error("Vai trò người dùng không hợp lệ");
      }

      const nextState = transition.nextState;
      const tinhTrangTongQuat = transition.tinhTrang;

      console.log("State transition:", {
        currentState: currentRequest.trangThaiXuLy,
        nextState,
        tinhTrangTongQuat,
        role: userRole,
      });

      // Tạo mã xử lý yêu cầu
      const maXuLy = `XL_${id}_${Date.now()}`;

      const requestData = {
        currentState: currentRequest.trangThaiXuLy,
        nextState,
        tinhTrangTongQuat,
        xuLyYeuCau: {
          maXuLy, // Thêm mã xử lý để tracking
          maYeuCau: id,
          vaiTroNguoiXuLy: userRole,
          nguoiXuLy: authData.userId,
          trangThai: userRole === "TruongKhoa" ? "DongY" : "ChuyenTiep",
          ghiChu:
            userRole === "TruongKhoa"
              ? "Đã duyệt yêu cầu"
              : "Chuyển tiếp yêu cầu lên cấp cao hơn",
          ngayXuLy: new Date().toISOString(),
        },
      };

      await axios.patch(`/api/class-requests/${id}/approve`, requestData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "application/json",
        },
      });

      // Cập nhật UI và hiển thị thông báo thành công
      setRequests(requests.filter((r) => r.maYeuCau !== id));
      alert(transition.message);
    } catch (error) {
      console.error("Approve error:", error);
      const errorMessage = error.response?.data?.message || error.message;

      // Nếu message trả về là 'Duyệt yêu cầu thành công' thì không alert lỗi
      if (errorMessage && errorMessage.toLowerCase().includes("thành công")) {
        // Đã xử lý thành công, không cần alert lỗi
        console.log("Server message (success):", errorMessage);
        return;
      }

      // Xử lý các trường hợp lỗi thực sự
      if (errorMessage.includes("Status mismatch")) {
        alert(
          "Trạng thái yêu cầu đã thay đổi. Vui lòng tải lại danh sách để xem trạng thái mới nhất."
        );
      } else if (errorMessage.includes("history")) {
        alert("Không thể lưu lịch sử xử lý. Vui lòng thử lại sau.");
      } else {
        alert(`Không thể xử lý yêu cầu: ${errorMessage}`);
      }
      await fetchRequests();
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectDialog = (id) => {
    setSelectedRequestId(id);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối yêu cầu");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("\n=== Debug Reject Request ===");
      console.log("Rejecting request:", {
        id: selectedRequestId,
        reason: rejectReason,
        currentRequest: requests.find((r) => r.maYeuCau === selectedRequestId),
      });

      const currentRequest = requests.find(
        (r) => r.maYeuCau === selectedRequestId
      );
      if (!currentRequest) {
        throw new Error("Không tìm thấy yêu cầu");
      }

      // Tạo mã xử lý yêu cầu
      const maXuLy = `XL_${selectedRequestId}_${Date.now()}`;

      const requestData = {
        currentState: currentRequest.trangThaiXuLy, // Gửi trạng thái hiện tại để validate
        tinhTrangTongQuat: "TuChoi",
        xuLyYeuCau: {
          maXuLy,
          maYeuCau: selectedRequestId,
          vaiTroNguoiXuLy: userRole,
          nguoiXuLy: authData.userId,
          trangThai: "TuChoi",
          ghiChu: rejectReason,
          ngayXuLy: new Date().toISOString(),
        },
      };
      const response = await axios.patch(
        `/api/class-requests/${selectedRequestId}/reject`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Nếu có lỗi từ server
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Cập nhật UI
      setRequests(requests.filter((r) => r.maYeuCau !== selectedRequestId));
      setShowRejectDialog(false);

      // Hiển thị thông báo thành công
      alert("Đã từ chối yêu cầu thành công");
    } catch (error) {
      console.error("Reject error:", error);
      const errorMessage = error.response?.data?.message || error.message;

      // Xử lý các trường hợp lỗi
      if (errorMessage.includes("Status mismatch")) {
        alert(
          "Trạng thái yêu cầu đã thay đổi. Vui lòng tải lại danh sách để xem trạng thái mới nhất."
        );
      } else if (errorMessage.includes("history")) {
        alert("Không thể lưu lịch sử từ chối. Vui lòng thử lại sau.");
      } else {
        alert(`Không thể xử lý yêu cầu: ${errorMessage}`);
      }
      await fetchRequests();
    } finally {
      setIsProcessing(false);
      if (showRejectDialog) {
        setShowRejectDialog(false);
      }
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filterType === "all") return true;
    if (filterType === "hasTeacher") return request.hasTeacherRegistration;
    if (filterType === "noTeacher") return !request.hasTeacherRegistration;
    return true;
  });

  const stats = {
    total: requests.length,
    hasTeacher: requests.filter((r) => r.hasTeacherRegistration).length,
    noTeacher: requests.filter((r) => !r.hasTeacherRegistration).length,
  };

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Phê duyệt yêu cầu mở lớp</h1>
          <div className="user-info">
            <div className="user-name">
              {userRole === "GiaoVu"
                ? "Giáo vụ"
                : userRole === "TruongBoMon"
                ? "Trưởng bộ môn"
                : "Trưởng khoa"}
            </div>
          </div>
        </div>

        {userRole === "TruongBoMon" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Tổng yêu cầu</div>
                  <div className="stat-icon">
                    <Users size={20} />
                  </div>
                </div>
                <div className="stat-value">{stats.total}</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Có giảng viên đăng ký</div>
                  <div className="stat-icon">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className="stat-value" style={{ color: "#10b981" }}>
                  {stats.hasTeacher}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Chưa có giảng viên</div>
                  <div className="stat-icon">
                    <Clock size={20} />
                  </div>
                </div>
                <div className="stat-value" style={{ color: "#f59e0b" }}>
                  {stats.noTeacher}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Bộ lọc</div>
                  <div className="stat-icon">
                    <Filter size={20} />
                  </div>
                </div>
                <select
                  className="modern-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="hasTeacher">Có giảng viên đăng ký</option>
                  <option value="noTeacher">Chưa có giảng viên</option>
                </select>
              </div>
            </div>
          </>
        )}

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Danh sách yêu cầu chờ xử lý</h2>
            <button onClick={fetchRequests} className="refresh-btn">
              <RefreshCw size={16} />
              Tải lại danh sách
            </button>
          </div>

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p>Không có yêu cầu nào cần duyệt</p>
              <button onClick={fetchRequests} className="refresh-btn">
                Tải lại danh sách
              </button>
            </div>
          ) : (
            <div className="responsive-table-wrapper">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Mã yêu cầu</th>
                    <th>Môn học</th>
                    <th>Sinh viên</th>
                    <th>Mã SV</th>
                    <th>Ngày gửi</th>
                    <th>Số lượng SV</th>
                    {userRole === "TruongBoMon" && <th>Trạng thái GV</th>}
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((r) => (
                    <tr
                      key={r.maYeuCau}
                      className={
                        userRole === "TruongBoMon"
                          ? r.hasTeacherRegistration
                            ? "has-teacher"
                            : "no-teacher"
                          : ""
                      }
                    >
                      <td>{r.maYeuCau}</td>
                      <td>{r.tenMH}</td>
                      <td>{r.tenSinhVien}</td>
                      <td>{r.maSV}</td>
                      <td>{new Date(r.ngayGui).toLocaleDateString("vi-VN")}</td>
                      <td>{r.soLuongThamGia}/30</td>
                      {userRole === "TruongBoMon" && (
                        <td>
                          <div
                            className={`teacher-status ${
                              r.hasTeacherRegistration
                                ? "has-teacher"
                                : "no-teacher"
                            }`}
                          >
                            {r.hasTeacherRegistration ? (
                              <>
                                <CheckCircle size={16} />
                                <span>Đã có giảng viên đăng ký</span>
                              </>
                            ) : (
                              <>
                                <Clock size={16} />
                                <span>Chưa có giảng viên đăng ký</span>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                      <td>
                        <div className="action-buttons">
                          <button
                            className="approve-btn"
                            onClick={() => handleApprove(r.maYeuCau, r)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Đang xử lý..." : "Duyệt"}
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => openRejectDialog(r.maYeuCau)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Đang xử lý..." : "Từ chối"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showRejectDialog && (
          <div className="reject-dialog-overlay">
            <div className="reject-dialog">
              <h3>Nhập lý do từ chối</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối yêu cầu..."
                rows={4}
              />
              <div className="dialog-buttons">
                <button onClick={handleReject} disabled={isProcessing}>
                  {isProcessing ? "Đang xử lý..." : "Xác nhận"}
                </button>
                <button
                  onClick={() => setShowRejectDialog(false)}
                  disabled={isProcessing}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ApproveRequestsPage;
