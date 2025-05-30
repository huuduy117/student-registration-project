const Teacher = require("../models/teacherModel");
const { mysqlConnection } = require("../config/db");

const someMethod = async (req, res) => {
  try {
    // Your controller logic here
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassCount = (req, res) => {
  const teacherId = req.user.userId; // Giảng viên đã được xác thực qua JWT
  console.log("Teacher ID:", teacherId);

  mysqlConnection.query(
    `SELECT maGV FROM GiangVien WHERE maGV = ?`, // Lấy maGV của giảng viên
    [teacherId],
    (err, results) => {
      if (err) {
        console.error("Error fetching maGV:", err);
        return res.status(500).json({ message: "Lỗi truy vấn!" });
      }

      // Log ra maGV từ bảng GiangVien
      console.log("maGV from GiangVien:", results?.[0]?.maGV);

      mysqlConnection.query(
        `SELECT COUNT(*) AS classCount FROM Lop WHERE maCVHT = (SELECT maGV FROM GiangVien WHERE maGV = ?)`,
        [teacherId],
        (err2, results2) => {
          if (err2) {
            console.error("Error fetching class count:", err2);
            return res.status(500).json({ message: "Lỗi truy vấn lớp học!" });
          }

          // Log ra số lượng lớp học
          console.log("Class count:", results2?.[0]?.classCount);

          res.json({ classCount: results2[0].classCount });
        }
      );
    }
  );
};

const getAvailableClassSections = (req, res) => {
  // Get all class sections that don't have a teacher assigned or have pending registrations
  const query = `
    SELECT lhp.*, mh.tenMH 
    FROM LopHocPhan lhp 
    JOIN MonHoc mh ON lhp.maMH = mh.maMH
    WHERE lhp.maGV IS NULL 
    AND lhp.trangThai = 'ChuaMo'
    AND NOT EXISTS (
      SELECT 1 FROM DangKyLichDay dkld 
      WHERE dkld.maLopHP = lhp.maLopHP 
      AND dkld.trangThai IN ('ChoDuyet', 'ChapNhan')
    )
    ORDER BY lhp.namHoc DESC, lhp.hocKy DESC
  `;

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching available classes:", err);
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy danh sách lớp học phần" });
    }
    res.json(results);
  });
};

const registerTeaching = (req, res) => {
  const { maGV, maLopHP, ngayDangKy, thu, tietHoc } = req.body;
  console.log("\n=== Debug Teacher Registration ===");
  console.log("Registration request:", {
    maGV,
    maLopHP,
    ngayDangKy,
    thu,
    tietHoc,
  });

  // Helper to map T2-T7 to MySQL DAYOFWEEK number
  const thuMap = { T2: 2, T3: 3, T4: 4, T5: 5, T6: 6, T7: 7 };
  const thuNumber = thuMap[thu];
  const tietBD = tietHoc.toString();

  // Tạo mã đăng ký ngắn gọn hơn: DKLD + timestamp 8 ký tự + GV
  const timestamp = Date.now().toString().slice(-8);
  const maDangKy = `DKLD${timestamp}${maGV}`;
  console.log("Generated registration code:", maDangKy);

  // First check if the class is still available and get class request info
  const checkQuery = `
    SELECT 
      lhp.maLopHP,
      lhp.maMH,
      mh.tenMH,
      ycml.maYeuCau,
      ycml.soLuongThamGia,
      ycml.description,
      ycml.trangThaiXuLy,
      ycml.tinhTrangTongQuat,
      sv.hoTen as tenSinhVien,
      sv.maSV
    FROM LopHocPhan lhp
    JOIN MonHoc mh ON lhp.maMH = mh.maMH
    LEFT JOIN YeuCauMoLop ycml ON lhp.maLopHP = ycml.maLopHP OR lhp.maLopHP = CONCAT(ycml.maLopHP, '_NEW')
    LEFT JOIN SinhVien sv ON ycml.maSV = sv.maSV
    WHERE lhp.maLopHP = ? 
    AND lhp.maGV IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM DangKyLichDay dkld 
      WHERE dkld.maLopHP = lhp.maLopHP 
      AND dkld.trangThai = 'ChapNhan'
    )
  `;

  mysqlConnection.query(checkQuery, [maLopHP], (err, results) => {
    if (err) {
      console.error("Error checking class availability:", err);
      return res.status(500).json({ message: "Lỗi khi kiểm tra lớp học phần" });
    }

    if (results.length === 0) {
      console.log("Class not available for registration");
      return res
        .status(400)
        .json({ message: "Lớp học phần này không còn khả dụng" });
    }

    const classInfo = results[0];
    console.log("\nClass Request Information:", classInfo);

    // Check if the selected time slot is available
    const checkTimeSlotQuery = `
      SELECT 1
      FROM ThoiKhoaBieuGiangVien tkb
      WHERE tkb.maGV = ?
        AND DAYOFWEEK(tkb.ngayHoc) = ?
        AND tkb.tietBD = ?
    `;

    mysqlConnection.query(
      checkTimeSlotQuery,
      [maGV, thuNumber, tietBD],
      (err, timeSlotResults) => {
        if (err) {
          console.error("Error checking time slot availability:", err);
          return res
            .status(500)
            .json({ message: "Lỗi khi kiểm tra khung giờ" });
        }

        if (timeSlotResults.length > 0) {
          return res
            .status(400)
            .json({ message: "Khung giờ này đã được sử dụng" });
        }

        // If available, create the registration with ChapNhan status
        const insertQuery = `
          INSERT INTO DangKyLichDay (maDangKy, maGV, maLopHP, ngayDangKy, trangThai)
          VALUES (?, ?, ?, ?, 'ChapNhan')
        `;

        mysqlConnection.query(
          insertQuery,
          [maDangKy, maGV, maLopHP, ngayDangKy],
          (err) => {
            if (err) {
              console.error("Error registering for class:", err);
              return res
                .status(500)
                .json({ message: "Lỗi khi đăng ký giảng dạy" });
            }

            // Insert the time slot into ThoiKhoaBieuGiangVien
            // (You may want to insert a real date for ngayHoc, but for now, just skip this or use a placeholder)
            // You can extend this logic as needed.

            // Update the class section to assign the teacher
            const updateQuery = `
              UPDATE LopHocPhan 
              SET maGV = ? 
              WHERE maLopHP = ?
            `;

            mysqlConnection.query(updateQuery, [maGV, maLopHP], (err) => {
              if (err) {
                console.error("Error updating class section:", err);
                return res
                  .status(500)
                  .json({ message: "Lỗi khi cập nhật lớp học phần" });
              }

              console.log("\n=== Registration Summary ===");
              console.log("1. Class Request Details:");
              console.log(`   - Mã yêu cầu: ${classInfo.maYeuCau}`);
              console.log(`   - Môn học: ${classInfo.tenMH} (${classInfo.maMH})`);
              console.log(`   - Lớp học phần: ${classInfo.maLopHP}`);
              console.log(`   - Số lượng tham gia: ${classInfo.soLuongThamGia}`);
              console.log(`   - Mô tả: ${classInfo.description}`);
              console.log(`   - Trạng thái xử lý: ${classInfo.trangThaiXuLy}`);
              console.log(
                `   - Tình trạng tổng quát: ${classInfo.tinhTrangTongQuat}`
              );
              console.log(
                `   - Sinh viên yêu cầu: ${classInfo.tenSinhVien} (${classInfo.maSV})`
              );

              console.log("\n2. Teacher Registration Details:");
              console.log(`   - Mã đăng ký: ${maDangKy}`);
              console.log(`   - Giảng viên: ${maGV}`);
              console.log(`   - Ngày đăng ký: ${ngayDangKy}`);
              console.log(`   - Khung giờ: ${thu} - Tiết ${tietHoc}`);
              console.log(`   - Trạng thái: ChapNhan`);

              console.log("\n=== End of Registration Log ===\n");

              res.status(201).json({
                message: "Đăng ký giảng dạy thành công",
                maDangKy,
                classInfo: {
                  maYeuCau: classInfo.maYeuCau,
                  tenMH: classInfo.tenMH,
                  maLopHP: classInfo.maLopHP,
                },
              });
            });
          }
        );
      }
    );
  });
};

const getApprovedClassSections = (req, res) => {
  console.log("\n=== Debug getApprovedClassSections ===");
  console.log("User info:", {
    userId: req.user.userId,
    userRole: req.user.userRole,
  });

  // Nếu là trang register-teaching (userRole là GiangVien), chỉ hiển thị các lớp khả dụng
  const isRegisterTeachingPage = req.user.userRole === "GiangVien";

  // Debug query để kiểm tra trực tiếp trạng thái của LHP_MMT_01_NEW
  mysqlConnection.query(
    `SELECT 
      lhp.maLopHP,
      lhp.maGV,
      gv.hoTen as tenGV,
      dkld.maGV as registeredGV,
      dkld.trangThai as registrationStatus,
      dkld.ngayDangKy
    FROM LopHocPhan lhp
    LEFT JOIN GiangVien gv ON lhp.maGV = gv.maGV
    LEFT JOIN DangKyLichDay dkld ON lhp.maLopHP = dkld.maLopHP AND dkld.trangThai = 'ChapNhan'
    WHERE lhp.maLopHP = 'LHP_MMT_01_NEW'`,
    (err, debugResults) => {
      if (err) {
        console.error("Error checking LHP_MMT_01_NEW status:", err);
      } else {
        console.log("\nDebug LHP_MMT_01_NEW status:", debugResults);
      }
    }
  );

  const query = `
    SELECT 
      lhp.maLopHP,
      lhp.maMH,
      mh.tenMH,
      lhp.namHoc,
      lhp.hocKy,
      lhp.siSoToiDa,
      lhp.siSoHienTai,
      lhp.trangThai,
      lhp.maGV,
      gv.hoTen as tenGV,
      ycml.maYeuCau,
      ycml.soLuongThamGia,
      ycml.description,
      ycml.trangThaiXuLy,
      ycml.tinhTrangTongQuat,
      sv.hoTen as tenSinhVien,
      sv.maSV,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM DangKyLichDay dkld 
          WHERE dkld.maLopHP = lhp.maLopHP 
            AND dkld.trangThai = 'ChapNhan'
        ) THEN true
        ELSE false
      END as hasTeacherRegistration
    FROM LopHocPhan lhp
    JOIN MonHoc mh ON lhp.maMH = mh.maMH
    LEFT JOIN GiangVien gv ON lhp.maGV = gv.maGV
    LEFT JOIN YeuCauMoLop ycml ON lhp.maLopHP = ycml.maLopHP OR lhp.maLopHP = CONCAT(ycml.maLopHP, '_NEW')
    LEFT JOIN SinhVien sv ON ycml.maSV = sv.maSV
    WHERE (ycml.trangThaiXuLy = '2_TBMNhan' OR lhp.maLopHP LIKE '%_NEW')
    AND (ycml.tinhTrangTongQuat = 'DaDuyet' OR lhp.maLopHP LIKE '%_NEW')
    ${
      isRegisterTeachingPage
        ? `
    AND lhp.maGV IS NULL
    `
        : ""
    }
    ORDER BY 
      ${
        isRegisterTeachingPage
          ? "COALESCE(ycml.ngayGui, lhp.maLopHP) DESC"
          : `
      CASE 
        WHEN lhp.maGV IS NULL THEN 0 
        ELSE 1 
      END,
      COALESCE(ycml.ngayGui, lhp.maLopHP) DESC
      `
      }
  `;

  console.log("Executing query:", query);
  console.log("Is register teaching page:", isRegisterTeachingPage);

  // First, let's check the status of all class requests
  mysqlConnection.query(
    `SELECT maYeuCau, maLopHP, trangThaiXuLy, tinhTrangTongQuat 
     FROM YeuCauMoLop 
     WHERE trangThaiXuLy IN ('1_GiaoVuNhan', '2_TBMNhan', '3_TruongKhoaNhan', '4_ChoMoLop')`,
    (err, statusResults) => {
      if (err) {
        console.error("Error checking class request statuses:", err);
      } else {
        console.log("Current class request statuses:", statusResults);
      }
    }
  );

  // Then execute the main query
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching approved class sections:", err);
      return res.status(500).json({
        message: "Lỗi khi lấy danh sách lớp học phần đã duyệt",
      });
    }

    // Debug: Kiểm tra kết quả của LHP_MMT_01_NEW
    const mmt01New = results.find((r) => r.maLopHP === "LHP_MMT_01_NEW");
    if (mmt01New) {
      console.log("\nDebug LHP_MMT_01_NEW in results:", {
        maLopHP: mmt01New.maLopHP,
        maGV: mmt01New.maGV,
        tenGV: mmt01New.tenGV,
        hasTeacherRegistration: mmt01New.hasTeacherRegistration,
      });
    }

    console.log("\nQuery results:", {
      totalResults: results.length,
      results: results.map((r) => ({
        maLopHP: r.maLopHP,
        tenMH: r.tenMH,
        trangThaiXuLy: r.trangThaiXuLy,
        tinhTrangTongQuat: r.tinhTrangTongQuat,
        maGV: r.maGV,
        tenGV: r.tenGV,
        hasTeacherRegistration: r.hasTeacherRegistration,
      })),
    });

    // Check class assignments in LopHocPhan
    mysqlConnection.query(
      `SELECT 
        lhp.maLopHP,
        lhp.maGV,
        gv.hoTen as tenGV
       FROM LopHocPhan lhp
       LEFT JOIN GiangVien gv ON lhp.maGV = gv.maGV
       WHERE lhp.maGV IS NOT NULL`,
      (err, assignedClasses) => {
        if (err) {
          console.error("Error checking assigned classes:", err);
        } else {
          console.log("\nClasses assigned to teachers:", assignedClasses);

          // Debug: Kiểm tra xem LHP_MMT_01_NEW có trong danh sách không
          const mmt01NewAssigned = assignedClasses.find(
            (c) => c.maLopHP === "LHP_MMT_01_NEW"
          );
          console.log(
            "\nDebug LHP_MMT_01_NEW in assigned classes:",
            mmt01NewAssigned
          );
        }
      }
    );

    res.json(results);
  });
};

const createNewClassSections = (req, res) => {
  console.log("=== Debug createNewClassSections ===");

  // Lấy danh sách các yêu cầu đã được duyệt nhưng chưa có lớp học phần mới
  const query = `
    SELECT 
      ycml.maYeuCau,
      ycml.maLopHP as oldMaLopHP,
      ycml.maMH,
      ycml.soLuongThamGia,
      ycml.description,
      mh.tenMH,
      lhp.namHoc,
      lhp.hocKy,
      lhp.siSoToiDa
    FROM YeuCauMoLop ycml
    JOIN MonHoc mh ON ycml.maMH = mh.maMH
    JOIN LopHocPhan lhp ON ycml.maLopHP = lhp.maLopHP
    WHERE ycml.trangThaiXuLy = '2_TBMNhan'
    AND ycml.tinhTrangTongQuat = 'DaDuyet'
    AND NOT EXISTS (
      SELECT 1 FROM LopHocPhan lhp2 
      WHERE lhp2.maLopHP = CONCAT(ycml.maLopHP, '_NEW')
    )
  `;

  console.log("Executing query to find approved requests:", query);

  mysqlConnection.query(query, (err, approvedRequests) => {
    if (err) {
      console.error("Error finding approved requests:", err);
      return res.status(500).json({ message: "Lỗi khi tìm yêu cầu đã duyệt" });
    }

    console.log("Found approved requests:", approvedRequests);

    if (approvedRequests.length === 0) {
      return res.json({
        message: "Không có yêu cầu nào cần tạo lớp học phần mới",
      });
    }

    // Bắt đầu transaction
    mysqlConnection.beginTransaction((err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        return res.status(500).json({ message: "Lỗi khi bắt đầu giao dịch" });
      }

      let createdClasses = [];
      let completed = 0;

      approvedRequests.forEach((request) => {
        // Tạo mã lớp học phần mới
        const newMaLopHP = `${request.oldMaLopHP}_NEW`;

        // Tạo lớp học phần mới
        const insertQuery = `
          INSERT INTO LopHocPhan (
            maLopHP, maMH, namHoc, hocKy, 
            siSoToiDa, siSoHienTai, trangThai, maGV
          ) VALUES (?, ?, ?, ?, ?, 0, 'ChuaMo', NULL)
        `;

        mysqlConnection.query(
          insertQuery,
          [
            newMaLopHP,
            request.maMH,
            request.namHoc,
            request.hocKy,
            request.siSoToiDa,
          ],
          (err, result) => {
            if (err) {
              console.error("Error creating new class section:", err);
              return mysqlConnection.rollback(() => {
                res
                  .status(500)
                  .json({ message: "Lỗi khi tạo lớp học phần mới" });
              });
            }

            createdClasses.push({
              maLopHP: newMaLopHP,
              tenMH: request.tenMH,
              namHoc: request.namHoc,
              hocKy: request.hocKy,
            });

            completed++;
            if (completed === approvedRequests.length) {
              // Commit transaction
              mysqlConnection.commit((err) => {
                if (err) {
                  console.error("Error committing transaction:", err);
                  return mysqlConnection.rollback(() => {
                    res
                      .status(500)
                      .json({ message: "Lỗi khi hoàn tất giao dịch" });
                  });
                }

                console.log(
                  "Successfully created new class sections:",
                  createdClasses
                );
                res.json({
                  message: "Đã tạo lớp học phần mới thành công",
                  createdClasses,
                });
              });
            }
          }
        );
      });
    });
  });
};

const getAvailableTimeSlots = async (req, res) => {
  const { maLopHP } = req.params;
  const { maGV } = req.query;

  // Helper to map MySQL DAYOFWEEK to T2-T7
  const dayMap = {
    2: 'T2',
    3: 'T3',
    4: 'T4',
    5: 'T5',
    6: 'T6',
    7: 'T7',
  };

  try {
    // Get teacher's current schedule
    const teacherScheduleQuery = `
      SELECT DISTINCT DAYOFWEEK(tkb.ngayHoc) AS thu, tkb.tietBD
      FROM ThoiKhoaBieuGiangVien tkb
      WHERE tkb.maGV = ?
    `;
    const [teacherScheduleRaw] = await mysqlConnection.promise().query(
      teacherScheduleQuery,
      [maGV]
    );
    // Map to {thu: T2, tietHoc: 1/2/3...}
    const teacherSchedule = teacherScheduleRaw
      .map(row => ({
        thu: dayMap[row.thu],
        tietHoc: parseInt(row.tietBD, 10)
      }))
      .filter(row => row.thu && !isNaN(row.tietHoc));

    // Get all students in the class section
    const studentsQuery = `
      SELECT DISTINCT sv.maSV
      FROM SinhVien_MonHoc svmh
      JOIN SinhVien sv ON svmh.maSV = sv.maSV
      WHERE svmh.maLopHP = ?
    `;
    const [students] = await mysqlConnection.promise().query(studentsQuery, [maLopHP]);

    let studentSchedules = [];
    if (students.length > 0) {
      const studentSchedulesQuery = `
        SELECT DISTINCT DAYOFWEEK(tkb.ngayHoc) AS thu, tkb.tietBD
        FROM ThoiKhoaBieuSinhVien tkb
        WHERE tkb.maSV IN (?)
      `;
      const [studentSchedulesRaw] = await mysqlConnection.promise().query(
        studentSchedulesQuery,
        [students.map(s => s.maSV)]
      );
      studentSchedules = studentSchedulesRaw
        .map(row => ({
          thu: dayMap[row.thu],
          tietHoc: parseInt(row.tietBD, 10)
        }))
        .filter(row => row.thu && !isNaN(row.tietHoc));
    }

    // Generate all possible time slots (Mon-Fri, periods 1-6)
    const allTimeSlots = [];
    const days = ['T2', 'T3', 'T4', 'T5', 'T6'];
    const periods = [1, 2, 3, 4, 5, 6];
    for (const day of days) {
      for (const period of periods) {
        allTimeSlots.push({ thu: day, tietHoc: period });
      }
    }

    // Filter out occupied slots
    const occupiedSlots = [...studentSchedules, ...teacherSchedule];
    const availableSlots = allTimeSlots.filter(slot =>
      !occupiedSlots.some(occupied =>
        occupied.thu === slot.thu && occupied.tietHoc === slot.tietHoc
      )
    );

    // Group available slots by day for better display
    const groupedSlots = days.map(day => ({
      thu: day,
      slots: availableSlots
        .filter(slot => slot.thu === day)
        .map(slot => slot.tietHoc)
        .sort((a, b) => a - b)
    }));

    res.json({
      availableSlots: groupedSlots,
      occupiedSlots: {
        studentSlots: studentSchedules,
        teacherSlots: teacherSchedule
      }
    });
  } catch (error) {
    console.error('Error getting available time slots:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách khung giờ trống' });
  }
};

module.exports = {
  someMethod,
  getClassCount,
  getAvailableClassSections,
  registerTeaching,
  getApprovedClassSections,
  createNewClassSections,
  getAvailableTimeSlots,
};
