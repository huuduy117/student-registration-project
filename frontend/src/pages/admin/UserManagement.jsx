"use client";

import { useState, useEffect } from "react";
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

      // Map the response to show correct user information
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
      await fetchUsers(); // Wait for the fetch to complete
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="um-container">
      <SideBar />
      <main className="dashboard-main">
        <div className="um-title">Quản lý người dùng</div>
        {error && <div className="um-alert um-alert-error">{error}</div>}
        {success && <div className="um-alert um-alert-success">{success}</div>}
        <div className="um-toolbar">
          <select
            className="um-form-group"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            {userTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            className="um-btn"
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            Thêm mới
          </button>
          <button
            className="um-btn um-btn-secondary"
            onClick={fetchUsers}
            disabled={loading}
          >
            Làm mới
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="um-table">
            <thead>
              <tr>
                <th>Mã người dùng</th>
                <th>Tên đăng nhập</th>
                <th>Loại người dùng</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>
                        {userTypes.find((t) => t.value === user.userType)
                          ?.label || user.userType}
                      </td>
                      <td>
                        <div className="um-actions">
                          <button
                            className="um-btn um-btn-secondary"
                            onClick={() => handleViewUser(user)}
                            title="Xem chi tiết"
                          >
                            👁️
                          </button>
                          <button
                            className="um-btn"
                            onClick={() => handleOpenDialog(user)}
                            disabled={loading}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="um-btn um-btn-danger"
                            onClick={() => handleDelete(user)}
                            disabled={loading}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>Số dòng mỗi trang:</span>
          <select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
            {[5, 10, 25].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>{`${page * rowsPerPage + 1}-${Math.min(
            (page + 1) * rowsPerPage,
            users.length
          )} của ${users.length}`}</span>
          <button
            className="um-btn um-btn-secondary"
            onClick={(e) => handleChangePage(e, Math.max(page - 1, 0))}
            disabled={page === 0}
          >
            Trước
          </button>
          <button
            className="um-btn um-btn-secondary"
            onClick={(e) =>
              handleChangePage(
                e,
                Math.min(page + 1, Math.ceil(users.length / rowsPerPage) - 1)
              )
            }
            disabled={(page + 1) * rowsPerPage >= users.length}
          >
            Sau
          </button>
        </div>

        {/* Modal Thêm/Sửa */}
        {openDialog && (
          <>
            <div
              className="um-modal-backdrop"
              onClick={handleCloseDialog}
            ></div>
            <div className="um-modal">
              <button className="um-modal-close" onClick={handleCloseDialog}>
                ×
              </button>
              <div className="um-modal-title">
                {editUser ? "Sửa người dùng" : "Thêm người dùng"}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="um-form-row">
                  <div className="um-form-group">
                    <label>Mã người dùng *</label>
                    <input
                      name="maNguoiDung"
                      value={userData.maNguoiDung}
                      onChange={handleUserDataChange}
                      disabled={editUser !== null}
                      required
                    />
                  </div>
                  <div className="um-form-group">
                    <label>Tên đăng nhập *</label>
                    <input
                      name="tenDangNhap"
                      value={userData.tenDangNhap}
                      onChange={handleUserDataChange}
                      required
                    />
                  </div>
                </div>
                <div className="um-form-row">
                  <div className="um-form-group">
                    <label>
                      {editUser
                        ? "Mật khẩu mới (để trống nếu không đổi)"
                        : "Mật khẩu *"}
                    </label>
                    <input
                      name="matKhau"
                      type="password"
                      value={userData.matKhau}
                      onChange={handleUserDataChange}
                      required={!editUser}
                    />
                  </div>
                  <div className="um-form-group">
                    <label>Loại người dùng</label>
                    <select
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
                </div>
                <div className="um-modal-actions">
                  <button
                    type="button"
                    className="um-btn um-btn-secondary"
                    onClick={handleCloseDialog}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="um-btn" disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
        {/* Modal Xem chi tiết */}
        {viewDialog && viewUser && (
          <>
            <div
              className="um-modal-backdrop"
              onClick={handleCloseViewDialog}
            ></div>
            <div className="um-modal">
              <button
                className="um-modal-close"
                onClick={handleCloseViewDialog}
              >
                ×
              </button>
              <div className="um-modal-title">
                Thông tin chi tiết người dùng
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>Mã người dùng:</b> {viewUser.maNguoiDung || viewUser.id}
                <br />
                <b>Tên đăng nhập:</b>{" "}
                {viewUser.tenDangNhap || viewUser.username}
                <br />
                <b>Loại người dùng:</b>{" "}
                {userTypes.find((t) => t.value === viewUser.loaiNguoiDung)
                  ?.label || viewUser.loaiNguoiDung}
                <br />
              </div>
              <div className="um-modal-actions">
                <button
                  className="um-btn um-btn-secondary"
                  onClick={handleCloseViewDialog}
                >
                  Đóng
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminUserManagement;
