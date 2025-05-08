import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSession } from "./hook/useSession";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import StudentDashboard from "./pages/SinhVien";
import TeacherDashboard from "./pages/GiangVien";
import AcademicDashboard from "./pages/Giaovu";
import DepartmentHeadDashboard from "./pages/TruongBoMon";
import AdminDashboard from "./pages/QuanTriVien";
import FacultyHeadDashboard from "./pages/TruongKhoa";
import UnauthorizedPage from "./pages/404";

const PrivateRoute = ({ children, allowedRoles }) => {
  const tabId = useSession();

  // Lấy thông tin xác thực của tab hiện tại
  const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}");

  if (!authData.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authData.userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protect home and chat routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute allowedRoles={null}>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute allowedRoles={null}>
              <ChatPage />
            </PrivateRoute>
          }
        />

        {/* Existing protected routes */}
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute allowedRoles={["SinhVien"]}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher-dashboard"
          element={
            <PrivateRoute allowedRoles={["GiangVien"]}>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/academic-dashboard"
          element={
            <PrivateRoute allowedRoles={["GiaoVu"]}>
              <AcademicDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/department-head-dashboard"
          element={
            <PrivateRoute allowedRoles={["TruongBoMon"]}>
              <DepartmentHeadDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute allowedRoles={["QuanTriVien"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/faculty-head-dashboard"
          element={
            <PrivateRoute allowedRoles={["TruongKhoa"]}>
              <FacultyHeadDashboard />
            </PrivateRoute>
          }
        />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
