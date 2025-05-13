"use client"

import { useState, useEffect } from "react"
import SideBar from "../components/sideBar"
import axios from "axios"
import "../assets/Schedule.css"
import { useSessionMonitor } from "../hook/useSession"

const Schedule = () => {
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

  // Use the session monitor
  useSessionMonitor()

  // Helper function to format dates without date-fns
  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Helper function to get day name
  const getDayName = (date) => {
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
    return days[date.getDay()]
  }

  // Get start of week (Monday)
  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
    return new Date(d.setDate(diff))
  }

  // Generate week dates
  const generateWeekDates = (startDate) => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return date
    })
  }

  useEffect(() => {
    // Get user info from session storage
    const tabId = sessionStorage.getItem("tabId")
    const authData = JSON.parse(sessionStorage.getItem(`auth_${tabId}`) || "{}")
    if (authData.userId) {
      setUserId(authData.userId)
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    const fetchSchedule = async () => {
      setLoading(true)
      setError(null)

      try {
        const weekStart = getStartOfWeek(currentWeek).toISOString().split("T")[0]
        const response = await axios.get(`/api/schedule/${userId}/week`, {
          params: { weekStart },
          headers: {
            Authorization: `Bearer ${JSON.parse(sessionStorage.getItem(`auth_${sessionStorage.getItem("tabId")}`)).token}`,
          },
        })
        setSchedule(response.data.schedule)
      } catch (err) {
        console.error("Error fetching schedule:", err)
        setError("Không thể lấy thời khóa biểu")
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
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

  // Helper function to get time slot label
  const getTimeSlotLabel = (tietBD, tietKT) => {
    const tietToTime = {
      Tiet1: "07:00",
      Tiet2: "07:50",
      Tiet3: "08:40",
      Tiet4: "09:30",
      Tiet5: "10:20",
      Tiet6: "11:10",
      Tiet7: "12:00",
      Tiet8: "12:50",
      Tiet9: "13:40",
      Tiet10: "14:30",
      Tiet11: "15:20",
      Tiet12: "16:10",
      Tiet13: "17:00",
      Tiet14: "17:50",
      Tiet15: "18:40",
    }

    const startTime = tietToTime[tietBD] || tietBD
    const endTime = tietToTime[`Tiet${Number.parseInt(tietKT.replace("Tiet", ""))}`] || tietKT

    return `${startTime} - ${endTime}`
  }

  // Generate the week dates
  const weekStart = getStartOfWeek(currentWeek)
  const weekDates = generateWeekDates(weekStart)

  // Group schedule items by time period (morning, afternoon, evening)
  const groupByTimePeriod = (items) => {
    return items.reduce(
      (acc, item) => {
        const tietBD = Number.parseInt(item.tietBD.replace("Tiet", ""))
        if (tietBD >= 1 && tietBD <= 5) {
          acc.morning.push(item)
        } else if (tietBD >= 6 && tietBD <= 12) {
          acc.afternoon.push(item)
        } else {
          acc.evening.push(item)
        }
        return acc
      },
      { morning: [], afternoon: [], evening: [] },
    )
  }

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const groupedSchedule = days.map((day) => groupByTimePeriod(schedule[day] || []))

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <div className="schedule-container">
          <div className="schedule-header">
            <h1>Thời Khóa Biểu</h1>
            <div className="schedule-controls">
              <button onClick={handlePreviousWeek} className="control-button">
                ◀ Tuần trước
              </button>
              <button onClick={handleCurrentWeek} className="control-button current">
                Tuần hiện tại
              </button>
              <button onClick={handleNextWeek} className="control-button">
                Tuần sau ▶
              </button>
            </div>
            <div className="week-display">
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
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
                            <div className="class-code">{item.maLopHP}</div>
                            <div className="class-time">{getTimeSlotLabel(item.tietBD, item.tietKT)}</div>
                            <div className="class-location">{item.phongHoc}</div>
                            <div className="class-teacher">{item.tenGiangVien}</div>
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
                            <div className="class-code">{item.maLopHP}</div>
                            <div className="class-time">{getTimeSlotLabel(item.tietBD, item.tietKT)}</div>
                            <div className="class-location">{item.phongHoc}</div>
                            <div className="class-teacher">{item.tenGiangVien}</div>
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
                            <div className="class-code">{item.maLopHP}</div>
                            <div className="class-time">{getTimeSlotLabel(item.tietBD, item.tietKT)}</div>
                            <div className="class-location">{item.phongHoc}</div>
                            <div className="class-teacher">{item.tenGiangVien}</div>
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

export default Schedule
