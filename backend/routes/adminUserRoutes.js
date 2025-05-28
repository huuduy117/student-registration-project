const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/adminUserController");
const { auth, authorize } = require("../middleware/auth");

// Middleware để kiểm tra quyền admin
const adminAuth = [auth, authorize("QuanTriVien")];

// Thêm mới người dùng
router.post("/add-user", adminAuth, async (req, res) => {
  const { userData } = req.body;
  try {
    const result = await createUserWithDetail(userData);
    res.json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Lấy danh sách người dùng theo loại
router.get("/users", adminAuth, (req, res) => {
  const { type } = req.query;

  if (
    !type ||
    (type !== "SinhVien" && type !== "GiangVien" && type !== "QuanTriVien")
  ) {
    return res.status(400).json({
      success: false,
      message: "Loại người dùng không hợp lệ",
    });
  }

  getUsersByType(type, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách người dùng",
      });
    }
    res.json(results);
  });
});

// Lấy thông tin người dùng theo ID
router.get("/users/:id", adminAuth, (req, res) => {
  const userId = req.params.id;

  getUserById(userId, (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin người dùng",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json(results[0]);
  });
});

// Cập nhật người dùng
router.put("/users/:id", adminAuth, async (req, res) => {
  const userId = req.params.id;
  const { userData } = req.body;
  try {
    const result = await updateUser(userId, userData);
    res.json(result);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi cập nhật người dùng",
      error: err,
    });
  }
});

// Xóa người dùng
router.delete("/users/:id", adminAuth, async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await deleteUser(userId);
    res.json(result);
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi xóa người dùng",
      error: err,
    });
  }
});

// Thống kê sinh viên
router.get("/stats/students", adminAuth, (req, res) => {
  getStudentStats((err, results) => {
    if (err) {
      console.error("Error fetching student stats:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê sinh viên",
      });
    }
    res.json(results);
  });
});

// Thống kê giảng viên
router.get("/stats/teachers", adminAuth, (req, res) => {
  getTeacherStats((err, results) => {
    if (err) {
      console.error("Error fetching teacher stats:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê giảng viên",
      });
    }
    res.json(results);
  });
});

// Lấy danh sách yêu cầu mở lớp
router.get("/class-requests", adminAuth, (req, res) => {
  getClassRequests((err, results) => {
    if (err) {
      console.error("Error fetching class requests:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách yêu cầu mở lớp",
      });
    }
    res.json(results);
  });
});

// Cập nhật trạng thái yêu cầu mở lớp
router.put("/class-requests/:id/status", adminAuth, (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  updateClassRequestStatus(requestId, status, (err, result) => {
    if (err) {
      console.error("Error updating request status:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật trạng thái yêu cầu",
      });
    }
    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  });
});

// Lấy lịch sử thay đổi yêu cầu
router.get("/class-requests/:id/history", adminAuth, (req, res) => {
  const requestId = req.params.id;

  getRequestHistory(requestId, (err, results) => {
    if (err) {
      console.error("Error fetching request history:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy lịch sử yêu cầu",
      });
    }
    res.json(results);
  });
});

// Lấy bảng tin cho admin
router.get("/newsfeed", adminAuth, (req, res) => {
  const query = `
    SELECT 
      bt.maThongBao as id,
      bt.tieuDe as title,
      bt.noiDung as content,
      bt.ngayDang as time,
      bt.nguoiDang as author,
      bt.loaiNguoiDung,
      CASE 
        WHEN nd.loaiNguoiDung = 'SinhVien' THEN sv.hoTen
        WHEN nd.loaiNguoiDung = 'GiangVien' THEN gv.hoTen
        ELSE nd.tenDangNhap
      END as tenNguoiDang
    FROM BangTin bt
    JOIN NguoiDung nd ON bt.nguoiDang = nd.maNguoiDung
    LEFT JOIN SinhVien sv ON nd.maNguoiDung = sv.maSV
    LEFT JOIN GiangVien gv ON nd.maNguoiDung = gv.maGV
    ORDER BY bt.ngayDang DESC
  `;

  const { mysqlConnection } = require("../config/db");
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching newsfeed:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy bảng tin",
      });
    }
    res.json(results);
  });
});

// Tạo bảng tin mới
router.post("/newsfeed", adminAuth, (req, res) => {
  const { title, content, recipient } = req.body;
  const nguoiDang = req.user.userId;
  const ngayDang = new Date().toISOString().split("T")[0];
  const maThongBao = `TB${Date.now().toString().slice(-6)}`;

  let loaiNguoiDung = "TatCa";
  if (recipient === "SinhVien") loaiNguoiDung = "SinhVien";
  else if (recipient === "GiangVien") loaiNguoiDung = "GiangVien";

  const query = `
    INSERT INTO BangTin (maThongBao, tieuDe, noiDung, ngayDang, nguoiDang, loaiNguoiDung)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const { mysqlConnection } = require("../config/db");
  mysqlConnection.query(
    query,
    [maThongBao, title, content, ngayDang, nguoiDang, loaiNguoiDung],
    (err, result) => {
      if (err) {
        console.error("Error creating newsfeed:", err);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi tạo bảng tin",
        });
      }

      res.status(201).json({
        success: true,
        message: "Tạo bảng tin thành công",
        maThongBao,
      });
    }
  );
});

// Cập nhật bảng tin
router.put("/newsfeed/:id", adminAuth, (req, res) => {
  const { id } = req.params;
  const { title, content, recipient } = req.body;

  let loaiNguoiDung = "TatCa";
  if (recipient === "SinhVien") loaiNguoiDung = "SinhVien";
  else if (recipient === "GiangVien") loaiNguoiDung = "GiangVien";

  const query = `
    UPDATE BangTin 
    SET tieuDe = ?, noiDung = ?, loaiNguoiDung = ?
    WHERE maThongBao = ?
  `;

  const { mysqlConnection } = require("../config/db");
  mysqlConnection.query(
    query,
    [title, content, loaiNguoiDung, id],
    (err, result) => {
      if (err) {
        console.error("Error updating newsfeed:", err);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật bảng tin",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy bảng tin",
        });
      }

      res.json({ success: true, message: "Cập nhật bảng tin thành công" });
    }
  );
});

// Xóa bảng tin
router.delete("/newsfeed/:id", adminAuth, (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM BangTin WHERE maThongBao = ?`;

  const { mysqlConnection } = require("../config/db");
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting newsfeed:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xóa bảng tin",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bảng tin",
      });
    }

    res.json({ success: true, message: "Xóa bảng tin thành công" });
  });
});

module.exports = router;
