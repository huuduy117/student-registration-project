const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const { auth, authorize } = require("../middleware/auth");

// Chỉ giáo viên mới được truy xuất API này
router.get(
  "/class-count",
  auth,
  authorize("teacher"),
  teacherController.getTeachingClassCount
);

module.exports = router;
