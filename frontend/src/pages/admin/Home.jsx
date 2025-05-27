"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../services/axios";
import {
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import SideBar from "../../components/sideBar";
import "../../assets/Dashboard.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A020F0",
  "#FF6384",
];

const AdminHome = () => {
  const [tab, setTab] = useState(0);
  const [studentStats, setStudentStats] = useState({});
  const [teacherStats, setTeacherStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const [studentRes, teacherRes] = await Promise.all([
        axiosInstance.get("/api/admin/stats/students"),
        axiosInstance.get("/api/admin/stats/teachers"),
      ]);

      setStudentStats(studentRes.data || {});
      setTeacherStats(teacherRes.data || {});
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, children }) => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {value !== undefined && (
          <Typography variant="h4" color="primary" gutterBottom>
            {value}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <Box p={3}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Trang tổng quan quản trị viên
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="Thống kê sinh viên" />
                <Tab label="Thống kê giảng viên" />
              </Tabs>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={5}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <Box>
                {tab === 0 ? (
                  // Tab Sinh viên
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={3}>
                      <StatCard
                        title="Tổng số sinh viên"
                        value={studentStats.total || 0}
                      />
                    </Grid>

                    <Grid item xs={12} md={6} lg={9}>
                      <StatCard title="Phân bố theo lớp">
                        {studentStats.byClass &&
                        studentStats.byClass.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={studentStats.byClass}
                                dataKey="count"
                                nameKey="class"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                label={({ class: className, count }) =>
                                  `${className}: ${count}`
                                }
                              >
                                {studentStats.byClass.map((entry, idx) => (
                                  <Cell
                                    key={`cell-${idx}`}
                                    fill={COLORS[idx % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <Typography color="textSecondary">
                            Không có dữ liệu
                          </Typography>
                        )}
                      </StatCard>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <StatCard title="Tình trạng đăng ký môn học">
                        {studentStats.registrationStatus &&
                        studentStats.registrationStatus.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={studentStats.registrationStatus}>
                              <XAxis dataKey="status" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#00C49F" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <Typography color="textSecondary">
                            Không có dữ liệu
                          </Typography>
                        )}
                      </StatCard>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <StatCard title="Yêu cầu mở lớp gần đây">
                        {studentStats.classRequests &&
                        studentStats.classRequests.length > 0 ? (
                          <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
                            {studentStats.classRequests.map((req) => (
                              <Box
                                key={req.id}
                                sx={{ p: 1, borderBottom: "1px solid #eee" }}
                              >
                                <Typography variant="body2">
                                  <strong>{req.courseName}</strong>
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  Trạng thái: {req.status}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography color="textSecondary">
                            Không có yêu cầu nào
                          </Typography>
                        )}
                      </StatCard>
                    </Grid>
                  </Grid>
                ) : (
                  // Tab Giảng viên
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={3}>
                      <StatCard
                        title="Tổng số giảng viên"
                        value={teacherStats.total || 0}
                      />
                    </Grid>

                    <Grid item xs={12} md={6} lg={9}>
                      <StatCard title="Số lớp học phần theo học kỳ">
                        {teacherStats.classCountBySemester &&
                        teacherStats.classCountBySemester.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={teacherStats.classCountBySemester}>
                              <XAxis dataKey="semester" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#FF8042" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <Typography color="textSecondary">
                            Không có dữ liệu
                          </Typography>
                        )}
                      </StatCard>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <StatCard title="Lịch giảng dạy">
                        {teacherStats.schedule &&
                        teacherStats.schedule.length > 0 ? (
                          <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
                            {teacherStats.schedule.map((item, idx) => (
                              <Box
                                key={idx}
                                sx={{ p: 1, borderBottom: "1px solid #eee" }}
                              >
                                <Typography variant="body2">
                                  <strong>{item.teacher}</strong>
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {item.time}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography color="textSecondary">
                            Không có lịch giảng dạy
                          </Typography>
                        )}
                      </StatCard>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <StatCard title="Lịch sử phê duyệt gần đây">
                        {teacherStats.approveHistory &&
                        teacherStats.approveHistory.length > 0 ? (
                          <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
                            {teacherStats.approveHistory.map((h, idx) => (
                              <Box
                                key={idx}
                                sx={{ p: 1, borderBottom: "1px solid #eee" }}
                              >
                                <Typography variant="body2">
                                  {h.action}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {h.time}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography color="textSecondary">
                            Không có lịch sử phê duyệt
                          </Typography>
                        )}
                      </StatCard>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      </main>
    </div>
  );
};

export default AdminHome;
