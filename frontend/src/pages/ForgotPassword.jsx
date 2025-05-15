"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FaUser, FaEnvelope } from "react-icons/fa"
import SimpleCaptcha from "../components/SimpleCaptcha"
import axios from "axios"
import "../assets/Login.css"
import "../assets/ForgotPassword.css"

const ForgotPassword = () => {
  const [username, setUsername] = useState("")
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState("")

  const handleCaptchaVerify = (verified) => {
    setCaptchaVerified(verified)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username) {
      setError("Vui lòng nhập tên đăng nhập")
      return
    }

    if (!captchaVerified) {
      setError("Vui lòng xác nhận CAPTCHA")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("/api/password-reset/request", { username })
      setSuccess(true)
      setMaskedEmail(response.data.email)
    } catch (err) {
      console.error("Password reset request error:", err)
      setError(err.response?.data?.message || "Đã có lỗi xảy ra khi gửi yêu cầu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <FaEnvelope />
          </div>
          <h1 className="login-title">Quên mật khẩu</h1>
          <p className="login-subtitle">Nhập tên đăng nhập để nhận mã đặt lại mật khẩu</p>
        </div>

        {success ? (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h2>Yêu cầu đã được gửi!</h2>
            <p>
              Chúng tôi đã gửi email đến {maskedEmail} với hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn
              và làm theo hướng dẫn.
            </p>
            <p className="note">
              Email có thể mất vài phút để đến. Hãy kiểm tra cả thư mục spam nếu bạn không thấy email.
            </p>
            <div className="action-links">
              <Link to="/login" className="back-to-login">
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
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

            <div className="form-group captcha-group">
              <SimpleCaptcha onVerify={handleCaptchaVerify} />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={loading || !captchaVerified}
              className={`login-button ${loading ? "loading" : ""}`}
            >
              {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
            </button>

            <div className="login-footer">
              <p className="signup-text">
                Đã nhớ mật khẩu?{" "}
                <Link to="/login" className="signup-link">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
