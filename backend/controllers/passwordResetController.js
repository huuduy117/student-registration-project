const { mysqlConnection } = require("../config/db");
const passwordResetModel = require("../models/passwordResetModel");
const nodemailer = require("nodemailer");

// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "chungluong4423@gmail.com", // Use environment variable or default
    pass: process.env.EMAIL_PASSWORD || "suxi pwla envq wybv", // Use environment variable or default
  },
});

// Request password reset
exports.requestReset = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập" });
    }

    // Find user by username
    const findUserQuery = `
      SELECT 
        n.maNguoiDung,
        n.tenDangNhap,
        CASE 
          WHEN n.loaiNguoiDung = 'SinhVien' THEN sv.email
          WHEN n.loaiNguoiDung IN ('GiangVien', 'GiaoVu', 'TruongBoMon', 'TruongKhoa') THEN gv.email
          ELSE NULL
        END as email
      FROM NguoiDung n
      LEFT JOIN SinhVien sv ON n.maNguoiDung = sv.maSV 
      LEFT JOIN GiangVien gv ON n.maNguoiDung = gv.maGV
      WHERE n.tenDangNhap = ?
    `;

    mysqlConnection.query(findUserQuery, [username], async (err, results) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).json({ message: "Lỗi hệ thống" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy người dùng với tên đăng nhập này" });
      }

      const user = results[0];

      if (!user.email) {
        return res.status(400).json({
          message: "Người dùng không có email để gửi mã đặt lại mật khẩu",
        });
      }

      // Create reset token
      const { token, expiresAt } = await passwordResetModel.createResetToken(
        user.maNguoiDung
      );

      // Calculate expiration time in minutes
      const expirationMinutes = 30;

      // Send email with reset link
      const resetLink = `http://localhost:5000/reset-password?token=${token}`;

      const mailOptions = {
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to: user.email,
        subject: "Đặt lại mật khẩu",
        html: `
          <h1>Yêu cầu đặt lại mật khẩu</h1>
          <p>Xin chào,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
          <p>Liên kết này sẽ hết hạn sau ${expirationMinutes} phút.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,</p>
          <p>Đội ngũ hỗ trợ</p>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ message: "Lỗi khi gửi email" });
        }

        console.log("Email sent:", info.response);
        res.status(200).json({
          message:
            "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
          email: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Mask email for privacy
        });
      });
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Verify reset token
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    const tokenData = await passwordResetModel.verifyResetToken(token);

    if (!tokenData) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Calculate remaining time in minutes
    const expiresAt = new Date(tokenData.expiresAt);
    const now = new Date();
    const remainingMinutes = Math.floor((expiresAt - now) / (1000 * 60));

    res.status(200).json({
      valid: true,
      maNguoiDung: tokenData.maNguoiDung,
      remainingMinutes,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    // Verify token
    const tokenData = await passwordResetModel.verifyResetToken(token);

    if (!tokenData) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Update password
    const updateQuery =
      "UPDATE NguoiDung SET matKhau = ? WHERE maNguoiDung = ?";

    mysqlConnection.query(
      updateQuery,
      [newPassword, tokenData.maNguoiDung],
      async (err, result) => {
        if (err) {
          console.error("Error updating password:", err);
          return res.status(500).json({ message: "Lỗi khi cập nhật mật khẩu" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // Delete the used token
        await passwordResetModel.deleteResetToken(token);

        res
          .status(200)
          .json({ message: "Mật khẩu đã được cập nhật thành công" });
      }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
