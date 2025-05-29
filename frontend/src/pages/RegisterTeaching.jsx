"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Book,
  Users,
  Search,
  Filter,
  X,
} from "lucide-react";
import SideBar from "../components/sideBar";
import "../assets/RegisterTeaching.css";

const RegisterTeaching = () => {
  const [approvedClasses, setApprovedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [filter, setFilter] = useState({
    subject: "",
    semester: "",
    year: "",
  });
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [showTeacherScheduleOnly, setShowTeacherScheduleOnly] = useState(false);

  useEffect(() => {
    const tabId = sessionStorage.getItem("tabId");
    const authData = JSON.parse(
      sessionStorage.getItem(`auth_${tabId}`) || "{}"
    );
    if (authData.userId) {
      setTeacherId(authData.userId);
      fetchApprovedClasses(authData.token);
    }
  }, []);

  const fetchApprovedClasses = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/teaching/class-sections/approved`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setApprovedClasses(response.data || []);
    } catch (err) {
      setError("Không thể tải danh sách lớp học phần. Vui lòng thử lại sau.");
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (classId) => {
    if (!teacherId) return;

    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );
      await axios.post(
        "/api/teaching/register-teaching",
        {
          maGV: teacherId,
          maLopHP: classId,
          ngayDangKy: new Date().toISOString().split("T")[0],
        },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      setSuccess("Đăng ký giảng dạy thành công!");
      fetchApprovedClasses(authData.token);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đăng ký không thành công. Vui lòng thử lại."
      );
      console.error("Error registering:", err);
    }
  };

  const handleRegisterClick = async (classItem) => {
    setSelectedClass(classItem);
    setLoadingTimeSlots(true);
    setShowTimeSlotModal(true);

    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      const response = await axios.get(
        `/api/teaching/class-sections/${classItem.maLopHP}/time-slots`,
        {
          params: { maGV: teacherId },
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      setAvailableTimeSlots(response.data.availableSlots);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể lấy danh sách khung giờ trống. Vui lòng thử lại."
      );
      setShowTimeSlotModal(false);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedTimeSlot) {
      setError("Vui lòng chọn một khung giờ");
      return;
    }

    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );

      await axios.post(
        "/api/teaching/register-teaching",
        {
          maGV: teacherId,
          maLopHP: selectedClass.maLopHP,
          ngayDangKy: new Date().toISOString().split("T")[0],
          thu: selectedTimeSlot.thu,
          tietHoc: selectedTimeSlot.tietHoc,
        },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      setSuccess("Đăng ký giảng dạy thành công!");
      setShowTimeSlotModal(false);
      setSelectedTimeSlot(null);
      fetchApprovedClasses(authData.token);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đăng ký không thành công. Vui lòng thử lại."
      );
    }
  };

  const filteredClasses = approvedClasses.filter((classItem) => {
    const matchesSubject =
      !filter.subject ||
      classItem.tenMH.toLowerCase().includes(filter.subject.toLowerCase());
    const matchesSemester =
      !filter.semester || classItem.hocKy === filter.semester;
    const matchesYear = !filter.year || classItem.namHoc === filter.year;
    return matchesSubject && matchesSemester && matchesYear;
  });

  const uniqueYears = [...new Set(approvedClasses.map((c) => c.namHoc))];

  const filteredTimeSlots = showTeacherScheduleOnly
    ? availableTimeSlots.filter(slot => 
        !availableTimeSlots.occupiedSlots?.teacherSlots?.some(
          teacherSlot => 
            teacherSlot.thu === slot.thu && 
            teacherSlot.tietHoc === slot.tietHoc
        )
      )
    : availableTimeSlots;

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Đăng ký giảng dạy</h1>
            <p>
              Đăng ký phân công giảng dạy cho các lớp học phần đã được duyệt
            </p>
          </div>          {error && (
            <div className="alert error-alert">
              <span className="alert-icon">⚠️</span>
              {error}
              <button className="close-alert" onClick={() => setError(null)}>
                ×
              </button>
            </div>
          )}

          {success && (
            <div className="alert success-alert">
              <span className="alert-icon">✓</span>
              {success}
              <button className="close-alert" onClick={() => setSuccess(null)}>
                ×
              </button>
            </div>
          )}

          <div className="filters-section">
            <div className="filter-group">
              <div className="filter-input-wrapper">
                <Search size={16} className="filter-icon" />
                <input
                  type="text"
                  placeholder="Tìm theo tên môn học..."
                  value={filter.subject}
                  onChange={(e) =>
                    setFilter({ ...filter, subject: e.target.value })
                  }
                  className="filter-input"
                />
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-input-wrapper">
                <Filter size={16} className="filter-icon" />
                <select
                  value={filter.semester}
                  onChange={(e) =>
                    setFilter({ ...filter, semester: e.target.value })
                  }
                  className="filter-select"
                >
                  <option value="">Tất cả học kỳ</option>
                  <option value="HK1">Học kỳ 1</option>
                  <option value="HK2">Học kỳ 2</option>
                  <option value="HK3">Học kỳ 3</option>
                </select>
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-input-wrapper">
                <Calendar size={16} className="filter-icon" />
                <select
                  value={filter.year}
                  onChange={(e) =>
                    setFilter({ ...filter, year: e.target.value })
                  }
                  className="filter-select"
                >
                  <option value="">Tất cả năm học</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">Đang tải dữ liệu...</div>
          ) : filteredClasses.length === 0 ? (
            <div className="no-data-message">
              Không có lớp học phần nào phù hợp với điều kiện tìm kiếm
            </div>
          ) : (
            <div className="classes-grid">
              {filteredClasses.map((classItem) => (
                <div key={classItem.maLopHP} className="class-card">
                  <div className="class-header">
                    <h3>{classItem.tenMH}</h3>
                    <span className="class-code">{classItem.maLopHP}</span>
                  </div>

                  <div className="class-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>
                        {classItem.hocKy} - {classItem.namHoc}
                      </span>
                    </div>
                    <div className="detail-item">
                      <Book size={16} />
                      <span>Mã MH: {classItem.maMH}</span>
                    </div>
                    <div className="detail-item">
                      <Users size={16} />
                      <span>
                        Sĩ số: {classItem.soLuongThamGia}/{classItem.siSoToiDa}
                      </span>
                    </div>
                    <div className="detail-item description">
                      <span className="description-label">Mô tả:</span>
                      <span className="description-text">
                        {classItem.description || "Không có mô tả"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="requester">
                        Người yêu cầu: {classItem.tenSinhVien} ({classItem.maSV}
                        )
                      </span>
                    </div>
                  </div>

                  <button
                    className="register-button"
                    onClick={() => handleRegisterClick(classItem)}
                  >
                    Đăng ký giảng dạy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showTimeSlotModal && (
          <div className="modal-overlay">
            <div className="time-slot-modal">
              <div className="modal-header">
                <h2>Chọn khung giờ giảng dạy</h2>
                <button
                  className="close-modal"
                  onClick={() => {
                    setShowTimeSlotModal(false);
                    setSelectedTimeSlot(null);
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="modal-content">
                <div className="time-slot-filters">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showTeacherScheduleOnly}
                      onChange={(e) => setShowTeacherScheduleOnly(e.target.checked)}
                    />
                    Chỉ hiển thị khung giờ không trùng với lịch giảng dạy của tôi
                  </label>
                </div>

                {loadingTimeSlots ? (
                  <div className="loading-spinner">Đang tải khung giờ...</div>
                ) : (
                  <div className="time-slots-container">
                    {filteredTimeSlots.map((dayGroup) => (
                      <div key={dayGroup.thu} className="day-group">
                        <h3 className="day-header">{dayGroup.thu}</h3>
                        <div className="time-slots-grid">
                          {dayGroup.slots.map((period) => {
                            const slot = { thu: dayGroup.thu, tietHoc: period };
                            const isSelected = 
                              selectedTimeSlot?.thu === slot.thu && 
                              selectedTimeSlot?.tietHoc === slot.tietHoc;
                            
                            return (
                              <div
                                key={`${slot.thu}-${slot.tietHoc}`}
                                className={`time-slot-card ${isSelected ? "selected" : ""}`}
                                onClick={() => handleTimeSlotSelect(slot)}
                              >
                                <div className="time-slot-period">Tiết {slot.tietHoc}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowTimeSlotModal(false);
                    setSelectedTimeSlot(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  className="confirm-button"
                  onClick={handleConfirmRegistration}
                  disabled={!selectedTimeSlot}
                >
                  Xác nhận đăng ký
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RegisterTeaching;
