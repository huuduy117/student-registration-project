"use client";

import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
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

  let dashboardContent;

  switch (userRole) {
    case "SinhVien":
      dashboardContent = (
        <div className="content-section">
          <DashboardSV username={username} />
        </div>
      );
      break;
    case "GiangVien":
      dashboardContent = (
        <div className="content-section">
          <h2>Teacher Dashboard</h2>
          <p>Welcome, {username}!</p>
          <Link to="/teacher-dashboard">Go to Teacher Dashboard</Link>
        </div>
      );
      break;
    case "GiaoVu":
      dashboardContent = (
        <div className="content-section">
          <h2>Academic Affairs Dashboard</h2>
          <p>Welcome, {username}!</p>
          <Link to="/academic-dashboard">Go to Academic Affairs Dashboard</Link>
        </div>
      );
      break;
    case "TruongBoMon":
      dashboardContent = (
        <div className="content-section">
          <h2>Department Head Dashboard</h2>
          <p>Welcome, {username}!</p>
          <Link to="/department-head-dashboard">
            Go to Department Head Dashboard
          </Link>
        </div>
      );
      break;
    case "TruongKhoa":
      dashboardContent = (
        <div className="content-section">
          <h2>Faculty Head Dashboard</h2>
          <p>Welcome, {username}!</p>
          <Link to="/faculty-head-dashboard">Go to Faculty Head Dashboard</Link>
        </div>
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
        <div className="content-section">
          <h2>Welcome</h2>
          <p>Please log in to access your dashboard.</p>
        </div>
      );
  }

  return (
    <div className="main-container-wrapper">
      {/* <div className="main-container-header">
        <h1>Dashboard</h1>
        <p>Welcome, {username}</p>
      </div> */}
      <div className="main-container-content">{dashboardContent}</div>
    </div>
  );
}
