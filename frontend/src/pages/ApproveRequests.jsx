import SideBar from "../components/sideBar";
import "../assets/Dashboard.css";
import "../assets/ApproveRequests.css";
import { useState, useEffect, useCallback } from "react";
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

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/class-requests", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });

      console.log("Raw requests:", res.data); // Debug log

      const filteredRequests = res.data.filter((r) => {
        console.log("Checking request:", r); // Debug log

        // Chỉ hiển thị các yêu cầu chưa bị từ chối hoặc hủy
        if (r.tinhTrangTongQuat === "TuChoi" || r.tinhTrangTongQuat === "Huy") {
          console.log(
            "Filtered out due to tinhTrangTongQuat:",
            r.tinhTrangTongQuat
          );
          return false;
        }

        // Kiểm tra trạng thái xử lý phù hợp với role
        if (userRole === "GiaoVu" && r.trangThaiXuLy === "1_GiaoVuNhan") {
          console.log("Matched GiaoVu");
          return true;
        }
        if (userRole === "TruongBoMon" && r.trangThaiXuLy === "2_TBMNhan") {
          console.log("Matched TruongBoMon");
          return true;
        }
        if (
          userRole === "TruongKhoa" &&
          r.trangThaiXuLy === "3_TruongKhoaNhan"
        ) {
          console.log("Matched TruongKhoa");
          return true;
        }
        console.log("No role match for:", userRole, r.trangThaiXuLy);
        return false;
      });

      console.log("Filtered requests:", filteredRequests); // Debug log
      setRequests(filteredRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  }, [userRole, authData.token]); // Chỉ tạo lại hàm khi userRole hoặc token thay đổi

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id, currentRequest) => {
    try {
      setIsProcessing(true);
      console.log(`Sending approve request for ID: ${id}`);

      const nextState =
        userRole === "GiaoVu"
          ? "2_TBMNhan"
          : userRole === "TruongBoMon"
          ? "3_TruongKhoaNhan"
          : "4_ChoMoLop";

      // Tạo mã xử lý yêu cầu
      const maXuLy = `XL_${id}_${Date.now()}`;

      const requestData = {
        currentState: currentRequest.trangThaiXuLy, // Gửi trạng thái hiện tại để validate
        nextState, // Trạng thái tiếp theo
        tinhTrangTongQuat: userRole === "TruongKhoa" ? "DaDuyet" : "DaGui",
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

      // Kiểm tra response có thành công hay không
      if (!response.data.success) {
        throw new Error(response.data.message || "Duyệt yêu cầu thất bại");
      }

      // Chỉ xóa khỏi danh sách nếu cập nhật thành công
      setRequests(requests.filter((r) => r.maYeuCau !== id));

      // Thông báo theo role
      let successMessage = "";
      if (userRole === "GiaoVu") {
        successMessage = "Đã duyệt và chuyển yêu cầu đến Trưởng bộ môn xem xét";
      } else if (userRole === "TruongBoMon") {
        successMessage = "Đã duyệt và chuyển yêu cầu đến Trưởng khoa xem xét";
      } else if (userRole === "TruongKhoa") {
        successMessage =
          "Đã phê duyệt yêu cầu. Yêu cầu sẽ được chuyển sang trạng thái chờ mở lớp";
      }
      alert(successMessage);
    } catch (error) {
      console.error("Approve error:", error);
      const errorMessage = error.response?.data?.message || error.message;

      if (errorMessage.includes("Status mismatch")) {
        alert(
          "Trạng thái yêu cầu đã thay đổi. Vui lòng tải lại danh sách để xem trạng thái mới nhất."
        );
      } else if (errorMessage.includes("history")) {
        alert("Đã xảy ra lỗi khi lưu lịch sử xử lý. Vui lòng thử lại sau.");
      } else {
        let roleSpecificMessage = "";
        if (userRole === "GiaoVu") {
          roleSpecificMessage = "Không thể chuyển yêu cầu đến Trưởng bộ môn";
        } else if (userRole === "TruongBoMon") {
          roleSpecificMessage = "Không thể chuyển yêu cầu đến Trưởng khoa";
        } else if (userRole === "TruongKhoa") {
          roleSpecificMessage =
            "Không thể chuyển yêu cầu sang trạng thái chờ mở lớp";
        }
        alert(`${roleSpecificMessage}: ${errorMessage}`);
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
      console.log(`Sending reject request for ID: ${selectedRequestId}`);

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

      // Kiểm tra response có thành công hay không
      if (!response.data.success) {
        throw new Error(response.data.message || "Từ chối yêu cầu thất bại");
      }

      // Chỉ xóa khỏi danh sách nếu cập nhật thành công
      setRequests(requests.filter((r) => r.maYeuCau !== selectedRequestId));
      setShowRejectDialog(false);

      // Thông báo theo role
      let successMessage = "";
      if (userRole === "GiaoVu") {
        successMessage = "Đã từ chối yêu cầu ở cấp Giáo vụ";
      } else if (userRole === "TruongBoMon") {
        successMessage = "Đã từ chối yêu cầu ở cấp Trưởng bộ môn";
      } else if (userRole === "TruongKhoa") {
        successMessage = "Đã từ chối yêu cầu ở cấp Trưởng khoa";
      }
      alert(successMessage);
    } catch (error) {
      console.error("Reject error:", error);
      const errorMessage = error.response?.data?.message || error.message;

      if (errorMessage.includes("Status mismatch")) {
        alert(
          "Trạng thái yêu cầu đã thay đổi. Vui lòng tải lại danh sách để xem trạng thái mới nhất."
        );
      } else if (errorMessage.includes("history")) {
        alert("Đã xảy ra lỗi khi lưu lịch sử từ chối. Vui lòng thử lại sau.");
      } else {
        alert(`Không thể từ chối yêu cầu: ${errorMessage}`);
      }
      await fetchRequests();
    } finally {
      setIsProcessing(false);
      if (showRejectDialog) {
        setShowRejectDialog(false);
      }
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
              <div className="empty-state">
                <p>Không có yêu cầu nào cần duyệt</p>
                <button onClick={fetchRequests} className="refresh-btn">
                  Tải lại danh sách
                </button>
              </div>
            ) : (
              <>
                <div className="refresh-container">
                  <button onClick={fetchRequests} className="refresh-btn">
                    Tải lại danh sách
                  </button>
                </div>
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
              </>
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
