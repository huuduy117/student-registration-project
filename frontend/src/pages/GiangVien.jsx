"use client"

import { useState, useEffect } from "react"
import { FaUsers, FaBook, FaCalendarAlt, FaClipboardList, FaChalkboardTeacher } from "react-icons/fa"
import SideBar from "../components/sideBar"
import "../assets/TeacherDashboard.css"
import { useSessionMonitor } from "../hook/useSession"

const TeacherDashboard = () => {
  const [username, setUsername] = useState("Giảng viên")
  const [classRequests, setClassRequests] = useState([])
  // Removed the unused navigate import and variable

  // Use the session monitor
  useSessionMonitor()

  useEffect(() => {
    // Get username from localStorage
    const tabId = sessionStorage.getItem("tabId")
    const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")

    if (authData.username) {
      setUsername(authData.username)
    } else if (authData.fullName) {
      setUsername(authData.fullName)
    }

    // Mock data for class requests
    const mockRequests = [
      {
        id: "YC001",
        courseName: "Lập trình Web",
        studentName: "Nguyễn Văn An",
        studentId: "20110001",
        date: "01/05/2023",
        status: "DaDuyet",
        class: "20DTHD1",
      },
      {
        id: "YC002",
        courseName: "Cơ sở dữ liệu",
        studentName: "Trần Thị Bình",
        studentId: "20110002",
        date: "02/05/2023",
        status: "DaDuyet",
        class: "20DTHD2",
      },
      {
        id: "YC003",
        courseName: "Trí tuệ nhân tạo",
        studentName: "Lê Văn Cường",
        studentId: "20110003",
        date: "03/05/2023",
        status: "DaGui",
        class: "20DTHD3",
      },
      {
        id: "YC004",
        courseName: "Phát triển ứng dụng di động",
        studentName: "Phạm Thị Dung",
        studentId: "20110004",
        date: "04/05/2023",
        status: "TuChoi",
        class: "21DTHD1",
      },
      {
        id: "YC005",
        courseName: "An toàn thông tin",
        studentName: "Hoàng Văn Em",
        studentId: "20110005",
        date: "05/05/2023",
        status: "Huy",
        class: "21DTHD2",
      },
    ]

    setClassRequests(mockRequests)
  }, [])

  const getStatusLabel = (status) => {
    switch (status) {
      case "DaGui":
        return { label: "Đã gửi", className: "pending" }
      case "DaDuyet":
        return { label: "Đã duyệt", className: "approved" }
      case "TuChoi":
        return { label: "Từ chối", className: "rejected" }
      case "Huy":
        return { label: "Đã hủy", className: "cancelled" }
      default:
        return { label: "Không xác định", className: "" }
    }
  }

  const handleApprove = (id) => {
    setClassRequests(classRequests.map((request) => (request.id === id ? { ...request, status: "DaDuyet" } : request)))
  }

  const handleReject = (id) => {
    setClassRequests(classRequests.map((request) => (request.id === id ? { ...request, status: "TuChoi" } : request)))
  }

  return (
    <div className="teacher-dashboard">
      <SideBar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Bảng điều khiển Giảng viên</h1>
          <div className="user-info">
            <img src="https://placehold.co/40x40/png" alt="Avatar" className="user-avatar" />
            <span className="user-name">{username}</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>
              <FaUsers /> Lớp học
            </h2>
            <div className="card-content">Quản lý các lớp học của bạn</div>
            <div className="card-footer">
              <div className="card-stat">5</div>
              <button className="card-action">Xem chi tiết</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>
              <FaBook /> Môn học
            </h2>
            <div className="card-content">Quản lý các môn học của bạn</div>
            <div className="card-footer">
              <div className="card-stat">8</div>
              <button className="card-action">Xem chi tiết</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>
              <FaCalendarAlt /> Lịch dạy
            </h2>
            <div className="card-content">Xem lịch dạy của bạn</div>
            <div className="card-footer">
              <div className="card-stat">12</div>
              <button className="card-action">Xem chi tiết</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>
              <FaClipboardList /> Yêu cầu mở lớp
            </h2>
            <div className="card-content">Quản lý yêu cầu mở lớp từ sinh viên</div>
            <div className="card-footer">
              <div className="card-stat">{classRequests.length}</div>
              <button className="card-action">Xem chi tiết</button>
            </div>
          </div>
        </div>

        <div className="class-requests-section">
          <h2>
            <FaChalkboardTeacher /> Yêu cầu mở lớp gần đây
          </h2>
          <table className="requests-table">
            <thead>
              <tr>
                <th>Mã yêu cầu</th>
                <th>Môn học</th>
                <th>Sinh viên</th>
                <th>Mã SV</th>
                <th>Lớp</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {classRequests.map((request) => {
                const status = getStatusLabel(request.status)
                return (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.courseName}</td>
                    <td>{request.studentName}</td>
                    <td>{request.studentId}</td>
                    <td>{request.class}</td>
                    <td>{request.date}</td>
                    <td>
                      <span className={`status-badge ${status.className}`}>{status.label}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {request.status === "DaGui" && (
                          <>
                            <button className="action-button approve-button" onClick={() => handleApprove(request.id)}>
                              Duyệt
                            </button>
                            <button className="action-button reject-button" onClick={() => handleReject(request.id)}>
                              Từ chối
                            </button>
                          </>
                        )}
                        <button className="action-button view-button">Xem</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
