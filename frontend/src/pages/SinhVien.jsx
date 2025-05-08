import "../assets/Dashboard.css";
import SideBar from "../components/sideBar";

const StudentDashboard = () => {
  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <h1>Student Dashboard</h1>
        <div className="dashboard-content">
          {/* Add student-specific content here */}
          <section className="dashboard-section">
            <h2>Thông tin học phần</h2>
            {/* Add content */}
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
