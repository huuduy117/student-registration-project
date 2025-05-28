const { mysqlConnection } = require("../config/db");

/**
 * Thêm mới người dùng
 */
function createUserWithDetail(userData) {
  return new Promise((resolve, reject) => {
    if (!userData || typeof userData !== "object") {
      return reject({
        success: false,
        message: "Thiếu hoặc sai userData trong request body",
      });
    }

    mysqlConnection.beginTransaction((err) => {
      if (err) {
        return reject({
          success: false,
          message: "Không thể bắt đầu transaction",
        });
      }

      // 1. Thêm vào bảng nguoidung
      const userFields = Object.keys(userData);
      const userValues = Object.values(userData);
      const userSql = `INSERT INTO NguoiDung (${userFields.join(
        ","
      )}) VALUES (${userFields.map(() => "?").join(",")})`;

      mysqlConnection.query(userSql, userValues, (err, result) => {
        if (err) {
          console.error("[NguoiDung] Lỗi khi thêm:", err);
          return mysqlConnection.rollback(() => {
            if (err.code === "ER_DUP_ENTRY") {
              reject({
                success: false,
                message: "Mã người dùng đã tồn tại",
                error: err,
              });
            } else {
              reject({
                success: false,
                message: "Lỗi khi thêm người dùng",
                error: err,
              });
            }
          });
        }

        mysqlConnection.commit((err) => {
          if (err) {
            console.error("[Transaction] Lỗi khi commit:", err);
            return mysqlConnection.rollback(() => {
              reject({
                success: false,
                message: "Lỗi khi commit transaction",
                error: err,
              });
            });
          }
          resolve({ success: true, message: "Thêm mới thành công" });
        });
      });
    });
  });
}

/**
 * Lấy danh sách người dùng theo loại
 */
function getUsersByType(type, callback) {
  let query = "";
  query = `
      SELECT 
        n.maNguoiDung as id,
        n.tenDangNhap as username,
        n.loaiNguoiDung as userType
      FROM NguoiDung n
      WHERE n.loaiNguoiDung = ?
      ORDER BY n.tenDangNhap
    `;

  mysqlConnection.query(query, [type], callback);
}

/**
 * Lấy thông tin người dùng theo ID
 */
function getUserById(userId, callback) {
  const query = `
    SELECT 
      n.maNguoiDung as id,
      n.tenDangNhap as username,
      n.loaiNguoiDung as userType
    FROM NguoiDung n
    WHERE n.maNguoiDung = ?
  `;

  mysqlConnection.query(query, [userId], callback);
}

/**
 * Cập nhật thông tin người dùng
 */
function updateUser(userId, userData) {
  return new Promise((resolve, reject) => {
    if (!userData || typeof userData !== "object") {
      return reject({
        success: false,
        message: "Thiếu hoặc sai userData trong request body",
      });
    }

    mysqlConnection.beginTransaction((err) => {
      if (err) {
        return reject({
          success: false,
          message: "Không thể bắt đầu transaction",
          error: err,
        });
      }

      // 1. Cập nhật bảng nguoidung
      const userFields = Object.keys(userData);
      const userValues = Object.values(userData);
      if (userFields.length > 0) {
        const userSql = `UPDATE NguoiDung SET ${userFields
          .map((field) => `${field} = ?`)
          .join(", ")} WHERE maNguoiDung = ?`;

        mysqlConnection.query(
          userSql,
          [...userValues, userId],
          (err, result) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                reject({
                  success: false,
                  message: "Lỗi khi cập nhật người dùng",
                  error: err,
                });
              });
            }

            mysqlConnection.commit((err) => {
              if (err) {
                return mysqlConnection.rollback(() => {
                  reject({
                    success: false,
                    message: "Lỗi khi commit transaction",
                    error: err,
                  });
                });
              }
              resolve({ success: true, message: "Cập nhật thành công" });
            });
          }
        );
      } else {
        mysqlConnection.commit((err) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              reject({
                success: false,
                message: "Lỗi khi commit transaction",
                error: err,
              });
            });
          }
          resolve({ success: true, message: "Cập nhật thành công" });
        });
      }
    });
  }).catch((err) => {
    console.error("Unhandled rejection in updateUser:", err);
  });
}

/**
 * Xóa người dùng và các bản ghi liên quan
 */
function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    mysqlConnection.beginTransaction((err) => {
      if (err) {
        return reject({
          success: false,
          message: "Không thể bắt đầu transaction",
          error: err,
        });
      }

      // Check user type first to handle role-specific deletion
      const checkUserTypeSql =
        "SELECT loaiNguoiDung FROM NguoiDung WHERE maNguoiDung = ?";
      mysqlConnection.query(checkUserTypeSql, [userId], (err, results) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            reject({
              success: false,
              message: "Lỗi khi kiểm tra loại người dùng",
              error: err,
            });
          });
        }

        if (!results || results.length === 0) {
          return mysqlConnection.rollback(() => {
            reject({
              success: false,
              message: "Không tìm thấy người dùng",
            });
          });
        }

        const userType = results[0].loaiNguoiDung;

        // Delete from BangTin
        mysqlConnection.query(
          "DELETE FROM BangTin WHERE nguoiDang = ?",
          [userId],
          (err) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                reject({
                  success: false,
                  message: "Lỗi khi xóa bản tin của người dùng",
                  error: err,
                });
              });
            }

            // Delete from LichSuThayDoiYeuCau
            mysqlConnection.query(
              "DELETE FROM LichSuThayDoiYeuCau WHERE nguoiThayDoi = ?",
              [userId],
              (err) => {
                if (err) {
                  return mysqlConnection.rollback(() => {
                    reject({
                      success: false,
                      message: "Lỗi khi xóa lịch sử thay đổi yêu cầu",
                      error: err,
                    });
                  });
                }

                // Delete from XuLyYeuCau
                mysqlConnection.query(
                  "DELETE FROM XuLyYeuCau WHERE nguoiXuLy = ?",
                  [userId],
                  (err) => {
                    if (err) {
                      return mysqlConnection.rollback(() => {
                        reject({
                          success: false,
                          message: "Lỗi khi xóa xử lý yêu cầu",
                          error: err,
                        });
                      });
                    }

                    // Handle role-specific deletion
                    let roleSpecificDelete = Promise.resolve();

                    if (userType === "SinhVien") {
                      roleSpecificDelete = new Promise((resolve, reject) => {
                        // Delete from ThoiKhoaBieuSinhVien first
                        mysqlConnection.query(
                          "DELETE FROM ThoiKhoaBieuSinhVien WHERE maSV = ?",
                          [userId],
                          (err) => {
                            if (err) {
                              return reject(err);
                            }
                            // Xóa lịch sử thay đổi yêu cầu liên quan đến các yêu cầu mở lớp của sinh viên này
                            mysqlConnection.query(
                              "DELETE FROM LichSuThayDoiYeuCau WHERE maYeuCau IN (SELECT maYeuCau FROM YeuCauMoLop WHERE maSV = ?)",
                              [userId],
                              (err) => {
                                if (err) {
                                  return reject(err);
                                }
                                // Then delete from YeuCauMoLop
                                mysqlConnection.query(
                                  "DELETE FROM YeuCauMoLop WHERE maSV = ?",
                                  [userId],
                                  (err) => {
                                    if (err) {
                                      return reject(err);
                                    }
                                    // Delete from PhanLop before SinhVien
                                    mysqlConnection.query(
                                      "DELETE FROM PhanLop WHERE maSV = ?",
                                      [userId],
                                      (err) => {
                                        if (err) {
                                          return reject(err);
                                        }
                                        // Delete from sinhvien_monhoc before SinhVien
                                        mysqlConnection.query(
                                          "DELETE FROM sinhvien_monhoc WHERE maSV = ?",
                                          [userId],
                                          (err) => {
                                            if (err) {
                                              return reject(err);
                                            }
                                            // Finally delete from SinhVien
                                            mysqlConnection.query(
                                              "DELETE FROM SinhVien WHERE maSV = ?",
                                              [userId],
                                              (err) => {
                                                if (err) {
                                                  return reject(err);
                                                }
                                                resolve();
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      });
                    } else if (userType === "GiangVien") {
                      roleSpecificDelete = new Promise((resolve, reject) => {
                        // Xóa từ ThoiKhoaBieuGiangVien trước
                        mysqlConnection.query(
                          "DELETE FROM ThoiKhoaBieuGiangVien WHERE maGV = ?",
                          [userId],
                          (err) => {
                            if (err) {
                              return reject(err);
                            }
                            // Cập nhật các lớp có maCVHT = userId thành NULL trước khi xóa GiangVien
                            mysqlConnection.query(
                              "UPDATE lop SET maCVHT = NULL WHERE maCVHT = ?",
                              [userId],
                              (err) => {
                                if (err) {
                                  return reject(err);
                                }
                                // Cập nhật các lớp học phần có maGV = userId thành NULL trước khi xóa GiangVien
                                mysqlConnection.query(
                                  "UPDATE lophocphan SET maGV = NULL WHERE maGV = ?",
                                  [userId],
                                  (err) => {
                                    if (err) {
                                      return reject(err);
                                    }
                                    // Xóa từ phanconggiangvien trước khi xóa GiangVien
                                    mysqlConnection.query(
                                      "DELETE FROM phanconggiangvien WHERE maGV = ?",
                                      [userId],
                                      (err) => {
                                        if (err) {
                                          return reject(err);
                                        }
                                        // Xóa từ dangkylichday trước khi xóa GiangVien
                                        mysqlConnection.query(
                                          "DELETE FROM dangkylichday WHERE maGV = ?",
                                          [userId],
                                          (err) => {
                                            if (err) {
                                              return reject(err);
                                            }
                                            // Sau đó xóa từ GiangVien
                                            mysqlConnection.query(
                                              "DELETE FROM GiangVien WHERE maGV = ?",
                                              [userId],
                                              (err) => {
                                                if (err) {
                                                  return reject(err);
                                                }
                                                resolve();
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      });
                    }

                    roleSpecificDelete
                      .then(() => {
                        // Finally delete from NguoiDung
                        mysqlConnection.query(
                          "DELETE FROM NguoiDung WHERE maNguoiDung = ?",
                          [userId],
                          (err) => {
                            if (err) {
                              return mysqlConnection.rollback(() => {
                                reject({
                                  success: false,
                                  message: "Lỗi khi xóa người dùng",
                                  error: err,
                                });
                              });
                            }

                            mysqlConnection.commit((err) => {
                              if (err) {
                                return mysqlConnection.rollback(() => {
                                  reject({
                                    success: false,
                                    message: "Lỗi khi commit transaction",
                                    error: err,
                                  });
                                });
                              }
                              resolve({
                                success: true,
                                message:
                                  "Xóa người dùng và dữ liệu liên quan thành công",
                              });
                            });
                          }
                        );
                      })
                      .catch((err) => {
                        mysqlConnection.rollback(() => {
                          reject({
                            success: false,
                            message: `Lỗi khi xóa ${
                              userType === "SinhVien"
                                ? "sinh viên"
                                : "giảng viên"
                            }`,
                            error: err,
                          });
                        });
                      });
                  }
                );
              }
            );
          }
        );
      });
    });
  });
}

/**
 * Lấy thống kê sinh viên
 */
function getStudentStats(callback) {
  const queries = {
    total: "SELECT COUNT(*) as count FROM SinhVien",
    byClass: `SELECT l.tenLop as class, COUNT(*) as count FROM SinhVien sv LEFT JOIN Lop l ON sv.maLop = l.maLop WHERE sv.maLop IS NOT NULL GROUP BY l.tenLop ORDER BY count DESC`,
    registrationStatus: `
      SELECT status, COUNT(*) as count FROM (
        SELECT sv.maSV, IF(COUNT(tkb.maSV) > 0, 'Đã đăng ký', 'Chưa đăng ký') as status
        FROM SinhVien sv
        LEFT JOIN ThoiKhoaBieuSinhVien tkb ON sv.maSV = tkb.maSV
        GROUP BY sv.maSV
      ) as sub
      GROUP BY status
    `,
    classRequests: `
      SELECT 
        ycml.maYeuCau as id,
        mh.tenMH as courseName,
        ycml.soLuongThamGia as participantCount,
        ycml.description,
        ycml.tinhTrangTongQuat as status,
        ycml.trangThaiXuLy as processStatus,
        ycml.ngayGui as requestDate
      FROM YeuCauMoLop ycml
      JOIN LopHocPhan lhp ON ycml.maLopHP = lhp.maLopHP
      JOIN MonHoc mh ON lhp.maMH = mh.maMH
      ORDER BY ycml.ngayGui DESC
      LIMIT 5
    `,
    requestHistory: `
      SELECT 
        CONCAT('Yêu cầu mở lớp ', mh.tenMH) as action,
        DATE_FORMAT(ycml.ngayGui, '%d/%m/%Y %H:%i') as time
      FROM YeuCauMoLop ycml
      JOIN LopHocPhan lhp ON ycml.maLopHP = lhp.maLopHP
      JOIN MonHoc mh ON lhp.maMH = mh.maMH
      ORDER BY ycml.ngayGui DESC
      LIMIT 5
    `,
  };

  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    mysqlConnection.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = key === "total" ? 0 : [];
      } else {
        if (key === "total") {
          results[key] = result[0]?.count || 0;
        } else {
          results[key] = result || [];
        }
      }

      completed++;
      if (completed === totalQueries) {
        callback(null, results);
      }
    });
  });
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
        CONCAT('Tiết ', tkb.tietBD, '-', tkb.tietKT, ' (', DATE_FORMAT(tkb.ngayHoc, '%d/%m/%Y'), ')') as time,
        mh.tenMH as subject
      FROM ThoiKhoaBieuGiangVien tkb
      JOIN GiangVien gv ON tkb.maGV = gv.maGV
      JOIN LopHocPhan lhp ON tkb.maLopHP = lhp.maLopHP
      JOIN MonHoc mh ON lhp.maMH = mh.maMH
      ORDER BY tkb.ngayHoc, tkb.tietBD
      LIMIT 10
    `,
    approveHistory: `
      SELECT 
        CONCAT('Phê duyệt yêu cầu mở lớp') as action,
        DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i') as time
      FROM DUAL
      LIMIT 5
    `,
  };

  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    mysqlConnection.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = key === "total" ? 0 : [];
      } else {
        if (key === "total") {
          results[key] = result[0]?.count || 0;
        } else {
          results[key] = result || [];
        }
      }

      completed++;
      if (completed === totalQueries) {
        callback(null, results);
      }
    });
  });
}

/**
 * Lấy danh sách yêu cầu mở lớp cho admin
 */
function getClassRequests(callback) {
  const query = `
    SELECT 
      ycml.maYeuCau as id,
      mh.tenMH as courseName,
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
  `;

  mysqlConnection.query(query, callback);
}

/**
 * Cập nhật trạng thái yêu cầu mở lớp
 */
function updateClassRequestStatus(requestId, status, callback) {
  const query = `
    UPDATE YeuCauMoLop 
    SET tinhTrangTongQuat = ?, ngayCapNhat = NOW()
    WHERE maYeuCau = ?
  `;

  mysqlConnection.query(query, [status, requestId], callback);
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
  `;

  mysqlConnection.query(query, [requestId], callback);
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
};
