"use client"

import { useState, useEffect } from "react"
import {
  Switch,
  FormControlLabel,
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material"
import { Save, Refresh, Delete, Add } from "@mui/icons-material"
import SideBar from "../../components/sideBar"
import "../../assets/Dashboard.css"

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    multiLanguage: false,
    emailNotifications: true,
    autoBackup: true,
    maintenanceMode: false,
  })
  const [systemInfo, setSystemInfo] = useState({
    version: "1.0.0",
    lastBackup: "2025-01-27 10:30:00",
    totalUsers: 0,
    totalClasses: 0,
    diskUsage: "2.5 GB",
  })
  const [newAnnouncement, setNewAnnouncement] = useState("")
  const [announcements, setAnnouncements] = useState([
    { id: 1, text: "Hệ thống sẽ bảo trì vào 2h sáng ngày mai", date: "2025-01-27" },
    { id: 2, text: "Cập nhật tính năng mới cho sinh viên", date: "2025-01-26" },
  ])
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem("adminSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Load system info (in real app, this would come from API)
    fetchSystemInfo()
  }, [])

  const fetchSystemInfo = async () => {
    //mock data
    setSystemInfo({
      version: "1.0.0",
      lastBackup: new Date().toLocaleString("vi-VN"),
      totalUsers: 1250,
      totalClasses: 85,
      diskUsage: "2.5 GB",
    })
  }

  const handleSettingChange = (setting) => (event) => {
    const newSettings = {
      ...settings,
      [setting]: event.target.checked,
    }
    setSettings(newSettings)
    localStorage.setItem("adminSettings", JSON.stringify(newSettings))
    setSuccess(`Đã ${event.target.checked ? "bật" : "tắt"} ${getSettingLabel(setting)}`)
    setTimeout(() => setSuccess(null), 3000)
  }

  const getSettingLabel = (setting) => {
    const labels = {
      darkMode: "chế độ tối",
      multiLanguage: "đa ngôn ngữ",
      emailNotifications: "thông báo email",
      autoBackup: "sao lưu tự động",
      maintenanceMode: "chế độ bảo trì",
    }
    return labels[setting] || setting
  }

  const handleBackup = () => {
    setSuccess("Đang thực hiện sao lưu...")
    // Simulate backup process
    setTimeout(() => {
      setSuccess("Sao lưu hoàn tất!")
      setSystemInfo((prev) => ({
        ...prev,
        lastBackup: new Date().toLocaleString("vi-VN"),
      }))
    }, 2000)
  }

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.trim()) {
      setError("Vui lòng nhập nội dung thông báo")
      return
    }

    const newId = Math.max(...announcements.map((a) => a.id)) + 1
    setAnnouncements([
      {
        id: newId,
        text: newAnnouncement,
        date: new Date().toISOString().split("T")[0],
      },
      ...announcements,
    ])
    setNewAnnouncement("")
    setSuccess("Đã thêm thông báo mới")
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter((a) => a.id !== id))
    setSuccess("Đã xóa thông báo")
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <Box p={3}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Cài đặt hệ thống
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* System Settings */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Cài đặt chung
                    </Typography>
                    <Box>
                      <FormControlLabel
                        control={<Switch checked={settings.darkMode} onChange={handleSettingChange("darkMode")} />}
                        label="Chế độ tối (sắp có)"
                      />
                      <FormControlLabel
                        control={
                          <Switch checked={settings.multiLanguage} onChange={handleSettingChange("multiLanguage")} />
                        }
                        label="Đa ngôn ngữ (sắp có)"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailNotifications}
                            onChange={handleSettingChange("emailNotifications")}
                          />
                        }
                        label="Thông báo email"
                      />
                      <FormControlLabel
                        control={<Switch checked={settings.autoBackup} onChange={handleSettingChange("autoBackup")} />}
                        label="Sao lưu tự động"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.maintenanceMode}
                            onChange={handleSettingChange("maintenanceMode")}
                            color="warning"
                          />
                        }
                        label="Chế độ bảo trì"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* System Information */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Thông tin hệ thống
                    </Typography>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        <strong>Phiên bản:</strong> {systemInfo.version}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Sao lưu cuối:</strong> {systemInfo.lastBackup}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Tổng người dùng:</strong> {systemInfo.totalUsers}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Tổng lớp học:</strong> {systemInfo.totalClasses}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Dung lượng sử dụng:</strong> {systemInfo.diskUsage}
                      </Typography>

                      <Box mt={2}>
                        <Button variant="outlined" startIcon={<Save />} onClick={handleBackup} sx={{ mr: 1 }}>
                          Sao lưu ngay
                        </Button>
                        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchSystemInfo}>
                          Làm mới
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* System Announcements */}
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Thông báo hệ thống
                    </Typography>

                    <Box mb={2}>
                      <TextField
                        fullWidth
                        label="Thêm thông báo mới"
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        multiline
                        rows={2}
                        sx={{ mb: 1 }}
                      />
                      <Button variant="contained" startIcon={<Add />} onClick={handleAddAnnouncement}>
                        Thêm thông báo
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <List>
                      {announcements.map((announcement) => (
                        <ListItem key={announcement.id}>
                          <ListItemText primary={announcement.text} secondary={`Ngày: ${announcement.date}`} />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              color="error"
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                            >
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </main>
    </div>
  )
}

export default AdminSettings
