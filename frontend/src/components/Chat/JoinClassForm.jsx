"use client"

import { useState, useEffect } from "react"
import SimpleCaptcha from "../SimpleCaptcha"

const JoinClassForm = ({ request, onSubmit, onCancel }) => {
  const [studentInfo, setStudentInfo] = useState({
    studentId: "",
    fullName: "",
    class: "",
  })
  const [errors, setErrors] = useState({})
  const [classOptions] = useState(["12DHTH11", "12DHTH12", "12DHTH13", "12DHTH14", "12DHTH15"])
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Get user info from session storage
    const tabId = sessionStorage.getItem("tabId")
    const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

    if (authData.userId && authData.userRole === "SinhVien") {
      setCurrentUser({
        id: authData.userId,
        name: authData.fullName || authData.username,
      })

      // Pre-fill student ID if available
      setStudentInfo((prev) => ({
        ...prev,
        studentId: authData.userId || "",
      }))
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setStudentInfo({
      ...studentInfo,
      [name]: value,
    })
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!studentInfo.studentId) newErrors.studentId = "Vui lòng nhập mã số sinh viên"
    if (!studentInfo.fullName) newErrors.fullName = "Vui lòng nhập họ tên"
    if (!studentInfo.class) newErrors.class = "Vui lòng chọn lớp"
    if (!captchaVerified) newErrors.captcha = "Vui lòng xác nhận CAPTCHA"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        requestId: request.id,
        ...studentInfo,
      })
    }
  }

  const handleCaptchaVerify = (verified) => {
    setCaptchaVerified(verified)
    if (!verified) {
      setErrors({
        ...errors,
        captcha: null,
      })
    }
  }

  return (
    <div className="join-class-form">
      <h2 className="form-title">👥 Tham gia lớp học phần</h2>
      <div className="request-info">
        <div className="info-item">
          📚<span className="info-label">Môn học:</span>
          <span className="info-value">{request.courseName}</span>
        </div>
        <div className="info-item">
          📅<span className="info-label">Học kỳ:</span>
          <span className="info-value">
            {request.semester && `HK${request.semester}`} {request.batch}
          </span>
        </div>
        <div className="info-item">
          👥<span className="info-label">Số lượng:</span>
          <span className="info-value">
            {request.participantCount || request.participants?.length || 0}/30 sinh viên
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mã số sinh viên</label>
          <input
            type="text"
            name="studentId"
            value={studentInfo.studentId}
            onChange={handleChange}
            className="form-input"
            placeholder="Nhập mã số sinh viên"
            readOnly={currentUser?.id ? true : false}
          />
          {errors.studentId && <div className="error-message">{errors.studentId}</div>}
        </div>

        <div className="form-group">
          <label>Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={studentInfo.fullName}
            onChange={handleChange}
            className="form-input"
            placeholder="Nhập họ và tên"
          />
          {errors.fullName && <div className="error-message">{errors.fullName}</div>}
        </div>

        <div className="form-group">
          <label>Lớp</label>
          <select name="class" value={studentInfo.class} onChange={handleChange} className="form-input">
            <option value="">-- Chọn lớp --</option>
            {classOptions.map((classOption) => (
              <option key={classOption} value={classOption}>
                {classOption}
              </option>
            ))}
          </select>
          {errors.class && <div className="error-message">{errors.class}</div>}
        </div>

        <div className="form-group captcha-group">
          <SimpleCaptcha onVerify={handleCaptchaVerify} />
          {errors.captcha && <div className="error-message">{errors.captcha}</div>}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Hủy
          </button>
          <button type="submit" className="submit-button" disabled={!captchaVerified}>
            Tham gia
          </button>
        </div>
      </form>
    </div>
  )
}

export default JoinClassForm
