"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, Users, BookOpen, Calendar, Eye, RefreshCw, Filter, X } from 'lucide-react';
import axios from "axios";
import SideBar from "../../components/sideBar";
import "../../assets/UserManagement.css";

const STATUS_OPTIONS = [
  { label: "Đã gửi", value: "DaGui", color: "#3b82f6", icon: Clock },
  { label: "Đã duyệt", value: "DaDuyet", color: "#10b981", icon: CheckCircle },
  { label: "Từ chối", value: "TuChoi", color: "#ef4444", icon: XCircle },
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
  const [filterStatus, setFilterStatus] = useState("all");

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

  const getStatusInfo = (status) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return statusOption || { label: status, color: "#64748b", icon: Clock };
  };

  const filteredRequests = requests.filter(request => 
    filterStatus === "all" || request.status === filterStatus
  );

  const statusCounts = {
    all: requests.length,
    DaGui: requests.filter(r => r.status === "DaGui").length,
    DaDuyet: requests.filter(r => r.status === "DaDuyet").length,
    TuChoi: requests.filter(r => r.status === "TuChoi").length,
  };

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
          <h1 className="admin-title">Xét duyệt yêu cầu mở lớp</h1>
          <p className="admin-subtitle">Quản lý và phê duyệt các yêu cầu mở lớp học phần</p>
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
              <div className="stat-title">Tổng yêu cầu</div>
              <div className="stat-icon">
                <BookOpen size={20} />
              </div>
            </div>
            <div className="stat-value">{statusCounts.all}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Chờ duyệt</div>
              <div className="stat-icon">
                <Clock size={20} />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>{statusCounts.DaGui}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Đã duyệt</div>
              <div className="stat-icon">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#10b981' }}>{statusCounts.DaDuyet}</div>
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="chart-title">Danh sách yêu cầu</h3>
            <button
              className="modern-btn secondary"
              onClick={fetchRequests}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>

          {loading && !openDialog ? (
            <div className="loading-spinner" />
          ) : filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <BookOpen size={64} color="#cbd5e1" />
              <h3 style={{ marginTop: '1rem' }}>Không có yêu cầu nào</h3>
              <p>Chưa có yêu cầu mở lớp nào cần xử lý</p>
            </div>
          ) : (
            <div className="modern-table">
              <table>
                <thead>
                  <tr>
                    <th>Mã yêu cầu</th>
                    <th>Môn học</th>
                    <th>Người yêu cầu</th>
                    <th>Số lượng đăng ký</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request, index) => {
                    const statusInfo = getStatusInfo(request.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <td>
                          <strong>{request.id}</strong>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: 500 }}>{request.courseName}</div>
                            <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                              {request.classCode}
                            </div>
                          </div>
                        </td>
                        <td>{request.requesterName}</td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            background: '#f1f5f9',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}>
                            <Users size={14} />
                            {request.participantCount}
                          </div>
                        </td>
                        <td>{request.requestDate}</td>
                        <td>
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            background: statusInfo.color + '20',
                            color: statusInfo.color,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}>
                            <StatusIcon size={14} />
                            {statusInfo.label}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="modern-btn"
                            onClick={() => handleOpenDialog(request)}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            <Eye size={16} />
                            Xem
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {openDialog && selectedRequest && (
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
                style={{ maxWidth: '700px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, color: '#1e293b' }}>Chi tiết yêu cầu mở lớp</h2>
                  <button
                    onClick={handleCloseDialog}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={24} color="#64748b" />
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <strong>Mã yêu cầu:</strong> {selectedRequest.id}
                    </div>
                    <div>
                      <strong>Ngày gửi:</strong> {selectedRequest.requestDate}
                    </div>
                  </div>
                  
                  <div>
                    <strong>Môn học:</strong> {selectedRequest.courseName}
                  </div>
                  
                  <div>
                    <strong>Mã lớp:</strong> {selectedRequest.classCode}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <strong>Người yêu cầu:</strong> {selectedRequest.requesterName}
                    </div>
                    <div>
                      <strong>Số lượng đăng ký:</strong> {selectedRequest.participantCount}
                    </div>
                  </div>
                  
                  {selectedRequest.description && (
                    <div>
                      <strong>Mô tả:</strong> {selectedRequest.description}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái mới</label>
                  <select
                    className="modern-select"
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

                {history.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: '#374151', marginBottom: '0.75rem' }}>Lịch sử xử lý</h4>
                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem' }}>
                      {history.map((item, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '0.5rem 0',
                          borderBottom: idx < history.length - 1 ? '1px solid #e2e8f0' : 'none'
                        }}>
                          <div>
                            <span style={{ fontWeight: 500 }}>
                              {item.oldStatus} → {item.newStatus}
                            </span>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                              {item.changedBy}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {new Date(item.changeDate).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    className="modern-btn secondary"
                    onClick={handleCloseDialog}
                    disabled={loading}
                  >
                    Đóng
                  </button>
                  <button
                    className="modern-btn"
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminApproveRequests;