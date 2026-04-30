const { supabase } = require("../config/db");
const passwordResetModel = require("../models/passwordResetModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { sendSuccess, sendError } = require("../utils/response");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "chungluong4423@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "suxi pwla envq wybv",
  },
});

// ─── Request Reset ────────────────────────────────────────────────────────────

exports.requestReset = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return sendError(res, 400, "INVALID_INPUT", "Please enter your username");
    }

    // Find user by username
    const { data: users, error } = await supabase
      .from("users")
      .select("id, username, role")
      .eq("username", username);

    if (error) throw error;

    if (!users || users.length === 0) {
      return sendError(res, 404, "NOT_FOUND", "User not found with this username");
    }

    const user = users[0];
    let email = null;

    if (user.role === "Student") {
      const { data: student } = await supabase
        .from("students")
        .select("email")
        .eq("id", user.id)
        .single();
      email = student?.email;
    } else if (["Teacher", "AcademicAffairs", "DepartmentHead", "FacultyHead"].includes(user.role)) {
      const { data: teacher } = await supabase
        .from("teachers")
        .select("email")
        .eq("id", user.id)
        .single();
      email = teacher?.email;
    }

    if (!email) {
      return sendError(res, 400, "INVALID_INPUT", "User has no email address for password reset");
    }

    const { token } = await passwordResetModel.createResetToken(user.id);
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5000"}/reset-password?token=${token}`;
    const expirationMinutes = 60;

    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello,</p>
        <p>We received a request to reset your account password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
        <p>This link expires in ${expirationMinutes} minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return sendError(res, 500, "INTERNAL_ERROR", "Error sending email");
      }
      return sendSuccess(res, "request_reset", {
        email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
      }, ["password_reset_tokens"], "Password reset email sent. Please check your inbox.");
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return sendError(res, 500, "INTERNAL_ERROR", "System error");
  }
};

// ─── Verify Token ─────────────────────────────────────────────────────────────

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return sendError(res, 400, "INVALID_INPUT", "Invalid token");
    }

    const tokenData = await passwordResetModel.verifyResetToken(token);
    if (!tokenData) {
      return sendError(res, 400, "TOKEN_EXPIRED", "Token is invalid or has expired");
    }

    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    const remainingMinutes = Math.floor((expiresAt - now) / (1000 * 60));

    return sendSuccess(res, "verify_token", { valid: true, userId: tokenData.user_id, remainingMinutes });
  } catch (error) {
    console.error("Token verification error:", error);
    return sendError(res, 500, "INTERNAL_ERROR", "System error");
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const errors = [];
    if (!token) {
      errors.push({
        field: "token",
        expected: "non-empty token",
        actual: token ?? null,
      });
    }
    if (!newPassword || String(newPassword).trim().length < 6) {
      errors.push({
        field: "newPassword",
        expected: "at least 6 characters",
        actual: newPassword ? "too_short" : null,
      });
    }
    if (errors.length > 0) {
      return sendError(res, 400, "INVALID_INPUT", "Missing or invalid required information", { errors });
    }

    const tokenData = await passwordResetModel.verifyResetToken(token);
    if (!tokenData) {
      return sendError(res, 400, "TOKEN_EXPIRED", "Token is invalid or has expired");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", tokenData.user_id)
      .select();

    if (error) {
      console.error("Error updating password:", error);
      return sendError(res, 500, "INTERNAL_ERROR", "Error updating password");
    }

    if (!data || data.length === 0) {
      return sendError(res, 404, "NOT_FOUND", "User not found");
    }

    await passwordResetModel.deleteResetToken(token);
    return sendSuccess(res, "reset_password", null, ["users", "password_reset_tokens"], "Password updated successfully");
  } catch (error) {
    console.error("Password reset error:", error);
    return sendError(res, 500, "INTERNAL_ERROR", "System error");
  }
};
