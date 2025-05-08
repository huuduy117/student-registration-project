import "../assets/Dashboard.css";
import SideBar from "../components/sideBar";

const TeacherDashboard = () => {
  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <h1>Teacher Dashboard</h1>
        <div className="dashboard-content">
          {/* Add teacher-specific content here */}
          <section className="dashboard-section">
            <h2>Lớp học phần phụ trách</h2>
            {/* Add content */}
          </section>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
