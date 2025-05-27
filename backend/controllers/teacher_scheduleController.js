const { mysqlConnection } = require("../config/db")

// Get teacher schedule
exports.getTeacherSchedule = (req, res) => {
  const { maGV } = req.params
  const { startDate, endDate } = req.query

  if (!maGV) {
    return res.status(400).json({ message: "Thiếu mã giảng viên" })
  }

  let query = `
    SELECT 
      tkb.maTKB,
      tkb.ngayHoc,
      tkb.tietBD,
      tkb.tietKT,
      tkb.phongHoc,
      tkb.loaiBuoi,
      mh.maMH,
      mh.tenMH,
      lhp.maLopHP,
      lhp.siSoHienTai
    FROM ThoiKhoaBieuGiangVien tkb
    JOIN LopHocPhan lhp ON tkb.maLopHP = lhp.maLopHP
    JOIN MonHoc mh ON lhp.maMH = mh.maMH
    WHERE tkb.maGV = ?
  `

  const params = [maGV]

  if (startDate && endDate) {
    query += " AND tkb.ngayHoc BETWEEN ? AND ?"
    params.push(startDate, endDate)
  }

  query += " ORDER BY tkb.ngayHoc, tkb.tietBD"

  mysqlConnection.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching teacher schedule:", err)
      return res.status(500).json({ message: "Lỗi khi lấy thời khóa biểu" })
    }

    res.json(results)
  })
}

// Get schedule by week
exports.getScheduleByWeek = (req, res) => {
  const { maGV } = req.params
  const { weekStart } = req.query

  if (!maGV || !weekStart) {
    return res.status(400).json({ message: "Thiếu mã giảng viên hoặc ngày bắt đầu tuần" })
  }

  // Calculate the end of the week (7 days from start)
  const startDate = new Date(weekStart)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)

  const formattedStartDate = startDate.toISOString().split("T")[0]
  const formattedEndDate = endDate.toISOString().split("T")[0]

  const query = `
    SELECT 
      tkb.maTKB,
      tkb.ngayHoc,
      tkb.tietBD,
      tkb.tietKT,
      tkb.phongHoc,
      tkb.loaiBuoi,
      mh.maMH,
      mh.tenMH,
      lhp.maLopHP,
      lhp.siSoHienTai
    FROM ThoiKhoaBieuGiangVien tkb
    JOIN LopHocPhan lhp ON tkb.maLopHP = lhp.maLopHP
    JOIN MonHoc mh ON lhp.maMH = mh.maMH
    WHERE tkb.maGV = ? AND tkb.ngayHoc BETWEEN ? AND ?
    ORDER BY tkb.ngayHoc, tkb.tietBD
  `

  mysqlConnection.query(query, [maGV, formattedStartDate, formattedEndDate], (err, results) => {
    if (err) {
      console.error("Error fetching weekly schedule:", err)
      return res.status(500).json({ message: "Lỗi khi lấy thời khóa biểu theo tuần" })
    }

    // Group by day of week
    const weeklySchedule = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    }

    results.forEach((item) => {
      const date = new Date(item.ngayHoc)
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.

      switch (dayOfWeek) {
        case 0:
          weeklySchedule.sunday.push(item)
          break
        case 1:
          weeklySchedule.monday.push(item)
          break
        case 2:
          weeklySchedule.tuesday.push(item)
          break
        case 3:
          weeklySchedule.wednesday.push(item)
          break
        case 4:
          weeklySchedule.thursday.push(item)
          break
        case 5:
          weeklySchedule.friday.push(item)
          break
        case 6:
          weeklySchedule.saturday.push(item)
          break
      }
    })

    res.json({
      weekStart: formattedStartDate,
      weekEnd: formattedEndDate,
      schedule: weeklySchedule,
    })
  })
}

// Get available weeks for the current semester
exports.getAvailableWeeks = (req, res) => {
  const { maGV } = req.params

  if (!maGV) {
    return res.status(400).json({ message: "Thiếu mã giảng viên" })
  }

  const query = `
    SELECT DISTINCT 
      YEARWEEK(ngayHoc) as weekNumber,
      MIN(ngayHoc) as weekStart,
      MAX(ngayHoc) as weekEnd
    FROM ThoiKhoaBieuGiangVien
    WHERE maGV = ?
    GROUP BY YEARWEEK(ngayHoc)
    ORDER BY weekNumber
  `

  mysqlConnection.query(query, [maGV], (err, results) => {
    if (err) {
      console.error("Error fetching available weeks:", err)
      return res.status(500).json({ message: "Lỗi khi lấy danh sách tuần" })
    }

    res.json(results)
  })
}
