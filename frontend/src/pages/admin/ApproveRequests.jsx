"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material"
import { Visibility, Refresh, CheckCircle } from "@mui/icons-material"
import SideBar from "../../components/sideBar"
import "../../assets/Dashboard.css"

const STATUS_OPTIONS = [
  { label: "Đã gửi", value: "DaGui", color: "info" },
  { label: "Đã duyệt", value: "DaDuyet", color: "success" },
  { label: "Từ chối", value: "TuChoi", color: "error" },
  { label: "Đã mở lớp", value: "DaMoLop", color: "primary" },
]

const AdminApproveRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [history, setHistory] = useState([])
  const [newStatus, setNewStatus] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const tabId = sessionStorage.getItem("tabId")
      const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

      const res = await axios.get("/api/admin/class-requests", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      })

      const arr = Array.isArray(res.data) ? res.data : []
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
        })),
      )
    } catch (err) {
      console.error("Error fetching requests:", err)
      setError("Không thể tải danh sách yêu cầu")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = async (request) => {
    setSelectedRequest(request)
    setNewStatus(request.status)
    setOpenDialog(true)

    // Fetch request history
    try {
      const tabId = sessionStorage.getItem("tabId")
      const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

      const res = await axios.get(`/api/admin/class-requests/${request.id}/history`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      })
      setHistory(res.data || [])
    } catch (err) {
      console.error("Error fetching history:", err)
      setHistory([])
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedRequest(null)
    setHistory([])
    setNewStatus("")
    setError(null)
    setSuccess(null)
  }

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === selectedRequest.status) {
      setError("Vui lòng chọn trạng thái mới")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const tabId = sessionStorage.getItem("tabId")
      const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

      await axios.put(
        `/api/admin/class-requests/${selectedRequest.id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        },
      )

      setSuccess("Cập nhật trạng thái thành công")
      fetchRequests()
      setTimeout(() => {
        handleCloseDialog()
      }, 1500)
    } catch (err) {
      console.error("Error updating status:", err)
      setError("Lỗi khi cập nhật trạng thái")
    } finally {
      setLoading(false)
    }
  }

  const getStatusChip = (status) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status)
    return (
      <Chip
        label={statusOption?.label || status}
        color={statusOption?.color || "default"}
        size="small"
        variant="outlined"
      />
    )
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <Box p={3}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4">Xét duyệt yêu cầu mở lớp</Typography>
              <Button variant="outlined" startIcon={<Refresh />} onClick={fetchRequests} disabled={loading}>
                Làm mới
              </Button>
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
              <Paper elevation={1}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã yêu cầu</TableCell>
                        <TableCell>Môn học</TableCell>
                        <TableCell>Người yêu cầu</TableCell>
                        <TableCell align="center">Số lượng đăng ký</TableCell>
                        <TableCell>Ngày gửi</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            Không có yêu cầu nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.id}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {request.courseName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {request.classCode}
                              </Typography>
                            </TableCell>
                            <TableCell>{request.requesterName}</TableCell>
                            <TableCell align="center">
                              <Chip label={request.participantCount} color="primary" size="small" />
                            </TableCell>
                            <TableCell>{request.requestDate}</TableCell>
                            <TableCell align="center">{getStatusChip(request.status)}</TableCell>
                            <TableCell align="center">
                              <Tooltip title="Xem chi tiết">
                                <IconButton size="small" onClick={() => handleOpenDialog(request)}>
                                  <Visibility />
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
                  count={requests.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Số dòng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
                />
              </Paper>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
              <DialogTitle>Chi tiết yêu cầu mở lớp</DialogTitle>
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

                {selectedRequest && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Thông tin yêu cầu
                    </Typography>
                    <Box mb={3}>
                      <Typography variant="body2" color="textSecondary">
                        Mã yêu cầu: <strong>{selectedRequest.id}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Môn học: <strong>{selectedRequest.courseName}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Mã lớp: <strong>{selectedRequest.classCode}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Người yêu cầu: <strong>{selectedRequest.requesterName}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Số lượng đăng ký: <strong>{selectedRequest.participantCount}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Ngày gửi: <strong>{selectedRequest.requestDate}</strong>
                      </Typography>
                      {selectedRequest.description && (
                        <Typography variant="body2" color="textSecondary">
                          Mô tả: <strong>{selectedRequest.description}</strong>
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      Cập nhật trạng thái
                    </Typography>
                    <Box mb={3}>
                      <FormControl fullWidth>
                        <InputLabel>Trạng thái mới</InputLabel>
                        <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Trạng thái mới">
                          {STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      Lịch sử xử lý
                    </Typography>
                    <Box>
                      {history.length === 0 ? (
                        <Typography color="textSecondary">Chưa có lịch sử xử lý</Typography>
                      ) : (
                        <List dense>
                          {history.map((item, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={`${item.oldStatus} → ${item.newStatus}`}
                                secondary={`${item.changedBy} • ${new Date(item.changeDate).toLocaleString("vi-VN")}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} disabled={loading}>
                  Đóng
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  variant="contained"
                  disabled={loading || !newStatus || newStatus === selectedRequest?.status}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Box>
      </main>
    </div>
  )
}

export default AdminApproveRequests
