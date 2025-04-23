"use client"

const ClassRequestTicket = ({ request, onJoin, onViewParticipants, onViewDetails, onDelete, currentUser }) => {
  // Check if current user has already joined
  const hasJoined = request.participants.some((p) => p.fullName === currentUser)

  return (
    <div className="class-request-ticket">
      <div className="ticket-header">
        <div className="ticket-title">{request.courseName}</div>
        <div className="ticket-creator">
          <span>👤</span> {request.creatorName}
        </div>
      </div>

      <div className="ticket-details">
        <div className="ticket-detail">
          <strong>Học kỳ:</strong>{" "}
          <span>{request.semester === "1" ? "Học kỳ 1" : request.semester === "2" ? "Học kỳ 2" : "Học kỳ hè"}</span>
        </div>
        <div className="ticket-detail">
          <strong>Khóa:</strong> <span>{request.batch}</span>
        </div>
      </div>

      <div className="ticket-actions">
        <div className="participant-count">
          <span>👥</span> {request.participantCount}/30 người đã tham gia
        </div>
        <div className="ticket-buttons">
          <button className="action-button view-button" onClick={onViewParticipants}>
            <span>👥</span> Danh sách
          </button>
          <button className="action-button details-button" onClick={onViewDetails}>
            <span>📋</span> Chi tiết
          </button>
          <button
            className="action-button join-button"
            onClick={onJoin}
            disabled={hasJoined || request.participantCount >= 30}
          >
            {hasJoined ? "Đã tham gia" : "Tham gia"}
          </button>
        </div>
      </div>

      {onDelete && (
        <button className="delete-ticket-button" onClick={onDelete} title="Xóa yêu cầu">
          ×
        </button>
      )}
    </div>
  )
}

export default ClassRequestTicket
