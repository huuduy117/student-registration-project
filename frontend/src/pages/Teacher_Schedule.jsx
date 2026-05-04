"use client"

import { useState, useEffect } from "react"
import SideBar from "../components/sideBar"
import api from "../api/client"
import "../assets/Schedule.css"
import { useSessionMonitor } from "../hook/useSession"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { saveAs } from "file-saver"

const TeacherSchedule = () => {
  const [schedule, setSchedule] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [userId, setUserId] = useState(null)
  const [viewMode, setViewMode] = useState("all")
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

  useSessionMonitor()

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getDayName = (date) => {
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
    return days[date.getDay()]
  }

  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const generateWeekDates = (startDate) => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return date
    })
  }

  useEffect(() => {
    const tabId = sessionStorage.getItem("tabId")
    const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")
    if (authData.userId) {
      setUserId(authData.userId)
    }
  }, [])

  useEffect(() => {
    if (!userId) return undefined

    const ac = new AbortController()
    let alive = true

    const fetchSchedule = async () => {
      setLoading(true)
      setError(null)

      try {
        const weekStart = getStartOfWeek(currentWeek).toISOString().split("T")[0]
        const tabId = sessionStorage.getItem("tabId")
        const auth = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")
        const response = await api.get(`/api/teacher-schedule/${userId}/week`, {
          params: { weekStart },
          headers: { Authorization: `Bearer ${auth.token || ""}` },
          signal: ac.signal,
        })
        if (!alive) return
        setSchedule(response.data.schedule)
      } catch (err) {
        if (err?.code === "ERR_CANCELED") return
        console.error("Error fetching schedule:", err?.response?.data || err)
        if (alive) {
          setError(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              "Không thể lấy thời khóa biểu",
          )
        }
      } finally {
        if (alive) setLoading(false)
      }
    }

    fetchSchedule()
    return () => {
      alive = false
      ac.abort()
    }
  }, [userId, currentWeek])

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const handleCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  const getTietDisplay = (tietBD, tietKT) => {
    const startNum = tietBD.includes("Tiet") ? tietBD.replace("Tiet", "") : tietBD
    const endNum = tietKT.includes("Tiet") ? tietKT.replace("Tiet", "") : tietKT
    return `Tiết: ${startNum} - ${endNum}`
  }

  const groupByTimePeriod = (items) => {
    return items.reduce(
      (acc, item) => {
        const timeStr = item.tietBD
        let tietNum

        if (timeStr.includes(":")) {
          const hour = Number.parseInt(timeStr.split(":")[0])
          if (hour < 12) tietNum = 1
          else if (hour < 17) tietNum = 7
          else tietNum = 13
        } else {
          tietNum = Number.parseInt(timeStr.replace("Tiet", "")) || Number.parseInt(timeStr)
        }

        if (tietNum >= 1 && tietNum <= 6) {
          acc.morning.push(item)
        } else if (tietNum >= 7 && tietNum <= 12) {
          acc.afternoon.push(item)
        } else {
          acc.evening.push(item)
        }
        return acc
      },
      { morning: [], afternoon: [], evening: [] },
    )
  }

  const weekStart = getStartOfWeek(currentWeek)
  const weekDates = generateWeekDates(weekStart)

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const groupedSchedule = days.map((day) => groupByTimePeriod(schedule[day] || []))

  const handleExportClick = () => setExportMenuOpen((open) => !open)

  const handleExportFormat = (format) => {
    setExportMenuOpen(false)
    if (format === "excel") exportToExcel()
    if (format === "pdf") exportToPDF()
  }

  // Hàm xuất Excel
  const exportToExcel = () => {
    const weekStart = getStartOfWeek(currentWeek)
    const weekDates = generateWeekDates(weekStart)
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const data = []
    days.forEach((day, i) => {
      (schedule[day] || []).forEach((item) => {
        data.push({
          Ngay: formatDate(weekDates[i]),
          Thu: getDayName(weekDates[i]),
          MonHoc: item.tenMH,
          MaLop: item.maLopHP,
          MaMH: item.maMH,
          Tiet: getTietDisplay(item.tietBD, item.tietKT),
          Phong: item.phongHoc,
          SiSo: item.siSoHienTai,
        })
      })
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Schedule")
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `lich_giang_day_tuan_${formatDate(weekStart)}.xlsx`)
  }

  // Hàm xuất PDF
  const exportToPDF = () => {
    const weekStart = getStartOfWeek(currentWeek)
    const weekDates = generateWeekDates(weekStart)
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const data = []
    days.forEach((day, i) => {
      (schedule[day] || []).forEach((item) => {
        data.push([
          formatDate(weekDates[i]),
          getDayName(weekDates[i]),
          item.tenMH,
          item.maLopHP,
          item.maMH,
          getTietDisplay(item.tietBD, item.tietKT),
          item.phongHoc,
          item.siSoHienTai,
        ])
      })
    })
    const doc = new jsPDF()
    doc.text(`Lịch giảng dạy tuần bắt đầu từ ${formatDate(weekStart)}`, 10, 10)
    doc.autoTable({
      head: [["Ngày", "Thứ", "Môn học", "Mã lớp", "Mã MH", "Tiết", "Phòng", "Sĩ số"]],
      body: data,
      startY: 20,
      styles: { font: "Times" },
    })
    doc.save(`lich_giang_day_tuan_${formatDate(weekStart)}.pdf`)
  }

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <div className="schedule-container">
          <div className="schedule-header">
            <h1>Lịch giảng dạy theo tuần</h1>

            <div className="schedule-controls">
              <div className="view-mode-buttons">
                <button
                  className={`mode-button ${viewMode === "all" ? "active" : ""}`}
                  onClick={() => setViewMode("all")}
                >
                  Tất cả
                </button>
                <button
                  className={`mode-button ${viewMode === "classes" ? "active" : ""}`}
                  onClick={() => setViewMode("classes")}
                >
                  Lịch dạy
                </button>
              </div>

              <div className="date-controls">
                <input
                  type="date"
                  value={currentWeek.toISOString().split("T")[0]}
                  onChange={(e) => setCurrentWeek(new Date(e.target.value))}
                  className="date-input"
                />
                <button onClick={handleCurrentWeek} className="control-button">
                  📅 Hiện tại
                </button>
                <button className="control-button" onClick={handleExportClick}>🖨️ In lịch</button>
                  {exportMenuOpen && (
                    <div style={{ position: "absolute", zIndex: 10, background: "white", border: "1px solid #ccc", minWidth: 120 }}>
                      <button style={{ width: "100%", padding: 8, border: "none", background: "white", cursor: "pointer" }} onClick={() => handleExportFormat("excel")}>Xuất Excel</button>
                      <button style={{ width: "100%", padding: 8, border: "none", background: "white", cursor: "pointer" }} onClick={() => handleExportFormat("pdf")}>Xuất PDF</button>
                    </div>
                  )}
                <button onClick={handlePreviousWeek} className="control-button">
                  ◀ Trở về
                </button>
                <button onClick={handleNextWeek} className="control-button">
                  Tiếp ▶
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-message">Đang tải thời khóa biểu...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="schedule-table-container">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th className="time-column">Ca học</th>
                    {weekDates.map((date, index) => (
                      <th key={index} className="day-column">
                        <div className="day-name">{getDayName(date)}</div>
                        <div className="day-date">{formatDate(date)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Morning */}
                  <tr>
                    <td className="time-period">Sáng</td>
                    {groupedSchedule.map((dayGroup, dayIndex) => (
                      <td key={dayIndex} className="schedule-cell">
                        {dayGroup.morning.map((item, itemIndex) => (
                          <div key={itemIndex} className="class-item">
                            <div className="class-name">{item.tenMH}</div>
                            <div className="class-code">
                              {item.maLopHP} - {item.maMH}
                            </div>
                            <div className="class-time">{getTietDisplay(item.tietBD, item.tietKT)}</div>
                            <div className="class-location">Phòng: {item.phongHoc}</div>
                            <div className="class-teacher">Sĩ số: {item.siSoHienTai}</div>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                  {/* Afternoon */}
                  <tr>
                    <td className="time-period">Chiều</td>
                    {groupedSchedule.map((dayGroup, dayIndex) => (
                      <td key={dayIndex} className="schedule-cell">
                        {dayGroup.afternoon.map((item, itemIndex) => (
                          <div key={itemIndex} className="class-item">
                            <div className="class-name">{item.tenMH}</div>
                            <div className="class-code">
                              {item.maLopHP} - {item.maMH}
                            </div>
                            <div className="class-time">{getTietDisplay(item.tietBD, item.tietKT)}</div>
                            <div className="class-location">Phòng: {item.phongHoc}</div>
                            <div className="class-teacher">Sĩ số: {item.siSoHienTai}</div>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                  {/* Evening */}
                  <tr>
                    <td className="time-period">Tối</td>
                    {groupedSchedule.map((dayGroup, dayIndex) => (
                      <td key={dayIndex} className="schedule-cell">
                        {dayGroup.evening.map((item, itemIndex) => (
                          <div key={itemIndex} className="class-item">
                            <div className="class-name">{item.tenMH}</div>
                            <div className="class-code">
                              {item.maLopHP} - {item.maMH}
                            </div>
                            <div className="class-time">{getTietDisplay(item.tietBD, item.tietKT)}</div>
                            <div className="class-location">Phòng: {item.phongHoc}</div>
                            <div className="class-teacher">Sĩ số: {item.siSoHienTai}</div>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default TeacherSchedule
