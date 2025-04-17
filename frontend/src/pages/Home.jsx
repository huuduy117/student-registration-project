import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "../assets/Home.css";

const Home = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/students");
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi fetch sinh viên:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu sinh viên");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-message">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="header">
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <div className="home-container fade-in">
        <h2 className="page-title">Danh sách Sinh viên</h2>
        <div className="table-wrapper">
          {students.length > 0 ? (
            <table className="students-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ và Tên</th>
                  <th>Email</th>
                  <th>Tuổi</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.age}</td>
                    <td>{student.address}</td>
                    <td>
                      <span className="status-badge status-active">
                        Đang học
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-message">
              Không có sinh viên nào trong danh sách
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
