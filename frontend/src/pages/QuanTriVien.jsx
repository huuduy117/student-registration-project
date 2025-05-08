import "../assets/Dashboard.css";
import SideBar from "../components/sideBar";

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-content">
          {/* Add admin-specific content here */}
          <section className="dashboard-section">
            <h2>Quản lý hệ thống</h2>
            {/* Add content */}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
