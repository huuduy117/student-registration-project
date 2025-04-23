"use client"

const RequestDetails = ({ request, onClose }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Thông tin đăng ký</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="request-details">
          <h4 style={{ marginBottom: "20px", color: "#2e7d32" }}>{request.courseName}</h4>

          <div className="form-group">
            <label>Người tạo yêu cầu</label>
            <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
              {request.creatorName}
            </div>
          </div>

          <div className="form-group">
            <label>Mã sinh viên người tạo</label>
            <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
              {request.creatorStudentId}
            </div>
          </div>

          <div className="form-group">
            <label>Lớp</label>
            <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
              {request.creatorClass}
            </div>
          </div>

          <div className="form-group">
            <label>Học kỳ</label>
            <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
              {request.semester === "1" ? "Học kỳ 1" : request.semester === "2" ? "Học kỳ 2" : "Học kỳ hè"}
            </div>
          </div>

          <div className="form-group">
            <label>Khóa</label>
            <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>{request.batch}</div>
          </div>

          <div className="form-group">
            <label>Thời gian tạo</label>
            <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
              {request.createdAt ? formatDate(request.createdAt) : "Không có thông tin"}
            </div>
          </div>

          <div className="form-group">
            <label>Số người tham gia</label>
            <div
              style={{
                padding: "10px",
                backgroundColor: "#e8f5e9",
                borderRadius: "8px",
                color: "#2e7d32",
                fontWeight: "bold",
              }}
            >
              {request.participantCount}/30 người
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="cancel-button" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default RequestDetails
