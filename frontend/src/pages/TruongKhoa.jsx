import SideBar from "../components/sideBar";
import "../assets/Dashboard.css";

const FacultyHeadDashboard = () => {
  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <h1>Faculty Head Dashboard</h1>
        <div className="dashboard-content">
          {/* Add faculty head-specific content here */}
          <section className="dashboard-section">
            <h2>Quản lý khoa</h2>
            {/* Add content */}
          </section>
        </div>
      </main>
    </div>
  );
};

export default FacultyHeadDashboard;
