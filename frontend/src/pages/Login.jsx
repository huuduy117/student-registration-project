"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "../hook/useSession"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { FaUser, FaLock } from "react-icons/fa"
import "./../assets/Login.css"

const API_URL = "http://localhost:5000" // Define API URL directly in component for now

const getRoleBasedRedirect = (role) => {
  switch (role) {
    case "SinhVien":
      return "/student-dashboard"
    case "GiangVien":
      return "/teacher-dashboard"
    case "GiaoVu":
      return "/academic-dashboard"
    case "TruongBoMon":
      return "/department-head-dashboard"
    case "QuanTriVien":
      return "/admin-dashboard"
    case "TruongKhoa":
      return "/faculty-head-dashboard"
    default:
      return "/home"
  }
}

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const tabId = useSession()

  useEffect(() => {
    // Check if user was logged out due to duplicate login
    const logoutReason = sessionStorage.getItem("logout_reason")
    if (logoutReason === "duplicate_login") {
      setError("Tài khoản này đang bị đăng nhập ở nơi khác, vui lòng đăng nhập lại")
      sessionStorage.removeItem("logout_reason")
    }
  }, [])

  // Add a function to update session activity - using useCallback to fix the dependency issue
  const updateSessionActivity = useCallback(() => {
    const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")
    if (authData.token) {
      authData.lastActivity = Date.now()
      sessionStorage.setItem(`auth_${tabId}`, JSON.stringify(authData))
    }
  }, [tabId])

  // Set up an interval to update session activity
  useEffect(() => {
    const interval = setInterval(updateSessionActivity, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [updateSessionActivity]) // Fixed dependency array

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        username,
        password,
      })

      const { token, user } = response.data

      // Check if this user is already logged in elsewhere
      const allKeys = Object.keys(sessionStorage)
      const authKeys = allKeys.filter((key) => key.startsWith("auth_") && key !== `auth_${tabId}`)

      for (const key of authKeys) {
        const otherAuthData = JSON.parse(sessionStorage.getItem(key) || "{}")

        if (otherAuthData.username === user.username) {
          // Force logout the other session
          sessionStorage.removeItem(key)
        }
      }

      // Lưu thông tin đăng nhập cho tab hiện tại
      const sessionData = {
        token,
        userRole: user.role,
        username: user.username,
        fullName: user.fullName,
        userId: user.id,
        lastActivity: Date.now(),
      }

      sessionStorage.setItem(`auth_${tabId}`, JSON.stringify(sessionData))

      // Set axios default headers cho tab hiện tại
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      // Redirect dựa trên role
      const redirectPath = getRoleBasedRedirect(user.role)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || "Đã có lỗi xảy ra!")
    } finally {
      setLoading(false)
    }
  }

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

          <button type="submit" disabled={loading} className={`login-button ${loading ? "loading" : ""}`}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
