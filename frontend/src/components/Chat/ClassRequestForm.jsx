import { useState } from "react";

const ClassRequestForm = ({ onSubmit, onCancel, username }) => {
  const [formData, setFormData] = useState({
    courseName: "",
    creatorStudentId: username || "", // Pre-populate with username
    creatorClass: "",
    semester: "1",
    batch: "2023-2024",
  });
  const [errors, setErrors] = useState({});

  const tabId = sessionStorage.getItem("tabId");
  const _AUTH_DATA = JSON.parse(
    sessionStorage.getItem(`auth_${tabId}`) || "{}"
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.courseName.trim()) {
      newErrors.courseName = "Tên môn học không được để trống";
    }

    if (!/^\d{8}$/.test(formData.creatorStudentId)) {
      newErrors.creatorStudentId = "Mã sinh viên phải có 8 chữ số";
    }

    if (!formData.creatorClass.trim()) {
      newErrors.creatorClass = "Lớp không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // xử lý logic với authData.username và authData.userId
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Tạo yêu cầu mở lớp</h3>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="courseName">Tên môn học</label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
              placeholder="Nhập tên môn học"
              className={errors.courseName ? "error" : ""}
            />
            {errors.courseName && (
              <span className="error-message">{errors.courseName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="creatorStudentId">Mã sinh viên</label>
            <input
              type="text"
              id="creatorStudentId"
              name="creatorStudentId"
              value={formData.creatorStudentId}
              onChange={handleChange}
              required
              placeholder="Nhập mã sinh viên của bạn"
              className={errors.creatorStudentId ? "error" : ""}
            />
            {errors.creatorStudentId && (
              <span className="error-message">{errors.creatorStudentId}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="creatorClass">Lớp</label>
            <input
              type="text"
              id="creatorClass"
              name="creatorClass"
              value={formData.creatorClass}
              onChange={handleChange}
              required
              placeholder="Nhập lớp của bạn"
              className={errors.creatorClass ? "error" : ""}
            />
            {errors.creatorClass && (
              <span className="error-message">{errors.creatorClass}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="semester">Học kỳ</label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
            >
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
              <option value="3">Học kỳ hè</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="batch">Khóa</label>
            <select
              id="batch"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              required
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2021-2022">2021-2022</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Hủy
            </button>
            <button type="submit" className="submit-button">
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassRequestForm;
