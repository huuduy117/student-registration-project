"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "../hook/useSession";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaSchool } from "react-icons/fa";
import "./../assets/Login.css";

const API_URL = "http://localhost:5000"; // Define API URL directly in component for now

const getRoleBasedRedirect = () => {
  return "/home";
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const tabId = useSession();

  useEffect(() => {
    // Check if user was logged out due to duplicate login
    const logoutReason = sessionStorage.getItem("logout_reason");
    if (logoutReason === "duplicate_login") {
      setError(
        "Tài khoản này đang bị đăng nhập ở nơi khác, vui lòng đăng nhập lại"
      );
      sessionStorage.removeItem("logout_reason");
    }

    // Check for saved credentials
    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      const { username: savedUsername } = JSON.parse(savedCredentials);
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  // Add a function to update session activity - using useCallback to fix the dependency issue
  const updateSessionActivity = useCallback(() => {
    const authData = JSON.parse(
      sessionStorage.getItem(`auth_${tabId}`) || "{}"
    );
    if (authData.token) {
      authData.lastActivity = Date.now();
      sessionStorage.setItem(`auth_${tabId}`, JSON.stringify(authData));
    }
  }, [tabId]);

  // Set up an interval to update session activity
  useEffect(() => {
    const interval = setInterval(updateSessionActivity, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [updateSessionActivity]); // Fixed dependency array

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        username,
        password,
      });

      const { token, user } = response.data;

      // Check if this user is already logged in elsewhere
      const allKeys = Object.keys(sessionStorage);
      const authKeys = allKeys.filter(
        (key) => key.startsWith("auth_") && key !== `auth_${tabId}`
      );

      for (const key of authKeys) {
        const otherAuthData = JSON.parse(sessionStorage.getItem(key) || "{}");

        if (otherAuthData.username === user.username) {
          // Force logout the other session
          sessionStorage.removeItem(key);
        }
      }

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("savedCredentials", JSON.stringify({ username }));
      } else {
        localStorage.removeItem("savedCredentials");
      }

      // Lưu thông tin đăng nhập cho tab hiện tại
      const sessionData = {
        token,
        userRole: user.userRole, // Sửa lại lấy đúng userRole từ backend
        username: user.username,
        fullName: user.fullName,
        userId: user.id,
        lastActivity: Date.now(),
      };

      sessionStorage.setItem(`auth_${tabId}`, JSON.stringify(sessionData));

      // Set axios default headers cho tab hiện tại
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Redirect dựa trên role
      const redirectPath = getRoleBasedRedirect(user.role);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Đã có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <FaSchool />
          </div>
          <h1 className="login-title">Đăng nhập</h1>
          <p className="login-subtitle">Hệ thống quản lý đăng ký học phần</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="remember-forgot">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
            </div>
            <a href="#" className="forgot-password">
              Quên mật khẩu?
            </a>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`login-button ${loading ? "loading" : ""}`}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="login-footer">
            <p className="signup-text">
              Chưa có tài khoản?{" "}
              <a href="#" className="signup-link">
                Liên hệ quản trị viên
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
