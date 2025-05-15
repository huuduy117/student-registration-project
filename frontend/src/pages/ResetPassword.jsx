"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { FaLock, FaExclamationTriangle } from "react-icons/fa"
import axios from "axios"
import "../assets/Login.css"
import "../assets/ForgotPassword.css"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [remainingMinutes, setRemainingMinutes] = useState(0)
  const [countdown, setCountdown] = useState(0)

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Token không hợp lệ")
        setVerifying(false)
        return
      }

      try {
        const response = await axios.get(`/api/password-reset/verify/${token}`)
        setTokenValid(true)
        setRemainingMinutes(response.data.remainingMinutes)
        setCountdown(response.data.remainingMinutes * 60) // Convert to seconds
      } catch (err) {
        console.error("Token verification error:", err)
        setError(err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn")
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  // Countdown timer
  useEffect(() => {
    if (!tokenValid || countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setTokenValid(false)
          setError("Thời gian đặt lại mật khẩu đã hết. Vui lòng yêu cầu lại.")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [tokenValid, countdown])

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự"
    }

    if (!/[a-z]/.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ cái thường"
    }

    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ cái hoa"
    }

    if (!/[0-9]/.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ số"
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    setLoading(true)
    setError("")

    try {
      await axios.post("/api/password-reset/reset", {
        token,
        newPassword,
      })

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err) {
      console.error("Password reset error:", err)
      setError(err.response?.data?.message || "Đã có lỗi xảy ra khi đặt lại mật khẩu")
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <FaLock />
            </div>
            <h1 className="login-title">Đặt lại mật khẩu</h1>
            <p className="login-subtitle">Đang xác thực token...</p>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo success-logo">
              <span className="check-icon">✓</span>
            </div>
            <h1 className="login-title">Thành công!</h1>
            <p className="login-subtitle">Mật khẩu của bạn đã được đặt lại thành công</p>
          </div>
          <div className="success-container">
            <p>Bạn sẽ được chuyển hướng đến trang đăng nhập sau vài giây...</p>
            <Link to="/login" className="login-button">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo error-logo">
              <FaExclamationTriangle />
            </div>
            <h1 className="login-title">Token không hợp lệ</h1>
            <p className="login-subtitle">{error || "Token đã hết hạn hoặc không tồn tại"}</p>
          </div>
          <div className="error-container">
            <p>Vui lòng yêu cầu đặt lại mật khẩu mới.</p>
            <Link to="/forgot-password" className="login-button">
              Quên mật khẩu
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <FaLock />
          </div>
          <h1 className="login-title">Đặt lại mật khẩu</h1>
          <p className="login-subtitle">Nhập mật khẩu mới của bạn</p>
        </div>

        <div className="countdown-timer">
          <p>
            Thời gian còn lại: <span className="countdown">{formatTime(countdown)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="password-requirements">
            <p>Mật khẩu phải:</p>
            <ul>
              <li className={newPassword.length >= 8 ? "met" : ""}>Có ít nhất 8 ký tự</li>
              <li className={/[a-z]/.test(newPassword) ? "met" : ""}>Có ít nhất một chữ cái thường</li>
              <li className={/[A-Z]/.test(newPassword) ? "met" : ""}>Có ít nhất một chữ cái hoa</li>
              <li className={/[0-9]/.test(newPassword) ? "met" : ""}>Có ít nhất một chữ số</li>
            </ul>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className={`login-button ${loading ? "loading" : ""}`}>
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>

          <div className="login-footer">
            <p className="signup-text">
              <Link to="/login" className="signup-link">
                Quay lại đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
