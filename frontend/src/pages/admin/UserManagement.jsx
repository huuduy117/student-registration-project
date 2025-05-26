import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import "../../assets/Dashboard.css";

const userTypes = [
  { label: "Sinh viên", value: "SinhVien" },
  { label: "Giảng viên", value: "GiangVien" },
];

const defaultUser = {
  username: "",
  fullName: "",
  email: "",
  classOrDept: "",
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userType, setUserType] = useState(userTypes[0].value);
  const [form, setForm] = useState(defaultUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ignore exhaustive-deps for fetchUsers (safe here)
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/admin/users`, {
        params: { type: userType },
      });
      setUsers(res.data);
    } catch {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    setEditUser(user);
    setForm(user ? { ...user } : defaultUser);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditUser(null);
    setForm(defaultUser);
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    setLoading(true);
    try {
      if (editUser) {
        await axios.put(`/api/admin/users/${editUser.id}`, {
          ...form,
          type: userType,
        });
      } else {
        await axios.post(`/api/admin/users`, { ...form, type: userType });
      }
      fetchUsers();
      handleCloseDialog();
    } catch {
      setError("Lỗi khi lưu thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch {
      setError("Lỗi khi xoá người dùng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={2}>
      <h1>Quản lý người dùng</h1>
      <Box mb={2}>
        <Select value={userType} onChange={(e) => setUserType(e.target.value)}>
          {userTypes.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          sx={{ ml: 2 }}
        >
          Thêm mới
        </Button>
      </Box>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>{userType === "SinhVien" ? "Lớp" : "Bộ môn"}</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.classOrDept}</td>
                <td>
                  <Button size="small" onClick={() => handleOpenDialog(u)}>
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(u.id)}
                  >
                    Xoá
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editUser ? "Sửa người dùng" : "Thêm người dùng"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Tên đăng nhập"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Họ tên"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label={userType === "SinhVien" ? "Lớp" : "Bộ môn"}
            name="classOrDept"
            value={form.classOrDept}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Huỷ</Button>
          <Button onClick={handleSave} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserManagement;
