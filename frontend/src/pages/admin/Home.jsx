"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../services/axios";
import SideBar from "../../components/sideBar";
import "../../assets/UserManagement.css";

const AdminHome = () => {
  const [tab, setTab] = useState(0);
  const [studentStats, setStudentStats] = useState({});
  const [teacherStats, setTeacherStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentRes, teacherRes] = await Promise.all([
        axiosInstance.get("/api/admin/stats/students"),
        axiosInstance.get("/api/admin/stats/teachers"),
      ]);
      setStudentStats(studentRes.data || {});
      setTeacherStats(teacherRes.data || {});
    } catch {
      setError("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  // Pure CSS card
  const StatCard = ({ title, value, children }) => (
    <div className="um-card">
      <div className="um-card-title">{title}</div>
      {value !== undefined && <div className="um-card-value">{value}</div>}
      {children}
    </div>
  );

  return (
    <div className="um-container">
      <SideBar />
      <main>
        <div className="um-title">Trang tổng quan quản trị viên</div>
        {error && <div className="um-alert um-alert-error">{error}</div>}
        <div className="um-tabs">
          <button
            className={tab === 0 ? "um-tab active" : "um-tab"}
            onClick={() => setTab(0)}
          >
            Thống kê sinh viên
          </button>
          <button
            className={tab === 1 ? "um-tab active" : "um-tab"}
            onClick={() => setTab(1)}
          >
            Thống kê giảng viên
          </button>
        </div>
        {loading ? (
          <div className="um-loading-spinner" style={{ margin: "40px auto" }} />
        ) : (
          <div>
            {tab === 0 ? (
              <div className="um-grid">
                <StatCard
                  title="Tổng số sinh viên"
                  value={studentStats.total || 0}
                />
                <StatCard title="Phân bố theo lớp">
                  {studentStats.byClass && studentStats.byClass.length > 0 ? (
                    <ul className="um-list">
                      {studentStats.byClass.map((item, idx) => (
                        <li key={idx}>
                          {item.class}: <b>{item.count}</b>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="um-label um-muted">Không có dữ liệu</div>
                  )}
                </StatCard>
                <StatCard title="Tình trạng đăng ký môn học">
                  {studentStats.registrationStatus &&
                  studentStats.registrationStatus.length > 0 ? (
                    <ul className="um-list">
                      {studentStats.registrationStatus.map((item, idx) => (
                        <li key={idx}>
                          {item.status}: <b>{item.count}</b>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="um-label um-muted">Không có dữ liệu</div>
                  )}
                </StatCard>
                <StatCard title="Yêu cầu mở lớp gần đây">
                  {studentStats.classRequests &&
                  studentStats.classRequests.length > 0 ? (
                    <ul className="um-list">
                      {studentStats.classRequests.map((req) => (
                        <li key={req.id}>
                          <b>{req.courseName}</b>{" "}
                          <span className="um-chip">{req.status}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="um-label um-muted">
                      Không có yêu cầu nào
                    </div>
                  )}
                </StatCard>
              </div>
            ) : (
              <div className="um-grid">
                <StatCard
                  title="Tổng số giảng viên"
                  value={teacherStats.total || 0}
                />
                <StatCard title="Số lớp học phần theo học kỳ">
                  {teacherStats.classCountBySemester &&
                  teacherStats.classCountBySemester.length > 0 ? (
                    <ul className="um-list">
                      {teacherStats.classCountBySemester.map((item, idx) => (
                        <li key={idx}>
                          {item.semester}: <b>{item.count}</b>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="um-label um-muted">Không có dữ liệu</div>
                  )}
                </StatCard>
                <StatCard title="Lịch giảng dạy">
                  {teacherStats.schedule && teacherStats.schedule.length > 0 ? (
                    <ul className="um-list">
                      {teacherStats.schedule.map((item, idx) => (
                        <li key={idx}>
                          <b>{item.teacher}</b>{" "}
                          <span className="um-muted">{item.time}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="um-label um-muted">
                      Không có lịch giảng dạy
                    </div>
                  )}
                </StatCard>
                <StatCard title="Lịch sử phê duyệt gần đây">
                  {teacherStats.approveHistory &&
                  teacherStats.approveHistory.length > 0 ? (
                    <ul className="um-list">
                      {teacherStats.approveHistory.map((h, idx) => (
                        <li key={idx}>
                          {h.action} <span className="um-muted">{h.time}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="um-label um-muted">
                      Không có lịch sử phê duyệt
                    </div>
                  )}
                </StatCard>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminHome;
