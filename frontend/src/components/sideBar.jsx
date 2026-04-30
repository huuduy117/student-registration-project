"use client";

import { FaTimes } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "../assets/SideBar.css";
import { useSessionMonitor } from "../hook/useSession";
import { normalizeRole } from "../utils/roleUtils";

export default function SideBar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tabId = sessionStorage.getItem("tabId");
  const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}");
  const userRole = normalizeRole(authData.userRole) || "guest";

  // Use the session monitor
  useSessionMonitor();

  const handleLogout = () => {
    // Chỉ xóa thông tin đăng nhập của tab hiện tại
    sessionStorage.removeItem(`auth_${tabId}`);
    navigate("/login", { replace: true });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  let menuItems;

  switch (userRole) {
    case "admin":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "👤", text: "Quản lý tài khoản", path: "#" },
        { icon: "📢", text: "Bảng tin", path: "#" },
        { icon: "👥", text: "Quản lý người dùng", path: "#" },
        { icon: "📝", text: "Xét duyệt yêu cầu", path: "#" },
        { icon: "⚙️", text: "Cài đặt", path: "#" },
      ];
      break;
    case "Student":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "💬", text: "Chat", path: "/chat-page" },
        { icon: "📅", text: "Lịch học", path: "/schedule" },
        { icon: "📚", text: "Đăng ký học phần", path: "/class-registration" },
        { icon: "⚙️", text: "Cài đặt", path: "/settings" },
      ];
      break;
    case "Teacher":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "📅", text: "Lịch dạy", path: "/teacher-schedule" },
        { icon: "📝", text: "Đăng ký giảng dạy", path: "/register-teaching" },
      ];
      break;
    case "AcademicAffairs":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "📝", text: "Phê duyệt mở lớp", path: "/approve-requests" },
      ];
      break;
    case "DepartmentHead":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "📝", text: "Phê duyệt mở lớp", path: "/approve-requests" },
      ];
      break;
    case "FacultyHead":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "📝", text: "Phê duyệt mở lớp", path: "/approve-requests" },
      ];
      break;
    case "Admin":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/admin/home" },
        {
          icon: "👤",
          text: "Quản lý tài khoản",
          path: "/admin/user-management",
        },
        { icon: "📢", text: "Bảng tin", path: "/admin/newsfeed" },
        {
          icon: "📝",
          text: "Xét duyệt yêu cầu",
          path: "/admin/approve-requests",
        },
        { icon: "⚙️", text: "Cài đặt", path: "/admin/settings" },
      ];
      break;
    default:
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "💬", text: "Chat", path: "/chat-page" },
        { icon: "📅", text: "Lịch học", path: "/schedule" },
        { icon: "⚙️", text: "Cài đặt", path: "/settings" },
      ];
  }

  return (
    <>
      <button className="mobile-menu-button" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : "☰"}
      </button>

      <div className={`side-bar-wrapper ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="side-bar-header">
          <img
            alt="avatar"
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wWNP1GTEvZoUNtVnncA42SikCWs7AE.png"
            className="side-bar-avatar"
          />
          <div className="side-bar-user-name">
            {authData.username || "Guest"}
          </div>
        </div>
        <nav className="side-bar-main">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.path} className="menu-item">
              <span className="menu-item-icon">{item.icon}</span>
              <span className="menu-item-text">{item.text}</span>
            </Link>
          ))}
        </nav>

        <div className="side-bar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="menu-item-icon">🚪</span>
            <span className="menu-item-text">Log out</span>
          </button>
        </div>
      </div>

      {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </>
  );
}
