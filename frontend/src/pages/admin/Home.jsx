import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Tab } from "@mui/material";
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
  // Bộ lọc (có thể mở rộng UI sau)
  const semester = "";
  const major = "";
  const department = "";

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API endpoints
    const fetchStats = async () => {
      try {
        // Thống kê sinh viên
        const resStudent = await axios.get("/api/admin/stats/students", {
          params: { semester, major },
        });
        setStudentStats(resStudent.data);
        // Thống kê giảng viên
        const resTeacher = await axios.get("/api/admin/stats/teachers", {
          params: { semester, department },
        });
        setTeacherStats(resTeacher.data);
      } catch {
        setError("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [semester, major, department]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Trang tổng quan quản trị viên</h1>
        {/* Breadcrumbs, bộ lọc, tìm kiếm toàn cục có thể thêm ở đây */}
      </div>
      <div className="dashboard-tabs">
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Sinh viên" />
          <Tab label="Giảng viên / Trưởng bộ môn / Trưởng khoa" />
        </Tabs>
      </div>
      <div className="dashboard-content">
        {loading ? (
          <div>Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : tab === 0 ? (
          // Tab Sinh viên
          <div className="dashboard-grid">
            {/* Card: Tổng số sinh viên theo lớp/chuyên ngành */}
            <div className="dashboard-card">
              <h3>Tổng số sinh viên</h3>
              <div className="card-stat">{studentStats.total || 0}</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={studentStats.byClass || []}
                    dataKey="count"
                    nameKey="class"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    label
                  >
                    {(studentStats.byClass || []).map((entry, idx) => (
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
            </div>
            {/* Card: Tình trạng đăng ký môn học */}
            <div className="dashboard-card">
              <h3>Đăng ký môn học</h3>
              <BarChart
                width={250}
                height={180}
                data={studentStats.registrationStatus || []}
              >
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </div>
            {/* Card: Yêu cầu mở lớp từ sinh viên */}
            <div className="dashboard-card">
              <h3>Yêu cầu mở lớp</h3>
              <ul>
                {(studentStats.classRequests || []).map((req) => (
                  <li key={req.id}>
                    {req.courseName} - {req.status}
                  </li>
                ))}
              </ul>
            </div>
            {/* Card: Lịch sử xử lý yêu cầu */}
            <div className="dashboard-card">
              <h3>Lịch sử xử lý</h3>
              <ul>
                {(studentStats.requestHistory || []).map((h, idx) => (
                  <li key={idx}>
                    {h.action} - {h.time}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          // Tab Giảng viên/Trưởng bộ môn/Trưởng khoa
          <div className="dashboard-grid">
            {/* Card: Số lượng lớp học phần đã mở */}
            <div className="dashboard-card">
              <h3>Lớp học phần đã mở</h3>
              <BarChart
                width={250}
                height={180}
                data={teacherStats.classCountBySemester || []}
              >
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </div>
            {/* Card: Số lượng giảng viên */}
            <div className="dashboard-card">
              <h3>Số lượng giảng viên</h3>
              <div className="card-stat">{teacherStats.total || 0}</div>
            </div>
            {/* Card: Lịch giảng dạy tổng quát */}
            <div className="dashboard-card">
              <h3>Lịch giảng dạy</h3>
              <ul>
                {(teacherStats.schedule || []).map((item, idx) => (
                  <li key={idx}>
                    {item.teacher} - {item.time}
                  </li>
                ))}
              </ul>
            </div>
            {/* Card: Lịch sử phê duyệt yêu cầu mở lớp */}
            <div className="dashboard-card">
              <h3>Lịch sử phê duyệt</h3>
              <ul>
                {(teacherStats.approveHistory || []).map((h, idx) => (
                  <li key={idx}>
                    {h.action} - {h.time}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
