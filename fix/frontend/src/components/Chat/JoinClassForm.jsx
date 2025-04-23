"use client"

import { useState } from "react"

const JoinClassForm = ({ onSubmit, onCancel, username }) => {
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: username,
    class: "",
    confirmed: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.confirmed) {
      alert("Vui lòng xác nhận thông tin của bạn là chính xác")
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Tham gia lớp học</h3>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="studentId">Mã sinh viên</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              placeholder="Nhập mã sinh viên của bạn"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên của bạn"
            />
          </div>

          <div className="form-group">
            <label htmlFor="class">Lớp</label>
            <input
              type="text"
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              placeholder="Nhập lớp của bạn"
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="confirmed"
              name="confirmed"
              checked={formData.confirmed}
              onChange={handleChange}
              required
            />
            <label htmlFor="confirmed">Tôi xác nhận thông tin trên là đúng</label>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Hủy
            </button>
            <button type="submit" className="submit-button">
              Xác nhận tham gia
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinClassForm
