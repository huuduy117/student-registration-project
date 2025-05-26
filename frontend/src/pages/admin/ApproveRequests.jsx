import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import "../../assets/Dashboard.css";

const STATUS = [
  { label: "Đã gửi", value: "DaGui" },
  { label: "Đã duyệt", value: "DaDuyet" },
  { label: "Từ chối", value: "TuChoi" },
  { label: "Đã mở lớp", value: "DaMoLop" },
];

const AdminApproveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/class-requests");
      // Map lại dữ liệu cho đúng format UI
      const arr = Array.isArray(res.data) ? res.data : [];
      setRequests(
        arr.map((item) => ({
          id: item.maYeuCau,
          courseName: item.tenMH,
          participantCount: item.soLuongThamGia,
          description: item.description,
          status: item.tinhTrangTongQuat,
        }))
      );
    } catch {
      setError("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };
  const handleOpenDialog = async (req) => {
    setSelected(req);
    setStatus(req.status);
    setOpenDialog(true);
    // Lấy lịch sử xử lý
    try {
      const res = await axios.get(
        `/api/admin/class-requests/${req.id}/history`
      );
      setHistory(res.data);
    } catch {
      setHistory([]);
    }
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelected(null);
    setHistory([]);
  };
  const handleUpdateStatus = async () => {
    try {
      await axios.put(`/api/admin/class-requests/${selected.id}/status`, {
        status,
      });
      fetchRequests();
      handleCloseDialog();
    } catch {
      setError("Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Xét duyệt yêu cầu mở lớp</h1>
      </div>
      <div className="dashboard-content">
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Mã yêu cầu</th>
                <th>Môn học</th>
                <th>Số lượng đăng ký</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.courseName}</td>
                  <td>{r.participantCount}</td>
                  <td>{r.description}</td>
                  <td>
                    {STATUS.find((s) => s.value === r.status)?.label ||
                      r.status}
                  </td>
                  <td>
                    <Button size="small" onClick={() => handleOpenDialog(r)}>
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết yêu cầu</DialogTitle>
        <DialogContent>
          {selected && (
            <>
              <div>
                <b>Môn học:</b> {selected.courseName}
              </div>
              <div>
                <b>Số lượng đăng ký:</b> {selected.participantCount}
              </div>
              <div>
                <b>Mô tả:</b> {selected.description}
              </div>
              <div>
                <b>Trạng thái:</b>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div style={{ marginTop: 16 }}>
                <b>Lịch sử xử lý:</b>
                <ul>
                  {history.length === 0 ? (
                    <li>Không có</li>
                  ) : (
                    history.map((h, idx) => (
                      <li key={idx}>
                        {h.action} - {h.time} - {h.by}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminApproveRequests;
