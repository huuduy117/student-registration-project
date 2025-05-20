import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/Dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardSV = () => {
  const [student, setStudent] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tabId = sessionStorage.getItem("tabId");
    const authData = JSON.parse(
      sessionStorage.getItem(`auth_${tabId}`) || "{}"
    );
    if (!authData.userId || authData.userRole !== "SinhVien") return;

    // Lấy thông tin sinh viên
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`/api/students/${authData.userId}`, {
          headers: { Authorization: `Bearer ${authData.token}` },
        });
        setStudent(res.data);
      } catch {
        setError("Không thể lấy thông tin sinh viên");
      }
    };

    // Lấy tổng quan tín chỉ và học kỳ
    const fetchOverview = async () => {
      try {
        const res = await axios.get(
          `/api/students/${authData.userId}/overview`,
          {
            headers: { Authorization: `Bearer ${authData.token}` },
          }
        );
        setOverview(res.data);
      } catch {
        setError("Không thể lấy thông tin tổng quan");
      }
    };

    fetchStudent();
    fetchOverview();
    setLoading(false);
  }, []);

  // Biểu đồ dữ liệu
  const pieData = [
    {
      name: "Đã hoàn thành",
      value: Number(overview?.soTinChiHoanThanh) || 0,
    },
    {
      name: "Chưa hoàn thành",
      value:
        (Number(overview?.soTinChiDangKy) || 0) -
        (Number(overview?.soTinChiHoanThanh) || 0),
    },
  ];
  const COLORS = ["#00C49F", "#FF8042"];

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-section">
      <h2>Thông tin tổng quan</h2>
      <div className="dashboard-grid">
        <div>
          <strong>Họ tên:</strong> {student?.hoTen || "-"}
        </div>
        <div>
          <strong>Mã sinh viên:</strong> {student?.maSV || "-"}
        </div>
        <div>
          <strong>Lớp:</strong> {student?.tenLop || "-"}
        </div>
        <div>
          <strong>Ngành học:</strong> {student?.tenCN || "-"}
        </div>
        <div>
          <strong>Tổng số tín chỉ đã đăng ký:</strong>{" "}
          {overview?.soTinChiDangKy || "0"}
        </div>
        <div>
          <strong>Tín chỉ đã hoàn thành:</strong>{" "}
          {overview?.soTinChiHoanThanh || "0"}
        </div>
        <div>
          <strong>Học kỳ hiện tại:</strong> {overview?.hocKyHienTai || "-"}
        </div>
        {/* Biểu đồ tròn thể hiện số tín chỉ đã hoàn thành */}
        <div style={{ gridColumn: "1 / span 3", marginTop: 24 }}>
          <h3>Biểu đồ tín chỉ đã hoàn thành</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardSV;
