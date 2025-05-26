"use client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSession, useSessionMonitor } from "./hook/useSession";
import { useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import Schedule from "./pages/Schedule";
import StudentDashboard from "./pages/SinhVien";
import TeacherDashboard from "./pages/GiangVien";
import AcademicDashboard from "./pages/Giaovu";
import DepartmentHeadDashboard from "./pages/TruongBoMon";
import AdminDashboard from "./pages/QuanTriVien";
import FacultyHeadDashboard from "./pages/TruongKhoa";
import UnauthorizedPage from "./pages/404";
import CreateClassRequest from "./pages/CreateClassRequest";
import ApproveRequests from "./pages/ApproveRequests";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminHome from "./pages/admin/Home";
import AdminUserManagement from "./pages/admin/UserManagement";
import AdminNewsfeed from "./pages/admin/Newsfeed";
import AdminApproveRequests from "./pages/admin/ApproveRequests";
import AdminSettings from "./pages/admin/Settings";

// Create a SessionMonitorWrapper components
const SessionMonitorWrapper = ({ children }) => {
  const tabId = useSession();

  useEffect(() => {
    const checkSession = () => {
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      if (!authData.token) return;

      // Check if this user is logged in elsewhere with a newer timestamp
      const allKeys = Object.keys(sessionStorage);
      const authKeys = allKeys.filter(
        (key) => key.startsWith("auth_") && key !== `auth_${tabId}`
      );

      for (const key of authKeys) {
        const otherAuthData = JSON.parse(sessionStorage.getItem(key) || "{}");

        if (
          otherAuthData.username === authData.username &&
          otherAuthData.lastActivity > authData.lastActivity
        ) {
          // Found a newer session for the same user
          sessionStorage.removeItem(`auth_${tabId}`);
          sessionStorage.setItem("logout_reason", "duplicate_login");
          window.location.href = "/login";
          break;
        }
      }
    };

    const interval = setInterval(checkSession, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [tabId]);

  return children;
};

// Update the PrivateRoute to use the SessionMonitorWrapper
const PrivateRoute = ({ children, allowedRoles }) => {
  const tabId = useSession();

  // Lấy thông tin xác thực của tab hiện tại
  const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}");

  if (!authData.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authData.userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <SessionMonitorWrapper>{children}</SessionMonitorWrapper>;
};

const SessionMonitor = () => {
  useSessionMonitor();
  return null;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protect home and chat routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/home"
          element={
            <PrivateRoute allowedRoles={null}>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat-page"
          element={
            <PrivateRoute allowedRoles={null}>
              <ChatPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/create-class-request"
          element={
            <PrivateRoute allowedRoles={["SinhVien"]}>
              <CreateClassRequest />
            </PrivateRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <PrivateRoute allowedRoles={null}>
              <Schedule />
            </PrivateRoute>
          }
        />

        <Route
          path="/approve-requests"
          element={
            <PrivateRoute
              allowedRoles={["GiaoVu", "TruongBoMon", "TruongKhoa"]}
            >
              <ApproveRequests />
            </PrivateRoute>
          }
        />

        {/* Existing protected routes */}
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute allowedRoles={["SinhVien"]}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher-dashboard"
          element={
            <PrivateRoute allowedRoles={["GiangVien"]}>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/academic-dashboard"
          element={
            <PrivateRoute allowedRoles={["GiaoVu"]}>
              <AcademicDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/department-head-dashboard"
          element={
            <PrivateRoute allowedRoles={["TruongBoMon"]}>
              <DepartmentHeadDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute allowedRoles={["QuanTriVien"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/faculty-head-dashboard"
          element={
            <PrivateRoute allowedRoles={["TruongKhoa"]}>
              <FacultyHeadDashboard />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/home"
          element={
            <PrivateRoute
              allowedRoles={["QuanTriVien", "QuanTriVienQuanTriVien"]}
            >
              <AdminHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/user-management"
          element={
            <PrivateRoute
              allowedRoles={["QuanTriVien", "QuanTriVienQuanTriVien"]}
            >
              <AdminUserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/newsfeed"
          element={
            <PrivateRoute
              allowedRoles={["QuanTriVien", "QuanTriVienQuanTriVien"]}
            >
              <AdminNewsfeed />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/approve-requests"
          element={
            <PrivateRoute
              allowedRoles={["QuanTriVien", "QuanTriVienQuanTriVien"]}
            >
              <AdminApproveRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <PrivateRoute
              allowedRoles={["QuanTriVien", "QuanTriVienQuanTriVien"]}
            >
              <AdminSettings />
            </PrivateRoute>
          }
        />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
