"use client";

import { useState, useEffect } from "react";
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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { FaEdit, FaTrash, FaPlus, FaSync, FaEye } from "react-icons/fa";
import SideBar from "../../components/sideBar";
import "../../assets/Dashboard.css";

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

const defaultDetailData = {
  hoTen: "",
  email: "",
  soDienThoai: "",
  diaChi: "",
  ngaySinh: "",
  gioiTinh: "Nam",
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [userType, setUserType] = useState(userTypes[0].value);
  const [userData, setUserData] = useState(defaultUserData);
  const [detailData, setDetailData] = useState(defaultDetailData);
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
            fullName: user.hoTen || user.fullName,
            email: user.email,
            phone: user.soDienThoai || user.phone,
            address: user.diaChi || user.address,
            birthDate: user.ngaySinh || user.birthDate,
            gender: user.gioiTinh || user.gender,
            classOrDept: user.maLop || user.maBM || user.classOrDept,
            degree: user.hocVi || user.degree,
            specialization: user.chuyenNganh || user.specialization,
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
      setDetailData({
        hoTen: user.fullName || "",
        email: user.email || "",
        soDienThoai: user.phone || "",
        diaChi: user.address || "",
        ngaySinh: user.birthDate || "",
        gioiTinh: user.gender || "Nam",
        ...(userType === "SinhVien"
          ? {
              lop: user.classOrDept || "",
              maSV: user.id,
            }
          : {
              boMon: user.classOrDept || "",
              maGV: user.id,
              hocVi: user.degree || "",
              chuyenMon: user.specialization || "",
            }),
      });
    } else {
      setUserData({ ...defaultUserData, loaiNguoiDung: userType });
      setDetailData({
        ...defaultDetailData,
        ...(userType === "SinhVien"
          ? { lop: "", maSV: "" }
          : { boMon: "", maGV: "", hocVi: "", chuyenMon: "" }),
      });
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
    setDetailData(defaultDetailData);
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

  const handleDetailDataChange = (e) => {
    setDetailData({ ...detailData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      if (!userData.maNguoiDung || !userData.tenDangNhap || !detailData.hoTen) {
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
            detailData,
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
            detailData,
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
    if (!window.confirm(`Bạn có chắc muốn xóa ${user.fullName}?`)) return;

    setLoading(true);
    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      await axios.delete(`/api/admin/users/${user.id}`, {
        params: { type: userType },
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setSuccess("Xóa người dùng thành công");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Lỗi khi xóa người dùng");
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
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <Box p={3}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Quản lý người dùng
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                severity="success"
                sx={{ mb: 2 }}
                onClose={() => setSuccess(null)}
              >
                {success}
              </Alert>
            )}

            <Box mb={3} display="flex" alignItems="center" gap={2}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Loại người dùng</InputLabel>
                <Select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  label="Loại người dùng"
                >
                  {userTypes.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                startIcon={<FaPlus />}
                onClick={() => handleOpenDialog()}
                disabled={loading}
              >
                Thêm mới
              </Button>

              <Tooltip title="Làm mới">
                <IconButton onClick={fetchUsers} disabled={loading}>
                  <FaSync />
                </IconButton>
              </Tooltip>
            </Box>

            {loading && !openDialog ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper elevation={1}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã người dùng</TableCell>
                        <TableCell>Tên đăng nhập</TableCell>
                        <TableCell>Loại người dùng</TableCell>
                        <TableCell>Họ tên</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>
                          {userType === "SinhVien" ? "Lớp" : "Bộ môn"}
                        </TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      ) : (
                        users
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>
                                {userTypes.find(
                                  (t) => t.value === user.userType
                                )?.label || user.userType}
                              </TableCell>
                              <TableCell>{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.classOrDept}</TableCell>
                              <TableCell align="center">
                                <Tooltip title="Xem chi tiết">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewUser(user)}
                                  >
                                    <FaEye />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Sửa">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(user)}
                                    disabled={loading}
                                  >
                                    <FaEdit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(user)}
                                    disabled={loading}
                                  >
                                    <FaTrash />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={users.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Số dòng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} của ${count}`
                  }
                />
              </Paper>
            )}

            {/* Edit/Add Dialog */}
            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>
                {editUser ? "Sửa người dùng" : "Thêm người dùng"}
              </DialogTitle>
              <DialogContent>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Mã người dùng *"
                      name="maNguoiDung"
                      value={userData.maNguoiDung}
                      onChange={handleUserDataChange}
                      fullWidth
                      disabled={editUser !== null}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Tên đăng nhập *"
                      name="tenDangNhap"
                      value={userData.tenDangNhap}
                      onChange={handleUserDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label={
                        editUser
                          ? "Mật khẩu mới (để trống nếu không đổi)"
                          : "Mật khẩu *"
                      }
                      name="matKhau"
                      type="password"
                      value={userData.matKhau}
                      onChange={handleUserDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Loại người dùng</InputLabel>
                      <Select
                        name="loaiNguoiDung"
                        value={userData.loaiNguoiDung}
                        onChange={handleUserDataChange}
                        label="Loại người dùng"
                      >
                        {userTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Họ tên *"
                      name="hoTen"
                      value={detailData.hoTen}
                      onChange={handleDetailDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={detailData.email}
                      onChange={handleDetailDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Số điện thoại"
                      name="soDienThoai"
                      value={detailData.soDienThoai}
                      onChange={handleDetailDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Ngày sinh"
                      name="ngaySinh"
                      type="date"
                      value={detailData.ngaySinh}
                      onChange={handleDetailDataChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        name="gioiTinh"
                        value={detailData.gioiTinh}
                        onChange={handleDetailDataChange}
                        label="Giới tính"
                      >
                        <MenuItem value="Nam">Nam</MenuItem>
                        <MenuItem value="Nu">Nữ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label={userType === "SinhVien" ? "Lớp" : "Bộ môn"}
                      name={userType === "SinhVien" ? "lop" : "boMon"}
                      value={
                        userType === "SinhVien"
                          ? detailData.lop
                          : detailData.boMon
                      }
                      onChange={handleDetailDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Địa chỉ"
                      name="diaChi"
                      value={detailData.diaChi}
                      onChange={handleDetailDataChange}
                      fullWidth
                    />
                  </Grid>
                  {userType === "GiangVien" && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Học vị"
                          name="hocVi"
                          value={detailData.hocVi}
                          onChange={handleDetailDataChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Chuyên môn"
                          name="chuyenMon"
                          value={detailData.chuyenMon}
                          onChange={handleDetailDataChange}
                          fullWidth
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} disabled={loading}>
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog
              open={viewDialog}
              onClose={handleCloseViewDialog}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Thông tin chi tiết người dùng</DialogTitle>
              <DialogContent>
                {viewUser && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Thông tin cơ bản
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Mã người dùng:
                      </Typography>
                      <Typography variant="body1">
                        {viewUser.maNguoiDung || viewUser.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Tên đăng nhập:
                      </Typography>
                      <Typography variant="body1">
                        {viewUser.tenDangNhap || viewUser.username}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Loại người dùng:
                      </Typography>
                      <Typography variant="body1">
                        {userTypes.find(
                          (t) => t.value === viewUser.loaiNguoiDung
                        )?.label || viewUser.loaiNguoiDung}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Họ tên:
                      </Typography>
                      <Typography variant="body1">
                        {viewUser.hoTen || viewUser.fullName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Email:
                      </Typography>
                      <Typography variant="body1">{viewUser.email}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Số điện thoại:
                      </Typography>
                      <Typography variant="body1">
                        {viewUser.soDienThoai || viewUser.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        {userType === "SinhVien" ? "Lớp:" : "Bộ môn:"}
                      </Typography>
                      <Typography variant="body1">
                        {viewUser.maLop ||
                          viewUser.maBM ||
                          viewUser.classOrDept}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Địa chỉ:
                      </Typography>
                      <Typography variant="body1">
                        {viewUser.diaChi || viewUser.address}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseViewDialog}>Đóng</Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Box>
      </main>
    </div>
  );
};

export default AdminUserManagement;
