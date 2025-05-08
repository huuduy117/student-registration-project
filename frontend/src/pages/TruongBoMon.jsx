import "../assets/Dashboard.css";
import SideBar from "../components/sideBar";

const DepartmentHeadDashboard = () => {
  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <h1>Department Head Dashboard</h1>
        <div className="dashboard-content">
          {/* Add department head-specific content here */}
          <section className="dashboard-section">
            <h2>Quản lý bộ môn</h2>
            {/* Add content */}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DepartmentHeadDashboard;
