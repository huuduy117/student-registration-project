import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "./../assets/Login.css";

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
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        { username, password }
      );
      console.log(response.data);
      navigate("/home", { replace: true });
    } catch (err) {
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
          <div className="login-footer">
            <p className="signup-text">
              Không có tài khoản?
              <a href="#" className="signup-link">
                {" "}
                Đăng ký{" "}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
