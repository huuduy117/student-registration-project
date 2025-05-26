import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import "../../assets/Dashboard.css";

const RECIPIENTS = [
  { label: "Tất cả", value: "all" },
  { label: "Sinh viên", value: "SinhVien" },
  { label: "Giảng viên", value: "GiangVien" },
];

const AdminNewsfeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editNews, setEditNews] = useState(null);
  const [form, setForm] = useState({ recipient: "all" });

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/admin/newsfeed")
      .then((res) => {
        // Đảm bảo luôn là mảng và map lại trường dữ liệu cho UI
        const arr = Array.isArray(res.data) ? res.data : [];
        setNews(
          arr.map((item) => ({
            id: item.maThongBao,
            title: item.tieuDe,
            content: item.noiDung,
            time: item.ngayDang,
            author: item.tenNguoiDang || item.nguoiDang,
            recipientLabel:
              item.loaiNguoiDung === "TatCa"
                ? "Tất cả"
                : item.loaiNguoiDung === "SinhVien"
                ? "Sinh viên"
                : item.loaiNguoiDung === "GiangVien"
                ? "Giảng viên"
                : item.loaiNguoiDung,
          }))
        );
      })
      .catch(() => setError("Không thể tải bảng tin"))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDialog = (item = null) => {
    setEditNews(item);
    setForm(item || { recipient: "all" });
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditNews(null);
    setForm({ recipient: "all" });
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    try {
      if (editNews) {
        await axios.put(`/api/admin/newsfeed/${editNews.id}`, form);
      } else {
        await axios.post(`/api/admin/newsfeed`, form);
      }
      handleCloseDialog();
      setLoading(true);
      const res = await axios.get("/api/admin/newsfeed");
      setNews(res.data);
    } catch {
      setError("Lưu thông báo thất bại");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá thông báo?")) return;
    try {
      await axios.delete(`/api/admin/newsfeed/${id}`);
      setNews(news.filter((n) => n.id !== id));
    } catch {
      setError("Xoá thất bại");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bảng tin</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Tạo thông báo
        </Button>
      </div>
      <div className="dashboard-content">
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="newsfeed-list">
            {news.map((item) => (
              <div className="newsfeed-card" key={item.id}>
                <div className="newsfeed-header">
                  <span className="newsfeed-author">{item.author}</span>
                  <span className="newsfeed-time">{item.time}</span>
                </div>
                <div className="newsfeed-content">{item.content}</div>
                <div className="newsfeed-footer">
                  <span className="newsfeed-recipient">
                    Đối tượng: {item.recipientLabel}
                  </span>
                  <Button size="small" onClick={() => handleOpenDialog(item)}>
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(item.id)}
                  >
                    Xoá
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editNews ? "Sửa thông báo" : "Tạo thông báo"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nội dung"
            name="content"
            value={form.content || ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
          <Select
            name="recipient"
            value={form.recipient}
            onChange={handleChange}
            fullWidth
          >
            {RECIPIENTS.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Huỷ</Button>
          <Button onClick={handleSave} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminNewsfeed;
