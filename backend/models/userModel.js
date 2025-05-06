const { mysqlConnection } = require("../config/db");

const findUserByUsername = (username, callback) => {
  const query = `
    SELECT 
      n.maNguoiDung,
      n.tenDangNhap,
      n.matKhau,
      n.loaiNguoiDung,
      CASE 
        WHEN n.loaiNguoiDung = 'SinhVien' THEN sv.hoTen
        WHEN n.loaiNguoiDung IN ('GiangVien', 'GiaoVu', 'TruongBoMon', 'TruongKhoa') THEN gv.hoTen
        ELSE n.tenDangNhap
      END as hoTen
    FROM NguoiDung n
    LEFT JOIN SinhVien sv ON n.maNguoiDung = sv.maSV 
    LEFT JOIN GiangVien gv ON n.maNguoiDung = gv.maGV
    WHERE n.tenDangNhap = ?`;

  mysqlConnection.query(query, [username], callback);
};

module.exports = {
  findUserByUsername,
};
