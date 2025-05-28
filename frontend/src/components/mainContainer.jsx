"use client";

import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, BookOpen, Users, TrendingUp, Clock, MessageSquare, Award, Activity } from 'lucide-react';
import DashboardSV from "./SinhVien/dashboard_SV.jsx";
import "../assets/MainContainer.css";
import { useSession } from "../hook/useSession";
import AdminHome from "../pages/admin/Home.jsx";
import UserManagement from "../pages/admin/UserManagement.jsx";
import Newsfeed from "../pages/admin/Newsfeed.jsx";
import ApproveRequests from "../pages/admin/ApproveRequests.jsx";
import Settings from "../pages/admin/Settings.jsx";

export default function MainContainer() {
  const [username, setUsername] = useState("Anonymous User");
  const tabId = useSession();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const authData = JSON.parse(
      sessionStorage.getItem(`auth_${tabId}`) || "{}"
    );
    if (authData.username) {
      setUsername(authData.username);
    }
    if (authData.userRole) {
      setUserRole(authData.userRole);
    }
  }, [tabId]);

  const QuickActionCard = ({ icon: Icon, title, description, link, color = "#667eea" }) => (
    <motion.div
      className="quick-action-card"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="action-icon" style={{ background: `${color}20`, color }}>
          <Icon size={24} />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
      </Link>
    </motion.div>
  );

  const StatCard = ({ icon: Icon, title, value, change, color = "#667eea" }) => (
    <motion.div
      className="stat-card-mini"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="stat-icon" style={{ background: `${color}20`, color }}>
        <Icon size={20} />
      </div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {change && (
          <div className="stat-change positive">
            <TrendingUp size={12} />
            +{change}%
          </div>
        )}
      </div>
    </motion.div>
  );

  let dashboardContent;

  switch (userRole) {
    case "SinhVien":
      dashboardContent = (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="welcome-section">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Chào mừng, {username}! 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Hôm nay là ngày tuyệt vời để học tập!
            </motion.p>
          </div>

          <div className="stats-overview">
            <StatCard
              icon={BookOpen}
              title="Môn học"
              value="8"
              change="12"
              color="#10b981"
            />
            <StatCard
              icon={Calendar}
              title="Lịch học hôm nay"
              value="3"
              color="#f59e0b"
            />
            <StatCard
              icon={Award}
              title="Điểm trung bình"
              value="8.5"
              change="5"
              color="#8b5cf6"
            />
            <StatCard
              icon={Activity}
              title="Hoạt động"
              value="15"
              change="8"
              color="#ef4444"
            />
          </div>

          <div className="quick-actions">
            <h2>Thao tác nhanh</h2>
            <div className="actions-grid">
              <QuickActionCard
                icon={Calendar}
                title="Xem lịch học"
                description="Kiểm tra lịch học và lịch thi"
                link="/schedule"
                color="#3b82f6"
              />
              <QuickActionCard
                icon={MessageSquare}
                title="Chat & Yêu cầu"
                description="Tham gia chat và tạo yêu cầu mở lớp"
                link="/chat-page"
                color="#10b981"
              />
              <QuickActionCard
                icon={BookOpen}
                title="Khóa học"
                description="Xem thông tin các khóa học"
                link="/student-dashboard"
                color="#f59e0b"
              />
              <QuickActionCard
                icon={Users}
                title="Cộng đồng"
                description="Kết nối với bạn bè và giảng viên"
                link="/chat-page"
                color="#8b5cf6"
              />
            </div>
          </div>

          <div className="content-section">
            <DashboardSV username={username} />
          </div>
        </motion.div>
      );
      break;

    case "GiangVien":
      dashboardContent = (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="welcome-section">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Chào mừng, Thầy/Cô {username}! 🎓
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Hôm nay có những lớp học thú vị đang chờ bạn!
            </motion.p>
          </div>

          <div className="stats-overview">
            <StatCard
              icon={Users}
              title="Lớp phụ trách"
              value="5"
              color="#10b981"
            />
            <StatCard
              icon={Calendar}
              title="Lịch dạy hôm nay"
              value="4"
              color="#f59e0b"
            />
            <StatCard
              icon={BookOpen}
              title="Môn giảng dạy"
              value="3"
              color="#8b5cf6"
            />
            <StatCard
              icon={Clock}
              title="Giờ dạy tuần này"
              value="18"
              color="#ef4444"
            />
          </div>

          <div className="quick-actions">
            <h2>Thao tác nhanh</h2>
            <div className="actions-grid">
              <QuickActionCard
                icon={Calendar}
                title="Lịch giảng dạy"
                description="Xem lịch dạy và quản lý thời khóa biểu"
                link="/teacher-schedule"
                color="#3b82f6"
              />
              <QuickActionCard
                icon={BookOpen}
                title="Phê duyệt yêu cầu"
                description="Xử lý yêu cầu mở lớp từ sinh viên"
                link="/approve-requests"
                color="#10b981"
              />
              <QuickActionCard
                icon={MessageSquare}
                title="Chat với sinh viên"
                description="Tương tác và hỗ trợ sinh viên"
                link="/chat-page"
                color="#f59e0b"
              />
              <QuickActionCard
                icon={Users}
                title="Quản lý lớp"
                description="Xem thông tin lớp và sinh viên"
                link="/teacher-dashboard"
                color="#8b5cf6"
              />
            </div>
          </div>
        </motion.div>
      );
      break;

    case "GiaoVu":
    case "TruongBoMon":
    case "TruongKhoa":
      const roleNames = {
        GiaoVu: "Giáo vụ",
        TruongBoMon: "Trưởng bộ môn", 
        TruongKhoa: "Trưởng khoa"
      };

      dashboardContent = (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="welcome-section">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Chào mừng, {roleNames[userRole]} {username}! 👨‍💼
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Quản lý hiệu quả các hoạt động học tập!
            </motion.p>
          </div>

          <div className="stats-overview">
            <StatCard
              icon={BookOpen}
              title="Yêu cầu chờ duyệt"
              value="12"
              color="#f59e0b"
            />
            <StatCard
              icon={Users}
              title="Sinh viên"
              value="450"
              change="8"
              color="#10b981"
            />
            <StatCard
              icon={Award}
              title="Đã phê duyệt"
              value="28"
              change="15"
              color="#8b5cf6"
            />
            <StatCard
              icon={Activity}
              title="Hoạt động hôm nay"
              value="6"
              color="#ef4444"
            />
          </div>

          <div className="quick-actions">
            <h2>Thao tác nhanh</h2>
            <div className="actions-grid">
              <QuickActionCard
                icon={BookOpen}
                title="Phê duyệt yêu cầu"
                description="Xử lý các yêu cầu mở lớp học phần"
                link="/approve-requests"
                color="#f59e0b"
              />
              <QuickActionCard
                icon={Calendar}
                title="Xem lịch"
                description="Kiểm tra lịch học và lịch thi"
                link="/schedule"
                color="#3b82f6"
              />
              <QuickActionCard
                icon={MessageSquare}
                title="Thảo luận"
                description="Tham gia thảo luận với giảng viên"
                link="/chat-page"
                color="#10b981"
              />
              <QuickActionCard
                icon={Users}
                title="Quản lý"
                description="Quản lý sinh viên và giảng viên"
                link={`/${userRole.toLowerCase()}-dashboard`}
                color="#8b5cf6"
              />
            </div>
          </div>
        </motion.div>
      );
      break;

    case "QuanTriVien":
      dashboardContent = (
        <div className="content-section">
          <Routes>
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/newsfeed" element={<Newsfeed />} />
            <Route
              path="/admin/approve-requests"
              element={<ApproveRequests />}
            />
            <Route path="/admin/settings" element={<Settings />} />
          </Routes>
        </div>
      );
      break;

    default:
      dashboardContent = (
        <motion.div
          className="welcome-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Chào mừng đến với hệ thống! 🎉</h1>
          <p>Vui lòng đăng nhập để truy cập dashboard của bạn.</p>
        </motion.div>
      );
  }

  return (
    <div className="main-container-wrapper">
      <div className="main-container-content">{dashboardContent}</div>
    </div>
  );
}
