import SideBar from "../components/sideBar";
import "../assets/Dashboard.css";
import "../assets/ApproveRequests.css";
import { useState, useEffect } from "react";
import axios from "axios";

const ApproveRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
            if (userRole === "GiaoVu")
              return r.trangThaiXuLy === "1_GiaoVuNhan";
            if (userRole === "TruongBoMon")
              return r.trangThaiXuLy === "2_TBMNhan";
            if (userRole === "TruongKhoa")
              return r.trangThaiXuLy === "3_TruongKhoaNhan";
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

  const handleApprove = async (id) => {
    try {
      console.log(`Sending approve request for ID: ${id}`);
      const response = await axios.patch(
        `/api/class-requests/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Approve response:", response.data);
      setRequests(requests.filter((r) => r.maYeuCau !== id));
    } catch (error) {
      console.error("Approve error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      alert(
        `Duyệt thất bại: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleReject = async (id) => {
    try {
      console.log(`Sending reject request for ID: ${id}`);
      const response = await axios.patch(
        `/api/class-requests/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Reject response:", response.data);
      setRequests(requests.filter((r) => r.maYeuCau !== id));
    } catch (error) {
      console.error("Reject error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      alert(
        `Từ chối thất bại: ${error.response?.data?.message || error.message}`
      );
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
                            onClick={() => handleApprove(r.maYeuCau)}
                          >
                            Duyệt
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleReject(r.maYeuCau)}
                          >
                            Từ chối
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
      </main>
    </div>
  );
};

export default ApproveRequestsPage;
