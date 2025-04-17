// backend/controllers/userController.js
const userModel = require("../models/userModel");

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
    if (user.password === password) {
      return res.status(200).json({
        message: "Đăng nhập thành công",
        user: { id: user.id, username: user.username },
      });
    } else {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }
  });
};

module.exports = { login };
