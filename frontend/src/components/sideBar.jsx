"use client";

import { FaTimes } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "../assets/SideBar.css";
import { useSessionMonitor } from "../hook/useSession";

export default function SideBar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tabId = sessionStorage.getItem("tabId");
  const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}");
  const userRole = authData.userRole || "guest";

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
    case "SinhVien":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "💬", text: "Chat", path: "/chat-page" },
        { icon: "📅", text: "Lịch học", path: "/schedule" },
        { icon: "📚", text: "Khóa học", path: "/student-dashboard" },
        { icon: "⚙️", text: "Cài đặt", path: "/settings" },
      ];
      break;
    case "GiangVien":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "💬", text: "Chat", path: "/chat-page" },
        { icon: "📅", text: "Lịch dạy", path: "/schedule" },
        { icon: "📝", text: "Yêu cầu mở lớp", path: "/approve-requests" },
        { icon: "⚙️", text: "Cài đặt", path: "/settings" },
      ];
      break;
    case "GiaoVu":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "💬", text: "Chat", path: "/chat-page" },
        { icon: "📅", text: "Lịch học", path: "/schedule" },
        { icon: "📝", text: "Phê duyệt mở lớp", path: "/approve-requests" },
        { icon: "⚙️", text: "Cài đặt", path: "/settings" },
      ];
      break;
    case "TruongBoMon":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "💬", text: "Chat", path: "/chat-page" },
        { icon: "📅", text: "Lịch học", path: "/schedule" },
        { icon: "📝", text: "Phê duyệt mở lớp", path: "/approve-requests" },
        { icon: "⚙️", text: "Cài đặt", path: "/settings" },
      ];
      break;
    case "TruongKhoa":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/home" },
        { icon: "💬", text: "Chat", path: "/chat-page" },
        { icon: "📅", text: "Lịch học", path: "/schedule" },
        { icon: "📝", text: "Phê duyệt mở lớp", path: "/approve-requests" },
        { icon: "⚙️", text: "Cài đặt", path: "/settings" },
      ];
      break;
    case "QuanTriVien":
      menuItems = [
        { icon: "🏠", text: "Home", path: "/admin/home" },
        {
          icon: "👤",
          text: "Quản lý tài khoản",
          path: "/admin/user-management",
        },
        { icon: "📢", text: "Bảng tin", path: "/admin/newsfeed" },
        {
          icon: "👥",
          text: "Quản lý người dùng",
          path: "/admin/user-management",
        },
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
            src="https://placehold.co/52x52/png"
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
