const { mysqlConnection } = require("../config/db");

// Get all class requests
exports.getAllClassRequests = (req, res) => {
  const query = `
    SELECT 
      ycml.maYeuCau, 
      ycml.ngayGui, 
      ycml.tinhTrangTongQuat,
      ycml.trangThaiXuLy, 
      ycml.maSV,
      ycml.soLuongThamGia,
      ycml.description,
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
  `;

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching class requests:", err);
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy danh sách yêu cầu mở lớp" });
    }
    res.json(results);
  });
};

// Create a new class request
exports.createClassRequest = (req, res) => {
  const { maSV, maLopHP, description } = req.body;

  if (!maSV || !maLopHP) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
  }

  // Check if the user is a student
  mysqlConnection.query(
    "SELECT loaiNguoiDung FROM NguoiDung WHERE maNguoiDung = ?",
    [maSV],
    (err, results) => {
      if (err) {
        console.error("Error checking user type:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi kiểm tra thông tin người dùng" });
      }

      if (results.length === 0 || results[0].loaiNguoiDung !== "SinhVien") {
        return res
          .status(403)
          .json({ message: "Chỉ sinh viên mới có thể tạo yêu cầu mở lớp" });
      }

      // Get maMH from LopHocPhan
      mysqlConnection.query(
        "SELECT maMH FROM LopHocPhan WHERE maLopHP = ?",
        [maLopHP],
        (err, rows) => {
          if (err || !rows || rows.length === 0) {
            console.error("Error getting maMH:", err);
            return res.status(500).json({
              message: "Không tìm thấy mã môn học cho lớp học phần",
            });
          }

          const maMH = rows[0].maMH;
          const maYeuCau = `YC${Date.now().toString().slice(-6)}`;
          const ngayGui = new Date().toISOString().split("T")[0];
          const soLuongThamGia = 1; // Initialize to 1 for the requesting student

          // Begin transaction
          mysqlConnection.beginTransaction((err) => {
            if (err) {
              console.error("Error starting transaction:", err);
              return res
                .status(500)
                .json({ message: "Lỗi khi bắt đầu giao dịch" });
            }

            // Insert the request with new fields
            const insertRequestSql = description
              ? "INSERT INTO YeuCauMoLop (maYeuCau, ngayGui, tinhTrangTongQuat, trangThaiXuLy, maSV, maLopHP, maMH, soLuongThamGia, description) VALUES (?, ?, 'DaGui', '0_ChuaGui', ?, ?, ?, ?, ?)"
              : "INSERT INTO YeuCauMoLop (maYeuCau, ngayGui, tinhTrangTongQuat, trangThaiXuLy, maSV, maLopHP, maMH, soLuongThamGia) VALUES (?, ?, 'DaGui', '0_ChuaGui', ?, ?, ?, ?)";

            const insertRequestParams = description
              ? [
                  maYeuCau,
                  ngayGui,
                  maSV,
                  maLopHP,
                  maMH,
                  soLuongThamGia,
                  description,
                ]
              : [maYeuCau, ngayGui, maSV, maLopHP, maMH, soLuongThamGia];

            mysqlConnection.query(
              insertRequestSql,
              insertRequestParams,
              (err, result) => {
                if (err) {
                  return mysqlConnection.rollback(() => {
                    console.error("Error creating class request:", err);
                    res
                      .status(500)
                      .json({ message: "Lỗi khi tạo yêu cầu mở lớp" });
                  });
                }

                // Register the requesting student
                mysqlConnection.query(
                  "INSERT INTO SinhVien_MonHoc (maSV, maMH, maLopHP, ngayDangKy) VALUES (?, ?, ?, ?)",
                  [maSV, maMH, maLopHP, ngayGui],
                  (err, result) => {
                    if (err) {
                      return mysqlConnection.rollback(() => {
                        console.error("Error registering student:", err);
                        res
                          .status(500)
                          .json({ message: "Lỗi khi đăng ký sinh viên" });
                      });
                    }

                    // Commit transaction
                    mysqlConnection.commit((err) => {
                      if (err) {
                        return mysqlConnection.rollback(() => {
                          console.error("Error committing transaction:", err);
                          res
                            .status(500)
                            .json({ message: "Lỗi khi hoàn tất giao dịch" });
                        });
                      }
                      res.status(201).json({
                        message: "Tạo yêu cầu mở lớp thành công",
                        maYeuCau,
                      });
                    });
                  }
                );
              }
            );
          });
        }
      );
    }
  );
};

// Join a class request
exports.joinClassRequest = (req, res) => {
  const { maSV, maLopHP } = req.body;

  if (!maSV) {
    return res.status(400).json({ message: "Thiếu mã sinh viên (maSV)" });
  }
  if (!maLopHP) {
    return res.status(400).json({ message: "Thiếu mã lớp học phần (maLopHP)" });
  }

  // Check if the user is a student
  mysqlConnection.query(
    "SELECT loaiNguoiDung FROM NguoiDung WHERE maNguoiDung = ?",
    [maSV],
    (err, results) => {
      if (err) {
        console.error("Error checking user type:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi kiểm tra thông tin người dùng" });
      }

      if (results.length === 0 || results[0].loaiNguoiDung !== "SinhVien") {
        return res
          .status(403)
          .json({ message: "Chỉ sinh viên mới có thể tham gia lớp học" });
      }

      // Get maMH from LopHocPhan
      mysqlConnection.query(
        "SELECT maMH FROM LopHocPhan WHERE maLopHP = ?",
        [maLopHP],
        (err, rows) => {
          if (err || !rows || rows.length === 0) {
            console.error("Error getting maMH:", err);
            return res.status(500).json({
              message: "Không tìm thấy mã môn học cho lớp học phần",
            });
          }

          const maMH = rows[0].maMH;

          // Check if the student is already registered
          mysqlConnection.query(
            "SELECT * FROM SinhVien_MonHoc WHERE maSV = ? AND maLopHP = ?",
            [maSV, maLopHP],
            (err, results) => {
              if (err) {
                console.error("Error checking existing registration:", err);
                return res
                  .status(500)
                  .json({ message: "Lỗi khi kiểm tra đăng ký" });
              }

              if (results.length > 0) {
                return res
                  .status(400)
                  .json({ message: "Sinh viên đã đăng ký lớp học này" });
              }

              // Begin transaction
              mysqlConnection.beginTransaction((err) => {
                if (err) {
                  console.error("Error starting transaction:", err);
                  return res
                    .status(500)
                    .json({ message: "Lỗi khi bắt đầu giao dịch" });
                }

                const ngayDangKy = new Date().toISOString().split("T")[0];

                // Register the student
                mysqlConnection.query(
                  "INSERT INTO SinhVien_MonHoc (maSV, maMH, maLopHP, ngayDangKy) VALUES (?, ?, ?, ?)",
                  [maSV, maMH, maLopHP, ngayDangKy],
                  (err, result) => {
                    if (err) {
                      return mysqlConnection.rollback(() => {
                        console.error("Error registering student:", err);
                        res
                          .status(500)
                          .json({ message: "Lỗi khi đăng ký sinh viên" });
                      });
                    }

                    // Update soLuongThamGia in YeuCauMoLop
                    mysqlConnection.query(
                      "UPDATE YeuCauMoLop SET soLuongThamGia = soLuongThamGia + 1 WHERE maLopHP = ?",
                      [maLopHP],
                      (err, result) => {
                        if (err) {
                          return mysqlConnection.rollback(() => {
                            console.error(
                              "Error updating participants count:",
                              err
                            );
                            res.status(500).json({
                              message: "Lỗi khi cập nhật số lượng tham gia",
                            });
                          });
                        }

                        // Get current participant count
                        mysqlConnection.query(
                          "SELECT soLuongThamGia FROM YeuCauMoLop WHERE maLopHP = ?",
                          [maLopHP],
                          (err, results) => {
                            if (err) {
                              return mysqlConnection.rollback(() => {
                                console.error(
                                  "Error getting participant count:",
                                  err
                                );
                                res.status(500).json({
                                  message: "Lỗi khi lấy số lượng tham gia",
                                });
                              });
                            }

                            const studentCount = results[0].soLuongThamGia;

                            // If we have 30 students, update the request status
                            if (studentCount >= 30) {
                              const maThongBao = `TB${Date.now()
                                .toString()
                                .slice(-6)}`;
                              const tieuDe =
                                "Yêu cầu mở lớp được duyệt tự động";
                              const noiDung = `Lớp học phần ${maLopHP} đã đạt đủ 30 sinh viên đăng ký và được duyệt tự động.`;

                              mysqlConnection.query(
                                "UPDATE YeuCauMoLop SET tinhTrangTongQuat = 'DaDuyet', trangThaiXuLy = '4_ChoMoLop' WHERE maLopHP = ?",
                                [maLopHP],
                                (err, result) => {
                                  if (err) {
                                    return mysqlConnection.rollback(() => {
                                      console.error(
                                        "Error updating request status:",
                                        err
                                      );
                                      res.status(500).json({
                                        message:
                                          "Lỗi khi cập nhật trạng thái yêu cầu",
                                      });
                                    });
                                  }

                                  // Create a news announcement
                                  mysqlConnection.query(
                                    "INSERT INTO BangTin (maThongBao, tieuDe, noiDung, ngayDang, nguoiDang, loaiNguoiDung) VALUES (?, ?, ?, ?, ?, 'SinhVien')",
                                    [
                                      maThongBao,
                                      tieuDe,
                                      noiDung,
                                      ngayDangKy,
                                      maSV,
                                    ],
                                    (err, result) => {
                                      if (err) {
                                        return mysqlConnection.rollback(() => {
                                          console.error(
                                            "Error creating news announcement:",
                                            err
                                          );
                                          res.status(500).json({
                                            message: "Lỗi khi tạo thông báo",
                                          });
                                        });
                                      }

                                      // Commit the transaction
                                      mysqlConnection.commit((err) => {
                                        if (err) {
                                          return mysqlConnection.rollback(
                                            () => {
                                              console.error(
                                                "Error committing transaction:",
                                                err
                                              );
                                              res.status(500).json({
                                                message:
                                                  "Lỗi khi hoàn tất giao dịch",
                                              });
                                            }
                                          );
                                        }

                                        res.status(200).json({
                                          message:
                                            "Tham gia lớp học thành công. Lớp học đã đủ điều kiện mở.",
                                          studentCount,
                                          approved: true,
                                        });
                                      });
                                    }
                                  );
                                }
                              );
                            } else {
                              // Commit the transaction for normal join
                              mysqlConnection.commit((err) => {
                                if (err) {
                                  return mysqlConnection.rollback(() => {
                                    console.error(
                                      "Error committing transaction:",
                                      err
                                    );
                                    res.status(500).json({
                                      message: "Lỗi khi hoàn tất giao dịch",
                                    });
                                  });
                                }

                                res.status(200).json({
                                  message: "Tham gia lớp học thành công",
                                  studentCount,
                                  approved: false,
                                });
                              });
                            }
                          }
                        );
                      }
                    );
                  }
                );
              });
            }
          );
        }
      );
    }
  );
};

// Get participants for a class request
exports.getParticipants = (req, res) => {
  const { maLopHP } = req.params;

  if (!maLopHP) {
    return res.status(400).json({ message: "Thiếu mã lớp học phần" });
  }

  const query = `    SELECT 
      sm.maSV,
      sv.hoTen,
      l.tenLop AS lop,
      sm.ngayDangKy
    FROM SinhVien_MonHoc sm
    JOIN SinhVien sv ON sm.maSV = sv.maSV
    LEFT JOIN Lop l ON sv.maLop = l.maLop
    WHERE sm.maLopHP = ?
    ORDER BY sm.ngayDangKy
  `;

  mysqlConnection.query(query, [maLopHP], (err, results) => {
    if (err) {
      console.error("Error fetching participants:", err);
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy danh sách sinh viên tham gia" });
    }

    res.json(results);
  });
};

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
  `;

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching available courses:", err);
      return res.status(500).json({ message: "Lỗi khi lấy danh sách môn học" });
    }

    res.json(results);
  });
};

// Approve a class request (GiaoVu, TruongBoMon, TruongKhoa)
exports.approveClassRequest = (req, res) => {
  const { maYeuCau } = req.params;
  const userRole = req.user.userRole;
  const userId = req.user.userId;

  console.log("approveClassRequest called with:", {
    maYeuCau,
    userRole,
    userId,
  });

  let nextTrangThai, nextTinhTrang;
  let currentTrangThai;

  // Xác định trạng thái tiếp theo dựa trên vai trò
  if (userRole === "GiaoVu") {
    nextTrangThai = "2_TBMNhan";
    nextTinhTrang = "DaDuyet";
    currentTrangThai = "1_GiaoVuNhan";
  } else if (userRole === "TruongBoMon") {
    nextTrangThai = "3_TruongKhoaNhan";
    nextTinhTrang = "DaDuyet";
    currentTrangThai = "2_TBMNhan";
  } else if (userRole === "TruongKhoa") {
    nextTrangThai = "4_ChoMoLop";
    nextTinhTrang = "DaDuyet";
    currentTrangThai = "3_TruongKhoaNhan";
  } else {
    console.error("Invalid user role for approval:", userRole);
    return res
      .status(403)
      .json({ message: "Bạn không có quyền duyệt yêu cầu này" });
  }

  console.log("State transition:", {
    currentTrangThai,
    nextTrangThai,
    nextTinhTrang,
  });

  // Lấy trạng thái cũ để ghi lịch sử
  const getOldStatusQuery =
    "SELECT trangThaiXuLy FROM YeuCauMoLop WHERE maYeuCau = ?";
  mysqlConnection.query(getOldStatusQuery, [maYeuCau], (err, results) => {
    if (err) {
      console.error("Error checking request:", err);
      return res.status(500).json({ message: "Lỗi khi kiểm tra yêu cầu" });
    }

    if (results.length === 0) {
      console.error("Request not found:", maYeuCau);
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    const oldStatus = results[0].trangThaiXuLy;
    console.log("Current status:", oldStatus);

    if (oldStatus !== currentTrangThai) {
      console.error("Status mismatch:", {
        expected: currentTrangThai,
        actual: oldStatus,
      });
      return res.status(400).json({
        message: "Trạng thái yêu cầu không hợp lệ",
        current: oldStatus,
        expected: currentTrangThai,
      });
    }

    // Cập nhật trạng thái mới
    const updateQuery =
      "UPDATE YeuCauMoLop SET trangThaiXuLy = ?, tinhTrangTongQuat = ? WHERE maYeuCau = ?";
    mysqlConnection.query(
      updateQuery,
      [nextTrangThai, nextTinhTrang, maYeuCau],
      (err2) => {
        if (err2) {
          console.error("Error updating request status:", err2);
          return res
            .status(500)
            .json({ message: "Lỗi khi cập nhật trạng thái" });
        }

        // Ghi lịch sử thay đổi
        const maLichSu = `LS${Date.now().toString().slice(-6)}`;
        const ngayThayDoi = new Date().toISOString().split("T")[0];
        const insertHistory =
          "INSERT INTO LichSuThayDoiYeuCau (maLichSu, maYeuCau, cotTrangThaiCu, cotTrangThaiMoi, ngayThayDoi, nguoiThayDoi) VALUES (?, ?, ?, ?, ?, ?)";

        mysqlConnection.query(
          insertHistory,
          [maLichSu, maYeuCau, oldStatus, nextTrangThai, ngayThayDoi, userId],
          (err3) => {
            if (err3) {
              console.error("Error recording history:", err3);
              return res
                .status(500)
                .json({ message: "Lỗi khi ghi lịch sử thay đổi" });
            }

            console.log("Request approved successfully:", {
              maYeuCau,
              oldStatus,
              newStatus: nextTrangThai,
              historyId: maLichSu,
            });

            res.json({
              message: "Duyệt yêu cầu thành công",
              oldStatus,
              newStatus: nextTrangThai,
            });
          }
        );
      }
    );
  });
};

// Reject a class request (GiaoVu, TruongBoMon, TruongKhoa)
exports.rejectClassRequest = (req, res) => {
  const { maYeuCau } = req.params;
  const userRole = req.user.userRole;
  const userId = req.user.userId;

  console.log("rejectClassRequest called with:", {
    maYeuCau,
    userRole,
    userId,
  });

  let currentTrangThai;

  if (userRole === "GiaoVu") {
    currentTrangThai = "1_GiaoVuNhan";
  } else if (userRole === "TruongBoMon") {
    currentTrangThai = "2_TBMNhan";
  } else if (userRole === "TruongKhoa") {
    currentTrangThai = "3_TruongKhoaNhan";
  } else {
    console.error("Invalid user role for rejection:", userRole);
    return res
      .status(403)
      .json({ message: "Bạn không có quyền từ chối yêu cầu này" });
  }

  // Lấy trạng thái cũ để ghi lịch sử
  const getOldStatusQuery =
    "SELECT trangThaiXuLy FROM YeuCauMoLop WHERE maYeuCau = ?";
  mysqlConnection.query(getOldStatusQuery, [maYeuCau], (err, results) => {
    if (err) {
      console.error("Error checking request:", err);
      return res.status(404).json({ message: "Lỗi khi kiểm tra yêu cầu" });
    }

    if (results.length === 0) {
      console.error("Request not found:", maYeuCau);
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    const oldStatus = results[0].trangThaiXuLy;
    console.log("Current status:", oldStatus);

    if (oldStatus !== currentTrangThai) {
      console.error("Status mismatch:", {
        expected: currentTrangThai,
        actual: oldStatus,
      });
      return res.status(400).json({
        message: "Trạng thái yêu cầu không hợp lệ",
        current: oldStatus,
        expected: currentTrangThai,
      });
    }

    // Cập nhật trạng thái mới
    const updateQuery =
      "UPDATE YeuCauMoLop SET tinhTrangTongQuat = 'TuChoi', trangThaiXuLy = ? WHERE maYeuCau = ?";
    mysqlConnection.query(updateQuery, [currentTrangThai, maYeuCau], (err2) => {
      if (err2) {
        console.error("Error updating request status:", err2);
        return res.status(500).json({ message: "Lỗi khi cập nhật trạng thái" });
      }

      // Ghi lịch sử thay đổi
      const maLichSu = `LS${Date.now().toString().slice(-6)}`;
      const ngayThayDoi = new Date().toISOString().split("T")[0];
      const insertHistory =
        "INSERT INTO LichSuThayDoiYeuCau (maLichSu, maYeuCau, cotTrangThaiCu, cotTrangThaiMoi, ngayThayDoi, nguoiThayDoi) VALUES (?, ?, ?, ?, ?, ?)";

      mysqlConnection.query(
        insertHistory,
        [maLichSu, maYeuCau, oldStatus, currentTrangThai, ngayThayDoi, userId],
        (err3) => {
          if (err3) {
            console.error("Error recording history:", err3);
            return res
              .status(500)
              .json({ message: "Lỗi khi ghi lịch sử thay đổi" });
          }

          console.log("Request rejected successfully:", {
            maYeuCau,
            oldStatus,
            newStatus: currentTrangThai,
            historyId: maLichSu,
          });

          res.json({
            message: "Từ chối yêu cầu thành công",
            oldStatus,
            newStatus: currentTrangThai,
          });
        }
      );
    });
  });
};
