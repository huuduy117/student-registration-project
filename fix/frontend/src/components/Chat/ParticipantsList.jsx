"use client"

const ParticipantsList = ({ request, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Danh sách người tham gia</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <h4>
          {request.courseName} - {request.participantCount}/30 người
        </h4>

        <div className="participants-list">
          {request.participants.map((participant, index) => (
            <div key={participant.studentId} className="participant-item">
              <div className="participant-info">
                <div className="participant-name">{participant.fullName}</div>
                <div className="participant-details">
                  MSSV: {participant.studentId} | Lớp: {participant.class}
                </div>
              </div>
              <div className="participant-number">{index + 1}</div>
            </div>
          ))}
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

export default ParticipantsList
