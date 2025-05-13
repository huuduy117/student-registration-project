"use client"

const RequestDetails = ({ request, onClose, onJoin, currentUser }) => {
  if (!request) {
    return (
      <div className="request-details-modal">
        <div className="modal-content">
          <h2 className="modal-title">ℹ️ Chi tiết yêu cầu</h2>
          <p className="no-data-message">Không tìm thấy thông tin yêu cầu.</p>
          <div className="modal-actions">
            <button onClick={onClose} className="close-button">
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Check if current user is already a participant
  const isParticipant = request.participants?.some((p) => p.studentId === currentUser || p.fullName === currentUser)

  return (
    <div className="request-details-modal">
      <div className="modal-content">
        <h2 className="modal-title">ℹ️ Chi tiết yêu cầu mở lớp</h2>

        <div className="request-info-section">
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
            👤<span className="info-label">Người tạo:</span>
            <span className="info-value">
              {request.creatorName} {request.creatorStudentId && `(${request.creatorStudentId})`}{" "}
              {request.creatorClass && `- ${request.creatorClass}`}
            </span>
          </div>

          <div className="info-item">
            📅<span className="info-label">Ngày tạo:</span>
            <span className="info-value">{formatDate(request.createdAt)}</span>
          </div>

          <div className="info-item">
            👥<span className="info-label">Số lượng:</span>
            <span className="info-value">
              {request.participantCount || request.participants?.length || 0} sinh viên
            </span>
          </div>
        </div>

        {request.description && (
          <div className="description-section">
            <h3 className="section-title">Mô tả</h3>
            <p className="description-text">{request.description}</p>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="close-button">
            Đóng
          </button>
          {!isParticipant && (
            <button onClick={() => onJoin(request.id)} className="join-button">
              Tham gia
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestDetails
