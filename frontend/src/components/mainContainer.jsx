import "../assets/MainContainer.css";

export default function MainContainer() {
  return (
    <div className="main-container-wrapper">
      <div className="main-container-header">
        <h1>Dashboard</h1>
      </div>
      <div className="main-container-content">
        <div className="content-section">
          <h2>Recent Activities</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-title">New Student Registration</div>
              <div className="activity-time">2 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-title">Course Update</div>
              <div className="activity-time">5 hours ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-title">Schedule Change</div>
              <div className="activity-time">Yesterday</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
