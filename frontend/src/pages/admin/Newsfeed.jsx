"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
} from "@mui/material"
import { Add, Edit, Delete, Refresh } from "@mui/icons-material"
import SideBar from "../../components/sideBar"
import "../../assets/Dashboard.css"

const RECIPIENTS = [
  { label: "Tất cả", value: "all" },
  { label: "Sinh viên", value: "SinhVien" },
  { label: "Giảng viên", value: "GiangVien" },
]

const AdminNewsfeed = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [editNews, setEditNews] = useState(null)
  const [form, setForm] = useState({ title: "", content: "", recipient: "all" })

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const tabId = sessionStorage.getItem("tabId")
      const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

      const res = await axios.get("/api/admin/newsfeed", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      })

      const arr = Array.isArray(res.data) ? res.data : []
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
          recipient: item.loaiNguoiDung === "TatCa" ? "all" : item.loaiNguoiDung,
        })),
      )
    } catch (err) {
      console.error("Error fetching newsfeed:", err)
      setError("Không thể tải bảng tin")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item = null) => {
    setEditNews(item)
    setForm(
      item
        ? {
            title: item.title,
            content: item.content,
            recipient: item.recipient,
          }
        : { title: "", content: "", recipient: "all" },
    )
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditNews(null)
    setForm({ title: "", content: "", recipient: "all" })
    setError(null)
    setSuccess(null)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Vui lòng điền đầy đủ tiêu đề và nội dung")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const tabId = sessionStorage.getItem("tabId")
      const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

      if (editNews) {
        await axios.put(`/api/admin/newsfeed/${editNews.id}`, form, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        })
        setSuccess("Cập nhật bảng tin thành công")
      } else {
        await axios.post("/api/admin/newsfeed", form, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        })
        setSuccess("Tạo bảng tin thành công")
      }

      fetchNews()
      setTimeout(() => {
        handleCloseDialog()
      }, 1500)
    } catch (err) {
      console.error("Error saving newsfeed:", err)
      setError(err.response?.data?.message || "Lỗi khi lưu bảng tin")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa thông báo?")) return

    setLoading(true)
    try {
      const tabId = sessionStorage.getItem("tabId")
      const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

      await axios.delete(`/api/admin/newsfeed/${id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      })
      setSuccess("Xóa bảng tin thành công")
      fetchNews()
    } catch (err) {
      console.error("Error deleting newsfeed:", err)
      setError("Lỗi khi xóa bảng tin")
    } finally {
      setLoading(false)
    }
  }

  const getRecipientColor = (recipient) => {
    switch (recipient) {
      case "all":
        return "primary"
      case "SinhVien":
        return "success"
      case "GiangVien":
        return "warning"
      default:
        return "default"
    }
  }

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <Box p={3}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4">Quản lý bảng tin</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchNews}
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  Làm mới
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  disabled={loading}
                >
                  Tạo thông báo
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {loading && !openDialog ? (
              <Box display="flex" justifyContent="center" p={5}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {news.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
                      <Typography color="textSecondary">Chưa có bảng tin nào</Typography>
                    </Paper>
                  </Grid>
                ) : (
                  news.map((item) => (
                    <Grid item xs={12} md={6} lg={4} key={item.id}>
                      <Card elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" component="h3" gutterBottom>
                              {item.title}
                            </Typography>
                            <Chip label={item.recipientLabel} color={getRecipientColor(item.recipient)} size="small" />
                          </Box>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Đăng bởi: {item.author} • {item.time}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button size="small" startIcon={<Edit />} onClick={() => handleOpenDialog(item)}>
                            Sửa
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handleDelete(item.id)}
                          >
                            Xóa
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
              <DialogTitle>{editNews ? "Sửa thông báo" : "Tạo thông báo mới"}</DialogTitle>
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

                <TextField
                  margin="dense"
                  label="Tiêu đề *"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="dense"
                  label="Nội dung *"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth>
                  <InputLabel>Đối tượng nhận</InputLabel>
                  <Select name="recipient" value={form.recipient} onChange={handleChange} label="Đối tượng nhận">
                    {RECIPIENTS.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
          </Paper>
        </Box>
      </main>
    </div>
  )
}

export default AdminNewsfeed
