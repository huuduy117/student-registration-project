"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Search, Edit, Trash2, X, Send, Users, GraduationCap, Globe } from 'lucide-react';
import axios from "axios";
import SideBar from "../../components/sideBar";
import "../../assets/UserManagement.css";

const RECIPIENTS = [
  { label: "Tất cả", value: "all", icon: Globe },
  { label: "Sinh viên", value: "SinhVien", icon: GraduationCap },
  { label: "Giảng viên", value: "GiangVien", icon: Users },
];

const AdminNewsfeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editNews, setEditNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const getRecipientInfo = (recipient) => {
    const info = RECIPIENTS.find(r => r.value === recipient);
    return info || { label: recipient, icon: Globe };
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <SideBar />
      <main className="admin-main">
        <motion.div
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="admin-title">Quản lý bảng tin</h1>
          <p className="admin-subtitle">Tạo và quản lý thông báo cho hệ thống</p>
        </motion.div>

        {error && (
          <motion.div
            className="alert error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            className="alert success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {success}
          </motion.div>
        )}

        <motion.div
          className="stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Tìm kiếm</div>
              <div className="stat-icon">
                <Search size={20} />
              </div>
            </div>
            <input
              type="text"
              className="modern-input"
              placeholder="Tìm theo tiêu đề hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Tổng bài viết</div>
              <div className="stat-icon">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="stat-value">{filteredNews.length}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Thao tác</div>
              <div className="stat-icon">
                <Plus size={20} />
              </div>
            </div>
            <button
              className="modern-btn"
              onClick={() => handleOpenDialog()}
              disabled={loading}
            >
              <Plus size={18} />
              Tạo thông báo
            </button>
          </div>
        </motion.div>

        {loading && !openDialog ? (
          <div className="loading-spinner" />
        ) : filteredNews.length === 0 ? (
          <motion.div
            className="chart-container"
            style={{ textAlign: "center", padding: "3rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MessageSquare size={64} color="#cbd5e1" />
            <h3 style={{ color: "#64748b", marginTop: "1rem" }}>Chưa có bảng tin nào</h3>
            <p style={{ color: "#94a3b8" }}>Tạo thông báo đầu tiên để bắt đầu</p>
          </motion.div>
        ) : (
          <motion.div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {filteredNews.map((item, index) => {
              const recipientInfo = getRecipientInfo(item.recipient);
              const IconComponent = recipientInfo.icon;
              
              return (
                <motion.div
                  key={item.id}
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  style={{ height: 'fit-content' }}
                >
                  <div className="stat-header">
                    <div className="stat-title" style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <IconComponent size={16} color="#667eea" />
                      <span style={{ fontSize: '0.8rem', color: '#667eea', fontWeight: '500' }}>
                        {recipientInfo.label}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ margin: '1rem 0', color: '#64748b', lineHeight: '1.5' }}>
                    {item.content.length > 120
                      ? `${item.content.substring(0, 120)}...`
                      : item.content}
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    Đăng bởi: <strong>{item.author}</strong> • {item.time}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="modern-btn secondary"
                      onClick={() => handleOpenDialog(item)}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    >
                      <Edit size={16} />
                      Sửa
                    </button>
                    <button
                      className="modern-btn danger"
                      onClick={() => handleDelete(item.id)}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <AnimatePresence>
          {openDialog && (
            <motion.div
              className="modern-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modern-modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ maxWidth: '600px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, color: '#1e293b' }}>
                    {editNews ? "Sửa thông báo" : "Tạo thông báo mới"}
                  </h2>
                  <button
                    onClick={handleCloseDialog}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={24} color="#64748b" />
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Tiêu đề *</label>
                  <input
                    className="modern-input"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength={100}
                    required
                    placeholder="Nhập tiêu đề thông báo..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung *</label>
                  <textarea
                    className="modern-input"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows={6}
                    disabled={loading}
                    required
                    placeholder="Nhập nội dung thông báo..."
                    style={{ resize: 'vertical', minHeight: '120px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Đối tượng nhận</label>
                  <select
                    className="modern-select"
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

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button
                    className="modern-btn secondary"
                    onClick={handleCloseDialog}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    className="modern-btn"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Send size={16} />
                    {loading ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminNewsfeed;