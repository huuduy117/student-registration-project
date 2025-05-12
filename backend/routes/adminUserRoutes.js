// adminUserRoutes.js
// Định nghĩa route cho admin thêm mới giảng viên hoặc sinh viên

const express = require("express");
const router = express.Router();
const { createUserWithDetail } = require("../controllers/adminUserController");

// Thêm mới người dùng (giảng viên hoặc sinh viên)
router.post("/add-user", async (req, res) => {
  const { userData, detailData, type } = req.body;
  try {
    const result = await createUserWithDetail(userData, detailData, type);
    res.json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
