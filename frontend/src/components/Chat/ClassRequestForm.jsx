"use client"

import { useState, useEffect } from "react"

const ClassRequestForm = ({ onSubmit, onCancel, availableCourses }) => {
  const [formData, setFormData] = useState({
    maLopHP: "",
    participants: [],
  })
  const [participantInput, setParticipantInput] = useState("")
  const [errors, setErrors] = useState({})
  const [classOptions, setClassOptions] = useState([])

  useEffect(() => {
    // Mock data - in a real app, fetch from API
    setClassOptions(["12DHTH11", "12DHTH12", "12DHTH13", "12DHTH14", "12DHTH15"])
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
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

  const handleAddParticipant = () => {
    if (!participantInput.trim()) return

    // Simple validation - in a real app, validate against API
    const [studentId, fullName, className] = participantInput.split(",").map((item) => item.trim())

    if (!studentId || !fullName || !className) {
      setErrors({
        ...errors,
        participants: "Định dạng không hợp lệ. Vui lòng sử dụng: MSSV, Họ tên, Lớp",
      })
      return
    }

    const newParticipant = {
      studentId,
      fullName,
      class: className,
    }

    // Check if student ID already exists
    if (formData.participants.some((p) => p.studentId === studentId)) {
      setErrors({
        ...errors,
        participants: "Sinh viên này đã được thêm vào danh sách",
      })
      return
    }

    setFormData({
      ...formData,
      participants: [...formData.participants, newParticipant],
    })
    setParticipantInput("")
    setErrors({
      ...errors,
      participants: null,
    })
  }

  const handleRemoveParticipant = (studentId) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((p) => p.studentId !== studentId),
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.maLopHP) newErrors.maLopHP = "Vui lòng chọn lớp học phần"
    if (formData.participants.length === 0) newErrors.participants = "Vui lòng thêm ít nhất một sinh viên"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  // Get selected course details
  const selectedCourse = availableCourses?.find((course) => course.maLopHP === formData.maLopHP)

  return (
    <div className="class-request-form">
      <h2 className="form-title">👨‍🏫 Tạo yêu cầu mở lớp học phần</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>📚 Lớp học phần</label>
          <select name="maLopHP" value={formData.maLopHP} onChange={handleChange} className="form-input">
            <option value="">-- Chọn lớp học phần --</option>
            {availableCourses?.map((course) => (
              <option key={course.maLopHP} value={course.maLopHP}>
                {course.tenMH} - {course.maLopHP} ({course.hocKy} {course.namHoc})
              </option>
            ))}
          </select>
          {errors.maLopHP && <div className="error-message">{errors.maLopHP}</div>}
        </div>

        {selectedCourse && (
          <div className="course-details">
            <div className="detail-item">
              <span className="detail-label">Môn học:</span>
              <span className="detail-value">{selectedCourse.tenMH}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mã lớp:</span>
              <span className="detail-value">{selectedCourse.maLopHP}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Học kỳ:</span>
              <span className="detail-value">
                {selectedCourse.hocKy} {selectedCourse.namHoc}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Số tín chỉ:</span>
              <span className="detail-value">{selectedCourse.soTinChi}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sĩ số hiện tại:</span>
              <span className="detail-value">
                {selectedCourse.soLuongDangKy || 0}/{selectedCourse.siSoToiDa}
              </span>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>👥 Danh sách sinh viên tham gia</label>
          <div className="participant-input-container">
            <div className="form-row">
              <input
                type="text"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                className="form-input"
                placeholder="MSSV, Họ tên, Lớp (vd: 20110001, Nguyễn Văn A, 20DTHD1)"
              />
              <select
                className="form-input class-select"
                onChange={(e) => {
                  const selectedClass = e.target.value
                  if (selectedClass) {
                    const parts = participantInput.split(",")
                    if (parts.length >= 2) {
                      setParticipantInput(`${parts[0]}, ${parts[1]}, ${selectedClass}`)
                    } else if (parts.length === 1) {
                      setParticipantInput(`${parts[0]}, , ${selectedClass}`)
                    }
                  }
                }}
              >
                <option value="">-- Chọn lớp --</option>
                {classOptions.map((classOption) => (
                  <option key={classOption} value={classOption}>
                    {classOption}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={handleAddParticipant} className="add-participant-button">
              Thêm
            </button>
          </div>
          {errors.participants && <div className="error-message">{errors.participants}</div>}

          {formData.participants.length > 0 && (
            <div className="participants-list">
              <h3>Danh sách sinh viên đã thêm ({formData.participants.length})</h3>
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>MSSV</th>
                    <th>Họ tên</th>
                    <th>Lớp</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.participants.map((participant) => (
                    <tr key={participant.studentId}>
                      <td>{participant.studentId}</td>
                      <td>{participant.fullName}</td>
                      <td>{participant.class}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(participant.studentId)}
                          className="remove-participant-button"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Hủy
          </button>
          <button type="submit" className="submit-button">
            Gửi yêu cầu
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClassRequestForm
