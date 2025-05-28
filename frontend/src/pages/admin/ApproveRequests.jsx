"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "../../components/sideBar";
import "../../assets/UserManagement.css";

// STATUS_OPTIONS for ApproveRequests (pure CSS version, no DaMoLop)
const STATUS_OPTIONS = [
  { label: "Đã gửi", value: "DaGui", className: "um-chip um-chip-info" },
  { label: "Đã duyệt", value: "DaDuyet", className: "um-chip um-chip-success" },
  { label: "Từ chối", value: "TuChoi", className: "um-chip um-chip-danger" },
];

const AdminApproveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [history, setHistory] = useState([]);
  const [newStatus, setNewStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      const res = await axios.get("/api/admin/class-requests", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      const arr = Array.isArray(res.data) ? res.data : [];
      setRequests(
        arr.map((item) => ({
          id: item.id,
          courseName: item.courseName,
          participantCount: item.participantCount || 0,
          description: item.description || "",
          status: item.status,
          processStatus: item.processStatus,
          requestDate: new Date(item.requestDate).toLocaleDateString("vi-VN"),
          requesterName: item.requesterName,
          classCode: item.classCode,
        }))
      );
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = async (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setOpenDialog(true);

    // Fetch request history
    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      const res = await axios.get(
        `/api/admin/class-requests/${request.id}/history`,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );
      setHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setHistory([]);
    setNewStatus("");
    setError(null);
    setSuccess(null);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === selectedRequest.status) {
      setError("Vui lòng chọn trạng thái mới");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      await axios.put(
        `/api/admin/class-requests/${selectedRequest.id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      setSuccess("Cập nhật trạng thái thành công");
      fetchRequests();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Lỗi khi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  // Replace getStatusChip with a className function
  const getStatusChip = (status) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return (
      <span className={statusOption?.className || "um-chip"}>
        {statusOption?.label || status}
      </span>
    );
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="um-container">
      <SideBar />
      <main>
        <div className="um-title">Xét duyệt yêu cầu mở lớp</div>
        <div className="um-toolbar">
          <button
            className="um-btn um-btn-secondary"
            onClick={fetchRequests}
            disabled={loading}
          >
            Làm mới
          </button>
        </div>
        {error && <div className="um-alert um-alert-error">{error}</div>}
        {success && <div className="um-alert um-alert-success">{success}</div>}
        {loading && !openDialog ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="um-loading-spinner" />
          </div>
        ) : (
          <div className="um-table-wrapper">
            <table className="um-table">
              <thead>
                <tr>
                  <th>Mã yêu cầu</th>
                  <th>Môn học</th>
                  <th>Người yêu cầu</th>
                  <th>Số lượng đăng ký</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      Không có yêu cầu nào
                    </td>
                  </tr>
                ) : (
                  requests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request) => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {request.courseName}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.95em" }}>
                            {request.classCode}
                          </div>
                        </td>
                        <td>{request.requesterName}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className="um-chip um-chip-primary">
                            {request.participantCount}
                          </span>
                        </td>
                        <td>{request.requestDate}</td>
                        <td style={{ textAlign: "center" }}>
                          {getStatusChip(request.status)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="um-btn"
                            onClick={() => handleOpenDialog(request)}
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
            <div className="um-pagination">
              <span>
                Số dòng mỗi trang:
                <select
                  className="um-input"
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  style={{ width: 60, marginLeft: 8 }}
                >
                  {[5, 10, 25].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </span>
              <span style={{ marginLeft: 24 }}>
                {page * rowsPerPage + 1}-
                {Math.min((page + 1) * rowsPerPage, requests.length)} của{" "}
                {requests.length}
              </span>
              <button
                className="um-btn um-btn-secondary"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{ marginLeft: 16 }}
              >
                Trước
              </button>
              <button
                className="um-btn um-btn-secondary"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * rowsPerPage >= requests.length}
                style={{ marginLeft: 8 }}
              >
                Sau
              </button>
            </div>
          </div>
        )}
        {openDialog && (
          <>
            <div className="um-modal-backdrop" onClick={handleCloseDialog} />
            <div className="um-modal" style={{ maxWidth: 600 }}>
              <div className="um-title" style={{ fontSize: "1.2rem" }}>
                Chi tiết yêu cầu mở lớp
              </div>
              {error && <div className="um-alert um-alert-error">{error}</div>}
              {success && (
                <div className="um-alert um-alert-success">{success}</div>
              )}
              {selectedRequest && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div className="um-label">
                      Mã yêu cầu: <b>{selectedRequest.id}</b>
                    </div>
                    <div className="um-label">
                      Môn học: <b>{selectedRequest.courseName}</b>
                    </div>
                    <div className="um-label">
                      Mã lớp: <b>{selectedRequest.classCode}</b>
                    </div>
                    <div className="um-label">
                      Người yêu cầu: <b>{selectedRequest.requesterName}</b>
                    </div>
                    <div className="um-label">
                      Số lượng đăng ký:{" "}
                      <b>{selectedRequest.participantCount}</b>
                    </div>
                    <div className="um-label">
                      Ngày gửi: <b>{selectedRequest.requestDate}</b>
                    </div>
                    {selectedRequest.description && (
                      <div className="um-label">
                        Mô tả: <b>{selectedRequest.description}</b>
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div className="um-label">Trạng thái mới</div>
                    <select
                      className="um-input"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Chọn trạng thái</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div className="um-label">Lịch sử xử lý</div>
                    {history.length === 0 ? (
                      <div style={{ color: "#888" }}>Chưa có lịch sử xử lý</div>
                    ) : (
                      <ul style={{ paddingLeft: 18, margin: 0 }}>
                        {history.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>
                            <span style={{ fontWeight: 500 }}>
                              {item.oldStatus} → {item.newStatus}
                            </span>
                            <span style={{ color: "#888", marginLeft: 8 }}>
                              {item.changedBy} •{" "}
                              {new Date(item.changeDate).toLocaleString(
                                "vi-VN"
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="um-actions">
                    <button
                      className="um-btn um-btn-secondary"
                      onClick={handleCloseDialog}
                      disabled={loading}
                    >
                      Đóng
                    </button>
                    <button
                      className="um-btn"
                      onClick={handleUpdateStatus}
                      disabled={
                        loading ||
                        !newStatus ||
                        newStatus === selectedRequest.status
                      }
                    >
                      {loading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminApproveRequests;
