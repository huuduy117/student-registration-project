"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "../../components/sideBar";
import "../../assets/UserManagement.css";

const RECIPIENTS = [
  { label: "Tất cả", value: "all" },
  { label: "Sinh viên", value: "SinhVien" },
  { label: "Giảng viên", value: "GiangVien" },
];

const AdminNewsfeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editNews, setEditNews] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    recipient: "all",
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      const res = await axios.get("/api/admin/newsfeed", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      const arr = Array.isArray(res.data) ? res.data : [];
      setNews(
        arr.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          time: new Date(item.time).toLocaleDateString("vi-VN"),
          author: item.tenNguoiDang || item.author,
          recipientLabel:
            item.loaiNguoiDung === "TatCa"
              ? "Tất cả"
              : item.loaiNguoiDung === "SinhVien"
              ? "Sinh viên"
              : item.loaiNguoiDung === "GiangVien"
              ? "Giảng viên"
              : item.loaiNguoiDung,
          recipient:
            item.loaiNguoiDung === "TatCa" ? "all" : item.loaiNguoiDung,
        }))
      );
    } catch (err) {
      console.error("Error fetching newsfeed:", err);
      setError("Không thể tải bảng tin");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    setEditNews(item);
    setForm(
      item
        ? {
            title: item.title,
            content: item.content,
            recipient: item.recipient,
          }
        : { title: "", content: "", recipient: "all" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditNews(null);
    setForm({ title: "", content: "", recipient: "all" });
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      if (editNews) {
        await axios.put(`/api/admin/newsfeed/${editNews.id}`, form, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
        setSuccess("Cập nhật bảng tin thành công");
      } else {
        await axios.post("/api/admin/newsfeed", form, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
        setSuccess("Tạo bảng tin thành công");
      }

      fetchNews();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err) {
      console.error("Error saving newsfeed:", err);
      setError(err.response?.data?.message || "Lỗi khi lưu bảng tin");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa thông báo?")) return;

    setLoading(true);
    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      await axios.delete(`/api/admin/newsfeed/${id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setSuccess("Xóa bảng tin thành công");
      fetchNews();
    } catch (err) {
      console.error("Error deleting newsfeed:", err);
      setError("Lỗi khi xóa bảng tin");
    } finally {
      setLoading(false);
    }
  };

  const getRecipientClass = (recipient) => {
    switch (recipient) {
      case "all":
        return "um-chip um-chip-primary";
      case "SinhVien":
        return "um-chip um-chip-success";
      case "GiangVien":
        return "um-chip um-chip-warning";
      default:
        return "um-chip";
    }
  };

  return (
    <div className="um-container">
      <SideBar />
      <main>
        <div className="um-title">Quản lý bảng tin</div>
        <div className="um-toolbar">
          <button
            className="um-btn um-btn-secondary"
            onClick={fetchNews}
            disabled={loading}
          >
            Làm mới
          </button>
          <button
            className="um-btn"
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            Tạo thông báo
          </button>
        </div>
        {error && <div className="um-alert um-alert-error">{error}</div>}
        {success && <div className="um-alert um-alert-success">{success}</div>}
        {loading && !openDialog ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="um-loading-spinner" />
          </div>
        ) : news.length === 0 ? (
          <div
            className="um-table"
            style={{ textAlign: "center", padding: 32 }}
          >
            <span style={{ color: "#888" }}>Chưa có bảng tin nào</span>
          </div>
        ) : (
          <div className="um-grid">
            {news.map((item) => (
              <div className="um-card" key={item.id}>
                <div className="um-card-header">
                  <div className="um-card-title">{item.title}</div>
                  <span className={getRecipientClass(item.recipient)}>
                    {item.recipientLabel}
                  </span>
                </div>
                <div className="um-card-content">
                  {item.content.length > 150
                    ? `${item.content.substring(0, 150)}...`
                    : item.content}
                </div>
                <div className="um-card-meta">
                  Đăng bởi: {item.author} • {item.time}
                </div>
                <div className="um-actions">
                  <button
                    className="um-btn"
                    onClick={() => handleOpenDialog(item)}
                  >
                    Sửa
                  </button>
                  <button
                    className="um-btn um-btn-danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {openDialog && (
          <>
            <div className="um-modal-backdrop" onClick={handleCloseDialog} />
            <div className="um-modal">
              <div className="um-title" style={{ fontSize: "1.3rem" }}>
                {editNews ? "Sửa thông báo" : "Tạo thông báo mới"}
              </div>
              {error && <div className="um-alert um-alert-error">{error}</div>}
              {success && (
                <div className="um-alert um-alert-success">{success}</div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label className="um-label">Tiêu đề *</label>
                <input
                  className="um-input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={100}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="um-label">Nội dung *</label>
                <textarea
                  className="um-input"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={4}
                  disabled={loading}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="um-label">Đối tượng nhận</label>
                <select
                  className="um-input"
                  name="recipient"
                  value={form.recipient}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {RECIPIENTS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="um-actions" style={{ marginTop: 16 }}>
                <button
                  className="um-btn um-btn-secondary"
                  onClick={handleCloseDialog}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  className="um-btn"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminNewsfeed;
