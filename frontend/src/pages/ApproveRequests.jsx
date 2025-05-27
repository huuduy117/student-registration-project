import SideBar from "../components/sideBar";
import "../assets/Dashboard.css";
import "../assets/ApproveRequests.css";
import { useState, useEffect } from "react";
import axios from "axios";

const ApproveRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const tabId = sessionStorage.getItem("tabId");
  const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}");
  const userRole = authData.userRole;

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/class-requests", {
          headers: { Authorization: `Bearer ${authData.token}` },
        });
        setRequests(
          res.data.filter((r) => {
            // Chỉ hiển thị các yêu cầu chưa bị từ chối hoặc hủy
            if (
              r.tinhTrangTongQuat === "TuChoi" ||
              r.tinhTrangTongQuat === "Huy"
            ) {
              return false;
            }

            // Kiểm tra trạng thái xử lý phù hợp với role
            if (userRole === "GiaoVu") {
              return r.trangThaiXuLy === "1_GiaoVuNhan";
            }
            if (userRole === "TruongBoMon") {
              return r.trangThaiXuLy === "2_TBMNhan";
            }
            if (userRole === "TruongKhoa") {
              return r.trangThaiXuLy === "3_TruongKhoaNhan";
            }
            return false;
          })
        );
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Không thể tải danh sách yêu cầu");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [userRole, authData.token]);

  const handleApprove = async (id, currentRequest) => {
    try {
      setIsProcessing(true);
      console.log(`Sending approve request for ID: ${id}`);

      // Xác định trạng thái tiếp theo dựa vào role
      const nextState =
        userRole === "GiaoVu"
          ? "2_TBMNhan"
          : userRole === "TruongBoMon"
          ? "3_TruongKhoaNhan"
          : "4_ChoMoLop";

      const requestData = {
        currentState: currentRequest.trangThaiXuLy, // Gửi trạng thái hiện tại để validate
        nextState, // Trạng thái tiếp theo
        tinhTrangTongQuat: userRole === "TruongKhoa" ? "DaDuyet" : "DaGui",
        xuLyYeuCau: {
          maYeuCau: id,
          vaiTroNguoiXuLy: userRole,
          nguoiXuLy: authData.userId,
          trangThai: userRole === "TruongKhoa" ? "DongY" : "ChuyenTiep",
          ghiChu:
            userRole === "TruongKhoa"
              ? "Đã duyệt yêu cầu"
              : "Chuyển tiếp yêu cầu lên cấp cao hơn",
        },
      };

      const response = await axios.patch(
        `/api/class-requests/${id}/approve`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Approve response:", response.data);
      setRequests(requests.filter((r) => r.maYeuCau !== id));
      alert(
        userRole === "TruongKhoa"
          ? "Đã duyệt yêu cầu thành công! Yêu cầu sẽ được chuyển sang trạng thái chờ mở lớp."
          : "Đã duyệt yêu cầu thành công!"
      );
    } catch (error) {
      console.error("Approve error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes("Status mismatch")) {
        alert(
          "Không thể duyệt yêu cầu: Trạng thái yêu cầu đã thay đổi. Vui lòng tải lại trang."
        );
      } else {
        alert(`Duyệt thất bại: ${errorMessage}`);
      }
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
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setIsProcessing(true);
      console.log(`Sending reject request for ID: ${selectedRequestId}`);

      // Tìm request hiện tại để lấy trạng thái
      const currentRequest = requests.find(
        (r) => r.maYeuCau === selectedRequestId
      );
      if (!currentRequest) {
        throw new Error("Không tìm thấy yêu cầu");
      }

      const requestData = {
        currentState: currentRequest.trangThaiXuLy, // Gửi trạng thái hiện tại để validate
        tinhTrangTongQuat: "TuChoi",
        xuLyYeuCau: {
          maYeuCau: selectedRequestId,
          vaiTroNguoiXuLy: userRole,
          nguoiXuLy: authData.userId,
          trangThai: "TuChoi",
          ghiChu: rejectReason,
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

      console.log("Reject response:", response.data);
      setRequests(requests.filter((r) => r.maYeuCau !== selectedRequestId));
      setShowRejectDialog(false);
      alert("Đã từ chối yêu cầu thành công!");
    } catch (error) {
      console.error("Reject error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes("Status mismatch")) {
        alert(
          "Không thể từ chối yêu cầu: Trạng thái yêu cầu đã thay đổi. Vui lòng tải lại trang."
        );
      } else {
        alert(`Từ chối thất bại: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
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
        <div className="dashboard-content">
          <section className="dashboard-section">
            <h2>Danh sách yêu cầu chờ xử lý</h2>
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : requests.length === 0 ? (
              <div className="empty-state">Không có yêu cầu nào cần duyệt</div>
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
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.maYeuCau}>
                        <td>{r.maYeuCau}</td>
                        <td>{r.tenMH}</td>
                        <td>{r.tenSinhVien}</td>
                        <td>{r.maSV}</td>
                        <td>
                          {new Date(r.ngayGui).toLocaleDateString("vi-VN")}
                        </td>
                        <td>{r.soLuongThamGia}/30</td>
                        <td>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

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
