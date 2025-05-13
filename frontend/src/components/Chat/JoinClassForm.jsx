"use client"

import { useState } from "react"
// Remove this line:
// import { FaUsers, FaBook, FaCalendarAlt } from "react-icons/fa"

const JoinClassForm = ({ request, onSubmit, onCancel }) => {
  const [studentInfo, setStudentInfo] = useState({
    studentId: "",
    fullName: "",
    class: "",
  })
  const [errors, setErrors] = useState({})
  const [classOptions] = useState(["12DHTH11", "12DHTH12", "12DHTH13", "12DHTH14", "12DHTH15"])

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
          <span className="info-value">{request.participantCount || request.participants?.length || 0} sinh viên</span>
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

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Hủy
          </button>
          <button type="submit" className="submit-button">
            Tham gia
          </button>
        </div>
      </form>
    </div>
  )
}

export default JoinClassForm
