"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SideBar from "../components/sideBar"
import axios from "axios"
import "../assets/CreateClassRequest.css"
import { useSessionMonitor } from "../hook/useSession"
import SimpleCaptcha from "../components/SimpleCaptcha"

const CreateClassRequest = () => {
  const [formData, setFormData] = useState({
    maLopHP: "",
    description: "",
  })
  const [availableCourses, setAvailableCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [studentInfo, setStudentInfo] = useState(null)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  // Use the session monitor
  useSessionMonitor()

  useEffect(() => {
    // Get user info from session storage
    const tabId = sessionStorage.getItem("tabId")
    const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

    if (!authData.userId || authData.userRole !== "SinhVien") {
      // Redirect non-students to home page
      navigate("/home")
      return
    }

    // Fetch student information
    const fetchStudentInfo = async () => {
      try {
        const response = await axios.get(`/api/students/${authData.userId}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        })
        setStudentInfo(response.data)
      } catch (error) {
        console.error("Error fetching student info:", error)
        setError("Không thể lấy thông tin sinh viên")
      }
    }

    // Fetch available courses
    const fetchAvailableCourses = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/class-requests/available-courses", {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        })
        setAvailableCourses(response.data)
      } catch (error) {
        console.error("Error fetching available courses:", error)
        setError("Không thể lấy danh sách môn học")
      } finally {
        setLoading(false)
      }
    }

    fetchStudentInfo()
    fetchAvailableCourses()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!captchaVerified) {
      setError("Vui lòng xác nhận CAPTCHA")
      return
    }

    if (!formData.maLopHP) {
      setError("Vui lòng chọn lớp học phần")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const tabId = sessionStorage.getItem("tabId")
      const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

      await axios.post(
        "/api/class-requests",
        {
          maSV: authData.userId,
          maLopHP: formData.maLopHP,
          description: formData.description,
          // The student creating the request is automatically counted as the first participant
          participants: [{ maSV: authData.userId }],
        },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        },
      )

      // Redirect to chat page after successful creation
      navigate("/chat-page")
    } catch (error) {
      console.error("Error creating class request:", error)
      setError(error.response?.data?.message || "Lỗi khi tạo yêu cầu mở lớp")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCaptchaVerify = (verified) => {
    setCaptchaVerified(verified)
  }

  // Get selected course details
  const selectedCourse = availableCourses?.find((course) => course.maLopHP === formData.maLopHP)

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <div className="create-request-container">
          <h1 className="page-title">Tạo yêu cầu mở lớp học phần</h1>

          {loading ? (
            <div className="loading-message">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className="create-request-form">
              {studentInfo && (
                <div className="student-info-section">
                  <h2>Thông tin sinh viên</h2>
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">MSSV:</span>
                      <span className="info-value">{studentInfo.maSV}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Họ tên:</span>
                      <span className="info-value">{studentInfo.hoTen}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Lớp:</span>
                      <span className="info-value">{studentInfo.maLop}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="maLopHP">Lớp học phần</label>
                <select
                  id="maLopHP"
                  name="maLopHP"
                  value={formData.maLopHP}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">-- Chọn lớp học phần --</option>
                  {availableCourses?.map((course) => (
                    <option key={course.maLopHP} value={course.maLopHP}>
                      {course.tenMH} - {course.maLopHP} ({course.hocKy} {course.namHoc})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourse && (
                <div className="course-details">
                  <h2>Thông tin lớp học phần</h2>
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Môn học:</span>
                      <span className="info-value">{selectedCourse.tenMH}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Mã lớp:</span>
                      <span className="info-value">{selectedCourse.maLopHP}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Học kỳ:</span>
                      <span className="info-value">
                        {selectedCourse.hocKy} {selectedCourse.namHoc}
                      </span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Số tín chỉ:</span>
                      <span className="info-value">{selectedCourse.soTinChi}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Sĩ số hiện tại:</span>
                      <span className="info-value">
                        {selectedCourse.soLuongDangKy || 0}/{selectedCourse.siSoToiDa}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Trạng thái:</span>
                      <span className="info-value status-open">Đang mở đăng ký</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="description">Mô tả yêu cầu (không bắt buộc)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input textarea"
                  placeholder="Nhập mô tả hoặc lý do yêu cầu mở lớp..."
                  rows={4}
                />
              </div>

              <div className="form-group captcha-group">
                <SimpleCaptcha onVerify={handleCaptchaVerify} />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => navigate("/chat-page")} className="cancel-button">
                  Hủy
                </button>
                <button type="submit" className="submit-button" disabled={submitting || !captchaVerified}>
                  {submitting ? "Đang xử lý..." : "Tạo yêu cầu"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

export default CreateClassRequest
