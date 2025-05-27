const { mysqlConnection } = require("../config/db")

/**
 * Thêm mới người dùng và bản ghi chi tiết (giảng viên hoặc sinh viên) trong transaction
 */
async function createUserWithDetail(userData, detailData, type) {
  return new Promise((resolve, reject) => {
    if (!userData || typeof userData !== "object") {
      return reject({
        success: false,
        message: "Thiếu hoặc sai userData trong request body",
      })
    }
    if (!detailData || typeof detailData !== "object") {
      return reject({
        success: false,
        message: "Thiếu hoặc sai detailData trong request body",
      })
    }
    if (!type || (type !== "GiangVien" && type !== "SinhVien")) {
      return reject({
        success: false,
        message: "Thiếu hoặc sai type trong request body",
      })
    }

    mysqlConnection.beginTransaction((err) => {
      if (err)
        return reject({
          success: false,
          message: "Không thể bắt đầu transaction",
        })

      // 1. Thêm vào bảng nguoidung
      const userFields = Object.keys(userData)
      const userValues = Object.values(userData)
      const userSql = `INSERT INTO NguoiDung (${userFields.join(",")}) VALUES (${userFields.map(() => "?").join(",")})`

      mysqlConnection.query(userSql, userValues, (err, result) => {
        if (err) {
          console.error("[NguoiDung] Lỗi khi thêm:", err)
          return mysqlConnection.rollback(() => {
            if (err.code === "ER_DUP_ENTRY") {
              reject({
                success: false,
                message: "Mã người dùng đã tồn tại",
                error: err,
              })
            } else {
              reject({
                success: false,
                message: "Lỗi khi thêm người dùng",
                error: err,
              })
            }
          })
        }

        // 2. Thêm vào bảng chi tiết
        let detailSql = ""
        const detailFields = Object.keys(detailData)
        const detailValues = Object.values(detailData)

        if (type === "GiangVien") {
          detailSql = `INSERT INTO GiangVien (${detailFields.join(
            ",",
          )}) VALUES (${detailFields.map(() => "?").join(",")})`
        } else if (type === "SinhVien") {
          detailSql = `INSERT INTO SinhVien (${detailFields.join(
            ",",
          )}) VALUES (${detailFields.map(() => "?").join(",")})`
        }

        mysqlConnection.query(detailSql, detailValues, (err, result) => {
          if (err) {
            console.error(`[${type}] Lỗi khi thêm chi tiết:`, err)
            return mysqlConnection.rollback(() => {
              reject({
                success: false,
                message: "Lỗi khi thêm chi tiết người dùng",
                error: err,
              })
            })
          }

          mysqlConnection.commit((err) => {
            if (err) {
              console.error("[Transaction] Lỗi khi commit:", err)
              return mysqlConnection.rollback(() => {
                reject({
                  success: false,
                  message: "Lỗi khi commit transaction",
                  error: err,
                })
              })
            }
            resolve({ success: true, message: "Thêm mới thành công" })
          })
        })
      })
    })
  })
}

/**
 * Lấy danh sách người dùng theo loại
 */
function getUsersByType(type, callback) {
  let query = ""

  if (type === "SinhVien") {
    query = `
      SELECT 
        n.maNguoiDung as id,
        n.tenDangNhap as username,
        sv.hoTen as fullName,
        sv.email,
        sv.soDienThoai as phone,
        sv.diaChi as address,
        sv.lop as classOrDept,
        n.loaiNguoiDung as userType,
        sv.ngaySinh as birthDate,
        sv.gioiTinh as gender
      FROM NguoiDung n
      JOIN SinhVien sv ON n.maNguoiDung = sv.maSV
      WHERE n.loaiNguoiDung = 'SinhVien'
      ORDER BY sv.hoTen
    `
  } else if (type === "GiangVien") {
    query = `
      SELECT 
        n.maNguoiDung as id,
        n.tenDangNhap as username,
        gv.hoTen as fullName,
        gv.email,
        gv.soDienThoai as phone,
        gv.diaChi as address,
        gv.boMon as classOrDept,
        n.loaiNguoiDung as userType,
        gv.ngaySinh as birthDate,
        gv.gioiTinh as gender,
        gv.hocVi as degree,
        gv.chuyenMon as specialization
      FROM NguoiDung n
      JOIN GiangVien gv ON n.maNguoiDung = gv.maGV
      WHERE n.loaiNguoiDung IN ('GiangVien', 'GiaoVu', 'TruongBoMon', 'TruongKhoa')
      ORDER BY gv.hoTen
    `
  } else {
    return callback(new Error("Invalid user type"))
  }

  mysqlConnection.query(query, callback)
}

/**
 * Lấy thông tin người dùng theo ID
 */
function getUserById(userId, callback) {
  const query = `
    SELECT 
      n.maNguoiDung as id,
      n.tenDangNhap as username,
      n.loaiNguoiDung as userType,
      CASE 
        WHEN n.loaiNguoiDung = 'SinhVien' THEN sv.hoTen
        ELSE gv.hoTen
      END as fullName,
      CASE 
        WHEN n.loaiNguoiDung = 'SinhVien' THEN sv.email
        ELSE gv.email
      END as email,
      CASE 
        WHEN n.loaiNguoiDung = 'SinhVien' THEN sv.soDienThoai
        ELSE gv.soDienThoai
      END as phone,
      CASE 
        WHEN n.loaiNguoiDung = 'SinhVien' THEN sv.diaChi
        ELSE gv.diaChi
      END as address,
      CASE 
        WHEN n.loaiNguoiDung = 'SinhVien' THEN sv.lop
        ELSE gv.boMon
      END as classOrDept
    FROM NguoiDung n
    LEFT JOIN SinhVien sv ON n.maNguoiDung = sv.maSV
    LEFT JOIN GiangVien gv ON n.maNguoiDung = gv.maGV
    WHERE n.maNguoiDung = ?
  `

  mysqlConnection.query(query, [userId], callback)
}

/**
 * Cập nhật thông tin người dùng
 */
function updateUser(userId, userData, detailData, type, callback) {
  mysqlConnection.beginTransaction((err) => {
    if (err) return callback(err)

    // Cập nhật bảng nguoidung
    if (userData && Object.keys(userData).length > 0) {
      const userFields = Object.keys(userData).filter((key) => userData[key] !== undefined && userData[key] !== "")
      const userValues = userFields.map((key) => userData[key])

      if (userFields.length > 0) {
        const userSql = `UPDATE NguoiDung SET ${userFields.map((field) => `${field} = ?`).join(", ")} WHERE maNguoiDung = ?`

        mysqlConnection.query(userSql, [...userValues, userId], (err) => {
          if (err) {
            return mysqlConnection.rollback(() => callback(err))
          }

          updateDetailTable()
        })
      } else {
        updateDetailTable()
      }
    } else {
      updateDetailTable()
    }

    function updateDetailTable() {
      // Cập nhật bảng chi tiết
      if (detailData && Object.keys(detailData).length > 0) {
        const detailFields = Object.keys(detailData).filter(
          (key) => detailData[key] !== undefined && detailData[key] !== "",
        )
        const detailValues = detailFields.map((key) => detailData[key])

        if (detailFields.length > 0) {
          let detailSql = ""
          let detailKey = ""

          if (type === "SinhVien") {
            detailSql = `UPDATE SinhVien SET ${detailFields.map((field) => `${field} = ?`).join(", ")} WHERE maSV = ?`
            detailKey = userId
          } else if (type === "GiangVien") {
            detailSql = `UPDATE GiangVien SET ${detailFields.map((field) => `${field} = ?`).join(", ")} WHERE maGV = ?`
            detailKey = userId
          }

          mysqlConnection.query(detailSql, [...detailValues, detailKey], (err) => {
            if (err) {
              return mysqlConnection.rollback(() => callback(err))
            }

            mysqlConnection.commit((err) => {
              if (err) {
                return mysqlConnection.rollback(() => callback(err))
              }
              callback(null, { success: true, message: "Cập nhật thành công" })
            })
          })
        } else {
          mysqlConnection.commit((err) => {
            if (err) {
              return mysqlConnection.rollback(() => callback(err))
            }
            callback(null, { success: true, message: "Cập nhật thành công" })
          })
        }
      } else {
        mysqlConnection.commit((err) => {
          if (err) {
            return mysqlConnection.rollback(() => callback(err))
          }
          callback(null, { success: true, message: "Cập nhật thành công" })
        })
      }
    }
  })
}

/**
 * Xóa người dùng
 */
function deleteUser(userId, type, callback) {
  mysqlConnection.beginTransaction((err) => {
    if (err) return callback(err)

    // Xóa từ bảng chi tiết trước
    let detailSql = ""
    if (type === "SinhVien") {
      detailSql = "DELETE FROM SinhVien WHERE maSV = ?"
    } else if (type === "GiangVien") {
      detailSql = "DELETE FROM GiangVien WHERE maGV = ?"
    }

    mysqlConnection.query(detailSql, [userId], (err) => {
      if (err) {
        return mysqlConnection.rollback(() => callback(err))
      }

      // Xóa từ bảng nguoidung
      const userSql = "DELETE FROM NguoiDung WHERE maNguoiDung = ?"
      mysqlConnection.query(userSql, [userId], (err) => {
        if (err) {
          return mysqlConnection.rollback(() => callback(err))
        }

        mysqlConnection.commit((err) => {
          if (err) {
            return mysqlConnection.rollback(() => callback(err))
          }
          callback(null, { success: true, message: "Xóa thành công" })
        })
      })
    })
  })
}

/**
 * Lấy thống kê sinh viên
 */
function getStudentStats(callback) {
  const queries = {
    total: "SELECT COUNT(*) as count FROM SinhVien",
    byClass:
      "SELECT lop as class, COUNT(*) as count FROM SinhVien WHERE lop IS NOT NULL GROUP BY lop ORDER BY count DESC",
    registrationStatus: `
      SELECT 
        CASE 
          WHEN COUNT(tkb.maSV) > 0 THEN 'Đã đăng ký'
          ELSE 'Chưa đăng ký'
        END as status,
        COUNT(DISTINCT sv.maSV) as count
      FROM SinhVien sv
      LEFT JOIN ThoiKhoaBieuSinhVien tkb ON sv.maSV = tkb.maSV
      GROUP BY CASE WHEN COUNT(tkb.maSV) > 0 THEN 'Đã đăng ký' ELSE 'Chưa đăng ký' END
    `,
    classRequests: `
      SELECT 
        ycml.maYeuCau as id,
        mh.tenMonHoc as courseName,
        ycml.tinhTrangTongQuat as status,
        ycml.ngayGui as requestDate
      FROM YeuCauMoLop ycml
      JOIN LopHocPhan lhp ON ycml.maLopHP = lhp.maLopHP
      JOIN MonHoc mh ON lhp.maMH = mh.maMH
      ORDER BY ycml.ngayGui DESC
      LIMIT 5
    `,
    requestHistory: `
      SELECT 
        CONCAT('Yêu cầu mở lớp ', mh.tenMonHoc) as action,
        DATE_FORMAT(ycml.ngayGui, '%d/%m/%Y %H:%i') as time
      FROM YeuCauMoLop ycml
      JOIN LopHocPhan lhp ON ycml.maLopHP = lhp.maLopHP
      JOIN MonHoc mh ON lhp.maMH = mh.maMH
      ORDER BY ycml.ngayGui DESC
      LIMIT 5
    `,
  }

  const results = {}
  let completed = 0
  const totalQueries = Object.keys(queries).length

  Object.entries(queries).forEach(([key, query]) => {
    mysqlConnection.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err)
        results[key] = key === "total" ? 0 : []
      } else {
        if (key === "total") {
          results[key] = result[0]?.count || 0
        } else {
          results[key] = result || []
        }
      }

      completed++
      if (completed === totalQueries) {
        callback(null, results)
      }
    })
  })
}

/**
 * Lấy thống kê giảng viên
 */
function getTeacherStats(callback) {
  const queries = {
    total: "SELECT COUNT(*) as count FROM GiangVien",
    classCountBySemester: `
      SELECT 
        CONCAT('HK', lhp.hocKy, '-', lhp.namHoc) as semester,
        COUNT(*) as count
      FROM LopHocPhan lhp
      GROUP BY lhp.hocKy, lhp.namHoc
      ORDER BY lhp.namHoc DESC, lhp.hocKy DESC
      LIMIT 6
    `,
    schedule: `
      SELECT 
        gv.hoTen as teacher,
        CONCAT('Thứ ', tkb.thu, ' - Tiết ', tkb.tietBatDau, '-', tkb.tietKetThuc) as time,
        mh.tenMonHoc as subject
      FROM ThoiKhoaBieuGiangVien tkb
      JOIN GiangVien gv ON tkb.maGV = gv.maGV
      JOIN LopHocPhan lhp ON tkb.maLopHP = lhp.maLopHP
      JOIN MonHoc mh ON lhp.maMH = mh.maMH
      ORDER BY tkb.thu, tkb.tietBatDau
      LIMIT 10
    `,
    approveHistory: `
      SELECT 
        CONCAT('Phê duyệt yêu cầu mở lớp') as action,
        DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i') as time
      FROM DUAL
      LIMIT 5
    `,
  }

  const results = {}
  let completed = 0
  const totalQueries = Object.keys(queries).length

  Object.entries(queries).forEach(([key, query]) => {
    mysqlConnection.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err)
        results[key] = key === "total" ? 0 : []
      } else {
        if (key === "total") {
          results[key] = result[0]?.count || 0
        } else {
          results[key] = result || []
        }
      }

      completed++
      if (completed === totalQueries) {
        callback(null, results)
      }
    })
  })
}

/**
 * Lấy danh sách yêu cầu mở lớp cho admin
 */
function getClassRequests(callback) {
  const query = `
    SELECT 
      ycml.maYeuCau as id,
      mh.tenMonHoc as courseName,
      ycml.soLuongThamGia as participantCount,
      ycml.description,
      ycml.tinhTrangTongQuat as status,
      ycml.trangThaiXuLy as processStatus,
      ycml.ngayGui as requestDate,
      sv.hoTen as requesterName,
      lhp.maLopHP as classCode
    FROM YeuCauMoLop ycml
    JOIN SinhVien sv ON ycml.maSV = sv.maSV
    JOIN LopHocPhan lhp ON ycml.maLopHP = lhp.maLopHP
    JOIN MonHoc mh ON lhp.maMH = mh.maMH
    ORDER BY ycml.ngayGui DESC
  `

  mysqlConnection.query(query, callback)
}

/**
 * Cập nhật trạng thái yêu cầu mở lớp
 */
function updateClassRequestStatus(requestId, status, callback) {
  const query = `
    UPDATE YeuCauMoLop 
    SET tinhTrangTongQuat = ?, ngayCapNhat = NOW()
    WHERE maYeuCau = ?
  `

  mysqlConnection.query(query, [status, requestId], callback)
}

/**
 * Lấy lịch sử thay đổi yêu cầu
 */
function getRequestHistory(requestId, callback) {
  const query = `
    SELECT 
      ls.cotTrangThaiCu as oldStatus,
      ls.cotTrangThaiMoi as newStatus,
      ls.ngayThayDoi as changeDate,
      CASE 
        WHEN nd.loaiNguoiDung = 'SinhVien' THEN sv.hoTen
        ELSE gv.hoTen
      END as changedBy
    FROM LichSuThayDoiYeuCau ls
    JOIN NguoiDung nd ON ls.nguoiThayDoi = nd.maNguoiDung
    LEFT JOIN SinhVien sv ON nd.maNguoiDung = sv.maSV
    LEFT JOIN GiangVien gv ON nd.maNguoiDung = gv.maGV
    WHERE ls.maYeuCau = ?
    ORDER BY ls.ngayThayDoi DESC
  `

  mysqlConnection.query(query, [requestId], callback)
}

module.exports = {
  createUserWithDetail,
  getUsersByType,
  getUserById,
  updateUser,
  deleteUser,
  getStudentStats,
  getTeacherStats,
  getClassRequests,
  updateClassRequestStatus,
  getRequestHistory,
}
