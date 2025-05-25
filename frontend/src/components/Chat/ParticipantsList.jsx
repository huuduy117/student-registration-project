"use client";

const ParticipantsList = ({ request, onClose }) => {
  if (!request || !request.participants) {
    return (
      <div className="participants-list-modal">
        <div className="modal-content">
          <h2 className="modal-title">👥 Danh sách sinh viên tham gia</h2>
          <p className="no-data-message">
            Không có dữ liệu về sinh viên tham gia.
          </p>
          <div className="modal-actions">
            <button onClick={onClose} className="close-button">
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " " +
      date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    );
  };

  return (
    <div className="participants-list-modal">
      <div className="modal-content">
        <h2 className="modal-title">👥 Danh sách sinh viên tham gia</h2>
        <div className="modal-subtitle">
          <span className="course-name">{request.courseName}</span>
          <span className="participant-count">
            ({request.participantCount} sinh viên)
          </span>
        </div>

        <div className="participants-table-container">
          <table className="participants-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {request.participants.map((participant, index) => (
                <tr key={participant.studentId}>
                  <td>{index + 1}</td>
                  <td>{participant.studentId}</td>
                  <td>{participant.fullName}</td>
                  <td>{participant.class}</td>
                  <td>{formatDate(participant.joinDate)}</td>
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
  );
};

export default ParticipantsList;
