// backend/controllers/userController.js
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const { username, password } = req.body;

  userModel.findUserByUsername(username, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi server", error: err });
    }
    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "Kiểm tra lại tên đăng nhập hoặc mật khẩu" });
    }

    const user = results[0];
    if (user.matKhau === password) {
      // Create JWT token
      const token = jwt.sign(
        {
          userId: user.maNguoiDung,
          username: user.tenDangNhap,
          userRole: user.loaiNguoiDung, // Sửa đúng trường userRole
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        message: "Đăng nhập thành công",
        user: {
          id: user.maNguoiDung,
          username: user.tenDangNhap,
          fullName: user.hoTen,
          userRole: user.loaiNguoiDung, // Trả về đúng trường userRole cho frontend
        },
        token,
      });
    } else {
      return res
        .status(401)
        .json({ message: "Kiểm tra lại tên đăng nhập hoặc mật khẩu" });
    }
  });
};

module.exports = { login };
