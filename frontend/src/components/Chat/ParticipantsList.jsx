"use client"

const ParticipantsList = ({ request, onClose }) => {
  if (!request || !request.participants) {
    return (
      <div className="participants-list-modal">
        <div className="modal-content">
          <h2 className="modal-title">👥 Danh sách sinh viên tham gia</h2>
          <p className="no-data-message">Không có dữ liệu về sinh viên tham gia.</p>
          <div className="modal-actions">
            <button onClick={onClose} className="close-button">
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="participants-list-modal">
      <div className="modal-content">
        <h2 className="modal-title">👥 Danh sách sinh viên tham gia</h2>
        <div className="modal-subtitle">
          <span className="course-name">{request.courseName}</span>
          <span className="participant-count">({request.participants.length} sinh viên)</span>
        </div>

        <div className="participants-table-container">
          <table className="participants-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Lớp</th>
              </tr>
            </thead>
            <tbody>
              {request.participants.map((participant, index) => (
                <tr key={participant.studentId}>
                  <td>{index + 1}</td>
                  <td>{participant.studentId}</td>
                  <td>{participant.fullName}</td>
                  <td>{participant.class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="close-button">
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default ParticipantsList
