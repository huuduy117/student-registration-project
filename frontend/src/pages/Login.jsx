"use client";

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "./../assets/Login.css";

const API_URL = "http://localhost:5000"; // Define API URL directly in component for now

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("username", user.username);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("fullName", user.fullName);
      localStorage.setItem("userId", user.id);

      // Set axios default headers for subsequent requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      navigate("/home", { replace: true });
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
        <h2 className="login-header">Đăng nhập</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>
              <FaUser /> Tên đăng nhập
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Mật khẩu
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`login-button ${loading ? "loading" : ""}`}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
