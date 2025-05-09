const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const teacherController = require("../controllers/teacherController");

// Chỉ giáo viên mới được truy xuất API này
router.get(
  "/class-count",
  auth,
  authorize("GiangVien"),
  teacherController.getClassCount
);

// Make sure controller methods are properly exported and defined
router.get(
  "/some-route",
  auth,
  authorize("teacher"),
  teacherController.someMethod
);

module.exports = router;
