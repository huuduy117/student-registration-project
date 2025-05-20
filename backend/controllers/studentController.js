const StudentModel = require("../models/studentModel");

exports.getAllStudents = (req, res) => {
  StudentModel.getAllStudents((err, results) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi truy vấn!" });
    }
    res.json(results);
  });
};

// API: Lấy tổng quan tín chỉ và học kỳ hiện tại cho sinh viên
exports.getStudent = (req, res) => {
  const maSV = req.params.id;
  console.log("Fetching student with ID:", maSV);
  StudentModel.getStudentById(maSV, (err, student) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ message: "Lỗi truy vấn dữ liệu" });
    }
    if (!student) {
      console.log("Student not found with ID:", maSV);
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }
    console.log("Student found:", student);
    res.json({
      maSV: student.maSV,
      hoTen: student.hoTen,
      email: student.email,
      soDienThoai: student.soDienThoai,
      diaChi: student.diaChi,
      ngaySinh: student.ngaySinh,
      gioiTinh: student.gioiTinh,
      thoiGianNhapHoc: student.thoiGianNhapHoc,
      trangThai: student.trangThai,
      maCN: student.maCN,
      tenLop: student.tenLop,
      tenCN: student.tenCN,
    });
  });
};

exports.getStudentOverview = async (req, res) => {
  const maSV = req.params.id;
  // Tổng số tín chỉ đã đăng ký
  const queryDangKy = `SELECT SUM(mh.soTinChi) AS soTinChiDangKy
    FROM SinhVien_MonHoc smh
    JOIN MonHoc mh ON smh.maMH = mh.maMH
    WHERE smh.maSV = ?`;

  const queryHoanThanh = `SELECT SUM(mh.soTinChi) AS soTinChiHoanThanh
    FROM SinhVien_MonHoc smh
    JOIN MonHoc mh ON smh.maMH = mh.maMH
    WHERE smh.maSV = ?`;

  const queryHocKy = `SELECT lhp.hocKy, lhp.namHoc
    FROM SinhVien_MonHoc smh
    JOIN LopHocPhan lhp ON smh.maLopHP = lhp.maLopHP
    WHERE smh.maSV = ?
    ORDER BY lhp.namHoc DESC, lhp.hocKy DESC
    LIMIT 1`;

  // Thực hiện song song 3 truy vấn
  const db = require("../config/db").mysqlConnection;
  try {
    const [resDangKy] = await db.promise().query(queryDangKy, [maSV]);
    const [resHoanThanh] = await db.promise().query(queryHoanThanh, [maSV]);
    const [resHocKy] = await db.promise().query(queryHocKy, [maSV]);

    res.json({
      soTinChiDangKy: resDangKy[0]?.soTinChiDangKy || 0,
      soTinChiHoanThanh: resHoanThanh[0]?.soTinChiHoanThanh || 0,
      hocKyHienTai: resHocKy[0]
        ? `HK${resHocKy[0].hocKy} (${resHocKy[0].namHoc})`
        : "-",
    });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    return res.status(500).json({ message: "Lỗi truy vấn dữ liệu" });
  }
};
