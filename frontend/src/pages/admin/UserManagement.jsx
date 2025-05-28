"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
import axios from "axios";
import SideBar from "../../components/sideBar";
import "../../assets/UserManagement.css";

const userTypes = [
  { label: "Sinh viên", value: "SinhVien" },
  { label: "Giảng viên", value: "GiangVien" },
];

const defaultUserData = {
  maNguoiDung: "",
  tenDangNhap: "",
  matKhau: "",
  loaiNguoiDung: "SinhVien",
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [userType, setUserType] = useState(userTypes[0].value);
  const [userData, setUserData] = useState(defaultUserData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      const res = await axios.get(`/api/admin/users`, {
        params: { type: userType },
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      const mappedUsers = Array.isArray(res.data)
        ? res.data.map((user) => ({
            id: user.maNguoiDung || user.id,
            username: user.tenDangNhap || user.username,
            userType: user.loaiNguoiDung || user.userType,
          }))
        : [];

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách người dùng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    setEditUser(user);
    if (user) {
      setUserData({
        maNguoiDung: user.id,
        tenDangNhap: user.username,
        matKhau: "",
        loaiNguoiDung: user.userType || userType,
      });
    } else {
      setUserData({ ...defaultUserData, loaiNguoiDung: userType });
    }
    setOpenDialog(true);
  };

  const handleViewUser = async (user) => {
    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      const res = await axios.get(`/api/admin/users/${user.id}`, {
        params: { type: userType },
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setViewUser(res.data);
      setViewDialog(true);
    } catch (err) {
      setError("Không thể tải thông tin người dùng");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditUser(null);
    setUserData(defaultUserData);
    setError(null);
    setSuccess(null);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setViewUser(null);
  };

  const handleUserDataChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      if (!userData.maNguoiDung || !userData.tenDangNhap) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc");
        setLoading(false);
        return;
      }

      if (editUser) {
        await axios.put(
          `/api/admin/users/${editUser.id}`,
          {
            userData: userData.matKhau
              ? userData
              : { ...userData, matKhau: undefined },
            type: userType,
          },
          {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          }
        );
        setSuccess("Cập nhật người dùng thành công");
      } else {
        if (!userData.matKhau) {
          setError("Mật khẩu là bắt buộc khi tạo người dùng mới");
          setLoading(false);
          return;
        }

        await axios.post(
          `/api/admin/add-user`,
          {
            userData,
            type: userType,
          },
          {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          }
        );
        setSuccess("Thêm người dùng thành công");
      }

      fetchUsers();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err) {
      console.error("Error saving user:", err);
      setError(
        err.response?.data?.message || "Lỗi khi lưu thông tin người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng ${user.username}?`))
      return;

    setLoading(true);
    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      await axios.delete(`/api/admin/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setSuccess("Xóa người dùng thành công");
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      if (err.response?.data?.error?.code === "ER_ROW_IS_REFERENCED_2") {
        setError(
          "Không thể xóa người dùng này vì có dữ liệu liên quan. Vui lòng xóa các dữ liệu liên quan trước."
        );
      } else {
        setError(err.response?.data?.message || "Lỗi khi xóa người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="admin-title">Quản lý người dùng</h1>
          <p className="admin-subtitle">Quản lý tài khoản sinh viên và giảng viên</p>
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
              <div className="stat-title">Loại người dùng</div>
              <div className="stat-icon">
                <Users size={20} />
              </div>
            </div>
            <select
              className="modern-select"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              {userTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

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
              placeholder="Tìm theo tên đăng nhập hoặc mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Tổng số</div>
              <div className="stat-icon">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{filteredUsers.length}</div>
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
              Thêm mới
            </button>
          </div>
        </motion.div>

        <motion.div
          className="modern-table"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <table>
            <thead>
              <tr>
                <th>Mã người dùng</th>
                <th>Tên đăng nhập</th>
                <th>Loại người dùng</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                    {loading ? "Đang tải..." : "Không có dữ liệu"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>
                      <span className="modern-btn secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                        {userTypes.find((t) => t.value === user.userType)?.label || user.userType}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          className="modern-btn secondary"
                          onClick={() => handleViewUser(user)}
                          title="Xem chi tiết"
                          style={{ padding: '0.5rem' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="modern-btn"
                          onClick={() => handleOpenDialog(user)}
                          disabled={loading}
                          title="Sửa"
                          style={{ padding: '0.5rem' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="modern-btn danger"
                          onClick={() => handleDelete(user)}
                          disabled={loading}
                          title="Xóa"
                          style={{ padding: '0.5rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>

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
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, color: '#1e293b' }}>
                    {editUser ? "Sửa người dùng" : "Thêm người dùng"}
                  </h2>
                  <button
                    onClick={handleCloseDialog}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={24} color="#64748b" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Mã người dùng *</label>
                    <input
                      className="modern-input"
                      name="maNguoiDung"
                      value={userData.maNguoiDung}
                      onChange={handleUserDataChange}
                      disabled={editUser !== null}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tên đăng nhập *</label>
                    <input
                      className="modern-input"
                      name="tenDangNhap"
                      value={userData.tenDangNhap}
                      onChange={handleUserDataChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {editUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}
                    </label>
                    <input
                      className="modern-input"
                      name="matKhau"
                      type="password"
                      value={userData.matKhau}
                      onChange={handleUserDataChange}
                      required={!editUser}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Loại người dùng</label>
                    <select
                      className="modern-select"
                      name="loaiNguoiDung"
                      value={userData.loaiNguoiDung}
                      onChange={handleUserDataChange}
                    >
                      {userTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <button
                      type="button"
                      className="modern-btn secondary"
                      onClick={handleCloseDialog}
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="modern-btn" disabled={loading}>
                      {loading ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewDialog && viewUser && (
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
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, color: '#1e293b' }}>Thông tin chi tiết</h2>
                  <button
                    onClick={handleCloseViewDialog}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={24} color="#64748b" />
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <strong>Mã người dùng:</strong> {viewUser.maNguoiDung || viewUser.id}
                  </div>
                  <div>
                    <strong>Tên đăng nhập:</strong> {viewUser.tenDangNhap || viewUser.username}
                  </div>
                  <div>
                    <strong>Loại người dùng:</strong>{" "}
                    <span className="modern-btn secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                      {userTypes.find((t) => t.value === viewUser.loaiNguoiDung)?.label || viewUser.loaiNguoiDung}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button
                    className="modern-btn secondary"
                    onClick={handleCloseViewDialog}
                  >
                    Đóng
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

export default AdminUserManagement;