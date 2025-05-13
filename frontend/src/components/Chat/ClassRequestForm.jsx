"use client"

import { useState, useEffect } from "react"
// Remove this line:
// import { FaUsers, FaBook, FaCalendarAlt, FaChalkboardTeacher } from "react-icons/fa"

// And update the component to use Unicode symbols
const ClassRequestForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    courseName: "",
    semester: "",
    batch: "",
    description: "",
    participants: [],
  })
  const [participantInput, setParticipantInput] = useState("")
  const [errors, setErrors] = useState({})
  const [classOptions, setClassOptions] = useState([])
  const [courseOptions, setCourseOptions] = useState([])

  useEffect(() => {
    // Mock data - in a real app, fetch from API
    setClassOptions(["12DHTH11", "12DHTH12", "12DHTH13", "12DHTH14", "12DHTH15"])
    setCourseOptions([
      "Lập trình Web",
      "Cơ sở dữ liệu",
      "Trí tuệ nhân tạo",
      "Phát triển ứng dụng di động",
      "An toàn thông tin",
    ])
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
    if (!formData.courseName) newErrors.courseName = "Vui lòng chọn môn học"
    if (!formData.semester) newErrors.semester = "Vui lòng nhập học kỳ"
    if (!formData.batch) newErrors.batch = "Vui lòng nhập năm học"
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

  return (
    <div className="class-request-form">
      <h2 className="form-title">👨‍🏫 Tạo yêu cầu mở lớp học phần</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>📚 Môn học</label>
          <select name="courseName" value={formData.courseName} onChange={handleChange} className="form-input">
            <option value="">-- Chọn môn học --</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          {errors.courseName && <div className="error-message">{errors.courseName}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>📅 Học kỳ</label>
            <select name="semester" value={formData.semester} onChange={handleChange} className="form-input">
              <option value="">-- Chọn học kỳ --</option>
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
              <option value="3">Học kỳ hè</option>
            </select>
            {errors.semester && <div className="error-message">{errors.semester}</div>}
          </div>

          <div className="form-group">
            <label>📅 Năm học</label>
            <select name="batch" value={formData.batch} onChange={handleChange} className="form-input">
              <option value="">-- Chọn năm học --</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
            </select>
            {errors.batch && <div className="error-message">{errors.batch}</div>}
          </div>
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Mô tả lý do mở lớp học phần này..."
            rows="3"
          ></textarea>
        </div>

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
