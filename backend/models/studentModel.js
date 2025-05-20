const db = require("../config/db");

const StudentModel = {
  getAllStudents: (callback) => {
    db.mysqlConnection.query("SELECT * FROM students", callback);
  },

  // Lấy tổng quan sinh viên
  getStudentOverview: (maSV, callback) => {
    // Tổng số tín chỉ đã đăng ký
    const queryDangKy = `SELECT SUM(mh.soTinChi) AS soTinChiDangKy
      FROM SinhVien_MonHoc smh
      JOIN MonHoc mh ON smh.maMH = mh.maMH
      WHERE smh.maSV = ?`;
    // Tổng số tín chỉ đã hoàn thành
    const queryHoanThanh = `SELECT SUM(mh.soTinChi) AS soTinChiHoanThanh
      FROM SinhVien_MonHoc smh
      JOIN MonHoc mh ON smh.maMH = mh.maMH
      WHERE smh.maSV = ? AND smh.diem >= 5`;
    // Học kỳ hiện tại
    const queryHocKy = `SELECT lhp.hocKy, lhp.namHoc
      FROM SinhVien_MonHoc smh
      JOIN LopHocPhan lhp ON smh.maLopHP = lhp.maLopHP
      WHERE smh.maSV = ?
      ORDER BY lhp.namHoc DESC, lhp.hocKy DESC
      LIMIT 1`;
    db.mysqlConnection.query(queryDangKy, [maSV], (err, resDangKy) => {
      if (err) return callback(err);
      db.mysqlConnection.query(queryHoanThanh, [maSV], (err2, resHoanThanh) => {
        if (err2) return callback(err2);
        db.mysqlConnection.query(queryHocKy, [maSV], (err3, resHocKy) => {
          if (err3) return callback(err3);
          callback(null, {
            soTinChiDangKy: resDangKy[0].soTinChiDangKy || 0,
            soTinChiHoanThanh: resHoanThanh[0].soTinChiHoanThanh || 0,
            hocKyHienTai: resHocKy[0]
              ? `HK${resHocKy[0].hocKy} (${resHocKy[0].namHoc})`
              : "-",
          });
        });
      });
    });
  },
  getStudentById: (maSV, callback) => {
    const query = `
      SELECT sv.*, cn.tenCN AS tenCN, l.tenLop AS tenLop
      FROM SinhVien sv
      LEFT JOIN ChuyenNganh cn ON sv.maCN = cn.maCN
      LEFT JOIN Lop l ON sv.maSV = l.maSV
      WHERE sv.maSV = ?
    `;
    db.mysqlConnection.query(query, [maSV], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      if (result.length === 0) {
        return callback(null, null); // No student found
      }
      callback(null, result[0]);
    });
  },
};

module.exports = StudentModel;
