const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { auth, authorize } = require("../middleware/auth");

router.get("/", studentController.getAllStudents);

router.post("/enroll", auth, authorize("Student"), studentController.enrollInSection);

router.get("/:id", studentController.getStudent);

// API lấy tổng quan tín chỉ và học kỳ hiện tại
router.get("/:id/overview", studentController.getStudentOverview);

module.exports = router;
