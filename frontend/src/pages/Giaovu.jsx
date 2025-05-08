import "../assets/Dashboard.css";
import SideBar from "../components/sideBar";

const AcademicDashboard = () => {
  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <h1>Academic Staff Dashboard</h1>
        <div className="dashboard-content">
          {/* Add academic staff-specific content here */}
          <section className="dashboard-section">
            <h2>Quản lý đăng ký học phần</h2>
            {/* Add content */}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AcademicDashboard;
