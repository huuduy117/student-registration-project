const { mysqlConnection } = require("../config/db")

// Get all class requests
exports.getAllClassRequests = (req, res) => {
  const query = `
    SELECT 
      ycml.maYeuCau, 
      ycml.ngayGui, 
      ycml.tinhTrang, 
      ycml.maSV,
      sv.hoTen AS tenSinhVien,
      mh.maMH,
      mh.tenMH,
      lhp.maLopHP,
      lhp.namHoc,
      lhp.hocKy,
      lhp.siSoToiDa,
      lhp.siSoHienTai,
      (SELECT COUNT(*) FROM SinhVien_MonHoc WHERE maLopHP = lhp.maLopHP) AS soLuongDangKy
    FROM YeuCauMoLop ycml
    JOIN SinhVien sv ON ycml.maSV = sv.maSV
    LEFT JOIN LopHocPhan lhp ON ycml.maLopHP = lhp.maLopHP
    LEFT JOIN MonHoc mh ON lhp.maMH = mh.maMH
    ORDER BY ycml.ngayGui DESC
  `

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching class requests:", err)
      return res.status(500).json({ message: "Lỗi khi lấy danh sách yêu cầu mở lớp" })
    }
    res.json(results)
  })
}

// Create a new class request
exports.createClassRequest = (req, res) => {
  const { maSV, maLopHP, participants } = req.body

  if (!maSV || !maLopHP) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" })
  }

  // Check if the user is a student
  mysqlConnection.query("SELECT loaiNguoiDung FROM NguoiDung WHERE maNguoiDung = ?", [maSV], (err, results) => {
    if (err) {
      console.error("Error checking user type:", err)
      return res.status(500).json({ message: "Lỗi khi kiểm tra thông tin người dùng" })
    }

    if (results.length === 0 || results[0].loaiNguoiDung !== "SinhVien") {
      return res.status(403).json({ message: "Chỉ sinh viên mới có thể tạo yêu cầu mở lớp" })
    }

    // Generate a new request ID
    const maYeuCau = `YC${Date.now().toString().slice(-6)}`
    const ngayGui = new Date().toISOString().split("T")[0]

    // Begin transaction
    mysqlConnection.beginTransaction((err) => {
      if (err) {
        console.error("Error starting transaction:", err)
        return res.status(500).json({ message: "Lỗi khi bắt đầu giao dịch" })
      }

      // Insert the request
      mysqlConnection.query(
        "INSERT INTO YeuCauMoLop (maYeuCau, ngayGui, tinhTrang, maSV, maLopHP) VALUES (?, ?, 'DaGui', ?, ?)",
        [maYeuCau, ngayGui, maSV, maLopHP],
        (err, result) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              console.error("Error creating class request:", err)
              res.status(500).json({ message: "Lỗi khi tạo yêu cầu mở lớp" })
            })
          }

          // If participants are provided, register them for the course
          if (participants && participants.length > 0) {
            const values = participants.map((p) => [p.maSV, maLopHP, ngayGui])
            const participantQuery = "INSERT INTO SinhVien_MonHoc (maSV, maLopHP, ngayDangKy) VALUES ?"

            mysqlConnection.query(participantQuery, [values], (err, result) => {
              if (err) {
                return mysqlConnection.rollback(() => {
                  console.error("Error registering participants:", err)
                  res.status(500).json({ message: "Lỗi khi đăng ký sinh viên tham gia" })
                })
              }

              // Update the current count in LopHocPhan
              mysqlConnection.query(
                "UPDATE LopHocPhan SET siSoHienTai = siSoHienTai + ? WHERE maLopHP = ?",
                [participants.length, maLopHP],
                (err, result) => {
                  if (err) {
                    return mysqlConnection.rollback(() => {
                      console.error("Error updating class size:", err)
                      res.status(500).json({ message: "Lỗi khi cập nhật sĩ số lớp" })
                    })
                  }

                  // Create a news announcement for the new class request
                  const maThongBao = `TB${Date.now().toString().slice(-6)}`
                  const tieuDe = `Yêu cầu mở lớp mới`
                  const noiDung = `Sinh viên ${maSV} đã tạo yêu cầu mở lớp học phần ${maLopHP}`

                  mysqlConnection.query(
                    "INSERT INTO BangTin (maThongBao, tieuDe, noiDung, ngayDang, nguoiDang, loaiNguoiDung) VALUES (?, ?, ?, ?, ?, 'SinhVien')",
                    [maThongBao, tieuDe, noiDung, ngayGui, maSV],
                    (err, result) => {
                      if (err) {
                        return mysqlConnection.rollback(() => {
                          console.error("Error creating news announcement:", err)
                          res.status(500).json({ message: "Lỗi khi tạo thông báo" })
                        })
                      }

                      // Commit the transaction
                      mysqlConnection.commit((err) => {
                        if (err) {
                          return mysqlConnection.rollback(() => {
                            console.error("Error committing transaction:", err)
                            res.status(500).json({ message: "Lỗi khi hoàn tất giao dịch" })
                          })
                        }

                        res.status(201).json({
                          message: "Tạo yêu cầu mở lớp thành công",
                          maYeuCau,
                          participants: participants.length,
                        })
                      })
                    },
                  )
                },
              )
            })
          } else {
            // If no participants, just commit the transaction
            mysqlConnection.commit((err) => {
              if (err) {
                return mysqlConnection.rollback(() => {
                  console.error("Error committing transaction:", err)
                  res.status(500).json({ message: "Lỗi khi hoàn tất giao dịch" })
                })
              }

              res.status(201).json({
                message: "Tạo yêu cầu mở lớp thành công",
                maYeuCau,
              })
            })
          }
        },
      )
    })
  })
}

// Join a class request
exports.joinClassRequest = (req, res) => {
  const { maSV, maLopHP } = req.body

  if (!maSV || !maLopHP) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" })
  }

  // Check if the user is a student
  mysqlConnection.query("SELECT loaiNguoiDung FROM NguoiDung WHERE maNguoiDung = ?", [maSV], (err, results) => {
    if (err) {
      console.error("Error checking user type:", err)
      return res.status(500).json({ message: "Lỗi khi kiểm tra thông tin người dùng" })
    }

    if (results.length === 0 || results[0].loaiNguoiDung !== "SinhVien") {
      return res.status(403).json({ message: "Chỉ sinh viên mới có thể tham gia lớp học" })
    }

    // Check if the student is already registered
    mysqlConnection.query(
      "SELECT * FROM SinhVien_MonHoc WHERE maSV = ? AND maLopHP = ?",
      [maSV, maLopHP],
      (err, results) => {
        if (err) {
          console.error("Error checking existing registration:", err)
          return res.status(500).json({ message: "Lỗi khi kiểm tra đăng ký" })
        }

        if (results.length > 0) {
          return res.status(400).json({ message: "Sinh viên đã đăng ký lớp học này" })
        }

        // Begin transaction
        mysqlConnection.beginTransaction((err) => {
          if (err) {
            console.error("Error starting transaction:", err)
            return res.status(500).json({ message: "Lỗi khi bắt đầu giao dịch" })
          }

          const ngayDangKy = new Date().toISOString().split("T")[0]

          // Register the student
          mysqlConnection.query(
            "INSERT INTO SinhVien_MonHoc (maSV, maLopHP, ngayDangKy) VALUES (?, ?, ?)",
            [maSV, maLopHP, ngayDangKy],
            (err, result) => {
              if (err) {
                return mysqlConnection.rollback(() => {
                  console.error("Error registering student:", err)
                  res.status(500).json({ message: "Lỗi khi đăng ký sinh viên" })
                })
              }

              // Update the current count in LopHocPhan
              mysqlConnection.query(
                "UPDATE LopHocPhan SET siSoHienTai = siSoHienTai + 1 WHERE maLopHP = ?",
                [maLopHP],
                (err, result) => {
                  if (err) {
                    return mysqlConnection.rollback(() => {
                      console.error("Error updating class size:", err)
                      res.status(500).json({ message: "Lỗi khi cập nhật sĩ số lớp" })
                    })
                  }

                  // Check if we've reached 30 students
                  mysqlConnection.query(
                    "SELECT COUNT(*) as count FROM SinhVien_MonHoc WHERE maLopHP = ?",
                    [maLopHP],
                    (err, results) => {
                      if (err) {
                        return mysqlConnection.rollback(() => {
                          console.error("Error counting students:", err)
                          res.status(500).json({ message: "Lỗi khi đếm số sinh viên" })
                        })
                      }

                      const studentCount = results[0].count

                      // If we have 30 students, update the request status
                      if (studentCount >= 30) {
                        mysqlConnection.query(
                          "UPDATE YeuCauMoLop SET tinhTrang = 'DaDuyet' WHERE maLopHP = ?",
                          [maLopHP],
                          (err, result) => {
                            if (err) {
                              return mysqlConnection.rollback(() => {
                                console.error("Error updating request status:", err)
                                res.status(500).json({ message: "Lỗi khi cập nhật trạng thái yêu cầu" })
                              })
                            }

                            // Create a news announcement for the approved class
                            const maThongBao = `TB${Date.now().toString().slice(-6)}`
                            const tieuDe = `Lớp học phần đã đủ điều kiện mở`
                            const noiDung = `Lớp học phần ${maLopHP} đã đạt đủ 30 sinh viên đăng ký và đã được duyệt tự động.`

                            mysqlConnection.query(
                              "INSERT INTO BangTin (maThongBao, tieuDe, noiDung, ngayDang, nguoiDang, loaiNguoiDung) VALUES (?, ?, ?, ?, ?, 'SinhVien')",
                              [maThongBao, tieuDe, noiDung, ngayDangKy, maSV],
                              (err, result) => {
                                if (err) {
                                  return mysqlConnection.rollback(() => {
                                    console.error("Error creating news announcement:", err)
                                    res.status(500).json({ message: "Lỗi khi tạo thông báo" })
                                  })
                                }

                                // Commit the transaction
                                mysqlConnection.commit((err) => {
                                  if (err) {
                                    return mysqlConnection.rollback(() => {
                                      console.error("Error committing transaction:", err)
                                      res.status(500).json({ message: "Lỗi khi hoàn tất giao dịch" })
                                    })
                                  }

                                  res.status(200).json({
                                    message: "Tham gia lớp học thành công. Lớp học đã đủ điều kiện mở.",
                                    studentCount,
                                    approved: true,
                                  })
                                })
                              },
                            )
                          },
                        )
                      } else {
                        // Commit the transaction
                        mysqlConnection.commit((err) => {
                          if (err) {
                            return mysqlConnection.rollback(() => {
                              console.error("Error committing transaction:", err)
                              res.status(500).json({ message: "Lỗi khi hoàn tất giao dịch" })
                            })
                          }

                          res.status(200).json({
                            message: "Tham gia lớp học thành công",
                            studentCount,
                            approved: false,
                          })
                        })
                      }
                    },
                  )
                },
              )
            },
          )
        })
      },
    )
  })
}

// Get participants for a class request
exports.getParticipants = (req, res) => {
  const { maLopHP } = req.params

  if (!maLopHP) {
    return res.status(400).json({ message: "Thiếu mã lớp học phần" })
  }

  const query = `
    SELECT 
      sm.maSV,
      sv.hoTen,
      l.tenLop AS lop,
      sm.ngayDangKy
    FROM SinhVien_MonHoc sm
    JOIN SinhVien sv ON sm.maSV = sv.maSV
    LEFT JOIN Lop l ON sv.maSV = l.maSV
    WHERE sm.maLopHP = ?
    ORDER BY sm.ngayDangKy
  `

  mysqlConnection.query(query, [maLopHP], (err, results) => {
    if (err) {
      console.error("Error fetching participants:", err)
      return res.status(500).json({ message: "Lỗi khi lấy danh sách sinh viên tham gia" })
    }

    res.json(results)
  })
}

// Get available courses for class requests
exports.getAvailableCourses = (req, res) => {
  const query = `
    SELECT 
      mh.maMH,
      mh.tenMH,
      mh.soTinChi,
      lhp.maLopHP,
      lhp.namHoc,
      lhp.hocKy,
      lhp.siSoToiDa,
      lhp.siSoHienTai,
      (SELECT COUNT(*) FROM SinhVien_MonHoc WHERE maLopHP = lhp.maLopHP) AS soLuongDangKy
    FROM MonHoc mh
    JOIN LopHocPhan lhp ON mh.maMH = lhp.maMH
    WHERE lhp.siSoHienTai < lhp.siSoToiDa
    ORDER BY mh.tenMH
  `

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching available courses:", err)
      return res.status(500).json({ message: "Lỗi khi lấy danh sách môn học" })
    }

    res.json(results)
  })
}
